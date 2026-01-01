/**
 * Provider Sync Engine - Type Definitions
 * 
 * Core types for the enterprise-grade provider sync system.
 */

// =============================================================================
// PROVIDER TYPES
// =============================================================================

export type ProviderType = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'azure' 
  | 'aws'
  | 'xai'        // xAI (Grok)
  | 'deepseek'   // DeepSeek
  | 'mistral'    // Mistral AI
  | 'cohere'     // Cohere
  | 'groq';      // Groq (inference platform)

export type ConnectionStatus = 
  | 'pending' 
  | 'testing' 
  | 'connected' 
  | 'syncing' 
  | 'error' 
  | 'disconnected' 
  | 'disconnecting';

export type SyncStatus = 'running' | 'success' | 'failed' | 'partial' | 'cancelled';

export type SyncType = 'scheduled' | 'manual' | 'backfill' | 'initial';

export type Granularity = '1m' | '1h' | '1d';

// =============================================================================
// CREDENTIALS
// =============================================================================

export interface OpenAICredentials {
  type: 'api_key';
  adminApiKey: string;
  organizationId?: string;
}

export interface AnthropicCredentials {
  type: 'api_key';
  adminApiKey: string;
}

export interface GoogleCredentials {
  type: 'service_account' | 'oauth';
  serviceAccountKey?: string;
  projectId: string;
  region?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AzureCredentials {
  type: 'service_principal' | 'api_key';
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  subscriptionId: string;
  resourceGroup: string;
  apiKey?: string;
  endpoint?: string;
  deploymentName?: string;
}

export interface AWSCredentials {
  type: 'iam_role' | 'access_key';
  roleArn?: string;
  externalId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region: string;
}

// xAI (Grok) - OpenAI-compatible API
export interface XAICredentials {
  type: 'api_key';
  apiKey: string;
}

// DeepSeek - OpenAI-compatible API
export interface DeepSeekCredentials {
  type: 'api_key';
  apiKey: string;
}

// Mistral AI
export interface MistralCredentials {
  type: 'api_key';
  apiKey: string;
}

// Cohere
export interface CohereCredentials {
  type: 'api_key';
  apiKey: string;
}

// Groq - OpenAI-compatible API
export interface GroqCredentials {
  type: 'api_key';
  apiKey: string;
}

export type ProviderCredentials = 
  | OpenAICredentials 
  | AnthropicCredentials 
  | GoogleCredentials 
  | AzureCredentials 
  | AWSCredentials
  | XAICredentials
  | DeepSeekCredentials
  | MistralCredentials
  | CohereCredentials
  | GroqCredentials;

// =============================================================================
// CONNECTION
// =============================================================================

export interface ConnectionSettings {
  syncInterval: number;        // Minutes between syncs
  backfillDays: number;        // Days to backfill on initial sync
  enableRealtime: boolean;     // Enable real-time sync (if supported)
  customDimensions: string[];  // Custom dimensions to track
}

export interface ProviderConnection {
  id: string;
  organizationId: string;
  provider: ProviderType;
  status: ConnectionStatus;
  displayName?: string;
  credentialsEncrypted: string;
  settings: ConnectionSettings;
  lastSyncAt?: Date;
  lastSyncRecords?: number;
  lastSyncDurationMs?: number;
  lastError?: string;
  lastErrorAt?: Date;
  consecutiveFailures: number;
  providerMetadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderConnectionInput {
  organizationId: string;
  provider: ProviderType;
  displayName?: string;
  credentials: ProviderCredentials;
  settings?: Partial<ConnectionSettings>;
}

// =============================================================================
// SYNC
// =============================================================================

export interface SyncWindow {
  start: Date;
  end: Date;
  granularity: Granularity;
}

export interface SyncOptions {
  backfill?: boolean;
  startDate?: Date;
  endDate?: Date;
  testFirst?: boolean;
  force?: boolean;
}

export interface SyncResult {
  syncId: string;
  connectionId: string;
  status: SyncStatus;
  recordsFetched?: number;
  recordsCreated?: number;
  recordsUpdated?: number;
  recordsSkipped?: number;
  totalCostSynced?: number;
  totalTokensSynced?: number;
  durationMs: number;
  error?: string;
  errorCode?: string;
  syncWindow?: SyncWindow;
}

export interface SyncHistoryRecord {
  id: string;
  connectionId: string;
  organizationId: string;
  status: SyncStatus;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  syncWindowStart?: Date;
  syncWindowEnd?: Date;
  granularity?: Granularity;
  recordsFetched: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  totalCostSynced: number;
  totalTokensSynced: number;
  syncType: SyncType;
  options?: Record<string, unknown>;
  errorMessage?: string;
  errorCode?: string;
  errorDetails?: Record<string, unknown>;
  retryCount: number;
  createdAt: Date;
}

// =============================================================================
// RAW USAGE DATA (from providers)
// =============================================================================

export interface RawUsageData {
  provider: ProviderType;
  timestamp: Date;
  endTime?: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  cacheCreationTokens?: number;
  requests: number;
  cost?: number;
  dimensions?: Record<string, string | undefined>;
  rawData?: Record<string, unknown>;
}

// =============================================================================
// NORMALIZED USAGE RECORD
// =============================================================================

export interface NormalizedUsageRecord {
  id: string;
  organizationId?: string;
  connectionId?: string;
  provider: ProviderType;
  
