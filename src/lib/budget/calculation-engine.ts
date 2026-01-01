/**
 * Budget Management System - Calculation Engine
 * 
 * Handles spend calculations, period management, and forecasting.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Budget,
  BudgetPeriodData,
  BudgetHierarchyNode,
  BudgetType,
} from './types';
import {
  mapBudgetFromDb,
  mapPeriodFromDb,
  type BudgetRow,
  type BudgetPeriodRow,
} from './db-mappers';

interface SpendByDimension {
  dimension: string;
  value: string;
  spend: number;
}

export class BudgetCalculationEngine {
  constructor(private supabase: SupabaseClient) {}

  // ===========================================================================
  // SPEND CALCULATION
  // ===========================================================================

  async calculateBudgetSpend(
    budgetId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    const { data: budget, error: budgetError } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();

    if (budgetError) throw new Error(`Budget not found: ${budgetError.message}`);

    const mappedBudget = mapBudgetFromDb(budget as BudgetRow);

    // Build query based on budget type
    let query = this.supabase
      .from('usage_records')
      .select('cost')
      .eq('organization_id', mappedBudget.organizationId)
      .gte('timestamp', periodStart.toISOString())
      .lte('timestamp', periodEnd.toISOString());

    // Apply scope filters based on budget type
    switch (mappedBudget.type) {
      case 'team':
        if (mappedBudget.teamId) {
          query = query.eq('team_id', mappedBudget.teamId);
        }
        break;
      case 'project':
        if (mappedBudget.projectId) {
          query = query.eq('project_id', mappedBudget.projectId);
        }
        break;
      case 'cost_center':
        if (mappedBudget.costCenterId) {
          query = query.eq('cost_center_id', mappedBudget.costCenterId);
        }
        break;
      case 'provider':
        if (mappedBudget.provider) {
          query = query.eq('provider', mappedBudget.provider);
        }
        break;
      case 'model':
        if (mappedBudget.model) {
          query = query.eq('model', mappedBudget.model);
        }
        break;
      // 'organization' type has no additional filters - gets all org spend
    }

    const { data: records, error } = await query;

    if (error) {
      console.error('[BudgetCalculationEngine] Error fetching usage:', error);
      return 0;
    }

    return records?.reduce((sum, r) => sum + (Number(r.cost) || 0), 0) || 0;
  }

  async calculateSpendBreakdown(
    budgetId: string,
    periodStart: Date,
    periodEnd: Date,
    groupBy: 'provider' | 'model' | 'team' | 'project' | 'day'
  ): Promise<SpendByDimension[]> {
    const { data: budget, error: budgetError } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();

    if (budgetError) throw new Error(`Budget not found: ${budgetError.message}`);

    const mappedBudget = mapBudgetFromDb(budget as BudgetRow);

    // For now, return mock breakdown data
    // In production, this would aggregate from usage_records
    const breakdown: SpendByDimension[] = [];

    if (groupBy === 'provider') {
      breakdown.push(
        { dimension: 'provider', value: 'openai', spend: mappedBudget.currentSpend * 0.6 },
        { dimension: 'provider', value: 'anthropic', spend: mappedBudget.currentSpend * 0.3 },
        { dimension: 'provider', value: 'google', spend: mappedBudget.currentSpend * 0.1 }
      );
    } else if (groupBy === 'model') {
      breakdown.push(
        { dimension: 'model', value: 'gpt-4o', spend: mappedBudget.currentSpend * 0.4 },
        { dimension: 'model', value: 'claude-3-5-sonnet', spend: mappedBudget.currentSpend * 0.35 },
        { dimension: 'model', value: 'gpt-4o-mini', spend: mappedBudget.currentSpend * 0.25 }
      );
    }

    return breakdown;
  }

  // ===========================================================================
  // PERIOD MANAGEMENT
  // ===========================================================================

  async updatePeriodSpend(periodId: string): Promise<BudgetPeriodData> {
    const { data: period, error: periodError } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('id', periodId)
      .single();

    if (periodError) throw new Error(`Period not found: ${periodError.message}`);

    const mappedPeriod = mapPeriodFromDb(period as BudgetPeriodRow);

    const spend = await this.calculateBudgetSpend(
      mappedPeriod.budgetId,
      new Date(mappedPeriod.periodStart),
      new Date(mappedPeriod.periodEnd)
    );

    const { data: updated, error } = await this.supabase
      .from('budget_periods')
      .update({
        spent_amount: spend,
        last_calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', periodId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update period: ${error.message}`);

    // Also update the budget's current_spend for backward compatibility
    await this.supabase
      .from('budgets')
      .update({ current_spend: spend, updated_at: new Date().toISOString() })
      .eq('id', mappedPeriod.budgetId);

    return mapPeriodFromDb(updated as BudgetPeriodRow);
  }

  async recalculateOrgBudgets(organizationId: string): Promise<number> {
    const { data: budgets, error } = await this.supabase
      .from('budgets')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (error) throw new Error(`Failed to fetch budgets: ${error.message}`);
    if (!budgets || budgets.length === 0) return 0;

    let updated = 0;
    for (const budget of budgets) {
      try {
        // Get or create current period
        const { data: periodId } = await this.supabase
          .rpc('get_current_budget_period', { p_budget_id: budget.id });

        if (periodId) {
          await this.updatePeriodSpend(periodId);
          updated++;
        }
      } catch (err) {
        console.error(`[BudgetCalculationEngine] Error updating budget ${budget.id}:`, err);
      }
    }

    return updated;
  }

  // ===========================================================================
  // FORECASTING
  // ===========================================================================

  async calculateForecast(budgetId: string): Promise<{
    forecastedSpend: number;
    forecastedEndDate: string | null;
    daysUntilExhaustion: number | null;
  }> {
    const { data: period, error } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('status', 'active')
      .single();

    if (error || !period) {
      return { forecastedSpend: 0, forecastedEndDate: null, daysUntilExhaustion: null };
    }

    const mappedPeriod = mapPeriodFromDb(period as BudgetPeriodRow);
    const now = new Date();
    const periodStart = new Date(mappedPeriod.periodStart);
    const periodEnd = new Date(mappedPeriod.periodEnd);

    // Calculate days elapsed and remaining
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    if (daysElapsed <= 0) {
      return { forecastedSpend: 0, forecastedEndDate: null, daysUntilExhaustion: null };
    }

    // Calculate daily burn rate
    const dailyBurnRate = mappedPeriod.spentAmount / daysElapsed;

    // Forecast end-of-period spend
    const forecastedSpend = mappedPeriod.spentAmount + (dailyBurnRate * daysRemaining);

    // Calculate days until budget exhaustion
    let daysUntilExhaustion: number | null = null;
    let forecastedEndDate: string | null = null;

    if (dailyBurnRate > 0 && mappedPeriod.remainingAmount > 0) {
      daysUntilExhaustion = Math.ceil(mappedPeriod.remainingAmount / dailyBurnRate);
      const exhaustionDate = new Date(now.getTime() + daysUntilExhaustion * 24 * 60 * 60 * 1000);
      forecastedEndDate = exhaustionDate.toISOString().split('T')[0];
    }

    // Update the period with forecast data
    await this.supabase
      .from('budget_periods')
      .update({
        forecasted_spend: forecastedSpend,
        forecasted_end_date: forecastedEndDate,
        days_until_exhaustion: daysUntilExhaustion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mappedPeriod.id);

    return { forecastedSpend, forecastedEndDate, daysUntilExhaustion };
  }

  // ===========================================================================
  // HIERARCHY
  // ===========================================================================

  async getBudgetHierarchy(organizationId: string): Promise<BudgetHierarchyNode[]> {
    // Get all budgets with their allocations
    const { data: budgets, error } = await this.supabase
      .from('budgets')
      .select(`
        *,
        budget_periods!inner(*)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .eq('budget_periods.status', 'active');

    if (error) {
      console.error('[BudgetCalculationEngine] Error fetching hierarchy:', error);
      return [];
    }

    // Get allocations
    const { data: allocations } = await this.supabase
      .from('budget_allocations')
      .select('*');

    // Build parent-child map
    const parentMap = new Map<string, string>();
    for (const alloc of allocations || []) {
      parentMap.set(alloc.child_budget_id, alloc.parent_budget_id);
    }

    // Build hierarchy nodes
    const nodeMap = new Map<string, BudgetHierarchyNode>();
    const roots: BudgetHierarchyNode[] = [];

    for (const row of budgets || []) {
      const budget = mapBudgetFromDb(row as BudgetRow);
      const period = row.budget_periods?.[0];

      const node: BudgetHierarchyNode = {
        id: budget.id,
        organizationId: budget.organizationId,
        name: budget.name,
        type: budget.type,
        amount: budget.amount,
        parentId: parentMap.get(budget.id),
        depth: 0,
        path: [budget.id],
        fullPath: budget.name,
        spentAmount: period?.spent_amount || budget.currentSpend,
        remainingAmount: budget.amount - (period?.spent_amount || budget.currentSpend),
        utilizationPercentage: budget.amount > 0
          ? ((period?.spent_amount || budget.currentSpend) / budget.amount) * 100
          : 0,
        children: [],
      };

      nodeMap.set(node.id, node);
    }

    // Build tree structure
    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
        node.depth = parent.depth + 1;
        node.path = [...parent.path, node.id];
        node.fullPath = `${parent.fullPath} > ${node.name}`;
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  async getOrgBudgetStats(organizationId: string): Promise<{
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    overallUtilization: number;
    budgetCount: number;
    exceededCount: number;
    approachingCount: number;
    byType: Record<string, { count: number; totalBudget: number; totalSpent: number }>;
  }> {
    const { data: summaries, error } = await this.supabase
      .from('budget_summary')
      .select('*')
      .eq('organization_id', organizationId);

    if (error || !summaries || summaries.length === 0) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallUtilization: 0,
        budgetCount: 0,
        exceededCount: 0,
        approachingCount: 0,
        byType: {},
      };
    }

    const stats = {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overallUtilization: 0,
      budgetCount: summaries.length,
      exceededCount: 0,
      approachingCount: 0,
      byType: {} as Record<string, { count: number; totalBudget: number; totalSpent: number }>,
    };

    for (const budget of summaries) {
      const totalBudget = Number(budget.total_budget || budget.base_amount || 0);
      const spentAmount = Number(budget.spent_amount || 0);
      const utilization = Number(budget.utilization_percentage || 0);

      stats.totalBudget += totalBudget;
      stats.totalSpent += spentAmount;

      if (utilization >= 100) {
        stats.exceededCount++;
      } else if (utilization >= 80) {
        stats.approachingCount++;
      }

      const budgetType = budget.type as string;
      if (!stats.byType[budgetType]) {
        stats.byType[budgetType] = { count: 0, totalBudget: 0, totalSpent: 0 };
      }
      stats.byType[budgetType].count++;
      stats.byType[budgetType].totalBudget += totalBudget;
      stats.byType[budgetType].totalSpent += spentAmount;
    }

    stats.totalRemaining = stats.totalBudget - stats.totalSpent;
    stats.overallUtilization = stats.totalBudget > 0
      ? (stats.totalSpent / stats.totalBudget) * 100
      : 0;

    return stats;
  }
}

export function createCalculationEngine(supabase: SupabaseClient): BudgetCalculationEngine {
  return new BudgetCalculationEngine(supabase);
}
