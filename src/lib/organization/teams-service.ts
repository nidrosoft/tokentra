/**
 * Teams Service
 * Handles all team-related database operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  Team,
  TeamSummary,
  TeamMember,
  TeamRole,
  CreateTeamInput,
  UpdateTeamInput,
} from './types';
import {
  TeamSummaryRow,
  TeamMemberRow,
  mapTeamSummaryRow,
  mapTeamMemberRow,
  generateSlug,
} from './db-mappers';

export class TeamsService {
  constructor(private supabase: SupabaseClient) {}

  // ============================================
  // TEAM CRUD
  // ============================================

  async getTeams(orgId: string): Promise<TeamSummary[]> {
    // Try the view first, fall back to base table
    let { data, error } = await this.supabase
      .from('team_summary')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('name');

    // If view doesn't exist, query base table
    if (error && error.message.includes('team_summary')) {
      const result = await this.supabase
        .from('teams')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('name');
      
      data = result.data;
      error = result.error;
      
      if (error) throw new Error(`Failed to fetch teams: ${error.message}`);
      
      // Map base table rows to summary format
      return (data || []).map((row: TeamSummaryRow) => ({
        ...mapTeamSummaryRow(row),
        memberCount: 0,
        projectCount: 0,
      }));
    }

    if (error) throw new Error(`Failed to fetch teams: ${error.message}`);
    return (data || []).map((row: TeamSummaryRow) => mapTeamSummaryRow(row));
  }

  async getTeam(teamId: string): Promise<TeamSummary | null> {
    const { data, error } = await this.supabase
      .from('team_summary')
      .select('*')
      .eq('id', teamId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch team: ${error.message}`);
    }
    return data ? mapTeamSummaryRow(data as TeamSummaryRow) : null;
  }

  async createTeam(
    orgId: string,
    input: CreateTeamInput,
    userId?: string
  ): Promise<Team> {
    const slug = input.slug || generateSlug(input.name);

    const { data, error } = await this.supabase
      .from('teams')
      .insert({
        organization_id: orgId,
        org_id: orgId,
        name: input.name,
        slug,
        description: input.description,
        parent_team_id: input.parentTeamId,
        default_cost_center_id: input.defaultCostCenterId,
        settings: input.settings || {},
        metadata: input.metadata || {},
        color: input.color,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create team: ${error.message}`);

    // Add creator as owner if userId provided
    if (userId && data) {
      await this.addMember(data.id, userId, 'owner', userId).catch(() => {
        // Ignore if user doesn't exist in users table
      });
    }

    return mapTeamSummaryRow(data as TeamSummaryRow);
  }

  async updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team> {
    const updates: Record<string, unknown> = {};

    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.parentTeamId !== undefined) updates.parent_team_id = input.parentTeamId;
    if (input.defaultCostCenterId !== undefined) updates.default_cost_center_id = input.defaultCostCenterId;
    if (input.settings !== undefined) updates.settings = input.settings;
    if (input.metadata !== undefined) updates.metadata = input.metadata;
    if (input.color !== undefined) updates.color = input.color;
    if (input.status !== undefined) updates.status = input.status;

    const { data, error } = await this.supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update team: ${error.message}`);
    return mapTeamSummaryRow(data as TeamSummaryRow);
  }

  async deleteTeam(teamId: string, hard = false): Promise<void> {
    if (hard) {
      const { error } = await this.supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      if (error) throw new Error(`Failed to delete team: ${error.message}`);
    } else {
      await this.updateTeam(teamId, { status: 'archived' });
    }
  }

  // ============================================
  // TEAM MEMBERS
  // ============================================

  async getMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select(`
        *,
        user:users(id, name, email, avatar_url)
      `)
      .eq('team_id', teamId)
      .order('joined_at');

    if (error) throw new Error(`Failed to fetch team members: ${error.message}`);
    return (data || []).map((row: TeamMemberRow) => mapTeamMemberRow(row));
  }

  async addMember(
    teamId: string,
    userId: string,
    role: TeamRole = 'member',
    invitedBy?: string
  ): Promise<TeamMember> {
    const { data, error } = await this.supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role,
        invited_by: invitedBy,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add team member: ${error.message}`);
    return mapTeamMemberRow(data as TeamMemberRow);
  }

  async updateMemberRole(
    teamId: string,
    userId: string,
    role: TeamRole
  ): Promise<void> {
    const { error } = await this.supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to update member role: ${error.message}`);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to remove team member: ${error.message}`);
  }

  // ============================================
  // TEAM HIERARCHY
  // ============================================

  async getTeamHierarchy(orgId: string): Promise<TeamSummary[]> {
    const teams = await this.getTeams(orgId);
    return this.buildHierarchy(teams);
  }

  private buildHierarchy(teams: TeamSummary[]): TeamSummary[] {
    const teamMap = new Map(
      teams.map((t) => [t.id, { ...t, children: [] as TeamSummary[] }])
    );
    const roots: TeamSummary[] = [];

    teams.forEach((team) => {
      if (team.parentTeamId) {
        const parent = teamMap.get(team.parentTeamId);
        if (parent) {
          (parent as TeamSummary & { children: TeamSummary[] }).children.push(
            teamMap.get(team.id)!
          );
        }
      } else {
        roots.push(teamMap.get(team.id)!);
      }
    });

    return roots;
  }
}

// Factory function
export function createTeamsService(supabase: SupabaseClient): TeamsService {
  return new TeamsService(supabase);
}
