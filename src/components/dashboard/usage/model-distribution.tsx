"use client";

import type { FC } from "react";
import { cx } from "@/utils/cx";
import type { TokenUsageByModel } from "@/types";

export interface ModelDistributionProps {
  data: TokenUsageByModel[];
  className?: string;
}

const formatNumber = (value: number): string => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const colors = [
  "bg-fg-brand-primary",
  "bg-fg-success-primary",
  "bg-fg-warning-primary",
  "bg-fg-error-primary",
  "bg-utility-blue-500",
];

export const ModelDistribution: FC<ModelDistributionProps> = ({ data, className }) => {
  const totalTokens = data.reduce((sum, item) => sum + item.inputTokens + item.outputTokens, 0);

  const sortedData = [...data]
    .sort((a, b) => (b.inputTokens + b.outputTokens) - (a.inputTokens + a.outputTokens))
    .slice(0, 5);

  return (
    <div className={cx("rounded-xl border border-secondary bg-primary p-6 shadow-xs", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">Usage by Model</h3>
        <p className="text-sm text-tertiary">Token distribution across AI models</p>
      </div>

      <div className="space-y-4">
        {sortedData.map((item, index) => {
          const itemTotal = item.inputTokens + item.outputTokens;
          const percentage = (itemTotal / totalTokens) * 100;
          const color = colors[index % colors.length];

          return (
            <div key={item.model} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cx("size-2.5 rounded-full", color)} />
                  <span className="text-sm font-medium text-primary">{item.model}</span>
                  <span className="text-xs text-quaternary capitalize">({item.provider})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary">
                    {formatNumber(itemTotal)}
                  </span>
                  <span className="w-12 text-right text-xs text-tertiary">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cx("h-full rounded-full transition-all", color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-quaternary">
                <span>In: {formatNumber(item.inputTokens)}</span>
                <span>Out: {formatNumber(item.outputTokens)}</span>
                <span>{formatNumber(item.requests)} requests</span>
              </div>
            </div>
          );
        })}
      </div>

      {data.length > 5 && (
        <div className="mt-4 border-t border-secondary pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-tertiary">+{data.length - 5} more models</span>
            <button className="font-medium text-brand-primary hover:underline">
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
