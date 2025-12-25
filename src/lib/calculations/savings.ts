export interface SavingsOpportunity {
  type: "model_switch" | "caching" | "prompt_optimization" | "batching";
  currentCost: number;
  projectedCost: number;
  savings: number;
  savingsPercentage: number;
  description: string;
}

export function calculateModelSwitchSavings(
  currentModel: string,
  currentCost: number,
  alternativeModel: string,
  alternativeCostRatio: number
): SavingsOpportunity {
  const projectedCost = currentCost * alternativeCostRatio;
  const savings = currentCost - projectedCost;
  
  return {
    type: "model_switch",
    currentCost,
    projectedCost,
    savings,
    savingsPercentage: (savings / currentCost) * 100,
    description: `Switch from ${currentModel} to ${alternativeModel}`,
  };
}

export function calculateCachingSavings(
  totalInputTokens: number,
  cacheablePercentage: number,
  inputCostPer1k: number,
  cachedCostPer1k: number
): SavingsOpportunity {
  const cacheableTokens = totalInputTokens * (cacheablePercentage / 100);
  const currentCost = (totalInputTokens / 1000) * inputCostPer1k;
  const projectedCost = 
    ((totalInputTokens - cacheableTokens) / 1000) * inputCostPer1k +
    (cacheableTokens / 1000) * cachedCostPer1k;
  const savings = currentCost - projectedCost;
  
  return {
    type: "caching",
    currentCost,
    projectedCost,
    savings,
    savingsPercentage: (savings / currentCost) * 100,
    description: `Enable prompt caching for ${cacheablePercentage}% of requests`,
  };
}

export function aggregateSavings(opportunities: SavingsOpportunity[]): {
  totalSavings: number;
  totalSavingsPercentage: number;
} {
  const totalCurrentCost = opportunities.reduce((sum, o) => sum + o.currentCost, 0);
  const totalSavings = opportunities.reduce((sum, o) => sum + o.savings, 0);
  
  return {
    totalSavings,
    totalSavingsPercentage: totalCurrentCost > 0 ? (totalSavings / totalCurrentCost) * 100 : 0,
  };
}
