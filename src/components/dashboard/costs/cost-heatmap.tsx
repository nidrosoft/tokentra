"use client";

import type { FC } from "react";

export interface CostHeatmapProps {
  data?: Array<{ x: string; y: string; value: number }>;
  className?: string;
}

export const CostHeatmap: FC<CostHeatmapProps> = ({ className }) => {
  return <div className={className}>{/* Cost heatmap implementation */}</div>;
};
