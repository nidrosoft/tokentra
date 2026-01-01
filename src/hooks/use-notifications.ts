"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Notification,
  NotificationListResponse,
  UnreadCount,
  NotificationQuery,
} from "@/types/notifications";

const NOTIFICATIONS_KEY = "notifications";
const UNREAD_COUNT_KEY = "notifications-unread-count";

async function fetchNotifications(query: NotificationQuery = {}): Promise<NotificationListResponse> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.priority) params.set("priority", query.priority);
  if (query.readStatus) params.set("readStatus", query.readStatus);
  if (query.limit) params.set("limit", query.limit.toString());
  if (query.offset) params.set("offset", query.offset.toString());

  const response = await fetch(`/api/v1/notifications?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}

async function fetchUnreadCount(): Promise<UnreadCount> {
  const response = await fetch("/api/v1/notifications/unread-count");
  if (!response.ok) {
    throw new Error("Failed to fetch unread count");
  }
  return response.json();
}

async function markNotificationsAsRead(notificationIds: string[]): Promise<{ success: boolean; count: number }> {
  const response = await fetch("/api/v1/notifications/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationIds }),
  });
  if (!response.ok) {
    throw new Error("Failed to mark notifications as read");
  }
  return response.json();
}

async function markAllNotificationsAsRead(): Promise<{ success: boolean; count: number }> {
  const response = await fetch("/api/v1/notifications/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markAll: true }),
  });
  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }
  return response.json();
}

async function dismissNotification(notificationId: string): Promise<{ success: boolean }> {
  const response = await fetch("/api/v1/notifications/dismiss", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationId }),
  });
  if (!response.ok) {
    throw new Error("Failed to dismiss notification");
  }
  return response.json();
}

export function useNotifications(query: NotificationQuery = {}) {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: [NOTIFICATIONS_KEY, query],
    queryFn: () => fetchNotifications(query),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const unreadCountQuery = useQuery({
    queryKey: [UNREAD_COUNT_KEY],
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: dismissNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });

  return {
    notifications: notificationsQuery.data?.notifications ?? [],
    total: notificationsQuery.data?.total ?? 0,
    hasMore: notificationsQuery.data?.hasMore ?? false,
    unreadCount: unreadCountQuery.data ?? { total: 0, byCategory: {}, byPriority: {} },
    isLoading: notificationsQuery.isLoading,
    isLoadingUnread: unreadCountQuery.isLoading,
    error: notificationsQuery.error,
    markAsRead: (ids: string[]) => markAsReadMutation.mutate(ids),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    dismiss: (id: string) => dismissMutation.mutate(id),
    refetch: () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
    },
  };
}

export function useUnreadCount() {
  const query = useQuery({
    queryKey: [UNREAD_COUNT_KEY],
    queryFn: fetchUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  return {
    unreadCount: query.data ?? { total: 0, byCategory: {}, byPriority: {} },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
