"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AlertRule, Alert } from "@/lib/alerting/types";

// API response types
interface AlertRulesResponse {
  success: boolean;
  data: AlertRule[];
  total: number;
}

interface AlertRuleResponse {
  success: boolean;
  data: AlertRule;
}

interface AlertEventsResponse {
  success: boolean;
  data: Alert[];
  total: number;
  summary: {
    active: number;
    critical: number;
  };
}

interface AlertEventResponse {
  success: boolean;
  data: Alert & { timeline?: unknown[] };
}

// ============================================================================
// ALERT RULES HOOKS
// ============================================================================

/**
 * Fetch all alert rules for the organization
 */
export function useAlertRules(params?: { enabled?: boolean; type?: string }) {
  return useQuery({
    queryKey: ["alertRules", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.enabled !== undefined) {
        searchParams.set("enabled", String(params.enabled));
      }
      if (params?.type) {
        searchParams.set("type", params.type);
      }
      
      const url = `/api/v1/alerts${searchParams.toString() ? `?${searchParams}` : ""}`;
      const response = await fetch(url);
      const data: AlertRulesResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to fetch alert rules");
      }
      
      return data;
    },
  });
}

/**
 * Fetch a single alert rule
 */
export function useAlertRule(alertId: string) {
  return useQuery({
    queryKey: ["alertRules", alertId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/alerts/${alertId}`);
      const data: AlertRuleResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to fetch alert rule");
      }
      
      return data.data;
    },
    enabled: !!alertId,
  });
}

/**
 * Create a new alert rule
 */
export function useCreateAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ruleData: Partial<AlertRule>) => {
      const response = await fetch("/api/v1/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
      });
      const data: AlertRuleResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to create alert rule");
      }
      
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertRules"] });
    },
  });
}

/**
 * Update an alert rule
 */
export function useUpdateAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, data }: { alertId: string; data: Partial<AlertRule> }) => {
      const response = await fetch(`/api/v1/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: AlertRuleResponse = await response.json();
      
      if (!result.success) {
        throw new Error("Failed to update alert rule");
      }
      
      return result.data;
    },
    onSuccess: (_, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: ["alertRules", alertId] });
      queryClient.invalidateQueries({ queryKey: ["alertRules"] });
    },
  });
}

/**
 * Delete an alert rule
 */
export function useDeleteAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/v1/alerts/${alertId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to delete alert rule");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertRules"] });
    },
  });
}

/**
 * Toggle alert rule enabled/disabled
 */
export function useToggleAlertRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, enabled }: { alertId: string; enabled: boolean }) => {
      const response = await fetch(`/api/v1/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data: AlertRuleResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to toggle alert rule");
      }
      
      return data.data;
    },
    onSuccess: (_, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: ["alertRules", alertId] });
      queryClient.invalidateQueries({ queryKey: ["alertRules"] });
    },
  });
}

// ============================================================================
// ALERT EVENTS HOOKS
// ============================================================================

/**
 * Fetch triggered alert events
 */
export function useAlertEvents(params?: {
  status?: string;
  severity?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["alertEvents", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set("status", params.status);
      if (params?.severity) searchParams.set("severity", params.severity);
      if (params?.type) searchParams.set("type", params.type);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.offset) searchParams.set("offset", String(params.offset));
      
      const url = `/api/v1/alerts/events${searchParams.toString() ? `?${searchParams}` : ""}`;
      const response = await fetch(url);
      const data: AlertEventsResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to fetch alert events");
      }
      
      return data;
    },
  });
}

/**
 * Fetch a single alert event with timeline
 */
export function useAlertEvent(eventId: string) {
  return useQuery({
    queryKey: ["alertEvents", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/alerts/events/${eventId}`);
      const data: AlertEventResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to fetch alert event");
      }
      
      return data.data;
    },
    enabled: !!eventId,
  });
}

/**
 * Acknowledge an alert event
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, note }: { eventId: string; note?: string }) => {
      const response = await fetch(`/api/v1/alerts/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge", note }),
      });
      const data: AlertEventResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to acknowledge alert");
      }
      
      return data.data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["alertEvents", eventId] });
      queryClient.invalidateQueries({ queryKey: ["alertEvents"] });
    },
  });
}

/**
 * Snooze an alert event
 */
export function useSnoozeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      duration,
      customMinutes,
    }: {
      eventId: string;
      duration: "15m" | "1h" | "4h" | "24h" | "custom";
      customMinutes?: number;
    }) => {
      const response = await fetch(`/api/v1/alerts/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "snooze", duration, customMinutes }),
      });
      const data: AlertEventResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to snooze alert");
      }
      
      return data.data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["alertEvents", eventId] });
      queryClient.invalidateQueries({ queryKey: ["alertEvents"] });
    },
  });
}

/**
 * Resolve an alert event
 */
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      resolution,
      note,
    }: {
      eventId: string;
      resolution: "manual" | "auto_cleared" | "false_positive";
      note?: string;
    }) => {
      const response = await fetch(`/api/v1/alerts/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", resolution, note }),
      });
      const data: AlertEventResponse = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to resolve alert");
      }
      
      return data.data;
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["alertEvents", eventId] });
      queryClient.invalidateQueries({ queryKey: ["alertEvents"] });
    },
  });
}

/**
 * Trigger alert evaluation manually
 */
export function useEvaluateAlerts() {
  return useMutation({
    mutationFn: async (orgId?: string) => {
      const response = await fetch("/api/v1/alerts/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to evaluate alerts");
      }
      
      return data;
    },
  });
}

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

// Keep old names as aliases
export const useAlerts = useAlertRules;
export const useAlert = useAlertRule;
export const useAlertHistory = useAlertEvents;
export const useCreateAlert = useCreateAlertRule;
export const useUpdateAlert = useUpdateAlertRule;
export const useDeleteAlert = useDeleteAlertRule;
export const useToggleAlert = useToggleAlertRule;
