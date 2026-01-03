"use client";

import type { FC } from "react";
import { useState } from "react";
import { Folder2, Wallet, Edit2, Eye, People } from "iconsax-react";
import type { Project } from "@/types";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ProjectViewSlideout } from "./project-view-slideout";
import { ProjectEditSlideout } from "./project-edit-slideout";
import { cx } from "@/utils/cx";

export interface ProjectCardProps {
  project: Project;
  teamName?: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ViewIcon = ({ className }: { className?: string }) => (
  <Eye size={16} color="currentColor" className={className} variant="Outline" />
);

const EditIcon = ({ className }: { className?: string }) => (
  <Edit2 size={16} color="currentColor" className={className} variant="Outline" />
);

export const ProjectCard: FC<ProjectCardProps> = ({
  project,
  teamName,
  onView,
  onEdit,
  className,
}) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const budgetUsage = project.monthlyBudget
    ? (project.currentMonthSpend / project.monthlyBudget) * 100
    : 0;

  const getBudgetStatus = () => {
    if (budgetUsage >= 100) return { color: "error" as const, label: "Over Budget" };
    if (budgetUsage >= 80) return { color: "warning" as const, label: "Near Limit" };
    return { color: "success" as const, label: "On Track" };
  };

  const handleView = () => {
    setIsViewOpen(true);
    onView?.(project.id);
  };

  const handleEdit = () => {
    setIsEditOpen(true);
    onEdit?.(project.id);
  };

  const budgetStatus = getBudgetStatus();
  const isArchived = project.status === "archived";

  return (
    <>
    <div
      className={cx(
        "flex flex-col rounded-xl border border-secondary bg-primary p-5 shadow-xs transition-shadow hover:shadow-md",
        isArchived && "opacity-60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Folder2 size={18} color="#7F56D9" variant="Bold" />
            <h3 className="truncate text-lg font-semibold text-primary">{project.name}</h3>
          </div>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-tertiary">{project.description}</p>
          )}
        </div>
        <Badge size="sm" color={isArchived ? "gray" : budgetStatus.color}>
          {isArchived ? "Archived" : budgetStatus.label}
        </Badge>
      </div>

      {/* Team & Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {teamName && (
          <div className="flex items-center gap-1 text-xs text-tertiary">
            <People size={14} color="currentColor" variant="Outline" />
            <span>{teamName}</span>
          </div>
        )}
        {project.tags?.slice(0, 3).map((tag) => (
          <Badge key={tag} size="sm" color="gray">
            {tag}
          </Badge>
        ))}
        {project.tags && project.tags.length > 3 && (
          <span className="text-xs text-quaternary">+{project.tags.length - 3}</span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-success-secondary">
          <Wallet size={16} color="#17B26A" variant="Bold" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">{formatCurrency(project.currentMonthSpend)}</p>
          <p className="text-xs text-tertiary">This Month</p>
        </div>
      </div>

      {/* Budget Progress */}
      {project.monthlyBudget && !isArchived && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-tertiary">Budget Usage</span>
            <span className="font-medium text-secondary">
              {formatCurrency(project.currentMonthSpend)} / {formatCurrency(project.monthlyBudget)}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-tertiary">
            <div
              className={cx(
                "h-full rounded-full transition-all",
                budgetUsage >= 100 ? "bg-error-solid" :
                budgetUsage >= 80 ? "bg-warning-solid" : "bg-success-solid"
              )}
              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2 border-t border-secondary pt-4">
        <Button
          size="sm"
          color="secondary"
          iconLeading={ViewIcon}
          onClick={handleView}
          className="flex-1"
        >
          View
        </Button>
        <Button
          size="sm"
          color="tertiary"
          iconLeading={EditIcon}
          onClick={handleEdit}
        >
          Edit
        </Button>
      </div>
    </div>

    {/* View Slideout */}
    <ProjectViewSlideout
      isOpen={isViewOpen}
      onOpenChange={setIsViewOpen}
      project={project}
      teamName={teamName}
      onEdit={() => {
        setIsViewOpen(false);
        setIsEditOpen(true);
      }}
    />

    {/* Edit Slideout */}
    <ProjectEditSlideout
      isOpen={isEditOpen}
      onOpenChange={setIsEditOpen}
      project={project}
      teamName={teamName}
      onSave={(projectId, updates) => {
        // TODO: Implement project update API call
      }}
      onDelete={(projectId) => {
        // TODO: Implement project delete API call
      }}
    />
    </>
  );
};
