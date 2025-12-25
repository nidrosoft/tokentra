export interface Report {
  id: string;
  organizationId: string;
  name: string;
  type: ReportType;
  config: ReportConfig;
  status: ReportStatus;
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type ReportType = "cost_summary" | "usage_summary" | "chargeback" | "optimization" | "custom";

export type ReportStatus = "pending" | "generating" | "completed" | "failed";

export interface ReportConfig {
  dateRange: { from: string; to: string };
  filters?: {
    providers?: string[];
    models?: string[];
    teams?: string[];
    projects?: string[];
  };
  groupBy?: string[];
  format: "pdf" | "csv" | "xlsx";
}

export interface ScheduledReport {
  id: string;
  organizationId: string;
  name: string;
  config: ReportConfig;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  nextRunAt: Date;
  lastRunAt?: Date;
  enabled: boolean;
  createdAt: Date;
}
