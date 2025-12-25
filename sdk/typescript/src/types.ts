// ============= Configuration =============

export interface TokentraConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  batchSize?: number;
  flushInterval?: number;
  debug?: boolean;
  onError?: (error: Error) => void;
}

export type ProviderType = "openai" | "anthropic" | "google" | "azure" | "aws" | "custom";

// ============= Tracking Events =============

export interface TrackingEvent {
  provider: ProviderType | string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  latencyMs?: number;
  cost?: number;
  teamId?: string;
  projectId?: string;
  featureTag?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}

export interface TrackingContext {
  teamId?: string;
  projectId?: string;
  featureTag?: string;
  userId?: string;
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
