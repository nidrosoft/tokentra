"use client";

import type { FC } from "react";

export interface PercentageChangeProps {
  value: number;
  positiveIsGood?: boolean;
  className?: string;
}

export const PercentageChange: FC<PercentageChangeProps> = ({
  value,
  positiveIsGood = true,
  className,
}) => {
  const isPositive = value > 0;
  const isGood = positiveIsGood ? isPositive : !isPositive;

  return (
    <span className={className} data-good={isGood}>
      {isPositive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
};
