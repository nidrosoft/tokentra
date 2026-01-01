/**
 * Database Row Interfaces and Mappers
 * Converts between database rows and TypeScript types
 */

import type {
  Team,
  TeamSummary,
  TeamMember,
  Project,
  ProjectSummary,
  ProjectTeam,
  ProjectApiKey,
  CostCenter,
  CostCenterHierarchy,
  CostCenterAllocation,
} from './types';

// ============================================
// DATABASE ROW INTERFACES
// ============================================

export interface TeamRow {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_team_id: string | null;
  default_cost_center_id: string | null;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  avatar_url: string | null;
  color: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamSummaryRow extends TeamRow {
  member_count: number;
  project_count: number;
  cost_center_name: string | null;
  cost_center_code: string | null;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  invited_by: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface ProjectRow {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_team_id: string | null;
  owner_user_id: string | null;
  category: string | null;
  tags: string[];
  status: string;
  cost_center_id: string | null;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  icon: string | null;
  color: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectSummaryRow extends ProjectRow {
  owner_team_name: string | null;
  cost_center_name: string | null;
  teams: Array<{ id: string; name: string }> | null;
}

export interface ProjectTeamRow {
  id: string;
  project_id: string;
  team_id: string;
  access_level: string;
  added_at: string;
  added_by: string | null;
  team?: TeamRow;
}

export interface ProjectApiKeyRow {
  id: string;
  project_id: string;
  provider: string;
  key_identifier: string;
  key_type: string;
  label: string | null;
  environment: string | null;
  created_at: string;
}

export interface CostCenterRow {
  id: string;
  org_id: string;
  code: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  gl_account: string | null;
  department_code: string | null;
  manager_id: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CostCenterHierarchyRow extends CostCenterRow {
  depth: number;
  path: string[];
  full_path: string;
}

export interface CostCenterAllocationRow {
  id: string;
  cost_center_id: string;
  entity_type: string;
  entity_id: string;
  allocation_percentage: number;
  effective_from: string;
  effective_until: string | null;
  created_at: string;
}

// ============================================
// MAPPERS: DB ROW -> TYPESCRIPT TYPE
// ============================================

export function mapTeamRow(row: TeamRow): Team {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    parentTeamId: row.parent_team_id ?? undefined,
    defaultCostCenterId: row.default_cost_center_id ?? undefined,
    settings: row.settings ?? {},
    metadata: row.metadata ?? {},
    avatarUrl: row.avatar_url ?? undefined,
    color: row.color ?? undefined,
    status: row.status as Team['status'],
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTeamSummaryRow(row: TeamSummaryRow): TeamSummary {
  return {
    ...mapTeamRow(row),
    memberCount: row.member_count ?? 0,
    projectCount: row.project_count ?? 0,
    costCenterName: row.cost_center_name ?? undefined,
    costCenterCode: row.cost_center_code ?? undefined,
  };
}

export function mapTeamMemberRow(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id,
    role: row.role as TeamMember['role'],
    joinedAt: row.joined_at,
    invitedBy: row.invited_by ?? undefined,
    user: row.user ? {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
      avatarUrl: row.user.avatar_url ?? undefined,
    } : undefined,
  };
}

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    ownerTeamId: row.owner_team_id ?? undefined,
    ownerUserId: row.owner_user_id ?? undefined,
    category: row.category as Project['category'],
    tags: row.tags ?? [],
    status: row.status as Project['status'],
    costCenterId: row.cost_center_id ?? undefined,
    settings: row.settings ?? {},
    metadata: row.metadata ?? {},
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProjectSummaryRow(row: ProjectSummaryRow): ProjectSummary {
  return {
    ...mapProjectRow(row),
    ownerTeamName: row.owner_team_name ?? undefined,
    costCenterName: row.cost_center_name ?? undefined,
    teams: row.teams ?? [],
  };
}

export function mapProjectTeamRow(row: ProjectTeamRow): ProjectTeam {
  return {
    id: row.id,
    projectId: row.project_id,
    teamId: row.team_id,
    accessLevel: row.access_level as ProjectTeam['accessLevel'],
    addedAt: row.added_at,
    addedBy: row.added_by ?? undefined,
    team: row.team ? mapTeamRow(row.team) : undefined,
  };
}

export function mapProjectApiKeyRow(row: ProjectApiKeyRow): ProjectApiKey {
  return {
    id: row.id,
    projectId: row.project_id,
    provider: row.provider,
    keyIdentifier: row.key_identifier,
    keyType: row.key_type as ProjectApiKey['keyType'],
    label: row.label ?? undefined,
    environment: row.environment ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapCostCenterRow(row: CostCenterRow): CostCenter {
  return {
    id: row.id,
    orgId: row.org_id,
    code: row.code,
    name: row.name,
    description: row.description ?? undefined,
    parentId: row.parent_id ?? undefined,
    glAccount: row.gl_account ?? undefined,
    departmentCode: row.department_code ?? undefined,
    managerId: row.manager_id ?? undefined,
    status: row.status as CostCenter['status'],
    metadata: row.metadata ?? {},
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCostCenterHierarchyRow(row: CostCenterHierarchyRow): CostCenterHierarchy {
  return {
    ...mapCostCenterRow(row),
    depth: row.depth,
    path: row.path ?? [],
    fullPath: row.full_path ?? row.name,
  };
}

export function mapCostCenterAllocationRow(row: CostCenterAllocationRow): CostCenterAllocation {
  return {
    id: row.id,
    costCenterId: row.cost_center_id,
    entityType: row.entity_type as CostCenterAllocation['entityType'],
    entityId: row.entity_id,
    allocationPercentage: row.allocation_percentage,
    effectiveFrom: row.effective_from,
    effectiveUntil: row.effective_until ?? undefined,
    createdAt: row.created_at,
  };
}

// ============================================
// HELPER: Generate slug from name
// ============================================

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
