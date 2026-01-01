import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface UsageFilters {
  startDate?: string;
  endDate?: string;
  provider?: string;
  model?: string;
  team?: string;
  project?: string;
  granularity?: string;
}

export interface UsageSummary {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;
  totalCost: number;
  avgLatency: number;
  successRate: number;
  errorCount: number;
}

export interface UsageTrend {
  date: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface TokenBreakdown {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  cacheCreationTokens: number;
}

export interface ModelUsage {
  model: string;
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
  percentage: number;
}

export interface UsageRecord {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  cost: number;
  latencyMs: number;
  status: string;
  featureTag?: string;
}

class UsageService {
  private getDateRange(filter?: string): { start: Date; end: Date } {
    const end = new Date();
    let start: Date;

    switch (filter) {
      case "last7d":
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "last30d":
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "last90d":
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "thisMonth":
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case "lastMonth":
        start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
        break;
      default:
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { start, end };
  }

  async getSummary(organizationId: string, filters?: UsageFilters): Promise<UsageSummary> {
    const supabase = getSupabaseAdmin();
    const { start, end } = this.getDateRange(filters?.startDate);

    let query = supabase
      .from("usage_records")
      .select("input_tokens, output_tokens, cached_tokens, cost, latency_ms, status")
      .eq("organization_id", organizationId)
      .gte("timestamp", start.toISOString())
      .lte("timestamp", end.toISOString());

    if (filters?.provider && filters.provider !== "all") {
      query = query.eq("provider", filters.provider);
    }
    if (filters?.model && filters.model !== "all") {
      query = query.eq("model", filters.model);
    }
    if (filters?.team && filters.team !== "all") {
      query = query.eq("team_id", filters.team);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching usage summary:", error);
      return this.emptySummary();
    }

    if (!data || data.length === 0) {
      return this.emptySummary();
    }

    const totalRequests = data.length;
    const totalInputTokens = data.reduce((sum, r) => sum + (r.input_tokens || 0), 0);
    const totalOutputTokens = data.reduce((sum, r) => sum + (r.output_tokens || 0), 0);
    const totalCachedTokens = data.reduce((sum, r) => sum + (r.cached_tokens || 0), 0);
    const totalCost = data.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
    const totalLatency = data.reduce((sum, r) => sum + (r.latency_ms || 0), 0);
    const successCount = data.filter((r) => r.status === "success" || !r.status).length;

    return {
      totalRequests,
      totalInputTokens,
      totalOutputTokens,
      totalCachedTokens,
      totalCost,
      avgLatency: totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0,
      successRate: totalRequests > 0 ? Math.round((successCount / totalRequests) * 100 * 10) / 10 : 100,
      errorCount: totalRequests - successCount,
    };
  }

  async getTrends(organizationId: string, filters?: UsageFilters): Promise<UsageTrend[]> {
    const supabase = getSupabaseAdmin();
    const { start, end } = this.getDateRange(filters?.startDate);

    let query = supabase
      .from("usage_records")
      .select("timestamp, input_tokens, output_tokens, cost")
      .eq("organization_id", organizationId)
      .gte("timestamp", start.toISOString())
      .lte("timestamp", end.toISOString())
      .order("timestamp", { ascending: true });

    if (filters?.provider && filters.provider !== "all") {
      query = query.eq("provider", filters.provider);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error("Error fetching usage trends:", error);
      return [];
    }

    const granularity = filters?.granularity || "day";
    const grouped = new Map<string, UsageTrend>();

    data.forEach((record) => {
      const date = new Date(record.timestamp);
      let key: string;

      if (granularity === "hour") {
        key = `${date.toISOString().split("T")[0]}T${date.getHours().toString().padStart(2, "0")}:00`;
      } else if (granularity === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        key = date.toISOString().split("T")[0];
      }

      const existing = grouped.get(key) || { date: key, requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
      existing.requests += 1;
      existing.inputTokens += record.input_tokens || 0;
      existing.outputTokens += record.output_tokens || 0;
      existing.cost += Number(record.cost) || 0;
      grouped.set(key, existing);
    });

    return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTokenBreakdown(organizationId: string, filters?: UsageFilters): Promise<TokenBreakdown> {
    const supabase = getSupabaseAdmin();
    const { start, end } = this.getDateRange(filters?.startDate);

    const { data, error } = await supabase
      .from("usage_records")
      .select("input_tokens, output_tokens, cached_tokens, cache_creation_tokens")
      .eq("organization_id", organizationId)
      .gte("timestamp", start.toISOString())
      .lte("timestamp", end.toISOString());

    if (error || !data) {
      return { inputTokens: 0, outputTokens: 0, cachedTokens: 0, cacheCreationTokens: 0 };
    }

    return {
      inputTokens: data.reduce((sum, r) => sum + (r.input_tokens || 0), 0),
      outputTokens: data.reduce((sum, r) => sum + (r.output_tokens || 0), 0),
      cachedTokens: data.reduce((sum, r) => sum + (r.cached_tokens || 0), 0),
      cacheCreationTokens: data.reduce((sum, r) => sum + (r.cache_creation_tokens || 0), 0),
    };
  }

  async getModelDistribution(organizationId: string, filters?: UsageFilters): Promise<ModelUsage[]> {
    const supabase = getSupabaseAdmin();
    const { start, end } = this.getDateRange(filters?.startDate);

    const { data, error } = await supabase
      .from("usage_records")
      .select("model, provider, input_tokens, output_tokens, cost")
      .eq("organization_id", organizationId)
      .gte("timestamp", start.toISOString())
      .lte("timestamp", end.toISOString());

    if (error || !data) {
      return [];
    }

    const modelMap = new Map<string, ModelUsage>();

    data.forEach((record) => {
      const key = record.model || "unknown";
      const existing = modelMap.get(key) || {
        model: key,
        provider: record.provider || "unknown",
        requests: 0,
        tokens: 0,
        cost: 0,
        percentage: 0,
      };
      existing.requests += 1;
      existing.tokens += (record.input_tokens || 0) + (record.output_tokens || 0);
      existing.cost += Number(record.cost) || 0;
      modelMap.set(key, existing);
    });

    const models = Array.from(modelMap.values());
    const totalTokens = models.reduce((sum, m) => sum + m.tokens, 0);

    models.forEach((m) => {
      m.percentage = totalTokens > 0 ? Math.round((m.tokens / totalTokens) * 100 * 10) / 10 : 0;
    });

    return models.sort((a, b) => b.tokens - a.tokens);
  }

  async getRecords(organizationId: string, filters?: UsageFilters, limit = 100): Promise<UsageRecord[]> {
    const supabase = getSupabaseAdmin();
    const { start, end } = this.getDateRange(filters?.startDate);

    let query = supabase
      .from("usage_records")
      .select("id, timestamp, provider, model, input_tokens, output_tokens, cached_tokens, cost, latency_ms, status, feature_tag")
      .eq("organization_id", organizationId)
      .gte("timestamp", start.toISOString())
      .lte("timestamp", end.toISOString())
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (filters?.provider && filters.provider !== "all") {
      query = query.eq("provider", filters.provider);
    }
    if (filters?.model && filters.model !== "all") {
      query = query.eq("model", filters.model);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      provider: r.provider || "unknown",
      model: r.model || "unknown",
      inputTokens: r.input_tokens || 0,
      outputTokens: r.output_tokens || 0,
      cachedTokens: r.cached_tokens || 0,
      cost: Number(r.cost) || 0,
      latencyMs: r.latency_ms || 0,
      status: r.status || "success",
      featureTag: r.feature_tag,
    }));
  }

  private emptySummary(): UsageSummary {
    return {
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCachedTokens: 0,
      totalCost: 0,
      avgLatency: 0,
      successRate: 100,
      errorCount: 0,
    };
  }
}

export const usageService = new UsageService();
