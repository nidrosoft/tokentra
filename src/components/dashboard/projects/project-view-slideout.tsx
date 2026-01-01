"use client";

import type { FC } from "react";
import {
  Folder2,
  Wallet,
  People,
  Calendar,
  Chart,
  Key,
  Tag,
  TrendUp,
  DocumentText,
} from "iconsax-react";
import type { Project } from "@/types";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

interface ProjectViewSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  teamName?: string;
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

const ProjectIcon = ({ className }: { className?: string }) => (
  <Folder2 size={24} color="#7F56D9" className={className} variant="Bulk" />
);

const mockCostByProvider = [
  { provider: "OpenAI", cost: 850, percentage: 68, color: "#10A37F" },
  { provider: "Anthropic", cost: 301, percentage: 24, color: "#D97706" },
  { provider: "Google AI", cost: 100, percentage: 8, color: "#4285F4" },
];

const mockUsageStats = {
  totalRequests: 12450,
  totalTokens: 2300000,
  avgCostPerRequest: 0.10,
};

export const ProjectViewSlideout: FC<ProjectViewSlideoutProps> = ({
  isOpen,
  onOpenChange,
  project,
  teamName,
  onEdit,
}) => {
  const budgetUsage = project.monthlyBudget
    ? (project.currentMonthSpend / project.monthlyBudget) * 100
    : 0;

  const getBudgetStatus = () => {
    if (budgetUsage >= 100) return { color: "error" as const, label: "Over Budget", bgColor: "bg-utility-error-50", textColor: "text-utility-error-600" };
    if (budgetUsage >= 80) return { color: "warning" as const, label: "Near Limit", bgColor: "bg-utility-warning-50", textColor: "text-utility-warning-600" };
    return { color: "success" as const, label: "On Track", bgColor: "bg-utility-success-50", textColor: "text-utility-success-600" };
  };

  const budgetStatus = getBudgetStatus();
  const isArchived = project.status === "archived";

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <ProjectIcon />
          </div>
          <section className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-md font-semibold text-primary md:text-lg">
                {project.name}
              </h1>
              <Badge size="sm" color={isArchived ? "gray" : budgetStatus.color}>
                {isArchived ? "Archived" : budgetStatus.label}
              </Badge>
            </div>
            {project.description && (
              <p className="text-sm text-tertiary">{project.description}</p>
            )}
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-6">
            {/* Quick Info */}
            <div className="flex flex-wrap gap-4">
              {teamName && (
                <div className="flex items-center gap-2 text-sm text-tertiary">
                  <People size={16} color="#667085" variant="Outline" />
                  <span>{teamName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <Calendar size={16} color="#667085" variant="Outline" />
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Budget Overview */}
            {project.monthlyBudget && !isArchived && (
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
                    {formatCurrency(project.currentMonthSpend)} of {formatCurrency(project.monthlyBudget)}
                  </span>
                  <span className={cx("font-medium", budgetStatus.textColor)}>
                    {formatCurrency(project.monthlyBudget - project.currentMonthSpend)} remaining
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

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag size={18} color="#667085" variant="Outline" />
                  <h3 className="text-sm font-medium text-secondary">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} size="md" color="brand">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* API Key Patterns */}
            {project.apiKeyPatterns && project.apiKeyPatterns.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key size={18} color="#667085" variant="Outline" />
                  <h3 className="text-sm font-medium text-secondary">API Key Patterns</h3>
                </div>
                <div className="space-y-2">
                  {project.apiKeyPatterns.map((pattern, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                      <DocumentText size={14} color="#667085" variant="Outline" />
                      <code className="text-sm font-mono text-primary">{pattern}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SlideoutMenu.Content>

        <SlideoutMenu.Footer className="flex w-full justify-between gap-3">
          <Button size="md" color="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button size="md" onClick={onEdit}>
            Edit Project
          </Button>
        </SlideoutMenu.Footer>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
