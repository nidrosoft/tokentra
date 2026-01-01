/**
 * TokenTRA Alerting Engine - Forecast Engine
 * 
 * Predicts future spending using multiple forecasting methods:
 * - Linear extrapolation
 * - Weighted moving average
 * - Exponential smoothing (Holt-Winters without seasonality)
 * - Trend-adjusted linear regression
 * 
 * Uses weighted ensemble for final prediction.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AlertTrigger,
  Budget,
  BudgetForecast,
  ForecastResult,
} from "../types";
import { getDaysRemaining, getDaysElapsed } from "../utils";

// Ensemble weights for different forecasting methods
const FORECAST_WEIGHTS = [0.2, 0.25, 0.3, 0.25];

/**
 * Forecast budget utilization
 */
export async function forecastBudget(
  supabase: SupabaseClient,
  budget: Budget,
  currentSpend: number
): Promise<BudgetForecast> {
  const periodStart = budget.periodStart;
  const periodEnd = budget.periodEnd;
  const now = new Date();

  const totalDays = Math.ceil(
    (periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000)
  );
  const daysElapsed = Math.max(
    1,
    Math.ceil((now.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000))
  );
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  // Get daily spend history
  const dailySpends = await getDailySpendHistory(
    supabase,
    budget.orgId,
    periodStart,
    now,
    budget.costCenterId
  );

  // Calculate forecasts using multiple methods
  const forecasts = [
    linearForecast(dailySpends, daysRemaining, currentSpend),
    weightedAverageForecast(dailySpends, daysRemaining, currentSpend),
    exponentialSmoothingForecast(dailySpends, daysRemaining, currentSpend),
    trendAdjustedForecast(dailySpends, daysRemaining, currentSpend),
  ];

  // Use weighted ensemble
  const projectedSpend = forecasts.reduce(
    (sum, f, i) => sum + f.projectedSpend * FORECAST_WEIGHTS[i],
    0
  );
  const projectedUtilization = (projectedSpend / budget.amount) * 100;

  // Calculate confidence interval
  const variance =
    forecasts.reduce((sum, f) => sum + Math.pow(f.projectedSpend - projectedSpend, 2), 0) /
    forecasts.length;
  const stdDev = Math.sqrt(variance);

  // Estimate breach date
  const estimatedBreachDate = estimateBreachDate(
    dailySpends,
    currentSpend,
    budget.amount,
    periodEnd
  );

  return {
    projectedSpend,
    projectedUtilization,
    confidenceInterval: {
      low: Math.max(currentSpend, projectedSpend - 1.96 * stdDev),
      high: projectedSpend + 1.96 * stdDev,
    },
    estimatedBreachDate,
    projectedOverage: Math.max(0, projectedSpend - budget.amount),
    methodBreakdown: forecasts.map((f, i) => ({
      method: f.method,
      projection: f.projectedSpend,
      weight: FORECAST_WEIGHTS[i],
    })),
    daysRemaining,
    dailyBurnRate: currentSpend / daysElapsed,
    requiredDailyRate: daysRemaining > 0 ? (budget.amount - currentSpend) / daysRemaining : 0,
  };
}

/**
 * Evaluate forecast threshold rule
 */
