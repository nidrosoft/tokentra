"use client";

import type { FC } from "react";
import {
  Building,
  Wallet,
  Calendar,
  Chart,
  TrendUp,
  DocumentText,
} from "iconsax-react";
import type { CostCenter } from "@/types";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

interface CostCenterViewSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  costCenter: CostCenter;
  onEdit?: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const CostCenterIcon = ({ className }: { className?: string }) => (
  <Building size={24} color="#7F56D9" className={className} variant="Bulk" />
);

const mockCostByProvider = [
  { provider: "OpenAI", cost: 2500, percentage: 50, color: "#10A37F" },
  { provider: "Anthropic", cost: 1500, percentage: 30, color: "#D97706" },
  { provider: "Google AI", cost: 1000, percentage: 20, color: "#4285F4" },
];

const mockUsageStats = {
  totalRequests: 45000,
  totalTokens: 8500000,
  avgCostPerRequest: 0.11,
};

const mockAllocations = [
  { name: "Engineering Team", percentage: 60 },
  { name: "Data Science Team", percentage: 25 },
  { name: "Product Team", percentage: 15 },
];

export const CostCenterViewSlideout: FC<CostCenterViewSlideoutProps> = ({
  isOpen,
  onOpenChange,
  costCenter,
  onEdit,
}) => {
  const budgetUsage = costCenter.monthlyBudget
    ? (costCenter.currentMonthSpend / costCenter.monthlyBudget) * 100
    : 0;

  const getBudgetStatus = () => {
    if (budgetUsage >= 100) return { color: "error" as const, label: "Over Budget", bgColor: "bg-utility-error-50", textColor: "text-utility-error-600" };
    if (budgetUsage >= 80) return { color: "warning" as const, label: "Near Limit", bgColor: "bg-utility-warning-50", textColor: "text-utility-warning-600" };
    return { color: "success" as const, label: "On Track", bgColor: "bg-utility-success-50", textColor: "text-utility-success-600" };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <CostCenterIcon />
          </div>
          <section className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-md font-semibold text-primary md:text-lg">
                {costCenter.name}
              </h1>
              <Badge size="sm" color={budgetStatus.color}>
                {budgetStatus.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-tertiary">
                {costCenter.code}
              </code>
              {costCenter.description && (
                <>
                  <span className="text-sm text-quaternary">•</span>
                  <span className="text-sm text-tertiary">{costCenter.description}</span>
                </>
              )}
            </div>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-6">
            {/* Quick Info */}
            <div className="flex items-center gap-2 text-sm text-tertiary">
              <Calendar size={16} color="#667085" variant="Outline" />
              <span>Created {new Date(costCenter.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Budget Overview */}
            {costCenter.monthlyBudget && (
              <div className={cx("rounded-xl p-4", budgetStatus.bgColor)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet size={18} color={budgetUsage >= 80 ? "#F79009" : "#17B26A"} variant="Bold" />
                    <span className={cx("text-sm font-medium", budgetStatus.textColor)}>
                      Budget Overview
                    </span>
                  </div>
                  <span className={cx("text-lg font-semibold", budgetStatus.textColor)}>
                    {Math.round(budgetUsage)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className={budgetStatus.textColor}>
                    {formatCurrency(costCenter.currentMonthSpend)} of {formatCurrency(costCenter.monthlyBudget)}
                  </span>
                  <span className={cx("font-medium", budgetStatus.textColor)}>
                    {formatCurrency(costCenter.monthlyBudget - costCenter.currentMonthSpend)} remaining
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/50">
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

            {/* Cost Breakdown by Provider */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Chart size={18} color="#667085" variant="Outline" />
                <h3 className="text-sm font-medium text-secondary">Cost Breakdown by Provider</h3>
              </div>
              <div className="space-y-2">
                {mockCostByProvider.map((item) => (
                  <div key={item.provider} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-primary">{item.provider}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">{formatCurrency(item.cost)}</span>
                      <span className="text-xs text-tertiary">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendUp size={18} color="#667085" variant="Outline" />
                <h3 className="text-sm font-medium text-secondary">Usage Statistics</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <p className="text-lg font-semibold text-primary">{formatNumber(mockUsageStats.totalRequests)}</p>
                  <p className="text-xs text-tertiary">Total Requests</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <p className="text-lg font-semibold text-primary">{formatNumber(mockUsageStats.totalTokens)}</p>
                  <p className="text-xs text-tertiary">Total Tokens</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <p className="text-lg font-semibold text-primary">${mockUsageStats.avgCostPerRequest.toFixed(2)}</p>
                  <p className="text-xs text-tertiary">Avg Cost/Req</p>
                </div>
              </div>
            </div>

            {/* Cost Allocations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DocumentText size={18} color="#667085" variant="Outline" />
                <h3 className="text-sm font-medium text-secondary">Cost Allocations</h3>
              </div>
              <div className="space-y-2">
                {mockAllocations.map((allocation) => (
                  <div key={allocation.name} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <span className="text-sm font-medium text-primary">{allocation.name}</span>
                    <Badge size="sm" color="brand">{allocation.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SlideoutMenu.Content>

        <SlideoutMenu.Footer className="flex w-full justify-between gap-3">
          <Button size="md" color="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button size="md" onClick={onEdit}>
            Edit Cost Center
          </Button>
        </SlideoutMenu.Footer>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
