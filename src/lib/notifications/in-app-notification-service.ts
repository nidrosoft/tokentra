import { createClient } from "@supabase/supabase-js";
import type {
  Notification,
  NotificationQuery,
  NotificationListResponse,
  UnreadCount,
  CreateNotificationRequest,
  NotificationCategory,
  NotificationPriority,
} from "@/types/notifications";

// Using untyped client since notification tables are new and not in generated types
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export class InAppNotificationService {
  private mapNotification(row: Record<string, unknown>): Notification {
    return {
      id: row.id as string,
      orgId: row.org_id as string,
      recipientType: row.recipient_type as Notification["recipientType"],
      recipientId: row.recipient_id as string,
      category: row.category as NotificationCategory,
      subcategory: row.subcategory as string | undefined,
      priority: row.priority as NotificationPriority,
      title: row.title as string,
      body: row.body as string,
      bodyHtml: row.body_html as string | undefined,
      icon: row.icon as string | undefined,
      color: row.color as string | undefined,
      sourceType: row.source_type as string,
      sourceId: row.source_id as string | undefined,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      primaryActionLabel: row.primary_action_label as string | undefined,
      primaryActionUrl: row.primary_action_url as string | undefined,
      secondaryActionLabel: row.secondary_action_label as string | undefined,
      secondaryActionUrl: row.secondary_action_url as string | undefined,
      readAt: row.read_at as string | undefined,
      archivedAt: row.archived_at as string | undefined,
      dismissedAt: row.dismissed_at as string | undefined,
      deliveryStatus: (row.delivery_status as Notification["deliveryStatus"]) ?? {},
      createdAt: row.created_at as string,
      expiresAt: row.expires_at as string | undefined,
      dedupKey: row.dedup_key as string | undefined,
    };
  }

  async getNotifications(
    userId: string,
    orgId: string,
    query: NotificationQuery = {}
  ): Promise<NotificationListResponse> {
    const { category, priority, readStatus = "all", limit = 20, offset = 0 } = query;
    const supabase = getSupabaseAdmin();

    let dbQuery = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("recipient_type", "user")
      .eq("recipient_id", userId)
      .eq("org_id", orgId)
      .is("dismissed_at", null)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      dbQuery = dbQuery.eq("category", category);
    }
    if (priority) {
      dbQuery = dbQuery.eq("priority", priority);
    }
    if (readStatus === "read") {
      dbQuery = dbQuery.not("read_at", "is", null);
    } else if (readStatus === "unread") {
      dbQuery = dbQuery.is("read_at", null);
    }

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error("Error fetching notifications:", error);
      return { notifications: [], total: 0, unreadCount: 0, hasMore: false };
    }

    const notifications = (data || []).map((row) => this.mapNotification(row));
    const total = count ?? 0;
    const unreadCountResult = await this.getUnreadCount(userId, orgId);

    return {
      notifications,
      total,
      unreadCount: unreadCountResult.total,
      hasMore: offset + notifications.length < total,
    };
  }

  async getUnreadCount(userId: string, orgId: string): Promise<UnreadCount> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.rpc("get_unread_notification_count", {
      p_user_id: userId,
      p_org_id: orgId,
    });

    if (error) {
      console.error("Error fetching unread count:", error);
      return { total: 0, byCategory: {}, byPriority: {} };
    }

    const result = data?.[0];
    return {
      total: result?.total ?? 0,
      byCategory: result?.by_category ?? {},
      byPriority: result?.by_priority ?? {},
    };
  }

  async markAsRead(userId: string, notificationIds: string[]): Promise<number> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.rpc("mark_notifications_read", {
      p_user_id: userId,
      p_notification_ids: notificationIds,
      p_mark_all: false,
    });

    if (error) {
      console.error("Error marking notifications as read:", error);
      return 0;
    }

    return data ?? 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.rpc("mark_notifications_read", {
      p_user_id: userId,
      p_notification_ids: [],
      p_mark_all: true,
    });

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return 0;
    }

    return data ?? 0;
  }

  async dismiss(notificationId: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("notifications")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("recipient_type", "user")
      .eq("recipient_id", userId);

    if (error) {
      console.error("Error dismissing notification:", error);
      return false;
    }

    return true;
  }

  async createNotification(
    orgId: string,
    request: CreateNotificationRequest
  ): Promise<Notification | null> {
    const supabase = getSupabaseAdmin();

    const notificationData = {
      org_id: orgId,
      recipient_type: request.recipientType,
      recipient_id: request.recipientId,
      category: request.category ?? "system",
      subcategory: request.subcategory,
      priority: request.priority ?? "normal",
      title: request.title ?? "",
      body: request.body ?? "",
      body_html: request.bodyHtml,
      icon: request.icon,
      color: request.color,
      source_type: request.sourceType,
      source_id: request.sourceId,
      metadata: request.metadata ?? {},
      primary_action_label: request.primaryActionLabel,
      primary_action_url: request.primaryActionUrl,
      secondary_action_label: request.secondaryActionLabel,
      secondary_action_url: request.secondaryActionUrl,
      dedup_key: request.dedupKey,
      expires_at: request.expiresIn
        ? new Date(Date.now() + request.expiresIn * 1000).toISOString()
        : null,
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    return this.mapNotification(data);
  }

  async createBatchNotifications(
    orgId: string,
    recipientIds: string[],
    request: Omit<CreateNotificationRequest, "recipientId" | "recipientIds">
  ): Promise<number> {
    const supabase = getSupabaseAdmin();

    const notifications = recipientIds.map((recipientId) => ({
      org_id: orgId,
      recipient_type: request.recipientType,
      recipient_id: recipientId,
      category: request.category ?? "system",
      subcategory: request.subcategory,
      priority: request.priority ?? "normal",
      title: request.title ?? "",
      body: request.body ?? "",
      body_html: request.bodyHtml,
      icon: request.icon,
      color: request.color,
      source_type: request.sourceType,
      source_id: request.sourceId,
      metadata: request.metadata ?? {},
      primary_action_label: request.primaryActionLabel,
      primary_action_url: request.primaryActionUrl,
      dedup_key: request.dedupKey,
    }));

    const { data, error } = await supabase
      .from("notifications")
      .insert(notifications)
      .select("id");

    if (error) {
      console.error("Error creating batch notifications:", error);
      return 0;
    }

    return data?.length ?? 0;
  }
}

export const inAppNotificationService = new InAppNotificationService();
