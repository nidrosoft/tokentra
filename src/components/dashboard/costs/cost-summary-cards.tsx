"use client";

import type { FC } from "react";
import type { Icon as IconType } from "iconsax-react";
import { DollarCircle, Activity, TrendUp, TrendDown, Timer1 } from "iconsax-react";
import { cx } from "@/utils/cx";

interface SummaryCard {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  period: string;
  icon: IconType;
}

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
  const cards: SummaryCard[] = [
    {
      id: "total-spend",
      title: "Total Spend",
      value: formatCurrency(totalCost),
      change: `${costChange >= 0 ? "+" : ""}${costChange}%`,
      trend: costChange >= 0 ? "up" : "down",
      period: "vs last period",
      icon: DollarCircle,
    },
    {
      id: "total-tokens",
      title: "Total Tokens",
      value: formatNumber(totalTokens),
      change: `${tokenChange >= 0 ? "+" : ""}${tokenChange}%`,
      trend: tokenChange >= 0 ? "up" : "down",
      period: "vs last period",
      icon: Activity,
    },
    {
      id: "total-requests",
      title: "Total Requests",
      value: formatNumber(totalRequests),
      change: "+5.2%",
      trend: "up",
      period: "vs last period",
      icon: TrendUp,
    },
    {
      id: "avg-cost",
      title: "Avg Cost/Request",
      value: formatCurrency(avgCostPerRequest),
      change: "-3.1%",
      trend: "down",
      period: "vs last period",
      icon: Timer1,
    },
  ];

  return (
    <div className={cx("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="rounded-xl border border-secondary bg-primary p-5 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
                <Icon size={20} color="#7F56D9" variant="Bulk" />
              </div>
              <div
                className={cx(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  card.trend === "up" && "bg-success-secondary text-success-primary",
                  card.trend === "down" && "bg-error-secondary text-error-primary",
                  card.trend === "neutral" && "bg-secondary text-secondary"
                )}
              >
                {card.trend === "up" && <TrendUp size={12} color="currentColor" variant="Outline" />}
                {card.trend === "down" && <TrendDown size={12} color="currentColor" variant="Outline" />}
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
