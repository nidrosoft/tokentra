"use client";

import type { FC } from "react";
import { useState, useRef, useEffect } from "react";
import { ExportSquare, DocumentText, DocumentDownload, Document, DollarCircle } from "iconsax-react";
import { EmptyState } from "../shared/empty-state";
import { Button } from "@/components/base/buttons/button";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useToastNotification } from "@/components/feedback/toast-notifications";
import { CostFiltersBar, type CostFilters } from "./cost-filters";
import { CostSummaryCards } from "./cost-summary-cards";
import { CostChart } from "./cost-chart";
import { CostBreakdownCard } from "./cost-breakdown-card";
import { CostTable } from "./cost-table";
import {
  useCostAnalysis,
  defaultFilters as defaultCostFilters,
  type CostAnalysisFilters,
} from "@/hooks/use-cost-analysis";
import {
  exportCostReport,
  type ExportFormat,
  type ExportData,
} from "@/lib/export/cost-report-generator";

const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);

const RefreshIcon = ({ className, isSpinning }: { className?: string; isSpinning?: boolean }) => (
  <svg
    className={`${className} ${isSpinning ? "animate-spin text-utility-success-500" : ""}`}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
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
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToastNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Convert UI filters to API filters
  const apiFilters: CostAnalysisFilters = {
    ...defaultCostFilters,
    dateRange: filters.dateRange,
    provider: filters.provider,
    model: filters.model,
    team: filters.team,
    granularity: filters.granularity as CostAnalysisFilters["granularity"],
  };

  // Fetch cost analysis data
  const { data, isLoading, error, refetch, isFetching } = useCostAnalysis(apiFilters, page, 50, true);

  // Handle export with format selection
  const handleExport = async (format: ExportFormat) => {
    if (!data) return;
    
    setIsExporting(true);
    setExportDropdownOpen(false);
    
    try {
      const exportData: ExportData = {
        summary: data.summary,
        trends: data.trends,
        byProvider: data.byProvider,
        byModel: data.byModel,
        records: data.records,
        filters: {
          dateRange: filters.dateRange,
          provider: filters.provider,
          model: filters.model,
          team: filters.team,
        },
        generatedAt: new Date().toLocaleString(),
      };
      
      await exportCostReport(format, exportData);
      
      const formatNames: Record<ExportFormat, string> = {
        csv: "CSV",
        excel: "Excel",
        pdf: "PDF",
      };
      showToast("success", "Export Complete", `Your ${formatNames[format]} report has been downloaded.`);
    } catch (err) {
      showToast("error", "Export Failed", "Failed to export cost data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle filter change - reset page when filters change
  const handleFilterChange = (newFilters: CostFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Icon for empty state
  const CostIcon = () => (
    <DollarCircle size={32} color="#7F56D9" variant="Bulk" />
  );

  // Local empty state component for inline use
  const LocalEmptyState = ({ title, description }: { title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary bg-secondary_subtle py-16">
      <DocumentText size={48} className="mb-4 text-quaternary" variant="Outline" />
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <p className="mt-1 max-w-md text-center text-sm text-tertiary">{description}</p>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">Cost Analysis</h1>
            <p className="text-md text-tertiary">Analyze and track your AI spending across all providers and models.</p>
          </div>
        </div>
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingIndicator type="line-simple" size="lg" label="Loading cost analysis..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">Cost Analysis</h1>
            <p className="text-md text-tertiary">Analyze and track your AI spending across all providers and models.</p>
          </div>
        </div>
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-utility-error-200 bg-utility-error-50 py-16">
          <h3 className="text-lg font-semibold text-utility-error-700">Failed to Load Data</h3>
          <p className="mt-1 text-sm text-utility-error-600">{error.message}</p>
          <Button size="md" color="secondary" className="mt-4" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const hasData = data && data.summary.totalRequests > 0;

  // Map data for components
  const chartData = data?.trends.map((t) => ({
    date: t.date,
    cost: t.cost,
    tokens: t.tokens,
    requests: t.requests,
  })) || [];

  const providerBreakdown = data?.byProvider.map((b) => ({
    dimension: "provider" as const,
    value: b.value,
    cost: b.cost,
    percentage: b.percentage,
    tokens: b.tokens,
    requests: b.requests,
  })) || [];

  const modelBreakdown = data?.byModel.map((b) => ({
    dimension: "model" as const,
    value: b.value,
    cost: b.cost,
    percentage: b.percentage,
    tokens: b.tokens,
    requests: b.requests,
  })) || [];

  const tableRecords = data?.records.map((r) => ({
    id: r.id,
    organizationId: "",
    provider: r.provider,
    model: r.model,
    teamId: r.teamName || r.teamId || "",
    projectId: r.projectName || r.projectId || "",
    tokensInput: r.inputTokens,
    tokensOutput: r.outputTokens,
    cost: r.cost,
    currency: "USD" as const,
    timestamp: new Date(r.timestamp),
  })) || [];

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">Cost Analysis</h1>
          <p className="text-md text-tertiary">Analyze and track your AI spending across all providers and models.</p>
        </div>
        <div className="flex gap-3">
          <Button
            size="md"
            color="secondary"
            onClick={async () => {
              await refetch();
              showToast("success", "Data Refreshed", "Cost analysis data has been updated.");
            }}
            disabled={isFetching}
          >
            <span className="flex items-center gap-2">
              <RefreshIcon isSpinning={isFetching} />
              {isFetching ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <Button
              size="md"
              color="secondary"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              disabled={isExporting || !hasData}
            >
              <span className="flex items-center gap-2">
                {isExporting ? (
                  <LoadingIndicator type="line-spinner" size="sm" />
                ) : (
                  <ExportIcon />
                )}
                {isExporting ? "Exporting..." : "Export Report"}
                <svg
                  className={`size-4 transition-transform ${exportDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </Button>
            
            {/* Dropdown Menu */}
            {exportDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-secondary bg-primary shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => handleExport("pdf")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-primary transition-colors hover:bg-secondary"
                  >
                    <Document size={18} color="currentColor" variant="Outline" />
                    <div>
                      <div className="font-medium">PDF Report</div>
                      <div className="text-xs text-tertiary">Formatted with charts</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport("excel")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-primary transition-colors hover:bg-secondary"
                  >
                    <DocumentDownload size={18} color="currentColor" variant="Outline" />
                    <div>
                      <div className="font-medium">Excel Spreadsheet</div>
                      <div className="text-xs text-tertiary">Multiple sheets</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-primary transition-colors hover:bg-secondary"
                  >
                    <DocumentText size={18} color="currentColor" variant="Outline" />
                    <div>
                      <div className="font-medium">CSV File</div>
                      <div className="text-xs text-tertiary">Raw data export</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <CostFiltersBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onReset={() => showToast("info", "Filters Reset", "All filters have been reset to default values.")}
        filterOptions={data?.filters}
      />

      {/* No Data State */}
      {!hasData ? (
        <EmptyState
          icon={<CostIcon />}
          title="No cost data yet"
          description="Connect an AI provider and start making API calls to see your cost analytics here. We'll track every request and help you optimize spending."
          actionLabel="View Providers"
          onAction={() => window.location.href = "/dashboard/providers"}
        />
      ) : (
        <>
          {/* Summary Cards */}
          <CostSummaryCards
            totalCost={data.summary.totalCost}
            totalTokens={data.summary.totalTokens}
            totalRequests={data.summary.totalRequests}
            avgCostPerRequest={data.summary.avgCostPerRequest}
            costChange={data.summary.costChange}
            tokenChange={data.summary.tokenChange}
          />

          {/* Main Chart */}
          {chartData.length > 0 ? (
            <CostChart data={chartData} />
          ) : (
            <LocalEmptyState title="No Trend Data" description="Not enough data points to display a trend chart." />
          )}

          {/* Breakdown Cards Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {providerBreakdown.length > 0 ? (
              <CostBreakdownCard
                title="Cost by Provider"
                subtitle="Breakdown of spending across AI providers"
                data={providerBreakdown}
              />
            ) : (
              <div className="rounded-xl border border-secondary bg-primary p-6 shadow-xs">
                <h3 className="text-lg font-semibold text-primary">Cost by Provider</h3>
                <p className="mt-2 text-sm text-tertiary">No provider data available.</p>
              </div>
            )}
            {modelBreakdown.length > 0 ? (
              <CostBreakdownCard
                title="Cost by Model"
                subtitle="Breakdown of spending across AI models"
                data={modelBreakdown}
              />
            ) : (
              <div className="rounded-xl border border-secondary bg-primary p-6 shadow-xs">
                <h3 className="text-lg font-semibold text-primary">Cost by Model</h3>
                <p className="mt-2 text-sm text-tertiary">No model data available.</p>
              </div>
            )}
          </div>

          {/* Cost Table */}
          {tableRecords.length > 0 ? (
            <CostTable data={tableRecords} />
          ) : (
            <LocalEmptyState title="No Usage Records" description="No individual usage records found for the selected filters." />
          )}
        </>
      )}
    </div>
  );
};
