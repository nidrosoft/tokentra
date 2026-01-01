import { createClient } from "@supabase/supabase-js";
import type {
  OrganizationSettings,
  OrganizationSettingsUpdate,
  LockedSetting,
  NotificationChannel,
} from "@/types/settings";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export class OrganizationSettingsService {
  private getDefaults(orgId: string): OrganizationSettings {
    return {
      id: "",
      orgId,
      timezone: "UTC",
      locale: "en-US",
      dateFormat: "MMM DD, YYYY",
      currency: "USD",
      fiscalYearStart: 1,
      defaultBudgetPeriod: "monthly",
      defaultAlertChannels: ["email", "in_app"],
      require2FA: false,
      sessionTimeoutMinutes: 1440,
      passwordMinLength: 12,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      allowedIpRanges: [],
      usageDataRetentionDays: 365,
      auditLogRetentionDays: 730,
      featuresEnabled: {},
      lockedSettings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getSettings(orgId: string): Promise<OrganizationSettings> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("organization_settings")
      .select("*")
      .eq("org_id", orgId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching org settings:", error);
      throw new Error(`Failed to get settings: ${error.message}`);
    }

    return data ? this.mapSettings(data) : this.getDefaults(orgId);
  }

  async updateSettings(
    orgId: string,
    updates: OrganizationSettingsUpdate,
    userId?: string
  ): Promise<OrganizationSettings> {
    const supabase = getSupabaseAdmin();
    const current = await this.getSettings(orgId);

    this.validateUpdates(updates);

    const dbUpdates = this.mapToDb(updates);
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("organization_settings")
      .upsert(
        {
          org_id: orgId,
          ...dbUpdates,
        },
        { onConflict: "org_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating org settings:", error);
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    const newSettings = this.mapSettings(data);

    // Log audit entries for changed settings
    if (userId) {
      await this.auditChanges(orgId, userId, current, newSettings, updates);
    }

    return newSettings;
  }

  async lockSetting(
    orgId: string,
    settingKey: string,
    value: unknown,
    reason: string,
    userId: string
  ): Promise<void> {
    const supabase = getSupabaseAdmin();
    const settings = await this.getSettings(orgId);

    const lockedSetting: LockedSetting = {
      key: settingKey,
      value,
      reason,
      lockedBy: userId,
      lockedAt: new Date().toISOString(),
    };

    const lockedSettings = settings.lockedSettings.filter((s) => s.key !== settingKey);
    lockedSettings.push(lockedSetting);

    await supabase
      .from("organization_settings")
      .update({ locked_settings: lockedSettings })
      .eq("org_id", orgId);
  }

  async unlockSetting(orgId: string, settingKey: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    const settings = await this.getSettings(orgId);

    const lockedSettings = settings.lockedSettings.filter((s) => s.key !== settingKey);

    await supabase
      .from("organization_settings")
      .update({ locked_settings: lockedSettings })
      .eq("org_id", orgId);
  }

  isSettingLocked(settings: OrganizationSettings, key: string): LockedSetting | null {
    return settings.lockedSettings.find((s) => s.key === key) || null;
  }

  async isFeatureEnabled(orgId: string, feature: string): Promise<boolean> {
    const settings = await this.getSettings(orgId);
    return settings.featuresEnabled[feature] === true;
  }

  private validateUpdates(updates: OrganizationSettingsUpdate): void {
    if (updates.passwordMinLength !== undefined) {
      if (updates.passwordMinLength < 8 || updates.passwordMinLength > 128) {
        throw new Error("Password minimum length must be between 8 and 128");
      }
    }

    if (updates.sessionTimeoutMinutes !== undefined) {
      if (updates.sessionTimeoutMinutes < 15 || updates.sessionTimeoutMinutes > 43200) {
        throw new Error("Session timeout must be between 15 minutes and 30 days");
      }
    }

    if (updates.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: updates.timezone });
      } catch {
        throw new Error(`Invalid timezone: ${updates.timezone}`);
      }
    }
  }

  private async auditChanges(
    orgId: string,
    userId: string,
    oldSettings: OrganizationSettings,
    newSettings: OrganizationSettings,
    updates: OrganizationSettingsUpdate
  ): Promise<void> {
    const supabase = getSupabaseAdmin();

    for (const key of Object.keys(updates)) {
      const oldValue = (oldSettings as unknown as Record<string, unknown>)[key];
      const newValue = (newSettings as unknown as Record<string, unknown>)[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        await supabase.from("settings_audit_log").insert({
          org_id: orgId,
          user_id: userId,
          entity_type: "org_settings",
          entity_id: orgId,
          setting_key: key,
          old_value: oldValue,
          new_value: newValue,
          action: "update",
        });
      }
    }
  }

  private mapSettings(row: Record<string, unknown>): OrganizationSettings {
    return {
      id: row.id as string,
      orgId: row.org_id as string,
      displayName: row.display_name as string | undefined,
      logoUrl: row.logo_url as string | undefined,
      timezone: (row.timezone as string) || "UTC",
      locale: (row.locale as string) || "en-US",
      dateFormat: (row.date_format as string) || "MMM DD, YYYY",
      currency: (row.currency as string) || "USD",
      fiscalYearStart: (row.fiscal_year_start as number) || 1,
      defaultCostCenterId: row.default_cost_center_id as string | undefined,
      defaultBudgetPeriod: (row.default_budget_period as OrganizationSettings["defaultBudgetPeriod"]) || "monthly",
      defaultAlertChannels: (row.default_alert_channels as NotificationChannel[]) || ["email", "in_app"],
      require2FA: (row.require_2fa as boolean) || false,
      sessionTimeoutMinutes: (row.session_timeout_minutes as number) || 1440,
      passwordMinLength: (row.password_min_length as number) || 12,
      passwordRequireSpecial: row.password_require_special !== false,
      passwordRequireNumbers: row.password_require_numbers !== false,
      passwordExpireDays: row.password_expire_days as number | undefined,
      allowedIpRanges: (row.allowed_ip_ranges as string[]) || [],
      usageDataRetentionDays: (row.usage_data_retention_days as number) || 365,
      auditLogRetentionDays: (row.audit_log_retention_days as number) || 730,
      featuresEnabled: (row.features_enabled as Record<string, boolean>) || {},
      lockedSettings: (row.locked_settings as LockedSetting[]) || [],
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private mapToDb(updates: OrganizationSettingsUpdate): Record<string, unknown> {
    const mapping: Record<string, string> = {
      displayName: "display_name",
      logoUrl: "logo_url",
      timezone: "timezone",
      locale: "locale",
      dateFormat: "date_format",
      currency: "currency",
      fiscalYearStart: "fiscal_year_start",
      defaultCostCenterId: "default_cost_center_id",
      defaultBudgetPeriod: "default_budget_period",
      defaultAlertChannels: "default_alert_channels",
      require2FA: "require_2fa",
      sessionTimeoutMinutes: "session_timeout_minutes",
      passwordMinLength: "password_min_length",
      passwordRequireSpecial: "password_require_special",
      passwordRequireNumbers: "password_require_numbers",
      passwordExpireDays: "password_expire_days",
      allowedIpRanges: "allowed_ip_ranges",
      usageDataRetentionDays: "usage_data_retention_days",
      auditLogRetentionDays: "audit_log_retention_days",
      featuresEnabled: "features_enabled",
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

export const organizationSettingsService = new OrganizationSettingsService();
