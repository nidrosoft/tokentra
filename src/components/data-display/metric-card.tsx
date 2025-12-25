"use client";

import type { FC, ReactNode } from "react";

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  className?: string;
}

export const MetricCard: FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className,
}) => {
  return (
    <div className={className}>
      {/* Metric card implementation */}
    </div>
  );
};
