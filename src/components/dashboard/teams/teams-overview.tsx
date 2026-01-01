"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import { Add, People } from "iconsax-react";
import type { Team } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { TeamList } from "./team-list";
import { CreateTeamDialog } from "./create-team-dialog";
import type { TeamFormData } from "./team-form";
import { useTeams, useCreateTeam } from "@/hooks/use-teams";
import type { TeamSummary } from "@/lib/organization/types";
import { EmptyState } from "../shared/empty-state";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

const TeamIcon = () => (
  <People size={32} color="#7F56D9" variant="Bulk" />
);

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Convert API TeamSummary to legacy Team type for UI compatibility
function convertToLegacyTeam(team: TeamSummary): Team {
  return {
    id: team.id,
    organizationId: team.orgId,
    name: team.name,
    description: team.description,
    apiKeyPatterns: [],
    monthlyBudget: team.monthlySpend || 0,
    currentMonthSpend: team.monthlySpend || 0,
    memberCount: team.memberCount || 0,
    createdAt: new Date(team.createdAt),
    updatedAt: new Date(team.updatedAt),
  };
}

export const TeamsOverview: FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch teams from API
  const { data: teamsData, isLoading: isLoadingTeams } = useTeams();
  const createTeamMutation = useCreateTeam();

  // Convert API response to legacy format
  const teams: Team[] = useMemo(() => {
    if (teamsData && teamsData.length > 0) {
      return teamsData.map(convertToLegacyTeam);
    }
    return [];
  }, [teamsData]);

  const isEmpty = !isLoadingTeams && teams.length === 0;

  const handleCreateSubmit = async (data: TeamFormData) => {
    try {
      await createTeamMutation.mutateAsync({
        name: data.name,
        description: data.description,
        settings: {
          spendingLimitEnabled: data.monthlyBudget > 0,
        },
        metadata: {
          apiKeyPatterns: data.apiKeyPatterns,
          monthlyBudget: data.monthlyBudget,
        },
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const handleView = (id: string) => {
    console.log("Viewing team:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Editing team:", id);
  };

  const totalMembers = teams.reduce((sum, t) => sum + t.memberCount, 0);
  const totalSpend = teams.reduce((sum, t) => sum + t.currentMonthSpend, 0);
  const avgSpend = teams.length > 0 ? totalSpend / teams.length : 0;

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Teams
          </h1>
          <p className="text-md text-tertiary">
            Manage teams and track their AI spending.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md" iconLeading={AddIcon} onClick={() => setIsCreateDialogOpen(true)}>
            Create Team
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsChart04
          title={String(teams.length)}
          subtitle="Total Teams"
          change="+2"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }, { value: 8 }]}
          actions={false}
        />
        <MetricsChart04
          title={String(totalMembers)}
          subtitle="Total Members"
          change="+12"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 20 }, { value: 25 }, { value: 28 }, { value: 32 }, { value: 38 }, { value: 45 }]}
          actions={false}
        />
        <MetricsChart04
          title={formatCurrency(totalSpend)}
          subtitle="Total Spend"
          change="+8.5%"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 8 }, { value: 10 }, { value: 12 }, { value: 14 }, { value: 16 }, { value: 18 }]}
          actions={false}
        />
        <MetricsChart04
          title={formatCurrency(avgSpend)}
          subtitle="Avg per Team"
          change="-2.1%"
          changeTrend="negative"
          chartColor="text-fg-error-secondary"
          chartData={[{ value: 15 }, { value: 14 }, { value: 13 }, { value: 12 }, { value: 11 }, { value: 10 }]}
          actions={false}
        />
      </div>

      {/* Teams List or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={<TeamIcon />}
          title="No teams yet"
          description="Create your first team to organize members and track AI spending across your organization."
          actionLabel="Create Team"
          onAction={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <TeamList
          teams={teams}
          onView={handleView}
          onEdit={handleEdit}
        />
      )}

      {/* Create Team Dialog */}
      <CreateTeamDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createTeamMutation.isPending}
      />
    </div>
  );
};
