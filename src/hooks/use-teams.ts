"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { Team, TeamMember, TeamCostSummary } from "@/types";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => apiClient.get<Team[]>("/teams"),
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId],
    queryFn: () => apiClient.get<Team>(`/teams/${teamId}`),
    enabled: !!teamId,
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: () => apiClient.get<TeamMember[]>(`/teams/${teamId}/members`),
    enabled: !!teamId,
  });
}

export function useTeamCosts(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "costs"],
    queryFn: () => apiClient.get<TeamCostSummary>(`/teams/${teamId}/costs`),
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Team, "id" | "organizationId" | "createdAt" | "updatedAt" | "currentMonthSpend" | "memberCount">) =>
      apiClient.post<Team>("/teams", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: Partial<Team> }) =>
      apiClient.patch<Team>(`/teams/${teamId}`, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamId: string) => apiClient.delete(`/teams/${teamId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: { userId: string; role: string } }) =>
      apiClient.post(`/teams/${teamId}/members`, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
    },
  });
}
