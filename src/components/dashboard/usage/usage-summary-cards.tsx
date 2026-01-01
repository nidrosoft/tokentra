"use client";

import type { FC } from "react";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { cx } from "@/utils/cx";

export interface UsageSummaryCardsProps {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCachedTokens: number;
  avgLatency: number;
  successRate: number;
  className?: string;
}

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

export const UsageSummaryCards: FC<UsageSummaryCardsProps> = ({
  totalRequests,
  totalInputTokens,
  totalOutputTokens,
  totalCachedTokens,
  avgLatency,
  successRate,
  className,
}) => {
  const totalTokens = totalInputTokens + totalOutputTokens;
  const cachedPercent = ((totalCachedTokens / totalTokens) * 100).toFixed(1);

  return (
    <div className={cx("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5", className)}>
      <MetricsChart04
        title={formatNumber(totalRequests)}
        subtitle="Total Requests"
        change="+8.2%"
        changeTrend="positive"
        chartColor="text-fg-success-secondary"
        chartData={[{ value: 80 }, { value: 90 }, { value: 85 }, { value: 100 }, { value: 95 }, { value: 110 }]}
        actions={false}
      />
      <MetricsChart04
        title={formatNumber(totalTokens)}
        subtitle="Total Tokens"
        change="+12.5%"
        changeTrend="positive"
        chartColor="text-fg-success-secondary"
        chartData={[{ value: 500 }, { value: 600 }, { value: 550 }, { value: 700 }, { value: 650 }, { value: 800 }]}
        actions={false}
      />
      <MetricsChart04
        title={formatNumber(totalCachedTokens)}
        subtitle="Cached Tokens"
        change={`${cachedPercent}%`}
        changeTrend="positive"
        chartColor="text-fg-warning-secondary"
        chartData={[{ value: 50 }, { value: 60 }, { value: 70 }, { value: 80 }, { value: 90 }, { value: 100 }]}
        actions={false}
      />
      <MetricsChart04
        title={`${avgLatency}ms`}
        subtitle="Avg Latency"
        change="-5.3%"
        changeTrend="negative"
        chartColor="text-fg-error-secondary"
        chartData={[{ value: 250 }, { value: 240 }, { value: 230 }, { value: 220 }, { value: 210 }, { value: 200 }]}
        actions={false}
      />
      <MetricsChart04
        title={`${successRate}%`}
        subtitle="Success Rate"
        change="+0.3%"
        changeTrend="positive"
        chartColor="text-fg-success-secondary"
        chartData={[{ value: 98 }, { value: 98.5 }, { value: 99 }, { value: 99.2 }, { value: 99.5 }, { value: 99.7 }]}
        actions={false}
      />
    </div>
  );
};
