"use client";

import type { FC } from "react";

export interface CostTrendProps {
  data?: Array<{ date: string; cost: number }>;
  className?: string;
}

export const CostTrend: FC<CostTrendProps> = ({ className }) => {
  return <div className={className}>{/* Cost trend implementation */}</div>;
};
