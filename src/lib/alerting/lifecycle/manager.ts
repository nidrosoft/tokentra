/**
 * TokenTRA Alerting Engine - Alert Lifecycle Manager
 * 
 * Manages alert state transitions:
 * - Active → Acknowledged → Resolved
 * - Active → Snoozed → Active (re-triggered) or Resolved
 * 
 * Also handles auto-resolution and snooze expiration.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Alert, AlertAction } from "../types";

export type SnoozeDuration = "15m" | "1h" | "4h" | "24h" | "custom";
export type ResolutionType = "manual" | "auto_cleared" | "false_positive";

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(
  supabase: SupabaseClient,
  alertId: string,
  userId: string,
  note?: string
): Promise<Alert> {
  const { data: alert, error } = await supabase
    .from("triggered_alerts")
    .update({
      status: "acknowledged",
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: userId,
      acknowledgment_note: note,
    })
    .eq("id", alertId)
    .eq("status", "active")
    .select()
    .single();

  if (error) throw error;

  // Log action
  await logAction(supabase, alertId, "acknowledged", userId, note);

  // Emit event
  await emitLifecycleEvent(supabase, alert.organization_id, alertId, "acknowledged");

  return mapAlertFromDb(alert);
}

/**
 * Snooze an alert
 */
export async function snoozeAlert(
  supabase: SupabaseClient,
  alertId: string,
  userId: string,
  duration: SnoozeDuration,
  customMinutes?: number
): Promise<Alert> {
  const snoozeMinutes = getSnoozeDuration(duration, customMinutes);
  const snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);

  const { data: alert, error } = await supabase
    .from("triggered_alerts")
    .update({
      status: "snoozed",
      snoozed_until: snoozeUntil.toISOString(),
      snoozed_by: userId,
    })
    .eq("id", alertId)
    .in("status", ["active", "acknowledged"])
    .select()
    .single();

  if (error) throw error;

  // Log action
  await logAction(
    supabase,
    alertId,
    "snoozed",
    userId,
    `Snoozed until ${snoozeUntil.toISOString()}`
  );

  return mapAlertFromDb(alert);
}

/**
 * Resolve an alert
 */
export async function resolveAlert(
  supabase: SupabaseClient,
  alertId: string,
  userId: string,
  resolution: ResolutionType,
  note?: string
): Promise<Alert> {
  const { data: alert, error } = await supabase
    .from("triggered_alerts")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
      resolution_type: resolution,
      resolution_note: note,
    })
    .eq("id", alertId)
    .in("status", ["active", "acknowledged", "snoozed"])
    .select()
    .single();

  if (error) throw error;

  // Log action
  await logAction(supabase, alertId, "resolved", userId, `${resolution}: ${note || ""}`);

  // Emit event
  await emitLifecycleEvent(supabase, alert.organization_id, alertId, "resolved");

  // If PagerDuty was notified, resolve the incident
  if (alert.notifications_sent?.some((n: { channel: string }) => n.channel === "pagerduty")) {
    await resolvePagerDutyIncident(alertId);
  }

  return mapAlertFromDb(alert);
}

/**
 * Check for auto-resolution
 * Called periodically to resolve alerts where condition has cleared
 */
