"use client";

import type { FC } from "react";
import { useState } from "react";
import { ExportSquare } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { CostFiltersBar, type CostFilters } from "../costs/cost-filters";
import { UsageSummaryCards } from "./usage-summary-cards";
import { UsageChart } from "./usage-chart";
import { TokenUsage } from "./token-usage";
import { ModelDistribution } from "./model-distribution";
import { UsageTable } from "./usage-table";
import {
  mockUsageTrends,
  mockUsageSummary,
  mockTokenBreakdown,
  mockTokenUsageByModel,
  mockUsageRecords,
} from "@/data/mock-usage";

const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);

const defaultFilters: CostFilters = {
  dateRange: "last30d",
  provider: "all",
  model: "all",
  team: "all",
  granularity: "day",
};

export const UsageAnalytics: FC = () => {
  const [filters, setFilters] = useState<CostFilters>(defaultFilters);

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Usage Analytics
          </h1>
          <p className="text-md text-tertiary">
            Monitor token consumption, request volume, and performance metrics.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md" color="secondary" iconLeading={ExportIcon}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters Bar - Reusing from costs */}
      <CostFiltersBar filters={filters} onFilterChange={setFilters} />

      {/* Summary Cards */}
      <UsageSummaryCards
        totalRequests={mockUsageSummary.totalRequests}
        totalInputTokens={mockUsageSummary.totalInputTokens}
        totalOutputTokens={mockUsageSummary.totalOutputTokens}
        totalCachedTokens={mockUsageSummary.totalCachedTokens}
        avgLatency={mockUsageSummary.avgLatency}
        successRate={mockUsageSummary.successRate}
      />

      {/* Main Chart */}
      <UsageChart data={mockUsageTrends} />

      {/* Breakdown Cards Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TokenUsage data={mockTokenBreakdown} />
        <ModelDistribution data={mockTokenUsageByModel} />
      </div>

      {/* Usage Table */}
      <UsageTable data={mockUsageRecords} />
    </div>
  );
};
