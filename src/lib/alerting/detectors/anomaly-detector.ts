/**
 * TokenTRA Alerting Engine - Anomaly Detector
 * 
 * Detects spending anomalies using multiple statistical methods:
 * - Z-Score detection
 * - IQR (Interquartile Range) detection
 * - MAD (Median Absolute Deviation) detection
 * - Seasonal deviation detection
 * 
 * Uses consensus voting: alerts only if 2+ methods detect anomaly.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AlertTrigger,
  BaselineStats,
  AnomalyDetection,
  AnomalySensitivity,
  AlertFilters,
} from "../types";
import {
  SENSITIVITY_THRESHOLDS,
  getPeriodDays,
  getWindowStart,
  getAnomalySeverity,
  calculateMean,
  calculateStdDev,
  calculateMedian,
  calculateMAD,
  calculateQuartiles,
} from "../utils";

/**
 * Detect spending anomalies using multiple algorithms
 */
export async function detectSpendAnomaly(
  supabase: SupabaseClient,
  orgId: string,
  metric: string,
  sensitivity: AnomalySensitivity,
  timeWindow: string,
  baselinePeriod: string,
  filters?: AlertFilters,
  ruleId?: string
): Promise<AlertTrigger | null> {
  // Get baseline data
  const baseline = await getBaseline(supabase, orgId, metric, baselinePeriod, filters);
  
  if (!baseline || baseline.dataPoints < 7) {
    // Not enough data for meaningful baseline
    return null;
  }

  // Get current value
  const currentValue = await getCurrentValue(supabase, orgId, metric, timeWindow, filters);

  // Run multiple detection algorithms
  const detections = await Promise.all([
    detectZScore(currentValue, baseline, sensitivity),
    detectIQR(currentValue, baseline),
    detectMAD(currentValue, baseline, sensitivity),
    detectSeasonalDeviation(supabase, orgId, metric, currentValue, filters),
  ]);

  // Consensus: alert if 2+ methods detect anomaly
  const anomalyCount = detections.filter((d) => d.isAnomaly).length;

  if (anomalyCount >= 2) {
    const primaryDetection = detections.find((d) => d.isAnomaly) || detections[0];

    return {
      ruleId: ruleId || "anomaly_detection",
      type: "spend_anomaly",
      severity: getAnomalySeverity(primaryDetection.deviationScore),
      currentValue,
      thresholdValue: baseline.mean,
      message: `${metric.replace(/_/g, " ")} of $${currentValue.toFixed(2)} is ${primaryDetection.deviationScore.toFixed(1)}σ above normal ($${baseline.mean.toFixed(2)})`,
      context: {
        metric,
        currentValue,
        baselineMean: baseline.mean,
        baselineStdDev: baseline.stdDev,
        deviationScore: primaryDetection.deviationScore,
        detectionMethods: detections.filter((d) => d.isAnomaly).map((d) => d.method),
        percentAboveNormal: (((currentValue - baseline.mean) / baseline.mean) * 100).toFixed(1),
        baselinePeriod,
        dataPoints: baseline.dataPoints,
      },
      triggeredAt: new Date(),
    };
  }

  return null;
}

/**
 * Z-Score Detection - Standard statistical method for outlier detection
 */
function detectZScore(
  currentValue: number,
  baseline: BaselineStats,
  sensitivity: AnomalySensitivity
): AnomalyDetection {
  const threshold = SENSITIVITY_THRESHOLDS[sensitivity];

  // Handle zero/near-zero standard deviation
  if (baseline.stdDev < 0.01) {
    const percentDiff = Math.abs(currentValue - baseline.mean) / Math.max(baseline.mean, 1);
    return {
      method: "z_score",
      isAnomaly: percentDiff > 0.5, // 50% deviation when no variance
      deviationScore: percentDiff * 10,
      threshold,
    };
  }

  const zScore = (currentValue - baseline.mean) / baseline.stdDev;

  return {
    method: "z_score",
    isAnomaly: Math.abs(zScore) > threshold,
    deviationScore: zScore,
    threshold,
  };
}

/**
 * IQR (Interquartile Range) Detection - Robust against outliers in baseline data
 */
function detectIQR(currentValue: number, baseline: BaselineStats): AnomalyDetection {
  const { q1, q3 } = baseline;
  const iqr = q3 - q1;

  // Tukey's fences: outliers are beyond 1.5 * IQR
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  // Extreme outliers: beyond 3 * IQR
  const extremeUpperFence = q3 + 3 * iqr;

  const isAnomaly = currentValue > upperFence || currentValue < lowerFence;
  const isExtreme = currentValue > extremeUpperFence;

  // Calculate deviation score relative to IQR
  let deviationScore = 0;
  if (currentValue > q3) {
    deviationScore = (currentValue - q3) / (iqr || 1);
  } else if (currentValue < q1) {
    deviationScore = (q1 - currentValue) / (iqr || 1);
  }

  return {
    method: "iqr",
    isAnomaly,
    deviationScore,
    threshold: 1.5,
    metadata: { isExtreme, upperFence, lowerFence },
  };
}

/**
 * MAD (Median Absolute Deviation) Detection - Even more robust for skewed distributions
 */
