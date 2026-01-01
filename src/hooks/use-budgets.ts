"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  BudgetSummary,
  BudgetWithPeriod,
  BudgetStatsResponse,
  BudgetThreshold,
  BudgetPeriodData,
  BudgetAdjustment,
  CreateBudgetInput,
  UpdateBudgetInput,
  CreateThresholdInput,
  CreateAdjustmentInput,
  BudgetFilters,
} from "@/lib/budget";

interface BudgetsResponse {
  budgets: BudgetSummary[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

interface UseBudgetsOptions {
  organizationId: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'utilization' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  filters?: BudgetFilters;
}

export function useBudgets(options: UseBudgetsOptions) {
  const { organizationId, page = 1, pageSize = 20, sortBy, sortOrder, filters } = options;

  return useQuery({
    queryKey: ["budgets", organizationId, page, pageSize, sortBy, sortOrder, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        organization_id: organizationId,
        page: String(page),
        page_size: String(pageSize),
      });

      if (sortBy) params.set("sort_by", sortBy);
      if (sortOrder) params.set("sort_order", sortOrder);
      if (filters?.type) {
        params.set("type", Array.isArray(filters.type) ? filters.type.join(",") : filters.type);
      }
      if (filters?.status) {
        params.set("status", Array.isArray(filters.status) ? filters.status.join(",") : filters.status);
      }
      if (filters?.teamId) params.set("team_id", filters.teamId);
      if (filters?.projectId) params.set("project_id", filters.projectId);
      if (filters?.exceededOnly) params.set("exceeded_only", "true");

      return apiClient.get<BudgetsResponse>(`/budgets?${params.toString()}`);
    },
    enabled: !!organizationId,
  });
}

export function useBudget(budgetId: string) {
  return useQuery({
    queryKey: ["budgets", budgetId],
    queryFn: () => apiClient.get<BudgetWithPeriod>(`/budgets/${budgetId}`),
    enabled: !!budgetId,
  });
}

export function useBudgetStats(organizationId: string) {
  return useQuery({
    queryKey: ["budgets", "stats", organizationId],
    queryFn: () => apiClient.get<BudgetStatsResponse>(`/budgets/stats?organization_id=${organizationId}`),
    enabled: !!organizationId,
  });
}

export function useBudgetThresholds(budgetId: string) {
  return useQuery({
    queryKey: ["budgets", budgetId, "thresholds"],
    queryFn: () => apiClient.get<BudgetThreshold[]>(`/budgets/${budgetId}/thresholds`),
    enabled: !!budgetId,
  });
}

export function useBudgetPeriods(budgetId: string, limit: number = 12) {
  return useQuery({
    queryKey: ["budgets", budgetId, "periods", limit],
    queryFn: () => apiClient.get<BudgetPeriodData[]>(`/budgets/${budgetId}/periods?limit=${limit}`),
    enabled: !!budgetId,
  });
}

export function useBudgetAdjustments(budgetId: string, limit: number = 50) {
  return useQuery({
    queryKey: ["budgets", budgetId, "adjustments", limit],
    queryFn: () => apiClient.get<BudgetAdjustment[]>(`/budgets/${budgetId}/adjustments?limit=${limit}`),
    enabled: !!budgetId,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: string; data: CreateBudgetInput }) =>
      apiClient.post<BudgetWithPeriod>("/budgets", {
        organization_id: organizationId,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, data }: { budgetId: string; data: UpdateBudgetInput }) =>
      apiClient.patch<BudgetWithPeriod>(`/budgets/${budgetId}`, data),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, archive = false }: { budgetId: string; archive?: boolean }) =>
      apiClient.delete(`/budgets/${budgetId}${archive ? "?archive=true" : ""}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useCreateThresholds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, thresholds }: { budgetId: string; thresholds: CreateThresholdInput[] }) =>
      apiClient.post<BudgetThreshold[]>(`/budgets/${budgetId}/thresholds`, { thresholds }),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", budgetId, "thresholds"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", budgetId] });
    },
  });
}

export function useDeleteThreshold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, thresholdId }: { budgetId: string; thresholdId: string }) =>
      apiClient.delete(`/budgets/${budgetId}/thresholds?threshold_id=${thresholdId}`),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", budgetId, "thresholds"] });
    },
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      budgetId,
      data,
      userId,
    }: {
      budgetId: string;
      data: CreateAdjustmentInput;
      userId: string;
    }) =>
      apiClient.post<BudgetAdjustment>(`/budgets/${budgetId}/adjustments`, {
        ...data,
        adjustment_type: data.adjustmentType,
        related_budget_id: data.relatedBudgetId,
        user_id: userId,
      }),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", budgetId, "adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useRecalculateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetId: string) =>
      apiClient.post<{ period: BudgetPeriodData; forecast: unknown }>(`/budgets/${budgetId}/periods`),
    onSuccess: (_, budgetId) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
