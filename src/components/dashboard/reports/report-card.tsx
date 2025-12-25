"use client";

import type { FC } from "react";
import { DocumentDownload, Clock, TickCircle, CloseCircle, Refresh } from "iconsax-react";
import type { Report, ReportStatus, ReportType } from "@/types";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

export interface ReportCardProps {
  report: Report;
  onDownload?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

const typeLabels: Record<ReportType, string> = {
  cost_summary: "Cost Summary",
  usage_summary: "Usage Summary",
  chargeback: "Chargeback",
  optimization: "Optimization",
  custom: "Custom",
};

const statusConfig: Record<ReportStatus, { icon: FC<{ size: number; color: string }>; color: "success" | "warning" | "error" | "brand"; label: string }> = {
  pending: { icon: Clock, color: "brand", label: "Pending" },
  generating: { icon: Refresh, color: "warning", label: "Generating" },
  completed: { icon: TickCircle, color: "success", label: "Completed" },
  failed: { icon: CloseCircle, color: "error", label: "Failed" },
};

const formatLabels: Record<string, string> = {
  pdf: "PDF",
  csv: "CSV",
  xlsx: "Excel",
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const DownloadIcon = ({ className }: { className?: string }) => (
  <DocumentDownload size={16} color="currentColor" className={className} variant="Outline" />
);

export const ReportCard: FC<ReportCardProps> = ({
  report,
  onDownload,
  onRetry,
  className,
}) => {
  const status = statusConfig[report.status];
  const StatusIcon = status.icon;

  return (
    <div
      className={cx(
        "flex items-center justify-between gap-4 rounded-xl border border-secondary bg-primary p-4 shadow-xs",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-medium text-primary">{report.name}</h4>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Badge size="sm" color="gray">
            {typeLabels[report.type]}
          </Badge>
          <Badge size="sm" color="gray">
            {formatLabels[report.config.format]}
          </Badge>
          <Badge size="sm" color={status.color}>
            <StatusIcon size={12} color="currentColor" />
            <span className="ml-1">{status.label}</span>
          </Badge>
        </div>
        <p className="mt-1.5 text-xs text-quaternary">
          Created {formatTimeAgo(report.createdAt)}
          {report.completedAt && ` • Completed ${formatTimeAgo(report.completedAt)}`}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        {report.status === "completed" && (
          <Button
            size="sm"
            color="secondary"
            iconLeading={DownloadIcon}
            onClick={() => onDownload?.(report.id)}
          >
            Download
          </Button>
        )}
        {report.status === "failed" && (
          <Button
            size="sm"
            color="secondary"
            onClick={() => onRetry?.(report.id)}
          >
            Retry
          </Button>
        )}
        {report.status === "generating" && (
          <div className="flex items-center gap-2 text-sm text-tertiary">
            <Refresh size={16} color="currentColor" className="animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};
