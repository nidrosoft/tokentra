"use client";

import type { FC } from "react";
import { TickCircle, Clock, Warning2 } from "iconsax-react";
import type { AlertEvent, AlertSeverity, AlertStatus } from "@/types";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

export interface AlertHistoryProps {
  events: AlertEvent[];
  className?: string;
}

const severityColors: Record<AlertSeverity, "error" | "warning" | "brand"> = {
  critical: "error",
  warning: "warning",
  info: "brand",
};

const statusConfig: Record<AlertStatus, { icon: FC<{ size: number; color: string }>; color: string; label: string }> = {
  active: { icon: Warning2, color: "text-error-primary", label: "Active" },
  acknowledged: { icon: Clock, color: "text-warning-primary", label: "Acknowledged" },
  resolved: { icon: TickCircle, color: "text-success-primary", label: "Resolved" },
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const AlertHistory: FC<AlertHistoryProps> = ({ events, className }) => {
  return (
    <div className={cx("rounded-xl border border-secondary bg-primary shadow-xs", className)}>
      <div className="border-b border-secondary p-4">
        <h3 className="text-lg font-semibold text-primary">Recent Events</h3>
        <p className="text-sm text-tertiary">Latest alert triggers and their status</p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium text-secondary">No recent events</p>
          <p className="mt-1 text-sm text-tertiary">Alert events will appear here when triggered</p>
        </div>
      ) : (
        <div className="divide-y divide-secondary">
          {events.map((event) => {
            const statusInfo = statusConfig[event.status];
            const StatusIcon = statusInfo.icon;

            return (
              <div key={event.id} className="flex items-start gap-3 p-4">
                <div className={cx("mt-0.5", statusInfo.color)}>
                  <StatusIcon size={18} color="currentColor" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-primary">{event.title}</h4>
                    <Badge size="sm" color={severityColors[event.severity]}>
                      {event.severity}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-secondary">{event.message}</p>
                  <p className="mt-1 text-xs text-quaternary">{formatTimeAgo(event.triggeredAt)}</p>
                </div>
                <Badge size="sm" color="gray">
                  {statusInfo.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
