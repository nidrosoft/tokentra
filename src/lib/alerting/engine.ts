/**
 * TokenTRA Alerting Engine - Main Engine
 * 
 * The core orchestrator that:
 * - Evaluates all alert rules for an organization
 * - Delegates to specific evaluators based on rule type
 * - Processes triggers and creates alerts
 * - Sends notifications through configured channels
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlertRule, AlertTrigger, Alert, Budget, BudgetForecast } from "./types";
import {
  evaluateSpendThreshold,
  evaluateBudgetThreshold,
  evaluateProviderError,
  evaluateUsageSpike,
} from "./evaluators";
import { detectSpendAnomaly, forecastBudget, evaluateForecast } from "./detectors";
import { sendNotification } from "./notifications";
import { isDuplicate, recordAlert, isRuleActive } from "./lifecycle";
import { generateAlertTitle } from "./utils";

/**
 * Main Alert Engine class
 */
export class AlertEngine {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Evaluate all active rules for an organization
   * Called by background job every 1-5 minutes
   */
  async evaluateOrganization(orgId: string): Promise<void> {
    console.log(`[AlertEngine] Evaluating org: ${orgId}`);

    // Get all enabled rules
    const { data: rules, error } = await this.supabase
      .from("alert_rules")
      .select("*")
      .eq("organization_id", orgId)
      .eq("enabled", true);

    if (error) {
      console.error("[AlertEngine] Error fetching rules:", error);
      return;
    }

    if (!rules || rules.length === 0) {
      console.log(`[AlertEngine] No active rules for org: ${orgId}`);
      return;
    }

    // Evaluate each rule
    const triggers: AlertTrigger[] = [];

    for (const dbRule of rules) {
      const rule = this.mapRuleFromDb(dbRule);

      // Check if rule is within active hours/days
      if (!isRuleActive(rule)) {
        continue;
      }

      try {
        const trigger = await this.evaluateRule(rule, orgId);
        if (trigger) {
          triggers.push(trigger);
        }
      } catch (error) {
        console.error(`[AlertEngine] Error evaluating rule ${rule.id}:`, error);
      }
    }

    // Process triggers
    for (const trigger of triggers) {
      await this.processTrigger(trigger, orgId);
    }

    console.log(`[AlertEngine] Completed evaluation for org: ${orgId}, triggers: ${triggers.length}`);
  }

  /**
   * Evaluate a single rule
   */
  async evaluateRule(rule: AlertRule, orgId: string): Promise<AlertTrigger | null> {
    switch (rule.type) {
      case "spend_threshold":
        return evaluateSpendThreshold(this.supabase, rule, orgId);

      case "budget_threshold":
        return evaluateBudgetThreshold(
          this.supabase,
          rule,
          orgId,
          (budget: Budget, currentSpend: number) =>
            forecastBudget(this.supabase, budget, currentSpend)
        );

      case "spend_anomaly":
        const anomalyConfig = rule.config as {
          metric: string;
          sensitivity: "low" | "medium" | "high";
          timeWindow: string;
          baselinePeriod: string;
          filters?: Record<string, string[]>;
        };
        return detectSpendAnomaly(
          this.supabase,
          orgId,
          anomalyConfig.metric,
          anomalyConfig.sensitivity,
          anomalyConfig.timeWindow,
          anomalyConfig.baselinePeriod,
          anomalyConfig.filters,
          rule.id
        );

      case "forecast_exceeded":
        const forecastConfig = rule.config as {
          metric: string;
          threshold: number;
          confidenceLevel: number;
          alertDaysBefore?: number;
        };
        return evaluateForecast(
          this.supabase,
          orgId,
          forecastConfig.metric,
          forecastConfig.threshold,
          forecastConfig.confidenceLevel,
          forecastConfig.alertDaysBefore,
          rule.id
        );

      case "provider_error":
        return evaluateProviderError(this.supabase, rule, orgId);

      case "usage_spike":
        return evaluateUsageSpike(this.supabase, rule, orgId);

      default:
        console.warn(`[AlertEngine] Unknown rule type: ${rule.type}`);
        return null;
    }
  }

