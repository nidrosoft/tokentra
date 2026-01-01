"use client";

import type { FC } from "react";
import { useState } from "react";
import {
  Notification,
  Trash,
  TickCircle,
  DollarCircle,
  TrendUp,
  Wallet,
  Chart,
  Warning2,
  Flash,
  Sms,
  Code1,
  InfoCircle,
} from "iconsax-react";
import type { Alert, AlertType, AlertChannelType } from "@/types";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";

const alertTypeOptions: { value: AlertType; label: string; icon: FC<{ size: number; color: string }> }[] = [
  { value: "spend_threshold", label: "Spend Threshold", icon: DollarCircle },
  { value: "spend_anomaly", label: "Spend Anomaly", icon: TrendUp },
  { value: "budget_threshold", label: "Budget Threshold", icon: Wallet },
  { value: "forecast_exceeded", label: "Forecast Exceeded", icon: Chart },
  { value: "provider_error", label: "Provider Error", icon: Warning2 },
  { value: "usage_spike", label: "Usage Spike", icon: Flash },
];

const operatorOptions = [
  { value: "gt", label: "Greater than (>)" },
  { value: "gte", label: "Greater than or equal (≥)" },
  { value: "lt", label: "Less than (<)" },
  { value: "lte", label: "Less than or equal (≤)" },
  { value: "eq", label: "Equal to (=)" },
];

const metricOptions = [
  { value: "daily_spend", label: "Daily Spend" },
  { value: "weekly_spend", label: "Weekly Spend" },
  { value: "monthly_spend", label: "Monthly Spend" },
  { value: "token_usage", label: "Token Usage" },
  { value: "request_count", label: "Request Count" },
  { value: "error_rate", label: "Error Rate" },
  { value: "latency", label: "Latency (ms)" },
];

const channelOptions: { value: AlertChannelType; label: string; icon: FC<{ size: number; color: string }>; placeholder: string }[] = [
  { value: "email", label: "Email", icon: Sms, placeholder: "team@company.com" },
  { value: "slack", label: "Slack", icon: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  ), placeholder: "#alerts-channel" },
  { value: "pagerduty", label: "PagerDuty", icon: Notification, placeholder: "Service key or integration key" },
  { value: "webhook", label: "Webhook", icon: Code1, placeholder: "https://api.example.com/webhook" },
];

interface AlertEditSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert;
  onSave?: (alertId: string, updates: Partial<Alert>) => void;
  onDelete?: (alertId: string) => void;
}

const AlertIcon = ({ className }: { className?: string }) => (
  <Notification size={24} color="#7F56D9" className={className} variant="Bulk" />
);

const TrashIcon = ({ className }: { className?: string }) => (
  <Trash size={16} color="currentColor" className={className} variant="Outline" />
);

