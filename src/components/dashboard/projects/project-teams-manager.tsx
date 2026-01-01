"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Trash, People } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { Badge } from "@/components/base/badges/badges";
import { useTeams } from "@/hooks/use-teams";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjectAccessLevel } from "@/lib/organization/types";

interface ProjectTeamsManagerProps {
  projectId: string;
  projectName: string;
}

interface ProjectTeam {
  id: string;
  teamId: string;
  teamName: string;
  accessLevel: ProjectAccessLevel;
  addedAt: string;
}

interface ProjectTeamsResponse {
  success: boolean;
  data: ProjectTeam[];
  error?: string;
}

const accessLevelColors: Record<ProjectAccessLevel, "brand" | "success" | "gray"> = {
  owner: "brand",
  contributor: "success",
  viewer: "gray",
};

const accessLevelLabels: Record<ProjectAccessLevel, string> = {
  owner: "Owner",
  contributor: "Contributor",
  viewer: "Viewer",
};

function useProjectTeams(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "teams"],
    queryFn: async () => {
      const res = await fetch(`/api/v1/projects/${projectId}/teams`);
      const json: ProjectTeamsResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch project teams");
      return json.data;
    },
    enabled: !!projectId,
  });
}

function useAddProjectTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      data,
    }: {
      projectId: string;
      data: { team_id: string; access_level?: ProjectAccessLevel };
    }) => {
      const res = await fetch(`/api/v1/projects/${projectId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to add team");
      return json.data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "teams"] });
    },
  });
}

function useRemoveProjectTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, teamId }: { projectId: string; teamId: string }) => {
      const res = await fetch(`/api/v1/projects/${projectId}/teams?team_id=${teamId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to remove team");
      return json;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "teams"] });
    },
  });
}

export const ProjectTeamsManager: FC<ProjectTeamsManagerProps> = ({
  projectId,
  projectName,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<ProjectAccessLevel>("contributor");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: projectTeams, isLoading: isLoadingProjectTeams } = useProjectTeams(projectId);
  const { data: allTeams, isLoading: isLoadingTeams } = useTeams();
  const addTeamMutation = useAddProjectTeam();
  const removeTeamMutation = useRemoveProjectTeam();

  const assignedTeamIds = new Set(projectTeams?.map((pt) => pt.teamId) || []);
  const availableTeams = allTeams?.filter((t) => !assignedTeamIds.has(t.id)) || [];

  const handleAddTeam = async () => {
    if (!selectedTeamId) return;

    try {
      await addTeamMutation.mutateAsync({
        projectId,
        data: { team_id: selectedTeamId, access_level: selectedAccessLevel },
      });
      setSelectedTeamId("");
      setSelectedAccessLevel("contributor");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add team:", error);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    try {
      await removeTeamMutation.mutateAsync({ projectId, teamId });
    } catch (error) {
      console.error("Failed to remove team:", error);
    }
  };

  const isLoading = isLoadingProjectTeams || isLoadingTeams;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-secondary">Assigned Teams</h3>
        <div className="flex items-center justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-secondary">Assigned Teams</h3>
        <span className="text-xs text-tertiary">
          {projectTeams?.length || 0} team{projectTeams?.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Teams List */}
      {projectTeams && projectTeams.length > 0 ? (
        <div className="space-y-2">
          {projectTeams.map((pt) => (
            <div
              key={pt.id}
              className="flex items-center justify-between rounded-lg border border-secondary bg-secondary px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-tertiary">
                  <People size={16} color="currentColor" variant="Bold" className="text-quaternary" />
                </div>
                <span className="text-sm font-medium text-primary">{pt.teamName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge size="sm" color={accessLevelColors[pt.accessLevel]}>
                  {accessLevelLabels[pt.accessLevel]}
                </Badge>
                {pt.accessLevel !== "owner" && (
                  <button
                    onClick={() => handleRemoveTeam(pt.teamId)}
                    disabled={removeTeamMutation.isPending}
                    className="rounded p-1 text-tertiary transition-colors hover:bg-error-secondary hover:text-error-primary disabled:opacity-50"
                  >
                    <Trash size={14} color="currentColor" variant="Outline" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-secondary bg-secondary_subtle py-6">
          <People size={24} color="#98A2B3" variant="Bulk" />
          <p className="mt-2 text-sm text-tertiary">No teams assigned</p>
          <p className="text-xs text-quaternary">Add teams to collaborate on this project</p>
        </div>
      )}

      {/* Add Team Form */}
      {showAddForm ? (
        <div className="space-y-3 rounded-lg border border-secondary bg-secondary_subtle p-3">
          <Select
            label="Team"
            selectedKey={selectedTeamId || null}
            onSelectionChange={(key) => setSelectedTeamId(key as string)}
            placeholder="Select a team"
          >
            {availableTeams.map((team) => (
              <Select.Item key={team.id} id={team.id} label={team.name} />
            ))}
          </Select>
          <Select
            label="Access Level"
            selectedKey={selectedAccessLevel}
            onSelectionChange={(key) => setSelectedAccessLevel(key as ProjectAccessLevel)}
          >
            <Select.Item key="viewer" id="viewer" label="Viewer - Can view project data" />
            <Select.Item key="contributor" id="contributor" label="Contributor - Can use and modify" />
            <Select.Item key="owner" id="owner" label="Owner - Full control" />
          </Select>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="secondary"
              onClick={() => {
                setShowAddForm(false);
                setSelectedTeamId("");
                setSelectedAccessLevel("contributor");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddTeam}
              isLoading={addTeamMutation.isPending}
              isDisabled={!selectedTeamId}
            >
              Add Team
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          color="secondary"
          onClick={() => setShowAddForm(true)}
          className="w-full"
          isDisabled={availableTeams.length === 0}
        >
          <Add size={16} color="currentColor" />
          <span className="ml-1">
            {availableTeams.length === 0 ? "No teams available" : "Add Team"}
          </span>
        </Button>
      )}
    </div>
  );
};
