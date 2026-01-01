"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import { ExportSquare, Activity } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { EmptyState } from "../shared/empty-state";
import { CostFiltersBar, type CostFilters } from "../costs/cost-filters";
import { UsageSummaryCards } from "./usage-summary-cards";
import { UsageChart } from "./usage-chart";
import { TokenUsage } from "./token-usage";
import { ModelDistribution } from "./model-distribution";
import { UsageTable } from "./usage-table";
import { useUsageData, type UsageFilters } from "@/hooks/use-usage";

const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);

const UsageIcon = () => (
  <Activity size={32} color="#7F56D9" variant="Bulk" />
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

  const usageFilters: UsageFilters = useMemo(() => ({
    dateRange: filters.dateRange,
    provider: filters.provider,
    model: filters.model,
    team: filters.team,
    granularity: filters.granularity,
  }), [filters]);

  const { data: usageData, isLoading } = useUsageData(usageFilters);

  const summary = usageData?.summary;
  const trends = usageData?.trends || [];
  const tokenBreakdown = usageData?.tokenBreakdown;
  const modelDistribution = usageData?.modelDistribution || [];
  const records = usageData?.records || [];

  const isEmpty = !isLoading && summary?.totalRequests === 0;

  const chartData = useMemo(() => {
    return trends.map((t) => ({
      date: t.date,
      requests: t.requests,
      inputTokens: t.inputTokens,
      outputTokens: t.outputTokens,
      avgLatency: 0,
    }));
  }, [trends]);

  const tokenData = useMemo(() => {
    if (!tokenBreakdown) return { input: 0, output: 0, cached: 0, total: 0 };
    const total = tokenBreakdown.inputTokens + tokenBreakdown.outputTokens + tokenBreakdown.cachedTokens;
    return {
      input: tokenBreakdown.inputTokens,
      output: tokenBreakdown.outputTokens,
      cached: tokenBreakdown.cachedTokens,
      total,
    };
  }, [tokenBreakdown]);

  const modelData = useMemo(() => {
    return modelDistribution.map((m) => ({
      model: m.model,
      provider: m.provider,
      inputTokens: Math.round(m.tokens * 0.4),
      outputTokens: Math.round(m.tokens * 0.6),
      cachedTokens: 0,
      requests: m.requests,
    }));
  }, [modelDistribution]);

  const tableData = useMemo(() => {
    return records.map((r) => ({
      id: r.id,
      organizationId: "",
      timestamp: new Date(r.timestamp),
      provider: r.provider,
      model: r.model,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      cachedTokens: r.cachedTokens,
      latencyMs: r.latencyMs,
      statusCode: r.status === "success" ? 200 : 500,
    }));
  }, [records]);

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

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <LoadingIndicator type="line-simple" size="lg" label="Loading usage data..." />
        </div>
      )}

      {/* Empty State */}
      {isEmpty && !isLoading && (
        <EmptyState
          icon={<UsageIcon />}
          title="No usage data yet"
          description="Connect an AI provider and start making API calls to see your usage analytics here. We'll track every request, token, and performance metric."
          actionLabel="View Providers"
          onAction={() => window.location.href = "/dashboard/providers"}
        />
      )}

      {/* Content when data exists */}
      {!isLoading && !isEmpty && (
        <>
          {/* Summary Cards */}
          <UsageSummaryCards
            totalRequests={summary?.totalRequests || 0}
            totalInputTokens={summary?.totalInputTokens || 0}
            totalOutputTokens={summary?.totalOutputTokens || 0}
            totalCachedTokens={summary?.totalCachedTokens || 0}
            avgLatency={summary?.avgLatency || 0}
            successRate={summary?.successRate || 100}
          />

          {/* Main Chart */}
          <UsageChart data={chartData} />

          {/* Breakdown Cards Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TokenUsage data={tokenData} />
            <ModelDistribution data={modelData} />
          </div>

          {/* Usage Table */}
          <UsageTable data={tableData} />
        </>
      )}
    </div>
  );
};
