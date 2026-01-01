/**
 * TokenTRA Alerting Engine - Budget Threshold Evaluator
 * 
 * Evaluates budget threshold alert rules against budget utilization.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AlertRule,
  AlertTrigger,
  BudgetThresholdConfig,
  Budget,
  BudgetForecast,
} from "../types";
import { getBudgetSeverity, getDaysRemaining, getDaysElapsed } from "../utils";

/**
 * Evaluate a budget threshold rule
 */
export async function evaluateBudgetThreshold(
  supabase: SupabaseClient,
  rule: AlertRule,
  orgId: string,
  forecastBudget?: (budget: Budget, currentSpend: number) => Promise<BudgetForecast>
): Promise<AlertTrigger | null> {
  const config = rule.config as BudgetThresholdConfig;

  // Get budget
  const { data: budget, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("id", config.budgetId)
    .single();

  if (error || !budget) {
    console.warn(
      `[BudgetThresholdEvaluator] Budget not found: ${config.budgetId}`
    );
    return null;
  }

  // Calculate current spend for budget period
  const currentSpend = await calculateBudgetSpend(supabase, budget);
  const utilizationPercent = (currentSpend / budget.amount) * 100;

  // Check threshold
  if (utilizationPercent >= config.thresholdPercent) {
    const dailyBurnRate = await calculateDailyBurnRate(
      supabase,
      budget,
      currentSpend
    );

    return {
      ruleId: rule.id,
      type: "budget_threshold",
      severity: getBudgetSeverity(utilizationPercent),
      currentValue: utilizationPercent,
      thresholdValue: config.thresholdPercent,
      message: `${budget.name} has reached ${utilizationPercent.toFixed(1)}% utilization ($${currentSpend.toLocaleString()} of $${budget.amount.toLocaleString()})`,
      context: {
        budgetId: budget.id,
        budgetName: budget.name,
        budgetAmount: budget.amount,
        currentSpend,
        remainingBudget: budget.amount - currentSpend,
        daysRemaining: getDaysRemaining(budget.period_end),
        dailyBurnRate,
      },
      triggeredAt: new Date(),
    };
  }

  // Check forecast if enabled
  if (config.includeForecasted && forecastBudget) {
    const budgetObj: Budget = {
      id: budget.id,
      orgId: budget.organization_id,
      name: budget.name,
      amount: budget.amount,
      periodStart: new Date(budget.period_start),
      periodEnd: new Date(budget.period_end),
      costCenterId: budget.cost_center_id,
      teamId: budget.team_id,
      projectId: budget.project_id,
    };

    const forecast = await forecastBudget(budgetObj, currentSpend);

    if (forecast.projectedUtilization >= config.thresholdPercent) {
      return {
        ruleId: rule.id,
        type: "forecast_exceeded",
        severity: "warning",
        currentValue: utilizationPercent,
        thresholdValue: config.thresholdPercent,
        message: `${budget.name} is projected to reach ${forecast.projectedUtilization.toFixed(1)}% by ${forecast.estimatedBreachDate?.toLocaleDateString() || "end of period"}`,
        context: {
          budgetName: budget.name,
          budgetAmount: budget.amount,
          currentSpend,
          currentUtilization: utilizationPercent,
          projectedUtilization: forecast.projectedUtilization,
          estimatedBreachDate: forecast.estimatedBreachDate,
          daysRemaining: getDaysRemaining(budget.period_end),
        },
        triggeredAt: new Date(),
      };
    }
  }

  return null;
}

/**
 * Calculate current spend for a budget period
 */
async function calculateBudgetSpend(
  supabase: SupabaseClient,
  budget: {
    organization_id: string;
    period_start: string;
    period_end: string;
    cost_center_id?: string;
    team_id?: string;
    project_id?: string;
  }
): Promise<number> {
  let query = supabase
    .from("usage_records")
    .select("cost")
    .eq("organization_id", budget.organization_id)
    .gte("timestamp", budget.period_start)
    .lte("timestamp", budget.period_end);

  // Apply budget scope filters
  if (budget.cost_center_id) {
    query = query.eq("cost_center_id", budget.cost_center_id);
  }
  if (budget.team_id) {
    query = query.eq("team_id", budget.team_id);
  }
  if (budget.project_id) {
    query = query.eq("project_id", budget.project_id);
  }

  const { data } = await query;
  return data?.reduce((sum, r) => sum + (r.cost || 0), 0) ?? 0;
}

/**
 * Calculate daily burn rate for a budget
 */
async function calculateDailyBurnRate(
  supabase: SupabaseClient,
  budget: { period_start: string },
  currentSpend: number
): Promise<number> {
  const daysElapsed = Math.max(1, getDaysElapsed(budget.period_start));
  return currentSpend / daysElapsed;
}
