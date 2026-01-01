# TokenTra Alerting Engine
## Enterprise-Grade Cost Intelligence Alert System

**Version 1.0 | December 2025**

---

## Executive Summary

The Alerting Engine is the nervous system of TokenTra—it detects anomalies, enforces budgets, predicts overruns, and ensures teams never get surprised by AI costs. This document provides the complete architecture for an enterprise-grade alerting system that scales from startups spending $5K/month to enterprises spending $1M+/month on AI tokens.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Alert Types & Detection Logic](#2-alert-types--detection-logic)
3. [Core Engine Implementation](#3-core-engine-implementation)
4. [Anomaly Detection Algorithms](#4-anomaly-detection-algorithms)
5. [Forecasting Engine](#5-forecasting-engine)
6. [Notification Delivery System](#6-notification-delivery-system)
7. [Alert Lifecycle Management](#7-alert-lifecycle-management)
8. [Database Schema](#8-database-schema)
9. [Background Jobs & Scheduling](#9-background-jobs--scheduling)
10. [Enterprise Features](#10-enterprise-features)
11. [TypeScript Implementation](#11-typescript-implementation)
12. [Integration Guide](#12-integration-guide)

---

## 1. Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ALERTING ENGINE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        DATA INGESTION LAYER                             │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │   Usage      │ │   Budget     │ │   Provider   │ │   Forecast   │   │ │
│  │  │   Stream     │ │   Stream     │ │   Health     │ │   Updates    │   │ │
│  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘   │ │
│  └─────────┼────────────────┼────────────────┼────────────────┼───────────┘ │
│            │                │                │                │              │
│            └────────────────┴────────────────┴────────────────┘              │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        DETECTION ENGINE                                 │ │
│  │                                                                         │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │  Threshold   │ │   Anomaly    │ │  Forecast    │ │    Rate      │   │ │
│  │  │  Evaluator   │ │  Detector    │ │  Predictor   │ │  Monitor     │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  │                                                                         │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │   Budget     │ │    Spike     │ │   Pattern    │ │  Correlation │   │ │
│  │  │   Tracker    │ │  Detector    │ │  Matcher     │ │   Engine     │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  └─────────────────────────────────┬──────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        ALERT PROCESSOR                                  │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │ Deduplication│ │  Severity    │ │  Escalation  │ │   Grouping   │   │ │
│  │  │    Engine    │ │  Calculator  │ │   Manager    │ │    Engine    │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  └─────────────────────────────────┬──────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      NOTIFICATION DELIVERY                              │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │ │
│  │  │  Email   │ │  Slack   │ │PagerDuty │ │ Webhook  │ │ In-App   │     │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Real-time** | Sub-minute detection for critical alerts |
| **Intelligent** | ML-powered anomaly detection, not just thresholds |
| **Reliable** | At-least-once delivery with retry logic |
| **Scalable** | Handle 1M+ events/day per organization |
| **Actionable** | Every alert includes context + recommended action |
| **Non-spammy** | Smart deduplication prevents alert fatigue |

---

## 2. Alert Types & Detection Logic

Based on your UI, TokenTra supports 6 core alert types:

### 2.1 Spend Threshold Alerts

**Purpose**: Notify when spending exceeds a fixed dollar amount within a time window.

```typescript
interface SpendThresholdRule {
  type: 'spend_threshold';
  metric: 'daily_cost' | 'hourly_cost' | 'weekly_cost' | 'monthly_cost';
  operator: 'gt' | 'gte' | 'lt' | 'lte';
  threshold: number;  // in dollars
  timeWindow: '1h' | '24h' | '7d' | '30d';
  
  // Optional filters
  filters?: {
    providers?: string[];      // ['openai', 'anthropic']
    models?: string[];         // ['gpt-4', 'claude-3-opus']
    costCenters?: string[];    // ['engineering', 'marketing']
    teams?: string[];
    projects?: string[];
  };
}

// Example: "When daily cost > $500 in 24h"
const highDailySpendRule: SpendThresholdRule = {
  type: 'spend_threshold',
  metric: 'daily_cost',
  operator: 'gt',
  threshold: 500,
  timeWindow: '24h'
};
```

**Detection Logic**:
```typescript
async function evaluateSpendThreshold(
  rule: SpendThresholdRule,
  orgId: string
): Promise<AlertTrigger | null> {
  const windowStart = getWindowStart(rule.timeWindow);
  
  // Query aggregated spend
  const { data: spend } = await supabase
    .from('usage_records')
    .select('cost')
    .eq('org_id', orgId)
    .gte('timestamp', windowStart)
    .match(buildFilters(rule.filters));
  
  const totalCost = spend?.reduce((sum, r) => sum + r.cost, 0) ?? 0;
  
  if (evaluateCondition(totalCost, rule.operator, rule.threshold)) {
    return {
      ruleId: rule.id,
      type: 'spend_threshold',
      severity: calculateSeverity(totalCost, rule.threshold),
      currentValue: totalCost,
      thresholdValue: rule.threshold,
      message: `Daily spend of $${totalCost.toFixed(2)} exceeded $${rule.threshold} threshold`,
      context: {
        timeWindow: rule.timeWindow,
        topContributors: await getTopCostContributors(orgId, windowStart)
      }
    };
  }
  
  return null;
}
```

### 2.2 Budget Threshold Alerts

**Purpose**: Notify when budget utilization reaches specified percentages.

```typescript
interface BudgetThresholdRule {
  type: 'budget_threshold';
  budgetId: string;           // Reference to budget record
  thresholdPercent: number;   // 80, 90, 100, 110, etc.
  
  // Optional: alert on projected breach
  includeForecasted?: boolean;
}

// Example: "When budget usage ≥ 90%"
const budget90Rule: BudgetThresholdRule = {
  type: 'budget_threshold',
  budgetId: 'budget_engineering_q1',
  thresholdPercent: 90,
  includeForecasted: true
};
```

**Detection Logic**:
```typescript
async function evaluateBudgetThreshold(
  rule: BudgetThresholdRule,
  orgId: string
): Promise<AlertTrigger | null> {
  // Get budget details
  const { data: budget } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', rule.budgetId)
    .single();
  
  if (!budget) return null;
  
  // Calculate current spend for budget period
  const currentSpend = await calculateBudgetSpend(budget);
  const utilizationPercent = (currentSpend / budget.amount) * 100;
  
  // Check current utilization
  if (utilizationPercent >= rule.thresholdPercent) {
    return {
      ruleId: rule.id,
      type: 'budget_threshold',
      severity: getSeverityFromUtilization(utilizationPercent),
      currentValue: utilizationPercent,
      thresholdValue: rule.thresholdPercent,
      message: `${budget.name} has reached ${utilizationPercent.toFixed(1)}% utilization ($${currentSpend.toFixed(2)} of $${budget.amount})`,
      context: {
        budgetName: budget.name,
        budgetAmount: budget.amount,
        currentSpend,
        remainingBudget: budget.amount - currentSpend,
        daysRemaining: getDaysRemainingInPeriod(budget),
        dailyBurnRate: currentSpend / getDaysElapsed(budget)
      }
    };
  }
  
  // Check forecasted breach (if enabled)
  if (rule.includeForecasted) {
    const forecast = await forecastBudgetSpend(budget, currentSpend);
    if (forecast.projectedUtilization >= rule.thresholdPercent) {
      return {
        ruleId: rule.id,
        type: 'budget_forecast',
        severity: 'warning',
        currentValue: utilizationPercent,
        thresholdValue: rule.thresholdPercent,
        message: `${budget.name} is projected to reach ${forecast.projectedUtilization.toFixed(1)}% by end of period`,
        context: {
          currentUtilization: utilizationPercent,
          projectedUtilization: forecast.projectedUtilization,
          projectedOverage: forecast.projectedOverage,
          breachDate: forecast.estimatedBreachDate
        }
      };
    }
  }
  
  return null;
}
```

### 2.3 Spending Anomaly Detection

**Purpose**: Detect unusual spending patterns using statistical methods.

```typescript
interface SpendAnomalyRule {
  type: 'spend_anomaly';
  metric: 'hourly_cost' | 'daily_cost' | 'request_cost';
  sensitivity: 'low' | 'medium' | 'high';  // Maps to Z-score thresholds
  timeWindow: '1h' | '4h' | '24h';
  baselinePeriod: '7d' | '14d' | '30d';    // Historical data for baseline
  
  // Optional filters
  filters?: {
    providers?: string[];
    models?: string[];
    costCenters?: string[];
  };
}

// Sensitivity to Z-score mapping
const SENSITIVITY_THRESHOLDS = {
  low: 3.0,      // Only extreme outliers (99.7%)
  medium: 2.5,   // Significant deviations (98.7%)
  high: 2.0      // More sensitive (95.4%)
};
```

**Detection Logic**: See [Section 4](#4-anomaly-detection-algorithms) for detailed algorithms.

### 2.4 Forecast Exceeded Alerts

**Purpose**: Predict future spending and alert before budget breaches.

```typescript
interface ForecastExceededRule {
  type: 'forecast_exceeded';
  metric: 'monthly_forecast' | 'quarterly_forecast';
  threshold: number;           // Dollar amount
  confidenceLevel: 0.8 | 0.9 | 0.95;  // Prediction confidence
  
  // When to alert
  alertDaysBefore?: number;    // Alert N days before projected breach
}

// Example: "When monthly forecast > $25,000"
const forecastRule: ForecastExceededRule = {
  type: 'forecast_exceeded',
  metric: 'monthly_forecast',
  threshold: 25000,
  confidenceLevel: 0.9,
  alertDaysBefore: 7
};
```

**Detection Logic**: See [Section 5](#5-forecasting-engine) for forecasting algorithms.

### 2.5 Provider Error Rate Alerts

**Purpose**: Monitor API health and detect provider issues.

```typescript
interface ProviderErrorRule {
  type: 'provider_error';
  provider?: string;           // Specific provider or all
  errorRateThreshold: number;  // Percentage (e.g., 5 = 5%)
  errorCountThreshold?: number;// Absolute count
  timeWindow: '5m' | '15m' | '1h';
  
  // Error types to monitor
  errorTypes?: ('rate_limit' | 'timeout' | 'server_error' | 'auth_error')[];
}

// Example: "When error rate > 5% in 1h"
const errorRateRule: ProviderErrorRule = {
  type: 'provider_error',
  errorRateThreshold: 5,
  timeWindow: '1h',
  errorTypes: ['rate_limit', 'server_error', 'timeout']
};
```

**Detection Logic**:
```typescript
async function evaluateProviderError(
  rule: ProviderErrorRule,
  orgId: string
): Promise<AlertTrigger | null> {
  const windowStart = getWindowStart(rule.timeWindow);
  
  // Query request outcomes
  const { data: requests } = await supabase
    .from('usage_records')
    .select('provider, status, error_type')
    .eq('org_id', orgId)
    .gte('timestamp', windowStart)
    .match(rule.provider ? { provider: rule.provider } : {});
  
  if (!requests || requests.length === 0) return null;
  
  // Group by provider
  const byProvider = groupBy(requests, 'provider');
  const alerts: AlertTrigger[] = [];
  
  for (const [provider, providerRequests] of Object.entries(byProvider)) {
    const totalRequests = providerRequests.length;
    const errors = providerRequests.filter(r => 
      r.status === 'error' && 
      (!rule.errorTypes || rule.errorTypes.includes(r.error_type))
    );
    const errorCount = errors.length;
    const errorRate = (errorCount / totalRequests) * 100;
    
    // Check thresholds
    const rateExceeded = errorRate > rule.errorRateThreshold;
    const countExceeded = rule.errorCountThreshold && errorCount > rule.errorCountThreshold;
    
    if (rateExceeded || countExceeded) {
      return {
        ruleId: rule.id,
        type: 'provider_error',
        severity: errorRate > 20 ? 'critical' : 'warning',
        currentValue: errorRate,
        thresholdValue: rule.errorRateThreshold,
        message: `${provider} error rate is ${errorRate.toFixed(1)}% (${errorCount} errors in ${totalRequests} requests)`,
        context: {
          provider,
          errorRate,
          errorCount,
          totalRequests,
          errorBreakdown: countBy(errors, 'error_type'),
          timeWindow: rule.timeWindow
        }
      };
    }
  }
  
  return null;
}
```

### 2.6 Usage Spike Detection

**Purpose**: Detect sudden increases in request volume.

```typescript
interface UsageSpikeRule {
  type: 'usage_spike';
  metric: 'requests_per_minute' | 'tokens_per_minute' | 'requests_per_hour';
  threshold: number;           // Absolute value
  spikeMultiplier?: number;    // Or N times baseline
  timeWindow: '1m' | '5m' | '15m' | '1h';
  
  // Optional filters
  filters?: {
    providers?: string[];
    models?: string[];
    endpoints?: string[];
  };
}

// Example: "When requests per minute > 1000 in 5m"
const usageSpikeRule: UsageSpikeRule = {
  type: 'usage_spike',
  metric: 'requests_per_minute',
  threshold: 1000,
  timeWindow: '5m'
};
```

---

## 3. Core Engine Implementation

### 3.1 Alert Engine Class

```typescript
// lib/engines/alerting/AlertEngine.ts

import { createClient } from '@supabase/supabase-js';
import { AnomalyDetector } from './AnomalyDetector';
import { ForecastEngine } from './ForecastEngine';
import { NotificationDispatcher } from './NotificationDispatcher';
import { AlertDeduplicator } from './AlertDeduplicator';

// Types
export type AlertType = 
  | 'spend_threshold'
  | 'budget_threshold'
  | 'spend_anomaly'
  | 'forecast_exceeded'
  | 'provider_error'
  | 'usage_spike';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'snoozed';

export interface AlertRule {
  id: string;
  orgId: string;
  name: string;
  type: AlertType;
  enabled: boolean;
  config: AlertRuleConfig;
  channels: NotificationChannel[];
  createdAt: Date;
  updatedAt: Date;
  
  // Rate limiting
  cooldownMinutes?: number;      // Min time between alerts
  maxAlertsPerHour?: number;     // Rate limit
  
  // Scheduling
  activeHours?: { start: number; end: number };  // UTC hours
  activeDays?: number[];         // 0-6 (Sunday-Saturday)
}

export interface AlertTrigger {
  ruleId: string;
  type: AlertType;
  severity: AlertSeverity;
  currentValue: number;
  thresholdValue: number;
  message: string;
  context: Record<string, any>;
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
  context: Record<string, any>;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  snoozedUntil?: Date;
  notificationsSent: NotificationRecord[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'pagerduty' | 'webhook';
  config: EmailConfig | SlackConfig | PagerDutyConfig | WebhookConfig;
  enabled: boolean;
  severityFilter?: AlertSeverity[];  // Only send for these severities
}

// Main Engine Class
export class AlertEngine {
  private supabase: ReturnType<typeof createClient>;
  private anomalyDetector: AnomalyDetector;
  private forecastEngine: ForecastEngine;
  private notificationDispatcher: NotificationDispatcher;
  private deduplicator: AlertDeduplicator;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.anomalyDetector = new AnomalyDetector(this.supabase);
    this.forecastEngine = new ForecastEngine(this.supabase);
    this.notificationDispatcher = new NotificationDispatcher();
    this.deduplicator = new AlertDeduplicator(this.supabase);
  }
  
  // ========================================
  // MAIN EVALUATION LOOP
  // ========================================
  
  /**
   * Evaluate all active rules for an organization
   * Called by background job every 1-5 minutes
   */
  async evaluateOrganization(orgId: string): Promise<void> {
    console.log(`[AlertEngine] Evaluating org: ${orgId}`);
    
    // Get all enabled rules
    const { data: rules } = await this.supabase
      .from('alert_rules')
      .select('*')
      .eq('org_id', orgId)
      .eq('enabled', true);
    
    if (!rules || rules.length === 0) return;
    
    // Evaluate each rule
    const triggers: AlertTrigger[] = [];
    
    for (const rule of rules) {
      // Check if rule is within active hours
      if (!this.isRuleActive(rule)) continue;
      
      // Check cooldown
      if (await this.isInCooldown(rule)) continue;
      
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
  }
  
  /**
   * Evaluate a single rule
   */
  async evaluateRule(rule: AlertRule, orgId: string): Promise<AlertTrigger | null> {
    switch (rule.type) {
      case 'spend_threshold':
        return this.evaluateSpendThreshold(rule, orgId);
      
      case 'budget_threshold':
        return this.evaluateBudgetThreshold(rule, orgId);
      
      case 'spend_anomaly':
        return this.evaluateSpendAnomaly(rule, orgId);
      
      case 'forecast_exceeded':
        return this.evaluateForecastExceeded(rule, orgId);
      
      case 'provider_error':
        return this.evaluateProviderError(rule, orgId);
      
      case 'usage_spike':
        return this.evaluateUsageSpike(rule, orgId);
      
      default:
        console.warn(`[AlertEngine] Unknown rule type: ${rule.type}`);
        return null;
    }
  }
  
  // ========================================
  // THRESHOLD EVALUATORS
  // ========================================
  
  private async evaluateSpendThreshold(
    rule: AlertRule,
    orgId: string
  ): Promise<AlertTrigger | null> {
    const config = rule.config as SpendThresholdRule;
    const windowStart = this.getWindowStart(config.timeWindow);
    
    // Build query
    let query = this.supabase
      .from('usage_records')
      .select('cost')
      .eq('org_id', orgId)
      .gte('timestamp', windowStart.toISOString());
    
    // Apply filters
    if (config.filters?.providers?.length) {
      query = query.in('provider', config.filters.providers);
    }
    if (config.filters?.models?.length) {
      query = query.in('model', config.filters.models);
    }
    if (config.filters?.costCenters?.length) {
      query = query.in('cost_center_id', config.filters.costCenters);
    }
    
    const { data: records, error } = await query;
    
    if (error) {
      console.error('[AlertEngine] Error querying spend:', error);
      return null;
    }
    
    const totalCost = records?.reduce((sum, r) => sum + (r.cost || 0), 0) ?? 0;
    
    // Evaluate condition
    if (!this.evaluateCondition(totalCost, config.operator, config.threshold)) {
      return null;
    }
    
    // Get top contributors for context
    const topContributors = await this.getTopCostContributors(orgId, windowStart);
    
    return {
      ruleId: rule.id,
      type: 'spend_threshold',
      severity: this.calculateSpendSeverity(totalCost, config.threshold),
      currentValue: totalCost,
      thresholdValue: config.threshold,
      message: this.formatSpendMessage(config.metric, totalCost, config.threshold),
      context: {
        metric: config.metric,
        timeWindow: config.timeWindow,
        topContributors,
        filters: config.filters
      },
      triggeredAt: new Date()
    };
  }
  
  private async evaluateBudgetThreshold(
    rule: AlertRule,
    orgId: string
  ): Promise<AlertTrigger | null> {
    const config = rule.config as BudgetThresholdRule;
    
    // Get budget
    const { data: budget } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', config.budgetId)
      .single();
    
    if (!budget) {
      console.warn(`[AlertEngine] Budget not found: ${config.budgetId}`);
      return null;
    }
    
    // Calculate current spend
    const currentSpend = await this.calculateBudgetSpend(budget);
    const utilizationPercent = (currentSpend / budget.amount) * 100;
    
    // Check threshold
    if (utilizationPercent < config.thresholdPercent) {
      // Check forecast if enabled
      if (config.includeForecasted) {
        const forecast = await this.forecastEngine.forecastBudget(budget, currentSpend);
        if (forecast.projectedUtilization >= config.thresholdPercent) {
          return {
            ruleId: rule.id,
            type: 'forecast_exceeded',
            severity: 'warning',
            currentValue: utilizationPercent,
            thresholdValue: config.thresholdPercent,
            message: `${budget.name} is projected to reach ${forecast.projectedUtilization.toFixed(1)}% by ${forecast.estimatedBreachDate?.toLocaleDateString()}`,
            context: {
              budgetName: budget.name,
              budgetAmount: budget.amount,
              currentSpend,
              currentUtilization: utilizationPercent,
              projectedUtilization: forecast.projectedUtilization,
              estimatedBreachDate: forecast.estimatedBreachDate,
              daysRemaining: this.getDaysRemaining(budget.period_end)
            },
            triggeredAt: new Date()
          };
        }
      }
      return null;
    }
    
    return {
      ruleId: rule.id,
      type: 'budget_threshold',
      severity: this.getBudgetSeverity(utilizationPercent),
      currentValue: utilizationPercent,
      thresholdValue: config.thresholdPercent,
      message: `${budget.name} has reached ${utilizationPercent.toFixed(1)}% utilization ($${currentSpend.toLocaleString()} of $${budget.amount.toLocaleString()})`,
      context: {
        budgetId: budget.id,
        budgetName: budget.name,
        budgetAmount: budget.amount,
        currentSpend,
        remainingBudget: budget.amount - currentSpend,
        daysRemaining: this.getDaysRemaining(budget.period_end),
        dailyBurnRate: await this.calculateDailyBurnRate(budget)
      },
      triggeredAt: new Date()
    };
  }
  
  private async evaluateSpendAnomaly(
    rule: AlertRule,
    orgId: string
  ): Promise<AlertTrigger | null> {
    const config = rule.config as SpendAnomalyRule;
    
    // Delegate to anomaly detector
    return this.anomalyDetector.detectSpendAnomaly(
      orgId,
      config.metric,
      config.sensitivity,
      config.timeWindow,
      config.baselinePeriod,
      config.filters,
      rule.id
    );
  }
  
  private async evaluateForecastExceeded(
    rule: AlertRule,
    orgId: string
  ): Promise<AlertTrigger | null> {
    const config = rule.config as ForecastExceededRule;
    
    // Delegate to forecast engine
    return this.forecastEngine.evaluateForecast(
      orgId,
      config.metric,
      config.threshold,
      config.confidenceLevel,
      config.alertDaysBefore,
      rule.id
    );
  }
  
  private async evaluateProviderError(
    rule: AlertRule,
    orgId: string
  ): Promise<AlertTrigger | null> {
    const config = rule.config as ProviderErrorRule;
    const windowStart = this.getWindowStart(config.timeWindow);
    
    // Query requests with error info
    let query = this.supabase
      .from('usage_records')
      .select('provider, status, error_type, timestamp')
      .eq('org_id', orgId)
      .gte('timestamp', windowStart.toISOString());
    
    if (config.provider) {
      query = query.eq('provider', config.provider);
    }
    
    const { data: requests } = await query;
    
    if (!requests || requests.length === 0) return null;
    
    // Group by provider and calculate error rates
    const byProvider = this.groupBy(requests, 'provider');
    
    for (const [provider, providerRequests] of Object.entries(byProvider)) {
      const total = providerRequests.length;
      const errors = providerRequests.filter(r => {
        if (r.status !== 'error') return false;
        if (config.errorTypes && !config.errorTypes.includes(r.error_type)) return false;
        return true;
      });
      
      const errorCount = errors.length;
      const errorRate = (errorCount / total) * 100;
      
      // Check thresholds
      const rateExceeded = errorRate > config.errorRateThreshold;
      const countExceeded = config.errorCountThreshold && errorCount > config.errorCountThreshold;
      
      if (rateExceeded || countExceeded) {
        return {
          ruleId: rule.id,
          type: 'provider_error',
          severity: errorRate > 20 ? 'critical' : errorRate > 10 ? 'warning' : 'info',
          currentValue: errorRate,
          thresholdValue: config.errorRateThreshold,
          message: `${provider} error rate is ${errorRate.toFixed(1)}% (${errorCount}/${total} requests)`,
          context: {
            provider,
            errorRate,
            errorCount,
            totalRequests: total,
            errorBreakdown: this.countBy(errors, 'error_type'),
            timeWindow: config.timeWindow,
            recentErrors: errors.slice(0, 5).map(e => ({
              type: e.error_type,
              timestamp: e.timestamp
            }))
          },
          triggeredAt: new Date()
        };
      }
    }
    
    return null;
  }
  
  private async evaluateUsageSpike(
    rule: AlertRule,
    orgId: string
  ): Promise<AlertTrigger | null> {
    const config = rule.config as UsageSpikeRule;
    const windowStart = this.getWindowStart(config.timeWindow);
    
    // Query request counts
    let query = this.supabase
      .from('usage_records')
      .select('timestamp, tokens_in, tokens_out, provider, model')
      .eq('org_id', orgId)
      .gte('timestamp', windowStart.toISOString());
    
    // Apply filters
    if (config.filters?.providers?.length) {
      query = query.in('provider', config.filters.providers);
    }
    if (config.filters?.models?.length) {
      query = query.in('model', config.filters.models);
    }
    
    const { data: records } = await query;
    
    if (!records || records.length === 0) return null;
    
    // Calculate metric
    const windowMinutes = this.getWindowMinutes(config.timeWindow);
    let currentValue: number;
    
    switch (config.metric) {
      case 'requests_per_minute':
        currentValue = records.length / windowMinutes;
        break;
      case 'tokens_per_minute':
        const totalTokens = records.reduce((sum, r) => 
          sum + (r.tokens_in || 0) + (r.tokens_out || 0), 0);
        currentValue = totalTokens / windowMinutes;
        break;
      case 'requests_per_hour':
        currentValue = (records.length / windowMinutes) * 60;
        break;
      default:
        return null;
    }
    
    // Check absolute threshold
    if (currentValue > config.threshold) {
      return {
        ruleId: rule.id,
        type: 'usage_spike',
        severity: currentValue > config.threshold * 2 ? 'critical' : 'warning',
        currentValue,
        thresholdValue: config.threshold,
        message: `${config.metric.replace(/_/g, ' ')} spiked to ${currentValue.toFixed(0)} (threshold: ${config.threshold})`,
        context: {
          metric: config.metric,
          timeWindow: config.timeWindow,
          requestCount: records.length,
          topModels: this.getTopN(this.countBy(records, 'model'), 3),
          topProviders: this.getTopN(this.countBy(records, 'provider'), 3)
        },
        triggeredAt: new Date()
      };
    }
    
    // Check spike multiplier (if baseline exists)
    if (config.spikeMultiplier) {
      const baseline = await this.getUsageBaseline(orgId, config.metric);
      if (baseline && currentValue > baseline * config.spikeMultiplier) {
        return {
          ruleId: rule.id,
          type: 'usage_spike',
          severity: 'warning',
          currentValue,
          thresholdValue: baseline * config.spikeMultiplier,
          message: `${config.metric.replace(/_/g, ' ')} is ${(currentValue / baseline).toFixed(1)}x above normal`,
          context: {
            metric: config.metric,
            baseline,
            multiplier: currentValue / baseline,
            timeWindow: config.timeWindow
          },
          triggeredAt: new Date()
        };
      }
    }
    
    return null;
  }
  
  // ========================================
  // TRIGGER PROCESSING
  // ========================================
  
  private async processTrigger(trigger: AlertTrigger, orgId: string): Promise<void> {
    // Check for deduplication
    const isDuplicate = await this.deduplicator.isDuplicate(trigger);
    if (isDuplicate) {
      console.log(`[AlertEngine] Skipping duplicate alert for rule ${trigger.ruleId}`);
      return;
    }
    
    // Get rule for notification config
    const { data: rule } = await this.supabase
      .from('alert_rules')
      .select('*')
      .eq('id', trigger.ruleId)
      .single();
    
    if (!rule) return;
    
    // Create alert record
    const alert: Partial<Alert> = {
      id: crypto.randomUUID(),
      orgId,
      ruleId: trigger.ruleId,
      type: trigger.type,
      severity: trigger.severity,
      status: 'active',
      title: this.generateAlertTitle(trigger),
      description: trigger.message,
      currentValue: trigger.currentValue,
      thresholdValue: trigger.thresholdValue,
      context: trigger.context,
      triggeredAt: trigger.triggeredAt || new Date(),
      notificationsSent: []
    };
    
    // Save to database
    const { data: savedAlert, error } = await this.supabase
      .from('alerts')
      .insert(alert)
      .select()
      .single();
    
    if (error) {
      console.error('[AlertEngine] Error saving alert:', error);
      return;
    }
    
    // Update deduplication cache
    await this.deduplicator.recordAlert(trigger);
    
    // Send notifications
    await this.sendNotifications(savedAlert, rule);
    
    // Emit real-time event
    await this.emitAlertEvent(orgId, savedAlert);
    
    console.log(`[AlertEngine] Alert created: ${savedAlert.id} - ${savedAlert.title}`);
  }
  
  private async sendNotifications(alert: Alert, rule: AlertRule): Promise<void> {
    const channels = rule.channels.filter(ch => {
      if (!ch.enabled) return false;
      if (ch.severityFilter && !ch.severityFilter.includes(alert.severity)) return false;
      return true;
    });
    
    const results = await Promise.allSettled(
      channels.map(channel => 
        this.notificationDispatcher.send(channel, alert)
      )
    );
    
    // Record notification results
    const notificationRecords = results.map((result, i) => ({
      channel: channels[i].type,
      sentAt: new Date(),
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason?.message : undefined
    }));
    
    // Update alert with notification records
    await this.supabase
      .from('alerts')
      .update({ notifications_sent: notificationRecords })
      .eq('id', alert.id);
  }
  
  private async emitAlertEvent(orgId: string, alert: Alert): Promise<void> {
    // Broadcast via Supabase Realtime
    await this.supabase
      .channel(`alerts:${orgId}`)
      .send({
        type: 'broadcast',
        event: 'new_alert',
        payload: alert
      });
  }
  
  // ========================================
  // HELPER METHODS
  // ========================================
  
  private getWindowStart(window: string): Date {
    const now = new Date();
    switch (window) {
      case '1m': return new Date(now.getTime() - 60 * 1000);
      case '5m': return new Date(now.getTime() - 5 * 60 * 1000);
      case '15m': return new Date(now.getTime() - 15 * 60 * 1000);
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '4h': return new Date(now.getTime() - 4 * 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 60 * 60 * 1000);
    }
  }
  
  private getWindowMinutes(window: string): number {
    switch (window) {
      case '1m': return 1;
      case '5m': return 5;
      case '15m': return 15;
      case '1h': return 60;
      case '4h': return 240;
      case '24h': return 1440;
      default: return 60;
    }
  }
  
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }
  
  private calculateSpendSeverity(current: number, threshold: number): AlertSeverity {
    const ratio = current / threshold;
    if (ratio >= 2.0) return 'critical';
    if (ratio >= 1.5) return 'warning';
    return 'info';
  }
  
  private getBudgetSeverity(utilization: number): AlertSeverity {
    if (utilization >= 100) return 'critical';
    if (utilization >= 90) return 'warning';
    return 'info';
  }
  
  private formatSpendMessage(metric: string, current: number, threshold: number): string {
    const metricLabel = metric.replace(/_/g, ' ');
    return `${metricLabel} of $${current.toFixed(2)} exceeded $${threshold} threshold`;
  }
  
  private generateAlertTitle(trigger: AlertTrigger): string {
    switch (trigger.type) {
      case 'spend_threshold':
        return `Spending threshold exceeded`;
      case 'budget_threshold':
        return `Budget ${trigger.context?.budgetName || ''} at ${trigger.currentValue.toFixed(0)}%`;
      case 'spend_anomaly':
        return `Unusual spending detected`;
      case 'forecast_exceeded':
        return `Forecast exceeds threshold`;
      case 'provider_error':
        return `${trigger.context?.provider || 'Provider'} error rate elevated`;
      case 'usage_spike':
        return `Usage spike detected`;
      default:
        return 'Alert triggered';
    }
  }
  
  private isRuleActive(rule: AlertRule): boolean {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentDay = now.getUTCDay();
    
    // Check active hours
    if (rule.activeHours) {
      const { start, end } = rule.activeHours;
      if (start <= end) {
        if (currentHour < start || currentHour >= end) return false;
      } else {
        // Spans midnight
        if (currentHour < start && currentHour >= end) return false;
      }
    }
    
    // Check active days
    if (rule.activeDays && !rule.activeDays.includes(currentDay)) {
      return false;
    }
    
    return true;
  }
  
  private async isInCooldown(rule: AlertRule): Promise<boolean> {
    if (!rule.cooldownMinutes) return false;
    
    const cooldownStart = new Date(Date.now() - rule.cooldownMinutes * 60 * 1000);
    
    const { data: recentAlerts } = await this.supabase
      .from('alerts')
      .select('id')
      .eq('rule_id', rule.id)
      .gte('triggered_at', cooldownStart.toISOString())
      .limit(1);
    
    return (recentAlerts?.length ?? 0) > 0;
  }
  
  private async getTopCostContributors(
    orgId: string,
    since: Date
  ): Promise<Array<{ name: string; cost: number; percentage: number }>> {
    const { data } = await this.supabase
      .rpc('get_top_cost_contributors', {
        p_org_id: orgId,
        p_since: since.toISOString(),
        p_limit: 5
      });
    
    return data || [];
  }
  
  private async calculateBudgetSpend(budget: any): Promise<number> {
    const { data } = await this.supabase
      .from('usage_records')
      .select('cost')
      .eq('org_id', budget.org_id)
      .gte('timestamp', budget.period_start)
      .lte('timestamp', budget.period_end);
    
    return data?.reduce((sum, r) => sum + (r.cost || 0), 0) ?? 0;
  }
  
  private async calculateDailyBurnRate(budget: any): Promise<number> {
    const currentSpend = await this.calculateBudgetSpend(budget);
    const daysElapsed = Math.max(1, this.getDaysElapsed(budget.period_start));
    return currentSpend / daysElapsed;
  }
  
  private getDaysElapsed(startDate: string | Date): number {
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  }
  
  private getDaysRemaining(endDate: string | Date): number {
    const end = new Date(endDate);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
  }
  
  private async getUsageBaseline(orgId: string, metric: string): Promise<number | null> {
    const { data } = await this.supabase
      .from('usage_baselines')
      .select('value')
      .eq('org_id', orgId)
      .eq('metric', metric)
      .single();
    
    return data?.value ?? null;
  }
  
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      (groups[value] = groups[value] || []).push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }
  
  private countBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((counts, item) => {
      const value = String(item[key]);
      counts[value] = (counts[value] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }
  
  private getTopN(counts: Record<string, number>, n: number): Array<{ name: string; count: number }> {
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, count]) => ({ name, count }));
  }
}
```

---

## 4. Anomaly Detection Algorithms

### 4.1 Statistical Methods

```typescript
// lib/engines/alerting/AnomalyDetector.ts

export class AnomalyDetector {
  private supabase: SupabaseClient;
  
  // Sensitivity thresholds (Z-scores)
  private readonly SENSITIVITY_THRESHOLDS = {
    low: 3.0,      // 99.7% - Only extreme outliers
    medium: 2.5,   // 98.7% - Significant deviations
    high: 2.0      // 95.4% - More sensitive
  };
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  
  /**
   * Detect spending anomalies using multiple algorithms
   */
  async detectSpendAnomaly(
    orgId: string,
    metric: string,
    sensitivity: 'low' | 'medium' | 'high',
    timeWindow: string,
    baselinePeriod: string,
    filters?: any,
    ruleId?: string
  ): Promise<AlertTrigger | null> {
    // Get baseline data
    const baseline = await this.getBaseline(orgId, metric, baselinePeriod, filters);
    if (!baseline || baseline.dataPoints < 7) {
      // Not enough data for meaningful baseline
      return null;
    }
    
    // Get current value
    const currentValue = await this.getCurrentValue(orgId, metric, timeWindow, filters);
    
    // Run multiple detection algorithms
    const detections = await Promise.all([
      this.detectZScore(currentValue, baseline, sensitivity),
      this.detectIQR(currentValue, baseline),
      this.detectMAD(currentValue, baseline, sensitivity),
      this.detectSeasonalDeviation(orgId, metric, currentValue, filters)
    ]);
    
    // Consensus: alert if 2+ methods detect anomaly
    const anomalyCount = detections.filter(d => d.isAnomaly).length;
    
    if (anomalyCount >= 2) {
      const primaryDetection = detections.find(d => d.isAnomaly) || detections[0];
      
      return {
        ruleId: ruleId || 'anomaly_detection',
        type: 'spend_anomaly',
        severity: this.getAnomalySeverity(primaryDetection.deviationScore),
        currentValue,
        thresholdValue: baseline.mean,
        message: `${metric.replace(/_/g, ' ')} of $${currentValue.toFixed(2)} is ${primaryDetection.deviationScore.toFixed(1)}σ above normal ($${baseline.mean.toFixed(2)})`,
        context: {
          metric,
          currentValue,
          baselineMean: baseline.mean,
          baselineStdDev: baseline.stdDev,
          deviationScore: primaryDetection.deviationScore,
          detectionMethods: detections.filter(d => d.isAnomaly).map(d => d.method),
          percentAboveNormal: ((currentValue - baseline.mean) / baseline.mean * 100).toFixed(1),
          baselinePeriod,
          dataPoints: baseline.dataPoints
        },
        triggeredAt: new Date()
      };
    }
    
    return null;
  }
  
  /**
   * Z-Score Detection
   * Standard statistical method for outlier detection
   */
  private async detectZScore(
    currentValue: number,
    baseline: BaselineStats,
    sensitivity: 'low' | 'medium' | 'high'
  ): Promise<AnomalyDetection> {
    const threshold = this.SENSITIVITY_THRESHOLDS[sensitivity];
    
    // Handle zero/near-zero standard deviation
    if (baseline.stdDev < 0.01) {
      const percentDiff = Math.abs(currentValue - baseline.mean) / Math.max(baseline.mean, 1);
      return {
        method: 'z_score',
        isAnomaly: percentDiff > 0.5, // 50% deviation when no variance
        deviationScore: percentDiff * 10,
        threshold
      };
    }
    
    const zScore = (currentValue - baseline.mean) / baseline.stdDev;
    
    return {
      method: 'z_score',
      isAnomaly: Math.abs(zScore) > threshold,
      deviationScore: zScore,
      threshold
    };
  }
  
  /**
   * IQR (Interquartile Range) Detection
   * Robust against outliers in baseline data
   */
  private async detectIQR(
    currentValue: number,
    baseline: BaselineStats
  ): Promise<AnomalyDetection> {
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
      method: 'iqr',
      isAnomaly,
      deviationScore,
      threshold: 1.5,
      metadata: { isExtreme, upperFence, lowerFence }
    };
  }
  
  /**
   * MAD (Median Absolute Deviation) Detection
   * Even more robust than IQR for skewed distributions
   */
  private async detectMAD(
    currentValue: number,
    baseline: BaselineStats,
    sensitivity: 'low' | 'medium' | 'high'
  ): Promise<AnomalyDetection> {
    const { median, mad } = baseline;
    
    // MAD threshold (similar to Z-score but using median)
    const madThreshold = this.SENSITIVITY_THRESHOLDS[sensitivity] * 1.4826; // Scale factor
    
    // Handle zero MAD
    if (mad < 0.01) {
      const percentDiff = Math.abs(currentValue - median) / Math.max(median, 1);
      return {
        method: 'mad',
        isAnomaly: percentDiff > 0.5,
        deviationScore: percentDiff * 10,
        threshold: madThreshold
      };
    }
    
    const modifiedZScore = 0.6745 * (currentValue - median) / mad;
    
    return {
      method: 'mad',
      isAnomaly: Math.abs(modifiedZScore) > madThreshold,
      deviationScore: modifiedZScore,
      threshold: madThreshold
    };
  }
  
  /**
   * Seasonal Deviation Detection
   * Accounts for day-of-week and time-of-day patterns
   */
  private async detectSeasonalDeviation(
    orgId: string,
    metric: string,
    currentValue: number,
    filters?: any
  ): Promise<AnomalyDetection> {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const hourOfDay = now.getUTCHours();
    
    // Get historical data for same day/hour
    const { data: historicalData } = await this.supabase
      .rpc('get_seasonal_baseline', {
        p_org_id: orgId,
        p_metric: metric,
        p_day_of_week: dayOfWeek,
        p_hour_of_day: hourOfDay,
        p_weeks_back: 4
      });
    
    if (!historicalData || historicalData.length < 3) {
      return {
        method: 'seasonal',
        isAnomaly: false,
        deviationScore: 0,
        threshold: 2.0
      };
    }
    
    const values = historicalData.map((d: any) => d.value);
    const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sq: number, v: number) => sq + Math.pow(v - mean, 2), 0) / values.length
    );
    
    const deviationScore = stdDev > 0.01 ? (currentValue - mean) / stdDev : 0;
    
    return {
      method: 'seasonal',
      isAnomaly: Math.abs(deviationScore) > 2.5,
      deviationScore,
      threshold: 2.5,
      metadata: {
        dayOfWeek,
        hourOfDay,
        seasonalMean: mean,
        seasonalStdDev: stdDev
      }
    };
  }
  
  /**
   * Get baseline statistics from historical data
   */
  private async getBaseline(
    orgId: string,
    metric: string,
    period: string,
    filters?: any
  ): Promise<BaselineStats | null> {
    const periodDays = this.getPeriodDays(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    
    // Get aggregated data
    const { data, error } = await this.supabase
      .rpc('get_metric_baseline', {
        p_org_id: orgId,
        p_metric: metric,
        p_start_date: startDate.toISOString(),
        p_filters: filters || {}
      });
    
    if (error || !data || data.length === 0) {
      return null;
    }
    
    const values = data.map((d: any) => d.value).sort((a: number, b: number) => a - b);
    const n = values.length;
    
    if (n < 3) return null;
    
    // Calculate statistics
    const mean = values.reduce((a: number, b: number) => a + b, 0) / n;
    const variance = values.reduce((sq: number, v: number) => sq + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    const median = n % 2 === 0 
      ? (values[n/2 - 1] + values[n/2]) / 2 
      : values[Math.floor(n/2)];
    
    const q1 = values[Math.floor(n * 0.25)];
    const q3 = values[Math.floor(n * 0.75)];
    
    // Calculate MAD
    const deviations = values.map(v => Math.abs(v - median)).sort((a, b) => a - b);
    const mad = deviations.length % 2 === 0
      ? (deviations[deviations.length/2 - 1] + deviations[deviations.length/2]) / 2
      : deviations[Math.floor(deviations.length/2)];
    
    return {
      mean,
      stdDev,
      median,
      mad,
      q1,
      q3,
      min: values[0],
      max: values[n - 1],
      dataPoints: n
    };
  }
  
  private async getCurrentValue(
    orgId: string,
    metric: string,
    timeWindow: string,
    filters?: any
  ): Promise<number> {
    const windowStart = this.getWindowStart(timeWindow);
    
    const { data } = await this.supabase
      .rpc('get_current_metric_value', {
        p_org_id: orgId,
        p_metric: metric,
        p_since: windowStart.toISOString(),
        p_filters: filters || {}
      });
    
    return data?.value || 0;
  }
  
  private getAnomalySeverity(deviationScore: number): AlertSeverity {
    const absScore = Math.abs(deviationScore);
    if (absScore >= 4) return 'critical';
    if (absScore >= 3) return 'warning';
    return 'info';
  }
  
  private getPeriodDays(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '14d': return 14;
      case '30d': return 30;
      case '60d': return 60;
      default: return 14;
    }
  }
  
  private getWindowStart(window: string): Date {
    const now = new Date();
    switch (window) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '4h': return new Date(now.getTime() - 4 * 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 60 * 60 * 1000);
    }
  }
}

interface BaselineStats {
  mean: number;
  stdDev: number;
  median: number;
  mad: number;  // Median Absolute Deviation
  q1: number;
  q3: number;
  min: number;
  max: number;
  dataPoints: number;
}

interface AnomalyDetection {
  method: 'z_score' | 'iqr' | 'mad' | 'seasonal';
  isAnomaly: boolean;
  deviationScore: number;
  threshold: number;
  metadata?: Record<string, any>;
}
```

---

## 5. Forecasting Engine

### 5.1 Budget Forecasting

```typescript
// lib/engines/alerting/ForecastEngine.ts

export class ForecastEngine {
  private supabase: SupabaseClient;
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  
  /**
   * Forecast budget utilization
   */
  async forecastBudget(
    budget: Budget,
    currentSpend: number
  ): Promise<BudgetForecast> {
    const periodStart = new Date(budget.period_start);
    const periodEnd = new Date(budget.period_end);
    const now = new Date();
    
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
    const daysElapsed = Math.max(1, Math.ceil((now.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000)));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);
    
    // Get daily spend history
    const dailySpends = await this.getDailySpendHistory(
      budget.org_id,
      periodStart,
      now,
      budget.cost_center_id
    );
    
    // Calculate forecasts using multiple methods
    const forecasts = [
      this.linearForecast(dailySpends, daysRemaining, currentSpend),
      this.weightedAverageForecast(dailySpends, daysRemaining, currentSpend),
      this.exponentialSmoothingForecast(dailySpends, daysRemaining, currentSpend),
      this.trendAdjustedForecast(dailySpends, daysRemaining, currentSpend)
    ];
    
    // Use weighted ensemble
    const weights = [0.2, 0.25, 0.3, 0.25];
    const projectedSpend = forecasts.reduce((sum, f, i) => sum + f.projectedSpend * weights[i], 0);
    const projectedUtilization = (projectedSpend / budget.amount) * 100;
    
    // Calculate confidence interval
    const variance = forecasts.reduce((sum, f) => sum + Math.pow(f.projectedSpend - projectedSpend, 2), 0) / forecasts.length;
    const stdDev = Math.sqrt(variance);
    
    // Estimate breach date
    const estimatedBreachDate = this.estimateBreachDate(
      dailySpends,
      currentSpend,
      budget.amount,
      periodEnd
    );
    
    return {
      projectedSpend,
      projectedUtilization,
      confidenceInterval: {
        low: Math.max(currentSpend, projectedSpend - 1.96 * stdDev),
        high: projectedSpend + 1.96 * stdDev
      },
      estimatedBreachDate,
      projectedOverage: Math.max(0, projectedSpend - budget.amount),
      methodBreakdown: forecasts.map((f, i) => ({
        method: f.method,
        projection: f.projectedSpend,
        weight: weights[i]
      })),
      daysRemaining,
      dailyBurnRate: currentSpend / daysElapsed,
      requiredDailyRate: daysRemaining > 0 ? (budget.amount - currentSpend) / daysRemaining : 0
    };
  }
  
  /**
   * Evaluate forecast threshold rule
   */
  async evaluateForecast(
    orgId: string,
    metric: string,
    threshold: number,
    confidenceLevel: number,
    alertDaysBefore: number | undefined,
    ruleId: string
  ): Promise<AlertTrigger | null> {
    const forecast = await this.getMonthlyForecast(orgId);
    
    if (!forecast) return null;
    
    // Check if forecast exceeds threshold
    const projectedExceeds = forecast.projectedSpend > threshold;
    
    // Check confidence level
    const confidenceThreshold = forecast.confidenceInterval.low + 
      (forecast.confidenceInterval.high - forecast.confidenceInterval.low) * (1 - confidenceLevel);
    const confidenceExceeds = confidenceThreshold > threshold;
    
    if (!projectedExceeds && !confidenceExceeds) {
      return null;
    }
    
    // Check if within alert window
    if (alertDaysBefore && forecast.estimatedBreachDate) {
      const daysUntilBreach = Math.ceil(
        (forecast.estimatedBreachDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );
      if (daysUntilBreach > alertDaysBefore) {
        return null;
      }
    }
    
    return {
      ruleId,
      type: 'forecast_exceeded',
      severity: forecast.projectedUtilization > 120 ? 'critical' : 'warning',
      currentValue: forecast.projectedSpend,
      thresholdValue: threshold,
      message: `Monthly spend projected to reach $${forecast.projectedSpend.toLocaleString()} (${forecast.projectedUtilization.toFixed(0)}% of $${threshold.toLocaleString()} threshold)`,
      context: {
        projectedSpend: forecast.projectedSpend,
        threshold,
        projectedUtilization: forecast.projectedUtilization,
        confidenceInterval: forecast.confidenceInterval,
        estimatedBreachDate: forecast.estimatedBreachDate,
        daysRemaining: forecast.daysRemaining,
        currentDailyBurnRate: forecast.dailyBurnRate,
        requiredDailyRate: forecast.requiredDailyRate
      },
      triggeredAt: new Date()
    };
  }
  
  // ========================================
  // FORECASTING METHODS
  // ========================================
  
  /**
   * Simple linear extrapolation
   */
  private linearForecast(
    dailySpends: number[],
    daysRemaining: number,
    currentSpend: number
  ): ForecastResult {
    if (dailySpends.length === 0) {
      return { method: 'linear', projectedSpend: currentSpend };
    }
    
    const avgDaily = dailySpends.reduce((a, b) => a + b, 0) / dailySpends.length;
    const projectedSpend = currentSpend + avgDaily * daysRemaining;
    
    return { method: 'linear', projectedSpend };
  }
  
  /**
   * Weighted moving average (recent days weighted more)
   */
  private weightedAverageForecast(
    dailySpends: number[],
    daysRemaining: number,
    currentSpend: number
  ): ForecastResult {
    if (dailySpends.length === 0) {
      return { method: 'weighted_average', projectedSpend: currentSpend };
    }
    
    // Assign weights: recent days get higher weights
    const n = dailySpends.length;
    let weightSum = 0;
    let weightedSum = 0;
    
    dailySpends.forEach((spend, i) => {
      const weight = i + 1; // Linear weights
      weightedSum += spend * weight;
      weightSum += weight;
    });
    
    const weightedAvg = weightedSum / weightSum;
    const projectedSpend = currentSpend + weightedAvg * daysRemaining;
    
    return { method: 'weighted_average', projectedSpend };
  }
  
  /**
   * Exponential smoothing (Holt-Winters without seasonality)
   */
  private exponentialSmoothingForecast(
    dailySpends: number[],
    daysRemaining: number,
    currentSpend: number
  ): ForecastResult {
    if (dailySpends.length < 2) {
      return { method: 'exponential_smoothing', projectedSpend: currentSpend };
    }
    
    const alpha = 0.3; // Level smoothing
    const beta = 0.1;  // Trend smoothing
    
    // Initialize
    let level = dailySpends[0];
    let trend = dailySpends[1] - dailySpends[0];
    
    // Apply exponential smoothing
    for (let i = 1; i < dailySpends.length; i++) {
      const prevLevel = level;
      level = alpha * dailySpends[i] + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
    }
    
    // Forecast
    const forecastDaily = level + trend;
    const projectedSpend = currentSpend + forecastDaily * daysRemaining;
    
    return { method: 'exponential_smoothing', projectedSpend };
  }
  
  /**
   * Trend-adjusted forecast using linear regression
   */
  private trendAdjustedForecast(
    dailySpends: number[],
    daysRemaining: number,
    currentSpend: number
  ): ForecastResult {
    if (dailySpends.length < 3) {
      return { method: 'trend_adjusted', projectedSpend: currentSpend };
    }
    
    // Simple linear regression
    const n = dailySpends.length;
    const xMean = (n - 1) / 2;
    const yMean = dailySpends.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    dailySpends.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += Math.pow(x - xMean, 2);
    });
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;
    
    // Project remaining days with trend
    let projectedRemaining = 0;
    for (let d = 0; d < daysRemaining; d++) {
      projectedRemaining += intercept + slope * (n + d);
    }
    
    // Ensure non-negative
    projectedRemaining = Math.max(0, projectedRemaining);
    const projectedSpend = currentSpend + projectedRemaining;
    
    return { method: 'trend_adjusted', projectedSpend };
  }
  
  /**
   * Estimate when budget will be breached
   */
  private estimateBreachDate(
    dailySpends: number[],
    currentSpend: number,
    budgetAmount: number,
    periodEnd: Date
  ): Date | null {
    if (currentSpend >= budgetAmount) {
      return new Date(); // Already breached
    }
    
    if (dailySpends.length === 0) {
      return null;
    }
    
    // Use weighted average for daily burn
    const recentDays = dailySpends.slice(-7);
    const weights = recentDays.map((_, i) => i + 1);
    const weightSum = weights.reduce((a, b) => a + b, 0);
    const weightedDaily = recentDays.reduce((sum, spend, i) => sum + spend * weights[i], 0) / weightSum;
    
    if (weightedDaily <= 0) {
      return null; // No spend, won't breach
    }
    
    const remaining = budgetAmount - currentSpend;
    const daysUntilBreach = Math.ceil(remaining / weightedDaily);
    
    const breachDate = new Date(Date.now() + daysUntilBreach * 24 * 60 * 60 * 1000);
    
    // Only return if before period end
    return breachDate <= periodEnd ? breachDate : null;
  }
  
  /**
   * Get monthly spending forecast
   */
  private async getMonthlyForecast(orgId: string): Promise<BudgetForecast | null> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get current month spend
    const { data: currentData } = await this.supabase
      .from('usage_records')
      .select('cost')
      .eq('org_id', orgId)
      .gte('timestamp', monthStart.toISOString())
      .lte('timestamp', now.toISOString());
    
    const currentSpend = currentData?.reduce((sum, r) => sum + (r.cost || 0), 0) ?? 0;
    
    // Get daily spend history
    const dailySpends = await this.getDailySpendHistory(orgId, monthStart, now);
    
    const totalDays = monthEnd.getDate();
    const daysElapsed = now.getDate();
    const daysRemaining = totalDays - daysElapsed;
    
    // Calculate forecasts
    const forecasts = [
      this.linearForecast(dailySpends, daysRemaining, currentSpend),
      this.weightedAverageForecast(dailySpends, daysRemaining, currentSpend),
      this.exponentialSmoothingForecast(dailySpends, daysRemaining, currentSpend),
      this.trendAdjustedForecast(dailySpends, daysRemaining, currentSpend)
    ];
    
    const weights = [0.2, 0.25, 0.3, 0.25];
    const projectedSpend = forecasts.reduce((sum, f, i) => sum + f.projectedSpend * weights[i], 0);
    
    // Get previous month for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const { data: prevData } = await this.supabase
      .from('usage_records')
      .select('cost')
      .eq('org_id', orgId)
      .gte('timestamp', prevMonthStart.toISOString())
      .lte('timestamp', prevMonthEnd.toISOString());
    
    const prevMonthSpend = prevData?.reduce((sum, r) => sum + (r.cost || 0), 0) ?? 0;
    const projectedUtilization = prevMonthSpend > 0 
      ? (projectedSpend / prevMonthSpend) * 100 
      : 100;
    
    // Calculate confidence interval
    const variance = forecasts.reduce((sum, f) => sum + Math.pow(f.projectedSpend - projectedSpend, 2), 0) / forecasts.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      projectedSpend,
      projectedUtilization,
      confidenceInterval: {
        low: Math.max(currentSpend, projectedSpend - 1.96 * stdDev),
        high: projectedSpend + 1.96 * stdDev
      },
      estimatedBreachDate: null,
      projectedOverage: 0,
      methodBreakdown: forecasts.map((f, i) => ({
        method: f.method,
        projection: f.projectedSpend,
        weight: weights[i]
      })),
      daysRemaining,
      dailyBurnRate: currentSpend / Math.max(1, daysElapsed),
      requiredDailyRate: 0
    };
  }
  
  /**
   * Get daily spending history
   */
  private async getDailySpendHistory(
    orgId: string,
    startDate: Date,
    endDate: Date,
    costCenterId?: string
  ): Promise<number[]> {
    let query = this.supabase
      .rpc('get_daily_spend_history', {
        p_org_id: orgId,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString()
      });
    
    const { data } = await query;
    
    return data?.map((d: any) => d.total_cost) || [];
  }
}

interface ForecastResult {
  method: string;
  projectedSpend: number;
}

interface BudgetForecast {
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
```

---

## 6. Notification Delivery System

### 6.1 Multi-Channel Dispatcher

```typescript
// lib/engines/alerting/NotificationDispatcher.ts

import { Resend } from 'resend';

export class NotificationDispatcher {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  async send(channel: NotificationChannel, alert: Alert): Promise<NotificationResult> {
    switch (channel.type) {
      case 'email':
        return this.sendEmail(channel.config as EmailConfig, alert);
      case 'slack':
        return this.sendSlack(channel.config as SlackConfig, alert);
      case 'pagerduty':
        return this.sendPagerDuty(channel.config as PagerDutyConfig, alert);
      case 'webhook':
        return this.sendWebhook(channel.config as WebhookConfig, alert);
      default:
        throw new Error(`Unknown channel type: ${channel.type}`);
    }
  }
  
  // ========================================
  // EMAIL
  // ========================================
  
  private async sendEmail(config: EmailConfig, alert: Alert): Promise<NotificationResult> {
    const html = this.generateEmailHTML(alert);
    
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'TokenTra Alerts <alerts@tokentra.io>',
        to: config.recipients,
        subject: this.getEmailSubject(alert),
        html
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, messageId: data?.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  
  private getEmailSubject(alert: Alert): string {
    const severityEmoji = {
      critical: '🔴',
      warning: '🟡',
      info: '🔵'
    };
    
    return `${severityEmoji[alert.severity]} [TokenTra] ${alert.title}`;
  }
  
  private generateEmailHTML(alert: Alert): string {
    const severityColor = {
      critical: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    };
    
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1F2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${severityColor[alert.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #F9FAFB; padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px; }
    .metric { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border: 1px solid #E5E7EB; }
    .metric-label { color: #6B7280; font-size: 12px; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: 600; color: #1F2937; }
    .context { margin-top: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #E5E7EB; }
    .context h4 { margin: 0 0 10px 0; color: #374151; }
    .context ul { margin: 0; padding-left: 20px; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    .footer { margin-top: 20px; text-align: center; color: #9CA3AF; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">${alert.title}</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">${alert.severity.toUpperCase()} Alert • ${new Date(alert.triggeredAt).toLocaleString()}</p>
    </div>
    <div class="content">
      <p>${alert.description}</p>
      
      <div style="display: flex; gap: 15px;">
        <div class="metric" style="flex: 1;">
          <div class="metric-label">Current Value</div>
          <div class="metric-value">${this.formatMetricValue(alert.currentValue, alert.type)}</div>
        </div>
        <div class="metric" style="flex: 1;">
          <div class="metric-label">Threshold</div>
          <div class="metric-value">${this.formatMetricValue(alert.thresholdValue, alert.type)}</div>
        </div>
      </div>
      
      ${this.renderContext(alert.context)}
      
      <a href="https://app.tokentra.io/alerts/${alert.id}" class="button">View Alert Details</a>
    </div>
    <div class="footer">
      <p>You're receiving this because you're subscribed to ${alert.severity} alerts.</p>
      <p><a href="https://app.tokentra.io/settings/notifications">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }
  
  private formatMetricValue(value: number, type: AlertType): string {
    if (type === 'spend_threshold' || type === 'forecast_exceeded') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (type === 'budget_threshold') {
      return `${value.toFixed(1)}%`;
    }
    if (type === 'provider_error') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  }
  
  private renderContext(context: Record<string, any>): string {
    if (!context || Object.keys(context).length === 0) return '';
    
    const items = Object.entries(context)
      .filter(([key]) => !['metric', 'filters'].includes(key))
      .slice(0, 5)
      .map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `<li><strong>${label}:</strong> ${displayValue}</li>`;
      });
    
    if (items.length === 0) return '';
    
    return `
      <div class="context">
        <h4>Additional Context</h4>
        <ul>${items.join('')}</ul>
      </div>
    `;
  }
  
  // ========================================
  // SLACK
  // ========================================
  
  private async sendSlack(config: SlackConfig, alert: Alert): Promise<NotificationResult> {
    const blocks = this.generateSlackBlocks(alert);
    
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: config.channel,
          username: 'TokenTra Alerts',
          icon_emoji: ':chart_with_upwards_trend:',
          blocks,
          attachments: [{
            color: this.getSeverityColor(alert.severity),
            fallback: `${alert.title}: ${alert.description}`
          }]
        })
      });
      
      if (!response.ok) {
        return { success: false, error: `Slack API error: ${response.status}` };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  
  private generateSlackBlocks(alert: Alert): any[] {
    const severityEmoji = {
      critical: ':red_circle:',
      warning: ':large_yellow_circle:',
      info: ':large_blue_circle:'
    };
    
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityEmoji[alert.severity]} ${alert.title}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: alert.description
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Current Value:*\n${this.formatMetricValue(alert.currentValue, alert.type)}`
          },
          {
            type: 'mrkdwn',
            text: `*Threshold:*\n${this.formatMetricValue(alert.thresholdValue, alert.type)}`
          }
        ]
      }
    ];
    
    // Add context if available
    if (alert.context && Object.keys(alert.context).length > 0) {
      const contextFields = Object.entries(alert.context)
        .filter(([key]) => !['metric', 'filters'].includes(key))
        .slice(0, 4)
        .map(([key, value]) => ({
          type: 'mrkdwn',
          text: `*${key.replace(/([A-Z])/g, ' $1').trim()}:*\n${typeof value === 'object' ? JSON.stringify(value) : value}`
        }));
      
      if (contextFields.length > 0) {
        blocks.push({
          type: 'section',
          fields: contextFields
        });
      }
    }
    
    // Add actions
    blocks.push(
      { type: 'divider' },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Details', emoji: true },
            url: `https://app.tokentra.io/alerts/${alert.id}`,
            style: 'primary'
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Acknowledge', emoji: true },
            action_id: `acknowledge_${alert.id}`
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Snooze 1hr', emoji: true },
            action_id: `snooze_${alert.id}`
          }
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Alert ID: ${alert.id} | Triggered: <!date^${Math.floor(new Date(alert.triggeredAt).getTime() / 1000)}^{date_short_pretty} at {time}|${alert.triggeredAt}>`
          }
        ]
      }
    );
    
    return blocks;
  }
  
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
    }
  }
  
  // ========================================
  // PAGERDUTY
  // ========================================
  
  private async sendPagerDuty(config: PagerDutyConfig, alert: Alert): Promise<NotificationResult> {
    // Only send to PagerDuty for critical alerts by default
    if (alert.severity !== 'critical' && !config.allSeverities) {
      return { success: true, skipped: true, reason: 'Non-critical alert' };
    }
    
    const payload = {
      routing_key: config.integrationKey,
      event_action: 'trigger',
      dedup_key: `tokentra-${alert.id}`,
      payload: {
        summary: `[TokenTra] ${alert.title}`,
        severity: this.mapToPagerDutySeverity(alert.severity),
        source: 'TokenTra',
        timestamp: alert.triggeredAt,
        custom_details: {
          description: alert.description,
          current_value: alert.currentValue,
          threshold: alert.thresholdValue,
          alert_type: alert.type,
          ...alert.context
        }
      },
      links: [
        {
          href: `https://app.tokentra.io/alerts/${alert.id}`,
          text: 'View in TokenTra'
        }
      ]
    };
    
    try {
      const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || `PagerDuty error: ${response.status}` };
      }
      
      const result = await response.json();
      return { success: true, messageId: result.dedup_key };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  
  private mapToPagerDutySeverity(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical': return 'critical';
      case 'warning': return 'warning';
      case 'info': return 'info';
    }
  }
  
  // ========================================
  // WEBHOOK
  // ========================================
  
  private async sendWebhook(config: WebhookConfig, alert: Alert): Promise<NotificationResult> {
    const payload = {
      event: 'alert.triggered',
      timestamp: new Date().toISOString(),
      alert: {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
        title: alert.title,
        description: alert.description,
        currentValue: alert.currentValue,
        thresholdValue: alert.thresholdValue,
        context: alert.context,
        triggeredAt: alert.triggeredAt
      }
    };
    
    // Sign the payload if secret is provided
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'TokenTra-Webhook/1.0'
    };
    
    if (config.secret) {
      const signature = await this.signPayload(JSON.stringify(payload), config.secret);
      headers['X-TokenTra-Signature'] = signature;
    }
    
    // Add custom headers
    if (config.headers) {
      Object.assign(headers, config.headers);
    }
    
    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        return { success: false, error: `Webhook error: ${response.status}` };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
  
  private async signPayload(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Types
interface EmailConfig {
  recipients: string[];
}

interface SlackConfig {
  webhookUrl: string;
  channel?: string;
}

interface PagerDutyConfig {
  integrationKey: string;
  allSeverities?: boolean;
}

interface WebhookConfig {
  url: string;
  secret?: string;
  headers?: Record<string, string>;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
  reason?: string;
}
```

---

## 7. Alert Lifecycle Management

### 7.1 Alert State Machine

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
              ┌──────────┐                                 │
  Trigger ───►│  ACTIVE  │◄────────────────┐              │
              └────┬─────┘                 │              │
                   │                       │              │
       ┌───────────┼───────────┐           │              │
       │           │           │           │              │
       ▼           ▼           ▼           │              │
  ┌─────────┐ ┌─────────┐ ┌─────────┐      │              │
  │ACKNOWL- │ │ SNOOZED │ │RESOLVED │      │              │
  │  EDGED  │ └────┬────┘ └─────────┘      │              │
  └────┬────┘      │           ▲           │              │
       │           │           │           │              │
       │           │     Auto-resolve      │              │
       │           │     (condition        │              │
       │           │      cleared)         │              │
       │           │           │           │              │
       │           └───────────┼───────────┘              │
       │                       │                          │
       │              Snooze expires                      │
       │              & condition                         │
       │              still met                           │
       │                       │                          │
       └───────────────────────┴──────────────────────────┘
                    Re-trigger
```

### 7.2 Lifecycle Manager

```typescript
// lib/engines/alerting/AlertLifecycleManager.ts

export class AlertLifecycleManager {
  private supabase: SupabaseClient;
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  
  /**
   * Acknowledge an alert
   */
  async acknowledge(
    alertId: string,
    userId: string,
    note?: string
  ): Promise<Alert> {
    const { data: alert, error } = await this.supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId,
        acknowledgment_note: note
      })
      .eq('id', alertId)
      .eq('status', 'active')
      .select()
      .single();
    
    if (error) throw error;
    
    // Log action
    await this.logAction(alertId, 'acknowledged', userId, note);
    
    // Emit event
    await this.emitLifecycleEvent(alert.org_id, alertId, 'acknowledged');
    
    return alert;
  }
  
  /**
   * Snooze an alert
   */
  async snooze(
    alertId: string,
    userId: string,
    duration: '15m' | '1h' | '4h' | '24h' | 'custom',
    customMinutes?: number
  ): Promise<Alert> {
    const snoozeMinutes = this.getSnoozeDuration(duration, customMinutes);
    const snoozeUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);
    
    const { data: alert, error } = await this.supabase
      .from('alerts')
      .update({
        status: 'snoozed',
        snoozed_until: snoozeUntil.toISOString(),
        snoozed_by: userId
      })
      .eq('id', alertId)
      .in('status', ['active', 'acknowledged'])
      .select()
      .single();
    
    if (error) throw error;
    
    // Log action
    await this.logAction(alertId, 'snoozed', userId, `Snoozed until ${snoozeUntil.toISOString()}`);
    
    // Schedule re-evaluation
    await this.scheduleSnoozeCheck(alertId, snoozeUntil);
    
    return alert;
  }
  
  /**
   * Resolve an alert
   */
  async resolve(
    alertId: string,
    userId: string,
    resolution: 'manual' | 'auto_cleared' | 'false_positive',
    note?: string
  ): Promise<Alert> {
    const { data: alert, error } = await this.supabase
      .from('alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
        resolution_type: resolution,
        resolution_note: note
      })
      .eq('id', alertId)
      .in('status', ['active', 'acknowledged', 'snoozed'])
      .select()
      .single();
    
    if (error) throw error;
    
    // Log action
    await this.logAction(alertId, 'resolved', userId, `${resolution}: ${note || ''}`);
    
    // Emit event
    await this.emitLifecycleEvent(alert.org_id, alertId, 'resolved');
    
    // If PagerDuty was notified, resolve the incident
    if (alert.notifications_sent?.some((n: any) => n.channel === 'pagerduty')) {
      await this.resolvePagerDutyIncident(alertId);
    }
    
    return alert;
  }
  
  /**
   * Check for auto-resolution
   * Called periodically to resolve alerts where condition has cleared
   */
  async checkAutoResolution(orgId: string): Promise<void> {
    // Get active/acknowledged alerts
    const { data: alerts } = await this.supabase
      .from('alerts')
      .select('*, alert_rules(*)')
      .eq('org_id', orgId)
      .in('status', ['active', 'acknowledged'])
      .gt('triggered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (!alerts) return;
    
    for (const alert of alerts) {
      // Re-evaluate the condition
      const conditionCleared = await this.isConditionCleared(alert);
      
      if (conditionCleared) {
        await this.resolve(alert.id, 'system', 'auto_cleared', 'Condition no longer met');
      }
    }
  }
  
  /**
   * Process snoozed alerts that have expired
   */
  async processSnoozedAlerts(): Promise<void> {
    const now = new Date().toISOString();
    
    // Get expired snoozed alerts
    const { data: alerts } = await this.supabase
      .from('alerts')
      .select('*, alert_rules(*)')
      .eq('status', 'snoozed')
      .lte('snoozed_until', now);
    
    if (!alerts) return;
    
    for (const alert of alerts) {
      // Check if condition is still met
      const conditionMet = await this.isConditionMet(alert);
      
      if (conditionMet) {
        // Re-activate alert
        await this.supabase
          .from('alerts')
          .update({ status: 'active', snoozed_until: null })
          .eq('id', alert.id);
        
        // Re-send notifications
        await this.resendNotifications(alert);
      } else {
        // Auto-resolve
        await this.resolve(alert.id, 'system', 'auto_cleared', 'Condition cleared during snooze');
      }
    }
  }
  
  /**
   * Get alert history/timeline
   */
  async getAlertTimeline(alertId: string): Promise<AlertTimelineEntry[]> {
    const { data } = await this.supabase
      .from('alert_actions')
      .select('*')
      .eq('alert_id', alertId)
      .order('created_at', { ascending: true });
    
    return data || [];
  }
  
  // Helper methods
  
  private getSnoozeDuration(duration: string, customMinutes?: number): number {
    switch (duration) {
      case '15m': return 15;
      case '1h': return 60;
      case '4h': return 240;
      case '24h': return 1440;
      case 'custom': return customMinutes || 60;
      default: return 60;
    }
  }
  
  private async logAction(
    alertId: string,
    action: string,
    userId: string,
    details?: string
  ): Promise<void> {
    await this.supabase.from('alert_actions').insert({
      alert_id: alertId,
      action,
      user_id: userId,
      details,
      created_at: new Date().toISOString()
    });
  }
  
  private async emitLifecycleEvent(
    orgId: string,
    alertId: string,
    event: string
  ): Promise<void> {
    await this.supabase
      .channel(`alerts:${orgId}`)
      .send({
        type: 'broadcast',
        event: `alert_${event}`,
        payload: { alertId, event, timestamp: new Date().toISOString() }
      });
  }
  
  private async isConditionCleared(alert: Alert): Promise<boolean> {
    // Re-evaluate rule without creating new trigger
    // Implementation depends on alert type
    return false; // Placeholder
  }
  
  private async isConditionMet(alert: Alert): Promise<boolean> {
    // Check if condition is still met
    return true; // Placeholder
  }
  
  private async scheduleSnoozeCheck(alertId: string, snoozeUntil: Date): Promise<void> {
    // Schedule via pg_cron or queue
  }
  
  private async resendNotifications(alert: Alert): Promise<void> {
    // Re-send notifications with "Alert re-triggered after snooze" context
  }
  
  private async resolvePagerDutyIncident(alertId: string): Promise<void> {
    // Send resolve event to PagerDuty
  }
}

interface AlertTimelineEntry {
  id: string;
  alertId: string;
  action: string;
  userId: string;
  details?: string;
  createdAt: Date;
}
```

---

## 8. Database Schema

### 8.1 Tables

```sql
-- Alert Rules Configuration
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'spend_threshold', 'budget_threshold', 'spend_anomaly',
    'forecast_exceeded', 'provider_error', 'usage_spike'
  )),
  enabled BOOLEAN DEFAULT true,
  config JSONB NOT NULL,  -- Type-specific configuration
  channels JSONB NOT NULL DEFAULT '[]',  -- Notification channels
  
  -- Rate limiting
  cooldown_minutes INTEGER DEFAULT 60,
  max_alerts_per_hour INTEGER DEFAULT 10,
  
  -- Scheduling
  active_hours JSONB,  -- { start: 9, end: 17 }
  active_days INTEGER[],  -- [1,2,3,4,5] for weekdays
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT unique_rule_name UNIQUE (org_id, name)
);

-- Triggered Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'acknowledged', 'resolved', 'snoozed'
  )),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  context JSONB DEFAULT '{}',
  
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  acknowledgment_note TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_type VARCHAR(50),
  resolution_note TEXT,
  snoozed_until TIMESTAMPTZ,
  snoozed_by UUID REFERENCES users(id),
  
  notifications_sent JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert Actions/Timeline
CREATE TABLE alert_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Channel Configuration
CREATE TABLE notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'slack', 'pagerduty', 'webhook')),
  config JSONB NOT NULL,  -- Type-specific configuration (encrypted sensitive fields)
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Baselines (for anomaly detection)
CREATE TABLE usage_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric VARCHAR(100) NOT NULL,
  
  -- Statistical measures
  mean NUMERIC NOT NULL,
  std_dev NUMERIC NOT NULL,
  median NUMERIC NOT NULL,
  mad NUMERIC NOT NULL,  -- Median Absolute Deviation
  q1 NUMERIC NOT NULL,
  q3 NUMERIC NOT NULL,
  min_value NUMERIC NOT NULL,
  max_value NUMERIC NOT NULL,
  data_points INTEGER NOT NULL,
  
  -- Metadata
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  filters JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_baseline UNIQUE (org_id, metric, filters)
);

-- Indexes
CREATE INDEX idx_alerts_org_status ON alerts(org_id, status);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX idx_alerts_snoozed ON alerts(snoozed_until) WHERE status = 'snoozed';
CREATE INDEX idx_alert_rules_org ON alert_rules(org_id, enabled);
CREATE INDEX idx_alert_actions_alert ON alert_actions(alert_id, created_at);

-- Enable RLS
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own org rules" ON alert_rules
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view own org alerts" ON alerts
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));
```

### 8.2 Database Functions

```sql
-- Get top cost contributors
CREATE OR REPLACE FUNCTION get_top_cost_contributors(
  p_org_id UUID,
  p_since TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(name TEXT, cost NUMERIC, percentage NUMERIC)
LANGUAGE SQL STABLE
AS $$
  WITH total AS (
    SELECT COALESCE(SUM(cost), 0) as total_cost
    FROM usage_records
    WHERE org_id = p_org_id AND timestamp >= p_since
  ),
  by_model AS (
    SELECT 
      model as name,
      SUM(cost) as cost
    FROM usage_records
    WHERE org_id = p_org_id AND timestamp >= p_since
    GROUP BY model
    ORDER BY cost DESC
    LIMIT p_limit
  )
  SELECT 
    bm.name,
    bm.cost,
    CASE WHEN t.total_cost > 0 
      THEN ROUND((bm.cost / t.total_cost) * 100, 1)
      ELSE 0 
    END as percentage
  FROM by_model bm, total t;
$$;

-- Get metric baseline for anomaly detection
CREATE OR REPLACE FUNCTION get_metric_baseline(
  p_org_id UUID,
  p_metric TEXT,
  p_start_date TIMESTAMPTZ,
  p_filters JSONB DEFAULT '{}'
)
RETURNS TABLE(value NUMERIC, timestamp TIMESTAMPTZ)
LANGUAGE PLPGSQL STABLE
AS $$
BEGIN
  IF p_metric = 'daily_cost' THEN
    RETURN QUERY
    SELECT 
      SUM(cost)::NUMERIC as value,
      DATE_TRUNC('day', ur.timestamp) as timestamp
    FROM usage_records ur
    WHERE ur.org_id = p_org_id 
      AND ur.timestamp >= p_start_date
    GROUP BY DATE_TRUNC('day', ur.timestamp)
    ORDER BY timestamp;
    
  ELSIF p_metric = 'hourly_cost' THEN
    RETURN QUERY
    SELECT 
      SUM(cost)::NUMERIC as value,
      DATE_TRUNC('hour', ur.timestamp) as timestamp
    FROM usage_records ur
    WHERE ur.org_id = p_org_id 
      AND ur.timestamp >= p_start_date
    GROUP BY DATE_TRUNC('hour', ur.timestamp)
    ORDER BY timestamp;
  END IF;
END;
$$;

-- Get seasonal baseline for day-of-week patterns
CREATE OR REPLACE FUNCTION get_seasonal_baseline(
  p_org_id UUID,
  p_metric TEXT,
  p_day_of_week INTEGER,
  p_hour_of_day INTEGER,
  p_weeks_back INTEGER DEFAULT 4
)
RETURNS TABLE(value NUMERIC, week_date DATE)
LANGUAGE SQL STABLE
AS $$
  SELECT 
    SUM(cost)::NUMERIC as value,
    DATE_TRUNC('week', timestamp)::DATE as week_date
  FROM usage_records
  WHERE org_id = p_org_id
    AND timestamp >= NOW() - (p_weeks_back || ' weeks')::INTERVAL
    AND EXTRACT(DOW FROM timestamp) = p_day_of_week
    AND EXTRACT(HOUR FROM timestamp) = p_hour_of_day
  GROUP BY DATE_TRUNC('week', timestamp)
  ORDER BY week_date;
$$;

-- Get daily spend history for forecasting
CREATE OR REPLACE FUNCTION get_daily_spend_history(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE(date DATE, total_cost NUMERIC)
LANGUAGE SQL STABLE
AS $$
  SELECT 
    DATE_TRUNC('day', timestamp)::DATE as date,
    SUM(cost)::NUMERIC as total_cost
  FROM usage_records
  WHERE org_id = p_org_id
    AND timestamp >= p_start_date
    AND timestamp <= p_end_date
  GROUP BY DATE_TRUNC('day', timestamp)
  ORDER BY date;
$$;
```

---

## 9. Background Jobs & Scheduling

### 9.1 pg_cron Jobs

```sql
-- Evaluate alerts every minute
SELECT cron.schedule(
  'evaluate-alerts-1min',
  '* * * * *',  -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/evaluate-alerts',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"batch": "high_frequency"}'::jsonb
  );
  $$
);

-- Evaluate less critical alerts every 5 minutes
SELECT cron.schedule(
  'evaluate-alerts-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/evaluate-alerts',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"batch": "standard"}'::jsonb
  );
  $$
);

-- Process snoozed alerts every minute
SELECT cron.schedule(
  'process-snoozed-alerts',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/process-snoozed-alerts',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Update baselines daily at 2 AM
SELECT cron.schedule(
  'update-baselines',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/update-baselines',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Check auto-resolution every 15 minutes
SELECT cron.schedule(
  'check-auto-resolution',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/check-auto-resolution',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### 9.2 Edge Function for Alert Evaluation

```typescript
// supabase/functions/evaluate-alerts/index.ts

import { createClient } from '@supabase/supabase-js';
import { AlertEngine } from '../../../lib/engines/alerting/AlertEngine';

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const { batch } = await req.json();
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const alertEngine = new AlertEngine(supabaseUrl, supabaseKey);
  
  // Get organizations with active alert rules
  const { data: orgs } = await supabase
    .from('alert_rules')
    .select('org_id')
    .eq('enabled', true)
    .then(({ data }) => ({
      data: [...new Set(data?.map(r => r.org_id))]
    }));
  
  if (!orgs) {
    return new Response(JSON.stringify({ evaluated: 0 }));
  }
  
  // Filter by batch type
  const orgsToProcess = batch === 'high_frequency'
    ? await filterHighFrequencyOrgs(supabase, orgs)
    : orgs;
  
  // Evaluate each organization
  const results = await Promise.allSettled(
    orgsToProcess.map(orgId => alertEngine.evaluateOrganization(orgId))
  );
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  return new Response(JSON.stringify({
    evaluated: orgsToProcess.length,
    succeeded,
    failed
  }));
});

async function filterHighFrequencyOrgs(supabase: any, orgs: string[]): Promise<string[]> {
  // Return orgs that have critical/high-priority rules
  const { data } = await supabase
    .from('alert_rules')
    .select('org_id')
    .in('org_id', orgs)
    .eq('enabled', true)
    .or('type.eq.spend_anomaly,type.eq.provider_error,type.eq.usage_spike');
  
  return [...new Set(data?.map((r: any) => r.org_id))] as string[];
}
```

---

## 10. Enterprise Features

### 10.1 Alert Correlation

Group related alerts to reduce noise:

```typescript
export class AlertCorrelator {
  /**
   * Correlate new alert with existing active alerts
   */
  async correlate(newAlert: AlertTrigger, activeAlerts: Alert[]): Promise<{
    isCorrelated: boolean;
    correlatedAlertId?: string;
    correlationType?: 'duplicate' | 'related' | 'cascade';
  }> {
    // Check for duplicates (same rule, same values)
    const duplicate = activeAlerts.find(a => 
      a.ruleId === newAlert.ruleId &&
      a.status === 'active' &&
      Math.abs(a.currentValue - newAlert.currentValue) / a.currentValue < 0.05
    );
    
    if (duplicate) {
      return { isCorrelated: true, correlatedAlertId: duplicate.id, correlationType: 'duplicate' };
    }
    
    // Check for related alerts (same type, different threshold)
    const related = activeAlerts.find(a =>
      a.type === newAlert.type &&
      a.status === 'active' &&
      a.context?.metric === newAlert.context?.metric
    );
    
    if (related) {
      return { isCorrelated: true, correlatedAlertId: related.id, correlationType: 'related' };
    }
    
    // Check for cascade (one alert might cause another)
    // e.g., usage spike → spend threshold
    const cascade = await this.checkCascade(newAlert, activeAlerts);
    if (cascade) {
      return { isCorrelated: true, correlatedAlertId: cascade.id, correlationType: 'cascade' };
    }
    
    return { isCorrelated: false };
  }
  
  private async checkCascade(
    newAlert: AlertTrigger,
    activeAlerts: Alert[]
  ): Promise<Alert | null> {
    // Usage spike can cause spend threshold
    if (newAlert.type === 'spend_threshold') {
      const usageSpike = activeAlerts.find(a =>
        a.type === 'usage_spike' &&
        a.status === 'active' &&
        new Date(a.triggeredAt).getTime() > Date.now() - 15 * 60 * 1000
      );
      if (usageSpike) return usageSpike;
    }
    
    // Provider error can cause various issues
    if (newAlert.type === 'usage_spike' || newAlert.type === 'spend_anomaly') {
      const providerError = activeAlerts.find(a =>
        a.type === 'provider_error' &&
        a.status === 'active'
      );
      if (providerError) return providerError;
    }
    
    return null;
  }
}
```

### 10.2 Escalation Policies

```typescript
interface EscalationPolicy {
  id: string;
  name: string;
  rules: EscalationRule[];
}

interface EscalationRule {
  delayMinutes: number;          // Time before escalation
  condition: 'not_acknowledged' | 'not_resolved';
  action: {
    type: 'notify' | 'reassign';
    channels?: NotificationChannel[];
    assignTo?: string[];  // User IDs
  };
}

export class EscalationManager {
  async checkEscalations(): Promise<void> {
    // Get alerts needing escalation
    const { data: alerts } = await this.supabase
      .from('alerts')
      .select('*, alert_rules(escalation_policy)')
      .eq('status', 'active')
      .lt('triggered_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());
    
    for (const alert of alerts || []) {
      await this.processEscalation(alert);
    }
  }
  
  private async processEscalation(alert: Alert): Promise<void> {
    const policy = alert.alert_rules?.escalation_policy as EscalationPolicy;
    if (!policy) return;
    
    const alertAge = Date.now() - new Date(alert.triggeredAt).getTime();
    const ageMinutes = alertAge / (60 * 1000);
    
    for (const rule of policy.rules) {
      if (ageMinutes >= rule.delayMinutes) {
        // Check if escalation already happened
        const alreadyEscalated = await this.hasEscalated(alert.id, rule);
        if (alreadyEscalated) continue;
        
        // Execute escalation
        await this.executeEscalation(alert, rule);
      }
    }
  }
  
  private async executeEscalation(alert: Alert, rule: EscalationRule): Promise<void> {
    if (rule.action.type === 'notify' && rule.action.channels) {
      // Send additional notifications
      for (const channel of rule.action.channels) {
        await this.notificationDispatcher.send(channel, {
          ...alert,
          title: `[ESCALATED] ${alert.title}`,
          description: `This alert has been escalated after ${rule.delayMinutes} minutes without acknowledgment.\n\n${alert.description}`
        });
      }
    }
    
    // Record escalation
    await this.supabase.from('alert_escalations').insert({
      alert_id: alert.id,
      rule: rule,
      escalated_at: new Date().toISOString()
    });
  }
}
```

### 10.3 On-Call Schedule Integration

```typescript
interface OnCallSchedule {
  id: string;
  name: string;
  timezone: string;
  rotations: Rotation[];
}

interface Rotation {
  users: string[];
  startTime: string;  // HH:MM
  endTime: string;
  days: number[];     // 0-6
}

export class OnCallManager {
  async getCurrentOnCall(scheduleId: string): Promise<string[]> {
    const { data: schedule } = await this.supabase
      .from('oncall_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();
    
    if (!schedule) return [];
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    for (const rotation of schedule.rotations as Rotation[]) {
      if (
        rotation.days.includes(currentDay) &&
        currentTime >= rotation.startTime &&
        currentTime <= rotation.endTime
      ) {
        return rotation.users;
      }
    }
    
    return [];
  }
  
  async routeToOnCall(alert: Alert): Promise<void> {
    const { data: rule } = await this.supabase
      .from('alert_rules')
      .select('oncall_schedule_id')
      .eq('id', alert.ruleId)
      .single();
    
    if (!rule?.oncall_schedule_id) return;
    
    const onCallUsers = await this.getCurrentOnCall(rule.oncall_schedule_id);
    
    // Send notifications to on-call users
    for (const userId of onCallUsers) {
      const { data: user } = await this.supabase
        .from('users')
        .select('email, phone')
        .eq('id', userId)
        .single();
      
      if (user?.email) {
        await this.notificationDispatcher.send(
          { type: 'email', config: { recipients: [user.email] }, enabled: true },
          alert
        );
      }
    }
  }
}
```

---

## 11. TypeScript Implementation

### 11.1 Complete Type Definitions

```typescript
// lib/engines/alerting/types.ts

export type AlertType = 
  | 'spend_threshold'
  | 'budget_threshold'
  | 'spend_anomaly'
  | 'forecast_exceeded'
  | 'provider_error'
  | 'usage_spike';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'snoozed';
export type NotificationChannelType = 'email' | 'slack' | 'pagerduty' | 'webhook';

// Rule configurations
export interface SpendThresholdConfig {
  metric: 'daily_cost' | 'hourly_cost' | 'weekly_cost' | 'monthly_cost';
  operator: 'gt' | 'gte' | 'lt' | 'lte';
  threshold: number;
  timeWindow: '1h' | '24h' | '7d' | '30d';
  filters?: AlertFilters;
}

export interface BudgetThresholdConfig {
  budgetId: string;
  thresholdPercent: number;
  includeForecasted?: boolean;
}

export interface SpendAnomalyConfig {
  metric: 'hourly_cost' | 'daily_cost' | 'request_cost';
  sensitivity: 'low' | 'medium' | 'high';
  timeWindow: '1h' | '4h' | '24h';
  baselinePeriod: '7d' | '14d' | '30d';
  filters?: AlertFilters;
}

export interface ForecastExceededConfig {
  metric: 'monthly_forecast' | 'quarterly_forecast';
  threshold: number;
  confidenceLevel: 0.8 | 0.9 | 0.95;
  alertDaysBefore?: number;
}

export interface ProviderErrorConfig {
  provider?: string;
  errorRateThreshold: number;
  errorCountThreshold?: number;
  timeWindow: '5m' | '15m' | '1h';
  errorTypes?: ('rate_limit' | 'timeout' | 'server_error' | 'auth_error')[];
}

export interface UsageSpikeConfig {
  metric: 'requests_per_minute' | 'tokens_per_minute' | 'requests_per_hour';
  threshold: number;
  spikeMultiplier?: number;
  timeWindow: '1m' | '5m' | '15m' | '1h';
  filters?: AlertFilters;
}

export type AlertRuleConfig = 
  | SpendThresholdConfig
  | BudgetThresholdConfig
  | SpendAnomalyConfig
  | ForecastExceededConfig
  | ProviderErrorConfig
  | UsageSpikeConfig;

export interface AlertFilters {
  providers?: string[];
  models?: string[];
  costCenters?: string[];
  teams?: string[];
  projects?: string[];
}

// Notification channel configurations
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

export interface NotificationChannel {
  type: NotificationChannelType;
  config: EmailChannelConfig | SlackChannelConfig | PagerDutyChannelConfig | WebhookChannelConfig;
  enabled: boolean;
  severityFilter?: AlertSeverity[];
}

// Core entities
export interface AlertRule {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  type: AlertType;
  enabled: boolean;
  config: AlertRuleConfig;
  channels: NotificationChannel[];
  cooldownMinutes?: number;
  maxAlertsPerHour?: number;
  activeHours?: { start: number; end: number };
  activeDays?: number[];
  escalationPolicy?: EscalationPolicy;
  onCallScheduleId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
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
  context: Record<string, any>;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  acknowledgmentNote?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionType?: 'manual' | 'auto_cleared' | 'false_positive';
  resolutionNote?: string;
  snoozedUntil?: Date;
  snoozedBy?: string;
  notificationsSent: NotificationRecord[];
  correlatedAlertId?: string;
  correlationType?: 'duplicate' | 'related' | 'cascade';
}

export interface AlertTrigger {
  ruleId: string;
  type: AlertType;
  severity: AlertSeverity;
  currentValue: number;
  thresholdValue: number;
  message: string;
  context: Record<string, any>;
  triggeredAt?: Date;
}

export interface NotificationRecord {
  channel: NotificationChannelType;
  sentAt: Date;
  success: boolean;
  error?: string;
  messageId?: string;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  rules: EscalationRule[];
}

export interface EscalationRule {
  delayMinutes: number;
  condition: 'not_acknowledged' | 'not_resolved';
  action: {
    type: 'notify' | 'reassign';
    channels?: NotificationChannel[];
    assignTo?: string[];
  };
}
```

### 11.2 React Hooks

```typescript
// hooks/useAlerts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useAlertRules(orgId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['alert-rules', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AlertRule[];
    }
  });
}

export function useActiveAlerts(orgId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['active-alerts', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*, alert_rules(name)')
        .eq('org_id', orgId)
        .in('status', ['active', 'acknowledged'])
        .order('triggered_at', { ascending: false });
      
      if (error) throw error;
      return data as Alert[];
    },
    refetchInterval: 30000  // Refresh every 30 seconds
  });
}

