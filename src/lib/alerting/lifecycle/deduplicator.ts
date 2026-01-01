/**
 * TokenTRA Alerting Engine - Alert Deduplicator
 * 
 * Prevents alert fatigue by:
 * - Checking cooldown periods between alerts
 * - Rate limiting alerts per hour
 * - Detecting duplicate alerts
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlertTrigger, AlertRule } from "../types";

/**
 * Check if an alert trigger is a duplicate
 */
export async function isDuplicate(
  supabase: SupabaseClient,
  trigger: AlertTrigger,
  rule: AlertRule
): Promise<boolean> {
  // Check cooldown
  if (rule.cooldownMinutes) {
    const inCooldown = await isInCooldown(supabase, rule);
    if (inCooldown) {
      console.log(`[Deduplicator] Rule ${rule.id} is in cooldown`);
      return true;
    }
  }

  // Check rate limit
  if (rule.maxAlertsPerHour) {
    const rateLimited = await isRateLimited(supabase, rule);
    if (rateLimited) {
      console.log(`[Deduplicator] Rule ${rule.id} is rate limited`);
      return true;
    }
  }

  // Check for similar active alerts
  const hasSimilar = await hasSimilarActiveAlert(supabase, trigger, rule);
  if (hasSimilar) {
    console.log(`[Deduplicator] Similar active alert exists for rule ${rule.id}`);
    return true;
  }

  return false;
}

/**
 * Check if rule is in cooldown period
 */
export async function isInCooldown(
  supabase: SupabaseClient,
  rule: AlertRule
): Promise<boolean> {
  if (!rule.cooldownMinutes) return false;

  const cooldownStart = new Date(Date.now() - rule.cooldownMinutes * 60 * 1000);

  const { data: recentAlerts } = await supabase
    .from("alerts")
    .select("id")
    .eq("rule_id", rule.id)
    .gte("triggered_at", cooldownStart.toISOString())
    .limit(1);

  return (recentAlerts?.length ?? 0) > 0;
}

/**
 * Check if rule has exceeded hourly rate limit
 */
export async function isRateLimited(
  supabase: SupabaseClient,
  rule: AlertRule
): Promise<boolean> {
  if (!rule.maxAlertsPerHour) return false;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const { count } = await supabase
    .from("alerts")
    .select("id", { count: "exact", head: true })
    .eq("rule_id", rule.id)
    .gte("triggered_at", oneHourAgo.toISOString());

  return (count ?? 0) >= rule.maxAlertsPerHour;
}

/**
 * Check if there's a similar active alert
 */
export async function hasSimilarActiveAlert(
  supabase: SupabaseClient,
  trigger: AlertTrigger,
  rule: AlertRule
): Promise<boolean> {
  const { data: activeAlerts } = await supabase
    .from("alerts")
    .select("id, current_value")
    .eq("rule_id", rule.id)
    .eq("status", "active")
    .limit(5);

  if (!activeAlerts || activeAlerts.length === 0) {
    return false;
  }

  // Check if any active alert has similar value (within 5%)
  for (const alert of activeAlerts) {
    const valueDiff = Math.abs(alert.current_value - trigger.currentValue);
    const percentDiff = valueDiff / Math.max(alert.current_value, 1);
    
    if (percentDiff < 0.05) {
      return true;
    }
  }

  return false;
}

/**
 * Record that an alert was sent (for deduplication tracking)
 */
export async function recordAlert(
  supabase: SupabaseClient,
  trigger: AlertTrigger
): Promise<void> {
  // The alert is already recorded when created in the alerts table
  // This function can be used for additional tracking if needed
  console.log(`[Deduplicator] Recorded alert for rule ${trigger.ruleId}`);
}

/**
 * Check if a rule is within its active schedule
 */
export function isRuleActive(rule: AlertRule): boolean {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentDay = now.getUTCDay();

  // Check active hours
  if (rule.activeHours) {
    const { start, end } = rule.activeHours;
    if (start <= end) {
      // Normal range (e.g., 9-17)
      if (currentHour < start || currentHour >= end) return false;
    } else {
      // Spans midnight (e.g., 22-6)
      if (currentHour < start && currentHour >= end) return false;
    }
  }

  // Check active days
  if (rule.activeDays && rule.activeDays.length > 0) {
    if (!rule.activeDays.includes(currentDay)) {
      return false;
    }
  }

  return true;
}
