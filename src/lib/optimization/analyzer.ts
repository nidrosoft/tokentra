import type { CostRecord, Recommendation } from "@/types";
import { groupByModel, aggregateCosts } from "../calculations/aggregations";
import { getModelPricing } from "../calculations/pricing";

export interface AnalysisResult {
  recommendations: Recommendation[];
  potentialSavings: number;
  analyzedRecords: number;
}

export function analyzeCosts(records: CostRecord[]): AnalysisResult {
  const recommendations: Recommendation[] = [];
  let potentialSavings = 0;
  
  const byModel = groupByModel(records);
  
  for (const [model, modelRecords] of Object.entries(byModel)) {
    const { totalCost, totalTokens } = aggregateCosts(modelRecords);
    
    // Check for model downgrade opportunities
    if (model.includes("gpt-4") && !model.includes("mini")) {
      const savings = totalCost * 0.5; // Estimate 50% savings with mini
      potentialSavings += savings;
      
      recommendations.push({
        id: `rec_${Date.now()}_${model}`,
        organizationId: modelRecords[0].organizationId,
        type: "model_downgrade",
        title: `Consider using GPT-4o-mini for simpler tasks`,
        description: `${modelRecords.length} requests to ${model} could potentially use a smaller model`,
        impact: {
          estimatedMonthlySavings: savings,
          savingsPercentage: 50,
          confidence: "medium",
          affectedRequests: modelRecords.length,
        },
        status: "pending",
        details: {
          currentState: { model, totalCost },
          suggestedState: { model: "gpt-4o-mini" },
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  }
  
  return {
    recommendations,
    potentialSavings,
    analyzedRecords: records.length,
  };
}
