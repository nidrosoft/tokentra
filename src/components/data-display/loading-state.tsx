"use client";

import type { FC } from "react";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({
  message = "Loading...",
  className,
}) => {
  return (
    <div className={className}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      {message && <p>{message}</p>}
    </div>
  );
};
