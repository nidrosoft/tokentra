"use client";

import type { FC, ReactNode } from "react";

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (value: number, name: string) => ReactNode;
  className?: string;
}

export const ChartTooltip: FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
  className,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className={className}>
      {label && <p>{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value, entry.name) : entry.value}
        </p>
      ))}
    </div>
  );
};
