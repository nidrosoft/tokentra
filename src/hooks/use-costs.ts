"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { CostRecord, CostSummary, CostTrend, CostBreakdown, DateRangeParams, FilterParams } from "@/types";

export function useCosts(params?: DateRangeParams & FilterParams) {
  return useQuery({
    queryKey: ["costs", params],
    queryFn: () => apiClient.get<CostRecord[]>("/costs", { params: params as unknown as Record<string, string> }),
  });
}

export function useCostSummary(params?: DateRangeParams & FilterParams) {
  return useQuery({
    queryKey: ["costs", "summary", params],
    queryFn: () => apiClient.get<CostSummary>("/costs/aggregate", { params: params as unknown as Record<string, string> }),
  });
}

export function useCostTrends(params?: DateRangeParams & FilterParams & { granularity?: string }) {
  return useQuery({
    queryKey: ["costs", "trends", params],
    queryFn: () => apiClient.get<CostTrend[]>("/costs/trends", { params: params as unknown as Record<string, string> }),
  });
}

export function useCostBreakdown(dimension: string, params?: DateRangeParams & FilterParams) {
  return useQuery({
    queryKey: ["costs", "breakdown", dimension, params],
    queryFn: () => apiClient.get<CostBreakdown[]>("/costs/breakdown", { 
      params: { dimension, ...params } as unknown as Record<string, string> 
    }),
  });
}

export function useCostForecast(params?: DateRangeParams) {
  return useQuery({
    queryKey: ["costs", "forecast", params],
    queryFn: () => apiClient.get("/costs/forecast", { params: params as unknown as Record<string, string> }),
  });
}
