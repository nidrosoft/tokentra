"use client";

import type { FC } from "react";
import { useState } from "react";
import { People, Wallet, Edit2, Eye } from "iconsax-react";
import type { Team } from "@/types";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { TeamViewSlideout } from "./team-view-slideout";
import { TeamEditSlideout } from "./team-edit-slideout";
import { cx } from "@/utils/cx";

export interface TeamCardProps {
  team: Team;
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

export const TeamCard: FC<TeamCardProps> = ({
  team,
  onView,
  onEdit,
  className,
}) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const budgetUsage = team.monthlyBudget
    ? (team.currentMonthSpend / team.monthlyBudget) * 100
    : 0;

  const getBudgetStatus = () => {
    if (budgetUsage >= 100) return { color: "error" as const, label: "Over Budget" };
    if (budgetUsage >= 80) return { color: "warning" as const, label: "Near Limit" };
    return { color: "success" as const, label: "On Track" };
  };

  const handleView = () => {
    setIsViewOpen(true);
    onView?.(team.id);
  };

  const handleEdit = () => {
    setIsEditOpen(true);
    onEdit?.(team.id);
  };

  const status = getBudgetStatus();

  return (
    <>
    <div
      className={cx(
        "flex flex-col rounded-xl border border-secondary bg-primary p-5 shadow-xs transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-primary">{team.name}</h3>
          {team.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-tertiary">{team.description}</p>
          )}
        </div>
        <Badge size="sm" color={status.color}>
          {status.label}
        </Badge>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-secondary">
            <People size={16} color="#7F56D9" variant="Bold" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{team.memberCount}</p>
            <p className="text-xs text-tertiary">Members</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-success-secondary">
            <Wallet size={16} color="#17B26A" variant="Bold" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{formatCurrency(team.currentMonthSpend)}</p>
            <p className="text-xs text-tertiary">This Month</p>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      {team.monthlyBudget && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-tertiary">Budget Usage</span>
            <span className="font-medium text-secondary">
              {formatCurrency(team.currentMonthSpend)} / {formatCurrency(team.monthlyBudget)}
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
    <TeamViewSlideout
      isOpen={isViewOpen}
      onOpenChange={setIsViewOpen}
      team={team}
      onEdit={() => {
        setIsViewOpen(false);
        setIsEditOpen(true);
      }}
    />

    {/* Edit Slideout */}
    <TeamEditSlideout
      isOpen={isEditOpen}
      onOpenChange={setIsEditOpen}
      team={team}
      onSave={(teamId, updates) => {
        console.log("Saving team:", teamId, updates);
      }}
      onDelete={(teamId) => {
        console.log("Deleting team:", teamId);
      }}
    />
    </>
  );
};
