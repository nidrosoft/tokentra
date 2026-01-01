"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/base/buttons/button";
import { Toggle } from "@/components/base/toggle/toggle";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { cx } from "@/utils/cx";

export interface NotificationSettingsProps {
  className?: string;
}

interface NotificationSetting {
  id: string;
  key: string;
  title: string;
  description: string;
}

const notificationConfig: NotificationSetting[] = [
  { id: "budget_alerts", key: "budgetAlerts" as const, title: "Budget Alerts", description: "Get notified when budgets reach thresholds" },
  { id: "cost_spikes", key: "costSpikes" as const, title: "Cost Spike Alerts", description: "Alert when costs increase unexpectedly" },
  { id: "weekly_summary", key: "weeklySummary" as const, title: "Weekly Summary", description: "Receive a weekly cost summary email" },
  { id: "monthly_report", key: "monthlyReport" as const, title: "Monthly Report", description: "Receive monthly detailed reports" },
  { id: "team_activity", key: "teamActivity" as const, title: "Team Activity", description: "Notifications about team member actions" },
  { id: "optimization_tips", key: "optimizationTips" as const, title: "Optimization Tips", description: "Suggestions to reduce AI costs" },
  { id: "security_alerts", key: "securityAlerts" as const, title: "Security Alerts", description: "Important security notifications" },
  { id: "billing_alerts", key: "billingAlerts" as const, title: "Billing Alerts", description: "Payment and subscription updates" },
];

export const NotificationSettings: FC<NotificationSettingsProps> = ({ className }) => {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences();
  const [localPrefs, setLocalPrefs] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with fetched preferences
  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences as unknown as Record<string, boolean>);
      setHasChanges(false);
    }
  }, [preferences]);

  const handleToggle = (key: string, enabled: boolean) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: enabled }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updatePreferences(localPrefs);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
    }
  };

  const handleCancel = () => {
    if (preferences) {
      setLocalPrefs(preferences as unknown as Record<string, boolean>);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cx("space-y-6", className)}>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-primary">Notification Preferences</h2>
          <p className="text-sm text-tertiary">Choose what notifications you want to receive.</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-secondary bg-secondary/30 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-secondary" />
                  <div className="h-3 w-48 rounded bg-secondary" />
                </div>
                <div className="h-6 w-10 rounded-full bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("space-y-6", className)}>
      {/* Section Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-primary">Notification Preferences</h2>
        <p className="text-sm text-tertiary">Choose what notifications you want to receive.</p>
      </div>

      {/* Notification Toggles */}
      <div className="space-y-4">
        {notificationConfig.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center justify-between rounded-lg border border-secondary bg-secondary/30 p-4"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">{notification.title}</p>
              <p className="text-xs text-tertiary">{notification.description}</p>
            </div>
            <Toggle
              isSelected={localPrefs[notification.key] ?? true}
              onChange={(enabled) => handleToggle(notification.key, enabled)}
              size="sm"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-secondary pt-5">
        <Button size="md" color="secondary" onClick={handleCancel} disabled={!hasChanges || isUpdating}>
          Cancel
        </Button>
        <Button size="md" onClick={handleSave} disabled={!hasChanges || isUpdating}>
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
