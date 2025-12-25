"use client";

import type { FC } from "react";

export interface CachingStatsProps {
  hitRate?: number;
  savings?: number;
  className?: string;
}

export const CachingStats: FC<CachingStatsProps> = ({ className }) => {
  return <div className={className}>{/* Caching stats implementation */}</div>;
};
