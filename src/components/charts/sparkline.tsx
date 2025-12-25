"use client";

import type { FC } from "react";

export interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
}

export const Sparkline: FC<SparklineProps> = ({ data, color, className }) => {
  return (
    <div className={className}>
      {/* Sparkline implementation using Recharts */}
    </div>
  );
};
