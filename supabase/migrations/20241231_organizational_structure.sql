-- ============================================
-- ORGANIZATIONAL STRUCTURE MIGRATION
-- Teams, Projects, and Cost Centers
-- ============================================

-- ============================================
-- COST CENTERS TABLE (created first for FK references)
-- ============================================
CREATE TABLE IF NOT EXISTS cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identity
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  
  -- Financial Integration
  gl_account TEXT,
  department_code TEXT,
  
  -- Manager
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT DEFAULT 'active',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_cost_center_code UNIQUE (org_id, code),
  CONSTRAINT cost_centers_valid_status CHECK (status IN ('active', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_cost_centers_org ON cost_centers(org_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_cost_centers_parent ON cost_centers(parent_id) WHERE parent_id IS NOT NULL;

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchy
  parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  
  -- Defaults
  default_cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  
  -- Settings
  settings JSONB DEFAULT '{}'::JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  avatar_url TEXT,
  color TEXT,
  
  -- Status
  status TEXT DEFAULT 'active',
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_team_slug UNIQUE (org_id, slug),
  CONSTRAINT teams_valid_status CHECK (status IN ('active', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(org_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_teams_parent ON teams(parent_team_id) WHERE parent_team_id IS NOT NULL;

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Role within team
  role TEXT DEFAULT 'member',
  
  -- Audit
  joined_at TIMESTAMPTZ DEFAULT now(),
  invited_by UUID REFERENCES users(id),
  
  CONSTRAINT unique_team_member UNIQUE (team_id, user_id),
  CONSTRAINT team_members_valid_role CHECK (role IN ('owner', 'admin', 'member', 'viewer'))
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
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
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'active',
  
  -- Financial
  cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  
  -- Settings
  settings JSONB DEFAULT '{}'::JSONB,
  
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
  CONSTRAINT projects_valid_status CHECK (status IN ('active', 'paused', 'archived', 'completed')),
  CONSTRAINT projects_valid_category CHECK (category IS NULL OR category IN ('product', 'internal', 'experiment', 'poc'))
);

CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(org_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(owner_team_id) WHERE owner_team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_cost_center ON projects(cost_center_id) WHERE cost_center_id IS NOT NULL;

-- ============================================
-- PROJECT TEAMS (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS project_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Access level
  access_level TEXT DEFAULT 'contributor',
  
  -- Audit
  added_at TIMESTAMPTZ DEFAULT now(),
  added_by UUID REFERENCES users(id),
  
  CONSTRAINT unique_project_team UNIQUE (project_id, team_id),
  CONSTRAINT project_teams_valid_access CHECK (access_level IN ('owner', 'contributor', 'viewer'))
);

CREATE INDEX IF NOT EXISTS idx_project_teams_project ON project_teams(project_id);
CREATE INDEX IF NOT EXISTS idx_project_teams_team ON project_teams(team_id);

-- ============================================
-- PROJECT API KEYS (linking)
-- ============================================
CREATE TABLE IF NOT EXISTS project_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- API Key info
  provider TEXT NOT NULL,
  key_identifier TEXT NOT NULL,
  key_type TEXT DEFAULT 'exact',
  
  -- Metadata
  label TEXT,
  environment TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_project_key UNIQUE (project_id, provider, key_identifier),
  CONSTRAINT project_api_keys_valid_type CHECK (key_type IN ('exact', 'prefix', 'pattern'))
);

CREATE INDEX IF NOT EXISTS idx_project_api_keys_project ON project_api_keys(project_id);
CREATE INDEX IF NOT EXISTS idx_project_api_keys_lookup ON project_api_keys(provider, key_identifier);

-- ============================================
-- COST CENTER ALLOCATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS cost_center_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_center_id UUID NOT NULL REFERENCES cost_centers(id) ON DELETE CASCADE,
  
  -- What's being allocated
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Allocation details
  allocation_percentage DECIMAL(5, 2) DEFAULT 100,
  
  -- Validity period
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT cost_allocations_valid_percentage CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  CONSTRAINT cost_allocations_valid_entity_type CHECK (entity_type IN ('team', 'project', 'user'))
);

CREATE INDEX IF NOT EXISTS idx_allocations_cost_center ON cost_center_allocations(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_allocations_entity ON cost_center_allocations(entity_type, entity_id);

-- ============================================
-- VIEWS
-- ============================================

-- Team with member count and cost summary
CREATE OR REPLACE VIEW team_summary AS
SELECT 
  t.*,
  (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS member_count,
  (SELECT COUNT(*) FROM projects p WHERE p.owner_team_id = t.id AND p.status = 'active') AS project_count,
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
    id, org_id, code, name, description, parent_id, gl_account, department_code,
    manager_id, status, metadata, created_by, created_at, updated_at,
    1 AS depth,
    ARRAY[id] AS path,
    name AS full_path
  FROM cost_centers
  WHERE parent_id IS NULL AND status = 'active'
  
  UNION ALL
  
  -- Children
  SELECT 
    cc.id, cc.org_id, cc.code, cc.name, cc.description, cc.parent_id, cc.gl_account, 
    cc.department_code, cc.manager_id, cc.status, cc.metadata, cc.created_by, 
    cc.created_at, cc.updated_at,
    ct.depth + 1,
    ct.path || cc.id,
    ct.full_path || ' > ' || cc.name
  FROM cost_centers cc
  JOIN cc_tree ct ON cc.parent_id = ct.id
  WHERE cc.status = 'active'
)
SELECT * FROM cc_tree;

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cost_centers_updated_at ON cost_centers;
CREATE TRIGGER update_cost_centers_updated_at
  BEFORE UPDATE ON cost_centers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
