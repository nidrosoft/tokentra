"use client";

import type { FC } from "react";
import {
  DollarCircle,
  TrendUp,
  Wallet,
  Chart,
  Warning2,
  Flash,
  Sms,
  Notification,
  Code1,
} from "iconsax-react";
import type { Alert, AlertType, AlertChannelType } from "@/types";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

export interface AlertCardProps {
  alert: Alert;
  onToggle?: (id: string, enabled: boolean) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

const typeConfig: Record<AlertType, { icon: FC<{ size: number; color: string }>; label: string; color: string }> = {
  spend_threshold: { icon: DollarCircle, label: "Spend Threshold", color: "text-warning-primary" },
  spend_anomaly: { icon: TrendUp, label: "Spend Anomaly", color: "text-error-primary" },
  budget_threshold: { icon: Wallet, label: "Budget Threshold", color: "text-brand-primary" },
  forecast_exceeded: { icon: Chart, label: "Forecast Exceeded", color: "text-error-primary" },
  provider_error: { icon: Warning2, label: "Provider Error", color: "text-error-primary" },
  usage_spike: { icon: Flash, label: "Usage Spike", color: "text-warning-primary" },
};

const channelIcons: Record<AlertChannelType, FC<{ size: number; color: string }>> = {
  email: Sms,
  slack: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  ),
  pagerduty: Notification,
  webhook: Code1,
};

const operatorLabels: Record<string, string> = {
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  eq: "=",
};

const formatCondition = (alert: Alert): string => {
  const op = operatorLabels[alert.condition.operator] || alert.condition.operator;
  const metric = alert.condition.metric.replace(/_/g, " ");
  const timeWindow = alert.condition.timeWindow ? ` in ${alert.condition.timeWindow}` : "";
  return `When ${metric} ${op} ${alert.condition.value}${timeWindow}`;
};

export const AlertCard: FC<AlertCardProps> = ({
  alert,
  onToggle,
  onEdit,
  className,
}) => {
  const config = typeConfig[alert.type];
  const Icon = config.icon;

  return (
    <div
      className={cx(
        "rounded-xl border bg-primary p-5 shadow-xs transition-shadow hover:shadow-md",
        alert.enabled ? "border-secondary" : "border-secondary opacity-60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cx("flex size-10 items-center justify-center rounded-lg bg-secondary", config.color)}>
            <Icon size={20} color="currentColor" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-primary">{alert.name}</h4>
            <Badge size="sm" color="gray" className="mt-1">
              {config.label}
            </Badge>
          </div>
        </div>
        {/* Toggle Switch */}
        <button
          onClick={() => onToggle?.(alert.id, !alert.enabled)}
          className={cx(
            "relative h-6 w-11 rounded-full transition-colors",
            alert.enabled ? "bg-success-solid" : "bg-quaternary"
          )}
        >
          <span
            className={cx(
              "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
              alert.enabled ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
      </div>

      {/* Condition */}
      <p className="mt-3 text-sm text-secondary">{formatCondition(alert)}</p>

      {/* Channels */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-tertiary">Channels:</span>
          <div className="flex gap-1.5">
            {alert.channels.map((channel, idx) => {
              const ChannelIcon = channelIcons[channel.type];
              return (
                <div
                  key={idx}
                  className="flex size-7 items-center justify-center rounded-md bg-secondary text-tertiary"
                  title={channel.type}
                >
                  <ChannelIcon size={14} color="currentColor" />
                </div>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => onEdit?.(alert.id)}
          className="text-sm font-medium text-brand-primary hover:text-brand-secondary"
        >
          Edit
        </button>
      </div>
    </div>
  );
};
