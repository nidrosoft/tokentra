import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface DashboardStats {
  totalSpend: number;
  totalTokens: number;
  totalRequests: number;
  avgCostPerRequest: number;
  potentialSavings: number;
  pendingRecommendations: number;
  spendChange: number;
  tokensChange: number;
}

export interface ProviderBreakdown {
  provider: string;
  spend: number;
  percentage: number;
  requests: number;
  tokens: number;
  trend: number;
}

export interface TopConsumer {
  id: string;
  name: string;
  type: "team" | "project" | "user";
  spend: number;
  tokens: number;
  trend: number;
}

export interface RecentAlert {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  triggeredAt: string;
  status: string;
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  estimatedSavings: number;
  status: string;
}

/**
 * Get dashboard overview stats for an organization
 */
export async function getDashboardStats(organizationId: string): Promise<DashboardStats> {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get current month stats
  const { data: currentMonth } = await supabase
    .from("usage_records")
    .select("cost, input_tokens, output_tokens")
    .eq("organization_id", organizationId)
    .gte("timestamp", startOfMonth.toISOString());

  // Get last month stats for comparison
  const { data: lastMonth } = await supabase
    .from("usage_records")
    .select("cost, input_tokens, output_tokens")
    .eq("organization_id", organizationId)
    .gte("timestamp", startOfLastMonth.toISOString())
    .lte("timestamp", endOfLastMonth.toISOString());

  // Get pending recommendations count
  const { count: recommendationsCount } = await supabase
    .from("recommendations")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "pending");

  // Calculate stats
  const currentSpend = currentMonth?.reduce((sum, r) => sum + Number(r.cost), 0) || 0;
  const currentTokens = currentMonth?.reduce((sum, r) => sum + r.input_tokens + r.output_tokens, 0) || 0;
  const currentRequests = currentMonth?.length || 0;

  const lastSpend = lastMonth?.reduce((sum, r) => sum + Number(r.cost), 0) || 0;
  const lastTokens = lastMonth?.reduce((sum, r) => sum + r.input_tokens + r.output_tokens, 0) || 0;

  const spendChange = lastSpend > 0 ? ((currentSpend - lastSpend) / lastSpend) * 100 : 0;
  const tokensChange = lastTokens > 0 ? ((currentTokens - lastTokens) / lastTokens) * 100 : 0;

  // Calculate potential savings from recommendations
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("impact")
    .eq("organization_id", organizationId)
    .eq("status", "pending");

  const potentialSavings = recommendations?.reduce((sum, r) => {
    const impact = r.impact as { estimatedMonthlySavings?: number };
    return sum + (impact?.estimatedMonthlySavings || 0);
  }, 0) || 0;

  return {
    totalSpend: currentSpend,
    totalTokens: currentTokens,
    totalRequests: currentRequests,
    avgCostPerRequest: currentRequests > 0 ? currentSpend / currentRequests : 0,
    potentialSavings,
    pendingRecommendations: recommendationsCount || 0,
    spendChange,
    tokensChange,
  };
}

/**
 * Get provider breakdown for an organization
 */
export async function getProviderBreakdown(organizationId: string): Promise<ProviderBreakdown[]> {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get current month by provider
  const { data: currentMonth } = await supabase
    .from("usage_records")
    .select("provider, cost, input_tokens, output_tokens")
    .eq("organization_id", organizationId)
    .gte("timestamp", startOfMonth.toISOString());

  // Get last month by provider for trend
  const { data: lastMonth } = await supabase
    .from("usage_records")
    .select("provider, cost")
    .eq("organization_id", organizationId)
    .gte("timestamp", startOfLastMonth.toISOString())
    .lte("timestamp", endOfLastMonth.toISOString());

  // Aggregate by provider
  const providerMap = new Map<string, { spend: number; tokens: number; requests: number }>();
  const lastMonthMap = new Map<string, number>();

  currentMonth?.forEach((r) => {
    const existing = providerMap.get(r.provider) || { spend: 0, tokens: 0, requests: 0 };
    providerMap.set(r.provider, {
      spend: existing.spend + Number(r.cost),
      tokens: existing.tokens + r.input_tokens + r.output_tokens,
      requests: existing.requests + 1,
    });
  });

  lastMonth?.forEach((r) => {
    lastMonthMap.set(r.provider, (lastMonthMap.get(r.provider) || 0) + Number(r.cost));
  });

  const totalSpend = Array.from(providerMap.values()).reduce((sum, p) => sum + p.spend, 0);

  return Array.from(providerMap.entries())
    .map(([provider, data]) => {
      const lastSpend = lastMonthMap.get(provider) || 0;
      const trend = lastSpend > 0 ? ((data.spend - lastSpend) / lastSpend) * 100 : 0;

      return {
        provider,
        spend: data.spend,
        percentage: totalSpend > 0 ? (data.spend / totalSpend) * 100 : 0,
        requests: data.requests,
        tokens: data.tokens,
        trend,
      };
    })
    .sort((a, b) => b.spend - a.spend);
}

