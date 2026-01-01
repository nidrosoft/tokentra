"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

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

export interface UsageDataResponse {
  summary: UsageSummary;
  trends: UsageTrend[];
  tokenBreakdown: TokenBreakdown;
  modelDistribution: ModelUsage[];
  records: UsageRecord[];
}

export interface UsageFilters {
  dateRange?: string;
  provider?: string;
  model?: string;
  team?: string;
  granularity?: string;
}

export function useUsageData(filters?: UsageFilters) {
  return useQuery({
    queryKey: ["usage", "all", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.dateRange) params.dateRange = filters.dateRange;
      if (filters?.provider && filters.provider !== "all") params.provider = filters.provider;
      if (filters?.model && filters.model !== "all") params.model = filters.model;
      if (filters?.team && filters.team !== "all") params.team = filters.team;
      if (filters?.granularity) params.granularity = filters.granularity;

      const response = await apiClient.get<{ success: boolean; data: UsageDataResponse }>("/usage", { params });
      return response.data;
    },
  });
}

export function useUsageSummary(filters?: UsageFilters) {
  return useQuery({
    queryKey: ["usage", "summary", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.dateRange) params.dateRange = filters.dateRange;
      if (filters?.provider && filters.provider !== "all") params.provider = filters.provider;

      const response = await apiClient.get<{ success: boolean; data: UsageDataResponse }>("/usage", { params });
      return response.data?.summary;
    },
  });
}

export function useTokenUsage(filters?: UsageFilters) {
  return useQuery({
    queryKey: ["usage", "tokens", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.dateRange) params.dateRange = filters.dateRange;

      const response = await apiClient.get<{ success: boolean; data: TokenBreakdown }>("/usage/tokens", { params });
      return response.data;
    },
  });
}

export function useUsageTrends(filters?: UsageFilters) {
  return useQuery({
    queryKey: ["usage", "trends", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.dateRange) params.dateRange = filters.dateRange;
      if (filters?.granularity) params.granularity = filters.granularity;

      const response = await apiClient.get<{ success: boolean; data: UsageTrend[] }>("/usage/requests", { params });
      return response.data;
    },
  });
}

export function useModelUsage(filters?: UsageFilters) {
  return useQuery({
    queryKey: ["usage", "models", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.dateRange) params.dateRange = filters.dateRange;
      if (filters?.provider && filters.provider !== "all") params.provider = filters.provider;

      const response = await apiClient.get<{ success: boolean; data: ModelUsage[] }>("/usage/models", { params });
      return response.data;
    },
  });
}
