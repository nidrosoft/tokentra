"use client";

import type { FC } from "react";
import { useState } from "react";
import { DocumentText, Add } from "iconsax-react";
import type { ReportType, ReportConfig } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { EmptyState } from "../shared/empty-state";
import { ReportList } from "./report-list";
import { GenerateReportSlideout } from "./generate-report-slideout";
import { useReports, useGenerateReport, type GeneratedReport } from "@/hooks/use-reports";
import { useToastNotification } from "@/components/feedback/toast-notifications";

const formatTimeAgo = (dateStr?: string): string => {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return date.toLocaleDateString();
};

const ReportsIcon = () => (
  <DocumentText size={32} color="#7F56D9" variant="Bulk" />
);

const mapReportTypeToApi = (type: ReportType): string => {
  const typeMap: Record<string, string> = {
    cost_summary: "executive",
    usage_summary: "team",
    chargeback: "chargeback",
    optimization: "forecast",
  };
  return typeMap[type] || "custom";
};

const getDateRangeFromPreset = (preset: string): { start: string; end: string } => {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  let start: Date;

  switch (preset) {
    case "last_7_days":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "last_30_days":
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "this_month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last_month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case "last_quarter":
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { start: start.toISOString().split("T")[0], end };
};

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

export const ReportsOverview: FC = () => {
  const { showToast } = useToastNotification();
  const { data: reportsData, isLoading, refetch } = useReports();
  const generateMutation = useGenerateReport();
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  const reports = reportsData?.reports || [];
  const summary = reportsData?.summary || {
    totalGenerated: 0,
    scheduledActive: 0,
    lastGeneratedAt: undefined,
    totalDownloads: 0,
  };

  const isEmpty = !isLoading && reports.length === 0;

  const handleGenerate = async (config: ReportConfig & { name: string; type: ReportType }) => {
    try {
      const dateRange = getDateRangeFromPreset(config.dateRange?.from || "last_30_days");
      
      await generateMutation.mutateAsync({
        type: mapReportTypeToApi(config.type),
        name: config.name,
        dateRange,
        format: config.format || "json",
        filters: config.groupBy ? { groupBy: config.groupBy } : undefined,
      });
      
      showToast("success", "Report Generated", "Your report has been generated successfully.");
      refetch();
    } catch (error) {
      showToast("error", "Generation Failed", "Failed to generate report. Please try again.");
    }
  };

  const handleDownload = (id: string) => {
    const report = reports.find((r: GeneratedReport) => r.id === id);
    if (report?.downloadUrl) {
      window.open(report.downloadUrl, "_blank");
    }
  };

  const handleRetry = async (id: string) => {
    const report = reports.find((r: GeneratedReport) => r.id === id);
    if (report) {
      try {
        await generateMutation.mutateAsync({
          type: report.type,
          name: report.name,
          dateRange: { start: report.dateRangeStart, end: report.dateRangeEnd },
          format: report.format,
        });
        showToast("success", "Report Regenerated", "Your report has been regenerated.");
        refetch();
      } catch (error) {
        showToast("error", "Retry Failed", "Failed to regenerate report.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Reports
          </h1>
          <p className="text-md text-tertiary">
            Generate, schedule, and export cost reports.
          </p>
        </div>
        <Button
          size="md"
          iconLeading={AddIcon}
          onClick={() => setIsSlideoutOpen(true)}
        >
          Generate Report
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <LoadingIndicator type="line-simple" size="lg" label="Loading reports..." />
        </div>
      )}

      {/* Empty State */}
      {isEmpty && !isLoading && (
        <EmptyState
          icon={<ReportsIcon />}
          title="No reports yet"
          description="Generate your first cost report to track spending, analyze usage patterns, and share insights with your team."
          actionLabel="Generate Report"
          onAction={() => setIsSlideoutOpen(true)}
        />
      )}

      {/* Content when not loading and not empty */}
      {!isLoading && !isEmpty && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricsChart04
              title={String(summary.totalGenerated)}
              subtitle="Reports Generated"
              change={summary.totalGenerated > 0 ? `${summary.totalGenerated}` : "0"}
              changeTrend="positive"
              chartColor="text-fg-success-secondary"
              chartData={[{ value: 5 }, { value: 8 }, { value: 12 }, { value: 10 }, { value: 15 }, { value: 18 }]}
              actions={false}
            />
            <MetricsChart04
              title={String(summary.scheduledActive)}
              subtitle="Scheduled Reports"
              change={summary.scheduledActive > 0 ? `${summary.scheduledActive}` : "0"}
              changeTrend="positive"
              chartColor="text-fg-success-secondary"
              chartData={[{ value: 3 }, { value: 4 }, { value: 5 }, { value: 4 }, { value: 6 }, { value: 8 }]}
              actions={false}
            />
            <MetricsChart04
              title={formatTimeAgo(summary.lastGeneratedAt)}
              subtitle="Last Generated"
              change="recent"
              changeTrend="positive"
              chartColor="text-fg-warning-secondary"
              chartData={[{ value: 8 }, { value: 10 }, { value: 7 }, { value: 12 }, { value: 9 }, { value: 14 }]}
              actions={false}
            />
            <MetricsChart04
              title={String(summary.totalDownloads)}
              subtitle="Total Downloads"
              change={summary.totalDownloads > 0 ? `${summary.totalDownloads}` : "0"}
              changeTrend="positive"
              chartColor="text-fg-success-secondary"
              chartData={[{ value: 10 }, { value: 15 }, { value: 18 }, { value: 22 }, { value: 25 }, { value: 30 }]}
              actions={false}
            />
          </div>

          {/* Recent Reports */}
          <ReportList
            reports={reports as unknown as import("@/types").Report[]}
            onDownload={handleDownload}
            onRetry={handleRetry}
          />
        </>
      )}

      {/* Generate Report Slideout */}
      <GenerateReportSlideout
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        onGenerate={handleGenerate}
        isLoading={generateMutation.isPending}
      />
    </div>
  );
};
