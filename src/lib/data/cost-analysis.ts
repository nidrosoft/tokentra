import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ============================================================================
// TYPES
// ============================================================================

export interface CostAnalysisFilters {
  dateRange: string;
  provider: string;
  model: string;
  team: string;
  project: string;
  costCenter: string;
  granularity: "hour" | "day" | "week" | "month";
  startDate?: string;
  endDate?: string;
}

export interface CostSummary {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  avgCostPerRequest: number;
  avgTokensPerRequest: number;
  avgLatency: number;
  cachedTokens: number;
  cacheHitRate: number;
  costChange: number;
  tokenChange: number;
  requestChange: number;
}

export interface CostTrendPoint {
  date: string;
  cost: number;
  tokens: number;
  requests: number;
  avgLatency: number;
}

export interface CostBreakdown {
  dimension: string;
  value: string;
  cost: number;
  percentage: number;
  tokens: number;
  requests: number;
  avgCost: number;
  trend: number;
}

export interface CostRecord {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  cost: number;
  latencyMs: number;
  teamId: string | null;
  teamName: string | null;
  projectId: string | null;
  projectName: string | null;
  costCenterId: string | null;
  costCenterName: string | null;
  endpoint: string | null;
  status: string | null;
}

export interface CostAnalysisData {
  summary: CostSummary;
  trends: CostTrendPoint[];
  byProvider: CostBreakdown[];
  byModel: CostBreakdown[];
  byTeam: CostBreakdown[];
  byProject: CostBreakdown[];
  byCostCenter: CostBreakdown[];
  byEndpoint: CostBreakdown[];
  records: CostRecord[];
  totalRecords: number;
  filters: {
    providers: string[];
    models: string[];
    teams: { id: string; name: string }[];
    projects: { id: string; name: string }[];
    costCenters: { id: string; name: string }[];
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDateRange(dateRange: string, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const now = new Date();
  let end = new Date(now);
  let start = new Date(now);

  switch (dateRange) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "last7d":
      start.setDate(start.getDate() - 7);
      break;
    case "last30d":
      start.setDate(start.getDate() - 30);
      break;
    case "thisMonth":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "lastMonth":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "last90d":
      start.setDate(start.getDate() - 90);
      break;
    case "last6m":
      start.setMonth(start.getMonth() - 6);
      break;
    case "lastYear":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "custom":
      if (customStart) start = new Date(customStart);
      if (customEnd) end = new Date(customEnd);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return { start, end };
}

function getComparisonDateRange(start: Date, end: Date): { start: Date; end: Date } {
  const duration = end.getTime() - start.getTime();
  const compEnd = new Date(start.getTime() - 1);
  const compStart = new Date(compEnd.getTime() - duration);
  return { start: compStart, end: compEnd };
}

function formatDateForGranularity(date: string, granularity: string): string {
  const d = new Date(date);
  switch (granularity) {
    case "hour":
      return d.toISOString().slice(0, 13) + ":00:00";
    case "day":
      return d.toISOString().slice(0, 10);
    case "week":
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return weekStart.toISOString().slice(0, 10);
    case "month":
      return d.toISOString().slice(0, 7) + "-01";
    default:
      return d.toISOString().slice(0, 10);
  }
}

// ============================================================================
// MAIN DATA FUNCTIONS
// ============================================================================

/**
 * Get comprehensive cost analysis data with all filters applied
 */
export async function getCostAnalysisData(
  organizationId: string,
  filters: CostAnalysisFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<CostAnalysisData> {
  const supabase = getSupabaseAdmin();
  const { start, end } = getDateRange(filters.dateRange, filters.startDate, filters.endDate);
  const { start: compStart, end: compEnd } = getComparisonDateRange(start, end);

  // Build base query with filters
  let query = supabase
    .from("usage_records")
    .select("*")
    .eq("organization_id", organizationId)
    .gte("timestamp", start.toISOString())
    .lte("timestamp", end.toISOString());

  // Apply filters
  if (filters.provider && filters.provider !== "all") {
    query = query.eq("provider", filters.provider);
  }
  if (filters.model && filters.model !== "all") {
    query = query.eq("model", filters.model);
  }
  if (filters.team && filters.team !== "all") {
    query = query.eq("team_id", filters.team);
  }
  if (filters.project && filters.project !== "all") {
    query = query.eq("project_id", filters.project);
  }
  if (filters.costCenter && filters.costCenter !== "all") {
    query = query.eq("cost_center_id", filters.costCenter);
  }

  const { data: currentRecords } = await query;

  // Get comparison period data for trend calculation
  let compQuery = supabase
    .from("usage_records")
    .select("cost, input_tokens, output_tokens")
    .eq("organization_id", organizationId)
    .gte("timestamp", compStart.toISOString())
    .lte("timestamp", compEnd.toISOString());

  if (filters.provider && filters.provider !== "all") {
    compQuery = compQuery.eq("provider", filters.provider);
  }
  if (filters.model && filters.model !== "all") {
    compQuery = compQuery.eq("model", filters.model);
  }
  if (filters.team && filters.team !== "all") {
    compQuery = compQuery.eq("team_id", filters.team);
  }

  const { data: compRecords } = await compQuery;

  // Get filter options
  const [teamsResult, projectsResult, costCentersResult] = await Promise.all([
    supabase.from("teams").select("id, name").eq("organization_id", organizationId),
    supabase.from("projects").select("id, name").eq("organization_id", organizationId),
    supabase.from("cost_centers").select("id, name").eq("organization_id", organizationId),
  ]);

  const records = currentRecords || [];
  const compData = compRecords || [];

  // Calculate summary
  const summary = calculateSummary(records, compData);

  // Calculate trends
  const trends = calculateTrends(records, filters.granularity);

  // Calculate breakdowns
  const byProvider = calculateBreakdown(records, compData, "provider");
  const byModel = calculateBreakdown(records, compData, "model");
  const byTeam = calculateBreakdownWithNames(records, compData, "team_id", teamsResult.data || []);
  const byProject = calculateBreakdownWithNames(records, compData, "project_id", projectsResult.data || []);
  const byCostCenter = calculateBreakdownWithNames(records, compData, "cost_center_id", costCentersResult.data || []);
  const byEndpoint = calculateBreakdown(records, compData, "endpoint");

  // Get unique providers and models for filter options
  const providers = [...new Set(records.map((r) => r.provider))].filter(Boolean);
  const models = [...new Set(records.map((r) => r.model))].filter(Boolean);

  // Format records for table with pagination
  const offset = (page - 1) * pageSize;
  const paginatedRecords = records
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(offset, offset + pageSize)
    .map((r) => formatRecord(r, teamsResult.data || [], projectsResult.data || [], costCentersResult.data || []));

  return {
    summary,
    trends,
    byProvider,
    byModel,
    byTeam,
    byProject,
    byCostCenter,
    byEndpoint,
    records: paginatedRecords,
    totalRecords: records.length,
    filters: {
      providers,
      models,
      teams: teamsResult.data || [],
      projects: projectsResult.data || [],
      costCenters: costCentersResult.data || [],
    },
  };
}

function calculateSummary(
  records: Database["public"]["Tables"]["usage_records"]["Row"][],
  compRecords: Pick<Database["public"]["Tables"]["usage_records"]["Row"], "cost" | "input_tokens" | "output_tokens">[]
): CostSummary {
  const totalCost = records.reduce((sum, r) => sum + Number(r.cost), 0);
  const totalTokens = records.reduce((sum, r) => sum + r.input_tokens + r.output_tokens, 0);
  const totalRequests = records.length;
  const cachedTokens = records.reduce((sum, r) => sum + (r.cached_tokens || 0), 0);
  const totalLatency = records.reduce((sum, r) => sum + (r.latency_ms || 0), 0);

  const compCost = compRecords.reduce((sum, r) => sum + Number(r.cost), 0);
  const compTokens = compRecords.reduce((sum, r) => sum + r.input_tokens + r.output_tokens, 0);
  const compRequests = compRecords.length;

  return {
    totalCost,
    totalTokens,
    totalRequests,
    avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
    avgTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
    avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
    cachedTokens,
    cacheHitRate: totalTokens > 0 ? (cachedTokens / totalTokens) * 100 : 0,
    costChange: compCost > 0 ? ((totalCost - compCost) / compCost) * 100 : 0,
    tokenChange: compTokens > 0 ? ((totalTokens - compTokens) / compTokens) * 100 : 0,
    requestChange: compRequests > 0 ? ((totalRequests - compRequests) / compRequests) * 100 : 0,
  };
}

function calculateTrends(
  records: Database["public"]["Tables"]["usage_records"]["Row"][],
  granularity: string
): CostTrendPoint[] {
  const grouped = new Map<string, { cost: number; tokens: number; requests: number; latency: number }>();

  records.forEach((r) => {
    const key = formatDateForGranularity(r.timestamp, granularity);
    const existing = grouped.get(key) || { cost: 0, tokens: 0, requests: 0, latency: 0 };
    grouped.set(key, {
      cost: existing.cost + Number(r.cost),
      tokens: existing.tokens + r.input_tokens + r.output_tokens,
      requests: existing.requests + 1,
      latency: existing.latency + (r.latency_ms || 0),
    });
  });

  return Array.from(grouped.entries())
    .map(([date, data]) => ({
      date,
      cost: Math.round(data.cost * 100) / 100,
      tokens: data.tokens,
      requests: data.requests,
      avgLatency: data.requests > 0 ? Math.round(data.latency / data.requests) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateBreakdown(
  records: Database["public"]["Tables"]["usage_records"]["Row"][],
  compRecords: Pick<Database["public"]["Tables"]["usage_records"]["Row"], "cost" | "input_tokens" | "output_tokens">[],
  dimension: keyof Database["public"]["Tables"]["usage_records"]["Row"]
): CostBreakdown[] {
  const grouped = new Map<string, { cost: number; tokens: number; requests: number }>();
  const totalCost = records.reduce((sum, r) => sum + Number(r.cost), 0);

  records.forEach((r) => {
    const key = String(r[dimension] || "Unknown");
    const existing = grouped.get(key) || { cost: 0, tokens: 0, requests: 0 };
    grouped.set(key, {
      cost: existing.cost + Number(r.cost),
      tokens: existing.tokens + r.input_tokens + r.output_tokens,
      requests: existing.requests + 1,
    });
  });

  return Array.from(grouped.entries())
    .map(([value, data]) => ({
      dimension: String(dimension),
      value,
      cost: Math.round(data.cost * 100) / 100,
      percentage: totalCost > 0 ? Math.round((data.cost / totalCost) * 1000) / 10 : 0,
      tokens: data.tokens,
      requests: data.requests,
      avgCost: data.requests > 0 ? Math.round((data.cost / data.requests) * 10000) / 10000 : 0,
      trend: 0, // Would need historical comparison per dimension
    }))
    .sort((a, b) => b.cost - a.cost);
}

function calculateBreakdownWithNames(
  records: Database["public"]["Tables"]["usage_records"]["Row"][],
  compRecords: Pick<Database["public"]["Tables"]["usage_records"]["Row"], "cost" | "input_tokens" | "output_tokens">[],
  dimension: keyof Database["public"]["Tables"]["usage_records"]["Row"],
  nameMap: { id: string; name: string }[]
): CostBreakdown[] {
  const idToName = new Map(nameMap.map((item) => [item.id, item.name]));
  const grouped = new Map<string, { cost: number; tokens: number; requests: number; name: string }>();
  const totalCost = records.reduce((sum, r) => sum + Number(r.cost), 0);

  records.forEach((r) => {
    const id = String(r[dimension] || "");
    if (!id) return;
    const name = idToName.get(id) || "Unknown";
    const existing = grouped.get(id) || { cost: 0, tokens: 0, requests: 0, name };
    grouped.set(id, {
      cost: existing.cost + Number(r.cost),
      tokens: existing.tokens + r.input_tokens + r.output_tokens,
      requests: existing.requests + 1,
      name,
    });
  });

  return Array.from(grouped.entries())
    .map(([id, data]) => ({
      dimension: String(dimension),
      value: data.name,
      cost: Math.round(data.cost * 100) / 100,
      percentage: totalCost > 0 ? Math.round((data.cost / totalCost) * 1000) / 10 : 0,
      tokens: data.tokens,
      requests: data.requests,
      avgCost: data.requests > 0 ? Math.round((data.cost / data.requests) * 10000) / 10000 : 0,
      trend: 0,
    }))
    .sort((a, b) => b.cost - a.cost);
}

function formatRecord(
  r: Database["public"]["Tables"]["usage_records"]["Row"],
  teams: { id: string; name: string }[],
  projects: { id: string; name: string }[],
  costCenters: { id: string; name: string }[]
): CostRecord {
  return {
    id: r.id,
    timestamp: r.timestamp,
    provider: r.provider,
    model: r.model,
    inputTokens: r.input_tokens,
    outputTokens: r.output_tokens,
    cachedTokens: r.cached_tokens || 0,
    cost: Number(r.cost),
    latencyMs: r.latency_ms || 0,
    teamId: r.team_id,
    teamName: teams.find((t) => t.id === r.team_id)?.name || null,
    projectId: r.project_id,
    projectName: projects.find((p) => p.id === r.project_id)?.name || null,
    costCenterId: r.cost_center_id,
    costCenterName: costCenters.find((c) => c.id === r.cost_center_id)?.name || null,
    endpoint: r.endpoint,
    status: r.status,
  };
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export cost data to CSV format
 */
export async function exportCostDataToCSV(
  organizationId: string,
  filters: CostAnalysisFilters
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { start, end } = getDateRange(filters.dateRange, filters.startDate, filters.endDate);

  let query = supabase
    .from("usage_records")
    .select("*")
    .eq("organization_id", organizationId)
    .gte("timestamp", start.toISOString())
    .lte("timestamp", end.toISOString())
    .order("timestamp", { ascending: false });

  if (filters.provider && filters.provider !== "all") {
    query = query.eq("provider", filters.provider);
  }
  if (filters.model && filters.model !== "all") {
    query = query.eq("model", filters.model);
  }
  if (filters.team && filters.team !== "all") {
    query = query.eq("team_id", filters.team);
  }

  const { data: records } = await query;

  if (!records || records.length === 0) {
    return "No data available for the selected filters";
  }

  const headers = [
    "Timestamp",
    "Provider",
    "Model",
    "Input Tokens",
    "Output Tokens",
    "Cached Tokens",
    "Cost (USD)",
    "Latency (ms)",
    "Endpoint",
    "Status",
  ];

  const rows = records.map((r) => [
    r.timestamp,
    r.provider,
    r.model,
    r.input_tokens,
    r.output_tokens,
    r.cached_tokens || 0,
    r.cost,
    r.latency_ms || 0,
    r.endpoint || "",
    r.status || "",
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Get cost anomalies - unusual spending patterns
 */
export async function getCostAnomalies(
  organizationId: string,
  filters: CostAnalysisFilters
): Promise<{ date: string; cost: number; expected: number; deviation: number; type: string }[]> {
  const data = await getCostAnalysisData(organizationId, filters);
  const trends = data.trends;

  if (trends.length < 7) return [];

  // Calculate moving average and standard deviation
  const costs = trends.map((t) => t.cost);
  const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
  const stdDev = Math.sqrt(costs.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / costs.length);

  const anomalies: { date: string; cost: number; expected: number; deviation: number; type: string }[] = [];

  trends.forEach((point, i) => {
    if (i < 3) return; // Need at least 3 points for moving average

    const recentCosts = costs.slice(Math.max(0, i - 7), i);
    const movingAvg = recentCosts.reduce((a, b) => a + b, 0) / recentCosts.length;
    const deviation = (point.cost - movingAvg) / (stdDev || 1);

    if (Math.abs(deviation) > 2) {
      anomalies.push({
        date: point.date,
        cost: point.cost,
        expected: Math.round(movingAvg * 100) / 100,
        deviation: Math.round(deviation * 100) / 100,
        type: deviation > 0 ? "spike" : "drop",
      });
    }
  });

  return anomalies;
}
