"use client";

import type { FC } from "react";
import { useState } from "react";
import type { Alert } from "@/types";
import { AlertCard } from "./alert-card";
import { cx } from "@/utils/cx";

export interface AlertListProps {
  alerts: Alert[];
  onToggle?: (id: string, enabled: boolean) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

type FilterValue = "all" | "enabled" | "disabled";

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

export const AlertList: FC<AlertListProps> = ({
  alerts,
  onToggle,
  onEdit,
  className,
}) => {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    if (filter === "enabled") return alert.enabled;
    return !alert.enabled;
  });

  const enabledCount = alerts.filter((a) => a.enabled).length;

  return (
    <div className={cx("space-y-4", className)}>
      {/* Header with filters */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-primary">Alert Rules</h3>
          <p className="text-sm text-tertiary">
            {enabledCount} of {alerts.length} rules enabled
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cx(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-primary text-primary shadow-sm"
                  : "text-tertiary hover:text-secondary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onToggle={onToggle}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary py-12">
          <p className="text-lg font-medium text-secondary">No alert rules found</p>
          <p className="mt-1 text-sm text-tertiary">
            {filter === "all"
              ? "Create your first alert rule to get notified"
              : `No ${filter} alert rules`}
          </p>
        </div>
      )}
    </div>
  );
};
