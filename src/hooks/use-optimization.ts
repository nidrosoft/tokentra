"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Recommendation, OptimizationSummary } from "@/types";

export function useRecommendations(params?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ["optimization", "recommendations", params],
    queryFn: () => apiClient.get<Recommendation[]>("/optimization/recommendations", { 
      params: params as Record<string, string> 
    }),
  });
}

export function useRecommendation(id: string) {
  return useQuery({
    queryKey: ["optimization", "recommendations", id],
    queryFn: () => apiClient.get<Recommendation>(`/optimization/recommendations/${id}`),
    enabled: !!id,
  });
}

export function useOptimizationSummary() {
  return useQuery({
    queryKey: ["optimization", "summary"],
    queryFn: () => apiClient.get<OptimizationSummary>("/optimization"),
  });
}

export function useSavingsReport() {
  return useQuery({
    queryKey: ["optimization", "savings"],
    queryFn: () => apiClient.get("/optimization/savings"),
  });
}

export function useApplyRecommendation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/optimization/recommendations/${id}/apply`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimization"] });
    },
  });
}

export function useDismissRecommendation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/optimization/recommendations/${id}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimization"] });
    },
  });
}

export function useAnalyzeOptimization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.post("/optimization/analyze"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimization"] });
    },
  });
}
