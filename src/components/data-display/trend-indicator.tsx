"use client";

import type { FC } from "react";

export interface TrendIndicatorProps {
  value: number;
  direction?: "up" | "down" | "neutral";
  showIcon?: boolean;
  className?: string;
}

export const TrendIndicator: FC<TrendIndicatorProps> = ({
  value,
  direction,
  showIcon = true,
  className,
}) => {
  const computedDirection = direction ?? (value > 0 ? "up" : value < 0 ? "down" : "neutral");

  return (
    <span className={className} data-direction={computedDirection}>
      {showIcon && (computedDirection === "up" ? "↑" : computedDirection === "down" ? "↓" : "→")}
      {Math.abs(value)}%
    </span>
  );
};
