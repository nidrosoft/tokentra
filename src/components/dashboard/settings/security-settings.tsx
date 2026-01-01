"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { ShieldTick, Lock, Mobile } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Toggle } from "@/components/base/toggle/toggle";
import { Badge } from "@/components/base/badges/badges";
import { useOrganizationSettings } from "@/hooks/use-settings";
import { cx } from "@/utils/cx";

export interface SecuritySettingsProps {
  className?: string;
}

const mockSessions = [
  { id: "1", device: "Chrome on MacOS", location: "San Francisco, CA", lastActive: "Now", current: true },
  { id: "2", device: "Safari on iPhone", location: "San Francisco, CA", lastActive: "2 hours ago", current: false },
  { id: "3", device: "Firefox on Windows", location: "New York, NY", lastActive: "3 days ago", current: false },
];

export const SecuritySettings: FC<SecuritySettingsProps> = ({ className }) => {
  const { settings, isLoading, updateSettings, isUpdating } = useOrganizationSettings();
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState(mockSessions);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Sync with org settings
  useEffect(() => {
    if (settings) {
      setTwoFactorEnabled(settings.require2FA);
    }
  }, [settings]);

  const handleToggle2FA = async (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    try {
      await updateSettings({ require2FA: enabled });
    } catch (error) {
      console.error("Failed to update 2FA setting:", error);
      setTwoFactorEnabled(!enabled); // Revert on error
    }
  };

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePasswordChange = () => {
    setPasswordSaving(true);
    setTimeout(() => setPasswordSaving(false), 1000);
  };

  if (isLoading) {
    return (
      <div className={cx("space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-secondary" />
          <div className="h-4 w-64 rounded bg-secondary" />
          <div className="h-24 w-full rounded-xl bg-secondary" />
          <div className="h-24 w-full rounded-xl bg-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className={cx("space-y-6", className)}>
      {/* Section Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-primary">Security</h2>
        <p className="text-sm text-tertiary">Manage your account security and active sessions.</p>
      </div>

      {/* Password Section */}
      <div className="rounded-xl border border-secondary p-5">
        <div className="flex items-center gap-2">
          <Lock size={20} color="#7F56D9" variant="Bold" />
          <h3 className="font-semibold text-primary">Change Password</h3>
        </div>
        <div className="mt-4 space-y-4">
          <Input label="Current Password" type="password" placeholder="Enter current password" />
          <Input label="New Password" type="password" placeholder="Enter new password" />
          <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
          <Button size="md" onClick={handlePasswordChange} disabled={passwordSaving}>
            {passwordSaving ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="rounded-xl border border-secondary p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success-secondary">
              <ShieldTick size={20} color="#17B26A" variant="Bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-primary">Two-Factor Authentication</h3>
                {twoFactorEnabled && <Badge size="sm" color="success">Enabled</Badge>}
              </div>
              <p className="text-sm text-tertiary">Add an extra layer of security to your account</p>
            </div>
          </div>
          <Toggle
            isSelected={twoFactorEnabled}
            onChange={handleToggle2FA}
            size="md"
            isDisabled={isUpdating}
          />
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl border border-secondary p-5">
        <div className="flex items-center gap-2">
          <Mobile size={20} color="#7F56D9" variant="Bold" />
          <h3 className="font-semibold text-primary">Active Sessions</h3>
        </div>
        <div className="mt-4 space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-primary">{session.device}</p>
                  {session.current && <Badge size="sm" color="brand">Current</Badge>}
                </div>
                <p className="text-xs text-tertiary">{session.location} · {session.lastActive}</p>
              </div>
              {!session.current && (
                <Button
                  size="sm"
                  color="secondary-destructive"
                  onClick={() => handleRevokeSession(session.id)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
