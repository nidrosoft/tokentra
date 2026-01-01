"use client";

import type { FC } from "react";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { cx } from "@/utils/cx";

export interface CostSummaryCardsProps {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  avgCostPerRequest: number;
  costChange?: number;
  tokenChange?: number;
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

const formatNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

export const CostSummaryCards: FC<CostSummaryCardsProps> = ({
  totalCost,
  totalTokens,
  totalRequests,
  avgCostPerRequest,
  costChange = 12.5,
  tokenChange = 8.3,
  className,
}) => {
  return (
    <div className={cx("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      <MetricsChart04
        title={formatCurrency(totalCost)}
        subtitle="Total Spend"
        change={`${costChange >= 0 ? "+" : ""}${costChange}%`}
        changeTrend={costChange >= 0 ? "positive" : "negative"}
        chartColor="text-fg-success-secondary"
        chartData={[{ value: 8 }, { value: 12 }, { value: 10 }, { value: 15 }, { value: 14 }, { value: 18 }]}
        actions={false}
      />
      <MetricsChart04
        title={formatNumber(totalTokens)}
        subtitle="Total Tokens"
        change={`${tokenChange >= 0 ? "+" : ""}${tokenChange}%`}
        changeTrend={tokenChange >= 0 ? "positive" : "negative"}
        chartColor="text-fg-success-secondary"
        chartData={[{ value: 5 }, { value: 8 }, { value: 7 }, { value: 12 }, { value: 10 }, { value: 14 }]}
        actions={false}
      />
      <MetricsChart04
        title={formatNumber(totalRequests)}
        subtitle="Total Requests"
        change="+5.2%"
        changeTrend="positive"
        chartColor="text-fg-success-secondary"
        chartData={[{ value: 6 }, { value: 9 }, { value: 8 }, { value: 11 }, { value: 13 }, { value: 16 }]}
        actions={false}
      />
      <MetricsChart04
        title={formatCurrency(avgCostPerRequest)}
        subtitle="Avg Cost/Request"
        change="-3.1%"
        changeTrend="negative"
        chartColor="text-fg-error-secondary"
        chartData={[{ value: 15 }, { value: 12 }, { value: 14 }, { value: 10 }, { value: 11 }, { value: 8 }]}
        actions={false}
      />
    </div>
  );
};
