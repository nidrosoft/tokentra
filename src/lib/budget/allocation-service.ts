/**
 * Budget Management System - Allocation Service
 * 
 * Handles budget allocations, transfers, and hierarchy management.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BudgetAllocation,
  AllocateBudgetInput,
  CreateAdjustmentInput,
  BudgetAdjustment,
} from './types';
import {
  mapAllocationFromDb,
  mapAdjustmentFromDb,
  type BudgetAllocationRow,
  type BudgetAdjustmentRow,
} from './db-mappers';

interface AllocationResult {
  success: boolean;
  allocation?: BudgetAllocation;
  error?: string;
}

interface TransferResult {
  success: boolean;
  error?: string;
}

interface AllocationSuggestion {
  budgetId: string;
  budgetName: string;
  suggestedAmount: number;
  reason: string;
}

export class AllocationService {
  constructor(private supabase: SupabaseClient) {}

  // ===========================================================================
  // ALLOCATION MANAGEMENT
  // ===========================================================================

  async allocate(
    parentBudgetId: string,
    input: AllocateBudgetInput
  ): Promise<AllocationResult> {
    // Validate allocation
    const validation = await this.validateAllocation(
      parentBudgetId,
      input.childBudgetId,
      input.allocationValue,
      input.allocationType
    );

    if (!validation.valid) {
      return { success: false, error: validation.message };
    }

    // Check for circular references
    const hasCircular = await this.checkCircularReference(
      parentBudgetId,
      input.childBudgetId
    );

    if (hasCircular) {
      return {
        success: false,
        error: 'Circular allocation detected. Child budget cannot be an ancestor of parent.',
      };
    }

    // Create or update allocation
    const { data, error } = await this.supabase
      .from('budget_allocations')
      .upsert(
        {
          parent_budget_id: parentBudgetId,
          child_budget_id: input.childBudgetId,
          allocation_type: input.allocationType,
          allocation_value: input.allocationValue,
          min_amount: input.minAmount,
          max_amount: input.maxAmount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'parent_budget_id,child_budget_id' }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update child budget amount if fixed allocation
    if (input.allocationType === 'fixed') {
      await this.supabase
        .from('budgets')
        .update({ amount: input.allocationValue, updated_at: new Date().toISOString() })
        .eq('id', input.childBudgetId);
    }

    return {
      success: true,
      allocation: mapAllocationFromDb(data as BudgetAllocationRow),
    };
  }

  async deallocate(parentBudgetId: string, childBudgetId: string): Promise<void> {
    await this.supabase
      .from('budget_allocations')
      .delete()
      .eq('parent_budget_id', parentBudgetId)
      .eq('child_budget_id', childBudgetId);
  }

  async getAllocations(budgetId: string): Promise<{
    parent?: BudgetAllocation;
    children: BudgetAllocation[];
  }> {
    // Get parent allocation
    const { data: parentData } = await this.supabase
      .from('budget_allocations')
      .select('*')
      .eq('child_budget_id', budgetId)
      .single();

    // Get child allocations
    const { data: childrenData } = await this.supabase
      .from('budget_allocations')
      .select('*')
      .eq('parent_budget_id', budgetId);

    return {
      parent: parentData ? mapAllocationFromDb(parentData as BudgetAllocationRow) : undefined,
      children: (childrenData || []).map((row) =>
        mapAllocationFromDb(row as BudgetAllocationRow)
      ),
    };
  }

  // ===========================================================================
  // TRANSFERS
  // ===========================================================================

  async transfer(
    fromBudgetId: string,
    toBudgetId: string,
    amount: number,
    reason: string,
    userId: string
  ): Promise<TransferResult> {
    // Verify they share the same parent
    const { data: fromAlloc } = await this.supabase
      .from('budget_allocations')
      .select('parent_budget_id')
      .eq('child_budget_id', fromBudgetId)
      .single();

    const { data: toAlloc } = await this.supabase
      .from('budget_allocations')
      .select('parent_budget_id')
      .eq('child_budget_id', toBudgetId)
      .single();

    if (fromAlloc?.parent_budget_id !== toAlloc?.parent_budget_id) {
      return {
        success: false,
        error: 'Budgets must share the same parent for direct transfer',
      };
    }

    // Get from budget and check available amount
    const { data: fromBudget } = await this.supabase
      .from('budget_summary')
      .select('*')
      .eq('id', fromBudgetId)
      .single();

    if (!fromBudget || (Number(fromBudget.remaining_amount) || 0) < amount) {
      return {
        success: false,
        error: `Insufficient remaining budget. Available: $${(fromBudget?.remaining_amount || 0).toFixed(2)}`,
      };
    }

    // Create adjustments for both budgets
    const now = new Date().toISOString();

    // Decrease from source
    await this.supabase.from('budget_adjustments').insert({
      budget_id: fromBudgetId,
      adjustment_type: 'transfer_out',
      amount,
      reason: `Transfer to budget: ${reason}`,
      related_budget_id: toBudgetId,
      created_by: userId,
      created_at: now,
    });

    // Increase destination
    await this.supabase.from('budget_adjustments').insert({
      budget_id: toBudgetId,
      adjustment_type: 'transfer_in',
      amount,
      reason: `Transfer from budget: ${reason}`,
      related_budget_id: fromBudgetId,
      created_by: userId,
      created_at: now,
    });

    // Update budget amounts - try RPC first, fallback to manual update
    const { error: rpcError } = await this.supabase.rpc('transfer_budget_amount', {
      p_from_budget_id: fromBudgetId,
      p_to_budget_id: toBudgetId,
      p_amount: amount,
    });

    if (rpcError) {
      // RPC might not exist, update manually
      await this.supabase
        .from('budgets')
        .update({ amount: Number(fromBudget.base_amount) - amount })
        .eq('id', fromBudgetId);

      const { data: toBudgetData } = await this.supabase
        .from('budgets')
        .select('amount')
        .eq('id', toBudgetId)
        .single();

      await this.supabase
        .from('budgets')
        .update({ amount: (Number(toBudgetData?.amount) || 0) + amount })
        .eq('id', toBudgetId);
    }

    return { success: true };
  }

  // ===========================================================================
  // ADJUSTMENTS
  // ===========================================================================

  async createAdjustment(
    budgetId: string,
    input: CreateAdjustmentInput,
    userId: string
  ): Promise<BudgetAdjustment> {
    // Get current period
    const { data: period } = await this.supabase
      .from('budget_periods')
      .select('id')
      .eq('budget_id', budgetId)
      .eq('status', 'active')
      .single();

    const { data, error } = await this.supabase
      .from('budget_adjustments')
      .insert({
        budget_id: budgetId,
        budget_period_id: period?.id,
        adjustment_type: input.adjustmentType,
        amount: input.amount,
        reason: input.reason,
        related_budget_id: input.relatedBudgetId,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create adjustment: ${error.message}`);

    // Update period adjusted_amount
    if (period?.id) {
      const multiplier = input.adjustmentType === 'decrease' || input.adjustmentType === 'transfer_out' ? -1 : 1;
      const { error: rpcError } = await this.supabase.rpc('update_period_adjustment', {
        p_period_id: period.id,
        p_amount: input.amount * multiplier,
      });

      if (rpcError) {
        // RPC might not exist, update manually
        const { data: periodData } = await this.supabase
          .from('budget_periods')
          .select('adjusted_amount')
          .eq('id', period.id)
          .single();

        await this.supabase
          .from('budget_periods')
          .update({
            adjusted_amount: (Number(periodData?.adjusted_amount) || 0) + input.amount * multiplier,
            updated_at: new Date().toISOString(),
          })
          .eq('id', period.id);
      }
    }

    return mapAdjustmentFromDb(data as BudgetAdjustmentRow);
  }

  async getAdjustments(budgetId: string, limit: number = 50): Promise<BudgetAdjustment[]> {
    const { data, error } = await this.supabase
      .from('budget_adjustments')
      .select('*')
      .eq('budget_id', budgetId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get adjustments: ${error.message}`);

    return (data || []).map((row) => mapAdjustmentFromDb(row as BudgetAdjustmentRow));
  }

  // ===========================================================================
  // VALIDATION
  // ===========================================================================

  private async validateAllocation(
    parentBudgetId: string,
    childBudgetId: string,
    amount: number,
    allocationType: string
  ): Promise<{ valid: boolean; message?: string; availableAmount: number }> {
    const { data: parent } = await this.supabase
      .from('budgets')
      .select('amount')
      .eq('id', parentBudgetId)
      .single();

    if (!parent) {
      return { valid: false, message: 'Parent budget not found', availableAmount: 0 };
    }

    // Get existing allocations
    const { data: allocations } = await this.supabase
      .from('budget_allocations')
      .select('allocation_value, allocation_type')
      .eq('parent_budget_id', parentBudgetId)
      .neq('child_budget_id', childBudgetId);

    const totalAllocated =
      allocations?.reduce((sum, a) => {
        if (a.allocation_type === 'percentage') {
          return sum + (parent.amount * a.allocation_value) / 100;
        }
        return sum + a.allocation_value;
      }, 0) || 0;

    const availableAmount = parent.amount - totalAllocated;

    const requestedAmount =
      allocationType === 'percentage' ? (parent.amount * amount) / 100 : amount;

    if (requestedAmount > availableAmount) {
      return {
        valid: false,
        message: `Requested amount ($${requestedAmount.toFixed(2)}) exceeds available ($${availableAmount.toFixed(2)})`,
        availableAmount,
      };
    }

    return { valid: true, availableAmount };
  }

  private async checkCircularReference(
    parentBudgetId: string,
    childBudgetId: string
  ): Promise<boolean> {
    // Check if child is an ancestor of parent
    let currentId = parentBudgetId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) break;
      visited.add(currentId);

      if (currentId === childBudgetId) {
        return true;
      }

      const { data } = await this.supabase
        .from('budget_allocations')
        .select('parent_budget_id')
        .eq('child_budget_id', currentId)
        .single();

      currentId = data?.parent_budget_id;
    }

    return false;
  }

  // ===========================================================================
  // SUGGESTIONS
  // ===========================================================================

  async suggestAllocation(
    parentBudgetId: string,
    childBudgetIds: string[]
  ): Promise<AllocationSuggestion[]> {
    const { data: parent } = await this.supabase
      .from('budgets')
      .select('amount, organization_id')
      .eq('id', parentBudgetId)
      .single();

    if (!parent) return [];

    const suggestions: AllocationSuggestion[] = [];
    const historicalSpends: Array<{ id: string; name: string; spend: number }> = [];

    for (const childId of childBudgetIds) {
      const { data: child } = await this.supabase
        .from('budgets')
        .select('name')
        .eq('id', childId)
        .single();

      if (!child) continue;

      // Get last 3 months of spend
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: periods } = await this.supabase
        .from('budget_periods')
        .select('spent_amount')
        .eq('budget_id', childId)
        .gte('period_start', threeMonthsAgo.toISOString())
        .order('period_start', { ascending: false });

      const avgSpend =
        periods && periods.length > 0
          ? periods.reduce((sum, p) => sum + (Number(p.spent_amount) || 0), 0) / periods.length
          : 0;

      historicalSpends.push({ id: childId, name: child.name, spend: avgSpend });
    }

    const totalHistoricalSpend = historicalSpends.reduce((sum, h) => sum + h.spend, 0);

    if (totalHistoricalSpend === 0) {
      // Equal distribution if no history
      const equalAmount = parent.amount / childBudgetIds.length;
      return historicalSpends.map((h) => ({
        budgetId: h.id,
        budgetName: h.name,
        suggestedAmount: Math.round(equalAmount * 100) / 100,
        reason: 'Equal distribution (no historical data)',
      }));
    }

    // Proportional with 10% buffer
    const availableBudget = parent.amount * 0.9;

    for (const { id, name, spend } of historicalSpends) {
      const proportion = spend / totalHistoricalSpend;
      const suggested = Math.round(availableBudget * proportion * 100) / 100;

      suggestions.push({
        budgetId: id,
        budgetName: name,
        suggestedAmount: suggested,
        reason: `Based on ${(proportion * 100).toFixed(1)}% of historical spend`,
      });
    }

    return suggestions;
  }
}

export function createAllocationService(supabase: SupabaseClient): AllocationService {
  return new AllocationService(supabase);
}
