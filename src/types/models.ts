export interface Model {
  id: string;
  providerId: string;
  name: string;
  displayName: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  cachedInputCostPer1k?: number;
  contextWindow: number;
  capabilities: ModelCapability[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ModelCapability = 
  | "text"
  | "code"
  | "vision"
  | "function_calling"
  | "json_mode"
  | "streaming";

export interface ModelUsageStats {
  modelId: string;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  avgLatency: number;
}
