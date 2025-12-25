export interface UsageRecord {
  id: string;
  organizationId: string;
  provider: string;
  model: string;
  teamId?: string;
  projectId?: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  latencyMs: number;
  statusCode: number;
  timestamp: Date;
}

export interface UsageSummary {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;
  avgLatency: number;
  successRate: number;
}

export interface UsageTrend {
  date: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  avgLatency: number;
}

export interface TokenUsageByModel {
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  requests: number;
}
