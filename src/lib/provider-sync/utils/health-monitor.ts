/**
 * Health Monitor - Provider Connection Health Tracking
 * 
 * Monitors the health of provider connections based on sync history,
 * success rates, and API reachability.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ProviderType,
  ConnectionHealth,
  ProviderPing,
  ProviderSyncSummary,
  HealthStatus,
} from '../types';

// Provider API endpoints for health checks
const PROVIDER_ENDPOINTS: Record<ProviderType, string> = {
  openai: 'https://api.openai.com/v1/models',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://aiplatform.googleapis.com/',
  azure: 'https://management.azure.com/',
  aws: 'https://bedrock.us-east-1.amazonaws.com/',
};

export class HealthMonitor {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get health status for all connections in an organization
   */
  async getHealthStatus(orgId: string): Promise<ConnectionHealth[]> {
    const { data: connections, error } = await this.supabase
      .from('provider_connections')
      .select(`
        *,
        sync_history (
          status,
          started_at,
          completed_at,
          duration_ms,
          error_message
        )
      `)
      .eq('organization_id', orgId)
      .order('started_at', { 
        referencedTable: 'sync_history', 
        ascending: false 
      })
      .limit(10, { referencedTable: 'sync_history' });

    if (error) {
      console.error('[HealthMonitor] Error fetching connections:', error);
      return [];
    }

    return (connections || []).map((conn) => this.calculateHealth(conn));
  }

  /**
   * Get health status for a single connection
   */
  async getConnectionHealth(connectionId: string): Promise<ConnectionHealth | null> {
    const { data: connection, error } = await this.supabase
      .from('provider_connections')
      .select(`
        *,
        sync_history (
          status,
          started_at,
          completed_at,
          duration_ms,
          error_message
        )
      `)
      .eq('id', connectionId)
      .order('started_at', { 
        referencedTable: 'sync_history', 
        ascending: false 
      })
      .limit(10, { referencedTable: 'sync_history' })
      .single();

    if (error || !connection) {
      return null;
    }

    return this.calculateHealth(connection);
  }

  /**
   * Calculate health metrics for a connection
   */
  private calculateHealth(connection: Record<string, unknown>): ConnectionHealth {
    const recentSyncs = (connection.sync_history || []) as Array<{
      status: string;
      started_at: string;
      completed_at: string | null;
      duration_ms: number | null;
      error_message: string | null;
    }>;

    // Calculate success rate
    const successfulSyncs = recentSyncs.filter((s) => s.status === 'success').length;
    const successRate = recentSyncs.length > 0
      ? (successfulSyncs / recentSyncs.length) * 100
      : 0;

    // Calculate average sync duration
    const completedSyncs = recentSyncs.filter((s) => s.duration_ms != null);
    const avgDuration = completedSyncs.length > 0
      ? completedSyncs.reduce((sum, s) => sum + (s.duration_ms || 0), 0) / completedSyncs.length
      : 0;

    // Determine health status
    const consecutiveFailures = connection.consecutive_failures as number || 0;
    const connectionStatus = connection.status as string;
    let status: HealthStatus;

    if (connectionStatus === 'error' || consecutiveFailures >= 3) {
      status = 'unhealthy';
    } else if (consecutiveFailures >= 1 || successRate < 50) {
      status = 'degraded';
    } else if (successRate >= 90) {
      status = 'healthy';
    } else if (successRate >= 50) {
      status = 'degraded';
    } else {
      status = 'unknown';
    }

    // Check for stale data
    const lastSyncAt = connection.last_sync_at 
      ? new Date(connection.last_sync_at as string) 
      : null;
    const settings = connection.settings as { syncInterval?: number } || {};
    const syncInterval = settings.syncInterval || 5;
    const isStale = lastSyncAt
      ? Date.now() - lastSyncAt.getTime() > syncInterval * 2 * 60 * 1000
      : true;

    // Get recent errors
    const recentErrors = recentSyncs
      .filter((s) => s.status === 'failed' && s.error_message)
      .map((s) => ({
        timestamp: s.started_at,
        error: s.error_message || 'Unknown error',
      }))
      .slice(0, 5);

    return {
      connectionId: connection.id as string,
      provider: connection.provider as ProviderType,
      status,
      successRate,
      avgDurationMs: Math.round(avgDuration),
      lastSyncAt,
      isStale,
      consecutiveFailures,
      lastError: connection.last_error as string | undefined,
      recentErrors,
    };
  }

  /**
   * Ping a provider's API to check if it's reachable
   */
  async pingProvider(provider: ProviderType): Promise<ProviderPing> {
    const startTime = Date.now();
    const endpoint = PROVIDER_ENDPOINTS[provider];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        provider,
        reachable: true,
        latencyMs: Date.now() - startTime,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        provider,
        reachable: false,
        latencyMs: Date.now() - startTime,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Ping all providers and return their status
   */
  async pingAllProviders(): Promise<ProviderPing[]> {
    const providers: ProviderType[] = ['openai', 'anthropic', 'google', 'azure', 'aws'];
    return Promise.all(providers.map((p) => this.pingProvider(p)));
  }

  /**
   * Get sync summary for an organization
   */
  async getSyncSummary(orgId: string): Promise<ProviderSyncSummary> {
    // Use the database function we created
    const { data, error } = await this.supabase
      .rpc('get_provider_sync_summary', { p_org_id: orgId });

    if (error || !data) {
      console.error('[HealthMonitor] Error fetching sync summary:', error);
      return {
        totalConnections: 0,
        connectedCount: 0,
        errorCount: 0,
        syncingCount: 0,
        totalSyncsToday: 0,
        successfulSyncsToday: 0,
        totalRecordsToday: 0,
        totalCostToday: 0,
      };
    }

    // Handle both array and single object response
    const summary = Array.isArray(data) ? data[0] : data;

    return {
      totalConnections: summary.total_connections || 0,
      connectedCount: summary.connected_count || 0,
      errorCount: summary.error_count || 0,
      syncingCount: summary.syncing_count || 0,
      totalSyncsToday: summary.total_syncs_today || 0,
      successfulSyncsToday: summary.successful_syncs_today || 0,
      totalRecordsToday: Number(summary.total_records_today) || 0,
      totalCostToday: Number(summary.total_cost_today) || 0,
    };
  }

  /**
   * Record a health snapshot for a connection
   */
  async recordHealthSnapshot(
    connectionId: string,
    orgId: string,
    ping: ProviderPing
  ): Promise<void> {
    const health = await this.getConnectionHealth(connectionId);

    const { error } = await this.supabase
      .from('provider_health_snapshots')
      .insert({
        connection_id: connectionId,
        organization_id: orgId,
        is_reachable: ping.reachable,
        latency_ms: ping.latencyMs,
        api_status_code: ping.statusCode,
        api_error: ping.error,
        health_score: health ? this.calculateHealthScore(health) : null,
        syncs_last_24h: health?.recentErrors.length || 0,
        success_rate_24h: health?.successRate || 0,
        avg_sync_duration_ms: health?.avgDurationMs || null,
      });

    if (error) {
      console.error('[HealthMonitor] Error recording health snapshot:', error);
    }
  }

  /**
   * Calculate a numeric health score (0-100)
   */
  private calculateHealthScore(health: ConnectionHealth): number {
    let score = 100;

    // Deduct for low success rate
    if (health.successRate < 100) {
      score -= (100 - health.successRate) * 0.5;
    }

    // Deduct for consecutive failures
    score -= health.consecutiveFailures * 10;

    // Deduct for stale data
    if (health.isStale) {
      score -= 20;
    }

    // Deduct for recent errors
    score -= health.recentErrors.length * 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

// Factory function
export function createHealthMonitor(supabase: SupabaseClient): HealthMonitor {
  return new HealthMonitor(supabase);
}
