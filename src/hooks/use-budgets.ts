"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Budget, BudgetProgress } from "@/types";

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiClient.get<Budget[]>("/budgets"),
  });
}

export function useBudget(budgetId: string) {
  return useQuery({
    queryKey: ["budgets", budgetId],
    queryFn: () => apiClient.get<Budget>(`/budgets/${budgetId}`),
    enabled: !!budgetId,
  });
}

export function useBudgetStatus(budgetId: string) {
  return useQuery({
    queryKey: ["budgets", budgetId, "status"],
    queryFn: () => apiClient.get<BudgetProgress>(`/budgets/${budgetId}/status`),
    enabled: !!budgetId,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Budget, "id" | "createdAt" | "updatedAt" | "currentSpend" | "status">) =>
      apiClient.post<Budget>("/budgets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ budgetId, data }: { budgetId: string; data: Partial<Budget> }) =>
      apiClient.patch<Budget>(`/budgets/${budgetId}`, data),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (budgetId: string) => apiClient.delete(`/budgets/${budgetId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
