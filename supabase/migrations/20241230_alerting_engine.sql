-- TokenTRA Alerting Engine Database Schema
-- Migration: 20241230_alerting_engine
-- 
-- This migration creates the tables and functions required for the
-- enterprise-grade alerting system.

-- ============================================================================
-- ALERT RULES TABLE
-- Stores alert rule configurations
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'spend_threshold', 'budget_threshold', 'spend_anomaly',
    'forecast_exceeded', 'provider_error', 'usage_spike'
  )),
  enabled BOOLEAN DEFAULT true,
  config JSONB NOT NULL,  -- Type-specific configuration
  channels JSONB NOT NULL DEFAULT '[]',  -- Notification channels
  
  -- Rate limiting
  cooldown_minutes INTEGER DEFAULT 60,
  max_alerts_per_hour INTEGER DEFAULT 10,
  
  -- Scheduling
  active_hours JSONB,  -- { start: 9, end: 17 }
  active_days INTEGER[],  -- [1,2,3,4,5] for weekdays
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT unique_rule_name UNIQUE (organization_id, name)
);

-- ============================================================================
-- ALERTS TABLE
-- Stores triggered alert events
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'acknowledged', 'resolved', 'snoozed'
  )),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  context JSONB DEFAULT '{}',
  
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  acknowledgment_note TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_type VARCHAR(50),
  resolution_note TEXT,
  snoozed_until TIMESTAMPTZ,
  snoozed_by UUID REFERENCES users(id),
  
  notifications_sent JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ALERT ACTIONS TABLE
