-- ============================================
-- SDK USAGE RECORDS TABLE
-- Main table for storing SDK telemetry events
-- ============================================

-- Note: TimescaleDB hypertable creation is commented out as it requires
-- the TimescaleDB extension which may not be available on all Supabase plans.
-- Uncomment if TimescaleDB is enabled on your project.

CREATE TABLE IF NOT EXISTS sdk_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Request identification
  request_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Provider and model
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  method_path VARCHAR(100),
  
  -- Token counts
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cached_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  
  -- Costs (in USD, high precision for micro-transactions)
  input_cost DECIMAL(18, 10) NOT NULL DEFAULT 0,
  output_cost DECIMAL(18, 10) NOT NULL DEFAULT 0,
  cached_cost DECIMAL(18, 10) DEFAULT 0,
  total_cost DECIMAL(18, 10) GENERATED ALWAYS AS (input_cost + output_cost + COALESCE(cached_cost, 0)) STORED,
  
  -- Performance metrics
  latency_ms INTEGER NOT NULL DEFAULT 0,
  time_to_first_token_ms INTEGER,
  
  -- Attribution (resolved to IDs)
  feature VARCHAR(100),
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
  user_ids TEXT[] DEFAULT '{}',
  environment VARCHAR(50) DEFAULT 'production',
  metadata JSONB DEFAULT '{}',
  
  -- Caching and routing info
  was_cached BOOLEAN DEFAULT FALSE,
  cache_hit_type VARCHAR(20), -- 'exact', 'semantic', 'none'
  original_model VARCHAR(100), -- If smart routed to different model
  routed_by_rule VARCHAR(100),
  
  -- Error tracking
  is_error BOOLEAN DEFAULT FALSE,
  error_code VARCHAR(100),
  error_type VARCHAR(50), -- 'rate_limit', 'auth', 'timeout', 'server', 'client'
  error_message TEXT,
  
  -- Content hashes (for caching analysis, not actual content)
  prompt_hash VARCHAR(64),
  
  -- SDK metadata
  sdk_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  sdk_language VARCHAR(20) NOT NULL DEFAULT 'typescript',
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  
  -- Record metadata
  source VARCHAR(20) DEFAULT 'sdk',
  is_streaming BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT sdk_valid_provider CHECK (provider IN ('openai', 'anthropic', 'google', 'azure', 'aws', 'xai', 'deepseek', 'mistral', 'cohere', 'groq')),
  CONSTRAINT sdk_valid_tokens CHECK (input_tokens >= 0 AND output_tokens >= 0),
  CONSTRAINT sdk_valid_costs CHECK (input_cost >= 0 AND output_cost >= 0),
  CONSTRAINT sdk_valid_latency CHECK (latency_ms >= 0)
);

-- Uncomment for TimescaleDB (requires extension)
-- SELECT create_hypertable('sdk_usage_records', 'timestamp',
--   chunk_time_interval => INTERVAL '1 day',
--   if_not_exists => TRUE
-- );

-- ============================================
-- INDEXES FOR QUERY PERFORMANCE
-- ============================================

-- Primary query patterns
CREATE INDEX IF NOT EXISTS idx_sdk_usage_org_timestamp 
  ON sdk_usage_records (org_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sdk_usage_org_provider 
  ON sdk_usage_records (org_id, provider, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sdk_usage_org_model 
  ON sdk_usage_records (org_id, model, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sdk_usage_org_feature 
  ON sdk_usage_records (org_id, feature, timestamp DESC)
  WHERE feature IS NOT NULL;

-- Attribution lookups
CREATE INDEX IF NOT EXISTS idx_sdk_usage_team 
  ON sdk_usage_records (team_id, timestamp DESC)
  WHERE team_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sdk_usage_project 
  ON sdk_usage_records (project_id, timestamp DESC)
  WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sdk_usage_cost_center 
  ON sdk_usage_records (cost_center_id, timestamp DESC)
  WHERE cost_center_id IS NOT NULL;

-- Error tracking
CREATE INDEX IF NOT EXISTS idx_sdk_usage_errors 
  ON sdk_usage_records (org_id, timestamp DESC)
  WHERE is_error = TRUE;

-- Deduplication check
CREATE UNIQUE INDEX IF NOT EXISTS idx_sdk_usage_request_id 
  ON sdk_usage_records (request_id);

-- Prompt hash for caching analysis
CREATE INDEX IF NOT EXISTS idx_sdk_usage_prompt_hash 
  ON sdk_usage_records (org_id, prompt_hash, timestamp DESC)
  WHERE prompt_hash IS NOT NULL;

-- API key usage tracking
CREATE INDEX IF NOT EXISTS idx_sdk_usage_api_key 
  ON sdk_usage_records (api_key_id, timestamp DESC)
  WHERE api_key_id IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE sdk_usage_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their organization's SDK usage
CREATE POLICY sdk_usage_org_isolation ON sdk_usage_records
  FOR ALL
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role has full access
CREATE POLICY sdk_usage_service_access ON sdk_usage_records
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE sdk_usage_records IS 'Stores all telemetry events from the TokenTra SDK';
COMMENT ON COLUMN sdk_usage_records.request_id IS 'Unique identifier for the AI request, used for deduplication';
COMMENT ON COLUMN sdk_usage_records.prompt_hash IS 'SHA-256 hash of prompt for caching analysis (not actual content)';
COMMENT ON COLUMN sdk_usage_records.original_model IS 'Original requested model if smart routing changed it';
COMMENT ON COLUMN sdk_usage_records.was_cached IS 'Whether response was served from semantic cache';
