/**
 * Database Mappers - Convert between DB and TypeScript types
 * 
 * Handles the transformation of snake_case database columns to
 * camelCase TypeScript properties and vice versa.
 */

import type {
  ProviderConnection,
  ConnectionSettings,
  SyncHistoryRecord,
  DbProviderConnection,
  DbSyncHistory,
  ProviderType,
  ConnectionStatus,
  SyncStatus,
  SyncType,
  Granularity,
} from '../types';

/**
 * Map database provider connection to TypeScript type
 */
export function mapConnectionFromDb(db: DbProviderConnection): ProviderConnection {
  return {
    id: db.id,
    organizationId: db.organization_id,
    provider: db.provider as ProviderType,
    status: db.status as ConnectionStatus,
    displayName: db.display_name || undefined,
    credentialsEncrypted: db.credentials_encrypted,
    settings: db.settings as ConnectionSettings,
    lastSyncAt: db.last_sync_at ? new Date(db.last_sync_at) : undefined,
    lastSyncRecords: db.last_sync_records || undefined,
    lastSyncDurationMs: db.last_sync_duration_ms || undefined,
    lastError: db.last_error || undefined,
    lastErrorAt: db.last_error_at ? new Date(db.last_error_at) : undefined,
    consecutiveFailures: db.consecutive_failures,
    providerMetadata: db.provider_metadata || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

/**
 * Map TypeScript provider connection to database format
 */
export function mapConnectionToDb(
  connection: Partial<ProviderConnection> & { organizationId: string; provider: ProviderType }
): Partial<DbProviderConnection> {
  const db: Partial<DbProviderConnection> = {
    organization_id: connection.organizationId,
    provider: connection.provider,
  };

  if (connection.status !== undefined) db.status = connection.status;
  if (connection.displayName !== undefined) db.display_name = connection.displayName;
  if (connection.credentialsEncrypted !== undefined) db.credentials_encrypted = connection.credentialsEncrypted;
  if (connection.settings !== undefined) db.settings = connection.settings;
  if (connection.lastSyncAt !== undefined) db.last_sync_at = connection.lastSyncAt?.toISOString() || null;
  if (connection.lastSyncRecords !== undefined) db.last_sync_records = connection.lastSyncRecords;
  if (connection.lastSyncDurationMs !== undefined) db.last_sync_duration_ms = connection.lastSyncDurationMs;
  if (connection.lastError !== undefined) db.last_error = connection.lastError || null;
  if (connection.lastErrorAt !== undefined) db.last_error_at = connection.lastErrorAt?.toISOString() || null;
  if (connection.consecutiveFailures !== undefined) db.consecutive_failures = connection.consecutiveFailures;
  if (connection.providerMetadata !== undefined) db.provider_metadata = connection.providerMetadata || null;

  return db;
}

/**
 * Map database sync history to TypeScript type
 */
export function mapSyncHistoryFromDb(db: DbSyncHistory): SyncHistoryRecord {
  return {
    id: db.id,
    connectionId: db.connection_id,
    organizationId: db.organization_id,
    status: db.status as SyncStatus,
    startedAt: new Date(db.started_at),
    completedAt: db.completed_at ? new Date(db.completed_at) : undefined,
    durationMs: db.duration_ms || undefined,
    syncWindowStart: db.sync_window_start ? new Date(db.sync_window_start) : undefined,
    syncWindowEnd: db.sync_window_end ? new Date(db.sync_window_end) : undefined,
    granularity: (db.granularity as Granularity) || undefined,
    recordsFetched: db.records_fetched,
    recordsCreated: db.records_created,
    recordsUpdated: db.records_updated,
    recordsSkipped: db.records_skipped,
    totalCostSynced: db.total_cost_synced,
    totalTokensSynced: db.total_tokens_synced,
    syncType: db.sync_type as SyncType,
    options: db.options || undefined,
    errorMessage: db.error_message || undefined,
    errorCode: db.error_code || undefined,
    errorDetails: db.error_details || undefined,
    retryCount: db.retry_count,
    createdAt: new Date(db.created_at),
  };
}

/**
 * Map TypeScript sync history to database format
 */
export function mapSyncHistoryToDb(
  history: Partial<SyncHistoryRecord> & { connectionId: string; organizationId: string }
): Partial<DbSyncHistory> {
  const db: Partial<DbSyncHistory> = {
    connection_id: history.connectionId,
    organization_id: history.organizationId,
  };

  if (history.status !== undefined) db.status = history.status;
  if (history.startedAt !== undefined) db.started_at = history.startedAt.toISOString();
  if (history.completedAt !== undefined) db.completed_at = history.completedAt?.toISOString() || null;
  if (history.durationMs !== undefined) db.duration_ms = history.durationMs;
  if (history.syncWindowStart !== undefined) db.sync_window_start = history.syncWindowStart?.toISOString() || null;
  if (history.syncWindowEnd !== undefined) db.sync_window_end = history.syncWindowEnd?.toISOString() || null;
  if (history.granularity !== undefined) db.granularity = history.granularity;
  if (history.recordsFetched !== undefined) db.records_fetched = history.recordsFetched;
  if (history.recordsCreated !== undefined) db.records_created = history.recordsCreated;
  if (history.recordsUpdated !== undefined) db.records_updated = history.recordsUpdated;
  if (history.recordsSkipped !== undefined) db.records_skipped = history.recordsSkipped;
  if (history.totalCostSynced !== undefined) db.total_cost_synced = history.totalCostSynced;
  if (history.totalTokensSynced !== undefined) db.total_tokens_synced = history.totalTokensSynced;
  if (history.syncType !== undefined) db.sync_type = history.syncType;
  if (history.options !== undefined) db.options = history.options || null;
  if (history.errorMessage !== undefined) db.error_message = history.errorMessage || null;
  if (history.errorCode !== undefined) db.error_code = history.errorCode || null;
  if (history.errorDetails !== undefined) db.error_details = history.errorDetails || null;
  if (history.retryCount !== undefined) db.retry_count = history.retryCount;

  return db;
}

/**
 * Map normalized usage record to database format
 */
export function mapUsageRecordToDb(record: {
  organizationId: string;
  connectionId?: string;
  provider: string;
  timestamp: Date;
  endTime?: Date;
  granularity?: string;
  model: string;
  modelFamily?: string;
  modelVersion?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedInputTokens: number;
  cacheCreationTokens: number;
  requests: number;
  cost: number;
  currency: string;
  dimensions: Record<string, string | undefined>;
  dimensionHash: string;
  providerMetadata?: Record<string, unknown>;
}): Record<string, unknown> {
  return {
    organization_id: record.organizationId,
    connection_id: record.connectionId,
    provider: record.provider,
    timestamp: record.timestamp.toISOString(),
    end_time: record.endTime?.toISOString(),
    granularity: record.granularity || '1h',
    model: record.model,
    model_family: record.modelFamily,
    model_version: record.modelVersion,
    input_tokens: record.inputTokens,
    output_tokens: record.outputTokens,
    total_tokens: record.totalTokens,
    cached_tokens: record.cachedInputTokens,
    cache_creation_tokens: record.cacheCreationTokens,
    cost: record.cost,
    currency: record.currency,
    metadata: record.dimensions,
    dimension_hash: record.dimensionHash,
    provider_metadata: record.providerMetadata,
  };
}

/**
 * Default connection settings
 */
export const DEFAULT_CONNECTION_SETTINGS: ConnectionSettings = {
  syncInterval: 5,
  backfillDays: 30,
  enableRealtime: true,
  customDimensions: [],
};
