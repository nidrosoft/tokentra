export type RecommendationType = 
  | "model_downgrade"
  | "model_upgrade"
  | "caching_opportunity"
  | "prompt_optimization"
  | "batching_opportunity"
  | "provider_switch"
  | "unused_capacity";

export type RecommendationStatus = "pending" | "applied" | "dismissed" | "expired";

export interface Recommendation {
  id: string;
  organizationId: string;
  type: RecommendationType;
  title: string;
  description: string;
  impact: RecommendationImpact;
  status: RecommendationStatus;
  details: RecommendationDetails;
  createdAt: Date;
  expiresAt: Date;
  appliedAt?: Date;
  dismissedAt?: Date;
}

export interface RecommendationImpact {
  estimatedMonthlySavings: number;
  savingsPercentage: number;
  confidence: "high" | "medium" | "low";
  affectedRequests: number;
}

export interface RecommendationDetails {
  currentState: Record<string, unknown>;
  suggestedState: Record<string, unknown>;
  implementation?: string;
  risks?: string[];
}

export interface OptimizationSummary {
  totalPotentialSavings: number;
  recommendationCount: number;
  appliedSavings: number;
  topOpportunities: Recommendation[];
}
