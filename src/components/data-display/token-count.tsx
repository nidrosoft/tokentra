"use client";

import type { FC } from "react";

export interface TokenCountProps {
  value: number;
  compact?: boolean;
  className?: string;
}

export const TokenCount: FC<TokenCountProps> = ({
  value,
  compact = true,
  className,
}) => {
  const formatted = compact
    ? new Intl.NumberFormat("en-US", { notation: "compact" }).format(value)
    : new Intl.NumberFormat("en-US").format(value);

  return <span className={className}>{formatted} tokens</span>;
};
