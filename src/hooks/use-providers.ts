"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { 
  ProviderType, 
  ConnectionStatus,
  ConnectionSettings,
  ProviderSyncSummary,
  ConnectionHealth,
  SyncHistoryRecord,
} from "@/lib/provider-sync/types";

// Provider connection response type
export interface ProviderConnection {
  id: string;
  organizationId: string;
  provider: ProviderType;
  status: ConnectionStatus;
  displayName?: string;
  settings: ConnectionSettings;
  lastSyncAt?: string;
  lastSyncRecords?: number;
  lastSyncDurationMs?: number;
  lastError?: string;
  lastErrorAt?: string;
  consecutiveFailures: number;
  providerMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  health?: ConnectionHealth;
  syncHistory?: SyncHistoryRecord[];
}

// API response types
interface ProvidersResponse {
  success: boolean;
  data: ProviderConnection[];
  summary: ProviderSyncSummary;
}

interface ProviderResponse {
  success: boolean;
  data: ProviderConnection;
}

interface SyncResponse {
  success: boolean;
  data: {
    syncId: string;
    connectionId: string;
    status: string;
    recordsFetched?: number;
    recordsCreated?: number;
    recordsUpdated?: number;
    totalCostSynced?: number;
    totalTokensSynced?: number;
    durationMs: number;
  };
}

interface TestConnectionResponse {
  success: boolean;
  data: {
    success: boolean;
    latencyMs: number;
    error?: string;
    errorCode?: string;
    permissions: string[];
    metadata?: Record<string, unknown>;
  };
}

/**
 * Fetch all provider connections for an organization
 */
export function useProviders(organizationId: string) {
  return useQuery({
    queryKey: ["providers", organizationId],
    queryFn: async () => {
      const response = await apiClient.get<ProvidersResponse>(
        `/providers?organization_id=${organizationId}`
      );
      return response;
    },
    enabled: !!organizationId,
  });
}

/**
 * Fetch a single provider connection with health and sync history
 */
export function useProvider(providerId: string) {
  return useQuery({
    queryKey: ["providers", "detail", providerId],
    queryFn: () => apiClient.get<ProviderResponse>(`/providers/${providerId}`),
    enabled: !!providerId,
  });
}

/**
 * Fetch provider health status
 */
export function useProviderHealth(providerId: string) {
  return useQuery({
    queryKey: ["providers", "health", providerId],
    queryFn: () => apiClient.get<{ success: boolean; data: ConnectionHealth }>(
      `/providers/${providerId}/health`
    ),
    enabled: !!providerId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Fetch provider sync history
 */
export function useProviderSyncHistory(providerId: string, limit = 20) {
  return useQuery({
    queryKey: ["providers", "sync-history", providerId],
    queryFn: () => apiClient.get<{ success: boolean; data: SyncHistoryRecord[] }>(
      `/providers/${providerId}/sync?limit=${limit}`
    ),
    enabled: !!providerId,
  });
}

/**
 * Create a new provider connection
 */
export function useConnectProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      organization_id: string;
      provider: ProviderType;
      credentials: Record<string, unknown>;
      display_name?: string;
      settings?: Partial<ConnectionSettings>;
    }) => apiClient.post<ProviderResponse>("/providers", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["providers", variables.organization_id] });
    },
  });
}

/**
 * Test provider credentials without creating a connection
 */
export function useTestConnection() {
  return useMutation({
    mutationFn: (data: {
      provider: ProviderType;
      credentials: Record<string, unknown>;
    }) => apiClient.post<TestConnectionResponse>("/providers/test", data),
  });
}

/**
 * Update provider connection settings
 */
export function useUpdateProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      providerId, 
      data 
    }: { 
      providerId: string; 
      data: {
        display_name?: string;
        settings?: Partial<ConnectionSettings>;
        credentials?: Record<string, unknown>;
      };
    }) => apiClient.patch<ProviderResponse>(`/providers/${providerId}`, data),
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: ["providers", "detail", providerId] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

/**
 * Delete a provider connection
 */
export function useDisconnectProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (providerId: string) =>
      apiClient.delete(`/providers/${providerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
    },
  });
}

/**
 * Trigger a sync for a single provider
 */
export function useSyncProvider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      providerId, 
      options 
    }: { 
      providerId: string; 
      options?: {
        backfill?: boolean;
        start_date?: string;
        end_date?: string;
      };
    }) => apiClient.post<SyncResponse>(`/providers/${providerId}/sync`, options || {}),
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: ["providers", "detail", providerId] });
      queryClient.invalidateQueries({ queryKey: ["providers", "sync-history", providerId] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["costs"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
  });
}

/**
 * Sync all providers for an organization
 */
export function useSyncAllProviders() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (organizationId: string) =>
      apiClient.post<{
        success: boolean;
        data: {
          total: number;
          successful: number;
          failed: number;
          results: Array<{
            syncId: string;
            connectionId: string;
            status: string;
            recordsCreated?: number;
            recordsUpdated?: number;
            durationMs: number;
            error?: string;
          }>;
        };
      }>("/providers/sync-all", { organization_id: organizationId }),
    onSuccess: (_, organizationId) => {
      queryClient.invalidateQueries({ queryKey: ["providers", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["costs"] });
      queryClient.invalidateQueries({ queryKey: ["usage"] });
    },
  });
}
