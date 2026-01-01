/**
 * Budget Management System - Type Definitions
 * 
 * Core types for the enterprise-grade budget management system.
 */

// =============================================================================
// ENUMS
// =============================================================================

export type BudgetType = 
  | 'organization' 
  | 'team' 
  | 'project' 
  | 'cost_center' 
  | 'provider' 
  | 'model' 
  | 'api_key' 
  | 'user';

export type BudgetPeriod = 
  | 'monthly' 
  | 'quarterly' 
  | 'annual' 
  | 'weekly' 
  | 'custom';

export type BudgetMode = 
  | 'soft'      // Alert only
  | 'hard'      // Block when exceeded
  | 'throttle'; // Rate limit when approaching

export type BudgetStatus = 
  | 'ok'       // On track (legacy)
  | 'warning'  // Approaching limit (legacy)
  | 'exceeded' // Over budget (legacy)
  | 'active' 
  | 'paused' 
  | 'archived';

export type PeriodStatus = 
  | 'active' 
  | 'completed' 
  | 'overspent';

export type ThresholdAction = 
  | 'alert' 
  | 'throttle' 
  | 'block';

export type AdjustmentType = 
  | 'increase' 
  | 'decrease' 
  | 'transfer_in' 
  | 'transfer_out';

export type AllocationType = 
  | 'fixed' 
  | 'percentage' 
  | 'dynamic';

// =============================================================================
// CORE INTERFACES
// =============================================================================

export interface Budget {
  id: string;
  organizationId: string;
  
  // Identity
  name: string;
  description?: string;
  type: BudgetType;
  
  // Scope (only one set based on type)
  teamId?: string;
  projectId?: string;
  costCenterId?: string;
  provider?: string;
  model?: string;
  apiKeyId?: string;
  userId?: string;
  
  // Legacy scope field for backward compatibility
  scopeId?: string;
  
  // Amount
  amount: number;
  currency: string;
  
  // Period
  period: BudgetPeriod;
  periodStart?: string;
  periodEnd?: string;
  
  // Behavior
  mode: BudgetMode;
  throttlePercentage?: number;
  
  // Rollover
  rolloverEnabled: boolean;
  rolloverPercentage: number;
  rolloverCap?: number;
  
  // Status
  status: BudgetStatus;
  
  // Current spend (for backward compatibility)
  currentSpend: number;
  
  // Legacy alert thresholds array
  alertThresholds?: number[];
  hardLimit?: boolean;
  
  // Metadata
  tags: string[];
  metadata: Record<string, unknown>;
  
  // Audit
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetThreshold {
  id: string;
  budgetId: string;
  percentage: number;
  alertEnabled: boolean;
  alertChannels?: AlertChannel[];
  action: ThresholdAction;
  triggeredAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface BudgetPeriodData {
  id: string;
  budgetId: string;
  periodStart: string;
  periodEnd: string;
  allocatedAmount: number;
  rolloverAmount: number;
  adjustedAmount: number;
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  forecastedSpend?: number;
  forecastedEndDate?: string;
  daysUntilExhaustion?: number;
  status: PeriodStatus;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAllocation {
  id: string;
  parentBudgetId: string;
  childBudgetId: string;
  allocationType: AllocationType;
  allocationValue: number;
  minAmount?: number;
  maxAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAdjustment {
  id: string;
  budgetId: string;
  budgetPeriodId?: string;
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
  relatedBudgetId?: string;
  requiresApproval: boolean;
  approvedAt?: string;
  approvedBy?: string;
  createdBy: string;
  createdAt: string;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'pagerduty' | 'webhook';
  config: Record<string, unknown>;
}

// =============================================================================
// EXTENDED INTERFACES
// =============================================================================

export interface BudgetWithPeriod extends Budget {
  currentPeriod?: BudgetPeriodData;
  thresholds: BudgetThreshold[];
}

export interface BudgetSummary {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: BudgetType;
  baseAmount: number;
  period: BudgetPeriod;
  mode: BudgetMode;
  status: BudgetStatus;
  periodId?: string;
  periodStart?: string;
  periodEnd?: string;
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  forecastedSpend?: number;
  forecastedEndDate?: string;
  daysUntilExhaustion?: number;
  // Scope names
  teamId?: string;
  teamName?: string;
  projectId?: string;
  projectName?: string;
  costCenterId?: string;
  costCenterName?: string;
  provider?: string;
  model?: string;
  rolloverEnabled: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetHierarchyNode {
  id: string;
  organizationId: string;
  name: string;
  type: BudgetType;
  amount: number;
  parentId?: string;
  depth: number;
  path: string[];
  fullPath: string;
  spentAmount?: number;
  remainingAmount?: number;
  utilizationPercentage?: number;
  children?: BudgetHierarchyNode[];
}

export interface BudgetAlertStatus {
  budgetId: string;
  organizationId: string;
  budgetName: string;
  budgetType: BudgetType;
  totalBudget: number;
  spentAmount: number;
  utilizationPercentage: number;
  thresholdId: string;
  thresholdPercentage: number;
  thresholdAction: ThresholdAction;
  thresholdStatus: 'ok' | 'approaching' | 'exceeded';
  triggeredAt?: string;
  acknowledgedAt?: string;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

export interface CreateBudgetInput {
  name: string;
  description?: string;
  type: BudgetType;
  teamId?: string;
  projectId?: string;
  costCenterId?: string;
  provider?: string;
  model?: string;
  apiKeyId?: string;
  userId?: string;
  amount: number;
  currency?: string;
  period: BudgetPeriod;
  periodStart?: string;
  periodEnd?: string;
  mode?: BudgetMode;
  throttlePercentage?: number;
  rolloverEnabled?: boolean;
  rolloverPercentage?: number;
  rolloverCap?: number;
  thresholds?: Array<{
    percentage: number;
    action?: ThresholdAction;
    alertEnabled?: boolean;
  }>;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateBudgetInput {
  name?: string;
  description?: string;
  amount?: number;
  mode?: BudgetMode;
  throttlePercentage?: number;
  rolloverEnabled?: boolean;
  rolloverPercentage?: number;
  rolloverCap?: number;
  status?: BudgetStatus;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateThresholdInput {
  percentage: number;
  action?: ThresholdAction;
  alertEnabled?: boolean;
  alertChannels?: AlertChannel[];
}

export interface CreateAdjustmentInput {
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
  relatedBudgetId?: string;
}

export interface AllocateBudgetInput {
  childBudgetId: string;
  allocationType: AllocationType;
  allocationValue: number;
  minAmount?: number;
  maxAmount?: number;
}

// =============================================================================
// QUERY TYPES
// =============================================================================

export interface BudgetFilters {
  type?: BudgetType | BudgetType[];
  status?: BudgetStatus | BudgetStatus[];
  teamId?: string;
  projectId?: string;
  costCenterId?: string;
  provider?: string;
  minUtilization?: number;
  maxUtilization?: number;
  exceededOnly?: boolean;
}

export interface BudgetQueryOptions {
  filters?: BudgetFilters;
  includeThresholds?: boolean;
  includeCurrentPeriod?: boolean;
  includeAllocations?: boolean;
  sortBy?: 'name' | 'utilization' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface BudgetsResponse {
  budgets: BudgetSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface BudgetStatsResponse {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallUtilization: number;
  budgetCount: number;
  exceededCount: number;
  approachingCount: number;
  byType: Record<BudgetType, {
    count: number;
    totalBudget: number;
    totalSpent: number;
  }>;
}
