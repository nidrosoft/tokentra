"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Provider, ProviderSyncResult } from "@/types";

export function useProviders() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: () => apiClient.get<Provider[]>("/providers"),
  });
}

export function useProvider(providerId: string) {
  return useQuery({
    queryKey: ["providers", providerId],
    queryFn: () => apiClient.get<Provider>(`/providers/${providerId}`),
    enabled: !!providerId,
  });
}

export function useConnectProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { type: string; apiKey: string; organizationId?: string }) =>
      apiClient.post<Provider>("/providers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useDisconnectProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (providerId: string) =>
      apiClient.post(`/providers/${providerId}/disconnect`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

export function useSyncProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (providerId: string) =>
      apiClient.post<ProviderSyncResult>(`/providers/${providerId}/sync`),
    onSuccess: (_, providerId) => {
      queryClient.invalidateQueries({ queryKey: ["providers", providerId] });
      queryClient.invalidateQueries({ queryKey: ["costs"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ providerId, data }: { providerId: string; data: Partial<Provider> }) =>
      apiClient.patch<Provider>(`/providers/${providerId}`, data),
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: ["providers", providerId] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}
