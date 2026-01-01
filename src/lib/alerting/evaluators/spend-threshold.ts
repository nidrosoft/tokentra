/**
 * TokenTRA Alerting Engine - Spend Threshold Evaluator
 * 
 * Evaluates spend threshold alert rules against usage data.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AlertRule,
  AlertTrigger,
  SpendThresholdConfig,
  CostContributor,
} from "../types";
import {
  getWindowStart,
  evaluateCondition,
  calculateSpendSeverity,
  formatSpendMessage,
} from "../utils";

/**
 * Evaluate a spend threshold rule
 */
export async function evaluateSpendThreshold(
  supabase: SupabaseClient,
  rule: AlertRule,
  orgId: string
): Promise<AlertTrigger | null> {
  const config = rule.config as SpendThresholdConfig;
  const windowStart = getWindowStart(config.timeWindow);

  // Build query
  let query = supabase
    .from("usage_records")
    .select("cost")
    .eq("organization_id", orgId)
    .gte("timestamp", windowStart.toISOString());

  // Apply filters
  if (config.filters?.providers?.length) {
    query = query.in("provider", config.filters.providers);
  }
  if (config.filters?.models?.length) {
    query = query.in("model", config.filters.models);
  }
  if (config.filters?.costCenters?.length) {
    query = query.in("cost_center_id", config.filters.costCenters);
  }
  if (config.filters?.teams?.length) {
    query = query.in("team_id", config.filters.teams);
  }
  if (config.filters?.projects?.length) {
    query = query.in("project_id", config.filters.projects);
  }

  const { data: records, error } = await query;

  if (error) {
    console.error("[SpendThresholdEvaluator] Error querying spend:", error);
    return null;
  }

  const totalCost = records?.reduce((sum, r) => sum + (r.cost || 0), 0) ?? 0;

  // Evaluate condition
  if (!evaluateCondition(totalCost, config.operator, config.threshold)) {
    return null;
  }

  // Get top contributors for context
  const topContributors = await getTopCostContributors(
    supabase,
    orgId,
    windowStart
  );

  return {
    ruleId: rule.id,
    type: "spend_threshold",
    severity: calculateSpendSeverity(totalCost, config.threshold),
    currentValue: totalCost,
    thresholdValue: config.threshold,
    message: formatSpendMessage(config.metric, totalCost, config.threshold),
    context: {
      metric: config.metric,
      timeWindow: config.timeWindow,
      topContributors,
      filters: config.filters,
    },
    triggeredAt: new Date(),
  };
}

/**
 * Get top cost contributors for context
 */
async function getTopCostContributors(
  supabase: SupabaseClient,
  orgId: string,
  since: Date,
  limit: number = 5
): Promise<CostContributor[]> {
  // Try to use RPC function if available
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_top_cost_contributors",
    {
      p_org_id: orgId,
      p_since: since.toISOString(),
      p_limit: limit,
    }
  );

  if (!rpcError && rpcData) {
    return rpcData;
  }

  // Fallback: manual query
  const { data: records } = await supabase
    .from("usage_records")
    .select("model, cost")
    .eq("organization_id", orgId)
    .gte("timestamp", since.toISOString());

  if (!records || records.length === 0) {
    return [];
  }

  // Aggregate by model
  const byModel = new Map<string, number>();
  let totalCost = 0;

  for (const record of records) {
    const model = record.model || "Unknown";
    const cost = record.cost || 0;
    byModel.set(model, (byModel.get(model) || 0) + cost);
    totalCost += cost;
  }

  // Sort and return top N
  return Array.from(byModel.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, cost]) => ({
      name,
      cost,
      percentage: totalCost > 0 ? Math.round((cost / totalCost) * 1000) / 10 : 0,
    }));
}
