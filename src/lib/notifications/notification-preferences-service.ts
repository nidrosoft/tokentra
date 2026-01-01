import { createClient } from "@supabase/supabase-js";
import type {
  NotificationPreferences,
  NotificationPreferencesUpdate,
  CategoryPreferences,
} from "@/types/notifications";

// Using untyped client since notification tables are new and not in generated types
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export class NotificationPreferencesService {
  private getDefaultCategoryPreferences(): CategoryPreferences {
    return {
      alert: { email: true, slack: true, inApp: true, push: true },
      budget: { email: true, slack: false, inApp: true, push: false },
      optimization: { email: "daily", slack: false, inApp: true, push: false },
      provider: { email: false, slack: false, inApp: true, push: false },
      report: { email: true, slack: false, inApp: true, push: false },
      team: { email: false, slack: false, inApp: true, push: false },
      system: { email: false, slack: false, inApp: true, push: false },
      billing: { email: true, slack: false, inApp: true, push: false },
      security: { email: true, slack: false, inApp: true, push: true },
    };
  }

  private getDefaultPreferences(userId: string, orgId: string): NotificationPreferences {
    return {
      id: "",
      userId,
      orgId,
      notificationsEnabled: true,
      dndEnabled: false,
      dndStartTime: "22:00",
      dndEndTime: "08:00",
      dndTimezone: "UTC",
      dndOverrideUrgent: true,
      emailEnabled: true,
      emailFrequency: "instant",
      emailDigestTime: "09:00",
      emailDigestDay: 1,
      slackEnabled: false,
      slackDmEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      inAppSound: true,
      inAppDesktopNotifications: true,
      categoryPreferences: this.getDefaultCategoryPreferences(),
      maxNotificationsPerHour: 50,
      maxEmailsPerDay: 20,
      updatedAt: new Date().toISOString(),
    };
  }

  private mapPreferences(row: Record<string, unknown>): NotificationPreferences {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      orgId: row.org_id as string,
      notificationsEnabled: row.notifications_enabled as boolean,
      dndEnabled: row.dnd_enabled as boolean,
      dndStartTime: row.dnd_start_time as string | undefined,
      dndEndTime: row.dnd_end_time as string | undefined,
      dndTimezone: (row.dnd_timezone as string) ?? "UTC",
      dndOverrideUrgent: row.dnd_override_urgent as boolean,
      emailEnabled: row.email_enabled as boolean,
      emailAddress: row.email_address as string | undefined,
      emailFrequency: row.email_frequency as NotificationPreferences["emailFrequency"],
      emailDigestTime: (row.email_digest_time as string) ?? "09:00",
      emailDigestDay: (row.email_digest_day as number) ?? 1,
      slackEnabled: row.slack_enabled as boolean,
      slackUserId: row.slack_user_id as string | undefined,
      slackDmEnabled: row.slack_dm_enabled as boolean,
      pushEnabled: row.push_enabled as boolean,
      pushSubscription: row.push_subscription as NotificationPreferences["pushSubscription"],
      inAppEnabled: row.in_app_enabled as boolean,
      inAppSound: row.in_app_sound as boolean,
      inAppDesktopNotifications: row.in_app_desktop_notifications as boolean,
      categoryPreferences: (row.category_preferences as CategoryPreferences) ?? {},
      maxNotificationsPerHour: (row.max_notifications_per_hour as number) ?? 50,
      maxEmailsPerDay: (row.max_emails_per_day as number) ?? 20,
      updatedAt: row.updated_at as string,
    };
  }

  async getPreferences(userId: string, orgId: string): Promise<NotificationPreferences> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .eq("org_id", orgId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching preferences:", error);
    }

    if (!data) {
      return this.getDefaultPreferences(userId, orgId);
    }

    return this.mapPreferences(data);
  }

  async updatePreferences(
    userId: string,
    orgId: string,
    updates: NotificationPreferencesUpdate
  ): Promise<NotificationPreferences> {
    const supabase = getSupabaseAdmin();

    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (updates.notificationsEnabled !== undefined) {
      dbUpdates.notifications_enabled = updates.notificationsEnabled;
    }
    if (updates.dndEnabled !== undefined) {
      dbUpdates.dnd_enabled = updates.dndEnabled;
    }
    if (updates.dndStartTime !== undefined) {
      dbUpdates.dnd_start_time = updates.dndStartTime;
    }
    if (updates.dndEndTime !== undefined) {
      dbUpdates.dnd_end_time = updates.dndEndTime;
    }
    if (updates.dndTimezone !== undefined) {
      dbUpdates.dnd_timezone = updates.dndTimezone;
    }
    if (updates.dndOverrideUrgent !== undefined) {
      dbUpdates.dnd_override_urgent = updates.dndOverrideUrgent;
    }
    if (updates.emailEnabled !== undefined) {
      dbUpdates.email_enabled = updates.emailEnabled;
    }
    if (updates.emailFrequency !== undefined) {
      dbUpdates.email_frequency = updates.emailFrequency;
    }
    if (updates.emailDigestTime !== undefined) {
      dbUpdates.email_digest_time = updates.emailDigestTime;
    }
    if (updates.emailDigestDay !== undefined) {
      dbUpdates.email_digest_day = updates.emailDigestDay;
    }
    if (updates.slackEnabled !== undefined) {
      dbUpdates.slack_enabled = updates.slackEnabled;
    }
    if (updates.slackDmEnabled !== undefined) {
      dbUpdates.slack_dm_enabled = updates.slackDmEnabled;
    }
    if (updates.pushEnabled !== undefined) {
      dbUpdates.push_enabled = updates.pushEnabled;
    }
    if (updates.inAppEnabled !== undefined) {
      dbUpdates.in_app_enabled = updates.inAppEnabled;
    }
    if (updates.inAppSound !== undefined) {
      dbUpdates.in_app_sound = updates.inAppSound;
    }
    if (updates.inAppDesktopNotifications !== undefined) {
      dbUpdates.in_app_desktop_notifications = updates.inAppDesktopNotifications;
    }
    if (updates.categoryPreferences !== undefined) {
      dbUpdates.category_preferences = updates.categoryPreferences;
    }
    if (updates.maxNotificationsPerHour !== undefined) {
      dbUpdates.max_notifications_per_hour = updates.maxNotificationsPerHour;
    }
    if (updates.maxEmailsPerDay !== undefined) {
      dbUpdates.max_emails_per_day = updates.maxEmailsPerDay;
    }

    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: userId,
          org_id: orgId,
          ...dbUpdates,
        },
        { onConflict: "user_id,org_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating preferences:", error);
      return this.getDefaultPreferences(userId, orgId);
    }

    return this.mapPreferences(data);
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
