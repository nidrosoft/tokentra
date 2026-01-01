"use client";

import { useQuery } from "@tanstack/react-query";

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

export interface CostAnomaly {
  date: string;
  cost: number;
  expected: number;
  deviation: number;
  type: "spike" | "drop";
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface FilterOptions {
  providers: string[];
  models: string[];
  teams: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  costCenters: { id: string; name: string }[];
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
  filters: FilterOptions;
  anomalies: CostAnomaly[] | null;
  pagination: Pagination;
}

// ============================================================================
// DEFAULT FILTERS
// ============================================================================

export const defaultFilters: CostAnalysisFilters = {
  dateRange: "last30d",
  provider: "all",
  model: "all",
  team: "all",
  project: "all",
  costCenter: "all",
  granularity: "day",
};

// ============================================================================
// FETCH FUNCTION
// ============================================================================

async function fetchCostAnalysisData(
  filters: CostAnalysisFilters,
  page: number = 1,
  pageSize: number = 50,
  includeAnomalies: boolean = false
): Promise<CostAnalysisData> {
  const params = new URLSearchParams({
    dateRange: filters.dateRange,
    provider: filters.provider,
    model: filters.model,
    team: filters.team,
    project: filters.project,
    costCenter: filters.costCenter,
    granularity: filters.granularity,
    page: String(page),
    pageSize: String(pageSize),
  });

  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (includeAnomalies) params.set("anomalies", "true");

  const response = await fetch(`/api/v1/costs?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch cost analysis data");
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.error || "Failed to fetch cost analysis data");
  }

  return json.data;
}

// ============================================================================
// HOOKS
// ============================================================================

export function useCostAnalysis(
  filters: CostAnalysisFilters,
  page: number = 1,
  pageSize: number = 50,
  includeAnomalies: boolean = false
) {
  return useQuery({
    queryKey: ["cost-analysis", filters, page, pageSize, includeAnomalies],
    queryFn: () => fetchCostAnalysisData(filters, page, pageSize, includeAnomalies),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// ============================================================================
// EXPORT FUNCTION
// ============================================================================

export async function exportCostData(filters: CostAnalysisFilters): Promise<void> {
  const params = new URLSearchParams({
    dateRange: filters.dateRange,
    provider: filters.provider,
    model: filters.model,
    team: filters.team,
    project: filters.project,
    costCenter: filters.costCenter,
    granularity: filters.granularity,
    export: "csv",
  });

  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);

  const response = await fetch(`/api/v1/costs?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to export cost data");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cost-analysis-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000000000) {
    return `${(tokens / 1000000000).toFixed(1)}B`;
  }
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toLocaleString();
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${Math.round(ms)}ms`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}
