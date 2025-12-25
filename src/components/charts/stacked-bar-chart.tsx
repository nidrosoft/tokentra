"use client";

import type { FC } from "react";

export interface StackedBarChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  keys: string[];
  className?: string;
}

export const StackedBarChart: FC<StackedBarChartProps> = ({ data, xKey, keys, className }) => {
  return (
    <div className={className}>
      {/* Stacked bar chart implementation using Recharts */}
    </div>
  );
};