export const AlertEditSlideout: FC<AlertEditSlideoutProps> = ({
  isOpen,
  onOpenChange,
  alert,
  onSave,
  onDelete,
}) => {
  // Handle both legacy 'condition' format and new 'config' format
  const condition = alert.condition || (alert as unknown as { config?: { metric?: string; operator?: string; value?: number; threshold?: number; timeWindow?: string } }).config;
  
  const [name, setName] = useState(alert.name);
  const [alertType, setAlertType] = useState<AlertType>(alert.type);
  const [metric, setMetric] = useState(condition?.metric || "daily_spend");
  const [operator, setOperator] = useState(condition?.operator || "gt");
  const [value, setValue] = useState((condition?.value ?? condition?.threshold ?? 0).toString());
  const [timeWindow, setTimeWindow] = useState(condition?.timeWindow || "");
  const [enabled, setEnabled] = useState(alert.enabled);
  const [channels, setChannels] = useState<{ type: AlertChannelType; config: Record<string, string>; enabled: boolean }[]>(
    channelOptions.map((opt) => {
      const existing = (alert.channels || []).find((c) => c.type === opt.value);
      return {
        type: opt.value,
        config: existing?.config || {},
        enabled: !!existing,
      };
    })
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const typeConfig = alertTypeOptions.find((t) => t.value === alertType);

  const handleChannelToggle = (channelType: AlertChannelType) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.type === channelType ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  const handleChannelConfigChange = (channelType: AlertChannelType, key: string, val: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.type === channelType ? { ...c, config: { ...c.config, [key]: val } } : c
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const enabledChannels = channels
      .filter((c) => c.enabled)
      .map((c) => ({ type: c.type, config: c.config }));

    onSave?.(alert.id, {
      name,
      type: alertType,
      condition: {
        metric,
        operator,
        value: parseFloat(value),
        timeWindow: timeWindow || undefined,
      },
      channels: enabledChannels,
      enabled,
    });

    setIsSaving(false);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete?.(alert.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const isFormValid = () => {
    return name.trim() && parseFloat(value) >= 0 && channels.some((c) => c.enabled);
  };

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <AlertIcon />
          </div>
          <section className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-md font-semibold text-primary md:text-lg">
                Edit Alert
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-tertiary">{alert.name}</span>
              <span className="text-sm text-quaternary">•</span>
              <Badge size="sm" color="gray">{typeConfig?.label}</Badge>
            </div>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-6">
            {/* Enable/Disable Toggle */}
            <div
              className={cx(
                "flex items-center justify-between rounded-xl p-4",
                enabled ? "bg-utility-success-50" : "bg-secondary"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cx(
                  "flex size-10 items-center justify-center rounded-full",
                  enabled ? "bg-utility-success-100" : "bg-tertiary"
                )}>
                  {enabled ? (
                    <TickCircle size={20} color="#12B76A" variant="Bold" />
                  ) : (
                    <Notification size={20} color="#667085" variant="Outline" />
                  )}
                </div>
                <div>
                  <p className={cx(
                    "text-sm font-medium",
                    enabled ? "text-success-primary" : "text-secondary"
                  )}>
                    {enabled ? "Alert is enabled" : "Alert is disabled"}
                  </p>
                  <p className="text-xs text-tertiary">
                    {enabled ? "You will receive notifications" : "No notifications will be sent"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={cx(
                  "relative h-6 w-11 rounded-full transition-colors",
                  enabled ? "bg-success-solid" : "bg-quaternary"
                )}
              >
                <span
                  className={cx(
                    "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                    enabled ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
            </div>

            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Alert Settings</h3>

              <Input
                label="Alert Name"
                type="text"
                value={name}
                onChange={(val) => setName(val)}
                placeholder="e.g., High Spend Alert"
                isRequired
              />

              <Select
                label="Alert Type"
                selectedKey={alertType}
                onSelectionChange={(key) => setAlertType(key as AlertType)}
                placeholder="Select alert type"
              >
                {alertTypeOptions.map((opt) => (
                  <Select.Item key={opt.value} id={opt.value} label={opt.label} />
                ))}
              </Select>
            </div>

            {/* Condition Builder */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Condition</h3>
              <p className="text-xs text-tertiary">
                Define when this alert should trigger.
              </p>

              <Select
                label="Metric"
                selectedKey={metric}
                onSelectionChange={(key) => setMetric(key as string)}
                placeholder="Select metric"
              >
                {metricOptions.map((opt) => (
                  <Select.Item key={opt.value} id={opt.value} label={opt.label} />
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Operator"
                  selectedKey={operator}
                  onSelectionChange={(key) => setOperator(key as Alert["condition"]["operator"])}
                  placeholder="Select operator"
                >
                  {operatorOptions.map((opt) => (
                    <Select.Item key={opt.value} id={opt.value} label={opt.label} />
                  ))}
                </Select>

                <Input
                  label="Value"
                  type="number"
                  value={value}
                  onChange={(val) => setValue(val)}
                  placeholder="1000"
                  isRequired
                />
              </div>

              <Input
                label="Time Window (Optional)"
                type="text"
                value={timeWindow}
                onChange={(val) => setTimeWindow(val)}
                placeholder="e.g., 24 hours, 7 days"
                hint="Leave empty for instant alerts"
              />
            </div>

            {/* Notification Channels */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Notification Channels</h3>
              <p className="text-xs text-tertiary">
                Select at least one channel to receive alerts.
              </p>

              <div className="space-y-3">
                {channelOptions.map((opt) => {
                  const channel = channels.find((c) => c.type === opt.value);
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.value}
                      className={cx(
                        "rounded-xl border p-4 transition-colors",
                        channel?.enabled
                          ? "border-brand bg-brand-secondary"
                          : "border-secondary"
                      )}
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <div
                          className={cx(
                            "flex size-5 items-center justify-center rounded border-2 transition-colors",
                            channel?.enabled
                              ? "border-brand-solid bg-brand-solid"
                              : "border-tertiary bg-primary"
                          )}
                          onClick={() => handleChannelToggle(opt.value)}
                        >
                          {channel?.enabled && (
                            <TickCircle size={12} color="#ffffff" variant="Bold" />
                          )}
                        </div>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
                          <Icon size={16} color={channel?.enabled ? "#7F56D9" : "#667085"} />
                        </div>
                        <span className={cx(
                          "text-sm font-medium",
                          channel?.enabled ? "text-brand-primary" : "text-primary"
                        )}>
                          {opt.label}
                        </span>
                      </label>

                      {channel?.enabled && (
                        <div className="mt-3 pl-8">
                          <Input
                            type="text"
                            value={channel.config.target || ""}
                            onChange={(val) => handleChannelConfigChange(opt.value, "target", val)}
                            placeholder={opt.placeholder}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!channels.some((c) => c.enabled) && (
                <div className="flex items-start gap-3 rounded-lg bg-warning-secondary p-3">
                  <InfoCircle size={16} color="#F79009" variant="Bold" className="mt-0.5 shrink-0" />
                  <p className="text-xs text-warning-tertiary">
                    <strong className="text-warning-primary">Required:</strong> Please select at least one notification channel.
                  </p>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="space-y-3 border-t border-secondary pt-6">
              <h3 className="text-sm font-medium text-error-primary">Danger Zone</h3>
              {!showDeleteConfirm ? (
                <Button
                  size="sm"
                  color="secondary"
                  iconLeading={TrashIcon}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-error-primary hover:bg-error-secondary"
                >
                  Delete Alert
                </Button>
              ) : (
                <div className="rounded-xl border border-error-primary bg-error-secondary p-4">
                  <p className="text-sm font-medium text-error-primary">
                    Are you sure you want to delete this alert?
                  </p>
                  <p className="mt-1 text-sm text-error-tertiary">
                    This action cannot be undone. You will stop receiving notifications for this alert.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      color="secondary"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      color="primary-destructive"
                      onClick={handleDelete}
                    >
                      Yes, Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SlideoutMenu.Content>

        <SlideoutMenu.Footer className="flex w-full justify-between gap-3">
          <Button size="md" color="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={!isFormValid()}
          >
            Save Changes
          </Button>
        </SlideoutMenu.Footer>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
