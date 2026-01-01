/**
 * Provider Sync Engine - Main Orchestrator
 * 
 * Coordinates all sync operations including connection management,
 * data fetching, normalization, and storage.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ProviderType,
  ProviderCredentials,
  ProviderConnection,
  ProviderConnectionInput,
  ConnectionSettings,
  SyncOptions,
  SyncResult,
  SyncWindow,
  ConnectionTestResult,
  NormalizedUsageRecord,
} from './types';
import {
  CredentialVault,
  getCredentialVault,
  DataNormalizer,
  getDataNormalizer,
  ConnectionTester,
  getConnectionTester,
  mapConnectionFromDb,
  mapConnectionToDb,
  mapSyncHistoryToDb,
  mapUsageRecordToDb,
  DEFAULT_CONNECTION_SETTINGS,
} from './utils';
import { createAdapter } from './adapters';

export class ProviderSyncEngine {
  private supabase: SupabaseClient;
  private credentialVault: CredentialVault;
  private normalizer: DataNormalizer;
  private connectionTester: ConnectionTester;

  constructor(supabase: SupabaseClient, encryptionKey?: string) {
    this.supabase = supabase;
    this.credentialVault = encryptionKey 
      ? new CredentialVault(encryptionKey) 
      : getCredentialVault();
    this.normalizer = getDataNormalizer();
    this.connectionTester = getConnectionTester();
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  /**
   * Create a new provider connection
   */
  async createConnection(input: ProviderConnectionInput): Promise<ProviderConnection> {
    // Test connection first
    const testResult = await this.connectionTester.testConnection(
      input.provider,
      input.credentials
    );

    if (!testResult.success) {
      throw new Error(`Connection test failed: ${testResult.error}`);
    }

    // Encrypt credentials
    const encryptedCredentials = await this.credentialVault.encrypt(
      input.credentials as unknown as Record<string, unknown>
    );

    // Prepare connection data
    const connectionData = {
      organization_id: input.organizationId,
      provider: input.provider,
      status: 'pending',
      display_name: input.displayName || null,
      credentials_encrypted: encryptedCredentials,
      settings: {
        ...DEFAULT_CONNECTION_SETTINGS,
        ...input.settings,
      },
      provider_metadata: testResult.metadata || {},
      consecutive_failures: 0,
    };

    // Insert connection
    const { data, error } = await this.supabase
      .from('provider_connections')
      .insert(connectionData)
      .select()
      .single();

    if (error) {
      console.error('[SyncEngine] Error creating connection:', error);
      throw new Error(`Failed to create connection: ${error.message}`);
    }

    const connection = mapConnectionFromDb(data);

    // Trigger initial sync (async, don't wait)
    this.triggerSync(connection.id, { backfill: true, syncType: 'initial' }).catch((err) => {
      console.error('[SyncEngine] Initial sync failed:', err);
    });

    return connection;
  }

  /**
   * Get a connection by ID
   */
  async getConnection(connectionId: string): Promise<ProviderConnection | null> {
    const { data, error } = await this.supabase
      .from('provider_connections')
      .select()
      .eq('id', connectionId)
      .single();

    if (error || !data) {
      return null;
    }

    return mapConnectionFromDb(data);
  }

  /**
   * Get all connections for an organization
   */
  async getConnections(orgId: string): Promise<ProviderConnection[]> {
    const { data, error } = await this.supabase
      .from('provider_connections')
      .select()
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SyncEngine] Error fetching connections:', error);
      return [];
    }

    return (data || []).map(mapConnectionFromDb);
  }

  /**
   * Update connection settings
   */
  async updateConnection(
    connectionId: string,
    updates: {
      displayName?: string;
      settings?: Partial<ConnectionSettings>;
    }
  ): Promise<ProviderConnection> {
    const updateData: Record<string, unknown> = {};

    if (updates.displayName !== undefined) {
      updateData.display_name = updates.displayName;
    }

    if (updates.settings) {
      // Get current settings and merge
      const { data: current } = await this.supabase
        .from('provider_connections')
        .select('settings')
        .eq('id', connectionId)
        .single();

      updateData.settings = {
        ...(current?.settings || DEFAULT_CONNECTION_SETTINGS),
        ...updates.settings,
      };
    }

    const { data, error } = await this.supabase
      .from('provider_connections')
      .update(updateData)
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update connection: ${error.message}`);
    }

    return mapConnectionFromDb(data);
  }

  /**
   * Update connection credentials
   */
  async updateCredentials(
    connectionId: string,
    credentials: ProviderCredentials
  ): Promise<void> {
    // Get connection to know the provider type
    const connection = await this.getConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Test new credentials
    const testResult = await this.connectionTester.testConnection(
      connection.provider,
      credentials
    );

    if (!testResult.success) {
      throw new Error(`Credential test failed: ${testResult.error}`);
    }

    // Encrypt and update
    const encryptedCredentials = await this.credentialVault.encrypt(
      credentials as unknown as Record<string, unknown>
    );

    const { error } = await this.supabase
      .from('provider_connections')
      .update({
        credentials_encrypted: encryptedCredentials,
        status: 'pending',
        last_error: null,
        last_error_at: null,
        consecutive_failures: 0,
        provider_metadata: testResult.metadata || {},
      })
      .eq('id', connectionId);

    if (error) {
      throw new Error(`Failed to update credentials: ${error.message}`);
    }

    // Trigger sync to verify
    await this.triggerSync(connectionId, { testFirst: true });
  }

  /**
   * Delete a provider connection
   */
  async deleteConnection(connectionId: string): Promise<void> {
    // Mark as disconnecting
    await this.supabase
      .from('provider_connections')
      .update({ status: 'disconnecting' })
      .eq('id', connectionId);

    // Delete connection (cascades to sync_history)
    const { error } = await this.supabase
      .from('provider_connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      throw new Error(`Failed to delete connection: ${error.message}`);
    }
  }

  /**
   * Test a connection
   */
  async testConnection(
    provider: ProviderType,
    credentials: ProviderCredentials
  ): Promise<ConnectionTestResult> {
    return this.connectionTester.testConnection(provider, credentials);
  }

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================

  /**
   * Trigger a sync for a specific connection
   */
  async triggerSync(
    connectionId: string,
    options: SyncOptions & { syncType?: string } = {}
  ): Promise<SyncResult> {
    const syncId = crypto.randomUUID();
    const startTime = Date.now();

    // Get connection
    const connection = await this.getConnection(connectionId);
    if (!connection) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    // Create sync history record
    await this.supabase.from('sync_history').insert(
      mapSyncHistoryToDb({
        id: syncId,
        connectionId,
        organizationId: connection.organizationId,
        status: 'running',
        startedAt: new Date(),
        syncType: (options.syncType as 'scheduled' | 'manual' | 'backfill' | 'initial') || 'manual',
        options: options as Record<string, unknown>,
        recordsFetched: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsSkipped: 0,
        totalCostSynced: 0,
        totalTokensSynced: 0,
        retryCount: 0,
      })
    );

    try {
      // Update connection status
      await this.updateConnectionStatus(connectionId, 'syncing');

      // Decrypt credentials
      const credentials = await this.credentialVault.decrypt<ProviderCredentials>(
        connection.credentialsEncrypted
      );

      // Get adapter
      const adapter = createAdapter(connection.provider);

      // Determine sync window
      const syncWindow = this.calculateSyncWindow(connection, options);

      // Fetch data from provider
      const rawData = await adapter.fetchUsage(credentials, syncWindow);

      // Normalize data
      const normalizedRecords = this.normalizer.normalize(
        connection.provider,
        rawData,
        connection
      );

      // Upsert records
      const { recordsCreated, recordsUpdated, totalCost, totalTokens } = 
        await this.upsertUsageRecords(connection.organizationId, connectionId, normalizedRecords);

      // Update sync state
      const result: SyncResult = {
        syncId,
        connectionId,
        status: 'success',
        recordsFetched: rawData.length,
        recordsCreated,
        recordsUpdated,
        totalCostSynced: totalCost,
        totalTokensSynced: totalTokens,
        durationMs: Date.now() - startTime,
        syncWindow,
      };

      await this.completeSyncRecord(syncId, result);
      await this.updateConnectionStatus(connectionId, 'connected', {
        last_sync_at: new Date().toISOString(),
        last_sync_records: recordsCreated + recordsUpdated,
        last_sync_duration_ms: result.durationMs,
        consecutive_failures: 0,
        last_error: null,
        last_error_at: null,
      });

      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      
      const result: SyncResult = {
        syncId,
        connectionId,
        status: 'failed',
        error: errorMessage,
        durationMs: Date.now() - startTime,
      };

      await this.completeSyncRecord(syncId, result);
      
      // Increment failure count
      const { data: currentConn } = await this.supabase
        .from('provider_connections')
        .select('consecutive_failures')
        .eq('id', connectionId)
        .single();

      await this.updateConnectionStatus(connectionId, 'error', {
        last_error: errorMessage,
        last_error_at: new Date().toISOString(),
        consecutive_failures: (currentConn?.consecutive_failures || 0) + 1,
      });

      throw error;
    }
  }

  /**
   * Sync all connections for an organization
   */
  async syncOrganization(orgId: string): Promise<SyncResult[]> {
    const { data: connections } = await this.supabase
      .from('provider_connections')
      .select('id')
      .eq('organization_id', orgId)
      .in('status', ['connected', 'error', 'pending']);

    if (!connections || connections.length === 0) {
      return [];
    }

    const results = await Promise.allSettled(
      connections.map((c) => this.triggerSync(c.id, { syncType: 'scheduled' }))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<SyncResult> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  /**
   * Backfill historical data
   */
  async backfill(
    connectionId: string,
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<SyncResult> {
    return this.triggerSync(connectionId, {
      backfill: true,
      startDate,
      endDate,
      syncType: 'backfill',
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private calculateSyncWindow(
    connection: ProviderConnection,
    options: SyncOptions
  ): SyncWindow {
    if (options.backfill && options.startDate) {
      return {
        start: options.startDate,
        end: options.endDate || new Date(),
        granularity: '1h',
      };
    }

    // Incremental sync from last sync point
    const lastSync = connection.lastSyncAt
      ? new Date(connection.lastSyncAt)
      : new Date(Date.now() - connection.settings.backfillDays * 24 * 60 * 60 * 1000);

    // Add 1 hour overlap to catch any delayed data
    const start = new Date(lastSync.getTime() - 60 * 60 * 1000);

    return {
      start,
      end: new Date(),
      granularity: '1h',
    };
  }

  private async upsertUsageRecords(
    orgId: string,
    connectionId: string,
    records: NormalizedUsageRecord[]
  ): Promise<{
    recordsCreated: number;
    recordsUpdated: number;
    totalCost: number;
    totalTokens: number;
  }> {
    if (records.length === 0) {
      return { recordsCreated: 0, recordsUpdated: 0, totalCost: 0, totalTokens: 0 };
    }

    // Prepare records for database
    const dbRecords = records.map((r) => ({
      ...mapUsageRecordToDb({
        ...r,
        organizationId: orgId,
        connectionId,
        dimensions: r.dimensions as Record<string, string | undefined>,
      }),
    }));

    // Upsert in batches
    const batchSize = 500;
    let created = 0;
    let totalCost = 0;
    let totalTokens = 0;

    for (let i = 0; i < dbRecords.length; i += batchSize) {
      const batch = dbRecords.slice(i, i + batchSize);

      const { data, error } = await this.supabase
        .from('usage_records')
        .upsert(batch, {
          onConflict: 'organization_id,provider,model,timestamp',
          ignoreDuplicates: false,
        })
        .select('id');

      if (error) {
        console.error('[SyncEngine] Upsert error:', error);
        throw error;
      }

      created += data?.length || 0;

      // Sum up totals
      for (const record of batch) {
        totalCost += Number(record.cost) || 0;
        totalTokens += (Number(record.input_tokens) || 0) + (Number(record.output_tokens) || 0);
      }
    }

    return { recordsCreated: created, recordsUpdated: 0, totalCost, totalTokens };
  }

  private async updateConnectionStatus(
    connectionId: string,
    status: string,
    extra: Record<string, unknown> = {}
  ): Promise<void> {
    await this.supabase
      .from('provider_connections')
      .update({
        status,
        ...extra,
      })
      .eq('id', connectionId);
  }

  private async completeSyncRecord(syncId: string, result: SyncResult): Promise<void> {
    await this.supabase
      .from('sync_history')
      .update({
        status: result.status,
        completed_at: new Date().toISOString(),
        duration_ms: result.durationMs,
        records_fetched: result.recordsFetched || 0,
        records_created: result.recordsCreated || 0,
        records_updated: result.recordsUpdated || 0,
        total_cost_synced: result.totalCostSynced || 0,
        total_tokens_synced: result.totalTokensSynced || 0,
        error_message: result.error,
        sync_window_start: result.syncWindow?.start.toISOString(),
        sync_window_end: result.syncWindow?.end.toISOString(),
        granularity: result.syncWindow?.granularity,
      })
      .eq('id', syncId);
  }
}

/**
 * Create a ProviderSyncEngine instance
 */
export function createSyncEngine(
  supabase: SupabaseClient,
  encryptionKey?: string
): ProviderSyncEngine {
  return new ProviderSyncEngine(supabase, encryptionKey);
}
