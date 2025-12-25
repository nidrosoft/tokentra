"use client";

import type { FC } from "react";
import type { BudgetStatus } from "@/types";
import { cx } from "@/utils/cx";

export interface BudgetProgressProps {
  spent: number;
  limit: number;
  status: BudgetStatus;
  showLabels?: boolean;
  className?: string;
}

const statusColors: Record<BudgetStatus, { bar: string; text: string }> = {
  ok: { bar: "bg-success-solid", text: "text-success-primary" },
  warning: { bar: "bg-warning-solid", text: "text-warning-primary" },
  exceeded: { bar: "bg-error-solid", text: "text-error-primary" },
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const BudgetProgress: FC<BudgetProgressProps> = ({
  spent,
  limit,
  status,
  showLabels = true,
  className,
}) => {
  const percentage = Math.min((spent / limit) * 100, 100);
  const actualPercentage = (spent / limit) * 100;
  const colors = statusColors[status];

  return (
    <div className={cx("space-y-2", className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">
            {formatCurrency(spent)} <span className="text-quaternary">of {formatCurrency(limit)}</span>
          </span>
          <span className={cx("font-medium", colors.text)}>
            {actualPercentage.toFixed(1)}%
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-tertiary">
        <div
          className={cx("h-full rounded-full transition-all duration-500", colors.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
