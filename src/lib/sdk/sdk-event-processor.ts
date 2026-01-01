/**
 * SDK Event Processor
 * Processes SDK telemetry events and triggers alerts/budget checks
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface SDKEvent {
  org_id: string;
  request_id: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  feature?: string;
  team_id?: string;
  project_id?: string;
  cost_center_id?: string;
  is_error: boolean;
  timestamp: string;
}

interface AlertConfig {
  id: string;
  type: string;
  threshold: number;
  scope: string;
  scope_id?: string;
  enabled: boolean;
}

export class SDKEventProcessor {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Process a batch of SDK events
   */
  async processEvents(events: SDKEvent[]): Promise<void> {
    if (events.length === 0) return;

    const orgId = events[0].org_id;

    // Aggregate event data
    const aggregated = this.aggregateEvents(events);

    // Run checks in parallel
    await Promise.all([
      this.checkAlerts(orgId, aggregated),
      this.checkBudgets(orgId, aggregated),
    ]);
  }

  /**
   * Aggregate events for analysis
   */
  private aggregateEvents(events: SDKEvent[]) {
    const result = {
      totalCost: 0,
      totalTokens: 0,
      requestCount: events.length,
      errorCount: 0,
      byFeature: {} as Record<string, { cost: number; count: number }>,
      byTeam: {} as Record<string, { cost: number; count: number }>,
      byProject: {} as Record<string, { cost: number; count: number }>,
      byModel: {} as Record<string, { cost: number; count: number }>,
    };

    for (const event of events) {
      const cost = event.input_cost + event.output_cost;
      result.totalCost += cost;
      result.totalTokens += event.input_tokens + event.output_tokens;

      if (event.is_error) {
        result.errorCount++;
      }

      // By feature
      if (event.feature) {
        if (!result.byFeature[event.feature]) {
          result.byFeature[event.feature] = { cost: 0, count: 0 };
        }
        result.byFeature[event.feature].cost += cost;
        result.byFeature[event.feature].count++;
      }

      // By team
      if (event.team_id) {
        if (!result.byTeam[event.team_id]) {
          result.byTeam[event.team_id] = { cost: 0, count: 0 };
        }
        result.byTeam[event.team_id].cost += cost;
        result.byTeam[event.team_id].count++;
      }

      // By project
      if (event.project_id) {
        if (!result.byProject[event.project_id]) {
          result.byProject[event.project_id] = { cost: 0, count: 0 };
        }
        result.byProject[event.project_id].cost += cost;
        result.byProject[event.project_id].count++;
      }

      // By model
      if (!result.byModel[event.model]) {
        result.byModel[event.model] = { cost: 0, count: 0 };
      }
      result.byModel[event.model].cost += cost;
      result.byModel[event.model].count++;
    }

    return result;
  }

  /**
   * Check alerts for the organization
   */
  private async checkAlerts(
    orgId: string,
    data: ReturnType<typeof this.aggregateEvents>
  ): Promise<void> {
    // Fetch active alerts
    const { data: alerts } = await this.supabase
      .from("alerts")
      .select("*")
      .eq("organization_id", orgId)
      .eq("enabled", true);

    if (!alerts?.length) return;

    for (const alert of alerts) {
      const triggered = await this.evaluateAlert(alert, data);

      if (triggered) {
        await this.triggerAlert(orgId, alert, data);
      }
    }
  }

  /**
   * Evaluate if an alert should trigger
   */
  private async evaluateAlert(
    alert: AlertConfig,
    data: ReturnType<typeof this.aggregateEvents>
  ): Promise<boolean> {
    // Check cooldown
    const cooldownKey = `alert_cooldown:${alert.id}`;
    const { data: cooldown } = await this.supabase
      .from("alert_cooldowns")
      .select("expires_at")
      .eq("alert_id", alert.id)
      .single();

    if (cooldown && new Date(cooldown.expires_at) > new Date()) {
      return false;
    }

    switch (alert.type) {
      case "spend_threshold":
        return this.evaluateSpendThreshold(alert, data);

      case "error_rate":
        return this.evaluateErrorRate(alert, data);

      case "usage_spike":
        return await this.evaluateUsageSpike(alert, data);

      default:
        return false;
    }
  }

  /**
   * Evaluate spend threshold alert
   */
  private evaluateSpendThreshold(
    alert: AlertConfig,
    data: ReturnType<typeof this.aggregateEvents>
  ): boolean {
    const threshold = alert.threshold;

    switch (alert.scope) {
      case "total":
        return data.totalCost >= threshold;

      case "feature":
        if (alert.scope_id && data.byFeature[alert.scope_id]) {
          return data.byFeature[alert.scope_id].cost >= threshold;
        }
        return false;

      case "team":
        if (alert.scope_id && data.byTeam[alert.scope_id]) {
          return data.byTeam[alert.scope_id].cost >= threshold;
        }
        return false;

      case "model":
        if (alert.scope_id && data.byModel[alert.scope_id]) {
          return data.byModel[alert.scope_id].cost >= threshold;
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Evaluate error rate alert
   */
  private evaluateErrorRate(
    alert: AlertConfig,
    data: ReturnType<typeof this.aggregateEvents>
  ): boolean {
    if (data.requestCount === 0) return false;

    const errorRate = (data.errorCount / data.requestCount) * 100;
    return errorRate >= alert.threshold;
  }

  /**
   * Evaluate usage spike alert
   */
  private async evaluateUsageSpike(
    alert: AlertConfig,
    data: ReturnType<typeof this.aggregateEvents>
  ): Promise<boolean> {
    // Get historical average for comparison
    const { data: historical } = await this.supabase
      .from("sdk_usage_hourly")
      .select("total_cost, request_count")
      .eq("org_id", alert.scope_id)
      .gte("hour", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(168); // 7 days of hourly data

    if (!historical?.length) return false;

    const avgCost = historical.reduce((sum, h) => sum + Number(h.total_cost), 0) / historical.length;
    const threshold = avgCost * (1 + alert.threshold / 100); // threshold is percentage above average

    return data.totalCost >= threshold;
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(
    orgId: string,
    alert: AlertConfig,
    data: ReturnType<typeof this.aggregateEvents>
  ): Promise<void> {
    // Create alert event
    await this.supabase.from("alert_events").insert({
      organization_id: orgId,
      alert_id: alert.id,
      triggered_at: new Date().toISOString(),
      data: {
        totalCost: data.totalCost,
        requestCount: data.requestCount,
        errorCount: data.errorCount,
      },
    });

    // Set cooldown (1 hour default)
    await this.supabase.from("alert_cooldowns").upsert({
      alert_id: alert.id,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    // Create notification
    await this.supabase.from("notifications").insert({
      organization_id: orgId,
      type: "alert",
      title: `Alert: ${alert.type}`,
      message: this.formatAlertMessage(alert, data),
      priority: "high",
      data: { alert_id: alert.id },
    });

    console.log(`[SDK Event Processor] Alert triggered: ${alert.id}`);
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(
    alert: AlertConfig,
    data: ReturnType<typeof this.aggregateEvents>
  ): string {
    switch (alert.type) {
      case "spend_threshold":
        return `Spend threshold of $${alert.threshold.toFixed(2)} exceeded. Current spend: $${data.totalCost.toFixed(4)}`;

      case "error_rate":
        const errorRate = (data.errorCount / data.requestCount) * 100;
        return `Error rate of ${errorRate.toFixed(1)}% exceeds threshold of ${alert.threshold}%`;

      case "usage_spike":
        return `Usage spike detected. Current cost: $${data.totalCost.toFixed(4)}`;

      default:
        return `Alert triggered: ${alert.type}`;
    }
  }

  /**
   * Check budgets for the organization
   */
  private async checkBudgets(
    orgId: string,
    data: ReturnType<typeof this.aggregateEvents>
  ): Promise<void> {
    // Fetch active budgets
    const { data: budgets } = await this.supabase
      .from("budgets")
      .select("*")
      .eq("organization_id", orgId)
      .eq("status", "active");

    if (!budgets?.length) return;

    for (const budget of budgets) {
      await this.checkBudget(orgId, budget, data);
    }
  }

  /**
   * Check a single budget
   */
  private async checkBudget(
    orgId: string,
    budget: {
      id: string;
      name: string;
      amount: number;
      period: string;
      scope_type: string;
      scope_id?: string;
      alert_thresholds: number[];
    },
    data: ReturnType<typeof this.aggregateEvents>
  ): Promise<void> {
    // Get current spend for this budget period
    const periodStart = this.getPeriodStart(budget.period);

    const { data: usage } = await this.supabase
      .from("sdk_usage_records")
      .select("input_cost, output_cost")
      .eq("org_id", orgId)
      .gte("timestamp", periodStart.toISOString())
      .maybeSingle();

    // Calculate total spend including current batch
    let currentSpend = data.totalCost;
    if (usage) {
      // Add historical spend from this period
      const { data: periodUsage } = await this.supabase
        .rpc("sum_sdk_costs", {
          p_org_id: orgId,
          p_start_date: periodStart.toISOString(),
        });

      if (periodUsage) {
        currentSpend += Number(periodUsage);
      }
    }

    const percentUsed = (currentSpend / budget.amount) * 100;

    // Check thresholds
    for (const threshold of budget.alert_thresholds || [50, 80, 100]) {
      if (percentUsed >= threshold) {
        await this.createBudgetAlert(orgId, budget, percentUsed, threshold);
      }
    }
  }

  /**
   * Get period start date
   */
  private getPeriodStart(period: string): Date {
    const now = new Date();

    switch (period) {
      case "daily":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());

      case "weekly":
        const dayOfWeek = now.getDay();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);

      case "monthly":
        return new Date(now.getFullYear(), now.getMonth(), 1);

      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);

      case "yearly":
        return new Date(now.getFullYear(), 0, 1);

      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  /**
   * Create budget alert notification
   */
  private async createBudgetAlert(
    orgId: string,
    budget: { id: string; name: string; amount: number },
    percentUsed: number,
    threshold: number
  ): Promise<void> {
    // Check if we already sent this threshold alert
    const { data: existing } = await this.supabase
      .from("budget_alerts")
      .select("id")
      .eq("budget_id", budget.id)
      .eq("threshold", threshold)
      .gte("created_at", this.getPeriodStart("monthly").toISOString())
      .single();

    if (existing) return;

    // Record the alert
    await this.supabase.from("budget_alerts").insert({
      budget_id: budget.id,
      threshold,
      percent_used: percentUsed,
    });

    // Create notification
    await this.supabase.from("notifications").insert({
      organization_id: orgId,
      type: "budget",
      title: `Budget Alert: ${budget.name}`,
      message: `Budget "${budget.name}" has reached ${percentUsed.toFixed(1)}% of $${budget.amount.toFixed(2)} limit`,
      priority: threshold >= 100 ? "critical" : threshold >= 80 ? "high" : "medium",
      data: { budget_id: budget.id, threshold, percent_used: percentUsed },
    });

    console.log(`[SDK Event Processor] Budget alert: ${budget.name} at ${percentUsed.toFixed(1)}%`);
  }
}

// Singleton instance
let instance: SDKEventProcessor | null = null;

export function getSDKEventProcessor(): SDKEventProcessor {
  if (!instance) {
    instance = new SDKEventProcessor();
  }
  return instance;
}
