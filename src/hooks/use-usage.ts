"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { UsageRecord, UsageSummary, UsageTrend, TokenUsageByModel, DateRangeParams, FilterParams } from "@/types";

export function useUsage(params?: DateRangeParams & FilterParams) {
  return useQuery({
    queryKey: ["usage", params],
    queryFn: () => apiClient.get<UsageRecord[]>("/usage", { params: params as Record<string, string> }),
  });
}

export function useUsageSummary(params?: DateRangeParams & FilterParams) {
  return useQuery({
    queryKey: ["usage", "summary", params],
    queryFn: () => apiClient.get<UsageSummary>("/usage", { params: params as Record<string, string> }),
  });
}

export function useTokenUsage(params?: DateRangeParams & FilterParams) {
  return useQuery({
    queryKey: ["usage", "tokens", params],
    queryFn: () => apiClient.get<TokenUsageByModel[]>("/usage/tokens", { params: params as Record<string, string> }),
  });
}

export function useUsageTrends(params?: DateRangeParams & FilterParams & { granularity?: string }) {
  return useQuery({
    queryKey: ["usage", "trends", params],
    queryFn: () => apiClient.get<UsageTrend[]>("/usage/requests", { params: params as Record<string, string> }),
  });
}

export function useModelUsage(params?: DateRangeParams & FilterParams) {
  return useQuery({
    queryKey: ["usage", "models", params],
    queryFn: () => apiClient.get("/usage/models", { params: params as Record<string, string> }),
  });
}
