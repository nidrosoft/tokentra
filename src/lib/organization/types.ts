/**
 * Organizational Structure Types
 * Teams, Projects, and Cost Centers
 */

// ============================================
// TEAM TYPES
// ============================================

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';
export type TeamStatus = 'active' | 'archived';

export interface TeamSettings {
  slackChannel?: string;
  defaultModel?: string;
  spendingLimitEnabled?: boolean;
  notificationEmails?: string[];
}

export interface Team {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  parentTeamId?: string;
  defaultCostCenterId?: string;
  settings: TeamSettings;
  metadata: Record<string, unknown>;
  avatarUrl?: string;
  color?: string;
  status: TeamStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  invitedBy?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface TeamSummary extends Team {
  memberCount: number;
  projectCount: number;
  costCenterName?: string;
  costCenterCode?: string;
  totalSpend?: number;
  monthlySpend?: number;
}

// ============================================
// PROJECT TYPES
// ============================================

export type ProjectStatus = 'active' | 'paused' | 'archived' | 'completed';
export type ProjectCategory = 'product' | 'internal' | 'experiment' | 'poc';
export type ProjectAccessLevel = 'owner' | 'contributor' | 'viewer';

export interface ProjectSettings {
  defaultModel?: string;
  environments?: string[];
  requireApprovalAbove?: number;
  budgetAlertThreshold?: number;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  ownerTeamId?: string;
  ownerUserId?: string;
  category?: ProjectCategory;
  tags: string[];
  status: ProjectStatus;
  costCenterId?: string;
  settings: ProjectSettings;
  metadata: Record<string, unknown>;
  icon?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTeam {
  id: string;
  projectId: string;
  teamId: string;
  accessLevel: ProjectAccessLevel;
  addedAt: string;
  addedBy?: string;
  team?: Team;
}

export interface ProjectApiKey {
  id: string;
  projectId: string;
  provider: string;
  keyIdentifier: string;
  keyType: 'exact' | 'prefix' | 'pattern';
  label?: string;
  environment?: string;
  createdAt: string;
}

export interface ProjectSummary extends Project {
  ownerTeamName?: string;
  costCenterName?: string;
  teams: Array<{ id: string; name: string }>;
  totalSpend?: number;
  monthlySpend?: number;
}

// ============================================
// COST CENTER TYPES
// ============================================

export type CostCenterStatus = 'active' | 'archived';

export interface CostCenter {
  id: string;
  orgId: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  glAccount?: string;
  departmentCode?: string;
  managerId?: string;
  status: CostCenterStatus;
  metadata: Record<string, unknown>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CostCenterAllocation {
  id: string;
  costCenterId: string;
  entityType: 'team' | 'project' | 'user';
  entityId: string;
  allocationPercentage: number;
  effectiveFrom: string;
  effectiveUntil?: string;
  createdAt: string;
}

export interface CostCenterHierarchy extends CostCenter {
  depth: number;
  path: string[];
  fullPath: string;
  children?: CostCenterHierarchy[];
  totalSpend?: number;
  allocatedTeams?: number;
  allocatedProjects?: number;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateTeamInput {
  name: string;
  slug?: string;
  description?: string;
  parentTeamId?: string;
  defaultCostCenterId?: string;
  settings?: Partial<TeamSettings>;
  metadata?: Record<string, unknown>;
  color?: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
  parentTeamId?: string | null;
  defaultCostCenterId?: string | null;
  settings?: Partial<TeamSettings>;
  metadata?: Record<string, unknown>;
  color?: string;
  status?: TeamStatus;
}

export interface CreateProjectInput {
  name: string;
  slug?: string;
  description?: string;
  ownerTeamId?: string;
  category?: ProjectCategory;
  tags?: string[];
  costCenterId?: string;
  settings?: Partial<ProjectSettings>;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  ownerTeamId?: string | null;
  category?: ProjectCategory;
  tags?: string[];
  status?: ProjectStatus;
  costCenterId?: string | null;
  settings?: Partial<ProjectSettings>;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CreateCostCenterInput {
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  glAccount?: string;
  departmentCode?: string;
  managerId?: string;
}

export interface UpdateCostCenterInput {
  code?: string;
  name?: string;
  description?: string;
  parentId?: string | null;
  glAccount?: string;
  departmentCode?: string;
  managerId?: string | null;
  status?: CostCenterStatus;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface TeamsListResponse {
  success: boolean;
  data: TeamSummary[];
  error?: string;
}

export interface TeamResponse {
  success: boolean;
  data: TeamSummary | null;
  error?: string;
}

export interface ProjectsListResponse {
  success: boolean;
  data: ProjectSummary[];
  error?: string;
}

export interface ProjectResponse {
  success: boolean;
  data: ProjectSummary | null;
  error?: string;
}

export interface CostCentersListResponse {
  success: boolean;
  data: CostCenter[] | CostCenterHierarchy[];
  error?: string;
}

export interface CostCenterResponse {
  success: boolean;
  data: CostCenter | null;
  error?: string;
}
