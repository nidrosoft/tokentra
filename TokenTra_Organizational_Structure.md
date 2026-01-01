# TokenTra Organizational Structure

## Complete Specification for Teams, Projects, and Cost Centers

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#1-overview)
2. [Data Architecture](#2-data-architecture)
3. [Database Schema](#3-database-schema)
4. [TypeScript Types](#4-typescript-types)
5. [Teams Management](#5-teams-management)
6. [Projects Management](#6-projects-management)
7. [Cost Centers Management](#7-cost-centers-management)
8. [Hierarchy & Relationships](#8-hierarchy--relationships)
9. [API Routes](#9-api-routes)
10. [React Hooks](#10-react-hooks)
11. [UI Components](#11-ui-components)

---

## 1. Overview

### 1.1 Purpose

TokenTra's organizational structure enables companies to organize their AI spending by business units. This creates the foundation for:

- **Cost Attribution**: Know which team/project is spending what
- **Budget Assignment**: Set budgets at any organizational level
- **Access Control**: Role-based permissions per team/project
- **Chargeback Reports**: Bill internal teams for their AI usage

### 1.2 Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                       ORGANIZATION                              │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                     COST CENTERS                        │   │
│   │         (Financial groupings for chargeback)            │   │
│   │   ┌───────────┐ ┌───────────┐ ┌───────────┐            │   │
│   │   │Engineering│ │ Marketing │ │  Research │            │   │
│   │   └───────────┘ └───────────┘ └───────────┘            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│   ┌──────────────────────────┼──────────────────────────────┐   │
│   │                       TEAMS                              │   │
│   │            (Organizational groups of people)             │   │
│   │   ┌───────────┐ ┌───────────┐ ┌───────────┐             │   │
│   │   │  Backend  │ │ Frontend  │ │    ML     │             │   │
│   │   │   Team    │ │   Team    │ │   Team    │             │   │
│   │   └─────┬─────┘ └─────┬─────┘ └─────┬─────┘             │   │
│   └─────────┼─────────────┼─────────────┼───────────────────┘   │
│             │             │             │                       │
│   ┌─────────┼─────────────┼─────────────┼───────────────────┐   │
│   │         ▼             ▼             ▼                   │   │
│   │                     PROJECTS                             │   │
│   │         (Specific initiatives or products)               │   │
│   │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│   │   │  Chat   │ │ Search  │ │  Recs   │ │Analytics│       │   │
│   │   │   Bot   │ │ Engine  │ │ Engine  │ │Dashboard│       │   │
│   │   └─────────┘ └─────────┘ └─────────┘ └─────────┘       │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                     USAGE RECORDS (tagged)                      │
│                  teamId, projectId, costCenterId                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Concepts

| Entity | Purpose | Examples |
|--------|---------|----------|
| **Team** | Group of people working together | Backend Team, ML Team, Support Team |
| **Project** | Specific product, feature, or initiative | Chat Bot, Search Engine, Customer Support AI |
| **Cost Center** | Financial grouping for accounting | Engineering Dept, Marketing Dept, R&D |

### 1.4 Tagging Hierarchy

When a request is made via the SDK, it can be tagged with:

```typescript
// SDK Usage Example
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...]
}, {
  tokentra: {
    teamId: 'team_backend',
    projectId: 'proj_chatbot',
    costCenterId: 'cc_engineering',
    featureId: 'feat_conversations',
    userId: 'user_123',
    environment: 'production'
  }
});
```

---

## 2. Data Architecture

### 2.1 Entity Properties

**Teams:**
- Unique identifier
- Name and description
- Parent team (for hierarchy)
- Members (user associations)
- Default cost center
- Metadata (Slack channel, manager, etc.)

**Projects:**
- Unique identifier
- Name and description
- Owning team(s)
- Status (active, paused, archived)
- Environment configurations
- API key associations
- Metadata

**Cost Centers:**
- Unique identifier
- Code (accounting code)
- Name and description
- Parent cost center (for hierarchy)
- GL account mapping
- Budget associations

### 2.2 Relationships

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │───M───│  TeamMember  │───1───│     Team     │
└──────────────┘       └──────────────┘       └──────────────┘
                                                     │
                                              ┌──────┴──────┐
                                              │             │
                                    ┌─────────▼───┐   ┌─────▼───────┐
                                    │ TeamProject │   │ CostCenter  │
                                    └─────────────┘   └─────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │   Project   │
                                    └─────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │ ProjectEnv  │
                                    │  (staging,  │
                                    │ production) │
                                    └─────────────┘
```

---

## 3. Database Schema

```sql
-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,  -- URL-friendly identifier
  description TEXT,
  
  -- Hierarchy
  parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Defaults
  default_cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  
  -- Settings
  settings JSONB DEFAULT '{}'::JSONB,
  /*
    settings: {
      slack_channel: "#backend-team",
      default_model: "gpt-4o",
      spending_limit_enabled: true
    }
  */
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  avatar_url TEXT,
  color TEXT,  -- For UI display
  
  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'archived'
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_team_slug UNIQUE (org_id, slug),
  CONSTRAINT valid_status CHECK (status IN ('active', 'archived'))
);

CREATE INDEX idx_teams_org ON teams(org_id) WHERE status = 'active';
CREATE INDEX idx_teams_parent ON teams(parent_team_id) WHERE parent_team_id IS NOT NULL;

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Role within team
  role TEXT DEFAULT 'member',  -- 'owner', 'admin', 'member', 'viewer'
  
  -- Audit
  joined_at TIMESTAMPTZ DEFAULT now(),
  invited_by UUID REFERENCES users(id),
  
  CONSTRAINT unique_team_member UNIQUE (team_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member', 'viewer'))
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Ownership
  owner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Classification
  category TEXT,  -- 'product', 'internal', 'experiment', 'poc'
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'paused', 'archived', 'completed'
  
  -- Financial
  cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  
  -- Settings
  settings JSONB DEFAULT '{}'::JSONB,
  /*
    settings: {
      default_model: "gpt-4o-mini",
      environments: ["development", "staging", "production"],
      require_approval_above: 1000
    }
  */
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  icon TEXT,
  color TEXT,
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_project_slug UNIQUE (org_id, slug),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'archived', 'completed')),
  CONSTRAINT valid_category CHECK (category IS NULL OR category IN ('product', 'internal', 'experiment', 'poc'))
);

CREATE INDEX idx_projects_org ON projects(org_id) WHERE status = 'active';
CREATE INDEX idx_projects_team ON projects(owner_team_id) WHERE owner_team_id IS NOT NULL;
CREATE INDEX idx_projects_cost_center ON projects(cost_center_id) WHERE cost_center_id IS NOT NULL;

-- ============================================
-- PROJECT TEAMS (many-to-many)
-- ============================================
CREATE TABLE project_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Access level
  access_level TEXT DEFAULT 'contributor',  -- 'owner', 'contributor', 'viewer'
  
  -- Audit
  added_at TIMESTAMPTZ DEFAULT now(),
  added_by UUID REFERENCES users(id),
  
  CONSTRAINT unique_project_team UNIQUE (project_id, team_id),
  CONSTRAINT valid_access CHECK (access_level IN ('owner', 'contributor', 'viewer'))
);

CREATE INDEX idx_project_teams_project ON project_teams(project_id);
CREATE INDEX idx_project_teams_team ON project_teams(team_id);

-- ============================================
-- PROJECT API KEYS (linking)
-- ============================================
CREATE TABLE project_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- API Key info (can be provider's key ID or pattern)
  provider TEXT NOT NULL,  -- 'openai', 'anthropic', etc.
  key_identifier TEXT NOT NULL,  -- Could be key ID, prefix, or pattern
  key_type TEXT DEFAULT 'exact',  -- 'exact', 'prefix', 'pattern'
  
  -- Metadata
  label TEXT,
  environment TEXT,  -- 'production', 'staging', 'development'
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_project_key UNIQUE (project_id, provider, key_identifier)
);

CREATE INDEX idx_project_api_keys_project ON project_api_keys(project_id);
CREATE INDEX idx_project_api_keys_lookup ON project_api_keys(provider, key_identifier);

-- ============================================
-- COST CENTERS TABLE
-- ============================================
CREATE TABLE cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identity
  code TEXT NOT NULL,  -- Accounting code (e.g., "CC-001", "ENG-001")
  name TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  
  -- Financial Integration
  gl_account TEXT,  -- General ledger account
  department_code TEXT,
  
  -- Manager
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'archived'
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_cost_center_code UNIQUE (org_id, code),
  CONSTRAINT valid_status CHECK (status IN ('active', 'archived'))
);

CREATE INDEX idx_cost_centers_org ON cost_centers(org_id) WHERE status = 'active';
CREATE INDEX idx_cost_centers_parent ON cost_centers(parent_id) WHERE parent_id IS NOT NULL;

-- ============================================
-- COST CENTER ALLOCATIONS
-- ============================================
CREATE TABLE cost_center_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_center_id UUID NOT NULL REFERENCES cost_centers(id) ON DELETE CASCADE,
  
  -- What's being allocated
  entity_type TEXT NOT NULL,  -- 'team', 'project', 'user'
  entity_id UUID NOT NULL,
  
  -- Allocation details
  allocation_percentage DECIMAL(5, 2) DEFAULT 100,  -- For split allocations
  
  -- Validity period
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_allocation CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  CONSTRAINT valid_entity_type CHECK (entity_type IN ('team', 'project', 'user'))
);

CREATE INDEX idx_allocations_cost_center ON cost_center_allocations(cost_center_id);
CREATE INDEX idx_allocations_entity ON cost_center_allocations(entity_type, entity_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY teams_org_isolation ON teams
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY team_members_org_isolation ON team_members
  USING (team_id IN (SELECT id FROM teams WHERE org_id = current_setting('app.current_org_id')::UUID));

CREATE POLICY projects_org_isolation ON projects
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY cost_centers_org_isolation ON cost_centers
  USING (org_id = current_setting('app.current_org_id')::UUID);

-- ============================================
-- VIEWS
-- ============================================

-- Team with member count and cost summary
CREATE OR REPLACE VIEW team_summary AS
SELECT 
  t.*,
  (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count,
  (SELECT COUNT(*) FROM projects p WHERE p.owner_team_id = t.id) AS project_count,
  cc.name AS cost_center_name,
  cc.code AS cost_center_code
FROM teams t
LEFT JOIN cost_centers cc ON t.default_cost_center_id = cc.id;

-- Project with team info
CREATE OR REPLACE VIEW project_summary AS
SELECT 
  p.*,
  t.name AS owner_team_name,
  cc.name AS cost_center_name,
  (
    SELECT json_agg(json_build_object('id', tm.id, 'name', tm.name))
    FROM teams tm
    JOIN project_teams pt ON pt.team_id = tm.id
    WHERE pt.project_id = p.id
  ) AS teams
FROM projects p
LEFT JOIN teams t ON p.owner_team_id = t.id
LEFT JOIN cost_centers cc ON p.cost_center_id = cc.id;

-- Cost center hierarchy
CREATE OR REPLACE VIEW cost_center_hierarchy AS
WITH RECURSIVE cc_tree AS (
  -- Root cost centers
  SELECT 
    id, org_id, code, name, parent_id,
    1 AS depth,
    ARRAY[id] AS path,
    name AS full_path
  FROM cost_centers
  WHERE parent_id IS NULL AND status = 'active'
  
  UNION ALL
  
  -- Children
  SELECT 
    cc.id, cc.org_id, cc.code, cc.name, cc.parent_id,
    ct.depth + 1,
    ct.path || cc.id,
    ct.full_path || ' > ' || cc.name
  FROM cost_centers cc
  JOIN cc_tree ct ON cc.parent_id = ct.id
  WHERE cc.status = 'active'
)
SELECT * FROM cc_tree;
```

---

## 4. TypeScript Types

```typescript
// types/organization.ts

// ============================================
// TEAM TYPES
// ============================================

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';
export type TeamStatus = 'active' | 'archived';

export interface Team {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string;
  parentTeamId?: string;
  defaultCostCenterId?: string;
  settings: TeamSettings;
  metadata: Record<string, any>;
  avatarUrl?: string;
  color?: string;
  status: TeamStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamSettings {
  slackChannel?: string;
  defaultModel?: string;
  spendingLimitEnabled?: boolean;
  notificationEmails?: string[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  invitedBy?: string;
  // Joined from users table
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
  // Cost data (from joins)
  totalSpend?: number;
  monthlySpend?: number;
}

// ============================================
// PROJECT TYPES
// ============================================

export type ProjectStatus = 'active' | 'paused' | 'archived' | 'completed';
export type ProjectCategory = 'product' | 'internal' | 'experiment' | 'poc';
export type ProjectAccessLevel = 'owner' | 'contributor' | 'viewer';

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
  metadata: Record<string, any>;
  icon?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSettings {
  defaultModel?: string;
  environments?: string[];
  requireApprovalAbove?: number;
  budgetAlertThreshold?: number;
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
  // Cost data
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
  metadata: Record<string, any>;
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
  // Cost data
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
  metadata?: Record<string, any>;
  color?: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
  parentTeamId?: string | null;
  defaultCostCenterId?: string | null;
  settings?: Partial<TeamSettings>;
  metadata?: Record<string, any>;
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
```

---

## 5. Teams Management

```typescript
// services/teams-service.ts

import { createClient } from '@supabase/supabase-js';
import type { 
  Team, 
  TeamMember, 
  TeamSummary,
  CreateTeamInput,
  UpdateTeamInput,
  TeamRole
} from '@/types/organization';

export class TeamsService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  // ============================================
  // TEAM CRUD
  // ============================================
  
  async getTeams(orgId: string): Promise<TeamSummary[]> {
    const { data, error } = await this.supabase
      .from('team_summary')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }
  
  async getTeam(teamId: string): Promise<TeamSummary | null> {
    const { data, error } = await this.supabase
      .from('team_summary')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async createTeam(orgId: string, input: CreateTeamInput, userId: string): Promise<Team> {
    const slug = input.slug || this.generateSlug(input.name);
    
    const { data, error } = await this.supabase
      .from('teams')
      .insert({
        org_id: orgId,
        name: input.name,
        slug,
        description: input.description,
        parent_team_id: input.parentTeamId,
        default_cost_center_id: input.defaultCostCenterId,
        settings: input.settings || {},
        metadata: input.metadata || {},
        color: input.color,
        created_by: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Add creator as owner
    await this.addMember(data.id, userId, 'owner', userId);
    
    return data;
  }
  
  async updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team> {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
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
    
    if (error) throw error;
    return data;
  }
  
  async deleteTeam(teamId: string): Promise<void> {
    // Soft delete by archiving
    await this.updateTeam(teamId, { status: 'archived' });
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
    
    if (error) throw error;
    return data || [];
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
        invited_by: invitedBy
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async updateMemberRole(teamId: string, userId: string, role: TeamRole): Promise<void> {
    const { error } = await this.supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
  
  async removeMember(teamId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
  
  // ============================================
  // TEAM HIERARCHY
  // ============================================
  
  async getTeamHierarchy(orgId: string): Promise<TeamSummary[]> {
    const teams = await this.getTeams(orgId);
    return this.buildHierarchy(teams);
  }
  
  private buildHierarchy(teams: TeamSummary[]): TeamSummary[] {
    const teamMap = new Map(teams.map(t => [t.id, { ...t, children: [] as TeamSummary[] }]));
    const roots: TeamSummary[] = [];
    
    teams.forEach(team => {
      if (team.parentTeamId) {
        const parent = teamMap.get(team.parentTeamId);
        if (parent) {
          (parent as any).children.push(teamMap.get(team.id));
        }
      } else {
        roots.push(teamMap.get(team.id)!);
      }
    });
    
    return roots;
  }
  
  // ============================================
  // TEAM COSTS
  // ============================================
  
  async getTeamCosts(
    teamId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{
    totalCost: number;
    byModel: Record<string, number>;
    byProject: Record<string, number>;
    trend: Array<{ date: string; cost: number }>;
  }> {
    const { data, error } = await this.supabase
      .from('daily_cost_rollup')
      .select('date, model, project_id, total_cost')
      .eq('team_id', teamId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    const byModel: Record<string, number> = {};
    const byProject: Record<string, number> = {};
    const byDate: Record<string, number> = {};
    let totalCost = 0;
    
    (data || []).forEach(row => {
      totalCost += row.total_cost || 0;
      byModel[row.model] = (byModel[row.model] || 0) + (row.total_cost || 0);
      if (row.project_id) {
        byProject[row.project_id] = (byProject[row.project_id] || 0) + (row.total_cost || 0);
      }
      byDate[row.date] = (byDate[row.date] || 0) + (row.total_cost || 0);
    });
    
    const trend = Object.entries(byDate)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return { totalCost, byModel, byProject, trend };
  }
  
  // ============================================
  // HELPERS
  // ============================================
  
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export const teamsService = new TeamsService();
```

---

## 6. Projects Management

```typescript
// services/projects-service.ts

import { createClient } from '@supabase/supabase-js';
import type { 
  Project, 
  ProjectSummary,
  ProjectTeam,
  ProjectApiKey,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectAccessLevel
} from '@/types/organization';

export class ProjectsService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
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
    
    if (error) throw error;
    return data || [];
  }
  
  async getProject(projectId: string): Promise<ProjectSummary | null> {
    const { data, error } = await this.supabase
      .from('project_summary')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async createProject(orgId: string, input: CreateProjectInput, userId: string): Promise<Project> {
    const slug = input.slug || this.generateSlug(input.name);
    
    const { data, error } = await this.supabase
      .from('projects')
      .insert({
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
        created_by: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Link to owner team if specified
    if (input.ownerTeamId) {
      await this.addTeam(data.id, input.ownerTeamId, 'owner', userId);
    }
    
    return data;
  }
  
  async updateProject(projectId: string, input: UpdateProjectInput): Promise<Project> {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
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
    
    if (error) throw error;
    return data;
  }
  
  async deleteProject(projectId: string): Promise<void> {
    await this.updateProject(projectId, { status: 'archived' });
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
    
    if (error) throw error;
    return data || [];
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
        added_by: addedBy
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
    
    if (error) throw error;
  }
  
  async removeTeam(projectId: string, teamId: string): Promise<void> {
    const { error } = await this.supabase
      .from('project_teams')
      .delete()
      .eq('project_id', projectId)
      .eq('team_id', teamId);
    
    if (error) throw error;
  }
  
  // ============================================
  // PROJECT API KEYS
  // ============================================
  
  async getApiKeys(projectId: string): Promise<ProjectApiKey[]> {
    const { data, error } = await this.supabase
      .from('project_api_keys')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data || [];
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
        environment: options?.environment
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async unlinkApiKey(projectId: string, keyId: string): Promise<void> {
    const { error } = await this.supabase
      .from('project_api_keys')
      .delete()
      .eq('project_id', projectId)
      .eq('id', keyId);
    
    if (error) throw error;
  }
  
  // ============================================
  // PROJECT COSTS
  // ============================================
  
  async getProjectCosts(
    projectId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{
    totalCost: number;
    byModel: Record<string, number>;
    byEnvironment: Record<string, number>;
    trend: Array<{ date: string; cost: number }>;
  }> {
    const { data, error } = await this.supabase
      .from('daily_cost_rollup')
      .select('date, model, environment, total_cost')
      .eq('project_id', projectId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    const byModel: Record<string, number> = {};
    const byEnvironment: Record<string, number> = {};
    const byDate: Record<string, number> = {};
    let totalCost = 0;
    
    (data || []).forEach(row => {
      totalCost += row.total_cost || 0;
      byModel[row.model] = (byModel[row.model] || 0) + (row.total_cost || 0);
      if (row.environment) {
        byEnvironment[row.environment] = (byEnvironment[row.environment] || 0) + (row.total_cost || 0);
      }
      byDate[row.date] = (byDate[row.date] || 0) + (row.total_cost || 0);
    });
    
    const trend = Object.entries(byDate)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return { totalCost, byModel, byEnvironment, trend };
  }
  
  // ============================================
  // HELPERS
  // ============================================
  
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

export const projectsService = new ProjectsService();
```

---

## 7. Cost Centers Management

```typescript
// services/cost-centers-service.ts

import { createClient } from '@supabase/supabase-js';
import type { 
  CostCenter, 
  CostCenterHierarchy,
  CostCenterAllocation,
  CreateCostCenterInput,
  UpdateCostCenterInput
} from '@/types/organization';

export class CostCentersService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
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
    
    if (error) throw error;
    return data || [];
  }
  
  async getCostCenter(costCenterId: string): Promise<CostCenter | null> {
    const { data, error } = await this.supabase
      .from('cost_centers')
      .select('*')
      .eq('id', costCenterId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async createCostCenter(
    orgId: string, 
    input: CreateCostCenterInput, 
    userId: string
  ): Promise<CostCenter> {
    const { data, error } = await this.supabase
      .from('cost_centers')
      .insert({
        org_id: orgId,
        code: input.code,
        name: input.name,
        description: input.description,
        parent_id: input.parentId,
        gl_account: input.glAccount,
        department_code: input.departmentCode,
        manager_id: input.managerId,
        created_by: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async updateCostCenter(costCenterId: string, input: UpdateCostCenterInput): Promise<CostCenter> {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
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
    
    if (error) throw error;
    return data;
  }
  
  async deleteCostCenter(costCenterId: string): Promise<void> {
    await this.updateCostCenter(costCenterId, { status: 'archived' });
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
    
    if (error) throw error;
    
    return this.buildHierarchy(data || []);
  }
  
  private buildHierarchy(flatList: any[]): CostCenterHierarchy[] {
    const map = new Map(flatList.map(cc => [cc.id, { ...cc, children: [] }]));
    const roots: CostCenterHierarchy[] = [];
    
    flatList.forEach(cc => {
      if (cc.parent_id) {
        const parent = map.get(cc.parent_id);
        if (parent) {
          parent.children.push(map.get(cc.id)!);
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
    
    if (error) throw error;
    return data || [];
  }
  
  async allocateEntity(
    costCenterId: string,
    entityType: 'team' | 'project' | 'user',
    entityId: string,
    allocationPercentage: number = 100
  ): Promise<CostCenterAllocation> {
    const { data, error } = await this.supabase
      .from('cost_center_allocations')
      .insert({
        cost_center_id: costCenterId,
        entity_type: entityType,
        entity_id: entityId,
        allocation_percentage: allocationPercentage
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async removeAllocation(allocationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('cost_center_allocations')
      .update({ effective_until: new Date().toISOString().split('T')[0] })
      .eq('id', allocationId);
    
    if (error) throw error;
  }
  
  // ============================================
  // COST CENTER COSTS
  // ============================================
  
  async getCostCenterCosts(
    costCenterId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{
    totalCost: number;
    byTeam: Record<string, number>;
    byProject: Record<string, number>;
    byModel: Record<string, number>;
    trend: Array<{ date: string; cost: number }>;
  }> {
    const { data, error } = await this.supabase
      .from('daily_cost_rollup')
      .select('date, team_id, project_id, model, total_cost')
      .eq('cost_center_id', costCenterId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    const byTeam: Record<string, number> = {};
    const byProject: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    const byDate: Record<string, number> = {};
    let totalCost = 0;
    
    (data || []).forEach(row => {
      totalCost += row.total_cost || 0;
      if (row.team_id) {
        byTeam[row.team_id] = (byTeam[row.team_id] || 0) + (row.total_cost || 0);
      }
      if (row.project_id) {
        byProject[row.project_id] = (byProject[row.project_id] || 0) + (row.total_cost || 0);
      }
      byModel[row.model] = (byModel[row.model] || 0) + (row.total_cost || 0);
      byDate[row.date] = (byDate[row.date] || 0) + (row.total_cost || 0);
    });
    
    const trend = Object.entries(byDate)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return { totalCost, byTeam, byProject, byModel, trend };
  }
  
  // ============================================
  // CHARGEBACK REPORT
  // ============================================
  
  async generateChargebackReport(
    orgId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{
    costCenter: CostCenter;
    totalCost: number;
    teams: Array<{ id: string; name: string; cost: number }>;
    projects: Array<{ id: string; name: string; cost: number }>;
  }>> {
    const costCenters = await this.getCostCenters(orgId);
    const results = [];
    
    for (const cc of costCenters) {
      const costs = await this.getCostCenterCosts(cc.id, startDate, endDate);
      
      // Fetch team and project names
      const teamIds = Object.keys(costs.byTeam);
      const projectIds = Object.keys(costs.byProject);
      
      const { data: teams } = await this.supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds);
      
      const { data: projects } = await this.supabase
        .from('projects')
        .select('id, name')
        .in('id', projectIds);
      
      results.push({
        costCenter: cc,
        totalCost: costs.totalCost,
        teams: (teams || []).map(t => ({
          id: t.id,
          name: t.name,
          cost: costs.byTeam[t.id] || 0
        })),
        projects: (projects || []).map(p => ({
          id: p.id,
          name: p.name,
          cost: costs.byProject[p.id] || 0
        }))
      });
    }
    
    return results.sort((a, b) => b.totalCost - a.totalCost);
  }
}

export const costCentersService = new CostCentersService();
```

---

## 8. Hierarchy & Relationships

```typescript
// services/organization-hierarchy.ts

import { teamsService } from './teams-service';
import { projectsService } from './projects-service';
import { costCentersService } from './cost-centers-service';

interface OrganizationTree {
  costCenters: Array<{
    id: string;
    name: string;
    code: string;
    teams: Array<{
      id: string;
      name: string;
      projects: Array<{
        id: string;
        name: string;
        status: string;
      }>;
    }>;
  }>;
  unassigned: {
    teams: Array<{ id: string; name: string }>;
    projects: Array<{ id: string; name: string }>;
  };
}

export async function getOrganizationTree(orgId: string): Promise<OrganizationTree> {
  const [costCenters, teams, projects] = await Promise.all([
    costCentersService.getCostCenters(orgId),
    teamsService.getTeams(orgId),
    projectsService.getProjects(orgId)
  ]);
  
  // Build tree
  const tree: OrganizationTree = {
    costCenters: [],
    unassigned: {
      teams: [],
      projects: []
    }
  };
  
  // Group teams by cost center
  const teamsByCostCenter = new Map<string | null, typeof teams>();
  teams.forEach(team => {
    const ccId = team.defaultCostCenterId || null;
    if (!teamsByCostCenter.has(ccId)) {
      teamsByCostCenter.set(ccId, []);
    }
    teamsByCostCenter.get(ccId)!.push(team);
  });
  
  // Group projects by team
  const projectsByTeam = new Map<string | null, typeof projects>();
  projects.forEach(project => {
    const teamId = project.ownerTeamId || null;
    if (!projectsByTeam.has(teamId)) {
      projectsByTeam.set(teamId, []);
    }
    projectsByTeam.get(teamId)!.push(project);
  });
  
  // Build cost center nodes
  costCenters.forEach(cc => {
    const ccTeams = teamsByCostCenter.get(cc.id) || [];
    
    tree.costCenters.push({
      id: cc.id,
      name: cc.name,
      code: cc.code,
      teams: ccTeams.map(team => ({
        id: team.id,
        name: team.name,
        projects: (projectsByTeam.get(team.id) || []).map(p => ({
          id: p.id,
          name: p.name,
          status: p.status
        }))
      }))
    });
  });
  
  // Unassigned teams
  tree.unassigned.teams = (teamsByCostCenter.get(null) || []).map(t => ({
    id: t.id,
    name: t.name
  }));
  
  // Unassigned projects (no team)
  tree.unassigned.projects = (projectsByTeam.get(null) || []).map(p => ({
    id: p.id,
    name: p.name
  }));
  
  return tree;
}

// Auto-attribution: find best match for an API request
export async function resolveAttribution(
  orgId: string,
  dimensions: {
    apiKeyId?: string;
    provider?: string;
  }
): Promise<{
  teamId?: string;
  projectId?: string;
  costCenterId?: string;
}> {
  // If API key is linked to a project, use that
  if (dimensions.apiKeyId) {
    const { data } = await supabase
      .from('project_api_keys')
      .select('project_id, projects(owner_team_id, cost_center_id)')
      .eq('key_identifier', dimensions.apiKeyId)
      .single();
    
    if (data) {
      return {
        projectId: data.project_id,
        teamId: data.projects?.owner_team_id,
        costCenterId: data.projects?.cost_center_id
      };
    }
  }
  
  return {};
}
```

---

## 9. API Routes

```typescript
// app/api/v1/teams/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { teamsService } from '@/services/teams-service';
import { z } from 'zod';

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  parentTeamId: z.string().uuid().optional(),
  defaultCostCenterId: z.string().uuid().optional(),
  settings: z.record(z.any()).optional(),
  color: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) return NextResponse.json({ error: 'Org ID required' }, { status: 400 });
    
    const teams = await teamsService.getTeams(orgId);
    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id');
    const userId = request.headers.get('x-user-id');
    if (!orgId || !userId) {
      return NextResponse.json({ error: 'Auth required' }, { status: 400 });
    }
    
    const body = await request.json();
    const input = createTeamSchema.parse(body);
    
    const team = await teamsService.createTeam(orgId, input, userId);
    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
```

```typescript
// app/api/v1/projects/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { projectsService } from '@/services/projects-service';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  ownerTeamId: z.string().uuid().optional(),
  category: z.enum(['product', 'internal', 'experiment', 'poc']).optional(),
  tags: z.array(z.string()).optional(),
  costCenterId: z.string().uuid().optional(),
  settings: z.record(z.any()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) return NextResponse.json({ error: 'Org ID required' }, { status: 400 });
    
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId') || undefined;
    const status = searchParams.get('status') || undefined;
    
    const projects = await projectsService.getProjects(orgId, { teamId, status });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id');
    const userId = request.headers.get('x-user-id');
    if (!orgId || !userId) {
      return NextResponse.json({ error: 'Auth required' }, { status: 400 });
    }
    
    const body = await request.json();
    const input = createProjectSchema.parse(body);
    
    const project = await projectsService.createProject(orgId, input, userId);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
```

```typescript
// app/api/v1/cost-centers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { costCentersService } from '@/services/cost-centers-service';
import { z } from 'zod';

const createCostCenterSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid().optional(),
  glAccount: z.string().optional(),
  departmentCode: z.string().optional(),
  managerId: z.string().uuid().optional()
});

export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) return NextResponse.json({ error: 'Org ID required' }, { status: 400 });
    
    const { searchParams } = new URL(request.url);
    const includeHierarchy = searchParams.get('hierarchy') === 'true';
    
    if (includeHierarchy) {
      const hierarchy = await costCentersService.getCostCenterHierarchy(orgId);
      return NextResponse.json({ costCenters: hierarchy });
    }
    
    const costCenters = await costCentersService.getCostCenters(orgId);
    return NextResponse.json({ costCenters });
  } catch (error) {
    console.error('Error fetching cost centers:', error);
    return NextResponse.json({ error: 'Failed to fetch cost centers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id');
    const userId = request.headers.get('x-user-id');
    if (!orgId || !userId) {
      return NextResponse.json({ error: 'Auth required' }, { status: 400 });
    }
    
    const body = await request.json();
    const input = createCostCenterSchema.parse(body);
    
    const costCenter = await costCentersService.createCostCenter(orgId, input, userId);
    return NextResponse.json({ costCenter }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating cost center:', error);
    return NextResponse.json({ error: 'Failed to create cost center' }, { status: 500 });
  }
}
```

---

## 10. React Hooks

```typescript
// hooks/use-organization.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  Team, TeamSummary, CreateTeamInput, UpdateTeamInput,
  Project, ProjectSummary, CreateProjectInput, UpdateProjectInput,
  CostCenter, CostCenterHierarchy, CreateCostCenterInput
} from '@/types/organization';

// ============================================
// TEAMS
// ============================================

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/v1/teams');
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      return data.teams as TeamSummary[];
    }
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/teams/${teamId}`);
      if (!res.ok) throw new Error('Failed to fetch team');
      return res.json();
    },
    enabled: !!teamId
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      const res = await fetch('/api/v1/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error('Failed to create team');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });
}

export function useUpdateTeam(teamId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateTeamInput) => {
      const res = await fetch(`/api/v1/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error('Failed to update team');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    }
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/teams/${teamId}/members`);
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
    enabled: !!teamId
  });
}

// ============================================
// PROJECTS
// ============================================

export function useProjects(filters?: { teamId?: string; status?: string }) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.teamId) params.set('teamId', filters.teamId);
      if (filters?.status) params.set('status', filters.status);
      
      const res = await fetch(`/api/v1/projects?${params}`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      return data.projects as ProjectSummary[];
    }
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json();
    },
    enabled: !!projectId
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

// ============================================
// COST CENTERS
// ============================================

export function useCostCenters(includeHierarchy = false) {
  return useQuery({
    queryKey: ['cost-centers', { hierarchy: includeHierarchy }],
    queryFn: async () => {
      const url = includeHierarchy 
        ? '/api/v1/cost-centers?hierarchy=true'
        : '/api/v1/cost-centers';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch cost centers');
      const data = await res.json();
      return data.costCenters as (CostCenter | CostCenterHierarchy)[];
    }
  });
}

export function useCostCenter(costCenterId: string) {
  return useQuery({
    queryKey: ['cost-center', costCenterId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/cost-centers/${costCenterId}`);
      if (!res.ok) throw new Error('Failed to fetch cost center');
      return res.json();
    },
    enabled: !!costCenterId
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateCostCenterInput) => {
      const res = await fetch('/api/v1/cost-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error('Failed to create cost center');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
    }
  });
}

export function useChargebackReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['chargeback-report', startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/v1/cost-centers/chargeback?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error('Failed to generate report');
      return res.json();
    }
  });
}
```

---

## 11. UI Components

```typescript
// components/organization/team-card.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, FolderKanban, DollarSign } from 'lucide-react';
import type { TeamSummary } from '@/types/organization';

interface TeamCardProps {
  team: TeamSummary;
  onClick?: () => void;
}

export function TeamCard({ team, onClick }: TeamCardProps) {
  const formatCurrency = (value?: number) => {
    if (!value) return '$0';
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10" style={{ backgroundColor: team.color || '#6366f1' }}>
            <AvatarFallback className="text-white text-sm">
              {team.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{team.name}</CardTitle>
            {team.costCenterName && (
              <Badge variant="outline" className="text-xs mt-1">
                {team.costCenterCode}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{team.memberCount} members</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            <span>{team.projectCount} projects</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatCurrency(team.monthlySpend)}/mo</span>
          </div>
        </div>
        {team.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {team.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

```typescript
// components/organization/cost-center-tree.tsx

'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Building, DollarSign } from 'lucide-react';
import type { CostCenterHierarchy } from '@/types/organization';
import { cn } from '@/lib/utils';

interface CostCenterTreeProps {
  nodes: CostCenterHierarchy[];
  onSelect?: (costCenter: CostCenterHierarchy) => void;
}

function TreeNode({ 
  node, 
  onSelect,
  depth = 0 
}: { 
  node: CostCenterHierarchy;
  onSelect?: (costCenter: CostCenterHierarchy) => void;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  
  const formatCurrency = (value?: number) => {
    if (!value) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };
  
  return (
    <div>
      <div 
        className={cn(
          'flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/50 cursor-pointer',
          depth === 0 && 'font-medium'
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => onSelect?.(node)}
      >
        {hasChildren ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <div className="w-5" />
        )}
        
        <Building className="h-4 w-4 text-muted-foreground" />
        
        <span className="flex-1">
          <span className="font-mono text-xs text-muted-foreground mr-2">{node.code}</span>
          {node.name}
        </span>
        
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {formatCurrency(node.totalSpend)}
        </span>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CostCenterTree({ nodes, onSelect }: CostCenterTreeProps) {
  return (
    <div className="border rounded-lg p-2">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} onSelect={onSelect} />
      ))}
    </div>
  );
}
```

---

## Summary

This document provides a complete specification for TokenTra's organizational structure:

1. **Teams**: Groups of people with members, roles, and hierarchies
2. **Projects**: Specific initiatives with team assignments and API key linking
3. **Cost Centers**: Financial groupings for chargeback and accounting

**Key Features:**
- Hierarchical structures for all three entities
- Full CRUD operations with TypeScript types
- Cost tracking at every level
- API key to project linking for automatic attribution
- Chargeback report generation
- React hooks for UI integration

**Integration Points:**
- Usage records tagged with teamId, projectId, costCenterId
- Budgets can be assigned to any organizational entity
- Cost Analysis can break down by any dimension
- Reports can be generated per cost center
