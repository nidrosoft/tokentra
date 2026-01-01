/**
 * Cost Centers Service
 * Handles all cost center-related database operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  CostCenter,
  CostCenterHierarchy,
  CostCenterAllocation,
  CreateCostCenterInput,
  UpdateCostCenterInput,
} from './types';
import {
  CostCenterRow,
  CostCenterHierarchyRow,
  CostCenterAllocationRow,
  mapCostCenterRow,
  mapCostCenterHierarchyRow,
  mapCostCenterAllocationRow,
} from './db-mappers';

export class CostCentersService {
  constructor(private supabase: SupabaseClient) {}

  // ============================================
  // COST CENTER CRUD
  // ============================================

  async getCostCenters(orgId: string): Promise<CostCenter[]> {
    const { data, error } = await this.supabase
      .from('cost_centers')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('code');

    if (error) throw new Error(`Failed to fetch cost centers: ${error.message}`);
    return (data || []).map((row: CostCenterRow) => mapCostCenterRow(row));
  }

  async getCostCenter(costCenterId: string): Promise<CostCenter | null> {
    const { data, error } = await this.supabase
      .from('cost_centers')
      .select('*')
      .eq('id', costCenterId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch cost center: ${error.message}`);
    }
    return data ? mapCostCenterRow(data as CostCenterRow) : null;
  }

  async createCostCenter(
    orgId: string,
    input: CreateCostCenterInput,
    userId?: string
  ): Promise<CostCenter> {
    const { data, error } = await this.supabase
      .from('cost_centers')
      .insert({
        organization_id: orgId,
        org_id: orgId,
        code: input.code,
        name: input.name,
        description: input.description,
        parent_id: input.parentId,
        gl_account: input.glAccount,
        department_code: input.departmentCode,
        manager_id: input.managerId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create cost center: ${error.message}`);
    return mapCostCenterRow(data as CostCenterRow);
  }

  async updateCostCenter(
    costCenterId: string,
    input: UpdateCostCenterInput
  ): Promise<CostCenter> {
    const updates: Record<string, unknown> = {};

    if (input.code !== undefined) updates.code = input.code;
    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.parentId !== undefined) updates.parent_id = input.parentId;
    if (input.glAccount !== undefined) updates.gl_account = input.glAccount;
    if (input.departmentCode !== undefined) updates.department_code = input.departmentCode;
    if (input.managerId !== undefined) updates.manager_id = input.managerId;
    if (input.status !== undefined) updates.status = input.status;

    const { data, error } = await this.supabase
      .from('cost_centers')
      .update(updates)
      .eq('id', costCenterId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update cost center: ${error.message}`);
    return mapCostCenterRow(data as CostCenterRow);
  }

  async deleteCostCenter(costCenterId: string, hard = false): Promise<void> {
    if (hard) {
      const { error } = await this.supabase
        .from('cost_centers')
        .delete()
        .eq('id', costCenterId);
      if (error) throw new Error(`Failed to delete cost center: ${error.message}`);
    } else {
      await this.updateCostCenter(costCenterId, { status: 'archived' });
    }
  }

  // ============================================
  // HIERARCHY
  // ============================================

  async getCostCenterHierarchy(orgId: string): Promise<CostCenterHierarchy[]> {
    const { data, error } = await this.supabase
      .from('cost_center_hierarchy')
      .select('*')
      .eq('org_id', orgId)
      .order('depth')
      .order('code');

    if (error) throw new Error(`Failed to fetch cost center hierarchy: ${error.message}`);

    const flatList = (data || []).map((row: CostCenterHierarchyRow) =>
      mapCostCenterHierarchyRow(row)
    );
    return this.buildHierarchy(flatList);
  }

  private buildHierarchy(flatList: CostCenterHierarchy[]): CostCenterHierarchy[] {
    const map = new Map(
      flatList.map((cc) => [cc.id, { ...cc, children: [] as CostCenterHierarchy[] }])
    );
    const roots: CostCenterHierarchy[] = [];

    flatList.forEach((cc) => {
      if (cc.parentId) {
        const parent = map.get(cc.parentId);
        if (parent) {
          parent.children!.push(map.get(cc.id)!);
        }
      } else {
        roots.push(map.get(cc.id)!);
      }
    });

    return roots;
  }

  // ============================================
  // ALLOCATIONS
  // ============================================

  async getAllocations(costCenterId: string): Promise<CostCenterAllocation[]> {
    const { data, error } = await this.supabase
      .from('cost_center_allocations')
      .select('*')
      .eq('cost_center_id', costCenterId)
      .is('effective_until', null);

    if (error) throw new Error(`Failed to fetch allocations: ${error.message}`);
    return (data || []).map((row: CostCenterAllocationRow) =>
      mapCostCenterAllocationRow(row)
    );
  }

  async allocateEntity(
    costCenterId: string,
    entityType: 'team' | 'project' | 'user',
    entityId: string,
    allocationPercentage = 100
  ): Promise<CostCenterAllocation> {
    const { data, error } = await this.supabase
      .from('cost_center_allocations')
      .insert({
        cost_center_id: costCenterId,
        entity_type: entityType,
        entity_id: entityId,
        allocation_percentage: allocationPercentage,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to allocate entity: ${error.message}`);
    return mapCostCenterAllocationRow(data as CostCenterAllocationRow);
  }

  async removeAllocation(allocationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cost_center_allocations')
      .update({ effective_until: new Date().toISOString().split('T')[0] })
      .eq('id', allocationId);

    if (error) throw new Error(`Failed to remove allocation: ${error.message}`);
  }
}

// Factory function
export function createCostCentersService(supabase: SupabaseClient): CostCentersService {
  return new CostCentersService(supabase);
}
