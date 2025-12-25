"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, People, Wallet, Chart } from "iconsax-react";
import type { Team } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { TeamList } from "./team-list";
import { CreateTeamDialog } from "./create-team-dialog";
import type { TeamFormData } from "./team-form";
import { mockTeams, mockTeamsSummary } from "@/data/mock-teams";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const TeamsOverview: FC = () => {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = (data: TeamFormData) => {
    setIsCreating(true);
    // Simulate API call
    setTimeout(() => {
      const newTeam: Team = {
        id: `team_${Date.now()}`,
        organizationId: "org_1",
        name: data.name,
        description: data.description,
        apiKeyPatterns: data.apiKeyPatterns,
        monthlyBudget: data.monthlyBudget,
        currentMonthSpend: 0,
        memberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTeams((prev) => [newTeam, ...prev]);
      setIsCreating(false);
      setIsCreateDialogOpen(false);
    }, 1000);
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
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
              <People size={20} color="#7F56D9" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Total Teams</p>
              <p className="text-2xl font-semibold text-primary">{teams.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success-secondary">
              <People size={20} color="#17B26A" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Total Members</p>
              <p className="text-2xl font-semibold text-primary">{totalMembers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning-secondary">
              <Wallet size={20} color="#F79009" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Total Spend</p>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(totalSpend)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
              <Chart size={20} color="#7F56D9" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Avg per Team</p>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(avgSpend)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <TeamList
        teams={teams}
        onView={handleView}
        onEdit={handleEdit}
      />

      {/* Create Team Dialog */}
      <CreateTeamDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />
    </div>
  );
};
