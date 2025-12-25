"use client";

import type { FC } from "react";

export interface QuickActionsProps {
  className?: string;
}

export const QuickActions: FC<QuickActionsProps> = ({ className }) => {
  return <div className={className}>{/* Quick actions implementation */}</div>;
};
