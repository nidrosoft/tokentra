import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type ReportType = "executive" | "team" | "project" | "chargeback" | "anomaly" | "forecast" | "custom";
export type ReportFrequency = "daily" | "weekly" | "monthly" | "quarterly";
export type ReportFormat = "pdf" | "csv" | "json" | "html" | "xlsx";
export type ReportStatus = "pending" | "generating" | "completed" | "failed";

export interface ReportTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: ReportType;
  config: Record<string, unknown>;
  branding?: Record<string, unknown>;
  isDefault: boolean;
  isSystem: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  id: string;
  organizationId: string;
  scheduledReportId?: string;
  templateId?: string;
  name: string;
  type: ReportType;
  dateRangeStart: string;
  dateRangeEnd: string;
  filters?: Record<string, unknown>;
  format: ReportFormat;
  filePath?: string;
  fileSize?: number;
  pageCount?: number;
  summaryData?: ReportSummaryData;
  status: ReportStatus;
  errorMessage?: string;
  generationTimeMs?: number;
  distributedAt?: string;
  distributionStatus?: DistributionStatus[];
  downloadUrl?: string;
  downloadExpiresAt?: string;
  downloadCount: number;
  generatedBy?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ReportSummaryData {
  totalCost: number;
  totalRequests: number;
  costChange?: number;
  topProvider?: string;
  topModel?: string;
  anomalyCount?: number;
}

export interface DistributionStatus {
  channel: string;
  recipient: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string;
  error?: string;
}

