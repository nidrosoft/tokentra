"use client";

import type { FC } from "react";

export interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  innerRadius?: number;
  className?: string;
}

export const DonutChart: FC<DonutChartProps> = ({ data, innerRadius = 60, className }) => {
  return (
    <div className={className}>
      {/* Donut chart implementation using Recharts */}
    </div>
  );
};
