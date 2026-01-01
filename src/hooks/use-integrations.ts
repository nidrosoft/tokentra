"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Integration {
  id: string;
  orgId: string;
  integrationType: string;
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
  status: "active" | "error" | "pending";
  lastUsedAt?: string;
  errorMessage?: string;
  connectedBy?: string;
  connectedAt: string;
  updatedAt: string;
}

export interface CreateIntegrationRequest {
  integrationType: string;
  name: string;
  config?: Record<string, unknown>;
}

const INTEGRATIONS_KEY = "integrations";

async function fetchIntegrations(): Promise<Integration[]> {
  const response = await fetch("/api/v1/settings/integrations");
  if (!response.ok) {
    throw new Error("Failed to fetch integrations");
  }
  return response.json();
}

async function createIntegration(request: CreateIntegrationRequest): Promise<Integration> {
  const response = await fetch("/api/v1/settings/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create integration");
  }
  return response.json();
}

async function deleteIntegration(integrationId: string): Promise<void> {
  const response = await fetch(`/api/v1/settings/integrations?id=${integrationId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete integration");
  }
}

export function useIntegrations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [INTEGRATIONS_KEY],
    queryFn: fetchIntegrations,
    staleTime: 60 * 1000, // 1 minute
  });

  const createMutation = useMutation({
    mutationFn: createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INTEGRATIONS_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INTEGRATIONS_KEY] });
    },
  });

  return {
    integrations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createIntegration: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteIntegration: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    refetch: query.refetch,
  };
}
