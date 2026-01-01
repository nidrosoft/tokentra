// ============= Configuration =============

export interface TokentraConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  batchSize?: number;
  flushInterval?: number;
  maxQueueSize?: number;
  debug?: boolean;
  onError?: (error: Error) => void;
  
  // Default attribution
  defaults?: {
    team?: string;
    project?: string;
    feature?: string;
    costCenter?: string;
    environment?: string;
  };
  
  // Resilience settings
  resilience?: {
    maxRetries?: number;
    retryDelayMs?: number;
    circuitBreakerThreshold?: number;
    circuitBreakerResetMs?: number;
  };
  
  // Privacy settings
  privacy?: {
    mode?: "metrics_only" | "hashed" | "full_logging";
    redactPatterns?: RegExp[];
  };
  
  // Optimization settings
  optimization?: {
    enabled?: boolean;
    enableRouting?: boolean;
    enableCaching?: boolean;
  };
}

export type ProviderType = 
  | "openai" 
  | "anthropic" 
  | "google" 
  | "azure" 
  | "aws" 
  | "xai" 
  | "deepseek" 
  | "mistral" 
  | "cohere" 
  | "groq" 
  | "custom";

// ============= Tracking Events =============

export interface TrackingEvent {
  provider: ProviderType | string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  latencyMs?: number;
  timeToFirstTokenMs?: number;
  cost?: number;
  inputCost?: number;
  outputCost?: number;
  team?: string;
  project?: string;
  feature?: string;
  costCenter?: string;
  userId?: string;
  requestId?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
  methodPath?: string;
  isStreaming?: boolean;
  isError?: boolean;
  errorCode?: string;
  errorType?: string;
  errorMessage?: string;
  wasCached?: boolean;
  cacheHitType?: "exact" | "semantic" | "none";
  originalModel?: string;
  routedByRule?: string;
  promptHash?: string;
}

export interface TrackingContext {
  team?: string;
  project?: string;
  feature?: string;
  costCenter?: string;
  userId?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
}

// Attribution options passed to wrapped methods
export interface TokentraOptions {
  feature?: string;
  team?: string;
  project?: string;
  costCenter?: string;
  userId?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
}

// ============= API Responses =============

export interface BatchResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}

export interface TrackResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
}

// ============= Provider-specific types =============

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
}

export interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
}

export interface GoogleUsage {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface AzureUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface BedrockUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

// ============= SDK Stats =============

export interface SDKStats {
  requestsTracked: number;
  telemetrySent: number;
  telemetryFailed: number;
  telemetryBuffered: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  circuitBreakerState: "closed" | "open" | "half-open";
}

// ============= Error Types =============

export type TokentraErrorCode =
  | "INVALID_API_KEY"
  | "KEY_EXPIRED"
  | "KEY_REVOKED"
  | "INSUFFICIENT_SCOPE"
  | "RATE_LIMIT_EXCEEDED"
  | "INVALID_CONFIG"
  | "UNSUPPORTED_PROVIDER"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "INTERNAL_ERROR"
  | "TELEMETRY_FAILED";

export class TokentraError extends Error {
  constructor(
    public code: TokentraErrorCode,
    message: string,
    public cause?: Error,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "TokentraError";
  }
}

// ============= Internal Types =============

export interface TelemetryPayload {
  request_id: string;
  timestamp: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cached_tokens?: number;
  input_cost?: number;
  output_cost?: number;
  total_cost?: number;
  latency_ms: number;
  time_to_first_token_ms?: number;
  feature?: string;
  team?: string;
  project?: string;
  cost_center?: string;
  user_id?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
  method_path?: string;
  is_streaming?: boolean;
  is_error?: boolean;
  error_code?: string;
  error_type?: string;
  error_message?: string;
  was_cached?: boolean;
  cache_hit_type?: string;
  original_model?: string;
  routed_by_rule?: string;
  prompt_hash?: string;
  sdk_version: string;
  sdk_language: string;
}