export async function checkAutoResolution(
  supabase: SupabaseClient,
  orgId: string,
  evaluateCondition: (alert: Alert) => Promise<boolean>
): Promise<void> {
  // Get active/acknowledged alerts
  const { data: alerts } = await supabase
    .from("triggered_alerts")
    .select("*, alert_rules(*)")
    .eq("organization_id", orgId)
    .in("status", ["active", "acknowledged"])
    .gt("triggered_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (!alerts) return;

  for (const alert of alerts) {
    // Re-evaluate the condition
    const conditionStillMet = await evaluateCondition(mapAlertFromDb(alert));

    if (!conditionStillMet) {
      await resolveAlert(supabase, alert.id, "system", "auto_cleared", "Condition no longer met");
    }
  }
}

/**
 * Process snoozed alerts that have expired
 */
export async function processSnoozedAlerts(
  supabase: SupabaseClient,
  evaluateCondition: (alert: Alert) => Promise<boolean>,
  resendNotifications: (alert: Alert) => Promise<void>
): Promise<void> {
  const now = new Date().toISOString();

  // Get expired snoozed alerts
  const { data: alerts } = await supabase
    .from("triggered_alerts")
    .select("*, alert_rules(*)")
    .eq("status", "snoozed")
    .lte("snoozed_until", now);

  if (!alerts) return;

  for (const dbAlert of alerts) {
    const alert = mapAlertFromDb(dbAlert);
    
    // Check if condition is still met
    const conditionMet = await evaluateCondition(alert);

    if (conditionMet) {
      // Re-activate alert
      await supabase
        .from("triggered_alerts")
        .update({ status: "active", snoozed_until: null })
        .eq("id", alert.id);

      // Re-send notifications
      await resendNotifications(alert);
    } else {
      // Auto-resolve
      await resolveAlert(supabase, alert.id, "system", "auto_cleared", "Condition cleared during snooze");
    }
  }
}

/**
 * Get alert timeline/history
 */
export async function getAlertTimeline(
  supabase: SupabaseClient,
  alertId: string
): Promise<AlertAction[]> {
  const { data } = await supabase
    .from("alert_actions")
    .select("*")
    .eq("alert_id", alertId)
    .order("created_at", { ascending: true });

  return (data || []).map((action) => ({
    id: action.id,
    alertId: action.alert_id,
    action: action.action,
    userId: action.user_id,
    details: action.details,
    createdAt: new Date(action.created_at),
  }));
}

// ============================================================================
// HELPERS
// ============================================================================

function getSnoozeDuration(duration: SnoozeDuration, customMinutes?: number): number {
  switch (duration) {
    case "15m":
      return 15;
    case "1h":
      return 60;
    case "4h":
      return 240;
    case "24h":
      return 1440;
    case "custom":
      return customMinutes || 60;
    default:
      return 60;
  }
}

async function logAction(
  supabase: SupabaseClient,
  alertId: string,
  action: string,
  userId: string,
  details?: string
): Promise<void> {
  await supabase.from("alert_actions").insert({
    alert_id: alertId,
    action,
    user_id: userId,
    details,
    created_at: new Date().toISOString(),
  });
}

async function emitLifecycleEvent(
  supabase: SupabaseClient,
  orgId: string,
  alertId: string,
  event: string
): Promise<void> {
  try {
    await supabase.channel(`alerts:${orgId}`).send({
      type: "broadcast",
      event: `alert_${event}`,
      payload: { alertId, event, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("[AlertLifecycle] Error emitting event:", error);
  }
}

async function resolvePagerDutyIncident(alertId: string): Promise<void> {
  // TODO: Implement PagerDuty incident resolution
  console.log(`[AlertLifecycle] Would resolve PagerDuty incident for alert: ${alertId}`);
}

/**
 * Map database alert to Alert type
 */
function mapAlertFromDb(dbAlert: Record<string, unknown>): Alert {
  return {
    id: dbAlert.id as string,
    orgId: dbAlert.organization_id as string,
    ruleId: dbAlert.rule_id as string,
    type: dbAlert.type as Alert["type"],
    severity: dbAlert.severity as Alert["severity"],
    status: dbAlert.status as Alert["status"],
    title: dbAlert.title as string,
    description: dbAlert.description as string,
    currentValue: dbAlert.current_value as number,
    thresholdValue: dbAlert.threshold_value as number,
    context: (dbAlert.context as Record<string, unknown>) || {},
    triggeredAt: new Date(dbAlert.triggered_at as string),
    acknowledgedAt: dbAlert.acknowledged_at ? new Date(dbAlert.acknowledged_at as string) : undefined,
    acknowledgedBy: dbAlert.acknowledged_by as string | undefined,
    acknowledgmentNote: dbAlert.acknowledgment_note as string | undefined,
    resolvedAt: dbAlert.resolved_at ? new Date(dbAlert.resolved_at as string) : undefined,
    resolvedBy: dbAlert.resolved_by as string | undefined,
    resolutionType: dbAlert.resolution_type as Alert["resolutionType"],
    resolutionNote: dbAlert.resolution_note as string | undefined,
    snoozedUntil: dbAlert.snoozed_until ? new Date(dbAlert.snoozed_until as string) : undefined,
    snoozedBy: dbAlert.snoozed_by as string | undefined,
    notificationsSent: (dbAlert.notifications_sent as Alert["notificationsSent"]) || [],
    createdAt: new Date(dbAlert.created_at as string),
  };
}
