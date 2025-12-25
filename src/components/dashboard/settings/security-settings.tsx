"use client";

import type { FC } from "react";
import { useState } from "react";
import { ShieldTick, Lock, Mobile, Logout } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Toggle } from "@/components/base/toggle/toggle";
import { Badge } from "@/components/base/badges/badges";
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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessions, setSessions] = useState(mockSessions);
  const [isSaving, setIsSaving] = useState(false);

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

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
          <Button size="md" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Updating..." : "Update Password"}
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
            onChange={(enabled) => setTwoFactorEnabled(enabled)}
            size="md"
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
