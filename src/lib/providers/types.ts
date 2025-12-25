export type ProviderType = "openai" | "anthropic" | "azure" | "google" | "aws";

export interface ProviderCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  serviceAccountKey?: string;
  iamRole?: string;
  organizationId?: string;
  endpoint?: string;
  region?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  lastSyncedAt: Date;
}

export interface ProviderConfig {
  type: ProviderType;
  name: string;
  logo: string;
  color: string;
  authType: "api_key" | "oauth" | "service_account" | "iam_role";
  models: ModelConfig[];
}

export interface ModelConfig {
  id: string;
  name: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  contextWindow: number;
  capabilities: string[];
}

export interface RateLimitInfo {
  requestsPerMinute: number;
  tokensPerMinute: number;
  currentUsage: number;
}
