"use client";

import type { FC } from "react";
import { useState } from "react";
import { ExportSquare, Add } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { CostFiltersBar, type CostFilters } from "./cost-filters";
import { CostSummaryCards } from "./cost-summary-cards";
import { CostChart } from "./cost-chart";
import { CostBreakdownCard } from "./cost-breakdown-card";
import { CostTable } from "./cost-table";
import {
  mockCostTrends,
  mockProviderBreakdown,
  mockModelBreakdown,
  mockCostSummary,
  mockCostRecords,
} from "@/data/mock-costs";

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

export const CostAnalysis: FC = () => {
  const [filters, setFilters] = useState<CostFilters>(defaultFilters);

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Cost Analysis
          </h1>
          <p className="text-md text-tertiary">
            Analyze and track your AI spending across all providers and models.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md" color="secondary" iconLeading={ExportIcon}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <CostFiltersBar filters={filters} onFilterChange={setFilters} />

      {/* Summary Cards */}
      <CostSummaryCards
        totalCost={mockCostSummary.totalCost}
        totalTokens={mockCostSummary.totalTokens}
        totalRequests={mockCostSummary.totalRequests}
        avgCostPerRequest={mockCostSummary.avgCostPerRequest}
        costChange={12.5}
        tokenChange={8.3}
      />

      {/* Main Chart */}
      <CostChart data={mockCostTrends} />

      {/* Breakdown Cards Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CostBreakdownCard
          title="Cost by Provider"
          subtitle="Breakdown of spending across AI providers"
          data={mockProviderBreakdown}
        />
        <CostBreakdownCard
          title="Cost by Model"
          subtitle="Breakdown of spending across AI models"
          data={mockModelBreakdown}
        />
      </div>

      {/* Cost Table */}
      <CostTable data={mockCostRecords} />
    </div>
  );
};
