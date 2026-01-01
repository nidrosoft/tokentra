/**
 * TokenTRA Alerting Engine - Core Types
 * 
 * Defines all TypeScript interfaces and types for the alerting system.
 * Keep this file as the single source of truth for alert-related types.
 */

// ============================================================================
// ALERT TYPES
// ============================================================================

export type AlertType =
  | "spend_threshold"
  | "budget_threshold"
  | "spend_anomaly"
  | "forecast_exceeded"
  | "provider_error"
  | "usage_spike";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertStatus = "active" | "acknowledged" | "resolved" | "snoozed";

export type AlertOperator = "gt" | "gte" | "lt" | "lte" | "eq";

export type TimeWindow = "1m" | "5m" | "15m" | "1h" | "4h" | "24h" | "7d" | "30d";

export type BaselinePeriod = "7d" | "14d" | "30d" | "60d";

export type AnomalySensitivity = "low" | "medium" | "high";

export type NotificationChannelType = "email" | "slack" | "pagerduty" | "webhook" | "teams" | "datadog" | "jira";

// ============================================================================
// ALERT RULE CONFIGURATIONS
// ============================================================================

export interface AlertFilters {
  providers?: string[];
  models?: string[];
  costCenters?: string[];
  teams?: string[];
  projects?: string[];
  endpoints?: string[];
}

export interface SpendThresholdConfig {
  type: "spend_threshold";
  metric: "daily_cost" | "hourly_cost" | "weekly_cost" | "monthly_cost";
  operator: AlertOperator;
  threshold: number;
  timeWindow: TimeWindow;
  filters?: AlertFilters;
}

export interface BudgetThresholdConfig {
  type: "budget_threshold";
  budgetId: string;
  thresholdPercent: number;
  includeForecasted?: boolean;
}

export interface SpendAnomalyConfig {
  type: "spend_anomaly";
  metric: "hourly_cost" | "daily_cost" | "request_cost";
  sensitivity: AnomalySensitivity;
  timeWindow: "1h" | "4h" | "24h";
  baselinePeriod: BaselinePeriod;
  filters?: AlertFilters;
}

export interface ForecastExceededConfig {
  type: "forecast_exceeded";
  metric: "monthly_forecast" | "quarterly_forecast";
  threshold: number;
  confidenceLevel: 0.8 | 0.9 | 0.95;
  alertDaysBefore?: number;
}

export interface ProviderErrorConfig {
  type: "provider_error";
  provider?: string;
  errorRateThreshold: number;
  errorCountThreshold?: number;
  timeWindow: "5m" | "15m" | "1h";
  errorTypes?: ("rate_limit" | "timeout" | "server_error" | "auth_error")[];
}

export interface UsageSpikeConfig {
  type: "usage_spike";
  metric: "requests_per_minute" | "tokens_per_minute" | "requests_per_hour";
  threshold: number;
  spikeMultiplier?: number;
  timeWindow: "1m" | "5m" | "15m" | "1h";
  filters?: AlertFilters;
}

export type AlertRuleConfig =
  | SpendThresholdConfig
  | BudgetThresholdConfig
  | SpendAnomalyConfig
  | ForecastExceededConfig
  | ProviderErrorConfig
  | UsageSpikeConfig;

// ============================================================================
// NOTIFICATION CHANNELS
// ============================================================================

export interface EmailChannelConfig {
  recipients: string[];
}

export interface SlackChannelConfig {
  webhookUrl: string;
  channel?: string;
}

export interface PagerDutyChannelConfig {
  integrationKey: string;
  allSeverities?: boolean;
}

export interface WebhookChannelConfig {
  url: string;
  secret?: string;
  headers?: Record<string, string>;
}

export interface TeamsChannelConfig {
  webhookUrl: string;
}

export interface DatadogChannelConfig {
  apiKey: string;
  site?: string; // e.g., "datadoghq.com", "datadoghq.eu"
  sendMetrics?: boolean;
  sendEvents?: boolean;
}

export interface JiraChannelConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  issueType?: string;
  priority?: string;
}

export type NotificationChannelConfig =
  | EmailChannelConfig
  | SlackChannelConfig
  | PagerDutyChannelConfig
  | WebhookChannelConfig
  | TeamsChannelConfig
  | DatadogChannelConfig
  | JiraChannelConfig;

export interface NotificationChannel {
  type: NotificationChannelType;
  config: NotificationChannelConfig;
  enabled: boolean;
  severityFilter?: AlertSeverity[];
}

// ============================================================================
// ALERT RULE
// ============================================================================

export interface AlertRule {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  type: AlertType;
  enabled: boolean;
  config: AlertRuleConfig;
  channels: NotificationChannel[];
  
  // Rate limiting
  cooldownMinutes?: number;
  maxAlertsPerHour?: number;
  
  // Scheduling
  activeHours?: { start: number; end: number };
  activeDays?: number[]; // 0-6 (Sunday-Saturday)
  
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// ============================================================================
// ALERT TRIGGER & ALERT
// ============================================================================

export interface AlertTrigger {
  ruleId: string;
  type: AlertType;
  severity: AlertSeverity;
  currentValue: number;
  thresholdValue: number;
  message: string;
  context: Record<string, unknown>;
  triggeredAt?: Date;
}

export interface Alert {
  id: string;
  orgId: string;
  ruleId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  currentValue: number;
  thresholdValue: number;
  context: Record<string, unknown>;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  acknowledgmentNote?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionType?: "manual" | "auto_cleared" | "false_positive";
  resolutionNote?: string;
  snoozedUntil?: Date;
  snoozedBy?: string;
  notificationsSent: NotificationRecord[];
  createdAt: Date;
}

export interface NotificationRecord {
  channel: NotificationChannelType;
  sentAt: Date;
  success: boolean;
  error?: string;
  messageId?: string;
}

// ============================================================================
// ALERT ACTIONS & TIMELINE
// ============================================================================

export interface AlertAction {
  id: string;
  alertId: string;
  action: "triggered" | "acknowledged" | "snoozed" | "resolved" | "escalated" | "notification_sent";
  userId?: string;
  details?: string;
  createdAt: Date;
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

export interface BaselineStats {
  mean: number;
  stdDev: number;
  median: number;
  mad: number; // Median Absolute Deviation
  q1: number;
  q3: number;
  min: number;
  max: number;
  dataPoints: number;
}

export interface AnomalyDetection {
  method: "z_score" | "iqr" | "mad" | "seasonal";
  isAnomaly: boolean;
  deviationScore: number;
  threshold: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// FORECASTING
// ============================================================================

export interface ForecastResult {
  method: string;
  projectedSpend: number;
}

export interface BudgetForecast {
  projectedSpend: number;
  projectedUtilization: number;
  confidenceInterval: {
    low: number;
    high: number;
  };
  estimatedBreachDate: Date | null;
  projectedOverage: number;
  methodBreakdown: Array<{
    method: string;
    projection: number;
    weight: number;
  }>;
  daysRemaining: number;
  dailyBurnRate: number;
  requiredDailyRate: number;
}

// ============================================================================
// NOTIFICATION RESULTS
// ============================================================================

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
  reason?: string;
}

// ============================================================================
// COST CONTRIBUTOR
// ============================================================================

export interface CostContributor {
  name: string;
  cost: number;
  percentage: number;
}

// ============================================================================
// BUDGET
// ============================================================================

export interface Budget {
  id: string;
  orgId: string;
  name: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  costCenterId?: string;
  teamId?: string;
  projectId?: string;
}
