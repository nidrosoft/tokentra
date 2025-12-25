"use client";

import type { FC } from "react";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Toggle } from "@/components/base/toggle/toggle";
import { cx } from "@/utils/cx";

export interface NotificationSettingsProps {
  className?: string;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const defaultNotifications: NotificationSetting[] = [
  { id: "budget_alerts", title: "Budget Alerts", description: "Get notified when budgets reach thresholds", enabled: true },
  { id: "cost_spikes", title: "Cost Spike Alerts", description: "Alert when costs increase unexpectedly", enabled: true },
  { id: "weekly_summary", title: "Weekly Summary", description: "Receive a weekly cost summary email", enabled: false },
  { id: "monthly_report", title: "Monthly Report", description: "Receive monthly detailed reports", enabled: true },
  { id: "team_activity", title: "Team Activity", description: "Notifications about team member actions", enabled: false },
  { id: "optimization_tips", title: "Optimization Tips", description: "Suggestions to reduce AI costs", enabled: true },
];

export const NotificationSettings: FC<NotificationSettingsProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<NotificationSetting[]>(defaultNotifications);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (id: string, enabled: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled } : n))
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      console.log("Notifications saved:", notifications);
    }, 1000);
  };

  return (
    <div className={cx("space-y-6", className)}>
      {/* Section Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-primary">Notification Preferences</h2>
        <p className="text-sm text-tertiary">Choose what notifications you want to receive.</p>
      </div>

      {/* Notification Toggles */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center justify-between rounded-lg border border-secondary bg-secondary/30 p-4"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">{notification.title}</p>
              <p className="text-xs text-tertiary">{notification.description}</p>
            </div>
            <Toggle
              isSelected={notification.enabled}
              onChange={(enabled) => handleToggle(notification.id, enabled)}
              size="sm"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-secondary pt-5">
        <Button size="md" color="secondary">Cancel</Button>
        <Button size="md" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
