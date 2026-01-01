"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import { Add, Folder2 } from "iconsax-react";
import type { Project } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { ProjectList } from "./project-list";
import { CreateProjectDialog } from "./create-project-dialog";
import type { ProjectFormData } from "./project-form";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import type { ProjectSummary } from "@/lib/organization/types";
import { EmptyState } from "../shared/empty-state";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

const ProjectIcon = () => (
  <Folder2 size={32} color="#7F56D9" variant="Bulk" />
);

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Convert API ProjectSummary to legacy Project type for UI compatibility
function convertToLegacyProject(project: ProjectSummary): Project {
  return {
    id: project.id,
    organizationId: project.orgId,
    name: project.name,
    description: project.description,
    teamId: project.ownerTeamId,
    tags: project.tags || [],
    apiKeyPatterns: [],
    monthlyBudget: project.monthlySpend || 0,
    currentMonthSpend: project.monthlySpend || 0,
    status: project.status as "active" | "archived",
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  };
}

export const ProjectsOverview: FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch projects from API
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const createProjectMutation = useCreateProject();

  // Convert API response to legacy format
  const projects: Project[] = useMemo(() => {
    if (projectsData && projectsData.length > 0) {
      return projectsData.map(convertToLegacyProject);
    }
    return [];
  }, [projectsData]);

  const isEmpty = !isLoadingProjects && projects.length === 0;

  // Build team name map from project data
  const teamNameMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    if (projectsData) {
      projectsData.forEach((p) => {
        if (p.ownerTeamId && p.ownerTeamName) {
          map[p.ownerTeamId] = p.ownerTeamName;
        }
      });
    }
    return map;
  }, [projectsData]);

  const handleCreateSubmit = async (data: ProjectFormData) => {
    try {
      await createProjectMutation.mutateAsync({
        name: data.name,
        description: data.description,
        ownerTeamId: data.teamId || undefined,
        tags: data.tags,
        category: "product",
        settings: {
          budgetAlertThreshold: data.monthlyBudget,
        },
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
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
        <MetricsChart04
          title={String(projects.length)}
          subtitle="Total Projects"
          change="+3"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 5 }, { value: 7 }, { value: 8 }, { value: 10 }, { value: 11 }, { value: 12 }]}
          actions={false}
        />
        <MetricsChart04
          title={String(activeProjects)}
          subtitle="Active Projects"
          change="+2"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }, { value: 8 }, { value: 9 }]}
          actions={false}
        />
        <MetricsChart04
          title={formatCurrency(totalSpend)}
          subtitle="Total Spend"
          change="+11.2%"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 10 }, { value: 12 }, { value: 15 }, { value: 18 }, { value: 20 }, { value: 22 }]}
          actions={false}
        />
        <MetricsChart04
          title={formatCurrency(avgSpend)}
          subtitle="Avg per Project"
          change="-1.8%"
          changeTrend="negative"
          chartColor="text-fg-error-secondary"
          chartData={[{ value: 12 }, { value: 11 }, { value: 10 }, { value: 9 }, { value: 8 }, { value: 7 }]}
          actions={false}
        />
      </div>

      {/* Projects List or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={<ProjectIcon />}
          title="No projects yet"
          description="Create your first project to track AI spending by initiative, product, or experiment."
          actionLabel="Create Project"
          onAction={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <ProjectList
          projects={projects}
          teamNameMap={teamNameMap}
          onView={handleView}
          onEdit={handleEdit}
        />
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createProjectMutation.isPending}
      />
    </div>
  );
};
