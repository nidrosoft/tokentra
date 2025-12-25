"use client";

import type { FC } from "react";

export interface ProviderBreakdownProps {
  data?: Array<{ provider: string; cost: number; percentage: number }>;
  className?: string;
}

export const ProviderBreakdown: FC<ProviderBreakdownProps> = ({ className }) => {
  return <div className={className}>{/* Provider breakdown implementation */}</div>;
};
