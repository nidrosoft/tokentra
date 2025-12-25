"use client";

import type { FC } from "react";

export interface CurrencyDisplayProps {
  value: number;
  currency?: string;
  locale?: string;
  compact?: boolean;
  className?: string;
}

export const CurrencyDisplay: FC<CurrencyDisplayProps> = ({
  value,
  currency = "USD",
  locale = "en-US",
  compact = false,
  className,
}) => {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
  }).format(value);

  return <span className={className}>{formatted}</span>;
};
