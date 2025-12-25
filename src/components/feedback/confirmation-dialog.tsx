"use client";

import type { FC, ReactNode } from "react";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
  children?: ReactNode;
}

export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-background p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
        {children}
        <div className="flex gap-2 mt-4">
          <button onClick={() => { onCancel?.(); onOpenChange(false); }}>{cancelLabel}</button>
          <button onClick={() => { onConfirm(); onOpenChange(false); }} data-variant={variant}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
