"use client";

import type { FC } from "react";

export interface RecentAlertsProps {
  alerts?: Array<{ id: string; title: string; severity: string; createdAt: Date }>;
  className?: string;
}

export const RecentAlerts: FC<RecentAlertsProps> = ({ className }) => {
  return <div className={className}>{/* Recent alerts implementation */}</div>;
};
