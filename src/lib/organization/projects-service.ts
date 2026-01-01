/**
 * Projects Service
 * Handles all project-related database operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  Project,
  ProjectSummary,
  ProjectTeam,
  ProjectApiKey,
  ProjectAccessLevel,
  CreateProjectInput,
  UpdateProjectInput,
} from './types';
import {
  ProjectSummaryRow,
  ProjectTeamRow,
  ProjectApiKeyRow,
  mapProjectSummaryRow,
  mapProjectTeamRow,
  mapProjectApiKeyRow,
  generateSlug,
} from './db-mappers';

export class ProjectsService {
  constructor(private supabase: SupabaseClient) {}

  // ============================================
  // PROJECT CRUD
  // ============================================

  async getProjects(
    orgId: string,
    filters?: {
      teamId?: string;
      status?: string;
      category?: string;
    }
  ): Promise<ProjectSummary[]> {
    let query = this.supabase
      .from('project_summary')
      .select('*')
      .eq('org_id', orgId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.neq('status', 'archived');
    }

    if (filters?.teamId) {
      query = query.eq('owner_team_id', filters.teamId);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('name');

    if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
    return (data || []).map((row: ProjectSummaryRow) => mapProjectSummaryRow(row));
  }

  async getProject(projectId: string): Promise<ProjectSummary | null> {
    const { data, error } = await this.supabase
      .from('project_summary')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
    return data ? mapProjectSummaryRow(data as ProjectSummaryRow) : null;
  }

  async createProject(
    orgId: string,
    input: CreateProjectInput,
    userId?: string
  ): Promise<Project> {
    const slug = input.slug || generateSlug(input.name);

    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        organization_id: orgId,
        org_id: orgId,
        name: input.name,
        slug,
        description: input.description,
        owner_team_id: input.ownerTeamId,
        owner_user_id: userId,
        category: input.category,
        tags: input.tags || [],
        cost_center_id: input.costCenterId,
        settings: input.settings || {},
        start_date: input.startDate,
        end_date: input.endDate,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create project: ${error.message}`);

    // Link to owner team if specified
    if (input.ownerTeamId && data) {
      await this.addTeam(data.id, input.ownerTeamId, 'owner', userId).catch(() => {
        // Ignore if team linking fails
      });
    }

    return mapProjectSummaryRow(data as ProjectSummaryRow);
  }

  async updateProject(projectId: string, input: UpdateProjectInput): Promise<Project> {
    const updates: Record<string, unknown> = {};

    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.ownerTeamId !== undefined) updates.owner_team_id = input.ownerTeamId;
    if (input.category !== undefined) updates.category = input.category;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.status !== undefined) updates.status = input.status;
    if (input.costCenterId !== undefined) updates.cost_center_id = input.costCenterId;
    if (input.settings !== undefined) updates.settings = input.settings;
    if (input.startDate !== undefined) updates.start_date = input.startDate;
    if (input.endDate !== undefined) updates.end_date = input.endDate;

    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update project: ${error.message}`);
    return mapProjectSummaryRow(data as ProjectSummaryRow);
  }

  async deleteProject(projectId: string, hard = false): Promise<void> {
    if (hard) {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      if (error) throw new Error(`Failed to delete project: ${error.message}`);
    } else {
      await this.updateProject(projectId, { status: 'archived' });
    }
  }

  // ============================================
  // PROJECT TEAMS
  // ============================================

  async getProjectTeams(projectId: string): Promise<ProjectTeam[]> {
    const { data, error } = await this.supabase
      .from('project_teams')
      .select(`
        *,
        team:teams(id, name, slug, color)
      `)
      .eq('project_id', projectId);

    if (error) throw new Error(`Failed to fetch project teams: ${error.message}`);
    return (data || []).map((row: ProjectTeamRow) => mapProjectTeamRow(row));
  }

  async addTeam(
    projectId: string,
    teamId: string,
    accessLevel: ProjectAccessLevel = 'contributor',
    addedBy?: string
  ): Promise<ProjectTeam> {
    const { data, error } = await this.supabase
      .from('project_teams')
      .insert({
        project_id: projectId,
        team_id: teamId,
        access_level: accessLevel,
        added_by: addedBy,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add team to project: ${error.message}`);
    return mapProjectTeamRow(data as ProjectTeamRow);
  }

  async updateTeamAccess(
    projectId: string,
    teamId: string,
    accessLevel: ProjectAccessLevel
  ): Promise<void> {
    const { error } = await this.supabase
      .from('project_teams')
      .update({ access_level: accessLevel })
      .eq('project_id', projectId)
      .eq('team_id', teamId);

    if (error) throw new Error(`Failed to update team access: ${error.message}`);
  }

  async removeTeam(projectId: string, teamId: string): Promise<void> {
    const { error } = await this.supabase
      .from('project_teams')
      .delete()
      .eq('project_id', projectId)
      .eq('team_id', teamId);

    if (error) throw new Error(`Failed to remove team from project: ${error.message}`);
  }

  // ============================================
  // PROJECT API KEYS
  // ============================================

  async getApiKeys(projectId: string): Promise<ProjectApiKey[]> {
    const { data, error } = await this.supabase
      .from('project_api_keys')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw new Error(`Failed to fetch API keys: ${error.message}`);
    return (data || []).map((row: ProjectApiKeyRow) => mapProjectApiKeyRow(row));
  }

  async linkApiKey(
    projectId: string,
    provider: string,
    keyIdentifier: string,
    options?: {
      keyType?: 'exact' | 'prefix' | 'pattern';
      label?: string;
      environment?: string;
    }
  ): Promise<ProjectApiKey> {
    const { data, error } = await this.supabase
      .from('project_api_keys')
      .insert({
        project_id: projectId,
        provider,
        key_identifier: keyIdentifier,
        key_type: options?.keyType || 'exact',
        label: options?.label,
        environment: options?.environment,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to link API key: ${error.message}`);
    return mapProjectApiKeyRow(data as ProjectApiKeyRow);
  }

  async unlinkApiKey(projectId: string, keyId: string): Promise<void> {
    const { error } = await this.supabase
      .from('project_api_keys')
      .delete()
      .eq('project_id', projectId)
      .eq('id', keyId);

    if (error) throw new Error(`Failed to unlink API key: ${error.message}`);
  }
}

// Factory function
export function createProjectsService(supabase: SupabaseClient): ProjectsService {
  return new ProjectsService(supabase);
}
