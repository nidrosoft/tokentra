export interface ForecastResult {
  projectedCost: number;
  confidence: "high" | "medium" | "low";
  trend: "up" | "down" | "stable";
  percentageChange: number;
}

export function forecastMonthlyCost(
  dailyCosts: number[],
  daysRemaining: number
): ForecastResult {
  if (dailyCosts.length === 0) {
    return {
      projectedCost: 0,
      confidence: "low",
      trend: "stable",
      percentageChange: 0,
    };
  }
  
  const avgDailyCost = dailyCosts.reduce((a, b) => a + b, 0) / dailyCosts.length;
  const currentSpend = dailyCosts.reduce((a, b) => a + b, 0);
  const projectedCost = currentSpend + (avgDailyCost * daysRemaining);
  
  const recentAvg = dailyCosts.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, dailyCosts.length);
  const olderAvg = dailyCosts.slice(0, -7).reduce((a, b) => a + b, 0) / Math.max(1, dailyCosts.length - 7);
  
  let trend: "up" | "down" | "stable" = "stable";
  let percentageChange = 0;
  
  if (olderAvg > 0) {
    percentageChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    if (percentageChange > 10) trend = "up";
    else if (percentageChange < -10) trend = "down";
  }
  
  let confidence: "high" | "medium" | "low" = "medium";
  if (dailyCosts.length >= 14) confidence = "high";
  else if (dailyCosts.length < 7) confidence = "low";
  
  return {
    projectedCost,
    confidence,
    trend,
    percentageChange,
  };
}

export function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;
  
  const first = values[0];
  const last = values[values.length - 1];
  
  if (first === 0) return last > 0 ? 100 : 0;
  
  return ((last - first) / first) * 100;
}
