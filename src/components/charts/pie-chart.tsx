"use client";

import type { FC } from "react";

export interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  className?: string;
}

export const PieChart: FC<PieChartProps> = ({ data, className }) => {
  return (
    <div className={className}>
      {/* Pie chart implementation using Recharts */}
    </div>
  );
};
