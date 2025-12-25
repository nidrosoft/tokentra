"use client";

import type { FC } from "react";
import { CloseSquare } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { AlertForm, type AlertFormData } from "./alert-form";
import { cx } from "@/utils/cx";

export interface CreateAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AlertFormData) => void;
  isLoading?: boolean;
}

const CloseIcon = ({ className }: { className?: string }) => (
  <CloseSquare size={20} color="currentColor" className={className} variant="Outline" />
);

export const CreateAlertDialog: FC<CreateAlertDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cx(
          "relative z-10 w-full max-w-2xl rounded-2xl border border-secondary bg-primary shadow-xl",
          "max-h-[90vh] overflow-y-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary p-6">
          <div>
            <h2 className="text-lg font-semibold text-primary">Create Alert</h2>
            <p className="text-sm text-tertiary">Set up notifications for cost and usage events</p>
          </div>
          <Button
            size="sm"
            color="tertiary"
            iconLeading={CloseIcon}
            onClick={onClose}
            aria-label="Close dialog"
          />
        </div>

        {/* Form */}
        <div className="p-6">
          <AlertForm
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
