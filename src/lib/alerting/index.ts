/**
 * TokenTRA Alerting Engine
 * 
 * Enterprise-grade cost intelligence alert system.
 * 
 * Features:
 * - 6 alert types: spend_threshold, budget_threshold, spend_anomaly,
 *   forecast_exceeded, provider_error, usage_spike
 * - Multi-algorithm anomaly detection (Z-Score, IQR, MAD, Seasonal)
 * - Budget forecasting with ensemble methods
 * - Multi-channel notifications (Email, Slack, PagerDuty, Webhook)
 * - Alert lifecycle management (acknowledge, snooze, resolve)
 * - Smart deduplication and rate limiting
 * 
 * @example
 * ```typescript
 * import { createAlertEngine } from '@/lib/alerting';
 * import { getSupabaseAdmin } from '@/lib/supabase/admin';
 * 
 * const supabase = getSupabaseAdmin();
 * const engine = createAlertEngine(supabase);
 * 
 * // Evaluate all rules for an organization
 * await engine.evaluateOrganization('org_123');
 * ```
 */

// Main engine
export { AlertEngine, createAlertEngine } from "./engine";

// Types
export type {
  AlertType,
  AlertSeverity,
  AlertStatus,
  AlertOperator,
  TimeWindow,
  BaselinePeriod,
  AnomalySensitivity,
  NotificationChannelType,
  AlertFilters,
  SpendThresholdConfig,
  BudgetThresholdConfig,
  SpendAnomalyConfig,
  ForecastExceededConfig,
  ProviderErrorConfig,
  UsageSpikeConfig,
  AlertRuleConfig,
  EmailChannelConfig,
  SlackChannelConfig,
  PagerDutyChannelConfig,
  WebhookChannelConfig,
  NotificationChannelConfig,
  NotificationChannel,
  AlertRule,
  AlertTrigger,
  Alert,
  NotificationRecord,
  AlertAction,
  BaselineStats,
  AnomalyDetection,
  ForecastResult,
  BudgetForecast,
  NotificationResult,
  CostContributor,
  Budget,
} from "./types";

// Evaluators
export {
  evaluateSpendThreshold,
  evaluateBudgetThreshold,
  evaluateProviderError,
  evaluateUsageSpike,
} from "./evaluators";

// Detectors
export { detectSpendAnomaly, forecastBudget, evaluateForecast } from "./detectors";

// Notifications
export { sendNotification } from "./notifications";

// Lifecycle
export {
  acknowledgeAlert,
  snoozeAlert,
  resolveAlert,
  checkAutoResolution,
  processSnoozedAlerts,
  getAlertTimeline,
  isDuplicate,
  isInCooldown,
  isRateLimited,
  isRuleActive,
} from "./lifecycle";

export type { SnoozeDuration, ResolutionType } from "./lifecycle";

// Utilities
export {
  getWindowStart,
  getWindowMinutes,
  getPeriodDays,
  evaluateCondition,
  calculateSpendSeverity,
  getBudgetSeverity,
  getAnomalySeverity,
  getErrorRateSeverity,
  formatSpendMessage,
  generateAlertTitle,
  getDaysElapsed,
  getDaysRemaining,
  groupBy,
  countBy,
  getTopN,
  calculateMean,
  calculateStdDev,
  calculateMedian,
  calculateMAD,
  calculateQuartiles,
  SENSITIVITY_THRESHOLDS,
  formatCurrency,
  formatPercentage,
  formatNumber,
} from "./utils";
