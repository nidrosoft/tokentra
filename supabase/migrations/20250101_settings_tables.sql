-- ============================================================================
-- SETTINGS SYSTEM TABLES
-- Migration for organization settings, user settings, API keys, integrations,
-- webhooks, and email preferences
-- ============================================================================

-- ============================================================================
-- ORGANIZATION SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- General
  display_name VARCHAR(255),
  logo_url VARCHAR(500),
  timezone VARCHAR(100) DEFAULT 'UTC',
  locale VARCHAR(20) DEFAULT 'en-US',
  date_format VARCHAR(50) DEFAULT 'MMM DD, YYYY',
  currency VARCHAR(3) DEFAULT 'USD',
  fiscal_year_start INTEGER DEFAULT 1,
  
  -- Defaults
  default_cost_center_id UUID,
  default_budget_period VARCHAR(20) DEFAULT 'monthly',
  default_alert_channels JSONB DEFAULT '["email", "in_app"]'::jsonb,
  
  -- Security Policies
  require_2fa BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 1440,
  password_min_length INTEGER DEFAULT 12,
  password_require_special BOOLEAN DEFAULT true,
  password_require_numbers BOOLEAN DEFAULT true,
  password_expire_days INTEGER,
  allowed_ip_ranges JSONB DEFAULT '[]'::jsonb,
  
  -- Data Retention
  usage_data_retention_days INTEGER DEFAULT 365,
  audit_log_retention_days INTEGER DEFAULT 730,
  
  -- Feature Toggles
  features_enabled JSONB DEFAULT '{}'::jsonb,
  
  -- Locked Settings
  locked_settings JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_org_settings UNIQUE (org_id)
);

CREATE INDEX IF NOT EXISTS idx_org_settings_org ON organization_settings(org_id);

-- ============================================================================
-- USER SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Profile
  display_name VARCHAR(255),
  avatar_url VARCHAR(500),
  
  -- Preferences
  timezone VARCHAR(100),
  locale VARCHAR(20),
  date_format VARCHAR(50),
  theme VARCHAR(20) DEFAULT 'system',
  
  -- Dashboard
  default_dashboard_view VARCHAR(50) DEFAULT 'overview',
  default_date_range VARCHAR(20) DEFAULT '30d',
  pinned_widgets JSONB DEFAULT '[]'::jsonb,
  collapsed_sections JSONB DEFAULT '[]'::jsonb,
  
  -- Navigation
  sidebar_collapsed BOOLEAN DEFAULT false,
  recent_pages JSONB DEFAULT '[]'::jsonb,
  favorite_pages JSONB DEFAULT '[]'::jsonb,
  
  -- Table/Chart Preferences
  table_preferences JSONB DEFAULT '{}'::jsonb,
  chart_preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Accessibility
  reduce_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  font_size VARCHAR(20) DEFAULT 'medium',
  
  -- Keyboard
  shortcuts_enabled BOOLEAN DEFAULT true,
  custom_shortcuts JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_org_settings UNIQUE (user_id, org_id)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_org ON user_settings(org_id);

-- ============================================================================
-- API KEYS (for SDK and programmatic access)
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  
  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  
  -- Permissions
  scopes JSONB DEFAULT '["read"]'::jsonb,
  
  -- Restrictions
  allowed_ips JSONB DEFAULT '[]'::jsonb,
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Tracking
  last_used_at TIMESTAMPTZ,
  last_used_ip VARCHAR(45),
  usage_count INTEGER DEFAULT 0,
  
  -- Status
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID,
  revoke_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_key_prefix UNIQUE (org_id, key_prefix)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- ============================================================================
-- INTEGRATION SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  integration_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  
  -- Configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  config_encrypted TEXT,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active',
  last_used_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Metadata
  connected_by UUID,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_integration UNIQUE (org_id, integration_type, name)
);

CREATE INDEX IF NOT EXISTS idx_integration_settings_org ON integration_settings(org_id);
CREATE INDEX IF NOT EXISTS idx_integration_settings_type ON integration_settings(integration_type);

-- ============================================================================
-- WEBHOOKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  secret VARCHAR(255),
  custom_headers JSONB DEFAULT '{}'::jsonb,
  
  -- Retry
  retry_count INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active',
  last_triggered_at TIMESTAMPTZ,
  last_status_code INTEGER,
  failure_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhooks(org_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(org_id, enabled);

-- ============================================================================
-- EMAIL PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Email categories
  onboarding_emails BOOLEAN DEFAULT true,
  alert_emails BOOLEAN DEFAULT true,
  billing_emails BOOLEAN DEFAULT true,
  team_emails BOOLEAN DEFAULT true,
  security_emails BOOLEAN DEFAULT true,
  report_emails BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  
  -- Global
  unsubscribed_from_all BOOLEAN DEFAULT false,
  
  -- Digest preferences
  digest_frequency VARCHAR(20) DEFAULT 'weekly',
  digest_day INTEGER DEFAULT 1,
  digest_hour INTEGER DEFAULT 9,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_email_prefs UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_email_preferences_user ON email_preferences(user_id);

-- ============================================================================
-- SETTINGS AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS settings_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID,
  
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  setting_key VARCHAR(255) NOT NULL,
  
  old_value JSONB,
  new_value JSONB,
  
  action VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_audit_org ON settings_audit_log(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_audit_entity ON settings_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_user ON settings_audit_log(user_id, created_at DESC);

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Targeting
  scope VARCHAR(20) NOT NULL DEFAULT 'platform',
  target_id UUID,
  
  -- Value
  enabled BOOLEAN DEFAULT false,
  value JSONB,
  rollout_percentage INTEGER DEFAULT 100,
  
  -- Metadata
  category VARCHAR(50),
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Lifecycle
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_feature_flag UNIQUE (key, scope, COALESCE(target_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_scope ON feature_flags(scope, target_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Organization settings: org members can read, admins can write
CREATE POLICY "Org members can view org settings" ON organization_settings
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage org settings" ON organization_settings
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- User settings: users manage their own
CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (user_id = auth.uid());

-- API keys: users manage own, admins manage all
CREATE POLICY "Users manage own API keys" ON api_keys
  FOR ALL USING (
    user_id = auth.uid() OR
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Integration settings: admins only
CREATE POLICY "Admins manage integrations" ON integration_settings
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Webhooks: admins only
CREATE POLICY "Admins manage webhooks" ON webhooks
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Email preferences: users manage own
CREATE POLICY "Users manage own email preferences" ON email_preferences
  FOR ALL USING (user_id = auth.uid());
