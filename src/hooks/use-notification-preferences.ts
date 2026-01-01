"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface NotificationPreferences {
  budgetAlerts: boolean;
  costSpikes: boolean;
  weeklySummary: boolean;
  monthlyReport: boolean;
  teamActivity: boolean;
  optimizationTips: boolean;
  securityAlerts: boolean;
  billingAlerts: boolean;
}

const NOTIFICATION_PREFS_KEY = "notification-preferences";

async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await fetch("/api/v1/settings/notifications");
  if (!response.ok) {
    throw new Error("Failed to fetch notification preferences");
  }
  return response.json();
}

async function updateNotificationPreferences(
  updates: Partial<NotificationPreferences>
): Promise<void> {
  const response = await fetch("/api/v1/settings/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update notification preferences");
  }
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [NOTIFICATION_PREFS_KEY],
    queryFn: fetchNotificationPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_PREFS_KEY] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updatePreferences: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    refetch: query.refetch,
  };
}
