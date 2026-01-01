import { createClient } from "@supabase/supabase-js";
import type {
  UserSettings,
  UserSettingsUpdate,
  RecentPage,
  TablePreference,
  ChartPreference,
} from "@/types/settings";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export class UserSettingsService {
  private getDefaults(userId: string, orgId: string): UserSettings {
    return {
      id: "",
      userId,
      orgId,
      theme: "system",
      defaultDashboardView: "overview",
      defaultDateRange: "30d",
      pinnedWidgets: [],
      collapsedSections: [],
      sidebarCollapsed: false,
      recentPages: [],
      favoritePages: [],
      tablePreferences: {},
      chartPreferences: {},
      shortcutsEnabled: true,
      customShortcuts: {},
      reduceMotion: false,
      highContrast: false,
      fontSize: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getSettings(userId: string, orgId: string): Promise<UserSettings> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .eq("org_id", orgId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user settings:", error);
      throw new Error(`Failed to get settings: ${error.message}`);
    }

    return data ? this.mapSettings(data) : this.getDefaults(userId, orgId);
  }

  async updateSettings(
    userId: string,
    orgId: string,
    updates: UserSettingsUpdate
  ): Promise<UserSettings> {
    const supabase = getSupabaseAdmin();

    const dbUpdates = this.mapToDb(updates);
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("user_settings")
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
      console.error("Error updating user settings:", error);
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    return this.mapSettings(data);
  }

  async setTheme(
    userId: string,
    orgId: string,
    theme: "light" | "dark" | "system"
  ): Promise<void> {
    await this.updateSettings(userId, orgId, { theme });
  }

  async toggleSidebar(userId: string, orgId: string): Promise<boolean> {
    const settings = await this.getSettings(userId, orgId);
    const newValue = !settings.sidebarCollapsed;
    await this.updateSettings(userId, orgId, { sidebarCollapsed: newValue });
    return newValue;
  }

  async addRecentPage(
    userId: string,
    orgId: string,
    path: string,
    title: string
  ): Promise<void> {
    const settings = await this.getSettings(userId, orgId);

    const recentPages = settings.recentPages.filter((p) => p.path !== path);
    recentPages.unshift({
      path,
      title,
      visitedAt: new Date().toISOString(),
    });

    // Keep only last 10 pages
    const trimmedPages = recentPages.slice(0, 10);

    const supabase = getSupabaseAdmin();
    await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          org_id: orgId,
          recent_pages: trimmedPages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,org_id" }
      );
  }

  async addFavoritePage(userId: string, orgId: string, path: string): Promise<void> {
    const settings = await this.getSettings(userId, orgId);

    if (!settings.favoritePages.includes(path)) {
      const favoritePages = [...settings.favoritePages, path];

      const supabase = getSupabaseAdmin();
      await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: userId,
            org_id: orgId,
            favorite_pages: favoritePages,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,org_id" }
        );
    }
  }

  async removeFavoritePage(userId: string, orgId: string, path: string): Promise<void> {
    const settings = await this.getSettings(userId, orgId);
    const favoritePages = settings.favoritePages.filter((p) => p !== path);

    const supabase = getSupabaseAdmin();
    await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          org_id: orgId,
          favorite_pages: favoritePages,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,org_id" }
      );
  }

  async updateTablePreference(
    userId: string,
    orgId: string,
    tableId: string,
    preference: TablePreference
  ): Promise<void> {
    const settings = await this.getSettings(userId, orgId);

    const tablePreferences = {
      ...settings.tablePreferences,
      [tableId]: preference,
    };

    await this.updateSettings(userId, orgId, { tablePreferences });
  }

  private mapSettings(row: Record<string, unknown>): UserSettings {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      orgId: row.org_id as string,
      displayName: row.display_name as string | undefined,
      avatarUrl: row.avatar_url as string | undefined,
      timezone: row.timezone as string | undefined,
      locale: row.locale as string | undefined,
      dateFormat: row.date_format as string | undefined,
      theme: (row.theme as UserSettings["theme"]) || "system",
      defaultDashboardView: (row.default_dashboard_view as string) || "overview",
      defaultDateRange: (row.default_date_range as string) || "30d",
      pinnedWidgets: (row.pinned_widgets as string[]) || [],
      collapsedSections: (row.collapsed_sections as string[]) || [],
      sidebarCollapsed: (row.sidebar_collapsed as boolean) || false,
      recentPages: (row.recent_pages as RecentPage[]) || [],
      favoritePages: (row.favorite_pages as string[]) || [],
      tablePreferences: (row.table_preferences as Record<string, TablePreference>) || {},
      chartPreferences: (row.chart_preferences as Record<string, ChartPreference>) || {},
      shortcutsEnabled: row.shortcuts_enabled !== false,
      customShortcuts: (row.custom_shortcuts as Record<string, string>) || {},
      reduceMotion: (row.reduce_motion as boolean) || false,
      highContrast: (row.high_contrast as boolean) || false,
      fontSize: (row.font_size as UserSettings["fontSize"]) || "medium",
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapToDb(updates: UserSettingsUpdate): Record<string, unknown> {
    const mapping: Record<string, string> = {
      displayName: "display_name",
      avatarUrl: "avatar_url",
      timezone: "timezone",
      locale: "locale",
      dateFormat: "date_format",
      theme: "theme",
      defaultDashboardView: "default_dashboard_view",
      defaultDateRange: "default_date_range",
      pinnedWidgets: "pinned_widgets",
      sidebarCollapsed: "sidebar_collapsed",
      tablePreferences: "table_preferences",
      chartPreferences: "chart_preferences",
      shortcutsEnabled: "shortcuts_enabled",
      reduceMotion: "reduce_motion",
      highContrast: "high_contrast",
      fontSize: "font_size",
    };

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (mapping[key]) {
        result[mapping[key]] = value;
      }
    }

    return result;
  }
}

export const userSettingsService = new UserSettingsService();