function detectMAD(
  currentValue: number,
  baseline: BaselineStats,
  sensitivity: AnomalySensitivity
): AnomalyDetection {
  const { median, mad } = baseline;

  // MAD threshold (similar to Z-score but using median)
  const madThreshold = SENSITIVITY_THRESHOLDS[sensitivity] * 1.4826; // Scale factor

  // Handle zero MAD
  if (mad < 0.01) {
    const percentDiff = Math.abs(currentValue - median) / Math.max(median, 1);
    return {
      method: "mad",
      isAnomaly: percentDiff > 0.5,
      deviationScore: percentDiff * 10,
      threshold: madThreshold,
    };
  }

  const modifiedZScore = (0.6745 * (currentValue - median)) / mad;

  return {
    method: "mad",
    isAnomaly: Math.abs(modifiedZScore) > madThreshold,
    deviationScore: modifiedZScore,
    threshold: madThreshold,
  };
}

/**
 * Seasonal Deviation Detection - Accounts for day-of-week and time-of-day patterns
 */
async function detectSeasonalDeviation(
  supabase: SupabaseClient,
  orgId: string,
  metric: string,
  currentValue: number,
  filters?: AlertFilters
): Promise<AnomalyDetection> {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const hourOfDay = now.getUTCHours();

  // Get historical data for same day/hour
  const { data: historicalData, error } = await supabase.rpc("get_seasonal_baseline", {
    p_org_id: orgId,
    p_metric: metric,
    p_day_of_week: dayOfWeek,
    p_hour_of_day: hourOfDay,
    p_weeks_back: 4,
  });

  if (error || !historicalData || historicalData.length < 3) {
    return {
      method: "seasonal",
      isAnomaly: false,
      deviationScore: 0,
      threshold: 2.0,
    };
  }

  const values = historicalData.map((d: { value: number }) => d.value);
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values, mean);

  const deviationScore = stdDev > 0.01 ? (currentValue - mean) / stdDev : 0;

  return {
    method: "seasonal",
    isAnomaly: Math.abs(deviationScore) > 2.5,
    deviationScore,
    threshold: 2.5,
    metadata: {
      dayOfWeek,
      hourOfDay,
      seasonalMean: mean,
      seasonalStdDev: stdDev,
    },
  };
}

/**
 * Get baseline statistics from historical data
 */
async function getBaseline(
  supabase: SupabaseClient,
  orgId: string,
  metric: string,
  period: string,
  filters?: AlertFilters
): Promise<BaselineStats | null> {
  const periodDays = getPeriodDays(period);
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  // Get aggregated data via RPC
  const { data, error } = await supabase.rpc("get_metric_baseline", {
    p_org_id: orgId,
    p_metric: metric,
    p_start_date: startDate.toISOString(),
    p_filters: filters || {},
  });

  if (error || !data || data.length === 0) {
    // Fallback: manual query
    return await getBaselineFallback(supabase, orgId, metric, startDate, filters);
  }

  const values = data.map((d: { value: number }) => d.value).sort((a: number, b: number) => a - b);
  return calculateBaselineStats(values);
}

/**
 * Fallback baseline calculation when RPC is not available
 */
async function getBaselineFallback(
  supabase: SupabaseClient,
  orgId: string,
  metric: string,
  startDate: Date,
  filters?: AlertFilters
): Promise<BaselineStats | null> {
  let query = supabase
    .from("usage_records")
    .select("cost, timestamp")
    .eq("organization_id", orgId)
    .gte("timestamp", startDate.toISOString());

  if (filters?.providers?.length) {
    query = query.in("provider", filters.providers);
  }
  if (filters?.models?.length) {
    query = query.in("model", filters.models);
  }

  const { data: records, error } = await query;

  if (error || !records || records.length < 7) {
    return null;
  }

  // Aggregate by day for daily_cost metric
  const byDay = new Map<string, number>();
  for (const record of records) {
    const day = record.timestamp.split("T")[0];
    byDay.set(day, (byDay.get(day) || 0) + (record.cost || 0));
  }

  const values = Array.from(byDay.values()).sort((a, b) => a - b);
  return calculateBaselineStats(values);
}

/**
 * Calculate baseline statistics from values array
 */
function calculateBaselineStats(values: number[]): BaselineStats | null {
  const n = values.length;
  if (n < 3) return null;

  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values, mean);
  const median = calculateMedian(values);
  const mad = calculateMAD(values, median);
  const { q1, q3 } = calculateQuartiles(values);

  return {
    mean,
    stdDev,
    median,
    mad,
    q1,
    q3,
    min: values[0],
    max: values[n - 1],
    dataPoints: n,
  };
}

/**
 * Get current metric value
 */
async function getCurrentValue(
  supabase: SupabaseClient,
  orgId: string,
  metric: string,
  timeWindow: string,
  filters?: AlertFilters
): Promise<number> {
  const windowStart = getWindowStart(timeWindow as "1h" | "4h" | "24h");

  let query = supabase
    .from("usage_records")
    .select("cost")
    .eq("organization_id", orgId)
    .gte("timestamp", windowStart.toISOString());

  if (filters?.providers?.length) {
    query = query.in("provider", filters.providers);
  }
  if (filters?.models?.length) {
    query = query.in("model", filters.models);
  }

  const { data } = await query;
  return data?.reduce((sum, r) => sum + (r.cost || 0), 0) ?? 0;
}
