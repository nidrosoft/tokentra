-- ============================================
-- SDK USAGE HOURLY AGGREGATION TABLE
-- Pre-aggregated data for faster dashboard queries
-- ============================================

CREATE TABLE IF NOT EXISTS sdk_usage_hourly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  hour TIMESTAMPTZ NOT NULL,
  
  -- Dimensions
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  
  -- Request counts
  request_count BIGINT DEFAULT 0,
  error_count BIGINT DEFAULT 0,
  cache_hit_count BIGINT DEFAULT 0,
  
  -- Token aggregates
  total_input_tokens BIGINT DEFAULT 0,
  total_output_tokens BIGINT DEFAULT 0,
  total_cached_tokens BIGINT DEFAULT 0,
  
  -- Cost aggregates
  total_cost DECIMAL(18, 10) DEFAULT 0,
  total_input_cost DECIMAL(18, 10) DEFAULT 0,
  total_output_cost DECIMAL(18, 10) DEFAULT 0,
  
  -- Latency statistics
  avg_latency_ms DECIMAL(10, 2) DEFAULT 0,
  min_latency_ms INTEGER DEFAULT 0,
  max_latency_ms INTEGER DEFAULT 0,
  p50_latency_ms INTEGER DEFAULT 0,
  p95_latency_ms INTEGER DEFAULT 0,
  p99_latency_ms INTEGER DEFAULT 0,
  
  -- Attribution breakdowns (JSONB for flexibility)
  by_feature JSONB DEFAULT '{}',
  by_team JSONB DEFAULT '{}',
  by_environment JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT sdk_usage_hourly_unique UNIQUE (org_id, hour, provider, model)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sdk_usage_hourly_org 
  ON sdk_usage_hourly (org_id, hour DESC);

CREATE INDEX IF NOT EXISTS idx_sdk_usage_hourly_provider 
  ON sdk_usage_hourly (org_id, provider, hour DESC);

-- ============================================
-- SDK USAGE DAILY AGGREGATION TABLE
-- Daily rollup for long-term analytics
-- ============================================

