"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  OrganizationSettings,
  OrganizationSettingsUpdate,
  UserSettings,
  UserSettingsUpdate,
} from "@/types/settings";

const ORG_SETTINGS_KEY = "organization-settings";
const USER_SETTINGS_KEY = "user-settings";

// ============================================================================
// Organization Settings
// ============================================================================

async function fetchOrgSettings(): Promise<OrganizationSettings> {
  const response = await fetch("/api/v1/settings/organization");
  if (!response.ok) {
    throw new Error("Failed to fetch organization settings");
  }
  return response.json();
}

async function updateOrgSettings(
  updates: OrganizationSettingsUpdate
): Promise<OrganizationSettings> {
  const response = await fetch("/api/v1/settings/organization", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update organization settings");
  }
  return response.json();
}

export function useOrganizationSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [ORG_SETTINGS_KEY],
    queryFn: fetchOrgSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: updateOrgSettings,
    onSuccess: (data) => {
      queryClient.setQueryData([ORG_SETTINGS_KEY], data);
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// User Settings
// ============================================================================

async function fetchUserSettings(): Promise<UserSettings> {
  const response = await fetch("/api/v1/settings/user");
  if (!response.ok) {
    throw new Error("Failed to fetch user settings");
  }
  return response.json();
}

async function updateUserSettings(updates: UserSettingsUpdate): Promise<UserSettings> {
  const response = await fetch("/api/v1/settings/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user settings");
  }
  return response.json();
}

export function useUserSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [USER_SETTINGS_KEY],
    queryFn: fetchUserSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: (data) => {
      queryClient.setQueryData([USER_SETTINGS_KEY], data);
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// Theme Hook (convenience wrapper)
// ============================================================================

export function useTheme() {
  const { settings, updateSettings, isUpdating } = useUserSettings();

  const setTheme = async (theme: "light" | "dark" | "system") => {
    await updateSettings({ theme });
  };

  return {
    theme: settings?.theme ?? "system",
    setTheme,
    isUpdating,
  };
}

// ============================================================================
// Combined Settings Hook
// ============================================================================

export function useSettings() {
  const orgSettings = useOrganizationSettings();
  const userSettings = useUserSettings();

  return {
    org: orgSettings,
    user: userSettings,
    isLoading: orgSettings.isLoading || userSettings.isLoading,
  };
}