export interface ScheduledReport {
  id: string;
  organizationId: string;
  templateId?: string;
  name: string;
  description?: string;
  frequency: ReportFrequency;
  scheduleConfig: Record<string, unknown>;
  filters?: Record<string, unknown>;
  recipients: ReportRecipient[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  lastStatus?: ReportStatus;
  lastError?: string;
  runCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRecipient {
  type: "email" | "slack" | "webhook" | "user";
  address?: string;
  channel?: string;
  url?: string;
  userId?: string;
}

export interface GenerateReportRequest {
  templateId?: string;
  type: ReportType;
  name?: string;
  dateRange: { start: string; end: string };
  format: ReportFormat;
  filters?: Record<string, unknown>;
}

export interface ReportsSummary {
  totalGenerated: number;
  scheduledActive: number;
  lastGeneratedAt?: string;
  totalDownloads: number;
}

class ReportsService {
  async getReports(organizationId: string, limit = 50): Promise<GeneratedReport[]> {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching reports:", error);
      return [];
    }
    
    return (data || []).map(this.mapGeneratedReport);
  }

  async getReport(reportId: string): Promise<GeneratedReport | null> {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return this.mapGeneratedReport(data);
  }

  async getSummary(organizationId: string): Promise<ReportsSummary> {
    const supabase = getSupabaseAdmin();
    
    const [reportsResult, scheduledResult] = await Promise.all([
      supabase
        .from("reports")
        .select("id, created_at, download_count")
        .eq("organization_id", organizationId)
        .eq("status", "completed"),
      supabase
        .from("scheduled_reports")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("is_active", true),
    ]);
    
    const reports = reportsResult.data || [];
    const scheduled = scheduledResult.data || [];
    
    const totalDownloads = reports.reduce((sum, r: Record<string, unknown>) => sum + (Number(r.download_count) || 0), 0);
    const lastReport = reports[0] as Record<string, unknown> | undefined;
    
    return {
      totalGenerated: reports.length,
      scheduledActive: scheduled.length,
      lastGeneratedAt: lastReport?.created_at as string | undefined,
      totalDownloads,
    };
  }

  async generateReport(
    organizationId: string,
    request: GenerateReportRequest,
    userId?: string
  ): Promise<GeneratedReport> {
    const supabase = getSupabaseAdmin();
    const startTime = Date.now();
    
    const reportName = request.name || `${request.type} Report - ${new Date().toLocaleDateString()}`;
    
    const { data: report, error: createError } = await supabase
      .from("reports")
      .insert({
        organization_id: organizationId,
        template_id: request.templateId,
        name: reportName,
        type: request.type,
        date_range_start: request.dateRange.start,
        date_range_end: request.dateRange.end,
        filters: request.filters || {},
        format: request.format,
        config: { groupBy: request.filters?.groupBy || [] },
        status: "generating",
        created_by: userId,
      })
      .select()
      .single();
    
    if (createError || !report) {
      throw new Error(`Failed to create report: ${createError?.message}`);
    }
    
    try {
      const reportData = await this.gatherReportData(organizationId, request);
      const content = this.generateReportContent(reportData, request.format);
      
      const generationTimeMs = Date.now() - startTime;
      
      const { error: updateError } = await supabase
        .from("reports")
        .update({
          file_size: content.length,
          summary_data: reportData.summary,
          status: "completed",
          completed_at: new Date().toISOString(),
          generation_time_ms: generationTimeMs,
          download_url: `/api/v1/reports/${report.id}/download`,
        })
        .eq("id", report.id);
      
      if (updateError) {
        throw new Error(`Failed to update report: ${updateError.message}`);
      }
      
      return this.mapGeneratedReport({
        ...report,
        status: "completed",
        completed_at: new Date().toISOString(),
        generation_time_ms: generationTimeMs,
        download_url: `/api/v1/reports/${report.id}/download`,
      });
    } catch (error) {
      await supabase
        .from("reports")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", report.id);
      
      throw error;
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);
    
    if (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }
  }

  async incrementDownloadCount(reportId: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    
    const { data: report } = await supabase
      .from("reports")
      .select("download_count")
      .eq("id", reportId)
      .single();
    
    if (report) {
      await supabase
        .from("reports")
        .update({ download_count: (Number(report.download_count) || 0) + 1 })
        .eq("id", reportId);
    }
  }

  private async gatherReportData(
    organizationId: string,
    request: GenerateReportRequest
  ): Promise<{ summary: ReportSummaryData; records: unknown[] }> {
    const supabase = getSupabaseAdmin();
    
    const { data: usageData } = await supabase
      .from("usage_records")
      .select("*")
      .eq("organization_id", organizationId)
      .gte("timestamp", request.dateRange.start)
      .lte("timestamp", request.dateRange.end);
    
    const records = usageData || [];
    
    const totalCost = records.reduce((sum, r) => sum + (Number(r.total_cost) || 0), 0);
    const totalRequests = records.length;
    
    const providerCounts: Record<string, number> = {};
    const modelCounts: Record<string, number> = {};
    
    records.forEach((r) => {
      if (r.provider) {
        providerCounts[r.provider] = (providerCounts[r.provider] || 0) + 1;
      }
      if (r.model) {
        modelCounts[r.model] = (modelCounts[r.model] || 0) + 1;
      }
    });
    
    const topProvider = Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    return {
      summary: {
        totalCost,
        totalRequests,
        topProvider,
        topModel,
      },
      records,
    };
  }

  private generateReportContent(
    data: { summary: ReportSummaryData; records: unknown[] },
    format: ReportFormat
  ): string {
    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2);
      case "csv":
        return this.generateCSV(data.records);
      case "html":
        return this.generateHTML(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  private generateCSV(records: unknown[]): string {
    if (records.length === 0) return "";
    
    const headers = Object.keys(records[0] as Record<string, unknown>);
    const rows = records.map((r) =>
      headers.map((h) => String((r as Record<string, unknown>)[h] ?? "")).join(",")
    );
    
    return [headers.join(","), ...rows].join("\n");
  }

  private generateHTML(data: { summary: ReportSummaryData; records: unknown[] }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Cost Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .summary { margin-bottom: 20px; }
    .metric { display: inline-block; margin-right: 30px; }
    .metric-value { font-size: 24px; font-weight: bold; }
    .metric-label { color: #666; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f4f4f4; }
  </style>
</head>
<body>
  <h1>AI Cost Report</h1>
  <div class="summary">
    <div class="metric">
      <div class="metric-value">$${data.summary.totalCost.toFixed(2)}</div>
      <div class="metric-label">Total Cost</div>
    </div>
    <div class="metric">
      <div class="metric-value">${data.summary.totalRequests.toLocaleString()}</div>
      <div class="metric-label">Total Requests</div>
    </div>
    ${data.summary.topProvider ? `
    <div class="metric">
      <div class="metric-value">${data.summary.topProvider}</div>
      <div class="metric-label">Top Provider</div>
    </div>
    ` : ""}
  </div>
  <p>Records: ${data.records.length}</p>
</body>
</html>
    `.trim();
  }

  private mapGeneratedReport(row: Record<string, unknown>): GeneratedReport {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      scheduledReportId: row.scheduled_report_id as string | undefined,
      templateId: row.template_id as string | undefined,
      name: row.name as string,
      type: row.type as ReportType,
      dateRangeStart: row.date_range_start as string,
      dateRangeEnd: row.date_range_end as string,
      filters: row.filters as Record<string, unknown> | undefined,
      format: row.format as ReportFormat,
      filePath: row.file_path as string | undefined,
      fileSize: row.file_size as number | undefined,
      pageCount: row.page_count as number | undefined,
      summaryData: row.summary_data as ReportSummaryData | undefined,
      status: row.status as ReportStatus,
      errorMessage: row.error_message as string | undefined,
      generationTimeMs: row.generation_time_ms as number | undefined,
      distributedAt: row.distributed_at as string | undefined,
      distributionStatus: row.distribution_status as DistributionStatus[] | undefined,
      downloadUrl: row.download_url as string | undefined,
      downloadExpiresAt: row.download_expires_at as string | undefined,
      downloadCount: (row.download_count as number) || 0,
      generatedBy: row.generated_by as string | undefined,
      createdAt: row.created_at as string,
      expiresAt: row.expires_at as string | undefined,
    };
  }
}

export const reportsService = new ReportsService();
