"use client";

import type { FC } from "react";

export interface TreemapProps {
  data: Array<{ name: string; value: number; children?: TreemapProps["data"] }>;
  className?: string;
}

export const Treemap: FC<TreemapProps> = ({ data, className }) => {
  return (
    <div className={className}>
      {/* Treemap implementation using Recharts */}
    </div>
  );
};
