/**
 * Budget Management System - Period Manager
 * 
 * Handles budget period lifecycle: creation, rollover, and closing.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { BudgetPeriodData } from './types';
import { mapPeriodFromDb, type BudgetPeriodRow, type BudgetRow } from './db-mappers';

interface PeriodRolloverResult {
  budgetId: string;
  oldPeriodId: string;
  newPeriodId: string;
  rolloverAmount: number;
  success: boolean;
  error?: string;
}

export class PeriodManager {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Close expired periods and create new ones with rollover
   */
  async processExpiredPeriods(organizationId: string): Promise<PeriodRolloverResult[]> {
    const results: PeriodRolloverResult[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Find all active periods that have ended
    const { data: expiredPeriods, error } = await this.supabase
      .from('budget_periods')
      .select(`
        *,
        budgets!inner(*)
      `)
      .eq('status', 'active')
      .lt('period_end', today)
      .eq('budgets.organization_id', organizationId);

    if (error) {
      console.error('[PeriodManager] Error fetching expired periods:', error);
      return results;
    }

    for (const period of expiredPeriods || []) {
      try {
        const result = await this.rolloverPeriod(period, period.budgets);
        results.push(result);
      } catch (err) {
        results.push({
          budgetId: period.budget_id,
          oldPeriodId: period.id,
          newPeriodId: '',
          rolloverAmount: 0,
          success: false,
          error: (err as Error).message,
        });
      }
    }

    return results;
  }

  /**
   * Rollover a single period to a new one
   */
  private async rolloverPeriod(
    period: BudgetPeriodRow,
    budget: BudgetRow
  ): Promise<PeriodRolloverResult> {
    const mappedPeriod = mapPeriodFromDb(period);

    // Calculate rollover amount
    let rolloverAmount = 0;
    if (budget.rollover_enabled && mappedPeriod.remainingAmount > 0) {
      const rolloverPercentage = budget.rollover_percentage || 100;
      rolloverAmount = (mappedPeriod.remainingAmount * rolloverPercentage) / 100;

      // Apply cap if set
      if (budget.rollover_cap && rolloverAmount > budget.rollover_cap) {
        rolloverAmount = budget.rollover_cap;
      }
    }

    // Close the old period
    const finalStatus = mappedPeriod.spentAmount > mappedPeriod.totalBudget ? 'overspent' : 'completed';
    await this.supabase
      .from('budget_periods')
      .update({
        status: finalStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', period.id);

    // Calculate new period dates
    const { periodStart, periodEnd } = this.calculateNextPeriod(
      budget.period,
      new Date(period.period_end)
    );

    // Create new period
    const { data: newPeriod, error } = await this.supabase
      .from('budget_periods')
      .insert({
        budget_id: budget.id,
        period_start: periodStart,
        period_end: periodEnd,
        allocated_amount: budget.amount,
        rollover_amount: rolloverAmount,
        adjusted_amount: 0,
        spent_amount: 0,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create new period: ${error.message}`);
    }

    // Reset thresholds for the new period
    await this.supabase
      .from('budget_thresholds')
      .update({
        triggered_at: null,
        acknowledged_at: null,
        acknowledged_by: null,
      })
      .eq('budget_id', budget.id);

    return {
      budgetId: budget.id,
      oldPeriodId: period.id,
      newPeriodId: newPeriod.id,
      rolloverAmount,
      success: true,
    };
  }

  /**
   * Calculate the next period's start and end dates
   */
  private calculateNextPeriod(
    periodType: string,
    previousEnd: Date
  ): { periodStart: string; periodEnd: string } {
    const nextDay = new Date(previousEnd);
    nextDay.setDate(nextDay.getDate() + 1);

    let periodStart: Date;
    let periodEnd: Date;

    switch (periodType) {
      case 'weekly':
        periodStart = nextDay;
        periodEnd = new Date(nextDay);
        periodEnd.setDate(periodEnd.getDate() + 6);
        break;

      case 'monthly':
        periodStart = new Date(nextDay.getFullYear(), nextDay.getMonth(), 1);
        periodEnd = new Date(nextDay.getFullYear(), nextDay.getMonth() + 1, 0);
        break;

      case 'quarterly':
        const quarter = Math.floor(nextDay.getMonth() / 3);
        periodStart = new Date(nextDay.getFullYear(), quarter * 3, 1);
        periodEnd = new Date(nextDay.getFullYear(), (quarter + 1) * 3, 0);
        break;

      case 'annual':
        periodStart = new Date(nextDay.getFullYear(), 0, 1);
        periodEnd = new Date(nextDay.getFullYear(), 11, 31);
        break;

      default:
        // Default to monthly
        periodStart = new Date(nextDay.getFullYear(), nextDay.getMonth(), 1);
        periodEnd = new Date(nextDay.getFullYear(), nextDay.getMonth() + 1, 0);
    }

    return {
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
    };
  }

  /**
   * Ensure all active budgets have a current period
   */
  async ensureAllPeriodsExist(organizationId: string): Promise<number> {
    const { data: budgets, error } = await this.supabase
      .from('budgets')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (error || !budgets) {
      console.error('[PeriodManager] Error fetching budgets:', error);
      return 0;
    }

    let created = 0;
    for (const budget of budgets) {
      const { data: periodId } = await this.supabase
        .rpc('get_current_budget_period', { p_budget_id: budget.id });

      if (periodId) {
        created++;
      }
    }

    return created;
  }

  /**
   * Get period statistics for an organization
   */
  async getPeriodStats(organizationId: string): Promise<{
    activePeriods: number;
    completedPeriods: number;
    overspentPeriods: number;
    totalRollover: number;
  }> {
    const { data: periods, error } = await this.supabase
      .from('budget_periods')
      .select(`
        status,
        rollover_amount,
        budgets!inner(organization_id)
      `)
      .eq('budgets.organization_id', organizationId);

    if (error || !periods) {
      return {
        activePeriods: 0,
        completedPeriods: 0,
        overspentPeriods: 0,
        totalRollover: 0,
      };
    }

    return {
      activePeriods: periods.filter((p) => p.status === 'active').length,
      completedPeriods: periods.filter((p) => p.status === 'completed').length,
      overspentPeriods: periods.filter((p) => p.status === 'overspent').length,
      totalRollover: periods.reduce((sum, p) => sum + (Number(p.rollover_amount) || 0), 0),
    };
  }
}

export function createPeriodManager(supabase: SupabaseClient): PeriodManager {
  return new PeriodManager(supabase);
}
