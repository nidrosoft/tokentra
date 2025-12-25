"use client";

import type { FC } from "react";
import { cx } from "@/utils/cx";
import type { CostBreakdown } from "@/types";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";

export interface CostBreakdownCardProps {
  title: string;
  subtitle?: string;
  data: CostBreakdown[];
  className?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const colors = [
  { bar: "bg-fg-brand-primary", text: "text-brand-primary" },
  { bar: "bg-fg-success-primary", text: "text-success-primary" },
  { bar: "bg-fg-warning-primary", text: "text-warning-primary" },
  { bar: "bg-fg-error-primary", text: "text-error-primary" },
  { bar: "bg-utility-blue-500", text: "text-utility-blue-700" },
  { bar: "bg-utility-indigo-500", text: "text-utility-indigo-700" },
  { bar: "bg-utility-pink-500", text: "text-utility-pink-700" },
];

export const CostBreakdownCard: FC<CostBreakdownCardProps> = ({
  title,
  subtitle,
  data,
  className,
}) => {
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className={cx("rounded-xl border border-secondary bg-primary p-6 shadow-xs", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
        {subtitle && <p className="text-sm text-tertiary">{subtitle}</p>}
      </div>

      <div className="space-y-4">
        {data.slice(0, 5).map((item, index) => {
          const color = colors[index % colors.length];
          return (
            <div key={item.value} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cx("size-2.5 rounded-full", color.bar)} />
                  <span className="text-sm font-medium text-primary">{item.value}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(item.cost)}
                  </span>
                  <span className="w-12 text-right text-xs text-tertiary">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cx("h-full rounded-full transition-all", color.bar)}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 5 && (
        <div className="mt-4 border-t border-secondary pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-tertiary">+{data.length - 5} more</span>
            <button className="font-medium text-brand-primary hover:underline">
              View all
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-secondary pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-tertiary">Total</span>
          <span className="text-lg font-semibold text-primary">{formatCurrency(totalCost)}</span>
        </div>
      </div>
    </div>
  );
};
