"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ApiKey {
  id: string;
  orgId: string;
  userId?: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  environment: string;
  expiresAt?: string;
  lastUsedAt?: string;
  revoked: boolean;
  revokedAt?: string;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes?: string[];
  expiresAt?: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  secretKey: string;
}

const API_KEYS_KEY = "api-keys";

async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await fetch("/api/v1/settings/api-keys");
  if (!response.ok) {
    throw new Error("Failed to fetch API keys");
  }
  return response.json();
}

async function createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
  const response = await fetch("/api/v1/settings/api-keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create API key");
  }
  return response.json();
}

async function revokeApiKey(keyId: string): Promise<void> {
  const response = await fetch(`/api/v1/settings/api-keys?id=${keyId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to revoke API key");
  }
}

export function useApiKeys() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [API_KEYS_KEY],
    queryFn: fetchApiKeys,
    staleTime: 60 * 1000, // 1 minute
  });

  const createMutation = useMutation({
    mutationFn: createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_KEYS_KEY] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_KEYS_KEY] });
    },
  });

  return {
    apiKeys: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createApiKey: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    revokeApiKey: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
    refetch: query.refetch,
  };
}
