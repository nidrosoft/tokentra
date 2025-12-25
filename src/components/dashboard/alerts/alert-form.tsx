"use client";

import type { FC } from "react";
import { useState } from "react";
import type { AlertType, AlertChannelType } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select, type SelectItemType } from "@/components/base/select/select";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Toggle } from "@/components/base/toggle/toggle";
import { cx } from "@/utils/cx";

export interface AlertFormData {
  name: string;
  type: AlertType;
  metric: string;
  operator: "gt" | "gte" | "lt" | "lte" | "eq";
  value: number;
  timeWindow?: string;
  channels: { type: AlertChannelType; config: Record<string, string> }[];
  enabled: boolean;
}

export interface AlertFormProps {
  initialData?: Partial<AlertFormData>;
  onSubmit?: (data: AlertFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const alertTypeItems: SelectItemType[] = [
  { id: "spend_threshold", label: "Spend Threshold" },
  { id: "spend_anomaly", label: "Spend Anomaly" },
  { id: "budget_threshold", label: "Budget Threshold" },
  { id: "forecast_exceeded", label: "Forecast Exceeded" },
  { id: "provider_error", label: "Provider Error" },
  { id: "usage_spike", label: "Usage Spike" },
];

const metricsByType: Record<AlertType, SelectItemType[]> = {
  spend_threshold: [
    { id: "daily_cost", label: "Daily Cost" },
    { id: "hourly_cost", label: "Hourly Cost" },
    { id: "weekly_cost", label: "Weekly Cost" },
    { id: "monthly_cost", label: "Monthly Cost" },
  ],
  spend_anomaly: [
    { id: "hourly_cost", label: "Hourly Cost" },
    { id: "daily_cost", label: "Daily Cost" },
  ],
  budget_threshold: [
    { id: "budget_usage", label: "Budget Usage (%)" },
  ],
  forecast_exceeded: [
    { id: "monthly_forecast", label: "Monthly Forecast" },
  ],
  provider_error: [
    { id: "error_rate", label: "Error Rate (%)" },
  ],
  usage_spike: [
    { id: "requests_per_minute", label: "Requests per Minute" },
    { id: "tokens_per_hour", label: "Tokens per Hour" },
  ],
};

const operatorItems: SelectItemType[] = [
  { id: "gt", label: "Greater than (>)" },
  { id: "gte", label: "Greater or equal (≥)" },
  { id: "lt", label: "Less than (<)" },
  { id: "lte", label: "Less or equal (≤)" },
  { id: "eq", label: "Equal to (=)" },
];

const timeWindowItems: SelectItemType[] = [
  { id: "", label: "No time window" },
  { id: "5m", label: "5 minutes" },
  { id: "15m", label: "15 minutes" },
  { id: "1h", label: "1 hour" },
  { id: "24h", label: "24 hours" },
  { id: "7d", label: "7 days" },
];

const channelOptions: { type: AlertChannelType; label: string; configField: string; placeholder: string }[] = [
  { type: "email", label: "Email", configField: "recipients", placeholder: "admin@example.com, team@example.com" },
  { type: "slack", label: "Slack", configField: "channel", placeholder: "#cost-alerts" },
  { type: "pagerduty", label: "PagerDuty", configField: "serviceKey", placeholder: "Service key" },
  { type: "webhook", label: "Webhook", configField: "url", placeholder: "https://api.example.com/alerts" },
];

export const AlertForm: FC<AlertFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const [formData, setFormData] = useState<AlertFormData>({
    name: initialData?.name || "",
    type: initialData?.type || "spend_threshold",
    metric: initialData?.metric || "daily_cost",
    operator: initialData?.operator || "gt",
    value: initialData?.value || 500,
    timeWindow: initialData?.timeWindow || "",
    channels: initialData?.channels || [],
    enabled: initialData?.enabled ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.value <= 0) newErrors.value = "Value must be greater than 0";
    if (formData.channels.length === 0) newErrors.channels = "At least one channel is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.(formData);
    }
  };

  const handleChannelToggle = (channelType: AlertChannelType, isSelected: boolean) => {
    setFormData((prev) => {
      if (isSelected) {
        return {
          ...prev,
          channels: [...prev.channels, { type: channelType, config: {} }],
        };
      }
      return {
        ...prev,
        channels: prev.channels.filter((c) => c.type !== channelType),
      };
    });
  };