export function useAlertStats(orgId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['alert-stats', orgId],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [rulesResult, triggeredResult, activeResult, channelsResult] = await Promise.all([
        supabase
          .from('alert_rules')
          .select('id, enabled')
          .eq('org_id', orgId),
        supabase
          .from('alerts')
          .select('id')
          .eq('org_id', orgId)
          .gte('triggered_at', today.toISOString()),
        supabase
          .from('alerts')
          .select('id, severity')
          .eq('org_id', orgId)
          .in('status', ['active', 'acknowledged']),
        supabase
          .from('notification_channels')
          .select('id')
          .eq('org_id', orgId)
          .eq('enabled', true)
      ]);
      
      return {
        totalRules: rulesResult.data?.length || 0,
        enabledRules: rulesResult.data?.filter(r => r.enabled).length || 0,
        triggeredToday: triggeredResult.data?.length || 0,
        activeAlerts: activeResult.data?.length || 0,
        criticalAlerts: activeResult.data?.filter(a => a.severity === 'critical').length || 0,
        channelsConfigured: channelsResult.data?.length || 0
      };
    }
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({ alertId, note }: { alertId: string; note?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id,
          acknowledgment_note: note
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert', alertId] });
    }
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({
      alertId,
      resolution,
      note
    }: {
      alertId: string;
      resolution: 'manual' | 'false_positive';
      note?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          resolution_type: resolution,
          resolution_note: note
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    }
  });
}

