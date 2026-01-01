"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CostCenter,
  CostCenterHierarchy,
  CreateCostCenterInput,
  UpdateCostCenterInput,
} from "@/lib/organization/types";

const DEMO_ORG_ID = process.env.NEXT_PUBLIC_DEMO_ORG_ID || "b1c2d3e4-f5a6-7890-bcde-f12345678901";

interface CostCentersResponse {
  success: boolean;
  data: CostCenter[] | CostCenterHierarchy[];
  error?: string;
}

interface CostCenterResponse {
  success: boolean;
  data: CostCenter;
  error?: string;
}

export function useCostCenters(params?: {
  organizationId?: string;
  includeHierarchy?: boolean;
}) {
  const orgId = params?.organizationId || DEMO_ORG_ID;
  const hierarchy = params?.includeHierarchy ? "true" : "false";

  return useQuery({
    queryKey: ["cost-centers", orgId, { hierarchy }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        organization_id: orgId,
        hierarchy,
      });

      const res = await fetch(`/api/v1/cost-centers?${searchParams}`);
      const json: CostCentersResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch cost centers");
      return json.data;
    },
  });
}

export function useCostCenter(costCenterId: string) {
  return useQuery({
    queryKey: ["cost-centers", "detail", costCenterId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/cost-centers/${costCenterId}`);
      const json: CostCenterResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch cost center");
      return json.data;
    },
    enabled: !!costCenterId,
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCostCenterInput & { organization_id?: string }) => {
      const orgId = input.organization_id || DEMO_ORG_ID;
      const res = await fetch("/api/v1/cost-centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, organization_id: orgId }),
      });
      const json: CostCenterResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create cost center");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-centers"] });
    },
  });
}

export function useUpdateCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      costCenterId,
      data,
    }: {
      costCenterId: string;
      data: UpdateCostCenterInput;
    }) => {
      const res = await fetch(`/api/v1/cost-centers/${costCenterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: CostCenterResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update cost center");
      return json.data;
    },
    onSuccess: (_, { costCenterId }) => {
      queryClient.invalidateQueries({ queryKey: ["cost-centers", "detail", costCenterId] });
      queryClient.invalidateQueries({ queryKey: ["cost-centers"] });
    },
  });
}

export function useDeleteCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (costCenterId: string) => {
      const res = await fetch(`/api/v1/cost-centers/${costCenterId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete cost center");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cost-centers"] });
    },
  });
}
