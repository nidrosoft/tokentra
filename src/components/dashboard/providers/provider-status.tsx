"use client";

import type { FC } from "react";
import { TickCircle, CloseCircle, Refresh2, MinusCirlce } from "iconsax-react";
import type { ProviderStatus as ProviderStatusType } from "@/types";
import { cx } from "@/utils/cx";

export interface ProviderStatusProps {
  status: ProviderStatusType;
  className?: string;
}

const statusConfig: Record<ProviderStatusType, {
  label: string;
  color: string;
  bgColor: string;
  icon: FC<{ size: number; color: string; className?: string }>;
}> = {
  connected: {
    label: "Connected",
    color: "text-success-primary",
    bgColor: "bg-success-secondary",
    icon: TickCircle,
  },
  disconnected: {
    label: "Disconnected",
    color: "text-warning-primary",
    bgColor: "bg-warning-secondary",
    icon: MinusCirlce,
  },
  error: {
    label: "Error",
    color: "text-error-primary",
    bgColor: "bg-error-secondary",
    icon: CloseCircle,
  },
  syncing: {
    label: "Syncing",
    color: "text-brand-primary",
    bgColor: "bg-brand-secondary",
    icon: Refresh2,
  },
};

export const ProviderStatusBadge: FC<ProviderStatusProps> = ({ status, className }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        config.bgColor,
        className
      )}
    >
      <Icon
        size={14}
        color="currentColor"
        className={cx(config.color, status === "syncing" && "animate-spin")}
      />
      <span className={cx("text-xs font-medium", config.color)}>{config.label}</span>
    </div>
  );
};
