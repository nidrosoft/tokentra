"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Trash, Building, Folder2, People } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { useTeams } from "@/hooks/use-teams";
import { useProjects } from "@/hooks/use-projects";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CostCenterAllocationsManagerProps {
  costCenterId: string;
  costCenterName: string;
}

type EntityType = "team" | "project" | "api_key";

interface Allocation {
  id: string;
  costCenterId: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  allocationPercentage: number;
  effectiveFrom: string;
  effectiveUntil?: string;
}

interface AllocationsResponse {
  success: boolean;
  data: Allocation[];
  error?: string;
}

const entityTypeLabels: Record<EntityType, string> = {
  team: "Team",
  project: "Project",
  api_key: "API Key",
};

const entityTypeColors: Record<EntityType, "brand" | "success" | "gray"> = {
  team: "brand",
  project: "success",
  api_key: "gray",
};

function useCostCenterAllocations(costCenterId: string) {
  return useQuery({
    queryKey: ["cost-centers", costCenterId, "allocations"],
    queryFn: async () => {
      const res = await fetch(`/api/v1/cost-centers/${costCenterId}/allocations`);
      const json: AllocationsResponse = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch allocations");
      return json.data;
    },
    enabled: !!costCenterId,
  });
}

function useAddAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      costCenterId,
      data,
    }: {
      costCenterId: string;
      data: {
        entity_type: EntityType;
        entity_id: string;
        allocation_percentage: number;
        effective_from?: string;
      };
    }) => {
      const res = await fetch(`/api/v1/cost-centers/${costCenterId}/allocations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to add allocation");
      return json.data;
    },
    onSuccess: (_, { costCenterId }) => {
      queryClient.invalidateQueries({ queryKey: ["cost-centers", costCenterId, "allocations"] });
    },
  });
}

function useRemoveAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ costCenterId, allocationId }: { costCenterId: string; allocationId: string }) => {
      const res = await fetch(`/api/v1/cost-centers/${costCenterId}/allocations?allocation_id=${allocationId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to remove allocation");
      return json;
    },
    onSuccess: (_, { costCenterId }) => {
      queryClient.invalidateQueries({ queryKey: ["cost-centers", costCenterId, "allocations"] });
    },
  });
}

export const CostCenterAllocationsManager: FC<CostCenterAllocationsManagerProps> = ({
  costCenterId,
  costCenterName,
}) => {
  const [entityType, setEntityType] = useState<EntityType>("team");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [allocationPercentage, setAllocationPercentage] = useState<string>("100");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: allocations, isLoading: isLoadingAllocations } = useCostCenterAllocations(costCenterId);
  const { data: teams } = useTeams();
  const { data: projects } = useProjects();
  const addAllocationMutation = useAddAllocation();
  const removeAllocationMutation = useRemoveAllocation();

  const allocatedEntityIds = new Set(allocations?.map((a) => a.entityId) || []);

  const availableEntities = entityType === "team"
    ? (teams?.filter((t) => !allocatedEntityIds.has(t.id)).map((t) => ({ id: t.id, name: t.name })) || [])
    : (projects?.filter((p) => !allocatedEntityIds.has(p.id)).map((p) => ({ id: p.id, name: p.name })) || []);

  const handleAddAllocation = async () => {
    if (!selectedEntityId || !allocationPercentage) return;

    try {
      await addAllocationMutation.mutateAsync({
        costCenterId,
        data: {
          entity_type: entityType,
          entity_id: selectedEntityId,
          allocation_percentage: parseFloat(allocationPercentage),
        },
      });
      setSelectedEntityId("");
      setAllocationPercentage("100");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add allocation:", error);
    }
  };

  const handleRemoveAllocation = async (allocationId: string) => {
    try {
      await removeAllocationMutation.mutateAsync({ costCenterId, allocationId });
    } catch (error) {
      console.error("Failed to remove allocation:", error);
    }
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case "team":
        return <People size={16} color="currentColor" variant="Bold" className="text-quaternary" />;
      case "project":
        return <Folder2 size={16} color="currentColor" variant="Bold" className="text-quaternary" />;
      default:
        return <Building size={16} color="currentColor" variant="Bold" className="text-quaternary" />;
    }
  };

  if (isLoadingAllocations) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-secondary">Cost Allocations</h3>
        <div className="flex items-center justify-center py-8">
          <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-secondary">Cost Allocations</h3>
        <span className="text-xs text-tertiary">
          {allocations?.length || 0} allocation{allocations?.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Allocations List */}
      {allocations && allocations.length > 0 ? (
        <div className="space-y-2">
          {allocations.map((allocation) => (
            <div
              key={allocation.id}
              className="flex items-center justify-between rounded-lg border border-secondary bg-secondary px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-tertiary">
                  {getEntityIcon(allocation.entityType)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-primary">{allocation.entityName}</span>
                  <span className="text-xs text-tertiary">
                    {entityTypeLabels[allocation.entityType]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge size="sm" color={entityTypeColors[allocation.entityType]}>
                  {allocation.allocationPercentage}%
                </Badge>
                <button
                  onClick={() => handleRemoveAllocation(allocation.id)}
                  disabled={removeAllocationMutation.isPending}
                  className="rounded p-1 text-tertiary transition-colors hover:bg-error-secondary hover:text-error-primary disabled:opacity-50"
                >
                  <Trash size={14} color="currentColor" variant="Outline" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-secondary bg-secondary_subtle py-6">
          <Building size={24} color="#98A2B3" variant="Bulk" />
          <p className="mt-2 text-sm text-tertiary">No allocations yet</p>
          <p className="text-xs text-quaternary">Allocate costs to teams or projects</p>
        </div>
      )}

      {/* Add Allocation Form */}
      {showAddForm ? (
        <div className="space-y-3 rounded-lg border border-secondary bg-secondary_subtle p-3">
          <Select
            label="Entity Type"
            selectedKey={entityType}
            onSelectionChange={(key) => {
              setEntityType(key as EntityType);
              setSelectedEntityId("");
            }}
          >
            <Select.Item key="team" id="team" label="Team" />
            <Select.Item key="project" id="project" label="Project" />
          </Select>
          <Select
            label={entityType === "team" ? "Team" : "Project"}
            selectedKey={selectedEntityId || null}
            onSelectionChange={(key) => setSelectedEntityId(key as string)}
            placeholder={`Select a ${entityType}`}
          >
            {availableEntities.map((entity) => (
              <Select.Item key={entity.id} id={entity.id} label={entity.name} />
            ))}
          </Select>
          <Input
            label="Allocation Percentage"
            type="number"
            value={allocationPercentage}
            onChange={(val) => setAllocationPercentage(val)}
            placeholder="e.g., 100"
            hint="Percentage of costs to allocate (0-100)"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              color="secondary"
              onClick={() => {
                setShowAddForm(false);
                setSelectedEntityId("");
                setAllocationPercentage("100");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddAllocation}
              isLoading={addAllocationMutation.isPending}
              isDisabled={!selectedEntityId || !allocationPercentage}
            >
              Add Allocation
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          color="secondary"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Add size={16} color="currentColor" />
          <span className="ml-1">Add Allocation</span>
        </Button>
      )}
    </div>
  );
};
