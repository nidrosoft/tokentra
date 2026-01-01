"use client";

import type { FC, ReactNode } from "react";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary bg-secondary_subtle px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-secondary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-tertiary">{description}</p>
      {actionLabel && onAction && (
        <Button size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
