export interface CostRecord {
  id: string;
  organizationId: string;
  provider: string;
  model: string;
  teamId?: string;
  projectId?: string;
  costCenterId?: string;
  featureTag?: string;
  tokensInput: number;
  tokensOutput: number;
  tokensCached?: number;
  cost: number;
  currency: string;
  requestId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface CostSummary {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  avgCostPerRequest: number;
  costByProvider: Record<string, number>;
  costByModel: Record<string, number>;
  costByTeam: Record<string, number>;
  costByProject: Record<string, number>;
}

export interface CostTrend {
  date: string;
  cost: number;
  tokens: number;
  requests: number;
}

export interface CostBreakdown {
  dimension: string;
  value: string;
  cost: number;
  percentage: number;
  tokens: number;
  requests: number;
}

export interface CostForecast {
  projectedCost: number;
  confidence: "high" | "medium" | "low";
  trend: "up" | "down" | "stable";
  percentageChange: number;
  forecastDate: Date;
}
