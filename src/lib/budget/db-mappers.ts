/**
 * Budget Management System - Database Mappers
 * 
 * Converts between database row format and TypeScript types.
 */

import type {
  Budget,
  BudgetThreshold,
  BudgetPeriodData,
  BudgetAllocation,
  BudgetAdjustment,
  BudgetSummary,
  BudgetType,
  BudgetPeriod,
  BudgetMode,
  BudgetStatus,
  PeriodStatus,
  ThresholdAction,
  AdjustmentType,
  AllocationType,
} from './types';

// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

export interface BudgetRow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: string;
  team_id?: string;
  project_id?: string;
  cost_center_id?: string;
  provider?: string;
  model?: string;
  api_key_id?: string;
  user_id?: string;
  scope_id?: string;
  amount: number;
  currency: string;
  period: string;
  period_start?: string;
  period_end?: string;
  mode: string;
  throttle_percentage?: number;
  rollover_enabled: boolean;
  rollover_percentage: number;
  rollover_cap?: number;
  status: string;
  current_spend: number;
  alert_thresholds?: number[];
  hard_limit?: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetThresholdRow {
  id: string;
  budget_id: string;
  percentage: number;
  alert_enabled: boolean;
  alert_channels?: unknown[];
  action: string;
  triggered_at?: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  created_at: string;
}

