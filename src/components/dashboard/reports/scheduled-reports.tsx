"use client";

import type { FC } from "react";

export interface ScheduledReportsProps {
  reports?: Array<{ id: string; name: string; frequency: string; nextRun: Date }>;
  className?: string;
}

export const ScheduledReports: FC<ScheduledReportsProps> = ({ className }) => {
  return <div className={className}>{/* Scheduled reports implementation */}</div>;
};
