export type ProviderType = 
  | "openai" 
  | "anthropic" 
  | "azure" 
  | "google" 
  | "aws"
  | "xai"        // xAI (Grok)
  | "deepseek"   // DeepSeek
  | "mistral"    // Mistral AI
  | "cohere"     // Cohere
  | "groq";      // Groq (inference platform)

export type ProviderStatus = "connected" | "disconnected" | "error" | "syncing";

export interface Provider {
  id: string;
  organizationId: string;
  type: ProviderType;
  name: string;
  status: ProviderStatus;
  lastSyncAt?: Date;
  syncError?: string;
  config: ProviderConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderConfig {
  apiKeyMasked?: string;
  organizationId?: string;
  endpoint?: string;
  region?: string;
}

export interface ProviderSyncResult {
  providerId: string;
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  startedAt: Date;
  completedAt: Date;
}
