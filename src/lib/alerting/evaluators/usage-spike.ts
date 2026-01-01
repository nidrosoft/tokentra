/**
 * TokenTRA Alerting Engine - Usage Spike Evaluator
 * 
 * Evaluates usage spike alert rules against request volume.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlertRule, AlertTrigger, UsageSpikeConfig } from "../types";
import { getWindowStart, getWindowMinutes, countBy, getTopN } from "../utils";

/**
 * Evaluate a usage spike rule
 */
export async function evaluateUsageSpike(
  supabase: SupabaseClient,
  rule: AlertRule,
  orgId: string
): Promise<AlertTrigger | null> {
  const config = rule.config as UsageSpikeConfig;
  const windowStart = getWindowStart(config.timeWindow);

  // Query request counts
  let query = supabase
    .from("usage_records")
    .select("timestamp, input_tokens, output_tokens, provider, model")
    .eq("organization_id", orgId)
    .gte("timestamp", windowStart.toISOString());

  // Apply filters
  if (config.filters?.providers?.length) {
    query = query.in("provider", config.filters.providers);
  }
  if (config.filters?.models?.length) {
    query = query.in("model", config.filters.models);
  }
  if (config.filters?.endpoints?.length) {
    query = query.in("endpoint", config.filters.endpoints);
  }

  const { data: records, error } = await query;

  if (error) {
    console.error("[UsageSpikeEvaluator] Error querying usage:", error);
    return null;
  }

  if (!records || records.length === 0) {
    return null;
  }

  // Calculate metric
  const windowMinutes = getWindowMinutes(config.timeWindow);
  let currentValue: number;

  switch (config.metric) {
    case "requests_per_minute":
      currentValue = records.length / windowMinutes;
      break;
    case "tokens_per_minute":
      const totalTokens = records.reduce(
        (sum, r) => sum + (r.input_tokens || 0) + (r.output_tokens || 0),
        0
      );
      currentValue = totalTokens / windowMinutes;
      break;
    case "requests_per_hour":
      currentValue = (records.length / windowMinutes) * 60;
      break;
    default:
      return null;
  }

  // Check absolute threshold
  if (currentValue > config.threshold) {
    const modelCounts = countBy(records, "model");
    const providerCounts = countBy(records, "provider");

    return {
      ruleId: rule.id,
      type: "usage_spike",
      severity: currentValue > config.threshold * 2 ? "critical" : "warning",
      currentValue,
      thresholdValue: config.threshold,
      message: `${config.metric.replace(/_/g, " ")} spiked to ${currentValue.toFixed(0)} (threshold: ${config.threshold})`,
      context: {
        metric: config.metric,
        timeWindow: config.timeWindow,
        requestCount: records.length,
        topModels: getTopN(modelCounts, 3),
        topProviders: getTopN(providerCounts, 3),
      },
      triggeredAt: new Date(),
    };
  }

  // Check spike multiplier (if baseline exists)
  if (config.spikeMultiplier) {
    const baseline = await getUsageBaseline(supabase, orgId, config.metric);
    
    if (baseline && currentValue > baseline * config.spikeMultiplier) {
      return {
        ruleId: rule.id,
        type: "usage_spike",
        severity: "warning",
        currentValue,
        thresholdValue: baseline * config.spikeMultiplier,
        message: `${config.metric.replace(/_/g, " ")} is ${(currentValue / baseline).toFixed(1)}x above normal`,
        context: {
          metric: config.metric,
          baseline,
          multiplier: currentValue / baseline,
          timeWindow: config.timeWindow,
        },
        triggeredAt: new Date(),
      };
    }
  }

  return null;
}

/**
 * Get usage baseline for a metric
 */
async function getUsageBaseline(
  supabase: SupabaseClient,
  orgId: string,
  metric: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from("usage_baselines")
    .select("value")
    .eq("organization_id", orgId)
    .eq("metric", metric)
    .single();

  if (error || !data) {
    return null;
  }

  return data.value;
}
