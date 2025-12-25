"use client";

import type { FC } from "react";

export interface BudgetForecastProps {
  currentSpend: number;
  projectedSpend: number;
  limit: number;
  className?: string;
}

export const BudgetForecast: FC<BudgetForecastProps> = ({ className }) => {
  return <div className={className}>{/* Budget forecast implementation */}</div>;
};