export interface BudgetPeriodRow {
  id: string;
  budget_id: string;
  period_start: string;
  period_end: string;
  allocated_amount: number;
  rollover_amount: number;
  adjusted_amount: number;
  spent_amount: number;
  forecasted_spend?: number;
  forecasted_end_date?: string;
  days_until_exhaustion?: number;
  status: string;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetAllocationRow {
  id: string;
  parent_budget_id: string;
  child_budget_id: string;
  allocation_type: string;
  allocation_value: number;
  min_amount?: number;
  max_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetAdjustmentRow {
  id: string;
  budget_id: string;
  budget_period_id?: string;
  adjustment_type: string;
  amount: number;
  reason: string;
  related_budget_id?: string;
  requires_approval: boolean;
  approved_at?: string;
  approved_by?: string;
  created_by: string;
  created_at: string;
}

export interface BudgetSummaryRow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: string;
  base_amount: number;
  period: string;
  mode: string;
  status: string;
  team_id?: string;
  team_name?: string;
  project_id?: string;
  project_name?: string;
  cost_center_id?: string;
  cost_center_name?: string;
  provider?: string;
  model?: string;
  rollover_enabled: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  period_id?: string;
  period_start?: string;
  period_end?: string;
  total_budget: number;
  spent_amount: number;
  remaining_amount: number;
  utilization_percentage: number;
  forecasted_spend?: number;
  forecasted_end_date?: string;
  days_until_exhaustion?: number;
}

// =============================================================================
// MAPPERS: DB -> TypeScript
// =============================================================================

export function mapBudgetFromDb(row: BudgetRow): Budget {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    type: row.type as BudgetType,
    teamId: row.team_id,
    projectId: row.project_id,
    costCenterId: row.cost_center_id,
    provider: row.provider,
    model: row.model,
    apiKeyId: row.api_key_id,
    userId: row.user_id,
    scopeId: row.scope_id,
    amount: Number(row.amount),
    currency: row.currency,
    period: row.period as BudgetPeriod,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    mode: row.mode as BudgetMode,
    throttlePercentage: row.throttle_percentage ? Number(row.throttle_percentage) : undefined,
    rolloverEnabled: row.rollover_enabled,
    rolloverPercentage: Number(row.rollover_percentage),
    rolloverCap: row.rollover_cap ? Number(row.rollover_cap) : undefined,
    status: row.status as BudgetStatus,
    currentSpend: Number(row.current_spend || 0),
    alertThresholds: row.alert_thresholds,
    hardLimit: row.hard_limit,
    tags: row.tags || [],
    metadata: row.metadata || {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapThresholdFromDb(row: BudgetThresholdRow): BudgetThreshold {
  return {
    id: row.id,
    budgetId: row.budget_id,
    percentage: Number(row.percentage),
    alertEnabled: row.alert_enabled,
    alertChannels: row.alert_channels as BudgetThreshold['alertChannels'],
    action: row.action as ThresholdAction,
    triggeredAt: row.triggered_at,
    acknowledgedAt: row.acknowledged_at,
    acknowledgedBy: row.acknowledged_by,
    createdAt: row.created_at,
  };
}

export function mapPeriodFromDb(row: BudgetPeriodRow): BudgetPeriodData {
  const allocatedAmount = Number(row.allocated_amount);
  const rolloverAmount = Number(row.rollover_amount || 0);
  const adjustedAmount = Number(row.adjusted_amount || 0);
  const spentAmount = Number(row.spent_amount || 0);
  const totalBudget = allocatedAmount + rolloverAmount + adjustedAmount;
  
  return {
    id: row.id,
    budgetId: row.budget_id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    allocatedAmount,
    rolloverAmount,
    adjustedAmount,
    totalBudget,
    spentAmount,
    remainingAmount: totalBudget - spentAmount,
    utilizationPercentage: totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0,
    forecastedSpend: row.forecasted_spend ? Number(row.forecasted_spend) : undefined,
    forecastedEndDate: row.forecasted_end_date,
    daysUntilExhaustion: row.days_until_exhaustion,
    status: row.status as PeriodStatus,
    lastCalculatedAt: row.last_calculated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAllocationFromDb(row: BudgetAllocationRow): BudgetAllocation {
  return {
    id: row.id,
    parentBudgetId: row.parent_budget_id,
    childBudgetId: row.child_budget_id,
    allocationType: row.allocation_type as AllocationType,
    allocationValue: Number(row.allocation_value),
    minAmount: row.min_amount ? Number(row.min_amount) : undefined,
    maxAmount: row.max_amount ? Number(row.max_amount) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAdjustmentFromDb(row: BudgetAdjustmentRow): BudgetAdjustment {
  return {
    id: row.id,
    budgetId: row.budget_id,
    budgetPeriodId: row.budget_period_id,
    adjustmentType: row.adjustment_type as AdjustmentType,
    amount: Number(row.amount),
    reason: row.reason,
    relatedBudgetId: row.related_budget_id,
    requiresApproval: row.requires_approval,
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function mapSummaryFromDb(row: BudgetSummaryRow): BudgetSummary {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    type: row.type as BudgetType,
    baseAmount: Number(row.base_amount),
    period: row.period as BudgetPeriod,
    mode: row.mode as BudgetMode,
    status: row.status as BudgetStatus,
    periodId: row.period_id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    totalBudget: Number(row.total_budget || row.base_amount),
    spentAmount: Number(row.spent_amount || 0),
    remainingAmount: Number(row.remaining_amount || row.base_amount),
    utilizationPercentage: Number(row.utilization_percentage || 0),
    forecastedSpend: row.forecasted_spend ? Number(row.forecasted_spend) : undefined,
    forecastedEndDate: row.forecasted_end_date,
    daysUntilExhaustion: row.days_until_exhaustion,
    teamId: row.team_id,
    teamName: row.team_name,
    projectId: row.project_id,
    projectName: row.project_name,
    costCenterId: row.cost_center_id,
    costCenterName: row.cost_center_name,
    provider: row.provider,
    model: row.model,
    rolloverEnabled: row.rollover_enabled,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// =============================================================================
// MAPPERS: TypeScript -> DB
// =============================================================================

export function mapBudgetToDb(budget: Partial<Budget>): Partial<BudgetRow> {
  const row: Partial<BudgetRow> = {};
  
  if (budget.organizationId !== undefined) row.organization_id = budget.organizationId;
  if (budget.name !== undefined) row.name = budget.name;
  if (budget.description !== undefined) row.description = budget.description;
  if (budget.type !== undefined) row.type = budget.type;
  if (budget.teamId !== undefined) row.team_id = budget.teamId;
  if (budget.projectId !== undefined) row.project_id = budget.projectId;
  if (budget.costCenterId !== undefined) row.cost_center_id = budget.costCenterId;
  if (budget.provider !== undefined) row.provider = budget.provider;
  if (budget.model !== undefined) row.model = budget.model;
  if (budget.apiKeyId !== undefined) row.api_key_id = budget.apiKeyId;
  if (budget.userId !== undefined) row.user_id = budget.userId;
  if (budget.amount !== undefined) row.amount = budget.amount;
  if (budget.currency !== undefined) row.currency = budget.currency;
  if (budget.period !== undefined) row.period = budget.period;
  if (budget.periodStart !== undefined) row.period_start = budget.periodStart;
  if (budget.periodEnd !== undefined) row.period_end = budget.periodEnd;
  if (budget.mode !== undefined) row.mode = budget.mode;
  if (budget.throttlePercentage !== undefined) row.throttle_percentage = budget.throttlePercentage;
  if (budget.rolloverEnabled !== undefined) row.rollover_enabled = budget.rolloverEnabled;
  if (budget.rolloverPercentage !== undefined) row.rollover_percentage = budget.rolloverPercentage;
  if (budget.rolloverCap !== undefined) row.rollover_cap = budget.rolloverCap;
  if (budget.status !== undefined) row.status = budget.status;
  if (budget.tags !== undefined) row.tags = budget.tags;
  if (budget.metadata !== undefined) row.metadata = budget.metadata;
  if (budget.createdBy !== undefined) row.created_by = budget.createdBy;
  
  return row;
}

export function mapThresholdToDb(threshold: Partial<BudgetThreshold>): Partial<BudgetThresholdRow> {
  const row: Partial<BudgetThresholdRow> = {};
  
  if (threshold.budgetId !== undefined) row.budget_id = threshold.budgetId;
  if (threshold.percentage !== undefined) row.percentage = threshold.percentage;
  if (threshold.alertEnabled !== undefined) row.alert_enabled = threshold.alertEnabled;
  if (threshold.alertChannels !== undefined) row.alert_channels = threshold.alertChannels;
  if (threshold.action !== undefined) row.action = threshold.action;
  
  return row;
}
