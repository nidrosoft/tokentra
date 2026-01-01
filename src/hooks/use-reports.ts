"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface ReportsSummary {
  totalGenerated: number;
  scheduledActive: number;
  lastGeneratedAt?: string;
  totalDownloads: number;
}

export interface GeneratedReport {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  format: string;
  status: "pending" | "generating" | "completed" | "failed";
  downloadUrl?: string;
  fileSize?: number;
  summaryData?: {
    totalCost: number;
    totalRequests: number;
    topProvider?: string;
    topModel?: string;
  };
  errorMessage?: string;
  generationTimeMs?: number;
  downloadCount: number;
  createdAt: string;
}

export interface ReportsResponse {
  reports: GeneratedReport[];
  summary: ReportsSummary;
}

export interface GenerateReportRequest {
  templateId?: string;
  type: string;
  name?: string;
  dateRange: { start: string; end: string };
  format: string;
  filters?: Record<string, unknown>;
}

export function useReports(limit?: number) {
  return useQuery({
    queryKey: ["reports", limit],
    queryFn: async () => {
      const params = limit ? { limit: String(limit) } : undefined;
      const response = await apiClient.get<{ success: boolean; data: ReportsResponse }>("/reports", { params });
      return response.data;
    },
  });
}

export function useReport(reportId: string) {
  return useQuery({
    queryKey: ["reports", reportId],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: GeneratedReport }>(`/reports/${reportId}`);
      return response.data;
    },
    enabled: !!reportId,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: GenerateReportRequest) => {
      const response = await apiClient.post<{ success: boolean; data: GeneratedReport }>("/reports/generate", config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportId: string) => {
      await apiClient.delete(`/reports/${reportId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useScheduledReports() {
  return useQuery({
    queryKey: ["scheduled-reports"],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: unknown[] }>("/reports/scheduled");
      return response.data;
    },
  });
}
