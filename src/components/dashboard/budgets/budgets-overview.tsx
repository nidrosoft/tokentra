"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import { Add, WalletMoney } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { BudgetList } from "./budget-list";
import { CreateBudgetDialog } from "./create-budget-dialog";
import type { BudgetFormData } from "./budget-form";
import { useBudgets, useBudgetStats, useCreateBudget } from "@/hooks/use-budgets";
import type { Budget } from "@/types";
import type { BudgetSummary, CreateBudgetInput } from "@/lib/budget";
import { EmptyState } from "../shared/empty-state";

const DEMO_ORG_ID = process.env.NEXT_PUBLIC_DEMO_ORG_ID || "b1c2d3e4-f5a6-7890-bcde-f12345678901";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

// Calculate days remaining in current period
const calculateDaysRemaining = () => {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const formatCurrency = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "$0";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Convert BudgetSummary to legacy Budget format for backward compatibility
const convertToLegacyBudget = (summary: BudgetSummary): Budget => {
  const utilization = summary.utilizationPercentage || 0;
  let status: "ok" | "warning" | "exceeded" = "ok";
  if (utilization >= 100) status = "exceeded";
  else if (utilization >= 80) status = "warning";

  return {
    id: summary.id,
    organizationId: summary.organizationId,
    name: summary.name,
    amount: summary.totalBudget || summary.baseAmount,
    currency: "USD",
    period: summary.period === "annual" ? "yearly" : summary.period as Budget["period"],
    scope: {
      type: summary.type as Budget["scope"]["type"],
      id: summary.teamId || summary.projectId || summary.costCenterId || summary.provider,
      name: summary.teamName || summary.projectName || summary.costCenterName || summary.provider,
    },
    alertThresholds: [50, 80, 100],
    hardLimit: summary.mode === "hard",
    currentSpend: summary.spentAmount || 0,
    status,
    createdAt: new Date(summary.createdAt),
    updatedAt: new Date(summary.updatedAt),
  };
};

export const BudgetsOverview: FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const daysRemaining = useMemo(() => calculateDaysRemaining(), []);

  // Fetch budgets from API
  const { data: budgetsResponse, isLoading: isLoadingBudgets } = useBudgets({
    organizationId: DEMO_ORG_ID,
  });

  // Fetch budget stats
  const { data: statsResponse } = useBudgetStats(DEMO_ORG_ID);

  // Create budget mutation
  const createBudgetMutation = useCreateBudget();

  // Convert API response to legacy format
  const budgets: Budget[] = useMemo(() => {
    if (budgetsResponse?.budgets && budgetsResponse.budgets.length > 0) {
      return budgetsResponse.budgets.map(convertToLegacyBudget);
    }
    return [];
  }, [budgetsResponse]);

  const isEmpty = !isLoadingBudgets && budgets.length === 0;

  const BudgetIcon = () => (
    <WalletMoney size={32} color="#7F56D9" variant="Bulk" />
  );

  const handleEdit = (budgetId: string) => {
    // Budget editing is handled via the BudgetCard slideout
  };

  const handleCreateSubmit = async (data: BudgetFormData) => {
    const input: CreateBudgetInput = {
      name: data.name,
      description: data.description,
      type: data.scopeType,
      amount: data.amount,
      period: data.period === "yearly" ? "annual" : data.period === "daily" ? "weekly" : data.period as CreateBudgetInput["period"],
      mode: data.hardLimit ? "hard" : "soft",
      teamId: data.scopeType === "team" ? data.scopeId : undefined,
      projectId: data.scopeType === "project" ? data.scopeId : undefined,
      provider: data.scopeType === "provider" ? data.scopeId : undefined,
      model: data.scopeType === "model" ? data.scopeId : undefined,
      thresholds: data.alertThresholds.map((percentage) => ({
        percentage,
        action: percentage >= 100 ? "block" : "alert",
        alertEnabled: true,
      })),
    };

    try {
      await createBudgetMutation.mutateAsync({
        organizationId: DEMO_ORG_ID,
        data: input,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create budget:", error);
    }
  };

  // Use stats from API or calculate from budgets
  const stats = statsResponse || {
    totalBudget: budgets.reduce((sum, b) => sum + b.amount, 0),
    totalSpent: budgets.reduce((sum, b) => sum + b.currentSpend, 0),
    budgetCount: budgets.length,
    exceededCount: budgets.filter((b) => b.status === "exceeded").length,
    approachingCount: budgets.filter((b) => b.status === "warning").length,
  };

  const totalAllocated = stats.totalBudget;
  const totalSpent = stats.totalSpent;
  const budgetsOk = budgets.filter((b) => b.status === "ok").length;
  const budgetsWarning = stats.approachingCount || budgets.filter((b) => b.status === "warning").length;
  const budgetsExceeded = stats.exceededCount || budgets.filter((b) => b.status === "exceeded").length;
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
        <MetricsChart04
          title={formatCurrency(totalAllocated)}
          subtitle="Total Allocated"
          change={`${budgets.length} budgets`}
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 40 }, { value: 45 }, { value: 50 }, { value: 55 }, { value: 60 }, { value: 65 }]}
          actions={false}
        />
        <MetricsChart04
          title={formatCurrency(totalSpent)}
          subtitle="Total Spent"
          change={`${utilizationPercent.toFixed(1)}%`}
          changeTrend={utilizationPercent > 80 ? "negative" : "positive"}
          chartColor={utilizationPercent > 80 ? "text-fg-error-secondary" : "text-fg-success-secondary"}
          chartData={[{ value: 20 }, { value: 25 }, { value: 30 }, { value: 35 }, { value: 40 }, { value: 45 }]}
          actions={false}
        />
        <MetricsChart04
          title={`${budgetsOk}/${budgetsWarning}/${budgetsExceeded}`}
          subtitle="Budget Health"
          change="ok/warn/over"
          changeTrend={budgetsExceeded > 0 ? "negative" : "positive"}
          chartColor={budgetsExceeded > 0 ? "text-fg-warning-secondary" : "text-fg-success-secondary"}
          chartData={[{ value: 5 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 5 }, { value: 6 }]}
          actions={false}
        />
        <MetricsChart04
          title={String(daysRemaining)}
          subtitle="Days Remaining"
          change="this period"
          changeTrend="positive"
          chartColor="text-fg-warning-secondary"
          chartData={[{ value: 30 }, { value: 25 }, { value: 20 }, { value: 15 }, { value: 10 }, { value: 5 }]}
          actions={false}
        />
      </div>

      {/* Budget List or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={<BudgetIcon />}
          title="No budgets yet"
          description="Create your first budget to set spending limits and track utilization across teams, projects, or providers."
          actionLabel="Create Budget"
          onAction={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <BudgetList
          budgets={budgets}
          daysRemaining={daysRemaining}
          onEdit={handleEdit}
        />
      )}

      {/* Create Budget Dialog */}
      <CreateBudgetDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createBudgetMutation.isPending}
      />
    </div>
  );
};
