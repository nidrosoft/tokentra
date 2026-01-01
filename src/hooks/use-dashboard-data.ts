"use client";

import { useQuery } from "@tanstack/react-query";

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

export interface CostTrend {
  date: string;
  cost: number;
  tokens: number;
}

export interface DashboardData {
  stats: DashboardStats;
  providers: ProviderBreakdown[];
  consumers: TopConsumer[];
  alerts: RecentAlert[];
  recommendations: Recommendation[];
  trends: CostTrend[];
}

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch("/api/v1/dashboard");
  
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  
  const json = await response.json();
  
  if (!json.success) {
    throw new Error(json.error || "Failed to fetch dashboard data");
  }
  
  return json.data;
}

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Format token count for display
 */
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
  return tokens.toString();
}

/**
 * Format percentage change for display
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}
