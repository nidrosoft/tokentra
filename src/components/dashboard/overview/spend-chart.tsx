"use client";

import type { FC } from "react";

export interface SpendChartProps {
  data?: Array<{ date: string; cost: number }>;
  className?: string;
}

export const SpendChart: FC<SpendChartProps> = ({ className }) => {
  return <div className={className}>{/* Spend chart implementation */}</div>;
};
