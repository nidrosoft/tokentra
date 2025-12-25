"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Alert, AlertEvent } from "@/types";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiClient.get<Alert[]>("/alerts"),
  });
}

export function useAlert(alertId: string) {
  return useQuery({
    queryKey: ["alerts", alertId],
    queryFn: () => apiClient.get<Alert>(`/alerts/${alertId}`),
    enabled: !!alertId,
  });
}

export function useAlertHistory(params?: { limit?: number }) {
  return useQuery({
    queryKey: ["alerts", "history", params],
    queryFn: () => apiClient.get<AlertEvent[]>("/alerts/history", { params: params as Record<string, string> }),
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Alert, "id" | "organizationId" | "createdAt" | "updatedAt">) =>
      apiClient.post<Alert>("/alerts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ alertId, data }: { alertId: string; data: Partial<Alert> }) =>
      apiClient.patch<Alert>(`/alerts/${alertId}`, data),
    onSuccess: (_, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: ["alerts", alertId] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId: string) => apiClient.delete(`/alerts/${alertId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useToggleAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ alertId, enabled }: { alertId: string; enabled: boolean }) =>
      apiClient.post(`/alerts/${alertId}/${enabled ? "enable" : "disable"}`),
    onSuccess: (_, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: ["alerts", alertId] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