export async function evaluateForecast(
  supabase: SupabaseClient,
  orgId: string,
  metric: string,
  threshold: number,
  confidenceLevel: number,
  alertDaysBefore: number | undefined,
  ruleId: string
): Promise<AlertTrigger | null> {
  const forecast = await getMonthlyForecast(supabase, orgId);

  if (!forecast) return null;

  // Check if forecast exceeds threshold
  const projectedExceeds = forecast.projectedSpend > threshold;

  // Check confidence level
  const confidenceThreshold =
    forecast.confidenceInterval.low +
    (forecast.confidenceInterval.high - forecast.confidenceInterval.low) * (1 - confidenceLevel);
  const confidenceExceeds = confidenceThreshold > threshold;

  if (!projectedExceeds && !confidenceExceeds) {
    return null;
  }

  // Check if within alert window
  if (alertDaysBefore && forecast.estimatedBreachDate) {
    const daysUntilBreach = Math.ceil(
      (forecast.estimatedBreachDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    if (daysUntilBreach > alertDaysBefore) {
      return null;
    }
  }

  return {
    ruleId,
    type: "forecast_exceeded",
    severity: forecast.projectedUtilization > 120 ? "critical" : "warning",
    currentValue: forecast.projectedSpend,
    thresholdValue: threshold,
    message: `Monthly spend projected to reach $${forecast.projectedSpend.toLocaleString()} (${forecast.projectedUtilization.toFixed(0)}% of $${threshold.toLocaleString()} threshold)`,
    context: {
      projectedSpend: forecast.projectedSpend,
      threshold,
      projectedUtilization: forecast.projectedUtilization,
      confidenceInterval: forecast.confidenceInterval,
      estimatedBreachDate: forecast.estimatedBreachDate,
      daysRemaining: forecast.daysRemaining,
      currentDailyBurnRate: forecast.dailyBurnRate,
      requiredDailyRate: forecast.requiredDailyRate,
    },
    triggeredAt: new Date(),
  };
}

// ============================================================================
// FORECASTING METHODS
// ============================================================================

/**
 * Simple linear extrapolation
 */
function linearForecast(
  dailySpends: number[],
  daysRemaining: number,
  currentSpend: number
): ForecastResult {
  if (dailySpends.length === 0) {
    return { method: "linear", projectedSpend: currentSpend };
  }

  const avgDaily = dailySpends.reduce((a, b) => a + b, 0) / dailySpends.length;
  const projectedSpend = currentSpend + avgDaily * daysRemaining;

  return { method: "linear", projectedSpend };
}

/**
 * Weighted moving average (recent days weighted more)
 */
function weightedAverageForecast(
  dailySpends: number[],
  daysRemaining: number,
  currentSpend: number
): ForecastResult {
  if (dailySpends.length === 0) {
    return { method: "weighted_average", projectedSpend: currentSpend };
  }

  // Assign weights: recent days get higher weights
  let weightSum = 0;
  let weightedSum = 0;

  dailySpends.forEach((spend, i) => {
    const weight = i + 1; // Linear weights
    weightedSum += spend * weight;
    weightSum += weight;
  });

  const weightedAvg = weightedSum / weightSum;
  const projectedSpend = currentSpend + weightedAvg * daysRemaining;

  return { method: "weighted_average", projectedSpend };
}

/**
 * Exponential smoothing (Holt-Winters without seasonality)
 */
function exponentialSmoothingForecast(
  dailySpends: number[],
  daysRemaining: number,
  currentSpend: number
): ForecastResult {
  if (dailySpends.length < 2) {
    return { method: "exponential_smoothing", projectedSpend: currentSpend };
  }

  const alpha = 0.3; // Level smoothing
  const beta = 0.1; // Trend smoothing

  // Initialize
  let level = dailySpends[0];
  let trend = dailySpends[1] - dailySpends[0];

  // Apply exponential smoothing
  for (let i = 1; i < dailySpends.length; i++) {
    const prevLevel = level;
    level = alpha * dailySpends[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  // Forecast
  const forecastDaily = level + trend;
  const projectedSpend = currentSpend + forecastDaily * daysRemaining;

  return { method: "exponential_smoothing", projectedSpend };
}

/**
 * Trend-adjusted forecast using linear regression
 */
function trendAdjustedForecast(
  dailySpends: number[],
  daysRemaining: number,
  currentSpend: number
): ForecastResult {
  if (dailySpends.length < 3) {
    return { method: "trend_adjusted", projectedSpend: currentSpend };
  }

  // Simple linear regression
  const n = dailySpends.length;
  const xMean = (n - 1) / 2;
  const yMean = dailySpends.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  dailySpends.forEach((y, x) => {
    numerator += (x - xMean) * (y - yMean);
    denominator += Math.pow(x - xMean, 2);
  });

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Project remaining days with trend
  let projectedRemaining = 0;
  for (let d = 0; d < daysRemaining; d++) {
    projectedRemaining += intercept + slope * (n + d);
  }

  // Ensure non-negative
  projectedRemaining = Math.max(0, projectedRemaining);
  const projectedSpend = currentSpend + projectedRemaining;

  return { method: "trend_adjusted", projectedSpend };
}

/**
 * Estimate when budget will be breached
 */
function estimateBreachDate(
  dailySpends: number[],
  currentSpend: number,
  budgetAmount: number,
  periodEnd: Date
): Date | null {
  if (currentSpend >= budgetAmount) {
    return new Date(); // Already breached
  }

  if (dailySpends.length === 0) {
    return null;
  }

  // Use weighted average for daily burn
  const recentDays = dailySpends.slice(-7);
  const weights = recentDays.map((_, i) => i + 1);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const weightedDaily = recentDays.reduce((sum, spend, i) => sum + spend * weights[i], 0) / weightSum;

  if (weightedDaily <= 0) {
    return null; // No spend, won't breach
  }

  const remaining = budgetAmount - currentSpend;
  const daysUntilBreach = Math.ceil(remaining / weightedDaily);

  const breachDate = new Date(Date.now() + daysUntilBreach * 24 * 60 * 60 * 1000);

  // Only return if before period end
  return breachDate <= periodEnd ? breachDate : null;
}

/**
 * Get monthly spending forecast
 */
async function getMonthlyForecast(
  supabase: SupabaseClient,
  orgId: string
): Promise<BudgetForecast | null> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get current month spend
  const { data: currentData } = await supabase
    .from("usage_records")
    .select("cost")
    .eq("organization_id", orgId)
    .gte("timestamp", monthStart.toISOString())
    .lte("timestamp", now.toISOString());

  const currentSpend = currentData?.reduce((sum, r) => sum + (r.cost || 0), 0) ?? 0;

  // Get daily spend history
  const dailySpends = await getDailySpendHistory(supabase, orgId, monthStart, now);

  const totalDays = monthEnd.getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = totalDays - daysElapsed;

  // Calculate forecasts
  const forecasts = [
    linearForecast(dailySpends, daysRemaining, currentSpend),
    weightedAverageForecast(dailySpends, daysRemaining, currentSpend),
    exponentialSmoothingForecast(dailySpends, daysRemaining, currentSpend),
    trendAdjustedForecast(dailySpends, daysRemaining, currentSpend),
  ];

  const projectedSpend = forecasts.reduce(
    (sum, f, i) => sum + f.projectedSpend * FORECAST_WEIGHTS[i],
    0
  );

  // Get previous month for comparison
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const { data: prevData } = await supabase
    .from("usage_records")
    .select("cost")
    .eq("organization_id", orgId)
    .gte("timestamp", prevMonthStart.toISOString())
    .lte("timestamp", prevMonthEnd.toISOString());

  const prevMonthSpend = prevData?.reduce((sum, r) => sum + (r.cost || 0), 0) ?? 0;
  const projectedUtilization = prevMonthSpend > 0 ? (projectedSpend / prevMonthSpend) * 100 : 100;

  // Calculate confidence interval
  const variance =
    forecasts.reduce((sum, f) => sum + Math.pow(f.projectedSpend - projectedSpend, 2), 0) /
    forecasts.length;
  const stdDev = Math.sqrt(variance);

  return {
    projectedSpend,
    projectedUtilization,
    confidenceInterval: {
      low: Math.max(currentSpend, projectedSpend - 1.96 * stdDev),
      high: projectedSpend + 1.96 * stdDev,
    },
    estimatedBreachDate: null,
    projectedOverage: 0,
    methodBreakdown: forecasts.map((f, i) => ({
      method: f.method,
      projection: f.projectedSpend,
      weight: FORECAST_WEIGHTS[i],
    })),
    daysRemaining,
    dailyBurnRate: currentSpend / Math.max(1, daysElapsed),
    requiredDailyRate: 0,
  };
}

/**
 * Get daily spending history
 */
async function getDailySpendHistory(
  supabase: SupabaseClient,
  orgId: string,
  startDate: Date,
  endDate: Date,
  costCenterId?: string
): Promise<number[]> {
  // Try RPC first
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_daily_spend_history", {
    p_org_id: orgId,
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  });

  if (!rpcError && rpcData) {
    return rpcData.map((d: { total_cost: number }) => d.total_cost);
  }

  // Fallback: manual query
  let query = supabase
    .from("usage_records")
    .select("cost, timestamp")
    .eq("organization_id", orgId)
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString());

  if (costCenterId) {
    query = query.eq("cost_center_id", costCenterId);
  }

  const { data: records } = await query;

  if (!records) return [];

  // Aggregate by day
  const byDay = new Map<string, number>();
  for (const record of records) {
    const day = record.timestamp.split("T")[0];
    byDay.set(day, (byDay.get(day) || 0) + (record.cost || 0));
  }

  // Return sorted by date
  return Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, cost]) => cost);
}
