"use client";

import type { FC } from "react";
import { useState } from "react";
import type { Report, ReportStatus } from "@/types";
import { ReportCard } from "./report-card";
import { cx } from "@/utils/cx";

export interface ReportListProps {
  reports: Report[];
  onDownload?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

type FilterValue = "all" | ReportStatus;

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "generating", label: "In Progress" },
  { value: "failed", label: "Failed" },
];

export const ReportList: FC<ReportListProps> = ({
  reports,
  onDownload,
  onRetry,
  className,
}) => {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true;
    return report.status === filter;
  });

  return (
    <div className={cx("space-y-4", className)}>
      {/* Header with filters */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-primary">Recent Reports</h3>
          <p className="text-sm text-tertiary">
            {reports.length} reports generated
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cx(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-primary text-primary shadow-sm"
                  : "text-tertiary hover:text-secondary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onDownload={onDownload}
            onRetry={onRetry}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary py-12">
          <p className="text-lg font-medium text-secondary">No reports found</p>
          <p className="mt-1 text-sm text-tertiary">
            {filter === "all"
              ? "Generate your first report to get started"
              : `No ${filter} reports`}
          </p>
        </div>
      )}
    </div>
  );
};