  // Time
  timestamp: Date;
  endTime?: Date;
  granularity: Granularity;
  
  // Model
  model: string;
  modelFamily: string;
  modelVersion?: string;
  
  // Tokens
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedInputTokens: number;
  cacheCreationTokens: number;
  
  // Requests
  requests: number;
  
  // Cost
  cost: number;
  currency: string;
  
  // Attribution dimensions
  dimensions: UsageDimensions;
  dimensionHash: string;
  
  // Provider-specific metadata
  providerMetadata?: Record<string, unknown>;
}

export interface UsageDimensions {
  projectId?: string;
  workspaceId?: string;
  teamId?: string;
  userId?: string;
  apiKeyId?: string;
  costCenterId?: string;
  environment?: string;
  feature?: string;
  resourceId?: string;
  deploymentName?: string;
  region?: string;
}

// =============================================================================
// CONNECTION TEST
// =============================================================================

export interface ConnectionTestResult {
  success: boolean;
  latencyMs: number;
  error?: string;
  errorCode?: string;
  metadata?: Record<string, unknown>;
  permissions: string[];
}

// =============================================================================
// HEALTH
// =============================================================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface ConnectionHealth {
  connectionId: string;
  provider: ProviderType;
  status: HealthStatus;
  successRate: number;
  avgDurationMs: number;
  lastSyncAt: Date | null;
  isStale: boolean;
  consecutiveFailures: number;
  lastError?: string;
  recentErrors: Array<{ timestamp: string; error: string }>;
}

export interface ProviderPing {
  provider: ProviderType;
  reachable: boolean;
  latencyMs: number;
  statusCode?: number;
  error?: string;
}

export interface ProviderSyncSummary {
  totalConnections: number;
  connectedCount: number;
  errorCount: number;
  syncingCount: number;
  totalSyncsToday: number;
  successfulSyncsToday: number;
  totalRecordsToday: number;
  totalCostToday: number;
}

// =============================================================================
// PROVIDER ADAPTER INTERFACE
// =============================================================================

export interface ProviderAdapter {
  readonly provider: ProviderType;
  
  testConnection(credentials: ProviderCredentials): Promise<ConnectionTestResult>;
  
  fetchUsage(
    credentials: ProviderCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]>;
}

// =============================================================================
// DATABASE MAPPERS
// =============================================================================

export interface DbProviderConnection {
  id: string;
  organization_id: string;
  provider: string;
  status: string;
  display_name: string | null;
  credentials_encrypted: string;
  settings: ConnectionSettings;
  last_sync_at: string | null;
  last_sync_records: number | null;
  last_sync_duration_ms: number | null;
  last_error: string | null;
  last_error_at: string | null;
  consecutive_failures: number;
  provider_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DbSyncHistory {
  id: string;
  connection_id: string;
  organization_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  sync_window_start: string | null;
  sync_window_end: string | null;
  granularity: string | null;
  records_fetched: number;
  records_created: number;
  records_updated: number;
  records_skipped: number;
  total_cost_synced: number;
  total_tokens_synced: number;
  sync_type: string;
  options: Record<string, unknown> | null;
  error_message: string | null;
  error_code: string | null;
  error_details: Record<string, unknown> | null;
  retry_count: number;
  created_at: string;
}