export function useSnoozeAlert() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({
      alertId,
      duration
    }: {
      alertId: string;
      duration: '15m' | '1h' | '4h' | '24h';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const durationMinutes = {
        '15m': 15,
        '1h': 60,
        '4h': 240,
        '24h': 1440
      }[duration];
      
      const snoozeUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
      
      const { data, error } = await supabase
        .from('alerts')
        .update({
          status: 'snoozed',
          snoozed_until: snoozeUntil.toISOString(),
          snoozed_by: user?.id
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
    }
  });
}

// Real-time subscription
export function useAlertSubscription(orgId: string, onNewAlert: (alert: Alert) => void) {
  const supabase = createClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`alerts:${orgId}`)
      .on('broadcast', { event: 'new_alert' }, ({ payload }) => {
        onNewAlert(payload as Alert);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, onNewAlert]);
}
```

---

## 12. Integration Guide

### 12.1 Quick Start

```typescript
// 1. Initialize the Alert Engine
import { AlertEngine } from '@/lib/engines/alerting/AlertEngine';

const alertEngine = new AlertEngine(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 2. Create an alert rule
const rule: AlertRule = {
  id: crypto.randomUUID(),
  orgId: 'org_123',
  name: 'High Daily Spend',
  type: 'spend_threshold',
  enabled: true,
  config: {
    metric: 'daily_cost',
    operator: 'gt',
    threshold: 500,
    timeWindow: '24h'
  },
  channels: [
    {
      type: 'email',
      config: { recipients: ['finance@company.com'] },
      enabled: true
    },
    {
      type: 'slack',
      config: { webhookUrl: 'https://hooks.slack.com/...' },
      enabled: true,
      severityFilter: ['warning', 'critical']
    }
  ],
  cooldownMinutes: 60,
  createdAt: new Date(),
  updatedAt: new Date()
};

// 3. Evaluate alerts for an organization
await alertEngine.evaluateOrganization('org_123');

// 4. Manage alert lifecycle
import { AlertLifecycleManager } from '@/lib/engines/alerting/AlertLifecycleManager';

const lifecycle = new AlertLifecycleManager(supabase);

// Acknowledge
await lifecycle.acknowledge('alert_123', 'user_456', 'Looking into it');

// Snooze
await lifecycle.snooze('alert_123', 'user_456', '1h');

// Resolve
await lifecycle.resolve('alert_123', 'user_456', 'manual', 'Fixed the runaway script');
```

### 12.2 Environment Variables

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Notifications
RESEND_API_KEY=re_...  # For email

# Optional
PAGERDUTY_DEFAULT_KEY=...  # Fallback PagerDuty key
```

---

## Summary

This Alerting Engine provides:

1. **6 Alert Types**: Spend threshold, budget threshold, anomaly detection, forecast exceeded, provider errors, usage spikes

2. **Multi-Algorithm Anomaly Detection**: Z-score, IQR, MAD, and seasonal pattern analysis with consensus-based triggering

3. **Smart Forecasting**: Ensemble of linear, weighted average, exponential smoothing, and trend-adjusted methods

4. **Multi-Channel Delivery**: Email (Resend), Slack, PagerDuty, and webhooks with rich formatting

5. **Alert Lifecycle**: Active → Acknowledged → Resolved/Snoozed with full audit trail

6. **Enterprise Features**: Alert correlation, escalation policies, on-call schedules, deduplication

7. **Real-time Updates**: Supabase Realtime for instant UI updates

This engine is designed to handle enterprise scale (1M+ events/day) while being configurable enough for startups spending $5K/month.
