"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => apiClient.get("/reports"),
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (config: Record<string, unknown>) => apiClient.post("/reports/generate", config),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: (params: { format: string; dateRange: { from: string; to: string } }) =>
      apiClient.post("/reports/export", params),
  });
}

export function useScheduledReports() {
  return useQuery({
    queryKey: ["scheduled-reports"],
    queryFn: () => apiClient.get("/reports/scheduled"),
  });
}
