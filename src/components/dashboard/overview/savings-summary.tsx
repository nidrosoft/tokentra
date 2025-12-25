"use client";

import type { FC } from "react";

export interface SavingsSummaryProps {
  potentialSavings?: number;
  appliedSavings?: number;
  recommendationCount?: number;
  className?: string;
}

export const SavingsSummary: FC<SavingsSummaryProps> = ({ className }) => {
  return <div className={className}>{/* Savings summary implementation */}</div>;
};
