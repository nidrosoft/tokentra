"use client";

import type { FC } from "react";
import type { Icon as IconType } from "iconsax-react";
import { Activity, Timer1, TickCircle, Box1, Cpu } from "iconsax-react";
import { cx } from "@/utils/cx";

interface SummaryCard {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  period: string;
  icon: IconType;
  iconColor: string;
  iconBg: string;
}

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

  const cards: SummaryCard[] = [
    {
      id: "total-requests",
      title: "Total Requests",
      value: formatNumber(totalRequests),
      change: "+8.2%",
      trend: "up",
      period: "vs last period",
      icon: Activity,
      iconColor: "#7F56D9",
      iconBg: "bg-brand-secondary",
    },
    {
      id: "total-tokens",
      title: "Total Tokens",
      value: formatNumber(totalTokens),
      change: "+12.5%",
      trend: "up",
      period: "vs last period",
      icon: Cpu,
      iconColor: "#12B76A",
      iconBg: "bg-success-secondary",
    },
    {
      id: "cached-tokens",
      title: "Cached Tokens",
      value: formatNumber(totalCachedTokens),
      change: `${((totalCachedTokens / totalTokens) * 100).toFixed(1)}% savings`,
      trend: "neutral",
      period: "of total tokens",
      icon: Box1,
      iconColor: "#F79009",
      iconBg: "bg-warning-secondary",
    },
    {
      id: "avg-latency",
      title: "Avg Latency",
      value: `${avgLatency}ms`,
      change: "-5.3%",
      trend: "down",
      period: "vs last period",
      icon: Timer1,
      iconColor: "#0BA5EC",
      iconBg: "bg-utility-blue-50",
    },
    {
      id: "success-rate",
      title: "Success Rate",
      value: `${successRate}%`,
      change: "+0.3%",
      trend: "up",
      period: "vs last period",
      icon: TickCircle,
      iconColor: "#12B76A",
      iconBg: "bg-success-secondary",
    },
  ];

  return (
    <div className={cx("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5", className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="rounded-xl border border-secondary bg-primary p-5 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className={cx("flex size-10 items-center justify-center rounded-lg", card.iconBg)}>
                <Icon size={20} color={card.iconColor} variant="Bulk" />
              </div>
              <div
                className={cx(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  card.trend === "up" && "bg-success-secondary text-success-primary",
                  card.trend === "down" && "bg-success-secondary text-success-primary",
                  card.trend === "neutral" && "bg-warning-secondary text-warning-primary"
                )}
              >
                {card.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-tertiary">{card.title}</p>
              <p className="mt-1 text-2xl font-semibold text-primary">{card.value}</p>
              <p className="mt-1 text-xs text-quaternary">{card.period}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
