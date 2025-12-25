"use client";

import type { FC } from "react";

export interface ChargebackTableProps {
  data?: Array<{ team: string; project: string; cost: number }>;
  className?: string;
}

export const ChargebackTable: FC<ChargebackTableProps> = ({ className }) => {
  return <div className={className}>{/* Chargeback table implementation */}</div>;
};
