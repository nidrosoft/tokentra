"use client";

import type { FC } from "react";

export interface StatsCardsProps {
  totalCost?: number;
  totalTokens?: number;
  totalRequests?: number;
  costChange?: number;
  className?: string;
}

export const StatsCards: FC<StatsCardsProps> = ({ className }) => {
  return <div className={className}>{/* Stats cards implementation */}</div>;
};