-- Stores alert timeline/history
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATION CHANNELS TABLE
-- Stores organization-level notification channel configurations
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'slack', 'pagerduty', 'webhook')),
  config JSONB NOT NULL,  -- Type-specific configuration (encrypted sensitive fields)
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USAGE BASELINES TABLE
-- Stores statistical baselines for anomaly detection
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric VARCHAR(100) NOT NULL,
  
  -- Statistical measures
  mean NUMERIC NOT NULL,
  std_dev NUMERIC NOT NULL,
  median NUMERIC NOT NULL,
  mad NUMERIC NOT NULL,  -- Median Absolute Deviation
  q1 NUMERIC NOT NULL,
  q3 NUMERIC NOT NULL,
  min_value NUMERIC NOT NULL,
  max_value NUMERIC NOT NULL,
  data_points INTEGER NOT NULL,
  
  -- Metadata
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  filters JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_baseline UNIQUE (organization_id, metric, filters)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_alerts_org_status ON alerts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_snoozed ON alerts(snoozed_until) WHERE status = 'snoozed';
CREATE INDEX IF NOT EXISTS idx_alerts_rule_id ON alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_org ON alert_rules(organization_id, enabled);
CREATE INDEX IF NOT EXISTS idx_alert_actions_alert ON alert_actions(alert_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_channels_org ON notification_channels(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_baselines_org ON usage_baselines(organization_id, metric);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_baselines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alert_rules
CREATE POLICY "Users can view own org rules" ON alert_rules
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own org rules" ON alert_rules
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own org rules" ON alert_rules
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own org rules" ON alert_rules
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- RLS Policies for alerts
CREATE POLICY "Users can view own org alerts" ON alerts
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own org alerts" ON alerts
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- RLS Policies for alert_actions
CREATE POLICY "Users can view own org alert actions" ON alert_actions
  FOR SELECT USING (alert_id IN (
    SELECT id FROM alerts WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

-- RLS Policies for notification_channels
CREATE POLICY "Users can view own org channels" ON notification_channels
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own org channels" ON notification_channels
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- RLS Policies for usage_baselines
CREATE POLICY "Users can view own org baselines" ON usage_baselines
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Get top cost contributors for alert context
CREATE OR REPLACE FUNCTION get_top_cost_contributors(
  p_org_id UUID,
  p_since TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(name TEXT, cost NUMERIC, percentage NUMERIC)
LANGUAGE SQL STABLE
AS $$
  WITH total AS (
    SELECT COALESCE(SUM(cost), 0) as total_cost
    FROM usage_records
    WHERE organization_id = p_org_id AND timestamp >= p_since
  ),
  by_model AS (
    SELECT 
      model as name,
      SUM(cost) as cost
    FROM usage_records
    WHERE organization_id = p_org_id AND timestamp >= p_since
    GROUP BY model
    ORDER BY cost DESC
    LIMIT p_limit
  )
  SELECT 
    bm.name,
    bm.cost,
    CASE WHEN t.total_cost > 0 
      THEN ROUND((bm.cost / t.total_cost) * 100, 1)
      ELSE 0 
    END as percentage
  FROM by_model bm, total t;
$$;

-- Get metric baseline for anomaly detection
CREATE OR REPLACE FUNCTION get_metric_baseline(
  p_org_id UUID,
  p_metric TEXT,
  p_start_date TIMESTAMPTZ,
  p_filters JSONB DEFAULT '{}'
)
RETURNS TABLE(value NUMERIC, timestamp TIMESTAMPTZ)
LANGUAGE PLPGSQL STABLE
AS $$
BEGIN
  IF p_metric = 'daily_cost' THEN
    RETURN QUERY
    SELECT 
      SUM(cost)::NUMERIC as value,
      DATE_TRUNC('day', ur.timestamp) as timestamp
    FROM usage_records ur
    WHERE ur.organization_id = p_org_id 
      AND ur.timestamp >= p_start_date
    GROUP BY DATE_TRUNC('day', ur.timestamp)
    ORDER BY timestamp;
    
  ELSIF p_metric = 'hourly_cost' THEN
    RETURN QUERY
    SELECT 
      SUM(cost)::NUMERIC as value,
      DATE_TRUNC('hour', ur.timestamp) as timestamp
    FROM usage_records ur
    WHERE ur.organization_id = p_org_id 
      AND ur.timestamp >= p_start_date
    GROUP BY DATE_TRUNC('hour', ur.timestamp)
    ORDER BY timestamp;
  END IF;
END;
$$;

-- Get seasonal baseline for day-of-week patterns
CREATE OR REPLACE FUNCTION get_seasonal_baseline(
  p_org_id UUID,
  p_metric TEXT,
  p_day_of_week INTEGER,
  p_hour_of_day INTEGER,
  p_weeks_back INTEGER DEFAULT 4
)
RETURNS TABLE(value NUMERIC, week_date DATE)
LANGUAGE SQL STABLE
AS $$
  SELECT 
    SUM(cost)::NUMERIC as value,
    DATE_TRUNC('week', timestamp)::DATE as week_date
  FROM usage_records
  WHERE organization_id = p_org_id
    AND timestamp >= NOW() - (p_weeks_back || ' weeks')::INTERVAL
    AND EXTRACT(DOW FROM timestamp) = p_day_of_week
    AND EXTRACT(HOUR FROM timestamp) = p_hour_of_day
  GROUP BY DATE_TRUNC('week', timestamp)
  ORDER BY week_date;
$$;

-- Get daily spend history for forecasting
CREATE OR REPLACE FUNCTION get_daily_spend_history(
  p_org_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE(date DATE, total_cost NUMERIC)
LANGUAGE SQL STABLE
AS $$
  SELECT 
    DATE_TRUNC('day', timestamp)::DATE as date,
    SUM(cost)::NUMERIC as total_cost
  FROM usage_records
  WHERE organization_id = p_org_id
    AND timestamp >= p_start_date
    AND timestamp <= p_end_date
  GROUP BY DATE_TRUNC('day', timestamp)
  ORDER BY date;
$$;

-- Get current metric value for anomaly detection
CREATE OR REPLACE FUNCTION get_current_metric_value(
  p_org_id UUID,
  p_metric TEXT,
  p_since TIMESTAMPTZ,
  p_filters JSONB DEFAULT '{}'
)
RETURNS TABLE(value NUMERIC)
LANGUAGE SQL STABLE
AS $$
  SELECT COALESCE(SUM(cost), 0)::NUMERIC as value
  FROM usage_records
  WHERE organization_id = p_org_id
    AND timestamp >= p_since;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_channels_updated_at
  BEFORE UPDATE ON notification_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_baselines_updated_at
  BEFORE UPDATE ON usage_baselines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE alert_rules IS 'Alert rule configurations for the alerting engine';
COMMENT ON TABLE alerts IS 'Triggered alert events';
COMMENT ON TABLE alert_actions IS 'Alert lifecycle actions and timeline';
COMMENT ON TABLE notification_channels IS 'Organization notification channel configurations';
COMMENT ON TABLE usage_baselines IS 'Statistical baselines for anomaly detection';

COMMENT ON FUNCTION get_top_cost_contributors IS 'Get top cost contributors for alert context';
COMMENT ON FUNCTION get_metric_baseline IS 'Get metric baseline data for anomaly detection';
COMMENT ON FUNCTION get_seasonal_baseline IS 'Get seasonal baseline for day-of-week patterns';
COMMENT ON FUNCTION get_daily_spend_history IS 'Get daily spend history for forecasting';
COMMENT ON FUNCTION get_current_metric_value IS 'Get current metric value for anomaly detection';
