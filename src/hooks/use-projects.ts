"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ProjectSummary,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/organization/types";

const DEMO_ORG_ID = process.env.NEXT_PUBLIC_DEMO_ORG_ID || "b1c2d3e4-f5a6-7890-bcde-f12345678901";

interface ProjectsResponse {
  success: boolean;
  data: ProjectSummary[];
  error?: string;
}

interface ProjectResponse {
  success: boolean;
  data: ProjectSummary;
  error?: string;
}

export function useProjects(params?: {
  organizationId?: string;
  teamId?: string;
  status?: string;
  category?: string;
}) {
  const orgId = params?.organizationId || DEMO_ORG_ID;

  return useQuery({
    queryKey: ["projects", orgId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({ organization_id: orgId });
      if (params?.teamId) searchParams.set("team_id", params.teamId);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.category) searchParams.set("category", params.category);

      const res = await fetch(`/api/v1/projects?${searchParams}`);
      const json: ProjectsResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch projects");
      return json.data;
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["projects", "detail", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/projects/${projectId}`);
      const json: ProjectResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch project");
      return json.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput & { organization_id?: string }) => {
      const orgId = input.organization_id || DEMO_ORG_ID;
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, organization_id: orgId }),
      });
      const json: ProjectResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create project");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: UpdateProjectInput }) => {
      const res = await fetch(`/api/v1/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ProjectResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update project");
      return json.data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", "detail", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/v1/projects/${projectId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete project");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
