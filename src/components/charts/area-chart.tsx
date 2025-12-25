"use client";

import type { FC } from "react";

export interface AreaChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  className?: string;
}

export const AreaChart: FC<AreaChartProps> = ({ data, xKey, yKey, className }) => {
  return (
    <div className={className}>
      {/* Area chart implementation using Recharts */}
    </div>
  );
};
