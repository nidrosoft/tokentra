"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, TickCircle, Warning2, CloseCircle } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { BudgetList } from "./budget-list";
import { CreateBudgetDialog } from "./create-budget-dialog";
import type { BudgetFormData } from "./budget-form";
import { mockBudgets, mockBudgetSummary } from "@/data/mock-budgets";
import type { Budget } from "@/types";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

// Calculate days remaining in current period
const now = new Date();
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const BudgetsOverview: FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (budgetId: string) => {
    console.log("Editing budget:", budgetId);
  };

  const handleCreateSubmit = (data: BudgetFormData) => {
    setIsCreating(true);
    // Simulate API call
    setTimeout(() => {
      const newBudget: Budget = {
        id: `budget_${Date.now()}`,
        organizationId: "org_1",
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        period: data.period,
        scope: {
          type: data.scopeType,
          id: data.scopeId,
          name: data.scopeName || (data.scopeType === "organization" ? "Acme Corp" : undefined),
        },
        alertThresholds: data.alertThresholds,
        hardLimit: data.hardLimit,
        currentSpend: 0,
        status: "ok",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setBudgets((prev) => [newBudget, ...prev]);
      setIsCreating(false);
      setIsCreateDialogOpen(false);
    }, 1000);
  };

  const totalAllocated = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.currentSpend, 0);
  const budgetsOk = budgets.filter((b) => b.status === "ok").length;
  const budgetsWarning = budgets.filter((b) => b.status === "warning").length;
  const budgetsExceeded = budgets.filter((b) => b.status === "exceeded").length;
  const utilizationPercent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Budgets
          </h1>
          <p className="text-md text-tertiary">
            Set spending limits and track budget utilization across your organization.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md" iconLeading={AddIcon} onClick={() => setIsCreateDialogOpen(true)}>
            Create Budget
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Total Allocated</p>
          <p className="mt-1 text-2xl font-semibold text-primary">
            {formatCurrency(totalAllocated)}
          </p>
          <p className="mt-1 text-xs text-quaternary">across {budgets.length} budgets</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Total Spent</p>
          <p className="mt-1 text-2xl font-semibold text-primary">
            {formatCurrency(totalSpent)}
          </p>
          <p className="mt-1 text-xs text-quaternary">{utilizationPercent.toFixed(1)}% utilized</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Budget Health</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TickCircle size={16} color="#12B76A" variant="Bold" />
              <span className="text-lg font-semibold text-success-primary">{budgetsOk}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Warning2 size={16} color="#F79009" variant="Bold" />
              <span className="text-lg font-semibold text-warning-primary">{budgetsWarning}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CloseCircle size={16} color="#F04438" variant="Bold" />
              <span className="text-lg font-semibold text-error-primary">{budgetsExceeded}</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-quaternary">on track / at risk / exceeded</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Days Remaining</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{daysRemaining}</p>
          <p className="mt-1 text-xs text-quaternary">in current billing period</p>
        </div>
      </div>

      {/* Budget List */}
      <BudgetList
        budgets={budgets}
        daysRemaining={daysRemaining}
        onEdit={handleEdit}
      />

      {/* Create Budget Dialog */}
      <CreateBudgetDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />
    </div>
  );
};
