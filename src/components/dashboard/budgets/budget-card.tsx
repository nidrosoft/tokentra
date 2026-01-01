"use client";

import type { FC } from "react";
import { useState } from "react";
import {
  Building,
  People,
  FolderOpen,
  Cpu,
  Setting2,
  Calendar,
  Warning2,
} from "iconsax-react";
import type { Budget, BudgetScopeType } from "@/types";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { BudgetProgress } from "./budget-progress";
import { BudgetEditSlideout } from "./budget-edit-slideout";
import { useUpdateBudget, useDeleteBudget } from "@/hooks/use-budgets";
import { cx } from "@/utils/cx";

export interface BudgetCardProps {
  budget: Budget;
  daysRemaining?: number;
  onEdit?: (id: string) => void;
  className?: string;
}

const scopeIcons: Record<BudgetScopeType, FC<{ size: number; color: string }>> = {
  organization: Building,
  team: People,
  project: FolderOpen,
  cost_center: Building,
  provider: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  model: Cpu,
};

const statusConfig = {
  ok: { label: "On Track", color: "success" as const },
  warning: { label: "At Risk", color: "warning" as const },
  exceeded: { label: "Exceeded", color: "error" as const },
};

const periodLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const SettingsIcon = ({ className }: { className?: string }) => (
  <Setting2 size={16} color="currentColor" className={className} variant="Outline" />
);

export const BudgetCard: FC<BudgetCardProps> = ({
  budget,
  daysRemaining = 0,
  onEdit,
  className,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  
  const ScopeIcon = scopeIcons[budget.scope.type];
  const statusInfo = statusConfig[budget.status];

  const handleEdit = () => {
    setIsEditOpen(true);
    onEdit?.(budget.id);
  };

  const handleSave = async (budgetId: string, updates: Partial<Budget>) => {
    try {
      await updateBudgetMutation.mutateAsync({
        budgetId,
        data: {
          name: updates.name,
          amount: updates.amount,
          mode: updates.hardLimit ? "hard" : "soft",
          tags: updates.alertThresholds?.map(String),
        },
      });
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update budget:", error);
    }
  };

  const handleDelete = async (budgetId: string) => {
    try {
      await deleteBudgetMutation.mutateAsync({ budgetId, archive: true });
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  return (
    <>
    <div
      className={cx(
        "rounded-xl border border-secondary bg-primary p-5 shadow-xs transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-tertiary">
            <ScopeIcon size={20} color="currentColor" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-primary">{budget.name}</h4>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-xs text-tertiary">{budget.scope.name || budget.scope.type}</span>
              <span className="text-xs text-quaternary">•</span>
              <span className="text-xs text-tertiary">{periodLabels[budget.period]}</span>
            </div>
          </div>
        </div>
        <Badge size="sm" color={statusInfo.color}>
          {statusInfo.label}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <BudgetProgress
          spent={budget.currentSpend}
          limit={budget.amount}
          status={budget.status}
        />
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-secondary pt-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-tertiary">
            <Calendar size={14} color="currentColor" variant="Outline" />
            <span className="text-xs">{daysRemaining} days left</span>
          </div>
          {budget.hardLimit && (
            <div className="flex items-center gap-1 text-warning-primary">
              <Warning2 size={14} color="currentColor" variant="Bold" />
              <span className="text-xs font-medium">Hard Limit</span>
            </div>
          )}
        </div>
        <Button
          size="sm"
          color="secondary"
          iconLeading={SettingsIcon}
          onClick={handleEdit}
        >
          Edit
        </Button>
      </div>
    </div>

    {/* Edit Slideout */}
    <BudgetEditSlideout
      isOpen={isEditOpen}
      onOpenChange={setIsEditOpen}
      budget={budget}
      onSave={handleSave}
      onDelete={handleDelete}
    />
    </>
  );
};
