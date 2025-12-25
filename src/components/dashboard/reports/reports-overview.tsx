"use client";

import type { FC } from "react";
import { useState } from "react";
import { DocumentText, Calendar, DocumentDownload, Clock } from "iconsax-react";
import type { Report, ReportType, ReportConfig } from "@/types";
import { ReportBuilder } from "./report-builder";
import { ReportList } from "./report-list";
import { mockReports, mockReportSummary } from "@/data/mock-reports";

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return date.toLocaleDateString();
};

export const ReportsOverview: FC = () => {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (config: ReportConfig & { name: string; type: ReportType }) => {
    setIsGenerating(true);
    
    // Create new report with generating status
    const newReport: Report = {
      id: `report_${Date.now()}`,
      organizationId: "org_1",
      name: config.name,
      type: config.type,
      config: {
        dateRange: config.dateRange,
        groupBy: config.groupBy,
        format: config.format,
      },
      status: "generating",
      createdAt: new Date(),
    };

    setReports((prev) => [newReport, ...prev]);

    // Simulate report generation
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === newReport.id
            ? {
                ...r,
                status: "completed",
                downloadUrl: `/reports/download/${r.id}.${config.format}`,
                completedAt: new Date(),
              }
            : r
        )
      );
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownload = (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (report?.downloadUrl) {
      console.log("Downloading:", report.downloadUrl);
    }
  };

  const handleRetry = (id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "generating" } : r
      )
    );

    // Simulate retry
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "completed",
                downloadUrl: `/reports/download/${r.id}.${r.config.format}`,
                completedAt: new Date(),
              }
            : r
        )
      );
    }, 2000);
  };

  const completedCount = reports.filter((r) => r.status === "completed").length;

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
          Reports
        </h1>
        <p className="text-md text-tertiary">
          Generate, schedule, and export cost reports.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
              <DocumentText size={20} color="#7F56D9" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Reports Generated</p>
              <p className="text-2xl font-semibold text-primary">{mockReportSummary.totalGenerated}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success-secondary">
              <Calendar size={20} color="#17B26A" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Scheduled Reports</p>
              <p className="text-2xl font-semibold text-primary">{mockReportSummary.scheduledActive}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning-secondary">
              <Clock size={20} color="#F79009" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Last Generated</p>
              <p className="text-lg font-semibold text-primary">{formatTimeAgo(mockReportSummary.lastGeneratedAt)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
              <DocumentDownload size={20} color="#7F56D9" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Total Downloads</p>
              <p className="text-2xl font-semibold text-primary">{mockReportSummary.totalDownloads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Report Builder */}
        <div>
          <ReportBuilder onGenerate={handleGenerate} isLoading={isGenerating} />
        </div>

        {/* Recent Reports */}
        <div className="xl:col-span-2">
          <ReportList
            reports={reports}
            onDownload={handleDownload}
            onRetry={handleRetry}
          />
        </div>
      </div>
    </div>
  );
};