  /**
   * Process a trigger - check deduplication, create alert, send notifications
   */
  private async processTrigger(trigger: AlertTrigger, orgId: string): Promise<void> {
    // Get rule for deduplication and notification config
    const { data: dbRule } = await this.supabase
      .from("alert_rules")
      .select("*")
      .eq("id", trigger.ruleId)
      .single();

    if (!dbRule) {
      console.warn(`[AlertEngine] Rule not found: ${trigger.ruleId}`);
      return;
    }

    const rule = this.mapRuleFromDb(dbRule);

    // Check for deduplication
    const duplicate = await isDuplicate(this.supabase, trigger, rule);
    if (duplicate) {
      console.log(`[AlertEngine] Skipping duplicate alert for rule ${trigger.ruleId}`);
      return;
    }

    // Create alert record
    const alertId = crypto.randomUUID();
    const alert: Partial<Alert> = {
      id: alertId,
      orgId,
      ruleId: trigger.ruleId,
      type: trigger.type,
      severity: trigger.severity,
      status: "active",
      title: generateAlertTitle(trigger.type, trigger.context),
      description: trigger.message,
      currentValue: trigger.currentValue,
      thresholdValue: trigger.thresholdValue,
      context: trigger.context,
      triggeredAt: trigger.triggeredAt || new Date(),
      notificationsSent: [],
    };

    // Save to database
    const { data: savedAlert, error } = await this.supabase
      .from("triggered_alerts")
      .insert({
        id: alert.id,
        organization_id: alert.orgId,
        rule_id: alert.ruleId,
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
        title: alert.title,
        description: alert.description,
        current_value: alert.currentValue,
        threshold_value: alert.thresholdValue,
        context: alert.context,
        triggered_at: alert.triggeredAt?.toISOString(),
        notifications_sent: [],
      })
      .select()
      .single();

    if (error) {
      console.error("[AlertEngine] Error saving alert:", error);
      return;
    }

    // Update deduplication cache
    await recordAlert(this.supabase, trigger);

    // Send notifications
    await this.sendNotifications(this.mapAlertFromDb(savedAlert), rule);

    // Emit real-time event
    await this.emitAlertEvent(orgId, savedAlert);

    console.log(`[AlertEngine] Alert created: ${savedAlert.id} - ${savedAlert.title}`);
  }

  /**
   * Send notifications through all configured channels
   */
  private async sendNotifications(alert: Alert, rule: AlertRule): Promise<void> {
    const channels = rule.channels.filter((ch) => {
      if (!ch.enabled) return false;
      if (ch.severityFilter && !ch.severityFilter.includes(alert.severity)) return false;
      return true;
    });

    const results = await Promise.allSettled(
      channels.map((channel) => sendNotification(channel, alert))
    );

    // Record notification results
    const notificationRecords = results.map((result, i) => ({
      channel: channels[i].type,
      sentAt: new Date().toISOString(),
      success: result.status === "fulfilled" && result.value.success,
      error:
        result.status === "rejected"
          ? result.reason?.message
          : result.status === "fulfilled" && !result.value.success
            ? result.value.error
            : undefined,
      messageId:
        result.status === "fulfilled" && result.value.success
          ? result.value.messageId
          : undefined,
    }));

    // Update alert with notification records
    await this.supabase
      .from("alerts")
      .update({ notifications_sent: notificationRecords })
      .eq("id", alert.id);
  }

  /**
   * Emit real-time alert event via Supabase Realtime
   */
  private async emitAlertEvent(orgId: string, alert: Record<string, unknown>): Promise<void> {
    try {
      await this.supabase.channel(`alerts:${orgId}`).send({
        type: "broadcast",
        event: "new_alert",
        payload: alert,
      });
    } catch (error) {
      console.error("[AlertEngine] Error emitting alert event:", error);
    }
  }

  /**
   * Map database rule to AlertRule type
   */
  private mapRuleFromDb(dbRule: Record<string, unknown>): AlertRule {
    return {
      id: dbRule.id as string,
      orgId: dbRule.organization_id as string,
      name: dbRule.name as string,
      description: dbRule.description as string | undefined,
      type: dbRule.type as AlertRule["type"],
      enabled: dbRule.enabled as boolean,
      config: dbRule.config as AlertRule["config"],
      channels: (dbRule.channels as AlertRule["channels"]) || [],
      cooldownMinutes: dbRule.cooldown_minutes as number | undefined,
      maxAlertsPerHour: dbRule.max_alerts_per_hour as number | undefined,
      activeHours: dbRule.active_hours as AlertRule["activeHours"],
      activeDays: dbRule.active_days as number[] | undefined,
      createdAt: new Date(dbRule.created_at as string),
      updatedAt: new Date(dbRule.updated_at as string),
      createdBy: dbRule.created_by as string | undefined,
    };
  }

  /**
   * Map database alert to Alert type
   */
  private mapAlertFromDb(dbAlert: Record<string, unknown>): Alert {
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
      acknowledgedAt: dbAlert.acknowledged_at
        ? new Date(dbAlert.acknowledged_at as string)
        : undefined,
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
}

/**
 * Create an AlertEngine instance with Supabase client
 */
export function createAlertEngine(supabase: SupabaseClient): AlertEngine {
  return new AlertEngine(supabase);
}
