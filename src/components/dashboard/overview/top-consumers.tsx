"use client";

import type { FC } from "react";

export interface TopConsumersProps {
  data?: Array<{ name: string; cost: number; type: "team" | "project" | "model" }>;
  className?: string;
}

export const TopConsumers: FC<TopConsumersProps> = ({ className }) => {
  return <div className={className}>{/* Top consumers implementation */}</div>;
};
