"use client";

import type { FC } from "react";

export interface CostComparisonProps {
  currentPeriod?: number;
  previousPeriod?: number;
  className?: string;
}

export const CostComparison: FC<CostComparisonProps> = ({ className }) => {
  return <div className={className}>{/* Cost comparison implementation */}</div>;
};
