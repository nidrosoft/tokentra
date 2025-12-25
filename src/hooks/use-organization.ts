"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useOrganization(orgId?: string) {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => apiClient.get(`/organizations/${orgId}`),
    enabled: !!orgId,
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => apiClient.get("/organizations"),
  });
}
