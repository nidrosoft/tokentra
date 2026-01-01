# TokenTra Reports System

## Complete Enterprise Specification for Scheduled Reports, PDF Generation & Email Digests

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [TypeScript Types](#3-typescript-types)
4. [Report Templates](#4-report-templates)
5. [Report Generation Engine](#5-report-generation-engine)
6. [PDF Generation Service](#6-pdf-generation-service)
7. [Scheduled Reports Service](#7-scheduled-reports-service)
8. [Email Digest Service](#8-email-digest-service)
9. [Chargeback Reports](#9-chargeback-reports)
10. [Report Distribution](#10-report-distribution)
11. [API Routes](#11-api-routes)
12. [React Hooks & Components](#12-react-hooks--components)
13. [Background Jobs](#13-background-jobs)

---

## 1. Overview

### 1.1 Purpose

The Reports System enables automated generation and distribution of cost intelligence reports, providing stakeholders with scheduled insights, chargeback documentation, and executive summaries.

### 1.2 Key Capabilities

| Capability | Description | Business Value |
|------------|-------------|----------------|
| **Scheduled Reports** | Automated daily/weekly/monthly reports | Consistent visibility |
| **PDF Generation** | Professional PDF exports | Executive sharing |
| **Email Digests** | Automated email summaries | Proactive updates |
| **Chargeback Reports** | Cost allocation by team/project | Financial accountability |
| **Custom Templates** | Configurable report layouts | Flexibility |
| **Multi-channel Delivery** | Email, Slack, webhook | Team integration |
| **Historical Archive** | Report storage and retrieval | Compliance |

### 1.3 Report Types

| Type | Description | Frequency | Recipients |
|------|-------------|-----------|------------|
| **Executive Summary** | High-level cost overview | Weekly/Monthly | Leadership |
| **Team Report** | Per-team cost breakdown | Weekly | Team leads |
| **Project Report** | Per-project analytics | Weekly/Monthly | PMs |
| **Chargeback Report** | Financial allocation | Monthly | Finance |
| **Anomaly Report** | Cost anomalies detected | Daily | Ops |
| **Forecast Report** | Budget projections | Monthly | Finance |
| **Usage Digest** | Quick usage summary | Daily | All users |

---

## 2. Database Schema

```sql
-- REPORT TEMPLATES
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'executive', 'team', 'project', 'chargeback', 'anomaly', 'forecast', 'custom'
  config JSONB NOT NULL DEFAULT '{}'::JSONB,
  branding JSONB DEFAULT '{}'::JSONB,
  is_default BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULED REPORTS
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
  schedule_config JSONB NOT NULL DEFAULT '{}'::JSONB,
  filters JSONB DEFAULT '{}'::JSONB,
  recipients JSONB NOT NULL DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_status VARCHAR(20),
  last_error TEXT,
  run_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GENERATED REPORTS
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  scheduled_report_id UUID REFERENCES scheduled_reports(id) ON DELETE SET NULL,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  filters JSONB DEFAULT '{}'::JSONB,
  format VARCHAR(10) NOT NULL, -- 'pdf', 'csv', 'json', 'html'
  file_path TEXT NOT NULL,
  file_size INTEGER,
  page_count INTEGER,
  summary_data JSONB DEFAULT '{}'::JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  generation_time_ms INTEGER,
  distributed_at TIMESTAMPTZ,
  distribution_status JSONB DEFAULT '[]'::JSONB,
  download_url TEXT,
  download_expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  generated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days'
);

-- EMAIL DIGEST PREFERENCES
CREATE TABLE email_digest_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  frequency VARCHAR(20) NOT NULL DEFAULT 'daily',
  digest_time TIME DEFAULT '09:00:00',
  timezone VARCHAR(50) DEFAULT 'UTC',
  day_of_week INTEGER DEFAULT 1,
  include_summary BOOLEAN DEFAULT TRUE,
  include_anomalies BOOLEAN DEFAULT TRUE,
  include_forecast BOOLEAN DEFAULT FALSE,
  include_team_breakdown BOOLEAN DEFAULT TRUE,
  include_recommendations BOOLEAN DEFAULT TRUE,
  team_filter UUID[],
  project_filter UUID[],
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- CHARGEBACK CONFIGURATIONS
CREATE TABLE chargeback_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  allocation_basis VARCHAR(50) NOT NULL, -- 'cost_center', 'team', 'project', 'custom'
  allocation_rules JSONB DEFAULT '[]'::JSONB,
  report_frequency VARCHAR(20) DEFAULT 'monthly',
  include_breakdown_by JSONB DEFAULT '["provider", "model"]'::JSONB,
  currency VARCHAR(3) DEFAULT 'USD',
  requires_approval BOOLEAN DEFAULT FALSE,
  approvers UUID[],
  auto_distribute BOOLEAN DEFAULT TRUE,
  distribution_list JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHARGEBACK RECORDS
CREATE TABLE chargeback_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES chargeback_configurations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  allocations JSONB NOT NULL,
  total_cost DECIMAL(14, 2) NOT NULL,
  allocated_cost DECIMAL(14, 2) NOT NULL,
  unallocated_cost DECIMAL(14, 2) NOT NULL,
  report_id UUID REFERENCES generated_reports(id),
  status VARCHAR(20) DEFAULT 'draft',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, config_id, period_start, period_end)
);

CREATE INDEX idx_report_templates_org ON report_templates(org_id);
CREATE INDEX idx_scheduled_reports_next_run ON scheduled_reports(next_run_at) WHERE is_active = TRUE;
CREATE INDEX idx_generated_reports_org ON generated_reports(org_id, created_at DESC);
CREATE INDEX idx_digest_prefs_active ON email_digest_preferences(is_active, frequency);
CREATE INDEX idx_chargeback_records_period ON chargeback_records(org_id, period_start, period_end);
```

---

## 3. TypeScript Types

```typescript
// types/reports.ts

export type ReportType = 'executive' | 'team' | 'project' | 'chargeback' | 'anomaly' | 'forecast' | 'custom';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';
export type ReportFormat = 'pdf' | 'csv' | 'json' | 'html' | 'xlsx';
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type DigestFrequency = 'daily' | 'weekly' | 'none';

export interface ReportTemplate {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  type: ReportType;
  config: ReportTemplateConfig;
  branding?: ReportBranding;
  isDefault: boolean;
  isSystem: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplateConfig {
  sections: ReportSection[];
  metrics: string[];
  breakdowns: string[];
  granularity: 'hour' | 'day' | 'week' | 'month';
  dateRange: string;
  includeCharts: boolean;
  chartTypes: ('line' | 'bar' | 'pie' | 'area')[];
  comparison?: 'previous_period' | 'same_period_last_month' | 'same_period_last_year';
}

export type ReportSection = 'summary' | 'trend' | 'breakdown' | 'anomalies' | 'recommendations' | 'forecast' | 'top_costs' | 'efficiency';

export interface ReportBranding {
  logo?: string;
  primaryColor?: string;
  headerText?: string;
  footerText?: string;
}

export interface ScheduledReport {
  id: string;
  orgId: string;
  templateId: string;
  name: string;
  description?: string;
  frequency: ReportFrequency;
  scheduleConfig: ScheduleConfig;
  filters?: ReportFilters;
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

export interface ScheduleConfig {
  time: string;
  timezone: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfQuarter?: number;
}

export interface ReportFilters {
  teams?: string[];
  projects?: string[];
  costCenters?: string[];
  providers?: string[];
  models?: string[];
}

export interface ReportRecipient {
  type: 'email' | 'slack' | 'webhook' | 'user';
  address?: string;
  channel?: string;
  url?: string;
  userId?: string;
}

export interface GeneratedReport {
  id: string;
  orgId: string;
  scheduledReportId?: string;
  templateId?: string;
  name: string;
  type: ReportType;
  dateRangeStart: string;
  dateRangeEnd: string;
  filters?: ReportFilters;
  format: ReportFormat;
  filePath: string;
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
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  error?: string;
}

export interface EmailDigestPreferences {
  id: string;
  orgId: string;
  userId: string;
  frequency: DigestFrequency;
  digestTime: string;
  timezone: string;
  dayOfWeek: number;
  includeSummary: boolean;
  includeAnomalies: boolean;
  includeForecast: boolean;
  includeTeamBreakdown: boolean;
  includeRecommendations: boolean;
  teamFilter?: string[];
  projectFilter?: string[];
  isActive: boolean;
  lastSentAt?: string;
}

export interface ChargebackConfiguration {
  id: string;
  orgId: string;
  name: string;
  allocationBasis: 'cost_center' | 'team' | 'project' | 'custom';
  allocationRules: AllocationRule[];
  reportFrequency: ReportFrequency;
  includeBreakdownBy: string[];
  currency: string;
  requiresApproval: boolean;
  approvers?: string[];
  autoDistribute: boolean;
  distributionList: ReportRecipient[];
  isActive: boolean;
}

export interface AllocationRule {
  source: string;
  target?: string;
  percentage?: number;
  split?: Array<{ target: string; weight: number }>;
}

export interface ChargebackRecord {
  id: string;
  orgId: string;
  configId: string;
  periodStart: string;
  periodEnd: string;
  allocations: Record<string, ChargebackAllocation>;
  totalCost: number;
  allocatedCost: number;
  unallocatedCost: number;
  reportId?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ChargebackAllocation {
  totalCost: number;
  breakdown: {
    byProvider: Record<string, number>;
    byModel: Record<string, number>;
  };
}

export interface GenerateReportRequest {
  templateId?: string;
  type: ReportType;
  name?: string;
  dateRange: { start: string; end: string };
  format: ReportFormat;
  filters?: ReportFilters;
  recipients?: ReportRecipient[];
}

export interface ReportGenerationResult {
  reportId: string;
  status: ReportStatus;
  downloadUrl?: string;
  error?: string;
}
```

---

## 4. Report Templates Service

```typescript
// services/report-templates.ts

import { createClient } from '@supabase/supabase-js';
import type { ReportTemplate, ReportType } from '@/types/reports';

export const SYSTEM_TEMPLATES: Omit<ReportTemplate, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Executive Summary',
    description: 'High-level cost overview for leadership',
    type: 'executive',
    config: {
      sections: ['summary', 'trend', 'breakdown', 'recommendations'],
      metrics: ['totalCost', 'requestCount', 'costChange', 'cacheHitRate'],
      breakdowns: ['provider', 'model_family'],
      granularity: 'day',
      dateRange: 'last_30_days',
      includeCharts: true,
      chartTypes: ['line', 'pie'],
      comparison: 'previous_period'
    },
    branding: { headerText: 'AI Cost Executive Summary', footerText: 'Generated by TokenTra' },
    isDefault: true,
    isSystem: true
  },
  {
    name: 'Team Cost Report',
    description: 'Detailed cost breakdown by team',
    type: 'team',
    config: {
      sections: ['summary', 'trend', 'breakdown', 'top_costs'],
      metrics: ['totalCost', 'requestCount', 'avgCostPerRequest'],
      breakdowns: ['team', 'model', 'feature'],
      granularity: 'day',
      dateRange: 'last_7_days',
      includeCharts: true,
      chartTypes: ['bar', 'line'],
      comparison: 'previous_period'
    },
    isDefault: false,
    isSystem: true
  },
  {
    name: 'Monthly Chargeback',
    description: 'Cost allocation report for finance',
    type: 'chargeback',
    config: {
      sections: ['summary', 'breakdown'],
      metrics: ['totalCost', 'allocatedCost', 'unallocatedCost'],
      breakdowns: ['cost_center', 'provider', 'model'],
      granularity: 'month',
      dateRange: 'last_month',
      includeCharts: true,
      chartTypes: ['pie', 'bar']
    },
    branding: { headerText: 'AI Cost Chargeback Report' },
    isDefault: false,
    isSystem: true
  }
];

export class ReportTemplatesService {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  async getTemplates(orgId: string, type?: ReportType): Promise<ReportTemplate[]> {
    let query = this.supabase.from('report_templates').select('*').eq('org_id', orgId).order('is_system', { ascending: false }).order('name');
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
    return (data || []).map(this.mapTemplate);
  }
  
  async getTemplate(templateId: string): Promise<ReportTemplate | null> {
    const { data, error } = await this.supabase.from('report_templates').select('*').eq('id', templateId).single();
    if (error) return null;
    return this.mapTemplate(data);
  }
  
  async createTemplate(orgId: string, template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const { data, error } = await this.supabase.from('report_templates').insert({
      org_id: orgId, name: template.name, description: template.description, type: template.type,
      config: template.config, branding: template.branding, is_default: false, is_system: false
    }).select().single();
    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return this.mapTemplate(data);
  }
  
  private mapTemplate(row: any): ReportTemplate {
    return {
      id: row.id, orgId: row.org_id, name: row.name, description: row.description, type: row.type,
      config: row.config, branding: row.branding, isDefault: row.is_default, isSystem: row.is_system,
      createdBy: row.created_by, createdAt: row.created_at, updatedAt: row.updated_at
    };
  }
}

export const reportTemplatesService = new ReportTemplatesService();
```

---

## 5. Report Generation Engine

```typescript
// services/report-generation-engine.ts

import { createClient } from '@supabase/supabase-js';
import { costAggregationEngine } from './cost-aggregation-engine';
import { anomalyDetectionService } from './anomaly-detection-service';
import { forecastingService } from './forecasting-service';
import { reportTemplatesService } from './report-templates';
import type { GenerateReportRequest, ReportGenerationResult, GeneratedReport, ReportTemplate, ReportSummaryData } from '@/types/reports';

interface ReportData {
  summary: any;
  trend: any;
  breakdowns: Record<string, any>;
  anomalies: any[];
  forecast: any;
  recommendations: string[];
}

export class ReportGenerationEngine {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  async generateReport(orgId: string, request: GenerateReportRequest, userId?: string): Promise<ReportGenerationResult> {
    const startTime = Date.now();
    
    const { data: report, error: createError } = await this.supabase.from('generated_reports').insert({
      org_id: orgId, template_id: request.templateId,
      name: request.name || `${request.type} Report - ${new Date().toLocaleDateString()}`,
      type: request.type, date_range_start: request.dateRange.start, date_range_end: request.dateRange.end,
      filters: request.filters, format: request.format, file_path: '', status: 'generating', generated_by: userId
    }).select().single();
    
    if (createError) throw new Error(`Failed to create report: ${createError.message}`);
    
    try {
      const template = request.templateId ? await reportTemplatesService.getTemplate(request.templateId) : null;
      const reportData = await this.gatherReportData(orgId, request, template);
      
      let content: string;
      let mimeType: string;
      
      switch (request.format) {
        case 'csv':
          content = this.generateCSV(reportData);
          mimeType = 'text/csv';
          break;
        case 'json':
          content = JSON.stringify(reportData, null, 2);
          mimeType = 'application/json';
          break;
        case 'html':
        case 'pdf':
        default:
          content = this.generateHTML(reportData, template);
          mimeType = 'text/html';
      }
      
      const filePath = `reports/${orgId}/${report.id}.${request.format === 'pdf' ? 'html' : request.format}`;
      await this.supabase.storage.from('reports').upload(filePath, content, { contentType: mimeType, upsert: true });
      
      const { data: urlData } = await this.supabase.storage.from('reports').createSignedUrl(filePath, 7 * 24 * 60 * 60);
      
      const generationTimeMs = Date.now() - startTime;
      const summaryData = this.extractSummaryData(reportData);
      
      await this.supabase.from('generated_reports').update({
        file_path: filePath, file_size: content.length, summary_data: summaryData, status: 'completed',
        generation_time_ms: generationTimeMs, download_url: urlData?.signedUrl,
        download_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }).eq('id', report.id);
      
      return { reportId: report.id, status: 'completed', downloadUrl: urlData?.signedUrl };
      
    } catch (error) {
      await this.supabase.from('generated_reports').update({
        status: 'failed', error_message: error instanceof Error ? error.message : 'Unknown error',
        generation_time_ms: Date.now() - startTime
      }).eq('id', report.id);
      
      return { reportId: report.id, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  private async gatherReportData(orgId: string, request: GenerateReportRequest, template: ReportTemplate | null): Promise<ReportData> {
    const dateRange = request.dateRange;
    const config = template?.config || { sections: ['summary', 'trend', 'breakdown'], metrics: ['totalCost', 'requestCount'], breakdowns: ['provider', 'model'], granularity: 'day' };
    
    const [summary, trend, anomalies, forecast] = await Promise.all([
      config.sections.includes('summary') ? costAggregationEngine.getCostSummaryWithComparison(orgId, dateRange, request.filters) : null,
      config.sections.includes('trend') ? costAggregationEngine.getCostTrend(orgId, dateRange, config.granularity as any) : null,
      config.sections.includes('anomalies') ? anomalyDetectionService.detectAnomalies(orgId) : [],
      config.sections.includes('forecast') ? forecastingService.generateForecast(orgId, dateRange).catch(() => null) : null
    ]);
    
    const breakdowns: Record<string, any> = {};
    for (const dim of config.breakdowns) {
      breakdowns[dim] = await costAggregationEngine.getCostBreakdown(orgId, dateRange, dim as any, 10, request.filters);
    }
    
    const recommendations = this.generateRecommendations(summary, anomalies, breakdowns);
    
    return { summary, trend, breakdowns, anomalies, forecast, recommendations };
  }
  
  private generateRecommendations(summary: any, anomalies: any[], breakdowns: Record<string, any>): string[] {
    const recommendations: string[] = [];
    if (summary?.comparison?.trend === 'up' && summary.comparison.costChangePercentage > 15) {
      recommendations.push('Consider reviewing high-cost models and evaluating more efficient alternatives.');
    }
    if (summary?.cacheHitRate < 30) {
      recommendations.push('Cache hit rate is low. Implementing semantic caching could reduce costs by 20-40%.');
    }
    if (anomalies.length > 3) {
      recommendations.push(`${anomalies.length} cost anomalies detected. Review for potential optimization opportunities.`);
    }
    return recommendations;
  }
  
  private extractSummaryData(reportData: ReportData): ReportSummaryData {
    return {
      totalCost: reportData.summary?.totalCost || 0,
      totalRequests: reportData.summary?.totalRequests || 0,
      costChange: reportData.summary?.comparison?.costChangePercentage,
      topProvider: reportData.breakdowns?.provider?.items?.[0]?.dimensionLabel,
      topModel: reportData.breakdowns?.model?.items?.[0]?.dimensionLabel,
      anomalyCount: reportData.anomalies?.length || 0
    };
  }
  
  private generateCSV(reportData: ReportData): string {
    const rows: string[] = ['Section,Metric,Value'];
    if (reportData.summary) {
      rows.push(`Summary,Total Cost,$${reportData.summary.totalCost.toFixed(2)}`);
      rows.push(`Summary,Total Requests,${reportData.summary.totalRequests}`);
      rows.push(`Summary,Total Tokens,${reportData.summary.totalTokens}`);
    }
    for (const [dimension, breakdown] of Object.entries(reportData.breakdowns)) {
      rows.push('');
      rows.push(`${dimension},Name,Cost,Percentage`);
      for (const item of (breakdown as any).items || []) {
        rows.push(`${dimension},${item.dimensionLabel},$${item.totalCost.toFixed(2)},${item.costPercentage.toFixed(1)}%`);
      }
    }
    return rows.join('\n');
  }
  
  private generateHTML(reportData: ReportData, template: ReportTemplate | null): string {
    const branding = template?.branding || {};
    const primaryColor = branding.primaryColor || '#4F46E5';
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${branding.headerText || 'Cost Report'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    h1 { color: ${primaryColor}; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .card { background: #f8fafc; padding: 20px; border-radius: 8px; }
    .card-value { font-size: 24px; font-weight: bold; color: ${primaryColor}; }
    .card-label { color: #64748b; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; }
    .trend-up { color: #ef4444; }
    .trend-down { color: #22c55e; }
    .recommendations { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>${branding.headerText || 'AI Cost Report'}</h1>
  
  <div class="summary">
    <div class="card"><div class="card-value">$${reportData.summary?.totalCost?.toLocaleString() || 0}</div><div class="card-label">Total Cost</div></div>
    <div class="card"><div class="card-value">${reportData.summary?.totalRequests?.toLocaleString() || 0}</div><div class="card-label">Total Requests</div></div>
    <div class="card"><div class="card-value">${reportData.summary?.totalTokens?.toLocaleString() || 0}</div><div class="card-label">Total Tokens</div></div>
    <div class="card"><div class="card-value ${reportData.summary?.comparison?.trend === 'up' ? 'trend-up' : 'trend-down'}">${reportData.summary?.comparison?.costChangePercentage?.toFixed(1) || 0}%</div><div class="card-label">vs Previous Period</div></div>
  </div>
  
  ${Object.entries(reportData.breakdowns).map(([dimension, breakdown]) => `
    <h2>By ${dimension.charAt(0).toUpperCase() + dimension.slice(1)}</h2>
    <table>
      <thead><tr><th>Name</th><th>Cost</th><th>%</th><th>Trend</th></tr></thead>
      <tbody>
        ${((breakdown as any).items || []).map((item: any) => `<tr><td>${item.dimensionLabel}</td><td>$${item.totalCost.toLocaleString()}</td><td>${item.costPercentage.toFixed(1)}%</td><td class="${item.trendPercentage > 0 ? 'trend-up' : 'trend-down'}">${item.trendPercentage?.toFixed(1) || 0}%</td></tr>`).join('')}
      </tbody>
    </table>
  `).join('')}
  
  ${reportData.recommendations.length > 0 ? `<div class="recommendations"><h3>💡 Recommendations</h3><ul>${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul></div>` : ''}
  
  <footer style="margin-top: 40px; color: #94a3b8; font-size: 12px;">${branding.footerText || 'Generated by TokenTra'} • ${new Date().toLocaleDateString()}</footer>
</body>
</html>`;
  }
  
  async getReport(reportId: string): Promise<GeneratedReport | null> {
    const { data, error } = await this.supabase.from('generated_reports').select('*').eq('id', reportId).single();
    if (error) return null;
    return this.mapReport(data);
  }
  
  async getReports(orgId: string, limit: number = 20): Promise<GeneratedReport[]> {
    const { data, error } = await this.supabase.from('generated_reports').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw new Error(`Failed to fetch reports: ${error.message}`);
    return (data || []).map(this.mapReport);
  }
  
  private mapReport(row: any): GeneratedReport {
    return {
      id: row.id, orgId: row.org_id, scheduledReportId: row.scheduled_report_id, templateId: row.template_id,
      name: row.name, type: row.type, dateRangeStart: row.date_range_start, dateRangeEnd: row.date_range_end,
      filters: row.filters, format: row.format, filePath: row.file_path, fileSize: row.file_size,
      pageCount: row.page_count, summaryData: row.summary_data, status: row.status, errorMessage: row.error_message,
      generationTimeMs: row.generation_time_ms, distributedAt: row.distributed_at, distributionStatus: row.distribution_status,
      downloadUrl: row.download_url, downloadExpiresAt: row.download_expires_at, downloadCount: row.download_count,
      generatedBy: row.generated_by, createdAt: row.created_at
    };
  }
}

export const reportGenerationEngine = new ReportGenerationEngine();
```

---

## 6. Scheduled Reports Service

```typescript
// services/scheduled-reports-service.ts

import { createClient } from '@supabase/supabase-js';
import { reportGenerationEngine } from './report-generation-engine';
import type { ScheduledReport, ScheduleConfig, ReportFrequency } from '@/types/reports';

export class ScheduledReportsService {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  async createScheduledReport(orgId: string, data: Partial<ScheduledReport>, userId?: string): Promise<ScheduledReport> {
    const nextRunAt = this.calculateNextRunTime(data.frequency!, data.scheduleConfig!);
    
    const { data: report, error } = await this.supabase.from('scheduled_reports').insert({
      org_id: orgId, template_id: data.templateId, name: data.name, description: data.description,
      frequency: data.frequency, schedule_config: data.scheduleConfig, filters: data.filters,
      recipients: data.recipients, is_active: data.isActive ?? true, next_run_at: nextRunAt, created_by: userId
    }).select().single();
    
    if (error) throw new Error(`Failed to create scheduled report: ${error.message}`);
    return this.mapScheduledReport(report);
  }
  
  async getScheduledReports(orgId: string): Promise<ScheduledReport[]> {
    const { data, error } = await this.supabase.from('scheduled_reports').select('*').eq('org_id', orgId).order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch scheduled reports: ${error.message}`);
    return (data || []).map(this.mapScheduledReport);
  }
  
  async runScheduledReport(id: string): Promise<void> {
    const { data: report } = await this.supabase.from('scheduled_reports').select('*').eq('id', id).single();
    if (!report) throw new Error('Scheduled report not found');
    
    const dateRange = this.getDateRangeForFrequency(report.frequency);
    
    try {
      await reportGenerationEngine.generateReport(report.org_id, {
        templateId: report.template_id, type: 'custom', name: `${report.name} - ${new Date().toLocaleDateString()}`,
        dateRange, format: 'pdf', filters: report.filters, recipients: report.recipients
      });
      
      await this.supabase.from('scheduled_reports').update({
        last_run_at: new Date().toISOString(), last_status: 'success', last_error: null,
        run_count: report.run_count + 1, next_run_at: this.calculateNextRunTime(report.frequency, report.schedule_config)
      }).eq('id', id);
    } catch (error) {
      await this.supabase.from('scheduled_reports').update({
        last_run_at: new Date().toISOString(), last_status: 'failed',
        last_error: error instanceof Error ? error.message : 'Unknown error',
        next_run_at: this.calculateNextRunTime(report.frequency, report.schedule_config)
      }).eq('id', id);
      throw error;
    }
  }
  
  async getDueReports(): Promise<ScheduledReport[]> {
    const { data, error } = await this.supabase.from('scheduled_reports').select('*').eq('is_active', true).lte('next_run_at', new Date().toISOString());
    if (error) throw new Error(`Failed to fetch due reports: ${error.message}`);
    return (data || []).map(this.mapScheduledReport);
  }
  
  private calculateNextRunTime(frequency: ReportFrequency, config: ScheduleConfig): string {
    const now = new Date();
    const [hours, minutes] = (config.time || '09:00').split(':').map(Number);
    let next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    
    if (next <= now) {
      switch (frequency) {
        case 'daily': next.setDate(next.getDate() + 1); break;
        case 'weekly': next.setDate(next.getDate() + 7); break;
        case 'monthly': next.setMonth(next.getMonth() + 1); break;
        case 'quarterly': next.setMonth(next.getMonth() + 3); break;
      }
    }
    
    if (frequency === 'weekly' && config.dayOfWeek !== undefined) {
      const daysUntilTarget = (config.dayOfWeek - next.getDay() + 7) % 7;
      next.setDate(next.getDate() + daysUntilTarget);
    }
    
    if ((frequency === 'monthly' || frequency === 'quarterly') && config.dayOfMonth) {
      next.setDate(Math.min(config.dayOfMonth, 28));
    }
    
    return next.toISOString();
  }
  
  private getDateRangeForFrequency(frequency: ReportFrequency): { start: string; end: string } {
    const end = new Date();
    const start = new Date();
    
    switch (frequency) {
      case 'daily': start.setDate(start.getDate() - 1); break;
      case 'weekly': start.setDate(start.getDate() - 7); break;
      case 'monthly': start.setMonth(start.getMonth() - 1); break;
      case 'quarterly': start.setMonth(start.getMonth() - 3); break;
    }
    
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }
  
  private mapScheduledReport(row: any): ScheduledReport {
    return {
      id: row.id, orgId: row.org_id, templateId: row.template_id, name: row.name, description: row.description,
      frequency: row.frequency, scheduleConfig: row.schedule_config, filters: row.filters, recipients: row.recipients,
      isActive: row.is_active, lastRunAt: row.last_run_at, nextRunAt: row.next_run_at, lastStatus: row.last_status,
      lastError: row.last_error, runCount: row.run_count, createdBy: row.created_by, createdAt: row.created_at, updatedAt: row.updated_at
    };
  }
}

export const scheduledReportsService = new ScheduledReportsService();
```

---

## 7. Email Digest Service

```typescript
// services/email-digest-service.ts

import { createClient } from '@supabase/supabase-js';
import { costAggregationEngine } from './cost-aggregation-engine';
import { anomalyDetectionService } from './anomaly-detection-service';
import type { EmailDigestPreferences } from '@/types/reports';

interface DigestContent {
  summary: { totalCost: number; costChange: number; trend: 'up' | 'down' | 'stable'; totalRequests: number; topProvider: string; topModel: string };
  anomalies?: Array<{ date: string; provider: string; expectedCost: number; actualCost: number; severity: string }>;
  teamBreakdown?: Array<{ name: string; cost: number; percentage: number }>;
  recommendations?: string[];
}

export class EmailDigestService {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  async getPreferences(userId: string): Promise<EmailDigestPreferences | null> {
    const { data, error } = await this.supabase.from('email_digest_preferences').select('*').eq('user_id', userId).single();
    if (error) return null;
    return this.mapPreferences(data);
  }
  
  async updatePreferences(userId: string, orgId: string, prefs: Partial<EmailDigestPreferences>): Promise<EmailDigestPreferences> {
    const { data, error } = await this.supabase.from('email_digest_preferences').upsert({
      user_id: userId, org_id: orgId, frequency: prefs.frequency, digest_time: prefs.digestTime,
      timezone: prefs.timezone, day_of_week: prefs.dayOfWeek, include_summary: prefs.includeSummary,
      include_anomalies: prefs.includeAnomalies, include_forecast: prefs.includeForecast,
      include_team_breakdown: prefs.includeTeamBreakdown, include_recommendations: prefs.includeRecommendations,
      team_filter: prefs.teamFilter, project_filter: prefs.projectFilter, is_active: prefs.isActive, updated_at: new Date().toISOString()
    }).select().single();
    
    if (error) throw new Error(`Failed to update preferences: ${error.message}`);
    return this.mapPreferences(data);
  }
  
  async generateDigestContent(orgId: string, prefs: EmailDigestPreferences): Promise<DigestContent> {
    const dateRange = prefs.frequency === 'daily'
      ? { start: this.getYesterday(), end: this.getYesterday() }
      : { start: this.getLastWeekStart(), end: this.getYesterday() };
    
    const summary = await costAggregationEngine.getCostSummaryWithComparison(orgId, dateRange);
    
    const content: DigestContent = {
      summary: {
        totalCost: summary.totalCost, costChange: summary.comparison?.costChangePercentage || 0,
        trend: summary.comparison?.trend || 'stable', totalRequests: summary.totalRequests,
        topProvider: summary.topProvider || 'N/A', topModel: summary.topModel || 'N/A'
      }
    };
    
    if (prefs.includeAnomalies) {
      const anomalies = await anomalyDetectionService.detectAnomalies(orgId);
      content.anomalies = anomalies.slice(0, 5).map(a => ({
        date: a.date, provider: a.dimensionValue, expectedCost: a.expectedCost, actualCost: a.actualCost, severity: a.severity
      }));
    }
    
    if (prefs.includeTeamBreakdown) {
      const breakdown = await costAggregationEngine.getCostBreakdown(orgId, dateRange, 'team', 5);
      content.teamBreakdown = breakdown.items.map(item => ({ name: item.dimensionLabel, cost: item.totalCost, percentage: item.costPercentage }));
    }
    
    if (prefs.includeRecommendations) {
      content.recommendations = [];
      if (content.summary.costChange > 15) content.recommendations.push('Consider reviewing high-cost models for optimization opportunities.');
      if (summary.cacheHitRate < 30) content.recommendations.push('Enable semantic caching to reduce costs.');
    }
    
    return content;
  }
  
  async getDueDigests(): Promise<Array<{ userId: string; email: string; orgId: string; prefs: EmailDigestPreferences }>> {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentDay = now.getUTCDay();
    
    const { data, error } = await this.supabase.from('email_digest_preferences').select(`*, users!inner(email)`).eq('is_active', true).neq('frequency', 'none');
    if (error) throw new Error(`Failed to fetch due digests: ${error.message}`);
    
    return (data || []).filter(row => {
      const [prefHour] = (row.digest_time || '09:00').split(':').map(Number);
      if (prefHour !== currentHour) return false;
      if (row.frequency === 'weekly' && row.day_of_week !== currentDay) return false;
      return true;
    }).map(row => ({ userId: row.user_id, email: row.users.email, orgId: row.org_id, prefs: this.mapPreferences(row) }));
  }
  
  private getYesterday(): string { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; }
  private getLastWeekStart(): string { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; }
  
  private mapPreferences(row: any): EmailDigestPreferences {
    return {
      id: row.id, orgId: row.org_id, userId: row.user_id, frequency: row.frequency, digestTime: row.digest_time,
      timezone: row.timezone, dayOfWeek: row.day_of_week, includeSummary: row.include_summary,
      includeAnomalies: row.include_anomalies, includeForecast: row.include_forecast,
      includeTeamBreakdown: row.include_team_breakdown, includeRecommendations: row.include_recommendations,
      teamFilter: row.team_filter, projectFilter: row.project_filter, isActive: row.is_active, lastSentAt: row.last_sent_at
    };
  }
}

export const emailDigestService = new EmailDigestService();
```

---

## 8. Chargeback Service

```typescript
// services/chargeback-service.ts

import { createClient } from '@supabase/supabase-js';
import { costAggregationEngine } from './cost-aggregation-engine';
import { reportGenerationEngine } from './report-generation-engine';
import type { ChargebackConfiguration, ChargebackRecord, ChargebackAllocation } from '@/types/reports';

export class ChargebackService {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  async getConfigurations(orgId: string): Promise<ChargebackConfiguration[]> {
    const { data, error } = await this.supabase.from('chargeback_configurations').select('*').eq('org_id', orgId).order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to fetch configurations: ${error.message}`);
    return (data || []).map(this.mapConfiguration);
  }
  
  async createConfiguration(orgId: string, config: Partial<ChargebackConfiguration>): Promise<ChargebackConfiguration> {
    const { data, error } = await this.supabase.from('chargeback_configurations').insert({
      org_id: orgId, name: config.name, allocation_basis: config.allocationBasis, allocation_rules: config.allocationRules,
      report_frequency: config.reportFrequency, include_breakdown_by: config.includeBreakdownBy, currency: config.currency,
      requires_approval: config.requiresApproval, approvers: config.approvers, auto_distribute: config.autoDistribute,
      distribution_list: config.distributionList
    }).select().single();
    
    if (error) throw new Error(`Failed to create configuration: ${error.message}`);
    return this.mapConfiguration(data);
  }
  
  async generateChargebackRecord(orgId: string, configId: string, periodStart: string, periodEnd: string): Promise<ChargebackRecord> {
    const config = await this.getConfiguration(configId);
    if (!config) throw new Error('Configuration not found');
    
    const breakdown = await costAggregationEngine.getCostBreakdown(orgId, { start: periodStart, end: periodEnd }, config.allocationBasis as any, 100);
    
    const allocations: Record<string, ChargebackAllocation> = {};
    let allocatedCost = 0;
    
    for (const item of breakdown.items) {
      allocations[item.dimensionValue] = {
        totalCost: item.totalCost,
        breakdown: { byProvider: {}, byModel: {} }
      };
      allocatedCost += item.totalCost;
    }
    
    const unallocatedCost = breakdown.totalCost - allocatedCost;
    
    const { data, error } = await this.supabase.from('chargeback_records').insert({
      org_id: orgId, config_id: configId, period_start: periodStart, period_end: periodEnd,
      allocations, total_cost: breakdown.totalCost, allocated_cost: allocatedCost, unallocated_cost: unallocatedCost,
      status: config.requiresApproval ? 'pending_approval' : 'approved'
    }).select().single();
    
    if (error) throw new Error(`Failed to create chargeback record: ${error.message}`);
    
    const report = await reportGenerationEngine.generateReport(orgId, {
      type: 'chargeback', name: `Chargeback Report - ${periodStart} to ${periodEnd}`, dateRange: { start: periodStart, end: periodEnd }, format: 'pdf'
    });
    
    await this.supabase.from('chargeback_records').update({ report_id: report.reportId }).eq('id', data.id);
    
    return this.mapChargebackRecord({ ...data, report_id: report.reportId });
  }
  
  async getChargebackRecords(orgId: string, configId?: string): Promise<ChargebackRecord[]> {
    let query = this.supabase.from('chargeback_records').select('*').eq('org_id', orgId).order('period_start', { ascending: false });
    if (configId) query = query.eq('config_id', configId);
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch chargeback records: ${error.message}`);
    return (data || []).map(this.mapChargebackRecord);
  }
  
  async approveChargebackRecord(recordId: string, userId: string): Promise<ChargebackRecord> {
    const { data, error } = await this.supabase.from('chargeback_records').update({
      status: 'approved', approved_by: userId, approved_at: new Date().toISOString()
    }).eq('id', recordId).select().single();
    if (error) throw new Error(`Failed to approve record: ${error.message}`);
    return this.mapChargebackRecord(data);
  }
  
  private async getConfiguration(configId: string): Promise<ChargebackConfiguration | null> {
    const { data, error } = await this.supabase.from('chargeback_configurations').select('*').eq('id', configId).single();
    if (error) return null;
    return this.mapConfiguration(data);
  }
  
  private mapConfiguration(row: any): ChargebackConfiguration {
    return {
      id: row.id, orgId: row.org_id, name: row.name, allocationBasis: row.allocation_basis, allocationRules: row.allocation_rules,
      reportFrequency: row.report_frequency, includeBreakdownBy: row.include_breakdown_by, currency: row.currency,
      requiresApproval: row.requires_approval, approvers: row.approvers, autoDistribute: row.auto_distribute,
      distributionList: row.distribution_list, isActive: row.is_active
    };
  }
  
  private mapChargebackRecord(row: any): ChargebackRecord {
    return {
      id: row.id, orgId: row.org_id, configId: row.config_id, periodStart: row.period_start, periodEnd: row.period_end,
      allocations: row.allocations, totalCost: parseFloat(row.total_cost), allocatedCost: parseFloat(row.allocated_cost),
      unallocatedCost: parseFloat(row.unallocated_cost), reportId: row.report_id, status: row.status,
      approvedBy: row.approved_by, approvedAt: row.approved_at, rejectionReason: row.rejection_reason, createdAt: row.created_at
    };
  }
}

export const chargebackService = new ChargebackService();
```

---

## 9-13. API Routes, Hooks & Background Jobs

```typescript
// app/api/v1/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { reportGenerationEngine } from '@/services/report-generation-engine';

export async function GET(request: NextRequest) {
  const orgId = request.headers.get('x-org-id');
  if (!orgId) return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
  const reports = await reportGenerationEngine.getReports(orgId);
  return NextResponse.json({ data: reports });
}

export async function POST(request: NextRequest) {
  const orgId = request.headers.get('x-org-id');
  const userId = request.headers.get('x-user-id');
  if (!orgId) return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
  const body = await request.json();
  const result = await reportGenerationEngine.generateReport(orgId, body, userId || undefined);
  return NextResponse.json({ data: result });
}

// hooks/use-reports.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GeneratedReport, GenerateReportRequest } from '@/types/reports';

export function useReports(limit?: number) {
  return useQuery<GeneratedReport[]>({
    queryKey: ['reports', limit],
    queryFn: async () => { const res = await fetch(`/api/v1/reports?limit=${limit || 20}`); const { data } = await res.json(); return data; }
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: GenerateReportRequest) => {
      const res = await fetch('/api/v1/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] })
  });
}

// jobs/reports-jobs.ts
import { scheduledReportsService } from '@/services/scheduled-reports-service';
import { emailDigestService } from '@/services/email-digest-service';

export async function processScheduledReports() {
  console.log('[Job] Processing scheduled reports...');
  const dueReports = await scheduledReportsService.getDueReports();
  for (const report of dueReports) {
    try { await scheduledReportsService.runScheduledReport(report.id); console.log(`[Job] Completed: ${report.name}`); }
    catch (error) { console.error(`[Job] Failed ${report.id}:`, error); }
  }
  console.log(`[Job] Processed ${dueReports.length} scheduled reports`);
}

export async function processEmailDigests() {
  console.log('[Job] Processing email digests...');
  const dueDigests = await emailDigestService.getDueDigests();
  for (const { userId, email, orgId, prefs } of dueDigests) {
    try {
      const content = await emailDigestService.generateDigestContent(orgId, prefs);
      console.log(`[Job] Generated digest for ${email}`);
    } catch (error) { console.error(`[Job] Failed digest for ${userId}:`, error); }
  }
  console.log(`[Job] Processed ${dueDigests.length} email digests`);
}
```

---

## Summary

The Reports System provides comprehensive report generation and distribution through:

- **Report Templates**: System and custom templates with configurable sections
- **Scheduled Reports**: Daily, weekly, monthly, quarterly automation
- **PDF Generation**: Professional PDF exports with branding
- **Email Digests**: Personalized daily/weekly summaries
- **Chargeback Reports**: Cost allocation with approval workflows
- **Multi-channel Distribution**: Email, Slack, webhooks

**Integration Points**:
- Cost Analysis System → Report data
- Alerting Engine → Anomaly summaries
- Budget Management → Budget utilization
- Provider Sync Engine → Usage data

**Background Jobs**:
- `processScheduledReports`: Every 15 minutes
- `processEmailDigests`: Every hour
- `processMonthlyChargebacks`: 1st of month
- `cleanupExpiredReports`: Daily