  const handleChannelConfig = (channelType: AlertChannelType, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.map((c) =>
        c.type === channelType ? { ...c, config: { ...c.config, [field]: value } } : c
      ),
    }));
  };

  const isChannelEnabled = (type: AlertChannelType) => formData.channels.some((c) => c.type === type);
  const getChannelConfig = (type: AlertChannelType, field: string) =>
    formData.channels.find((c) => c.type === type)?.config[field] || "";

  const availableMetrics = metricsByType[formData.type] || [];

  return (
    <form onSubmit={handleSubmit} className={cx("space-y-6", className)}>
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Alert Name"
            placeholder="e.g., High Daily Spend"
            value={formData.name}
            onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
            isInvalid={!!errors.name}
            hint={errors.name}
          />
          <Select
            label="Alert Type"
            selectedKey={formData.type}
            onSelectionChange={(key) => {
              const newType = key as AlertType;
              const newMetrics = metricsByType[newType] || [];
              setFormData((prev) => ({
                ...prev,
                type: newType,
                metric: newMetrics[0]?.id || "",
              }));
            }}
            items={alertTypeItems}
          >
            {(item) => <Select.Item key={item.id} id={item.id} textValue={item.label}>{item.label}</Select.Item>}
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-secondary bg-secondary/50 p-4">
          <div>
            <p className="text-sm font-medium text-primary">Enable Alert</p>
            <p className="text-xs text-tertiary">Start monitoring immediately after creation</p>
          </div>
          <Toggle
            isSelected={formData.enabled}
            onChange={(isSelected) => setFormData((prev) => ({ ...prev, enabled: isSelected }))}
            size="sm"
          />
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary">Alert Condition</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Metric"
            selectedKey={formData.metric}
            onSelectionChange={(key) => setFormData((prev) => ({ ...prev, metric: key as string }))}
            items={availableMetrics}
          >
            {(item) => <Select.Item key={item.id} id={item.id} textValue={item.label}>{item.label}</Select.Item>}
          </Select>
          <Select
            label="Operator"
            selectedKey={formData.operator}
            onSelectionChange={(key) => setFormData((prev) => ({ ...prev, operator: key as AlertFormData["operator"] }))}
            items={operatorItems}
          >
            {(item) => <Select.Item key={item.id} id={item.id} textValue={item.label}>{item.label}</Select.Item>}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Threshold Value"
            type="number"
            value={formData.value.toString()}
            onChange={(value) => setFormData((prev) => ({ ...prev, value: Number(value) }))}
            isInvalid={!!errors.value}
            hint={errors.value}
          />
          <Select
            label="Time Window"
            placeholder="Optional"
            selectedKey={formData.timeWindow || null}
            onSelectionChange={(key) => setFormData((prev) => ({ ...prev, timeWindow: key as string }))}
            items={timeWindowItems}
          >
            {(item) => <Select.Item key={item.id} id={item.id} textValue={item.label}>{item.label}</Select.Item>}
          </Select>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">Notification Channels</h3>
          {errors.channels && <p className="text-xs text-error-primary">{errors.channels}</p>}
        </div>
        
        <div className="space-y-3">
          {channelOptions.map((channel) => {
            const isEnabled = isChannelEnabled(channel.type);
            return (
              <div
                key={channel.type}
                className={cx(
                  "rounded-lg border p-4 transition-all",
                  isEnabled ? "border-brand-solid bg-brand-secondary/30" : "border-secondary"
                )}
              >
                <div className="flex items-center justify-between">
                  <Checkbox
                    isSelected={isEnabled}
                    onChange={(selected) => handleChannelToggle(channel.type, selected)}
                    label={channel.label}
                    size="sm"
                  />
                </div>
                {isEnabled && (
                  <div className="mt-3 pl-6">
                    <Input
                      placeholder={channel.placeholder}
                      value={getChannelConfig(channel.type, channel.configField)}
                      onChange={(value) => handleChannelConfig(channel.type, channel.configField, value)}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-secondary pt-4">
        {onCancel && (
          <Button type="button" size="md" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="md" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Alert"}
        </Button>
      </div>
    </form>
  );
};
