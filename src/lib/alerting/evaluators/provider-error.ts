/**
 * TokenTRA Alerting Engine - Provider Error Evaluator
 * 
 * Evaluates provider error rate alert rules.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlertRule, AlertTrigger, ProviderErrorConfig } from "../types";
import { getWindowStart, groupBy, countBy, getErrorRateSeverity } from "../utils";

/**
 * Evaluate a provider error rule
 */
export async function evaluateProviderError(
  supabase: SupabaseClient,
  rule: AlertRule,
  orgId: string
): Promise<AlertTrigger | null> {
  const config = rule.config as ProviderErrorConfig;
  const windowStart = getWindowStart(config.timeWindow);

  // Query requests with error info
  let query = supabase
    .from("usage_records")
    .select("provider, status, error_code, timestamp")
    .eq("organization_id", orgId)
    .gte("timestamp", windowStart.toISOString());

  if (config.provider) {
    query = query.eq("provider", config.provider);
  }

  const { data: requests, error } = await query;

  if (error) {
    console.error("[ProviderErrorEvaluator] Error querying requests:", error);
    return null;
  }

  if (!requests || requests.length === 0) {
    return null;
  }

  // Group by provider and calculate error rates
  const byProvider = groupBy(requests, "provider");

  for (const [provider, providerRequests] of Object.entries(byProvider)) {
    const total = providerRequests.length;
    
    // Filter errors based on config
    const errors = providerRequests.filter((r) => {
      // Check if it's an error status
      const isError = r.status === "error" || 
                      (r.status && parseInt(r.status) >= 400) ||
                      r.error_code;
      
      if (!isError) return false;

      // If specific error types are configured, filter by them
      if (config.errorTypes && config.errorTypes.length > 0) {
        const errorType = mapErrorCode(r.error_code || r.status);
        return config.errorTypes.includes(errorType as typeof config.errorTypes[number]);
      }

      return true;
    });

    const errorCount = errors.length;
    const errorRate = (errorCount / total) * 100;

    // Check thresholds
    const rateExceeded = errorRate > config.errorRateThreshold;
    const countExceeded =
      config.errorCountThreshold && errorCount > config.errorCountThreshold;

    if (rateExceeded || countExceeded) {
      // Get error breakdown
      const errorBreakdown = countBy(
        errors.map((e) => ({ type: mapErrorCode(e.error_code || e.status) })),
        "type"
      );

      // Get recent errors for context
      const recentErrors = errors.slice(0, 5).map((e) => ({
        type: mapErrorCode(e.error_code || e.status),
        timestamp: e.timestamp,
      }));

      return {
        ruleId: rule.id,
        type: "provider_error",
        severity: getErrorRateSeverity(errorRate),
        currentValue: errorRate,
        thresholdValue: config.errorRateThreshold,
        message: `${provider} error rate is ${errorRate.toFixed(1)}% (${errorCount}/${total} requests)`,
        context: {
          provider,
          errorRate,
          errorCount,
          totalRequests: total,
          errorBreakdown,
          timeWindow: config.timeWindow,
          recentErrors,
        },
        triggeredAt: new Date(),
      };
    }
  }

  return null;
}

/**
 * Map error codes to error types
 */
function mapErrorCode(
  code: string | number | null | undefined
): "rate_limit" | "timeout" | "server_error" | "auth_error" | "unknown" {
  if (!code) return "unknown";

  const codeStr = String(code).toLowerCase();

  // Rate limit errors
  if (codeStr === "429" || codeStr.includes("rate") || codeStr.includes("limit")) {
    return "rate_limit";
  }

  // Timeout errors
  if (codeStr === "408" || codeStr.includes("timeout") || codeStr.includes("timed")) {
    return "timeout";
  }

  // Auth errors
  if (codeStr === "401" || codeStr === "403" || codeStr.includes("auth") || codeStr.includes("unauthorized")) {
    return "auth_error";
  }

  // Server errors (5xx)
  if (codeStr.startsWith("5") || codeStr.includes("server") || codeStr.includes("internal")) {
    return "server_error";
  }

  return "unknown";
}
