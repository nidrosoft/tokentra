/**
 * Budget Management System - Budget Service
 * 
 * Core CRUD operations for budgets.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Budget,
  BudgetSummary,
  BudgetWithPeriod,
  BudgetThreshold,
  BudgetPeriodData,
  CreateBudgetInput,
  UpdateBudgetInput,
  CreateThresholdInput,
  BudgetFilters,
  BudgetQueryOptions,
  BudgetsResponse,
  BudgetStatsResponse,
  BudgetType,
} from './types';
import {
  mapBudgetFromDb,
  mapSummaryFromDb,
  mapThresholdFromDb,
  mapPeriodFromDb,
  mapBudgetToDb,
  mapThresholdToDb,
  type BudgetRow,
  type BudgetSummaryRow,
  type BudgetThresholdRow,
  type BudgetPeriodRow,
} from './db-mappers';

export class BudgetService {
  constructor(private supabase: SupabaseClient) {}

  // ===========================================================================
  // BUDGET CRUD
  // ===========================================================================

  async createBudget(
    organizationId: string,
    input: CreateBudgetInput,
    userId?: string
  ): Promise<Budget> {
    const budgetData = mapBudgetToDb({
      organizationId,
      name: input.name,
      description: input.description,
      type: input.type,
      teamId: input.teamId,
      projectId: input.projectId,
      costCenterId: input.costCenterId,
      provider: input.provider,
      model: input.model,
      apiKeyId: input.apiKeyId,
      userId: input.userId,
      amount: input.amount,
      currency: input.currency || 'USD',
      period: input.period,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      mode: input.mode || 'soft',
      throttlePercentage: input.throttlePercentage,
      rolloverEnabled: input.rolloverEnabled || false,
      rolloverPercentage: input.rolloverPercentage || 100,
      rolloverCap: input.rolloverCap,
      status: 'ok',
      tags: input.tags || [],
      metadata: input.metadata || {},
      createdBy: userId,
    });

    const { data, error } = await this.supabase
      .from('budgets')
      .insert({
        ...budgetData,
        current_spend: 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create budget: ${error.message}`);

    const budget = mapBudgetFromDb(data as BudgetRow);

    // Create thresholds if provided
    if (input.thresholds && input.thresholds.length > 0) {
      await this.createThresholds(budget.id, input.thresholds);
    }

    // Create initial budget period
    await this.ensureCurrentPeriod(budget.id);

    return budget;
  }

  async getBudget(budgetId: string): Promise<BudgetWithPeriod | null> {
    const { data, error } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get budget: ${error.message}`);
    }

    const budget = mapBudgetFromDb(data as BudgetRow);

    // Get thresholds
    const thresholds = await this.getThresholds(budgetId);

    // Get current period
    const currentPeriod = await this.getCurrentPeriod(budgetId);

    return {
      ...budget,
      thresholds,
      currentPeriod: currentPeriod || undefined,
    };
  }

  async updateBudget(budgetId: string, input: UpdateBudgetInput): Promise<Budget> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.mode !== undefined) updateData.mode = input.mode;
    if (input.throttlePercentage !== undefined) updateData.throttle_percentage = input.throttlePercentage;
    if (input.rolloverEnabled !== undefined) updateData.rollover_enabled = input.rolloverEnabled;
    if (input.rolloverPercentage !== undefined) updateData.rollover_percentage = input.rolloverPercentage;
    if (input.rolloverCap !== undefined) updateData.rollover_cap = input.rolloverCap;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;

    const { data, error } = await this.supabase
      .from('budgets')
      .update(updateData)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update budget: ${error.message}`);

    return mapBudgetFromDb(data as BudgetRow);
  }

  async deleteBudget(budgetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

    if (error) throw new Error(`Failed to delete budget: ${error.message}`);
  }

  async archiveBudget(budgetId: string): Promise<Budget> {
    // Use 'exceeded' as a soft-delete marker since 'archived' isn't in the DB constraint
    // In production, you'd want to add 'archived' to the check constraint or use a separate column
    return this.updateBudget(budgetId, { 
      status: 'exceeded',
      metadata: { archived: true, archivedAt: new Date().toISOString() }
    });
  }

  // ===========================================================================
  // BUDGET QUERIES
  // ===========================================================================

  async listBudgets(
    organizationId: string,
    options: BudgetQueryOptions = {}
  ): Promise<BudgetsResponse> {
    const {
      filters = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 20,
    } = options;

    // Use the budget_summary view for enriched data
    let query = this.supabase
      .from('budget_summary')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters.type) {
      if (Array.isArray(filters.type)) {
        query = query.in('type', filters.type);
      } else {
        query = query.eq('type', filters.type);
      }
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.teamId) query = query.eq('team_id', filters.teamId);
    if (filters.projectId) query = query.eq('project_id', filters.projectId);
    if (filters.costCenterId) query = query.eq('cost_center_id', filters.costCenterId);
    if (filters.provider) query = query.eq('provider', filters.provider);

    if (filters.minUtilization !== undefined) {
      query = query.gte('utilization_percentage', filters.minUtilization);
    }
    if (filters.maxUtilization !== undefined) {
      query = query.lte('utilization_percentage', filters.maxUtilization);
    }
    if (filters.exceededOnly) {
      query = query.gte('utilization_percentage', 100);
    }

    // Apply sorting
    const sortColumn = {
      name: 'name',
      utilization: 'utilization_percentage',
      amount: 'base_amount',
      createdAt: 'created_at',
    }[sortBy] || 'created_at';

    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to list budgets: ${error.message}`);

    const budgets = (data || []).map((row) => mapSummaryFromDb(row as BudgetSummaryRow));
    const total = count || 0;

    return {
      budgets,
      total,
      page,
      pageSize,
      hasMore: from + budgets.length < total,
    };
  }

  async getBudgetStats(organizationId: string): Promise<BudgetStatsResponse> {
    const { data, error } = await this.supabase
      .from('budget_summary')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) throw new Error(`Failed to get budget stats: ${error.message}`);

    const budgets = (data || []).map((row) => mapSummaryFromDb(row as BudgetSummaryRow));

    const stats: BudgetStatsResponse = {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overallUtilization: 0,
      budgetCount: budgets.length,
      exceededCount: 0,
      approachingCount: 0,
      byType: {} as Record<BudgetType, { count: number; totalBudget: number; totalSpent: number }>,
    };

    for (const budget of budgets) {
      stats.totalBudget += budget.totalBudget;
      stats.totalSpent += budget.spentAmount;

      if (budget.utilizationPercentage >= 100) {
        stats.exceededCount++;
      } else if (budget.utilizationPercentage >= 80) {
        stats.approachingCount++;
      }

      if (!stats.byType[budget.type]) {
        stats.byType[budget.type] = { count: 0, totalBudget: 0, totalSpent: 0 };
      }
      stats.byType[budget.type].count++;
      stats.byType[budget.type].totalBudget += budget.totalBudget;
      stats.byType[budget.type].totalSpent += budget.spentAmount;
    }

    stats.totalRemaining = stats.totalBudget - stats.totalSpent;
    stats.overallUtilization = stats.totalBudget > 0
      ? (stats.totalSpent / stats.totalBudget) * 100
      : 0;

    return stats;
  }

  // ===========================================================================
  // THRESHOLDS
  // ===========================================================================

  async getThresholds(budgetId: string): Promise<BudgetThreshold[]> {
    const { data, error } = await this.supabase
      .from('budget_thresholds')
      .select('*')
      .eq('budget_id', budgetId)
      .order('percentage', { ascending: true });

    if (error) throw new Error(`Failed to get thresholds: ${error.message}`);

    return (data || []).map((row) => mapThresholdFromDb(row as BudgetThresholdRow));
  }

  async createThresholds(
    budgetId: string,
    thresholds: CreateThresholdInput[]
  ): Promise<BudgetThreshold[]> {
    const rows = thresholds.map((t) => ({
      budget_id: budgetId,
      percentage: t.percentage,
      action: t.action || 'alert',
      alert_enabled: t.alertEnabled !== false,
      alert_channels: t.alertChannels || [],
    }));

    const { data, error } = await this.supabase
      .from('budget_thresholds')
      .insert(rows)
      .select();

    if (error) throw new Error(`Failed to create thresholds: ${error.message}`);

    return (data || []).map((row) => mapThresholdFromDb(row as BudgetThresholdRow));
  }

  async deleteThreshold(thresholdId: string): Promise<void> {
    const { error } = await this.supabase
      .from('budget_thresholds')
      .delete()
      .eq('id', thresholdId);

    if (error) throw new Error(`Failed to delete threshold: ${error.message}`);
  }

  async acknowledgeThreshold(thresholdId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('budget_thresholds')
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId,
      })
      .eq('id', thresholdId);

    if (error) throw new Error(`Failed to acknowledge threshold: ${error.message}`);
  }

  // ===========================================================================
  // PERIODS
  // ===========================================================================

  async getCurrentPeriod(budgetId: string): Promise<BudgetPeriodData | null> {
    const { data, error } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get current period: ${error.message}`);
    }

    return mapPeriodFromDb(data as BudgetPeriodRow);
  }

  async ensureCurrentPeriod(budgetId: string): Promise<BudgetPeriodData> {
    // Call the database function to get or create the current period
    const { data: periodId, error: rpcError } = await this.supabase
      .rpc('get_current_budget_period', { p_budget_id: budgetId });

    if (rpcError) throw new Error(`Failed to ensure period: ${rpcError.message}`);

    const { data, error } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('id', periodId)
      .single();

    if (error) throw new Error(`Failed to get period: ${error.message}`);

    return mapPeriodFromDb(data as BudgetPeriodRow);
  }

  async getPeriodHistory(
    budgetId: string,
    limit: number = 12
  ): Promise<BudgetPeriodData[]> {
    const { data, error } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('budget_id', budgetId)
      .order('period_start', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get period history: ${error.message}`);

    return (data || []).map((row) => mapPeriodFromDb(row as BudgetPeriodRow));
  }
}

export function createBudgetService(supabase: SupabaseClient): BudgetService {
  return new BudgetService(supabase);
}