/**
 * Get top consumers (teams, projects, users) for an organization
 */
export async function getTopConsumers(organizationId: string, limit: number = 5): Promise<TopConsumer[]> {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get usage by team
  const { data: teamUsage } = await supabase
    .from("usage_records")
    .select("team_id, cost, input_tokens, output_tokens")
    .eq("organization_id", organizationId)
    .not("team_id", "is", null)
    .gte("timestamp", startOfMonth.toISOString());

  // Get team names
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .eq("organization_id", organizationId);

  const teamMap = new Map(teams?.map((t) => [t.id, t.name]) || []);

  // Aggregate by team
  const teamAggregates = new Map<string, { spend: number; tokens: number }>();
  teamUsage?.forEach((r) => {
    if (!r.team_id) return;
    const existing = teamAggregates.get(r.team_id) || { spend: 0, tokens: 0 };
    teamAggregates.set(r.team_id, {
      spend: existing.spend + Number(r.cost),
      tokens: existing.tokens + r.input_tokens + r.output_tokens,
    });
  });

  const consumers: TopConsumer[] = Array.from(teamAggregates.entries())
    .map(([teamId, data]) => ({
      id: teamId,
      name: teamMap.get(teamId) || "Unknown Team",
      type: "team" as const,
      spend: data.spend,
      tokens: data.tokens,
      trend: 0, // Would need historical data for trend
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, limit);

  return consumers;
}

/**
 * Get recent alerts for an organization
 */
export async function getRecentAlerts(organizationId: string, limit: number = 5): Promise<RecentAlert[]> {
  const supabase = getSupabaseAdmin();

  const { data: alerts } = await supabase
    .from("alert_events")
    .select("id, type, severity, title, message, triggered_at, status")
    .eq("organization_id", organizationId)
    .order("triggered_at", { ascending: false })
    .limit(limit);

  return (alerts || []).map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity as "info" | "warning" | "critical",
    title: a.title,
    message: a.message,
    triggeredAt: a.triggered_at || "",
    status: a.status || "active",
  }));
}

/**
 * Get pending recommendations for an organization
 */
export async function getPendingRecommendations(organizationId: string, limit: number = 5): Promise<Recommendation[]> {
  const supabase = getSupabaseAdmin();

  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("id, type, title, description, impact, status")
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (recommendations || []).map((r) => {
    const impact = r.impact as { estimatedMonthlySavings?: number };
    return {
      id: r.id,
      type: r.type,
      title: r.title,
      description: r.description,
      estimatedSavings: impact?.estimatedMonthlySavings || 0,
      status: r.status || "pending",
    };
  });
}

/**
 * Get cost trends over time
 */
export async function getCostTrends(
  organizationId: string,
  days: number = 30
): Promise<{ date: string; cost: number; tokens: number }[]> {
  const supabase = getSupabaseAdmin();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: usage } = await supabase
    .from("usage_records")
    .select("timestamp, cost, input_tokens, output_tokens")
    .eq("organization_id", organizationId)
    .gte("timestamp", startDate.toISOString())
    .order("timestamp", { ascending: true });

  // Aggregate by day
  const dailyMap = new Map<string, { cost: number; tokens: number }>();

  usage?.forEach((r) => {
    const date = r.timestamp.split("T")[0];
    const existing = dailyMap.get(date) || { cost: 0, tokens: 0 };
    dailyMap.set(date, {
      cost: existing.cost + Number(r.cost),
      tokens: existing.tokens + r.input_tokens + r.output_tokens,
    });
  });

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      cost: data.cost,
      tokens: data.tokens,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
