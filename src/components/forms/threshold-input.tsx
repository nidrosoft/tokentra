"use client";

import type { FC } from "react";

export interface ThresholdInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
}

export const ThresholdInput: FC<ThresholdInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  className,
}) => {
  return (
    <div className={className}>
      {/* Threshold input implementation */}
    </div>
  );
};
