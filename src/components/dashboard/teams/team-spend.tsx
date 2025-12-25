"use client";

import type { FC } from "react";

export interface TeamSpendProps {
  data?: Array<{ date: string; cost: number }>;
  budget?: number;
  className?: string;
}

export const TeamSpend: FC<TeamSpendProps> = ({ className }) => {
  return <div className={className}>{/* Team spend implementation */}</div>;
};
