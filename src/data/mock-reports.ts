import type { Report, ScheduledReport, ReportType, ReportStatus } from "@/types";

export const mockReports: Report[] = [
  {
    id: "report_1",
    organizationId: "org_1",
    name: "Monthly Cost Summary - December 2024",
    type: "cost_summary",
    config: {
      dateRange: { from: "2024-12-01", to: "2024-12-31" },
      filters: { providers: ["openai", "anthropic"] },
      groupBy: ["provider", "model"],
      format: "pdf",
    },
    status: "completed",
    downloadUrl: "/reports/download/report_1.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
  },
  {
    id: "report_2",
    organizationId: "org_1",
    name: "Team Chargeback Report - Q4 2024",
    type: "chargeback",
    config: {
      dateRange: { from: "2024-10-01", to: "2024-12-31" },
      filters: { teams: ["team_eng", "team_prod", "team_data"] },
      groupBy: ["team", "project"],
      format: "xlsx",
    },
    status: "completed",
    downloadUrl: "/reports/download/report_2.xlsx",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
  },
  {
    id: "report_3",
    organizationId: "org_1",
    name: "Usage Analytics - Last 7 Days",
    type: "usage_summary",
    config: {
      dateRange: { from: "2024-12-17", to: "2024-12-23" },
      groupBy: ["model"],
      format: "csv",
    },
    status: "generating",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "report_4",
    organizationId: "org_1",
    name: "Optimization Opportunities",
    type: "optimization",
    config: {
      dateRange: { from: "2024-12-01", to: "2024-12-23" },
      format: "pdf",
    },
    status: "completed",
    downloadUrl: "/reports/download/report_4.pdf",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 47),
  },
  {
    id: "report_5",
    organizationId: "org_1",
    name: "Weekly Cost Report",
    type: "cost_summary",
    config: {
      dateRange: { from: "2024-12-16", to: "2024-12-22" },
      format: "pdf",
    },
    status: "failed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

export const mockScheduledReports: ScheduledReport[] = [
  {
    id: "sched_1",
    organizationId: "org_1",
    name: "Weekly Cost Summary",
    config: {
      dateRange: { from: "last_7_days", to: "today" },
      groupBy: ["provider", "team"],
      format: "pdf",
    },
    frequency: "weekly",
    recipients: ["admin@example.com", "finance@example.com"],
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    enabled: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "sched_2",
    organizationId: "org_1",
    name: "Monthly Chargeback Report",
    config: {
      dateRange: { from: "last_month", to: "last_month" },
      groupBy: ["team", "project"],
      format: "xlsx",
    },
    frequency: "monthly",
    recipients: ["cfo@example.com", "finance@example.com"],
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 23),
    enabled: true,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "sched_3",
    organizationId: "org_1",
    name: "Daily Usage Digest",
    config: {
      dateRange: { from: "yesterday", to: "yesterday" },
      groupBy: ["model"],
      format: "csv",
    },
    frequency: "daily",
    recipients: ["ops@example.com"],
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    enabled: false,
    createdAt: new Date("2024-03-10"),
  },
];

export const mockReportSummary = {
  totalGenerated: 47,
  scheduledActive: mockScheduledReports.filter((r) => r.enabled).length,
  totalDownloads: 128,
  lastGeneratedAt: mockReports.find((r) => r.status === "completed")?.completedAt || new Date(),
};

export const reportTypeLabels: Record<ReportType, string> = {
  cost_summary: "Cost Summary",
  usage_summary: "Usage Summary",
  chargeback: "Chargeback",
  optimization: "Optimization",
  custom: "Custom",
};

export const reportStatusConfig: Record<ReportStatus, { label: string; color: "success" | "warning" | "error" | "brand" }> = {
  pending: { label: "Pending", color: "brand" },
  generating: { label: "Generating", color: "warning" },
  completed: { label: "Completed", color: "success" },
  failed: { label: "Failed", color: "error" },
};
