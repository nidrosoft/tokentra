"use client";

import type { FC } from "react";
import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { cx } from "@/utils/cx";

export interface CostCenterFormData {
  name: string;
  description: string;
  code: string;
  monthlyBudget: number;
}

export interface CostCenterFormProps {
  initialData?: Partial<CostCenterFormData>;
  onSubmit?: (data: CostCenterFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const CostCenterForm: FC<CostCenterFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const [formData, setFormData] = useState<CostCenterFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    code: initialData?.code || "",
    monthlyBudget: initialData?.monthlyBudget || 5000,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (formData.monthlyBudget < 0) newErrors.monthlyBudget = "Budget cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cx("space-y-5", className)}>
      {/* Name */}
      <Input
        label="Cost Center Name"
        placeholder="e.g., Engineering"
        value={formData.name}
        onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
        isInvalid={!!errors.name}
        hint={errors.name}
        isRequired
      />

      {/* Code */}
      <Input
        label="Cost Center Code"
        placeholder="e.g., ENG-001"
        value={formData.code}
        onChange={(value) => setFormData((prev) => ({ ...prev, code: value.toUpperCase() }))}
        isInvalid={!!errors.code}
        hint={errors.code || "Unique identifier for this cost center"}
        isRequired
      />

      {/* Description */}
      <Input
        label="Description"
        placeholder="Brief description of this cost center"
        value={formData.description}
        onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
      />

      {/* Monthly Budget */}
      <Input
        label="Monthly Budget (USD)"
        type="number"
        value={formData.monthlyBudget.toString()}
        onChange={(value) => setFormData((prev) => ({ ...prev, monthlyBudget: Number(value) }))}
        isInvalid={!!errors.monthlyBudget}
        hint={errors.monthlyBudget}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-secondary pt-4">
        {onCancel && (
          <Button type="button" size="md" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="md" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Cost Center"}
        </Button>
      </div>
    </form>
  );
};
