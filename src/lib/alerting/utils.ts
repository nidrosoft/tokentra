/**
 * TokenTRA Alerting Engine - Utility Functions
 * 
 * Common helper functions used across the alerting system.
 */

import type { AlertSeverity, TimeWindow, AlertType } from "./types";

// ============================================================================
// TIME WINDOW UTILITIES
// ============================================================================

/**
 * Get the start date for a given time window
 */
export function getWindowStart(window: TimeWindow | string): Date {
  const now = new Date();
  switch (window) {
    case "1m":
      return new Date(now.getTime() - 60 * 1000);
    case "5m":
      return new Date(now.getTime() - 5 * 60 * 1000);
    case "15m":
      return new Date(now.getTime() - 15 * 60 * 1000);
    case "1h":
      return new Date(now.getTime() - 60 * 60 * 1000);
    case "4h":
      return new Date(now.getTime() - 4 * 60 * 60 * 1000);
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 60 * 60 * 1000);
  }
}

/**
 * Get the number of minutes in a time window
 */
export function getWindowMinutes(window: TimeWindow | string): number {
  switch (window) {
    case "1m":
      return 1;
    case "5m":
      return 5;
    case "15m":
      return 15;
    case "1h":
      return 60;
    case "4h":
      return 240;
    case "24h":
      return 1440;
    case "7d":
      return 10080;
    case "30d":
      return 43200;
    default:
      return 60;
  }
}

/**
 * Get the number of days in a period string
 */
export function getPeriodDays(period: string): number {
  switch (period) {
    case "7d":
      return 7;
    case "14d":
      return 14;
    case "30d":
      return 30;
    case "60d":
      return 60;
    case "90d":
      return 90;
    default:
      return 14;
  }
}

// ============================================================================
// CONDITION EVALUATION
// ============================================================================

/**
 * Evaluate a condition with an operator
 */
export function evaluateCondition(
  value: number,
  operator: string,
  threshold: number
): boolean {
  switch (operator) {
    case "gt":
      return value > threshold;
    case "gte":
      return value >= threshold;
    case "lt":
      return value < threshold;
    case "lte":
      return value <= threshold;
    case "eq":
      return value === threshold;
    default:
      return false;
  }
}

// ============================================================================
// SEVERITY CALCULATION
// ============================================================================

/**
 * Calculate severity based on spend ratio
 */
export function calculateSpendSeverity(
  current: number,
  threshold: number
): AlertSeverity {
  const ratio = current / threshold;
  if (ratio >= 2.0) return "critical";
  if (ratio >= 1.5) return "warning";
  return "info";
}

/**
 * Calculate severity based on budget utilization
 */
export function getBudgetSeverity(utilization: number): AlertSeverity {
  if (utilization >= 100) return "critical";
  if (utilization >= 90) return "warning";
  return "info";
}

/**
 * Calculate severity based on anomaly deviation score
 */
export function getAnomalySeverity(deviationScore: number): AlertSeverity {
  const absScore = Math.abs(deviationScore);
  if (absScore >= 4) return "critical";
  if (absScore >= 3) return "warning";
  return "info";
}

/**
 * Calculate severity based on error rate
 */
export function getErrorRateSeverity(errorRate: number): AlertSeverity {
  if (errorRate > 20) return "critical";
  if (errorRate > 10) return "warning";
  return "info";
}

// ============================================================================
// MESSAGE FORMATTING
// ============================================================================

/**
 * Format a spend threshold message
 */
export function formatSpendMessage(
  metric: string,
  current: number,
  threshold: number
): string {
  const metricLabel = metric.replace(/_/g, " ");
  return `${metricLabel} of $${current.toFixed(2)} exceeded $${threshold} threshold`;
}

/**
 * Generate alert title based on type
 */
export function generateAlertTitle(
  type: AlertType,
  context?: Record<string, unknown>
): string {
  switch (type) {
    case "spend_threshold":
      return "Spending threshold exceeded";
    case "budget_threshold":
      return `Budget ${context?.budgetName || ""} at ${(context?.currentValue as number)?.toFixed(0) || "?"}%`;
    case "spend_anomaly":
      return "Unusual spending detected";
    case "forecast_exceeded":
      return "Forecast exceeds threshold";
    case "provider_error":
      return `${context?.provider || "Provider"} error rate elevated`;
    case "usage_spike":
      return "Usage spike detected";
    default:
      return "Alert triggered";
  }
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get days elapsed since a date
 */
export function getDaysElapsed(startDate: string | Date): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Get days remaining until a date
 */
export function getDaysRemaining(endDate: string | Date): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  );
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Group an array by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const value = String(item[key]);
      (groups[value] = groups[value] || []).push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Count occurrences by a key
 */
export function countBy<T>(array: T[], key: keyof T): Record<string, number> {
  return array.reduce(
    (counts, item) => {
      const value = String(item[key]);
      counts[value] = (counts[value] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>
  );
}

/**
 * Get top N items from a count object
 */
export function getTopN(
  counts: Record<string, number>,
  n: number
): Array<{ name: string; count: number }> {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

// ============================================================================
// STATISTICAL UTILITIES
// ============================================================================

/**
 * Calculate mean of an array
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(values: number[], mean?: number): number {
  if (values.length === 0) return 0;
  const m = mean ?? calculateMean(values);
  const variance =
    values.reduce((sq, v) => sq + Math.pow(v - m, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate median of an array
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  return n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
}

/**
 * Calculate Median Absolute Deviation (MAD)
 */
export function calculateMAD(values: number[], median?: number): number {
  if (values.length === 0) return 0;
  const m = median ?? calculateMedian(values);
  const deviations = values.map((v) => Math.abs(v - m)).sort((a, b) => a - b);
  return calculateMedian(deviations);
}

/**
 * Calculate quartiles (Q1 and Q3)
 */
export function calculateQuartiles(values: number[]): { q1: number; q3: number } {
  if (values.length === 0) return { q1: 0, q3: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  return {
    q1: sorted[Math.floor(n * 0.25)],
    q3: sorted[Math.floor(n * 0.75)],
  };
}

// ============================================================================
// SENSITIVITY THRESHOLDS
// ============================================================================

/**
 * Z-score thresholds for anomaly detection sensitivity levels
 */
export const SENSITIVITY_THRESHOLDS = {
  low: 3.0, // 99.7% - Only extreme outliers
  medium: 2.5, // 98.7% - Significant deviations
  high: 2.0, // 95.4% - More sensitive
} as const;

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatNumber(value: number): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}
