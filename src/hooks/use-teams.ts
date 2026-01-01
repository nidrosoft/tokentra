"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TeamSummary,
  TeamMember,
  CreateTeamInput,
  UpdateTeamInput,
  TeamRole,
} from "@/lib/organization/types";

const DEMO_ORG_ID = process.env.NEXT_PUBLIC_DEMO_ORG_ID || "b1c2d3e4-f5a6-7890-bcde-f12345678901";

interface TeamsResponse {
  success: boolean;
  data: TeamSummary[];
  error?: string;
}

interface TeamResponse {
  success: boolean;
  data: TeamSummary;
  error?: string;
}

interface TeamMembersResponse {
  success: boolean;
  data: TeamMember[];
  error?: string;
}

export function useTeams(organizationId?: string) {
  const orgId = organizationId || DEMO_ORG_ID;

  return useQuery({
    queryKey: ["teams", orgId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/teams?organization_id=${orgId}`);
      const json: TeamsResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch teams");
      return json.data;
    },
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ["teams", "detail", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/teams/${teamId}`);
      const json: TeamResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch team");
      return json.data;
    },
    enabled: !!teamId,
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ["teams", teamId, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/v1/teams/${teamId}/members`);
      const json: TeamMembersResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch members");
      return json.data;
    },
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTeamInput & { organization_id?: string }) => {
      const orgId = input.organization_id || DEMO_ORG_ID;
      const res = await fetch("/api/v1/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, organization_id: orgId }),
      });
      const json: TeamResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create team");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: UpdateTeamInput }) => {
      const res = await fetch(`/api/v1/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: TeamResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update team");
      return json.data;
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const res = await fetch(`/api/v1/teams/${teamId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete team");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      data,
    }: {
      teamId: string;
      data: { user_id: string; role?: TeamRole };
    }) => {
      const res = await fetch(`/api/v1/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to add member");
      return json.data;
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const res = await fetch(`/api/v1/teams/${teamId}/members?user_id=${userId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to remove member");
      return json;
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "members"] });
    },
  });
}
