"use client";

import type { FC } from "react";

export interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport?: (format: string) => void;
}

export const ExportDialog: FC<ExportDialogProps> = ({ open }) => {
  if (!open) return null;
  return <div>{/* Export dialog implementation */}</div>;
};
