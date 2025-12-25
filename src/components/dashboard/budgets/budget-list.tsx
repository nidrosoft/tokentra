"use client";

import type { FC } from "react";
import { useState } from "react";
import type { Budget, BudgetStatus } from "@/types";
import { BudgetCard } from "./budget-card";
import { cx } from "@/utils/cx";

export interface BudgetListProps {
  budgets: Budget[];
  daysRemaining?: number;
  onEdit?: (id: string) => void;
  className?: string;
}

const statusFilters: { value: BudgetStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ok", label: "On Track" },
  { value: "warning", label: "At Risk" },
  { value: "exceeded", label: "Exceeded" },
];

export const BudgetList: FC<BudgetListProps> = ({
  budgets,
  daysRemaining = 0,
  onEdit,
  className,
}) => {
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | "all">("all");

  const filteredBudgets = budgets.filter((budget) => {
    if (statusFilter === "all") return true;
    return budget.status === statusFilter;
  });

  const totalAllocated = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.currentSpend, 0);

  return (
    <div className={cx("space-y-4", className)}>
      {/* Header with filters */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-primary">All Budgets</h3>
          <p className="text-sm text-tertiary">
            {budgets.length} budgets · ${totalSpent.toLocaleString()} of ${totalAllocated.toLocaleString()} allocated
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cx(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === filter.value
                  ? "bg-primary text-primary shadow-sm"
                  : "text-tertiary hover:text-secondary"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredBudgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            daysRemaining={daysRemaining}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredBudgets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary py-12">
          <p className="text-lg font-medium text-secondary">No budgets found</p>
          <p className="mt-1 text-sm text-tertiary">
            {statusFilter === "all"
              ? "Create your first budget to start tracking spending"
              : `No ${statusFilter} budgets`}
          </p>
        </div>
      )}
    </div>
  );
};