CREATE TABLE IF NOT EXISTS sdk_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Dimensions
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  
  -- Request counts
  request_count BIGINT DEFAULT 0,
  error_count BIGINT DEFAULT 0,
  cache_hit_count BIGINT DEFAULT 0,
  
  -- Token aggregates
  total_input_tokens BIGINT DEFAULT 0,
  total_output_tokens BIGINT DEFAULT 0,
  total_cached_tokens BIGINT DEFAULT 0,
  
  -- Cost aggregates
  total_cost DECIMAL(18, 10) DEFAULT 0,
  total_input_cost DECIMAL(18, 10) DEFAULT 0,
  total_output_cost DECIMAL(18, 10) DEFAULT 0,
  
  -- Latency statistics
  avg_latency_ms DECIMAL(10, 2) DEFAULT 0,
  min_latency_ms INTEGER DEFAULT 0,
  max_latency_ms INTEGER DEFAULT 0,
  p50_latency_ms INTEGER DEFAULT 0,
  p95_latency_ms INTEGER DEFAULT 0,
  p99_latency_ms INTEGER DEFAULT 0,
  
  -- Attribution breakdowns
  by_feature JSONB DEFAULT '{}',
  by_team JSONB DEFAULT '{}',
  by_environment JSONB DEFAULT '{}',
  
  -- Unique users count
  unique_users INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT sdk_usage_daily_unique UNIQUE (org_id, date, provider, model)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sdk_usage_daily_org 
  ON sdk_usage_daily (org_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_sdk_usage_daily_provider 
  ON sdk_usage_daily (org_id, provider, date DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE sdk_usage_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdk_usage_daily ENABLE ROW LEVEL SECURITY;

-- Hourly table policies
CREATE POLICY sdk_hourly_org_isolation ON sdk_usage_hourly
  FOR ALL
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY sdk_hourly_service_access ON sdk_usage_hourly
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Daily table policies
CREATE POLICY sdk_daily_org_isolation ON sdk_usage_daily
  FOR ALL
  USING (
    org_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY sdk_daily_service_access ON sdk_usage_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- AGGREGATION FUNCTIONS
-- ============================================

-- Function to aggregate hourly data from raw records
CREATE OR REPLACE FUNCTION aggregate_sdk_usage_hourly(target_hour TIMESTAMPTZ DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  v_hour TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  -- Default to previous complete hour
  v_hour := COALESCE(target_hour, date_trunc('hour', NOW() - INTERVAL '1 hour'));
  
  INSERT INTO sdk_usage_hourly (
    org_id, hour, provider, model,
    request_count, error_count, cache_hit_count,
    total_input_tokens, total_output_tokens, total_cached_tokens,
    total_cost, total_input_cost, total_output_cost,
    avg_latency_ms, min_latency_ms, max_latency_ms,
    p50_latency_ms, p95_latency_ms, p99_latency_ms,
    by_feature, by_environment
  )
  SELECT
    org_id,
    date_trunc('hour', timestamp) AS hour,
    provider,
    model,
    COUNT(*) AS request_count,
    COUNT(*) FILTER (WHERE is_error) AS error_count,
    COUNT(*) FILTER (WHERE was_cached) AS cache_hit_count,
    SUM(input_tokens) AS total_input_tokens,
    SUM(output_tokens) AS total_output_tokens,
    SUM(cached_tokens) AS total_cached_tokens,
    SUM(input_cost + output_cost + COALESCE(cached_cost, 0)) AS total_cost,
    SUM(input_cost) AS total_input_cost,
    SUM(output_cost) AS total_output_cost,
    AVG(latency_ms) AS avg_latency_ms,
    MIN(latency_ms) AS min_latency_ms,
    MAX(latency_ms) AS max_latency_ms,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms)::INTEGER AS p50_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::INTEGER AS p95_latency_ms,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms)::INTEGER AS p99_latency_ms,
    COALESCE(
      jsonb_object_agg(
        feature, 
        jsonb_build_object('count', feature_count, 'cost', feature_cost)
      ) FILTER (WHERE feature IS NOT NULL),
      '{}'::jsonb
    ) AS by_feature,
    COALESCE(
      jsonb_object_agg(
        environment,
        jsonb_build_object('count', env_count, 'cost', env_cost)
      ) FILTER (WHERE environment IS NOT NULL),
      '{}'::jsonb
    ) AS by_environment
  FROM (
    SELECT 
      org_id, timestamp, provider, model, is_error, was_cached,
      input_tokens, output_tokens, cached_tokens,
      input_cost, output_cost, cached_cost, latency_ms,
      feature,
      COUNT(*) OVER (PARTITION BY org_id, provider, model, feature) AS feature_count,
      SUM(input_cost + output_cost) OVER (PARTITION BY org_id, provider, model, feature) AS feature_cost,
      environment,
      COUNT(*) OVER (PARTITION BY org_id, provider, model, environment) AS env_count,
      SUM(input_cost + output_cost) OVER (PARTITION BY org_id, provider, model, environment) AS env_cost
    FROM sdk_usage_records
    WHERE timestamp >= v_hour
      AND timestamp < v_hour + INTERVAL '1 hour'
  ) sub
  GROUP BY org_id, date_trunc('hour', timestamp), provider, model
  ON CONFLICT (org_id, hour, provider, model)
  DO UPDATE SET
    request_count = EXCLUDED.request_count,
    error_count = EXCLUDED.error_count,
    cache_hit_count = EXCLUDED.cache_hit_count,
    total_input_tokens = EXCLUDED.total_input_tokens,
    total_output_tokens = EXCLUDED.total_output_tokens,
    total_cached_tokens = EXCLUDED.total_cached_tokens,
    total_cost = EXCLUDED.total_cost,
    total_input_cost = EXCLUDED.total_input_cost,
    total_output_cost = EXCLUDED.total_output_cost,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    min_latency_ms = EXCLUDED.min_latency_ms,
    max_latency_ms = EXCLUDED.max_latency_ms,
    p50_latency_ms = EXCLUDED.p50_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms,
    p99_latency_ms = EXCLUDED.p99_latency_ms,
    by_feature = EXCLUDED.by_feature,
    by_environment = EXCLUDED.by_environment,
    updated_at = NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate daily data from hourly records
CREATE OR REPLACE FUNCTION aggregate_sdk_usage_daily(target_date DATE DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  v_date DATE;
  v_count INTEGER;
BEGIN
  -- Default to yesterday
  v_date := COALESCE(target_date, CURRENT_DATE - INTERVAL '1 day');
  
  INSERT INTO sdk_usage_daily (
    org_id, date, provider, model,
    request_count, error_count, cache_hit_count,
    total_input_tokens, total_output_tokens, total_cached_tokens,
    total_cost, total_input_cost, total_output_cost,
    avg_latency_ms, min_latency_ms, max_latency_ms,
    p50_latency_ms, p95_latency_ms, p99_latency_ms
  )
  SELECT
    org_id,
    v_date AS date,
    provider,
    model,
    SUM(request_count) AS request_count,
    SUM(error_count) AS error_count,
    SUM(cache_hit_count) AS cache_hit_count,
    SUM(total_input_tokens) AS total_input_tokens,
    SUM(total_output_tokens) AS total_output_tokens,
    SUM(total_cached_tokens) AS total_cached_tokens,
    SUM(total_cost) AS total_cost,
    SUM(total_input_cost) AS total_input_cost,
    SUM(total_output_cost) AS total_output_cost,
    AVG(avg_latency_ms) AS avg_latency_ms,
    MIN(min_latency_ms) AS min_latency_ms,
    MAX(max_latency_ms) AS max_latency_ms,
    AVG(p50_latency_ms)::INTEGER AS p50_latency_ms,
    AVG(p95_latency_ms)::INTEGER AS p95_latency_ms,
    AVG(p99_latency_ms)::INTEGER AS p99_latency_ms
  FROM sdk_usage_hourly
  WHERE hour >= v_date
    AND hour < v_date + INTERVAL '1 day'
  GROUP BY org_id, provider, model
  ON CONFLICT (org_id, date, provider, model)
  DO UPDATE SET
    request_count = EXCLUDED.request_count,
    error_count = EXCLUDED.error_count,
    cache_hit_count = EXCLUDED.cache_hit_count,
    total_input_tokens = EXCLUDED.total_input_tokens,
    total_output_tokens = EXCLUDED.total_output_tokens,
    total_cached_tokens = EXCLUDED.total_cached_tokens,
    total_cost = EXCLUDED.total_cost,
    total_input_cost = EXCLUDED.total_input_cost,
    total_output_cost = EXCLUDED.total_output_cost,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    min_latency_ms = EXCLUDED.min_latency_ms,
    max_latency_ms = EXCLUDED.max_latency_ms,
    p50_latency_ms = EXCLUDED.p50_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms,
    p99_latency_ms = EXCLUDED.p99_latency_ms,
    updated_at = NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE sdk_usage_hourly IS 'Hourly aggregated SDK usage for fast dashboard queries';
COMMENT ON TABLE sdk_usage_daily IS 'Daily aggregated SDK usage for long-term analytics';
COMMENT ON FUNCTION aggregate_sdk_usage_hourly IS 'Aggregates raw SDK records into hourly buckets';
COMMENT ON FUNCTION aggregate_sdk_usage_daily IS 'Aggregates hourly data into daily buckets';
