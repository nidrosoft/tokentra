"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Folder2, TickCircle, Wallet, Chart } from "iconsax-react";
import type { Project } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { ProjectList } from "./project-list";
import { CreateProjectDialog } from "./create-project-dialog";
import type { ProjectFormData } from "./project-form";
import { mockProjects, mockProjectsSummary, teamNameMap } from "@/data/mock-projects";

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

export const ProjectsOverview: FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = (data: ProjectFormData) => {
    setIsCreating(true);
    // Simulate API call
    setTimeout(() => {
      const newProject: Project = {
        id: `project_${Date.now()}`,
        organizationId: "org_1",
        name: data.name,
        description: data.description,
        teamId: data.teamId || undefined,
        tags: data.tags,
        apiKeyPatterns: data.apiKeyPatterns,
        monthlyBudget: data.monthlyBudget,
        currentMonthSpend: 0,
        status: data.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProjects((prev) => [newProject, ...prev]);
      setIsCreating(false);
      setIsCreateDialogOpen(false);
    }, 1000);
  };

  const handleView = (id: string) => {
    console.log("Viewing project:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Editing project:", id);
  };

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalSpend = projects.reduce((sum, p) => sum + p.currentMonthSpend, 0);
  const avgSpend = projects.length > 0 ? totalSpend / projects.length : 0;

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Projects
          </h1>
          <p className="text-md text-tertiary">
            Track AI spending by project and initiative.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md" iconLeading={AddIcon} onClick={() => setIsCreateDialogOpen(true)}>
            Create Project
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
              <Folder2 size={20} color="#7F56D9" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Total Projects</p>
              <p className="text-2xl font-semibold text-primary">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success-secondary">
              <TickCircle size={20} color="#17B26A" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Active Projects</p>
              <p className="text-2xl font-semibold text-primary">{activeProjects}</p>
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
              <p className="text-sm font-medium text-tertiary">Avg per Project</p>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(avgSpend)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <ProjectList
        projects={projects}
        teamNameMap={teamNameMap}
        onView={handleView}
        onEdit={handleEdit}
      />

      {/* Create Project Dialog */}
      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />
    </div>
  );
};
