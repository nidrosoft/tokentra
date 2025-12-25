"use client";

import type { FC } from "react";

export interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  className?: string;
}

export const SkeletonLoader: FC<SkeletonLoaderProps> = ({
  width,
  height,
  rounded = false,
  className,
}) => {
  return (
    <div
      className={`animate-pulse bg-muted ${rounded ? "rounded-full" : "rounded"} ${className}`}
      style={{ width, height }}
    />
  );
};
