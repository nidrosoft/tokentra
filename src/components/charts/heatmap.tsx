"use client";

import type { FC } from "react";

export interface HeatmapProps {
  data: Array<{ x: string; y: string; value: number }>;
  className?: string;
}

export const Heatmap: FC<HeatmapProps> = ({ data, className }) => {
  return (
    <div className={className}>
      {/* Heatmap implementation */}
    </div>
  );
};
