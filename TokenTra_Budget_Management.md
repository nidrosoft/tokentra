# TokenTra Budget Management System

## Complete Specification for Enterprise AI Cost Budget Controls

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#1-overview)
2. [Budget Types & Hierarchy](#2-budget-types--hierarchy)
3. [Database Schema](#3-database-schema)
4. [TypeScript Types & Interfaces](#4-typescript-types--interfaces)
5. [Budget Calculation Engine](#5-budget-calculation-engine)
6. [Budget Allocation Workflows](#6-budget-allocation-workflows)
7. [Threshold & Alert Integration](#7-threshold--alert-integration)
8. [Forecasting Integration](#8-forecasting-integration)
9. [Hard Limits & Enforcement](#9-hard-limits--enforcement)
10. [Rollover & Carry Forward](#10-rollover--carry-forward)
11. [API Routes](#11-api-routes)
12. [React Hooks & State Management](#12-react-hooks--state-management)
13. [UI Components](#13-ui-components)
14. [Background Jobs](#14-background-jobs)
15. [Audit Trail](#15-audit-trail)

---

## 1. Overview

### 1.1 Purpose

The Budget Management System enables organizations to set, track, and enforce spending limits across their AI infrastructure. It provides hierarchical budget controls from organization-level down to individual API keys, with real-time tracking, forecasting, and automatic enforcement.

### 1.2 Key Features

- **Hierarchical Budgets**: Organization → Team → Project → Cost Center → API Key
- **Flexible Periods**: Monthly, quarterly, annual, or custom date ranges
- **Real-time Tracking**: Budget utilization updated with each provider sync (5-minute intervals)
- **Threshold Alerts**: Configurable alerts at any percentage (e.g., 50%, 80%, 90%, 100%)
- **Hard Limits**: Optional automatic enforcement to prevent overspend
- **Forecasting**: ML-powered predictions of budget exhaustion dates
- **Rollover**: Configurable carry-forward of unused budget
- **Allocation**: Top-down budget distribution with constraints

### 1.3 Integration Points

| System | Integration Type | Description |
|--------|------------------|-------------|
| Alerting Engine | Bidirectional | Budget thresholds trigger alerts |
| Provider Sync | One-way (inbound) | Usage data updates budget consumption |
| Cost Centers | One-way (inbound) | Budgets can be assigned to cost centers |
| Teams/Projects | One-way (inbound) | Budgets can be assigned to teams/projects |
| Forecasting Engine | Bidirectional | Forecasts inform budget recommendations |

---

## 2. Budget Types & Hierarchy

### 2.1 Budget Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION BUDGET                          │
│                    Total: $100,000/month                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────┐  ┌─────────────────────┐             │
│   │   TEAM: Engineering │  │   TEAM: Marketing   │             │
│   │   Budget: $70,000   │  │   Budget: $20,000   │             │
│   ├─────────────────────┤  ├─────────────────────┤             │
│   │                     │  │                     │             │
│   │ ┌─────────────────┐ │  │ ┌─────────────────┐ │             │
│   │ │ PROJECT: Chat   │ │  │ │ PROJECT: Ads    │ │             │
│   │ │ $40,000         │ │  │ │ $15,000         │ │             │
│   │ └─────────────────┘ │  │ └─────────────────┘ │             │
│   │                     │  │                     │             │
│   │ ┌─────────────────┐ │  │ ┌─────────────────┐ │             │
│   │ │ PROJECT: Search │ │  │ │ PROJECT: Email  │ │             │
│   │ │ $30,000         │ │  │ │ $5,000          │ │             │
│   │ └─────────────────┘ │  │ └─────────────────┘ │             │
│   └─────────────────────┘  └─────────────────────┘             │
│                                                                 │
│   ┌─────────────────────────────────────────────┐               │
│   │          UNALLOCATED: $10,000               │               │
│   │          (Reserve / Buffer)                 │               │
│   └─────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Budget Types

| Type | Scope | Description |
|------|-------|-------------|
| `organization` | Entire org | Master budget, sum of all child budgets |
| `team` | Team level | Allocated to a specific team |
| `project` | Project level | Allocated to a specific project |
| `cost_center` | Cost center | Allocated to a cost center (can span teams/projects) |
| `provider` | Provider level | Budget for a specific provider (OpenAI, Anthropic, etc.) |
| `model` | Model level | Budget for a specific model (gpt-4o, claude-sonnet, etc.) |
| `api_key` | API key level | Budget for a specific API key |
| `user` | User level | Per-user budget (for SaaS cost allocation) |

### 2.3 Budget Periods

| Period | Duration | Use Case |
|--------|----------|----------|
| `monthly` | Calendar month | Most common, aligns with billing cycles |
| `quarterly` | 3 months | Enterprise planning cycles |
| `annual` | 12 months | Fiscal year budgets |
| `weekly` | 7 days | Tight cost control, startups |
| `custom` | User-defined | Special projects, campaigns |

### 2.4 Budget Modes

```typescript
type BudgetMode = 
  | 'soft'      // Alert only, no enforcement
  | 'hard'      // Block requests when exceeded
  | 'throttle'; // Rate limit when approaching limit
```

---

## 3. Database Schema

### 3.1 Core Tables

```sql
-- ============================================
-- BUDGETS TABLE
-- ============================================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Budget Scope
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,  -- 'organization', 'team', 'project', 'cost_center', 'provider', 'model', 'api_key', 'user'
  
  -- Scope References (only one should be set based on type)
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  cost_center_id UUID REFERENCES cost_centers(id) ON DELETE CASCADE,
  provider TEXT,  -- 'openai', 'anthropic', 'google', 'azure', 'aws'
  model TEXT,     -- Specific model ID
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Budget Amount
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Period Configuration
  period TEXT NOT NULL,  -- 'monthly', 'quarterly', 'annual', 'weekly', 'custom'
  period_start DATE,     -- For custom periods
  period_end DATE,       -- For custom periods
  
  -- Behavior Configuration
  mode TEXT DEFAULT 'soft',  -- 'soft', 'hard', 'throttle'
  throttle_percentage DECIMAL(5, 2),  -- At what % to start throttling (e.g., 90)
  
  -- Rollover Configuration
  rollover_enabled BOOLEAN DEFAULT false,
  rollover_percentage DECIMAL(5, 2) DEFAULT 100,  -- % of unused budget to roll over
  rollover_cap DECIMAL(12, 2),  -- Maximum rollover amount
  
  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'paused', 'archived'
  
  -- Metadata
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_budget_type CHECK (type IN ('organization', 'team', 'project', 'cost_center', 'provider', 'model', 'api_key', 'user')),
  CONSTRAINT valid_period CHECK (period IN ('monthly', 'quarterly', 'annual', 'weekly', 'custom')),
  CONSTRAINT valid_mode CHECK (mode IN ('soft', 'hard', 'throttle')),
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_throttle CHECK (throttle_percentage IS NULL OR (throttle_percentage >= 0 AND throttle_percentage <= 100))
);

-- Indexes
CREATE INDEX idx_budgets_org ON budgets(org_id);
CREATE INDEX idx_budgets_team ON budgets(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_budgets_project ON budgets(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_budgets_cost_center ON budgets(cost_center_id) WHERE cost_center_id IS NOT NULL;
CREATE INDEX idx_budgets_status ON budgets(org_id, status);
CREATE INDEX idx_budgets_type ON budgets(org_id, type);

-- ============================================
-- BUDGET THRESHOLDS TABLE
-- ============================================
CREATE TABLE budget_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  
  -- Threshold Configuration
  percentage DECIMAL(5, 2) NOT NULL,  -- e.g., 50, 80, 90, 100, 120
  
  -- Alert Configuration (links to alerting engine)
  alert_enabled BOOLEAN DEFAULT true,
  alert_channels JSONB DEFAULT '[]',  -- Override budget-level channels
  
  -- Action Configuration
  action TEXT DEFAULT 'alert',  -- 'alert', 'throttle', 'block'
  
  -- Status Tracking
  triggered_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_percentage CHECK (percentage > 0),
  CONSTRAINT valid_action CHECK (action IN ('alert', 'throttle', 'block'))
);

-- Indexes
CREATE INDEX idx_budget_thresholds_budget ON budget_thresholds(budget_id);
CREATE UNIQUE INDEX idx_budget_thresholds_unique ON budget_thresholds(budget_id, percentage);

-- ============================================
-- BUDGET PERIODS TABLE (Tracking each period's state)
-- ============================================
CREATE TABLE budget_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  
  -- Period Definition
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Budget for this period (may differ from base due to adjustments/rollover)
  allocated_amount DECIMAL(12, 2) NOT NULL,
  rollover_amount DECIMAL(12, 2) DEFAULT 0,
  adjusted_amount DECIMAL(12, 2) DEFAULT 0,  -- Manual adjustments
  total_budget DECIMAL(12, 2) GENERATED ALWAYS AS (allocated_amount + rollover_amount + adjusted_amount) STORED,
  
  -- Consumption Tracking
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (allocated_amount + rollover_amount + adjusted_amount - spent_amount) STORED,
  utilization_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN (allocated_amount + rollover_amount + adjusted_amount) > 0 
    THEN ROUND((spent_amount / (allocated_amount + rollover_amount + adjusted_amount)) * 100, 2)
    ELSE 0 END
  ) STORED,
  
  -- Forecasting
  forecasted_spend DECIMAL(12, 2),
  forecasted_end_date DATE,
  days_until_exhaustion INTEGER,
  
  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'completed', 'overspent'
  
  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- Indexes
CREATE INDEX idx_budget_periods_budget ON budget_periods(budget_id);
CREATE INDEX idx_budget_periods_dates ON budget_periods(period_start, period_end);
CREATE INDEX idx_budget_periods_active ON budget_periods(budget_id) WHERE status = 'active';
CREATE UNIQUE INDEX idx_budget_periods_unique ON budget_periods(budget_id, period_start);

-- ============================================
-- BUDGET ALLOCATIONS TABLE (Parent-Child relationships)
-- ============================================
CREATE TABLE budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  child_budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  
  -- Allocation Method
  allocation_type TEXT DEFAULT 'fixed',  -- 'fixed', 'percentage', 'dynamic'
  allocation_value DECIMAL(12, 2) NOT NULL,  -- Amount or percentage
  
  -- Constraints
  min_amount DECIMAL(12, 2),
  max_amount DECIMAL(12, 2),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_allocation_type CHECK (allocation_type IN ('fixed', 'percentage', 'dynamic')),
  CONSTRAINT no_self_reference CHECK (parent_budget_id != child_budget_id)
);

-- Indexes
CREATE INDEX idx_budget_allocations_parent ON budget_allocations(parent_budget_id);
CREATE INDEX idx_budget_allocations_child ON budget_allocations(child_budget_id);
CREATE UNIQUE INDEX idx_budget_allocations_unique ON budget_allocations(parent_budget_id, child_budget_id);

-- ============================================
-- BUDGET ADJUSTMENTS TABLE (Manual changes)
-- ============================================
CREATE TABLE budget_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  budget_period_id UUID REFERENCES budget_periods(id) ON DELETE CASCADE,
  
  -- Adjustment Details
  adjustment_type TEXT NOT NULL,  -- 'increase', 'decrease', 'transfer_in', 'transfer_out'
  amount DECIMAL(12, 2) NOT NULL,
  reason TEXT NOT NULL,
  
  -- For transfers
  related_budget_id UUID REFERENCES budgets(id),
  
  -- Approval (for enterprise)
  requires_approval BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  
  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_adjustment_type CHECK (adjustment_type IN ('increase', 'decrease', 'transfer_in', 'transfer_out'))
);

-- Indexes
CREATE INDEX idx_budget_adjustments_budget ON budget_adjustments(budget_id);
CREATE INDEX idx_budget_adjustments_period ON budget_adjustments(budget_period_id);

-- ============================================
-- BUDGET CONSUMPTION LOG (Detailed tracking)
-- ============================================
CREATE TABLE budget_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_period_id UUID NOT NULL REFERENCES budget_periods(id) ON DELETE CASCADE,
  
  -- Consumption Source
  usage_record_id UUID REFERENCES usage_records(id),
  
  -- Amount
  amount DECIMAL(12, 4) NOT NULL,
  running_total DECIMAL(12, 2) NOT NULL,
  
  -- Metadata
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Partitioned by month for performance
-- In production, consider partitioning this table

CREATE INDEX idx_budget_consumption_period ON budget_consumption(budget_period_id);
CREATE INDEX idx_budget_consumption_time ON budget_consumption(recorded_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_consumption ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY budgets_org_isolation ON budgets
  USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY budget_thresholds_org_isolation ON budget_thresholds
  USING (budget_id IN (SELECT id FROM budgets WHERE org_id = current_setting('app.current_org_id')::UUID));

CREATE POLICY budget_periods_org_isolation ON budget_periods
  USING (budget_id IN (SELECT id FROM budgets WHERE org_id = current_setting('app.current_org_id')::UUID));

CREATE POLICY budget_allocations_org_isolation ON budget_allocations
  USING (parent_budget_id IN (SELECT id FROM budgets WHERE org_id = current_setting('app.current_org_id')::UUID));

CREATE POLICY budget_adjustments_org_isolation ON budget_adjustments
  USING (budget_id IN (SELECT id FROM budgets WHERE org_id = current_setting('app.current_org_id')::UUID));

CREATE POLICY budget_consumption_org_isolation ON budget_consumption
  USING (budget_period_id IN (
    SELECT bp.id FROM budget_periods bp 
    JOIN budgets b ON bp.budget_id = b.id 
    WHERE b.org_id = current_setting('app.current_org_id')::UUID
  ));
```

### 3.2 Views

```sql
-- ============================================
-- BUDGET SUMMARY VIEW
-- ============================================
CREATE OR REPLACE VIEW budget_summary AS
SELECT 
  b.id,
  b.org_id,
  b.name,
  b.type,
  b.amount AS base_amount,
  b.period,
  b.mode,
  b.status,
  bp.period_start,
  bp.period_end,
  bp.total_budget,
  bp.spent_amount,
  bp.remaining_amount,
  bp.utilization_percentage,
  bp.forecasted_spend,
  bp.forecasted_end_date,
  bp.days_until_exhaustion,
  -- Scope references
  b.team_id,
  t.name AS team_name,
  b.project_id,
  p.name AS project_name,
  b.cost_center_id,
  cc.name AS cost_center_name,
  b.provider,
  b.model,
  -- Threshold status
  (
    SELECT json_agg(json_build_object(
      'percentage', bt.percentage,
      'triggered', bt.triggered_at IS NOT NULL,
      'triggered_at', bt.triggered_at
    ) ORDER BY bt.percentage)
    FROM budget_thresholds bt
    WHERE bt.budget_id = b.id
  ) AS thresholds
FROM budgets b
LEFT JOIN budget_periods bp ON bp.budget_id = b.id AND bp.status = 'active'
LEFT JOIN teams t ON b.team_id = t.id
LEFT JOIN projects p ON b.project_id = p.id
LEFT JOIN cost_centers cc ON b.cost_center_id = cc.id
WHERE b.status = 'active';

-- ============================================
-- BUDGET HIERARCHY VIEW
-- ============================================
CREATE OR REPLACE VIEW budget_hierarchy AS
WITH RECURSIVE budget_tree AS (
  -- Root budgets (organization level or no parent)
  SELECT 
    b.id,
    b.org_id,
    b.name,
    b.type,
    b.amount,
    NULL::UUID AS parent_id,
    1 AS depth,
    ARRAY[b.id] AS path,
    b.name::TEXT AS full_path
  FROM budgets b
  WHERE b.type = 'organization'
    AND b.status = 'active'
  
  UNION ALL
  
  -- Child budgets
  SELECT 
    b.id,
    b.org_id,
    b.name,
    b.type,
    ba.allocation_value AS amount,
    ba.parent_budget_id AS parent_id,
    bt.depth + 1,
    bt.path || b.id,
    bt.full_path || ' > ' || b.name
  FROM budgets b
  JOIN budget_allocations ba ON ba.child_budget_id = b.id
  JOIN budget_tree bt ON ba.parent_budget_id = bt.id
  WHERE b.status = 'active'
)
SELECT 
  bt.*,
  bp.spent_amount,
  bp.remaining_amount,
  bp.utilization_percentage
FROM budget_tree bt
LEFT JOIN budget_periods bp ON bp.budget_id = bt.id AND bp.status = 'active';

-- ============================================
-- BUDGET ALERTS VIEW (for alerting engine)
-- ============================================
CREATE OR REPLACE VIEW budget_alert_status AS
SELECT 
  b.id AS budget_id,
  b.org_id,
  b.name AS budget_name,
  b.type AS budget_type,
  bp.total_budget,
  bp.spent_amount,
  bp.utilization_percentage,
  bt.id AS threshold_id,
  bt.percentage AS threshold_percentage,
  bt.action AS threshold_action,
  CASE 
    WHEN bp.utilization_percentage >= bt.percentage THEN 'exceeded'
    WHEN bp.utilization_percentage >= (bt.percentage - 10) THEN 'approaching'
    ELSE 'ok'
  END AS threshold_status,
  bt.triggered_at,
  bt.acknowledged_at
FROM budgets b
JOIN budget_periods bp ON bp.budget_id = b.id AND bp.status = 'active'
JOIN budget_thresholds bt ON bt.budget_id = b.id AND bt.alert_enabled = true
WHERE b.status = 'active';
```

### 3.3 Functions

```sql
-- ============================================
-- GET CURRENT BUDGET PERIOD
-- ============================================
CREATE OR REPLACE FUNCTION get_current_budget_period(p_budget_id UUID)
RETURNS UUID AS $$
DECLARE
  v_period_id UUID;
  v_budget RECORD;
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  -- Get budget configuration
  SELECT * INTO v_budget FROM budgets WHERE id = p_budget_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Calculate current period dates
  CASE v_budget.period
    WHEN 'monthly' THEN
      v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
      v_period_end := (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::DATE;
    WHEN 'quarterly' THEN
      v_period_start := date_trunc('quarter', CURRENT_DATE)::DATE;
      v_period_end := (date_trunc('quarter', CURRENT_DATE) + interval '3 months' - interval '1 day')::DATE;
    WHEN 'annual' THEN
      v_period_start := date_trunc('year', CURRENT_DATE)::DATE;
      v_period_end := (date_trunc('year', CURRENT_DATE) + interval '1 year' - interval '1 day')::DATE;
    WHEN 'weekly' THEN
      v_period_start := date_trunc('week', CURRENT_DATE)::DATE;
      v_period_end := (date_trunc('week', CURRENT_DATE) + interval '7 days' - interval '1 day')::DATE;
    WHEN 'custom' THEN
      v_period_start := v_budget.period_start;
      v_period_end := v_budget.period_end;
  END CASE;
  
  -- Find or create period
  SELECT id INTO v_period_id 
  FROM budget_periods 
  WHERE budget_id = p_budget_id 
    AND period_start = v_period_start;
  
  IF NOT FOUND THEN
    -- Create new period
    INSERT INTO budget_periods (
      budget_id, 
      period_start, 
      period_end, 
      allocated_amount,
      rollover_amount
    )
    VALUES (
      p_budget_id,
      v_period_start,
      v_period_end,
      v_budget.amount,
      COALESCE(calculate_rollover(p_budget_id), 0)
    )
    RETURNING id INTO v_period_id;
  END IF;
  
  RETURN v_period_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CALCULATE ROLLOVER
-- ============================================
CREATE OR REPLACE FUNCTION calculate_rollover(p_budget_id UUID)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
  v_budget RECORD;
  v_prev_period RECORD;
  v_rollover DECIMAL(12, 2);
BEGIN
  SELECT * INTO v_budget FROM budgets WHERE id = p_budget_id;
  
  IF NOT v_budget.rollover_enabled THEN
    RETURN 0;
  END IF;
  
  -- Get previous period
  SELECT * INTO v_prev_period
  FROM budget_periods
  WHERE budget_id = p_budget_id
    AND status = 'completed'
  ORDER BY period_end DESC
  LIMIT 1;
  
  IF NOT FOUND OR v_prev_period.remaining_amount <= 0 THEN
    RETURN 0;
  END IF;
  
  -- Calculate rollover
  v_rollover := v_prev_period.remaining_amount * (v_budget.rollover_percentage / 100);
  
  -- Apply cap if set
  IF v_budget.rollover_cap IS NOT NULL THEN
    v_rollover := LEAST(v_rollover, v_budget.rollover_cap);
  END IF;
  
  RETURN v_rollover;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE BUDGET SPEND
-- ============================================
CREATE OR REPLACE FUNCTION update_budget_spend(
  p_budget_id UUID,
  p_amount DECIMAL(12, 4)
)
RETURNS VOID AS $$
DECLARE
  v_period_id UUID;
  v_new_total DECIMAL(12, 2);
BEGIN
  -- Get current period
  v_period_id := get_current_budget_period(p_budget_id);
  
  IF v_period_id IS NULL THEN
    RAISE EXCEPTION 'Could not find or create budget period for budget %', p_budget_id;
  END IF;
  
  -- Update spent amount
  UPDATE budget_periods
  SET 
    spent_amount = spent_amount + p_amount,
    last_calculated_at = now(),
    updated_at = now()
  WHERE id = v_period_id
  RETURNING spent_amount INTO v_new_total;
  
  -- Log consumption
  INSERT INTO budget_consumption (budget_period_id, amount, running_total)
  VALUES (v_period_id, p_amount, v_new_total);
  
  -- Check thresholds
  PERFORM check_budget_thresholds(v_period_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CHECK BUDGET THRESHOLDS
-- ============================================
CREATE OR REPLACE FUNCTION check_budget_thresholds(p_period_id UUID)
RETURNS VOID AS $$
DECLARE
  v_period RECORD;
  v_threshold RECORD;
BEGIN
  SELECT * INTO v_period FROM budget_periods WHERE id = p_period_id;
  
  FOR v_threshold IN 
    SELECT * FROM budget_thresholds 
    WHERE budget_id = v_period.budget_id 
      AND triggered_at IS NULL
    ORDER BY percentage ASC
  LOOP
    IF v_period.utilization_percentage >= v_threshold.percentage THEN
      -- Mark threshold as triggered
      UPDATE budget_thresholds
      SET triggered_at = now()
      WHERE id = v_threshold.id;
      
      -- Queue alert notification (handled by alerting engine)
      INSERT INTO alert_events (
        alert_id,
        event_type,
        value,
        threshold_value,
        message,
        metadata
      )
      SELECT 
        a.id,
        'budget_threshold',
        v_period.spent_amount,
        (v_period.total_budget * v_threshold.percentage / 100),
        format('Budget "%s" has reached %s%% utilization', b.name, v_threshold.percentage),
        jsonb_build_object(
          'budget_id', v_period.budget_id,
          'threshold_id', v_threshold.id,
          'utilization', v_period.utilization_percentage
        )
      FROM budgets b
      LEFT JOIN alerts a ON a.budget_id = b.id AND a.type = 'budget_threshold'
      WHERE b.id = v_period.budget_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CLOSE BUDGET PERIOD
-- ============================================
CREATE OR REPLACE FUNCTION close_budget_period(p_period_id UUID)
RETURNS VOID AS $$
DECLARE
  v_period RECORD;
BEGIN
  SELECT * INTO v_period FROM budget_periods WHERE id = p_period_id;
  
  -- Update status
  UPDATE budget_periods
  SET 
    status = CASE 
      WHEN spent_amount > total_budget THEN 'overspent'
      ELSE 'completed'
    END,
    updated_at = now()
  WHERE id = p_period_id;
  
  -- Reset thresholds for next period
  UPDATE budget_thresholds
  SET triggered_at = NULL, acknowledged_at = NULL, acknowledged_by = NULL
  WHERE budget_id = v_period.budget_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VALIDATE BUDGET ALLOCATION
-- ============================================
CREATE OR REPLACE FUNCTION validate_budget_allocation()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_amount DECIMAL(12, 2);
  v_total_allocated DECIMAL(12, 2);
BEGIN
  -- Get parent budget amount
  SELECT amount INTO v_parent_amount FROM budgets WHERE id = NEW.parent_budget_id;
  
  -- Calculate total allocated to children (excluding this allocation if update)
  SELECT COALESCE(SUM(
    CASE allocation_type 
      WHEN 'percentage' THEN v_parent_amount * allocation_value / 100
      ELSE allocation_value 
    END
  ), 0) INTO v_total_allocated
  FROM budget_allocations
  WHERE parent_budget_id = NEW.parent_budget_id
    AND (TG_OP = 'INSERT' OR child_budget_id != NEW.child_budget_id);
  
  -- Add new allocation
  IF NEW.allocation_type = 'percentage' THEN
    v_total_allocated := v_total_allocated + (v_parent_amount * NEW.allocation_value / 100);
  ELSE
    v_total_allocated := v_total_allocated + NEW.allocation_value;
  END IF;
  
  -- Check constraint
  IF v_total_allocated > v_parent_amount THEN
    RAISE EXCEPTION 'Total allocations (%) exceed parent budget (%)', v_total_allocated, v_parent_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_budget_allocation_trigger
  BEFORE INSERT OR UPDATE ON budget_allocations
  FOR EACH ROW
  EXECUTE FUNCTION validate_budget_allocation();
```

---

## 4. TypeScript Types & Interfaces

```typescript
// types/budget.ts

// ============================================
// ENUMS
// ============================================

export type BudgetType = 
  | 'organization' 
  | 'team' 
  | 'project' 
  | 'cost_center' 
  | 'provider' 
  | 'model' 
  | 'api_key' 
  | 'user';

export type BudgetPeriod = 
  | 'monthly' 
  | 'quarterly' 
  | 'annual' 
  | 'weekly' 
  | 'custom';

export type BudgetMode = 
  | 'soft'      // Alert only
  | 'hard'      // Block when exceeded
  | 'throttle'; // Rate limit when approaching

export type BudgetStatus = 
  | 'active' 
  | 'paused' 
  | 'archived';

export type PeriodStatus = 
  | 'active' 
  | 'completed' 
  | 'overspent';

export type ThresholdAction = 
  | 'alert' 
  | 'throttle' 
  | 'block';

export type AdjustmentType = 
  | 'increase' 
  | 'decrease' 
  | 'transfer_in' 
  | 'transfer_out';

export type AllocationType = 
  | 'fixed' 
  | 'percentage' 
  | 'dynamic';

// ============================================
// CORE INTERFACES
// ============================================

export interface Budget {
  id: string;
  orgId: string;
  
  // Identity
  name: string;
  description?: string;
  type: BudgetType;
  
  // Scope (only one set based on type)
  teamId?: string;
  projectId?: string;
  costCenterId?: string;
  provider?: string;
  model?: string;
  apiKeyId?: string;
  userId?: string;
  
  // Amount
  amount: number;
  currency: string;
  
  // Period
  period: BudgetPeriod;
  periodStart?: string;  // ISO date
  periodEnd?: string;    // ISO date
  
  // Behavior
  mode: BudgetMode;
  throttlePercentage?: number;
  
  // Rollover
  rolloverEnabled: boolean;
  rolloverPercentage: number;
  rolloverCap?: number;
  
  // Status
  status: BudgetStatus;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
  
  // Audit
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetThreshold {
  id: string;
  budgetId: string;
  percentage: number;
  alertEnabled: boolean;
  alertChannels?: AlertChannel[];
  action: ThresholdAction;
  triggeredAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface BudgetPeriodData {
  id: string;
  budgetId: string;
  periodStart: string;
  periodEnd: string;
  allocatedAmount: number;
  rolloverAmount: number;
  adjustedAmount: number;
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  forecastedSpend?: number;
  forecastedEndDate?: string;
  daysUntilExhaustion?: number;
  status: PeriodStatus;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAllocation {
  id: string;
  parentBudgetId: string;
  childBudgetId: string;
  allocationType: AllocationType;
  allocationValue: number;
  minAmount?: number;
  maxAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAdjustment {
  id: string;
  budgetId: string;
  budgetPeriodId?: string;
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
  relatedBudgetId?: string;
  requiresApproval: boolean;
  approvedAt?: string;
  approvedBy?: string;
  createdBy: string;
  createdAt: string;
}

// ============================================
// EXTENDED INTERFACES
// ============================================

export interface BudgetWithPeriod extends Budget {
  currentPeriod?: BudgetPeriodData;
  thresholds: BudgetThreshold[];
}

export interface BudgetSummary {
  id: string;
  orgId: string;
  name: string;
  type: BudgetType;
  baseAmount: number;
  period: BudgetPeriod;
  mode: BudgetMode;
  status: BudgetStatus;
  periodStart?: string;
  periodEnd?: string;
  totalBudget?: number;
  spentAmount?: number;
  remainingAmount?: number;
  utilizationPercentage?: number;
  forecastedSpend?: number;
  forecastedEndDate?: string;
  daysUntilExhaustion?: number;
  // Scope names
  teamId?: string;
  teamName?: string;
  projectId?: string;
  projectName?: string;
  costCenterId?: string;
  costCenterName?: string;
  provider?: string;
  model?: string;
  // Thresholds
  thresholds: Array<{
    percentage: number;
    triggered: boolean;
    triggeredAt?: string;
  }>;
}

export interface BudgetHierarchyNode {
  id: string;
  orgId: string;
  name: string;
  type: BudgetType;
  amount: number;
  parentId?: string;
  depth: number;
  path: string[];
  fullPath: string;
  spentAmount?: number;
  remainingAmount?: number;
  utilizationPercentage?: number;
  children?: BudgetHierarchyNode[];
}

export interface BudgetAlertStatus {
  budgetId: string;
  orgId: string;
  budgetName: string;
  budgetType: BudgetType;
  totalBudget: number;
  spentAmount: number;
  utilizationPercentage: number;
  thresholdId: string;
  thresholdPercentage: number;
  thresholdAction: ThresholdAction;
  thresholdStatus: 'ok' | 'approaching' | 'exceeded';
  triggeredAt?: string;
  acknowledgedAt?: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateBudgetInput {
  name: string;
  description?: string;
  type: BudgetType;
  teamId?: string;
  projectId?: string;
  costCenterId?: string;
  provider?: string;
  model?: string;
  apiKeyId?: string;
  userId?: string;
  amount: number;
  currency?: string;
  period: BudgetPeriod;
  periodStart?: string;
  periodEnd?: string;
  mode?: BudgetMode;
  throttlePercentage?: number;
  rolloverEnabled?: boolean;
  rolloverPercentage?: number;
  rolloverCap?: number;
  thresholds?: Array<{
    percentage: number;
    action?: ThresholdAction;
    alertEnabled?: boolean;
  }>;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateBudgetInput {
  name?: string;
  description?: string;
  amount?: number;
  mode?: BudgetMode;
  throttlePercentage?: number;
  rolloverEnabled?: boolean;
  rolloverPercentage?: number;
  rolloverCap?: number;
  status?: BudgetStatus;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreateThresholdInput {
  percentage: number;
  action?: ThresholdAction;
  alertEnabled?: boolean;
  alertChannels?: AlertChannel[];
}

export interface CreateAdjustmentInput {
  adjustmentType: AdjustmentType;
  amount: number;
  reason: string;
  relatedBudgetId?: string;
}

export interface AllocateBudgetInput {
  childBudgetId: string;
  allocationType: AllocationType;
  allocationValue: number;
  minAmount?: number;
  maxAmount?: number;
}

// ============================================
// QUERY TYPES
// ============================================

export interface BudgetFilters {
  type?: BudgetType | BudgetType[];
  status?: BudgetStatus | BudgetStatus[];
  teamId?: string;
  projectId?: string;
  costCenterId?: string;
  provider?: string;
  minUtilization?: number;
  maxUtilization?: number;
  exceededOnly?: boolean;
}

export interface BudgetQueryOptions {
  filters?: BudgetFilters;
  includeThresholds?: boolean;
  includeCurrentPeriod?: boolean;
  includeAllocations?: boolean;
  sortBy?: 'name' | 'utilization' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface BudgetsResponse {
  budgets: BudgetSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface BudgetStatsResponse {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallUtilization: number;
  budgetCount: number;
  exceededCount: number;
  approachingCount: number;
  byType: Record<BudgetType, {
    count: number;
    totalBudget: number;
    totalSpent: number;
  }>;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'pagerduty' | 'webhook';
  config: Record<string, any>;
}
```

---

## 5. Budget Calculation Engine

```typescript
// services/budget-calculation-engine.ts

import { createClient } from '@supabase/supabase-js';
import type { 
  Budget, 
  BudgetPeriodData, 
  BudgetSummary,
  BudgetHierarchyNode 
} from '@/types/budget';

interface SpendByDimension {
  dimension: string;
  value: string;
  spend: number;
}

export class BudgetCalculationEngine {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  // ============================================
  // SPEND CALCULATION
  // ============================================
  
  /**
   * Calculate total spend for a budget in the current period
   */
  async calculateBudgetSpend(
    budgetId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    const { data: budget } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();
    
    if (!budget) throw new Error('Budget not found');
    
    // Build query based on budget type
    let query = this.supabase
      .from('usage_records')
      .select('cost')
      .eq('org_id', budget.org_id)
      .gte('timestamp', periodStart.toISOString())
      .lte('timestamp', periodEnd.toISOString());
    
    // Apply scope filters
    switch (budget.type) {
      case 'team':
        query = query.eq("dimensions->>'teamId'", budget.team_id);
        break;
      case 'project':
        query = query.eq("dimensions->>'projectId'", budget.project_id);
        break;
      case 'cost_center':
        query = query.eq("dimensions->>'costCenterId'", budget.cost_center_id);
        break;
      case 'provider':
        query = query.eq('provider', budget.provider);
        break;
      case 'model':
        query = query.eq('model', budget.model);
        break;
      case 'api_key':
        query = query.eq("dimensions->>'apiKeyId'", budget.api_key_id);
        break;
      case 'user':
        query = query.eq("dimensions->>'userId'", budget.user_id);
        break;
      // 'organization' type has no additional filters
    }
    
    const { data: records, error } = await query;
    
    if (error) throw error;
    
    return records?.reduce((sum, r) => sum + (r.cost || 0), 0) || 0;
  }
  
  /**
   * Calculate spend breakdown for a budget
   */
  async calculateSpendBreakdown(
    budgetId: string,
    periodStart: Date,
    periodEnd: Date,
    groupBy: 'provider' | 'model' | 'team' | 'project' | 'day'
  ): Promise<SpendByDimension[]> {
    const { data: budget } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();
    
    if (!budget) throw new Error('Budget not found');
    
    // Use aggregated daily rollup for performance
    const { data, error } = await this.supabase.rpc('get_budget_spend_breakdown', {
      p_budget_id: budgetId,
      p_period_start: periodStart.toISOString(),
      p_period_end: periodEnd.toISOString(),
      p_group_by: groupBy
    });
    
    if (error) throw error;
    
    return data || [];
  }
  
  // ============================================
  // BUDGET PERIOD MANAGEMENT
  // ============================================
  
  /**
   * Get or create current budget period
   */
  async getCurrentPeriod(budgetId: string): Promise<BudgetPeriodData> {
    const { data, error } = await this.supabase.rpc('get_current_budget_period', {
      p_budget_id: budgetId
    });
    
    if (error) throw error;
    
    const { data: period } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('id', data)
      .single();
    
    return period;
  }
  
  /**
   * Update budget period with latest spend
   */
  async updatePeriodSpend(periodId: string): Promise<BudgetPeriodData> {
    const { data: period } = await this.supabase
      .from('budget_periods')
      .select('*, budgets(*)')
      .eq('id', periodId)
      .single();
    
    if (!period) throw new Error('Period not found');
    
    const spend = await this.calculateBudgetSpend(
      period.budget_id,
      new Date(period.period_start),
      new Date(period.period_end)
    );
    
    const { data: updated, error } = await this.supabase
      .from('budget_periods')
      .update({
        spent_amount: spend,
        last_calculated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', periodId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Check thresholds after update
    await this.checkThresholds(periodId);
    
    return updated;
  }
  
  /**
   * Recalculate all active budgets for an organization
   */
  async recalculateOrgBudgets(orgId: string): Promise<void> {
    const { data: budgets } = await this.supabase
      .from('budgets')
      .select('id')
      .eq('org_id', orgId)
      .eq('status', 'active');
    
    if (!budgets) return;
    
    for (const budget of budgets) {
      const period = await this.getCurrentPeriod(budget.id);
      await this.updatePeriodSpend(period.id);
    }
  }
  
  // ============================================
  // THRESHOLD CHECKING
  // ============================================
  
  /**
   * Check all thresholds for a budget period
   */
  async checkThresholds(periodId: string): Promise<void> {
    const { data: period } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('id', periodId)
      .single();
    
    if (!period) return;
    
    const { data: thresholds } = await this.supabase
      .from('budget_thresholds')
      .select('*')
      .eq('budget_id', period.budget_id)
      .is('triggered_at', null)
      .order('percentage', { ascending: true });
    
    if (!thresholds) return;
    
    for (const threshold of thresholds) {
      if (period.utilization_percentage >= threshold.percentage) {
        // Mark as triggered
        await this.supabase
          .from('budget_thresholds')
          .update({ triggered_at: new Date().toISOString() })
          .eq('id', threshold.id);
        
        // Execute action
        await this.executeThresholdAction(period, threshold);
      }
    }
  }
  
  /**
   * Execute threshold action (alert, throttle, or block)
   */
  private async executeThresholdAction(
    period: BudgetPeriodData,
    threshold: { id: string; percentage: number; action: string }
  ): Promise<void> {
    const { data: budget } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', period.budgetId)
      .single();
    
    switch (threshold.action) {
      case 'alert':
        // Create alert event (handled by alerting engine)
        await this.supabase.from('alert_events').insert({
          org_id: budget.org_id,
          type: 'budget_threshold',
          severity: threshold.percentage >= 100 ? 'critical' : 'warning',
          title: `Budget "${budget.name}" reached ${threshold.percentage}%`,
          message: `Budget utilization is at ${period.utilizationPercentage.toFixed(1)}%. ` +
                   `Spent: $${period.spentAmount.toFixed(2)} of $${period.totalBudget.toFixed(2)}`,
          metadata: {
            budgetId: budget.id,
            thresholdId: threshold.id,
            utilization: period.utilizationPercentage
          }
        });
        break;
        
      case 'throttle':
        // Update budget mode to throttle
        await this.supabase
          .from('budgets')
          .update({ 
            mode: 'throttle',
            throttle_percentage: Math.max(0, 100 - period.utilizationPercentage)
          })
          .eq('id', budget.id);
        break;
        
      case 'block':
        // Update budget mode to hard block
        await this.supabase
          .from('budgets')
          .update({ mode: 'hard' })
          .eq('id', budget.id);
        break;
    }
  }
  
  // ============================================
  // HIERARCHY CALCULATIONS
  // ============================================
  
  /**
   * Build budget hierarchy tree
   */
  async getBudgetHierarchy(orgId: string): Promise<BudgetHierarchyNode[]> {
    const { data, error } = await this.supabase
      .from('budget_hierarchy')
      .select('*')
      .eq('org_id', orgId)
      .order('depth', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Build tree structure
    const nodeMap = new Map<string, BudgetHierarchyNode>();
    const roots: BudgetHierarchyNode[] = [];
    
    for (const row of data || []) {
      const node: BudgetHierarchyNode = {
        id: row.id,
        orgId: row.org_id,
        name: row.name,
        type: row.type,
        amount: row.amount,
        parentId: row.parent_id,
        depth: row.depth,
        path: row.path,
        fullPath: row.full_path,
        spentAmount: row.spent_amount,
        remainingAmount: row.remaining_amount,
        utilizationPercentage: row.utilization_percentage,
        children: []
      };
      
      nodeMap.set(node.id, node);
      
      if (!node.parentId) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        }
      }
    }
    
    return roots;
  }
  
  /**
   * Validate allocation doesn't exceed parent
   */
  async validateAllocation(
    parentBudgetId: string,
    childBudgetId: string,
    amount: number
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
    
    const totalAllocated = allocations?.reduce((sum, a) => {
      if (a.allocation_type === 'percentage') {
        return sum + (parent.amount * a.allocation_value / 100);
      }
      return sum + a.allocation_value;
    }, 0) || 0;
    
    const availableAmount = parent.amount - totalAllocated;
    
    if (amount > availableAmount) {
      return {
        valid: false,
        message: `Requested amount ($${amount}) exceeds available ($${availableAmount.toFixed(2)})`,
        availableAmount
      };
    }
    
    return { valid: true, availableAmount };
  }
  
  // ============================================
  // STATISTICS
  // ============================================
  
  /**
   * Get organization budget statistics
   */
  async getOrgBudgetStats(orgId: string): Promise<{
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    overallUtilization: number;
    budgetCount: number;
    exceededCount: number;
    approachingCount: number;
    byType: Record<string, { count: number; totalBudget: number; totalSpent: number }>;
  }> {
    const { data: summaries } = await this.supabase
      .from('budget_summary')
      .select('*')
      .eq('org_id', orgId);
    
    if (!summaries || summaries.length === 0) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        overallUtilization: 0,
        budgetCount: 0,
        exceededCount: 0,
        approachingCount: 0,
        byType: {}
      };
    }
    
    const stats = {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overallUtilization: 0,
      budgetCount: summaries.length,
      exceededCount: 0,
      approachingCount: 0,
      byType: {} as Record<string, { count: number; totalBudget: number; totalSpent: number }>
    };
    
    for (const budget of summaries) {
      stats.totalBudget += budget.total_budget || 0;
      stats.totalSpent += budget.spent_amount || 0;
      
      if (budget.utilization_percentage >= 100) {
        stats.exceededCount++;
      } else if (budget.utilization_percentage >= 80) {
        stats.approachingCount++;
      }
      
      // By type
      if (!stats.byType[budget.type]) {
        stats.byType[budget.type] = { count: 0, totalBudget: 0, totalSpent: 0 };
      }
      stats.byType[budget.type].count++;
      stats.byType[budget.type].totalBudget += budget.total_budget || 0;
      stats.byType[budget.type].totalSpent += budget.spent_amount || 0;
    }
    
    stats.totalRemaining = stats.totalBudget - stats.totalSpent;
    stats.overallUtilization = stats.totalBudget > 0 
      ? (stats.totalSpent / stats.totalBudget) * 100 
      : 0;
    
    return stats;
  }
}

export const budgetCalculationEngine = new BudgetCalculationEngine();
```

---

## 6. Budget Allocation Workflows

```typescript
// services/budget-allocation.ts

import { createClient } from '@supabase/supabase-js';
import type { 
  Budget, 
  BudgetAllocation, 
  AllocateBudgetInput,
  BudgetHierarchyNode
} from '@/types/budget';
import { budgetCalculationEngine } from './budget-calculation-engine';

interface AllocationResult {
  success: boolean;
  allocation?: BudgetAllocation;
  error?: string;
}

interface ReallocationPlan {
  from: { budgetId: string; name: string; currentAmount: number };
  to: { budgetId: string; name: string; currentAmount: number };
  amount: number;
  reason: string;
}

export class BudgetAllocationService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  // ============================================
  // ALLOCATION MANAGEMENT
  // ============================================
  
  /**
   * Allocate budget from parent to child
   */
  async allocate(
    parentBudgetId: string,
    input: AllocateBudgetInput
  ): Promise<AllocationResult> {
    // Validate allocation
    const validation = await budgetCalculationEngine.validateAllocation(
      parentBudgetId,
      input.childBudgetId,
      input.allocationType === 'percentage'
        ? await this.calculatePercentageAmount(parentBudgetId, input.allocationValue)
        : input.allocationValue
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
        error: 'Circular allocation detected. Child budget cannot be an ancestor of parent.' 
      };
    }
    
    // Create allocation
    const { data, error } = await this.supabase
      .from('budget_allocations')
      .upsert({
        parent_budget_id: parentBudgetId,
        child_budget_id: input.childBudgetId,
        allocation_type: input.allocationType,
        allocation_value: input.allocationValue,
        min_amount: input.minAmount,
        max_amount: input.maxAmount,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'parent_budget_id,child_budget_id'
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Update child budget amount if fixed allocation
    if (input.allocationType === 'fixed') {
      await this.supabase
        .from('budgets')
        .update({ amount: input.allocationValue })
        .eq('id', input.childBudgetId);
    }
    
    return { success: true, allocation: data };
  }
  
  /**
   * Remove allocation
   */
  async deallocate(parentBudgetId: string, childBudgetId: string): Promise<void> {
    await this.supabase
      .from('budget_allocations')
      .delete()
      .eq('parent_budget_id', parentBudgetId)
      .eq('child_budget_id', childBudgetId);
  }
  
  /**
   * Transfer budget between siblings
   */
  async transfer(
    fromBudgetId: string,
    toBudgetId: string,
    amount: number,
    reason: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
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
        error: 'Budgets must share the same parent for direct transfer' 
      };
    }
    
    // Get from budget and check available amount
    const { data: fromBudget } = await this.supabase
      .from('budget_summary')
      .select('*')
      .eq('id', fromBudgetId)
      .single();
    
    if (!fromBudget || (fromBudget.remaining_amount || 0) < amount) {
      return { 
        success: false, 
        error: `Insufficient remaining budget. Available: $${fromBudget?.remaining_amount?.toFixed(2) || 0}` 
      };
    }
    
    // Execute transfer in transaction
    const { error } = await this.supabase.rpc('transfer_budget', {
      p_from_budget_id: fromBudgetId,
      p_to_budget_id: toBudgetId,
      p_amount: amount,
      p_reason: reason,
      p_user_id: userId
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  }
  
  // ============================================
  // SMART ALLOCATION
  // ============================================
  
  /**
   * Suggest optimal budget distribution based on historical usage
   */
  async suggestAllocation(
    parentBudgetId: string,
    childBudgetIds: string[]
  ): Promise<Array<{ budgetId: string; suggestedAmount: number; reason: string }>> {
    const { data: parent } = await this.supabase
      .from('budgets')
      .select('amount, org_id')
      .eq('id', parentBudgetId)
      .single();
    
    if (!parent) return [];
    
    // Get historical spend for each child
    const suggestions: Array<{ budgetId: string; suggestedAmount: number; reason: string }> = [];
    const historicalSpends: Array<{ id: string; spend: number }> = [];
    
    for (const childId of childBudgetIds) {
      const { data: child } = await this.supabase
        .from('budgets')
        .select('*')
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
      
      const avgSpend = periods && periods.length > 0
        ? periods.reduce((sum, p) => sum + (p.spent_amount || 0), 0) / periods.length
        : 0;
      
      historicalSpends.push({ id: childId, spend: avgSpend });
    }
    
    // Calculate proportional allocation
    const totalHistoricalSpend = historicalSpends.reduce((sum, h) => sum + h.spend, 0);
    
    if (totalHistoricalSpend === 0) {
      // Equal distribution if no history
      const equalAmount = parent.amount / childBudgetIds.length;
      return childBudgetIds.map(id => ({
        budgetId: id,
        suggestedAmount: Math.round(equalAmount * 100) / 100,
        reason: 'Equal distribution (no historical data)'
      }));
    }
    
    // Proportional with 10% buffer
    const availableBudget = parent.amount * 0.9; // Keep 10% reserve
    
    for (const { id, spend } of historicalSpends) {
      const proportion = spend / totalHistoricalSpend;
      const suggested = Math.round(availableBudget * proportion * 100) / 100;
      
      suggestions.push({
        budgetId: id,
        suggestedAmount: suggested,
        reason: `Based on ${(proportion * 100).toFixed(1)}% of historical spend`
      });
    }
    
    return suggestions;
  }
  
  /**
   * Generate reallocation recommendations based on utilization
   */
  async generateReallocationPlan(orgId: string): Promise<ReallocationPlan[]> {
    const { data: summaries } = await this.supabase
      .from('budget_summary')
      .select('*')
      .eq('org_id', orgId)
      .not('type', 'eq', 'organization'); // Exclude org-level
    
    if (!summaries || summaries.length < 2) return [];
    
    const plans: ReallocationPlan[] = [];
    
    // Find over-budget and under-budget items
    const overBudget = summaries.filter(s => (s.utilization_percentage || 0) > 90);
    const underBudget = summaries.filter(s => (s.utilization_percentage || 0) < 50);
    
    // Match over-budget with under-budget of same parent
    for (const over of overBudget) {
      const { data: overAlloc } = await this.supabase
        .from('budget_allocations')
        .select('parent_budget_id')
        .eq('child_budget_id', over.id)
        .single();
      
      if (!overAlloc) continue;
      
      for (const under of underBudget) {
        const { data: underAlloc } = await this.supabase
          .from('budget_allocations')
          .select('parent_budget_id')
          .eq('child_budget_id', under.id)
          .single();
        
        if (underAlloc?.parent_budget_id !== overAlloc.parent_budget_id) continue;
        
        // Calculate suggested transfer
        const overNeeds = (over.forecasted_spend || over.spent_amount || 0) - (over.total_budget || 0);
        const underSurplus = (under.remaining_amount || 0) * 0.5; // Take 50% of surplus
        
        if (overNeeds > 0 && underSurplus > 0) {
          const transferAmount = Math.min(overNeeds, underSurplus);
          
          plans.push({
            from: {
              budgetId: under.id,
              name: under.name,
              currentAmount: under.total_budget || 0
            },
            to: {
              budgetId: over.id,
              name: over.name,
              currentAmount: over.total_budget || 0
            },
            amount: Math.round(transferAmount * 100) / 100,
            reason: `${over.name} is at ${over.utilization_percentage?.toFixed(0)}% utilization while ${under.name} is at ${under.utilization_percentage?.toFixed(0)}%`
          });
        }
      }
    }
    
    return plans;
  }
  
  // ============================================
  // HELPERS
  // ============================================
  
  private async calculatePercentageAmount(
    parentBudgetId: string, 
    percentage: number
  ): Promise<number> {
    const { data: parent } = await this.supabase
      .from('budgets')
      .select('amount')
      .eq('id', parentBudgetId)
      .single();
    
    return parent ? (parent.amount * percentage / 100) : 0;
  }
  
  private async checkCircularReference(
    parentId: string, 
    childId: string
  ): Promise<boolean> {
    // Check if childId is an ancestor of parentId
    const { data } = await this.supabase
      .from('budget_hierarchy')
      .select('path')
      .eq('id', parentId)
      .single();
    
    return data?.path?.includes(childId) || false;
  }
}

export const budgetAllocationService = new BudgetAllocationService();
```

---

## 7. Threshold & Alert Integration

```typescript
// services/budget-alert-integration.ts

import { createClient } from '@supabase/supabase-js';
import type { BudgetThreshold, BudgetAlertStatus } from '@/types/budget';

interface ThresholdEvent {
  budgetId: string;
  thresholdId: string;
  percentage: number;
  currentUtilization: number;
  action: 'alert' | 'throttle' | 'block';
}

export class BudgetAlertIntegration {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  // ============================================
  // THRESHOLD MANAGEMENT
  // ============================================
  
  /**
   * Create default thresholds for a new budget
   */
  async createDefaultThresholds(budgetId: string): Promise<BudgetThreshold[]> {
    const defaultThresholds = [
      { percentage: 50, action: 'alert', alertEnabled: true },
      { percentage: 80, action: 'alert', alertEnabled: true },
      { percentage: 90, action: 'alert', alertEnabled: true },
      { percentage: 100, action: 'alert', alertEnabled: true },
      { percentage: 120, action: 'block', alertEnabled: true }
    ];
    
    const { data, error } = await this.supabase
      .from('budget_thresholds')
      .insert(defaultThresholds.map(t => ({
        budget_id: budgetId,
        percentage: t.percentage,
        action: t.action,
        alert_enabled: t.alertEnabled
      })))
      .select();
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Add custom threshold
   */
  async addThreshold(
    budgetId: string,
    percentage: number,
    action: 'alert' | 'throttle' | 'block' = 'alert',
    alertChannels?: any[]
  ): Promise<BudgetThreshold> {
    const { data, error } = await this.supabase
      .from('budget_thresholds')
      .insert({
        budget_id: budgetId,
        percentage,
        action,
        alert_enabled: true,
        alert_channels: alertChannels
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  /**
   * Remove threshold
   */
  async removeThreshold(thresholdId: string): Promise<void> {
    await this.supabase
      .from('budget_thresholds')
      .delete()
      .eq('id', thresholdId);
  }
  
  /**
   * Acknowledge triggered threshold
   */
  async acknowledgeThreshold(thresholdId: string, userId: string): Promise<void> {
    await this.supabase
      .from('budget_thresholds')
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId
      })
      .eq('id', thresholdId);
  }
  
  // ============================================
  // ALERT CREATION
  // ============================================
  
  /**
   * Create alert from threshold event
   */
  async createThresholdAlert(event: ThresholdEvent): Promise<void> {
    const { data: budget } = await this.supabase
      .from('budgets')
      .select('*, budget_thresholds(*)')
      .eq('id', event.budgetId)
      .single();
    
    if (!budget) return;
    
    const threshold = budget.budget_thresholds?.find(
      (t: any) => t.id === event.thresholdId
    );
    
    // Determine severity
    let severity = 'info';
    if (event.percentage >= 100) severity = 'critical';
    else if (event.percentage >= 90) severity = 'warning';
    
    // Create alert event
    await this.supabase.from('alert_events').insert({
      org_id: budget.org_id,
      type: 'budget_threshold',
      severity,
      title: `Budget "${budget.name}" reached ${event.percentage}%`,
      message: this.formatAlertMessage(budget, event),
      metadata: {
        budgetId: event.budgetId,
        thresholdId: event.thresholdId,
        thresholdPercentage: event.percentage,
        currentUtilization: event.currentUtilization,
        action: event.action
      },
      channels: threshold?.alert_channels || budget.metadata?.alert_channels
    });
  }
  
  /**
   * Create forecast alert
   */
  async createForecastAlert(
    budgetId: string,
    forecastedOverageDate: Date,
    forecastedAmount: number
  ): Promise<void> {
    const { data: budget } = await this.supabase
      .from('budget_summary')
      .select('*')
      .eq('id', budgetId)
      .single();
    
    if (!budget) return;
    
    const daysUntil = Math.ceil(
      (forecastedOverageDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    await this.supabase.from('alert_events').insert({
      org_id: budget.org_id,
      type: 'budget_forecast',
      severity: daysUntil <= 7 ? 'critical' : 'warning',
      title: `Budget "${budget.name}" projected to exceed limit`,
      message: `At current rate, budget will be exhausted in ${daysUntil} days ` +
               `(${forecastedOverageDate.toLocaleDateString()}). ` +
               `Projected spend: $${forecastedAmount.toFixed(2)} vs budget: $${budget.total_budget?.toFixed(2)}`,
      metadata: {
        budgetId,
        forecastedDate: forecastedOverageDate.toISOString(),
        forecastedAmount,
        daysUntil
      }
    });
  }
  
  // ============================================
  // ALERT STATUS
  // ============================================
  
  /**
   * Get all budget alert statuses for an org
   */
  async getBudgetAlertStatuses(orgId: string): Promise<BudgetAlertStatus[]> {
    const { data, error } = await this.supabase
      .from('budget_alert_status')
      .select('*')
      .eq('org_id', orgId);
    
    if (error) throw error;
    return data || [];
  }
  
  /**
   * Get budgets approaching or exceeding thresholds
   */
  async getAtRiskBudgets(orgId: string): Promise<{
    exceeded: BudgetAlertStatus[];
    approaching: BudgetAlertStatus[];
  }> {
    const statuses = await this.getBudgetAlertStatuses(orgId);
    
    return {
      exceeded: statuses.filter(s => s.thresholdStatus === 'exceeded'),
      approaching: statuses.filter(s => s.thresholdStatus === 'approaching')
    };
  }
  
  // ============================================
  // HELPERS
  // ============================================
  
  private formatAlertMessage(budget: any, event: ThresholdEvent): string {
    const lines = [
      `Budget "${budget.name}" has reached ${event.currentUtilization.toFixed(1)}% utilization.`,
      '',
      `Threshold: ${event.percentage}%`,
      `Action: ${event.action}`,
      '',
      `Current Status:`,
      `- Total Budget: $${budget.amount?.toFixed(2)}`,
    ];
    
    // Add scope info
    if (budget.team_id) lines.push(`- Team: ${budget.team_name || budget.team_id}`);
    if (budget.project_id) lines.push(`- Project: ${budget.project_name || budget.project_id}`);
    if (budget.provider) lines.push(`- Provider: ${budget.provider}`);
    if (budget.model) lines.push(`- Model: ${budget.model}`);
    
    return lines.join('\n');
  }
}

export const budgetAlertIntegration = new BudgetAlertIntegration();
```

---

## 8. Forecasting Integration

```typescript
// services/budget-forecasting.ts

import { createClient } from '@supabase/supabase-js';

interface ForecastResult {
  budgetId: string;
  forecastedSpend: number;
  forecastedEndDate: Date | null;
  daysUntilExhaustion: number | null;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  dailyRate: number;
}

export class BudgetForecastingService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  /**
   * Forecast budget consumption
   */
  async forecastBudget(budgetId: string): Promise<ForecastResult> {
    const { data: period } = await this.supabase
      .from('budget_periods')
      .select('*, budgets(*)')
      .eq('budget_id', budgetId)
      .eq('status', 'active')
      .single();
    
    if (!period) {
      throw new Error('No active period for budget');
    }
    
    // Get daily spend history
    const { data: dailySpend } = await this.supabase.rpc('get_daily_budget_spend', {
      p_budget_id: budgetId,
      p_period_start: period.period_start,
      p_period_end: period.period_end
    });
    
    if (!dailySpend || dailySpend.length === 0) {
      return {
        budgetId,
        forecastedSpend: period.spent_amount || 0,
        forecastedEndDate: null,
        daysUntilExhaustion: null,
        confidence: 0,
        trend: 'stable',
        dailyRate: 0
      };
    }
    
    // Calculate daily rate using weighted moving average
    const recentDays = dailySpend.slice(-7);
    const weights = [0.05, 0.05, 0.1, 0.1, 0.15, 0.25, 0.3]; // More weight to recent days
    
    let weightedSum = 0;
    let weightSum = 0;
    
    recentDays.forEach((day: any, i: number) => {
      const weight = weights[Math.min(i, weights.length - 1)];
      weightedSum += day.spend * weight;
      weightSum += weight;
    });
    
    const dailyRate = weightSum > 0 ? weightedSum / weightSum : 0;
    
    // Calculate remaining days in period
    const periodEnd = new Date(period.period_end);
    const today = new Date();
    const remainingDays = Math.max(0, Math.ceil(
      (periodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    ));
    
    // Forecast total spend
    const forecastedSpend = (period.spent_amount || 0) + (dailyRate * remainingDays);
    
    // Calculate exhaustion date
    const remainingBudget = (period.total_budget || 0) - (period.spent_amount || 0);
    let forecastedEndDate: Date | null = null;
    let daysUntilExhaustion: number | null = null;
    
    if (dailyRate > 0 && remainingBudget > 0) {
      daysUntilExhaustion = Math.ceil(remainingBudget / dailyRate);
      forecastedEndDate = new Date(today.getTime() + daysUntilExhaustion * 24 * 60 * 60 * 1000);
    }
    
    // Determine trend
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (dailySpend.length >= 7) {
      const firstHalf = dailySpend.slice(0, Math.floor(dailySpend.length / 2));
      const secondHalf = dailySpend.slice(Math.floor(dailySpend.length / 2));
      
      const firstAvg = firstHalf.reduce((sum: number, d: any) => sum + d.spend, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum: number, d: any) => sum + d.spend, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.1) trend = 'increasing';
      else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';
    }
    
    // Calculate confidence based on data consistency
    const variance = this.calculateVariance(dailySpend.map((d: any) => d.spend));
    const mean = dailySpend.reduce((sum: number, d: any) => sum + d.spend, 0) / dailySpend.length;
    const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1;
    const confidence = Math.max(0, Math.min(1, 1 - coefficientOfVariation));
    
    // Update period with forecast
    await this.supabase
      .from('budget_periods')
      .update({
        forecasted_spend: forecastedSpend,
        forecasted_end_date: forecastedEndDate?.toISOString().split('T')[0],
        days_until_exhaustion: daysUntilExhaustion,
        updated_at: new Date().toISOString()
      })
      .eq('id', period.id);
    
    return {
      budgetId,
      forecastedSpend,
      forecastedEndDate,
      daysUntilExhaustion,
      confidence,
      trend,
      dailyRate
    };
  }
  
  /**
   * Forecast all budgets for an organization
   */
  async forecastOrgBudgets(orgId: string): Promise<ForecastResult[]> {
    const { data: budgets } = await this.supabase
      .from('budgets')
      .select('id')
      .eq('org_id', orgId)
      .eq('status', 'active');
    
    if (!budgets) return [];
    
    const results: ForecastResult[] = [];
    
    for (const budget of budgets) {
      try {
        const forecast = await this.forecastBudget(budget.id);
        results.push(forecast);
      } catch (error) {
        console.error(`Failed to forecast budget ${budget.id}:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * Get budgets that will exceed their limit before period end
   */
  async getBudgetsAtRisk(orgId: string): Promise<ForecastResult[]> {
    const forecasts = await this.forecastOrgBudgets(orgId);
    
    return forecasts.filter(f => {
      if (f.forecastedEndDate === null) return false;
      
      // Get period end for comparison
      return f.daysUntilExhaustion !== null && f.daysUntilExhaustion < 30;
    }).sort((a, b) => (a.daysUntilExhaustion || 999) - (b.daysUntilExhaustion || 999));
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }
}

export const budgetForecastingService = new BudgetForecastingService();
```

---

## 9. Hard Limits & Enforcement

```typescript
// services/budget-enforcement.ts

import { createClient } from '@supabase/supabase-js';

interface EnforcementCheck {
  allowed: boolean;
  reason?: string;
  budgetId?: string;
  remainingBudget?: number;
  throttlePercentage?: number;
}

export class BudgetEnforcementService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  /**
   * Check if a request should be allowed based on budget constraints
   * Called by SDK/proxy before making AI API calls
   */
  async checkRequestAllowed(
    orgId: string,
    dimensions: {
      teamId?: string;
      projectId?: string;
      costCenterId?: string;
      provider?: string;
      model?: string;
      apiKeyId?: string;
      userId?: string;
    },
    estimatedCost: number
  ): Promise<EnforcementCheck> {
    // Get all applicable budgets (most specific to least specific)
    const applicableBudgets = await this.getApplicableBudgets(orgId, dimensions);
    
    for (const budget of applicableBudgets) {
      if (budget.mode === 'soft') continue; // Soft budgets don't enforce
      
      const utilization = budget.utilization_percentage || 0;
      const remaining = budget.remaining_amount || 0;
      
      // Hard limit check
      if (budget.mode === 'hard' && remaining < estimatedCost) {
        return {
          allowed: false,
          reason: `Budget "${budget.name}" exceeded. Remaining: $${remaining.toFixed(2)}`,
          budgetId: budget.id,
          remainingBudget: remaining
        };
      }
      
      // Throttle check
      if (budget.mode === 'throttle') {
        const throttleAt = budget.throttle_percentage || 90;
        
        if (utilization >= throttleAt) {
          // Calculate throttle rate based on how far over throttle point
          const overThrottle = utilization - throttleAt;
          const throttleRate = Math.min(100, overThrottle * 10); // 10% reduction per 1% over
          
          return {
            allowed: true,
            reason: 'Request allowed but throttled',
            budgetId: budget.id,
            remainingBudget: remaining,
            throttlePercentage: throttleRate
          };
        }
      }
    }
    
    return { allowed: true };
  }
  
  /**
   * Get all budgets that apply to a request
   */
  private async getApplicableBudgets(
    orgId: string,
    dimensions: {
      teamId?: string;
      projectId?: string;
      costCenterId?: string;
      provider?: string;
      model?: string;
      apiKeyId?: string;
      userId?: string;
    }
  ): Promise<any[]> {
    let query = this.supabase
      .from('budget_summary')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active');
    
    // Build OR conditions for applicable budgets
    const conditions: string[] = [];
    
    // Organization budget always applies
    conditions.push(`type.eq.organization`);
    
    // Add dimension-specific conditions
    if (dimensions.teamId) {
      conditions.push(`and(type.eq.team,team_id.eq.${dimensions.teamId})`);
    }
    if (dimensions.projectId) {
      conditions.push(`and(type.eq.project,project_id.eq.${dimensions.projectId})`);
    }
    if (dimensions.costCenterId) {
      conditions.push(`and(type.eq.cost_center,cost_center_id.eq.${dimensions.costCenterId})`);
    }
    if (dimensions.provider) {
      conditions.push(`and(type.eq.provider,provider.eq.${dimensions.provider})`);
    }
    if (dimensions.model) {
      conditions.push(`and(type.eq.model,model.eq.${dimensions.model})`);
    }
    if (dimensions.apiKeyId) {
      conditions.push(`and(type.eq.api_key,api_key_id.eq.${dimensions.apiKeyId})`);
    }
    if (dimensions.userId) {
      conditions.push(`and(type.eq.user,user_id.eq.${dimensions.userId})`);
    }
    
    const { data } = await query.or(conditions.join(','));
    
    // Sort by specificity (most specific first)
    const typeOrder = ['api_key', 'user', 'model', 'provider', 'project', 'cost_center', 'team', 'organization'];
    
    return (data || []).sort((a, b) => 
      typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
    );
  }
  
  /**
   * Update budget mode based on utilization
   */
  async updateEnforcementMode(budgetId: string): Promise<void> {
    const { data: budget } = await this.supabase
      .from('budget_summary')
      .select('*')
      .eq('id', budgetId)
      .single();
    
    if (!budget) return;
    
    // Check if any blocking threshold was hit
    const { data: thresholds } = await this.supabase
      .from('budget_thresholds')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('action', 'block')
      .not('triggered_at', 'is', null);
    
    if (thresholds && thresholds.length > 0) {
      // Upgrade to hard mode
      await this.supabase
        .from('budgets')
        .update({ mode: 'hard' })
        .eq('id', budgetId);
    }
  }
  
  /**
   * Reset enforcement mode at period start
   */
  async resetEnforcementMode(budgetId: string): Promise<void> {
    const { data: budget } = await this.supabase
      .from('budgets')
      .select('metadata')
      .eq('id', budgetId)
      .single();
    
    // Reset to original mode stored in metadata
    const originalMode = budget?.metadata?.original_mode || 'soft';
    
    await this.supabase
      .from('budgets')
      .update({ mode: originalMode })
      .eq('id', budgetId);
  }
}

export const budgetEnforcementService = new BudgetEnforcementService();
```

---

## 10. Rollover & Carry Forward

```typescript
// services/budget-rollover.ts

import { createClient } from '@supabase/supabase-js';

interface RolloverSummary {
  budgetId: string;
  budgetName: string;
  previousPeriod: {
    start: string;
    end: string;
    budget: number;
    spent: number;
    remaining: number;
  };
  rolloverAmount: number;
  rolloverCapped: boolean;
  newPeriod: {
    start: string;
    end: string;
    baseBudget: number;
    totalBudget: number;
  };
}

export class BudgetRolloverService {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  /**
   * Process period end and rollover
   */
  async processRollover(budgetId: string): Promise<RolloverSummary | null> {
    const { data: budget } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();
    
    if (!budget) return null;
    
    // Get current (ending) period
    const { data: currentPeriod } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('status', 'active')
      .single();
    
    if (!currentPeriod) return null;
    
    // Close current period
    await this.supabase
      .from('budget_periods')
      .update({
        status: currentPeriod.spent_amount > currentPeriod.total_budget ? 'overspent' : 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', currentPeriod.id);
    
    // Calculate rollover amount
    let rolloverAmount = 0;
    let rolloverCapped = false;
    
    if (budget.rollover_enabled && currentPeriod.remaining_amount > 0) {
      rolloverAmount = currentPeriod.remaining_amount * (budget.rollover_percentage / 100);
      
      if (budget.rollover_cap && rolloverAmount > budget.rollover_cap) {
        rolloverAmount = budget.rollover_cap;
        rolloverCapped = true;
      }
    }
    
    // Calculate new period dates
    const newPeriodDates = this.calculateNextPeriodDates(
      budget.period,
      new Date(currentPeriod.period_end)
    );
    
    // Create new period
    const { data: newPeriod } = await this.supabase
      .from('budget_periods')
      .insert({
        budget_id: budgetId,
        period_start: newPeriodDates.start,
        period_end: newPeriodDates.end,
        allocated_amount: budget.amount,
        rollover_amount: rolloverAmount,
        status: 'active'
      })
      .select()
      .single();
    
    // Reset thresholds
    await this.supabase
      .from('budget_thresholds')
      .update({
        triggered_at: null,
        acknowledged_at: null,
        acknowledged_by: null
      })
      .eq('budget_id', budgetId);
    
    // Reset enforcement mode
    if (budget.metadata?.original_mode) {
      await this.supabase
        .from('budgets')
        .update({ mode: budget.metadata.original_mode })
        .eq('id', budgetId);
    }
    
    return {
      budgetId,
      budgetName: budget.name,
      previousPeriod: {
        start: currentPeriod.period_start,
        end: currentPeriod.period_end,
        budget: currentPeriod.total_budget,
        spent: currentPeriod.spent_amount,
        remaining: currentPeriod.remaining_amount
      },
      rolloverAmount,
      rolloverCapped,
      newPeriod: {
        start: newPeriodDates.start,
        end: newPeriodDates.end,
        baseBudget: budget.amount,
        totalBudget: budget.amount + rolloverAmount
      }
    };
  }
  
  /**
   * Process all budgets that need period rollover
   */
  async processAllRollovers(orgId: string): Promise<RolloverSummary[]> {
    const today = new Date().toISOString().split('T')[0];
    
    // Find budgets with periods ending today or earlier
    const { data: expiredPeriods } = await this.supabase
      .from('budget_periods')
      .select('budget_id, budgets!inner(org_id)')
      .eq('status', 'active')
      .eq('budgets.org_id', orgId)
      .lte('period_end', today);
    
    if (!expiredPeriods) return [];
    
    const results: RolloverSummary[] = [];
    
    for (const period of expiredPeriods) {
      const result = await this.processRollover(period.budget_id);
      if (result) results.push(result);
    }
    
    return results;
  }
  
  /**
   * Calculate next period dates based on period type
   */
  private calculateNextPeriodDates(
    periodType: string,
    currentPeriodEnd: Date
  ): { start: string; end: string } {
    const nextDay = new Date(currentPeriodEnd);
    nextDay.setDate(nextDay.getDate() + 1);
    
    let periodEnd: Date;
    
    switch (periodType) {
      case 'monthly':
        periodEnd = new Date(nextDay.getFullYear(), nextDay.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(nextDay.getMonth() / 3);
        periodEnd = new Date(nextDay.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'annual':
        periodEnd = new Date(nextDay.getFullYear(), 11, 31);
        break;
      case 'weekly':
        periodEnd = new Date(nextDay);
        periodEnd.setDate(periodEnd.getDate() + 6);
        break;
      default:
        // Custom - default to 30 days
        periodEnd = new Date(nextDay);
        periodEnd.setDate(periodEnd.getDate() + 29);
    }
    
    return {
      start: nextDay.toISOString().split('T')[0],
      end: periodEnd.toISOString().split('T')[0]
    };
  }
  
  /**
   * Preview what rollover would look like
   */
  async previewRollover(budgetId: string): Promise<{
    currentRemaining: number;
    potentialRollover: number;
    wouldBeCapped: boolean;
    nextPeriodTotal: number;
  }> {
    const { data: budget } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();
    
    const { data: period } = await this.supabase
      .from('budget_periods')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('status', 'active')
      .single();
    
    if (!budget || !period) {
      return { currentRemaining: 0, potentialRollover: 0, wouldBeCapped: false, nextPeriodTotal: 0 };
    }
    
    const currentRemaining = Math.max(0, period.remaining_amount || 0);
    let potentialRollover = budget.rollover_enabled 
      ? currentRemaining * (budget.rollover_percentage / 100)
      : 0;
    
    const wouldBeCapped = budget.rollover_cap !== null && potentialRollover > budget.rollover_cap;
    if (wouldBeCapped) potentialRollover = budget.rollover_cap;
    
    return {
      currentRemaining,
      potentialRollover,
      wouldBeCapped,
      nextPeriodTotal: budget.amount + potentialRollover
    };
  }
}

export const budgetRolloverService = new BudgetRolloverService();
```

---

## 11. API Routes

```typescript
// app/api/v1/budgets/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { budgetCalculationEngine } from '@/services/budget-calculation-engine';
import { budgetAlertIntegration } from '@/services/budget-alert-integration';

// Validation schemas
const createBudgetSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['organization', 'team', 'project', 'cost_center', 'provider', 'model', 'api_key', 'user']),
  teamId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  costCenterId: z.string().uuid().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  apiKeyId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  period: z.enum(['monthly', 'quarterly', 'annual', 'weekly', 'custom']),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  mode: z.enum(['soft', 'hard', 'throttle']).default('soft'),
  throttlePercentage: z.number().min(0).max(100).optional(),
  rolloverEnabled: z.boolean().default(false),
  rolloverPercentage: z.number().min(0).max(100).default(100),
  rolloverCap: z.number().positive().optional(),
  thresholds: z.array(z.object({
    percentage: z.number().positive(),
    action: z.enum(['alert', 'throttle', 'block']).default('alert'),
    alertEnabled: z.boolean().default(true)
  })).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

const querySchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  teamId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  exceededOnly: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
  sortBy: z.enum(['name', 'utilization', 'amount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// GET /api/v1/budgets
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));
    
    const orgId = request.headers.get('x-org-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    let query = supabase
      .from('budget_summary')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId);
    
    // Apply filters
    if (params.type) {
      query = query.eq('type', params.type);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }
    if (params.teamId) {
      query = query.eq('team_id', params.teamId);
    }
    if (params.projectId) {
      query = query.eq('project_id', params.projectId);
    }
    if (params.exceededOnly === 'true') {
      query = query.gte('utilization_percentage', 100);
    }
    
    // Sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? true : false;
    
    const sortColumn = {
      name: 'name',
      utilization: 'utilization_percentage',
      amount: 'total_budget',
      createdAt: 'created_at'
    }[sortBy];
    
    query = query.order(sortColumn, { ascending: sortOrder });
    
    // Pagination
    const page = parseInt(params.page || '1');
    const pageSize = parseInt(params.pageSize || '20');
    const offset = (page - 1) * pageSize;
    
    query = query.range(offset, offset + pageSize - 1);
    
    const { data, count, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      budgets: data,
      total: count,
      page,
      pageSize,
      hasMore: (count || 0) > offset + pageSize
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

// POST /api/v1/budgets
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const body = await request.json();
    const input = createBudgetSchema.parse(body);
    
    const orgId = request.headers.get('x-org-id');
    const userId = request.headers.get('x-user-id');
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    // Create budget
    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        org_id: orgId,
        name: input.name,
        description: input.description,
        type: input.type,
        team_id: input.teamId,
        project_id: input.projectId,
        cost_center_id: input.costCenterId,
        provider: input.provider,
        model: input.model,
        api_key_id: input.apiKeyId,
        user_id: input.userId,
        amount: input.amount,
        currency: input.currency,
        period: input.period,
        period_start: input.periodStart,
        period_end: input.periodEnd,
        mode: input.mode,
        throttle_percentage: input.throttlePercentage,
        rollover_enabled: input.rolloverEnabled,
        rollover_percentage: input.rolloverPercentage,
        rollover_cap: input.rolloverCap,
        tags: input.tags || [],
        metadata: { ...input.metadata, original_mode: input.mode },
        created_by: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create thresholds
    if (input.thresholds && input.thresholds.length > 0) {
      await supabase
        .from('budget_thresholds')
        .insert(input.thresholds.map(t => ({
          budget_id: budget.id,
          percentage: t.percentage,
          action: t.action,
          alert_enabled: t.alertEnabled
        })));
    } else {
      // Create default thresholds
      await budgetAlertIntegration.createDefaultThresholds(budget.id);
    }
    
    // Create initial period
    await budgetCalculationEngine.getCurrentPeriod(budget.id);
    
    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/v1/budgets/[budgetId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const updateBudgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  amount: z.number().positive().optional(),
  mode: z.enum(['soft', 'hard', 'throttle']).optional(),
  throttlePercentage: z.number().min(0).max(100).optional(),
  rolloverEnabled: z.boolean().optional(),
  rolloverPercentage: z.number().min(0).max(100).optional(),
  rolloverCap: z.number().positive().nullable().optional(),
  status: z.enum(['active', 'paused', 'archived']).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

// GET /api/v1/budgets/[budgetId]
export async function GET(
  request: NextRequest,
  { params }: { params: { budgetId: string } }
) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data, error } = await supabase
      .from('budget_summary')
      .select('*')
      .eq('id', params.budgetId)
      .single();
    
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    // Get thresholds
    const { data: thresholds } = await supabase
      .from('budget_thresholds')
      .select('*')
      .eq('budget_id', params.budgetId)
      .order('percentage', { ascending: true });
    
    // Get allocations
    const { data: allocations } = await supabase
      .from('budget_allocations')
      .select('*, child:budgets!child_budget_id(id, name, type)')
      .eq('parent_budget_id', params.budgetId);
    
    return NextResponse.json({
      budget: data,
      thresholds: thresholds || [],
      allocations: allocations || []
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/budgets/[budgetId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { budgetId: string } }
) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const body = await request.json();
    const input = updateBudgetSchema.parse(body);
    
    const { data, error } = await supabase
      .from('budgets')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.budgetId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ budget: data });
  } catch (error) {
    console.error('Error updating budget:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/budgets/[budgetId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { budgetId: string } }
) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', params.budgetId);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/v1/budgets/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { budgetCalculationEngine } from '@/services/budget-calculation-engine';

export async function GET(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    const stats = await budgetCalculationEngine.getOrgBudgetStats(orgId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching budget stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget stats' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/v1/budgets/[budgetId]/allocate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { budgetAllocationService } from '@/services/budget-allocation';

const allocateSchema = z.object({
  childBudgetId: z.string().uuid(),
  allocationType: z.enum(['fixed', 'percentage', 'dynamic']),
  allocationValue: z.number().positive(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: { budgetId: string } }
) {
  try {
    const body = await request.json();
    const input = allocateSchema.parse(body);
    
    const result = await budgetAllocationService.allocate(params.budgetId, input);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ allocation: result.allocation });
  } catch (error) {
    console.error('Error allocating budget:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to allocate budget' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/v1/budgets/[budgetId]/transfer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { budgetAllocationService } from '@/services/budget-allocation';

const transferSchema = z.object({
  toBudgetId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string().min(1).max(500)
});

export async function POST(
  request: NextRequest,
  { params }: { params: { budgetId: string } }
) {
  try {
    const body = await request.json();
    const input = transferSchema.parse(body);
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const result = await budgetAllocationService.transfer(
      params.budgetId,
      input.toBudgetId,
      input.amount,
      input.reason,
      userId
    );
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error transferring budget:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to transfer budget' },
      { status: 500 }
    );
  }
}
```

---

## 12. React Hooks & State Management

```typescript
// hooks/use-budgets.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  Budget, 
  BudgetSummary, 
  BudgetStatsResponse,
  CreateBudgetInput,
  UpdateBudgetInput,
  BudgetFilters,
  BudgetHierarchyNode
} from '@/types/budget';

const API_BASE = '/api/v1/budgets';

// ============================================
// QUERIES
// ============================================

export function useBudgets(filters?: BudgetFilters, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['budgets', filters, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.set('type', Array.isArray(filters.type) ? filters.type.join(',') : filters.type);
      if (filters?.status) params.set('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status);
      if (filters?.teamId) params.set('teamId', filters.teamId);
      if (filters?.projectId) params.set('projectId', filters.projectId);
      if (filters?.exceededOnly) params.set('exceededOnly', 'true');
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());
      
      const res = await fetch(`${API_BASE}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch budgets');
      return res.json() as Promise<{
        budgets: BudgetSummary[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
      }>;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useBudget(budgetId: string) {
  return useQuery({
    queryKey: ['budget', budgetId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${budgetId}`);
      if (!res.ok) throw new Error('Failed to fetch budget');
      return res.json();
    },
    enabled: !!budgetId,
  });
}

export function useBudgetStats() {
  return useQuery({
    queryKey: ['budget-stats'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error('Failed to fetch budget stats');
      return res.json() as Promise<BudgetStatsResponse>;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useBudgetHierarchy() {
  return useQuery({
    queryKey: ['budget-hierarchy'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/hierarchy`);
      if (!res.ok) throw new Error('Failed to fetch budget hierarchy');
      return res.json() as Promise<BudgetHierarchyNode[]>;
    },
  });
}

export function useBudgetForecast(budgetId: string) {
  return useQuery({
    queryKey: ['budget-forecast', budgetId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${budgetId}/forecast`);
      if (!res.ok) throw new Error('Failed to fetch budget forecast');
      return res.json();
    },
    enabled: !!budgetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAtRiskBudgets() {
  return useQuery({
    queryKey: ['at-risk-budgets'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/at-risk`);
      if (!res.ok) throw new Error('Failed to fetch at-risk budgets');
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useCreateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create budget');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-stats'] });
      queryClient.invalidateQueries({ queryKey: ['budget-hierarchy'] });
    },
  });
}

export function useUpdateBudget(budgetId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateBudgetInput) => {
      const res = await fetch(`${API_BASE}/${budgetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update budget');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', budgetId] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-stats'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (budgetId: string) => {
      const res = await fetch(`${API_BASE}/${budgetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete budget');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-stats'] });
      queryClient.invalidateQueries({ queryKey: ['budget-hierarchy'] });
    },
  });
}

export function useAllocateBudget(parentBudgetId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      childBudgetId: string;
      allocationType: 'fixed' | 'percentage' | 'dynamic';
      allocationValue: number;
    }) => {
      const res = await fetch(`${API_BASE}/${parentBudgetId}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to allocate budget');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', parentBudgetId] });
      queryClient.invalidateQueries({ queryKey: ['budget-hierarchy'] });
    },
  });
}

export function useTransferBudget(fromBudgetId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      toBudgetId: string;
      amount: number;
      reason: string;
    }) => {
      const res = await fetch(`${API_BASE}/${fromBudgetId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to transfer budget');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-hierarchy'] });
    },
  });
}

export function useAddThreshold(budgetId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: {
      percentage: number;
      action?: 'alert' | 'throttle' | 'block';
    }) => {
      const res = await fetch(`${API_BASE}/${budgetId}/thresholds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to add threshold');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', budgetId] });
    },
  });
}

export function useAcknowledgeThreshold() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (thresholdId: string) => {
      const res = await fetch(`${API_BASE}/thresholds/${thresholdId}/acknowledge`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to acknowledge threshold');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['at-risk-budgets'] });
    },
  });
}
```

---

## 13. UI Components

```typescript
// components/budgets/budget-card.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Calendar
} from 'lucide-react';
import type { BudgetSummary } from '@/types/budget';
import { cn } from '@/lib/utils';

interface BudgetCardProps {
  budget: BudgetSummary;
  onClick?: () => void;
}

export function BudgetCard({ budget, onClick }: BudgetCardProps) {
  const utilization = budget.utilizationPercentage || 0;
  const isExceeded = utilization >= 100;
  const isApproaching = utilization >= 80 && utilization < 100;
  
  const getProgressColor = () => {
    if (isExceeded) return 'bg-red-500';
    if (isApproaching) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isExceeded && 'border-red-200 bg-red-50/50',
        isApproaching && 'border-yellow-200 bg-yellow-50/50'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{budget.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {budget.type}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {budget.period}
              </Badge>
            </div>
          </div>
          {isExceeded && (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Spend Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Spent</p>
              <p className="text-xl font-semibold">
                {formatCurrency(budget.spentAmount || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-xl font-semibold">
                {formatCurrency(budget.totalBudget || 0)}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Utilization</span>
              <span className={cn(
                'font-medium',
                isExceeded && 'text-red-600',
                isApproaching && 'text-yellow-600'
              )}>
                {utilization.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(utilization, 100)} 
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
          </div>
          
          {/* Forecast */}
          {budget.forecastedSpend && (
            <div className="flex items-center justify-between text-sm border-t pt-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Forecast</span>
              </div>
              <span className={cn(
                'font-medium',
                budget.forecastedSpend > (budget.totalBudget || 0) && 'text-red-600'
              )}>
                {formatCurrency(budget.forecastedSpend)}
              </span>
            </div>
          )}
          
          {/* Days Until Exhaustion */}
          {budget.daysUntilExhaustion !== null && budget.daysUntilExhaustion !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Exhaustion</span>
              </div>
              <span className={cn(
                'font-medium',
                budget.daysUntilExhaustion <= 7 && 'text-red-600',
                budget.daysUntilExhaustion > 7 && budget.daysUntilExhaustion <= 14 && 'text-yellow-600'
              )}>
                {budget.daysUntilExhaustion} days
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

```typescript
// components/budgets/budget-hierarchy-tree.tsx

'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { BudgetHierarchyNode } from '@/types/budget';
import { cn } from '@/lib/utils';

interface BudgetHierarchyTreeProps {
  nodes: BudgetHierarchyNode[];
  onNodeClick?: (node: BudgetHierarchyNode) => void;
}

function TreeNode({ 
  node, 
  onNodeClick,
  depth = 0 
}: { 
  node: BudgetHierarchyNode; 
  onNodeClick?: (node: BudgetHierarchyNode) => void;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const utilization = node.utilizationPercentage || 0;
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };
  
  return (
    <div className="select-none">
      <div 
        className={cn(
          'flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/50 cursor-pointer',
          depth === 0 && 'font-medium'
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        onClick={() => onNodeClick?.(node)}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        
        {/* Node Info */}
        <div className="flex-1 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{node.name}</span>
            <span className="text-xs text-muted-foreground">
              ({node.type})
            </span>
          </div>
          
          <div className="flex items-center gap-4 shrink-0 ml-4">
            {/* Mini Progress */}
            <div className="w-16">
              <Progress 
                value={Math.min(utilization, 100)} 
                className="h-1.5"
                indicatorClassName={cn(
                  utilization >= 100 && 'bg-red-500',
                  utilization >= 80 && utilization < 100 && 'bg-yellow-500',
                  utilization < 80 && 'bg-green-500'
                )}
              />
            </div>
            
            <span className={cn(
              'text-sm w-12 text-right',
              utilization >= 100 && 'text-red-600 font-medium',
              utilization >= 80 && utilization < 100 && 'text-yellow-600'
            )}>
              {utilization.toFixed(0)}%
            </span>
            
            <span className="text-sm text-muted-foreground w-20 text-right">
              {formatCurrency(node.spentAmount || 0)} / {formatCurrency(node.amount)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              onNodeClick={onNodeClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function BudgetHierarchyTree({ nodes, onNodeClick }: BudgetHierarchyTreeProps) {
  return (
    <div className="border rounded-lg p-2">
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} onNodeClick={onNodeClick} />
      ))}
    </div>
  );
}
```

---

## 14. Background Jobs

```sql
-- ============================================
-- PG_CRON JOBS FOR BUDGET MANAGEMENT
-- ============================================

-- Update all budget periods with latest spend (every 5 minutes)
SELECT cron.schedule(
  'update-budget-spend',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/update-budget-spend',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  );
  $$
);

-- Update budget forecasts (every hour)
SELECT cron.schedule(
  'update-budget-forecasts',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/update-budget-forecasts',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  );
  $$
);

-- Process budget period rollovers (daily at midnight)
SELECT cron.schedule(
  'process-budget-rollovers',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/process-budget-rollovers',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  );
  $$
);

-- Check for budgets approaching thresholds (every 15 minutes)
SELECT cron.schedule(
  'check-budget-thresholds',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/check-budget-thresholds',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  );
  $$
);
```

```typescript
// supabase/functions/update-budget-spend/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Get all active budget periods
  const { data: periods, error } = await supabase
    .from('budget_periods')
    .select('id, budget_id, period_start, period_end')
    .eq('status', 'active');
  
  if (error) {
    console.error('Error fetching periods:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  
  let updated = 0;
  
  for (const period of periods || []) {
    try {
      // Calculate spend for this period
      const { data: spendData } = await supabase.rpc('calculate_budget_spend', {
        p_budget_id: period.budget_id,
        p_period_start: period.period_start,
        p_period_end: period.period_end
      });
      
      // Update period
      await supabase
        .from('budget_periods')
        .update({
          spent_amount: spendData || 0,
          last_calculated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', period.id);
      
      updated++;
    } catch (err) {
      console.error(`Error updating period ${period.id}:`, err);
    }
  }
  
  return new Response(JSON.stringify({ updated }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## 15. Audit Trail

```sql
-- ============================================
-- BUDGET AUDIT LOG
-- ============================================
CREATE TABLE budget_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  action TEXT NOT NULL,  -- 'created', 'updated', 'deleted', 'threshold_triggered', 'allocation_changed', 'transfer', 'rollover'
  actor_id UUID REFERENCES users(id),
  actor_type TEXT DEFAULT 'user',  -- 'user', 'system', 'api'
  changes JSONB,  -- { field: { old: ..., new: ... } }
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_budget_audit_log_budget ON budget_audit_log(budget_id, created_at DESC);
CREATE INDEX idx_budget_audit_log_action ON budget_audit_log(action, created_at DESC);

-- Trigger for automatic audit logging
CREATE OR REPLACE FUNCTION log_budget_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO budget_audit_log (budget_id, action, changes, actor_type)
    VALUES (NEW.id, 'created', to_jsonb(NEW), 'system');
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO budget_audit_log (budget_id, action, changes, actor_type)
    VALUES (
      NEW.id, 
      'updated', 
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      ),
      'system'
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO budget_audit_log (budget_id, action, changes, actor_type)
    VALUES (OLD.id, 'deleted', to_jsonb(OLD), 'system');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER budget_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION log_budget_changes();
```

---

## Summary

This document provides a complete specification for TokenTra's Budget Management System, including:

1. **Database Schema**: 6 tables with full RLS, indexes, and constraints
2. **TypeScript Types**: Complete type definitions for all entities
3. **Budget Calculation Engine**: Spend tracking, period management, threshold checking
4. **Allocation Service**: Hierarchical budgets, transfers, smart allocation suggestions
5. **Alert Integration**: Threshold-based alerts connecting to the Alerting Engine
6. **Forecasting**: ML-powered budget exhaustion predictions
7. **Enforcement**: Hard limits and throttling for budget control
8. **Rollover**: Configurable carry-forward of unused budget
9. **API Routes**: Full REST API with validation
10. **React Hooks**: Complete state management for UI
11. **UI Components**: Budget cards and hierarchy tree
12. **Background Jobs**: Automated spend updates and threshold checks
13. **Audit Trail**: Complete change tracking

**Integration Points:**
- Connects to Alerting Engine for threshold notifications
- Connects to Provider Sync Engine for usage data
- Connects to Teams/Projects/Cost Centers for scope assignment
