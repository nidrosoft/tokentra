"use client";

import type { FC } from "react";

export interface BarChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  className?: string;
}

export const BarChart: FC<BarChartProps> = ({ data, xKey, yKey, className }) => {
  return (
    <div className={className}>
      {/* Bar chart implementation using Recharts */}
    </div>
  );
};
