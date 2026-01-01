/**
 * Budget Management System - Threshold Checker
 * 
 * Monitors budget thresholds and triggers alerts/actions when exceeded.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BudgetThreshold,
  BudgetPeriodData,
  BudgetAlertStatus,
  ThresholdAction,
} from './types';
import {
  mapThresholdFromDb,
  mapPeriodFromDb,
  type BudgetThresholdRow,
  type BudgetPeriodRow,
} from './db-mappers';

interface ThresholdCheckResult {
  thresholdId: string;
  budgetId: string;
  percentage: number;
  action: ThresholdAction;
  triggered: boolean;
  currentUtilization: number;
}

export class ThresholdChecker {
  constructor(private supabase: SupabaseClient) {}

  // ===========================================================================
  // THRESHOLD CHECKING
  // ===========================================================================

  async checkBudgetThresholds(budgetId: string): Promise<ThresholdCheckResult[]> {
    // Get current period
    const { data: period, error: periodError } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('status', 'active')
      .single();

    if (periodError || !period) {
      return [];
    }

    const mappedPeriod = mapPeriodFromDb(period as BudgetPeriodRow);

    // Get untriggered thresholds
    const { data: thresholds, error: thresholdError } = await this.supabase
      .from('budget_thresholds')
      .select('*')
      .eq('budget_id', budgetId)
      .is('triggered_at', null)
      .order('percentage', { ascending: true });

    if (thresholdError || !thresholds) {
      return [];
    }

    const results: ThresholdCheckResult[] = [];

    for (const row of thresholds) {
      const threshold = mapThresholdFromDb(row as BudgetThresholdRow);
      const triggered = mappedPeriod.utilizationPercentage >= threshold.percentage;

      if (triggered) {
        // Mark threshold as triggered
        await this.supabase
          .from('budget_thresholds')
          .update({ triggered_at: new Date().toISOString() })
          .eq('id', threshold.id);

        // Execute the threshold action
        await this.executeThresholdAction(mappedPeriod, threshold);
      }

      results.push({
        thresholdId: threshold.id,
        budgetId: threshold.budgetId,
        percentage: threshold.percentage,
        action: threshold.action,
        triggered,
        currentUtilization: mappedPeriod.utilizationPercentage,
      });
    }

    return results;
  }

  async checkAllOrgThresholds(organizationId: string): Promise<ThresholdCheckResult[]> {
    const { data: budgets, error } = await this.supabase
      .from('budgets')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (error || !budgets) {
      return [];
    }

    const allResults: ThresholdCheckResult[] = [];

    for (const budget of budgets) {
      const results = await this.checkBudgetThresholds(budget.id);
      allResults.push(...results);
    }

    return allResults;
  }

  // ===========================================================================
  // THRESHOLD ACTIONS
  // ===========================================================================

  private async executeThresholdAction(
    period: BudgetPeriodData,
    threshold: BudgetThreshold
  ): Promise<void> {
    const { data: budget, error } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', period.budgetId)
      .single();

    if (error || !budget) {
      console.error('[ThresholdChecker] Budget not found for threshold action');
      return;
    }

    switch (threshold.action) {
      case 'alert':
        await this.createAlertEvent(budget, period, threshold);
        break;

      case 'throttle':
        await this.enableThrottling(budget.id, period.utilizationPercentage);
        await this.createAlertEvent(budget, period, threshold);
        break;

      case 'block':
        await this.enableHardBlock(budget.id);
        await this.createAlertEvent(budget, period, threshold);
        break;
    }
  }

  private async createAlertEvent(
    budget: { id: string; organization_id: string; name: string },
    period: BudgetPeriodData,
    threshold: BudgetThreshold
  ): Promise<void> {
    const severity = threshold.percentage >= 100 ? 'critical' : 'warning';

    // Check if alert_events table exists
    const { error } = await this.supabase.from('alert_events').insert({
      organization_id: budget.organization_id,
      type: 'budget_threshold',
      severity,
      title: `Budget "${budget.name}" reached ${threshold.percentage}%`,
      message: `Budget utilization is at ${period.utilizationPercentage.toFixed(1)}%. ` +
               `Spent: $${period.spentAmount.toFixed(2)} of $${period.totalBudget.toFixed(2)}`,
      metadata: {
        budget_id: budget.id,
        threshold_id: threshold.id,
        threshold_percentage: threshold.percentage,
        utilization: period.utilizationPercentage,
        spent_amount: period.spentAmount,
        total_budget: period.totalBudget,
      },
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Table might not exist yet, log but don't fail
      console.warn('[ThresholdChecker] Could not create alert event:', error.message);
    }
  }

  private async enableThrottling(budgetId: string, currentUtilization: number): Promise<void> {
    // Calculate throttle percentage (reduce capacity as utilization increases)
    const throttlePercentage = Math.max(0, 100 - currentUtilization);

    await this.supabase
      .from('budgets')
      .update({
        mode: 'throttle',
        throttle_percentage: throttlePercentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', budgetId);
  }

  private async enableHardBlock(budgetId: string): Promise<void> {
    await this.supabase
      .from('budgets')
      .update({
        mode: 'hard',
        updated_at: new Date().toISOString(),
      })
      .eq('id', budgetId);
  }

  // ===========================================================================
  // ALERT STATUS
  // ===========================================================================

  async getAlertStatus(organizationId: string): Promise<BudgetAlertStatus[]> {
    const { data, error } = await this.supabase
      .from('budget_summary')
      .select(`
        id,
        organization_id,
        name,
        type,
        total_budget,
        spent_amount,
        utilization_percentage
      `)
      .eq('organization_id', organizationId);

    if (error || !data) {
      return [];
    }

    const alertStatuses: BudgetAlertStatus[] = [];

    for (const budget of data) {
      // Get thresholds for this budget
      const { data: thresholds } = await this.supabase
        .from('budget_thresholds')
        .select('*')
        .eq('budget_id', budget.id)
        .eq('alert_enabled', true);

      for (const threshold of thresholds || []) {
        const utilization = Number(budget.utilization_percentage || 0);
        let thresholdStatus: 'ok' | 'approaching' | 'exceeded' = 'ok';

        if (utilization >= threshold.percentage) {
          thresholdStatus = 'exceeded';
        } else if (utilization >= threshold.percentage - 10) {
          thresholdStatus = 'approaching';
        }

        alertStatuses.push({
          budgetId: budget.id,
          organizationId: budget.organization_id,
          budgetName: budget.name,
          budgetType: budget.type,
          totalBudget: Number(budget.total_budget || 0),
          spentAmount: Number(budget.spent_amount || 0),
          utilizationPercentage: utilization,
          thresholdId: threshold.id,
          thresholdPercentage: Number(threshold.percentage),
          thresholdAction: threshold.action,
          thresholdStatus,
          triggeredAt: threshold.triggered_at,
          acknowledgedAt: threshold.acknowledged_at,
        });
      }
    }

    return alertStatuses;
  }

  // ===========================================================================
  // RESET THRESHOLDS
  // ===========================================================================

  async resetThresholdsForPeriod(budgetId: string): Promise<void> {
    await this.supabase
      .from('budget_thresholds')
      .update({
        triggered_at: null,
        acknowledged_at: null,
        acknowledged_by: null,
      })
      .eq('budget_id', budgetId);
  }
}

export function createThresholdChecker(supabase: SupabaseClient): ThresholdChecker {
  return new ThresholdChecker(supabase);
}
