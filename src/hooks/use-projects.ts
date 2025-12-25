"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Project, ProjectCostSummary } from "@/types";

export function useProjects(params?: { teamId?: string; status?: string }) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => apiClient.get<Project[]>("/projects", { params: params as Record<string, string> }),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => apiClient.get<Project>(`/projects/${projectId}`),
    enabled: !!projectId,
  });
}

export function useProjectCosts(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "costs"],
    queryFn: () => apiClient.get<ProjectCostSummary>(`/projects/${projectId}/costs`),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Project, "id" | "organizationId" | "createdAt" | "updatedAt" | "currentMonthSpend" | "status">) =>
      apiClient.post<Project>("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<Project> }) =>
      apiClient.patch<Project>(`/projects/${projectId}`, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => apiClient.delete(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
