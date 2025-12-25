"use client";

import type { FC, ReactNode } from "react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
}) => {
  return (
    <div className={className}>
      {/* Stat card implementation */}
    </div>
  );
};
