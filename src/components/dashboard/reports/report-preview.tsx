"use client";

import type { FC } from "react";

export interface ReportPreviewProps {
  report?: { id: string; name: string; data: Record<string, unknown> };
  className?: string;
}

export const ReportPreview: FC<ReportPreviewProps> = ({ className }) => {
  return <div className={className}>{/* Report preview implementation */}</div>;
};
