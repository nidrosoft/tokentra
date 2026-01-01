"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select, type SelectItemType } from "@/components/base/select/select";
import { useOrganizationSettings } from "@/hooks/use-settings";
import { cx } from "@/utils/cx";

export interface GeneralSettingsProps {
  className?: string;
}

const currencyOptions: SelectItemType[] = [
  { id: "USD", label: "USD - US Dollar" },
  { id: "EUR", label: "EUR - Euro" },
  { id: "GBP", label: "GBP - British Pound" },
  { id: "CAD", label: "CAD - Canadian Dollar" },
  { id: "AUD", label: "AUD - Australian Dollar" },
];

const timezoneOptions: SelectItemType[] = [
  { id: "UTC", label: "UTC (Coordinated Universal Time)" },
  { id: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { id: "America/Denver", label: "Mountain Time (MT)" },
  { id: "America/Chicago", label: "Central Time (CT)" },
  { id: "America/New_York", label: "Eastern Time (ET)" },
  { id: "Europe/London", label: "London (GMT)" },
  { id: "Europe/Paris", label: "Central European (CET)" },
  { id: "Asia/Tokyo", label: "Japan (JST)" },
  { id: "Asia/Singapore", label: "Singapore (SGT)" },
  { id: "Australia/Sydney", label: "Sydney (AEST)" },
];

export const GeneralSettings: FC<GeneralSettingsProps> = ({ className }) => {
  const { settings, isLoading, updateSettings, isUpdating } = useOrganizationSettings();
  
  const [orgName, setOrgName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with fetched settings
  useEffect(() => {
    if (settings) {
      setOrgName(settings.displayName || "");
      setCurrency(settings.currency || "USD");
      setTimezone(settings.timezone || "UTC");
      setHasChanges(false);
    }
  }, [settings]);

  const handleChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        displayName: orgName,
        currency,
        timezone,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleCancel = () => {
    if (settings) {
      setOrgName(settings.displayName || "");
      setCurrency(settings.currency || "USD");
      setTimezone(settings.timezone || "UTC");
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cx("space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-secondary" />
          <div className="h-4 w-64 rounded bg-secondary" />
          <div className="h-10 w-full max-w-md rounded bg-secondary" />
          <div className="h-10 w-full max-w-md rounded bg-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className={cx("space-y-6", className)}>
      {/* Section Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-primary">General Settings</h2>
        <p className="text-sm text-tertiary">Manage your organization settings and preferences.</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Organization Name */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[200px_1fr] lg:items-center lg:gap-8">
          <label className="text-sm font-medium text-secondary">Organization Name</label>
          <Input
            value={orgName}
            onChange={handleChange(setOrgName)}
            placeholder="Your organization name"
            className="max-w-md"
          />
        </div>

        <hr className="border-secondary" />

        {/* Currency */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[200px_1fr] lg:items-center lg:gap-8">
          <label className="text-sm font-medium text-secondary">Default Currency</label>
          <Select
            selectedKey={currency}
            onSelectionChange={(key) => {
              setCurrency(key as string);
              setHasChanges(true);
            }}
            items={currencyOptions}
            className="max-w-md"
          >
            {(item) => <Select.Item key={item.id} id={item.id}>{item.label}</Select.Item>}
          </Select>
        </div>

        <hr className="border-secondary" />

        {/* Timezone */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[200px_1fr] lg:items-center lg:gap-8">
          <label className="text-sm font-medium text-secondary">Timezone</label>
          <Select
            selectedKey={timezone}
            onSelectionChange={(key) => {
              setTimezone(key as string);
              setHasChanges(true);
            }}
            items={timezoneOptions}
            className="max-w-md"
          >
            {(item) => <Select.Item key={item.id} id={item.id}>{item.label}</Select.Item>}
          </Select>
        </div>
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
