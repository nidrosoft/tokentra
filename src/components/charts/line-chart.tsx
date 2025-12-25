"use client";

import type { FC } from "react";

export interface LineChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  className?: string;
}

export const LineChart: FC<LineChartProps> = ({ data, xKey, yKey, className }) => {
  return (
    <div className={className}>
      {/* Line chart implementation using Recharts */}
    </div>
  );
};
