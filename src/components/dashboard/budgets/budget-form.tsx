"use client";

import type { FC } from "react";
import { useState } from "react";
import { Building, People, FolderOpen, Cpu } from "iconsax-react";
import type { BudgetPeriod, BudgetScopeType } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select, type SelectItemType } from "@/components/base/select/select";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Toggle } from "@/components/base/toggle/toggle";
import { cx } from "@/utils/cx";

export interface BudgetFormData {
  name: string;
  amount: number;
  currency: string;
  period: BudgetPeriod;
  scopeType: BudgetScopeType;
  scopeId?: string;
  scopeName?: string;
  alertThresholds: number[];
  hardLimit: boolean;
}

export interface BudgetFormProps {
  initialData?: Partial<BudgetFormData>;
  onSubmit?: (data: BudgetFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const periodItems: SelectItemType[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
];

const scopeTypes: { value: BudgetScopeType; label: string; icon: FC<{ size: number; color: string }> }[] = [
  { value: "organization", label: "Org", icon: Building },
  { value: "team", label: "Team", icon: People },
  { value: "project", label: "Project", icon: FolderOpen },
  { value: "provider", label: "Provider", icon: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )},
  { value: "model", label: "Model", icon: Cpu },
];

const thresholdOptions = [
  { value: 50, label: "50%" },
  { value: 80, label: "80%" },
  { value: 100, label: "100%" },
];

// Mock data for scope targets
const scopeTargetItems: Record<BudgetScopeType, SelectItemType[]> = {
  organization: [{ id: "org_1", label: "Acme Corp" }],
  team: [
    { id: "team_eng", label: "Engineering" },
    { id: "team_prod", label: "Product" },
    { id: "team_data", label: "Data Science" },
  ],
  project: [
    { id: "proj_chat", label: "Chat Application" },
    { id: "proj_api", label: "API Gateway" },
    { id: "proj_analytics", label: "Analytics Dashboard" },
  ],
  cost_center: [],
  provider: [
    { id: "openai", label: "OpenAI" },
    { id: "anthropic", label: "Anthropic" },
    { id: "google", label: "Google AI" },
  ],
  model: [
    { id: "gpt-4o", label: "GPT-4o" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini" },
    { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
  ],
};

export const BudgetForm: FC<BudgetFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const [formData, setFormData] = useState<BudgetFormData>({
    name: initialData?.name || "",
    amount: initialData?.amount || 1000,
    currency: initialData?.currency || "USD",
    period: initialData?.period || "monthly",
    scopeType: initialData?.scopeType || "organization",
    scopeId: initialData?.scopeId,
    scopeName: initialData?.scopeName,
    alertThresholds: initialData?.alertThresholds || [50, 80, 100],
    hardLimit: initialData?.hardLimit || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (formData.scopeType !== "organization" && !formData.scopeId) {
      newErrors.scopeId = "Please select a target";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit?.(formData);
    }
  };

  const handleThresholdToggle = (threshold: number, isSelected: boolean) => {
    setFormData((prev) => ({
      ...prev,
      alertThresholds: isSelected
        ? [...prev.alertThresholds, threshold].sort((a, b) => a - b)
        : prev.alertThresholds.filter((t) => t !== threshold),
    }));
  };

  const availableTargets = scopeTargetItems[formData.scopeType] || [];

  return (
    <form onSubmit={handleSubmit} className={cx("space-y-6", className)}>
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary">Basic Information</h3>
        
        {/* Name */}
        <Input
          label="Budget Name"
          placeholder="e.g., Engineering Monthly"
          value={formData.name}
          onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
          isInvalid={!!errors.name}
          hint={errors.name}
        />

        {/* Amount and Period */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount (USD)"
            type="number"
            value={formData.amount.toString()}
            onChange={(value) => setFormData((prev) => ({ ...prev, amount: Number(value) }))}
            isInvalid={!!errors.amount}
            hint={errors.amount}
          />
          <Select
            label="Period"
            selectedKey={formData.period}
            onSelectionChange={(key) => setFormData((prev) => ({ ...prev, period: key as BudgetPeriod }))}
            items={periodItems}
          >
            {(item) => <Select.Item key={item.id} id={item.id} textValue={item.label}>{item.label}</Select.Item>}
          </Select>
        </div>
      </div>

      {/* Scope */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary">Budget Scope</h3>
        
        {/* Scope Type */}
        <div className="grid grid-cols-5 gap-2">
          {scopeTypes.map((scope) => {
            const Icon = scope.icon;
            const isSelected = formData.scopeType === scope.value;
            return (
              <button
                key={scope.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, scopeType: scope.value, scopeId: undefined, scopeName: undefined }))}
                className={cx(
                  "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all",
                  isSelected
                    ? "border-brand-solid bg-brand-secondary ring-2 ring-brand"
                    : "border-secondary bg-primary text-tertiary hover:border-tertiary"
                )}
              >
                <Icon size={20} color={isSelected ? "#7F56D9" : "currentColor"} />
                <span className={cx("text-xs font-medium", isSelected && "text-brand-primary")}>{scope.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scope Target */}
        {formData.scopeType !== "organization" && availableTargets.length > 0 && (
          <Select
            label={`Select ${scopeTypes.find((s) => s.value === formData.scopeType)?.label}`}
            placeholder="Select..."
            selectedKey={formData.scopeId || null}
            onSelectionChange={(key) => {
              const target = availableTargets.find((t) => t.id === key);
              setFormData((prev) => ({ ...prev, scopeId: target?.id, scopeName: target?.label }));
            }}
            items={availableTargets}
            isInvalid={!!errors.scopeId}
            hint={errors.scopeId}
          >
            {(item) => <Select.Item key={item.id} id={item.id} textValue={item.label}>{item.label}</Select.Item>}
          </Select>
        )}
      </div>

      {/* Alert Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-primary">Alert Settings</h3>
        
        {/* Thresholds */}
        <div>
          <p className="mb-2 text-sm font-medium text-secondary">Alert Thresholds</p>
          <div className="flex gap-4">
            {thresholdOptions.map((threshold) => (
              <Checkbox
                key={threshold.value}
                isSelected={formData.alertThresholds.includes(threshold.value)}
                onChange={(isSelected) => handleThresholdToggle(threshold.value, isSelected)}
                label={threshold.label}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Hard Limit */}
        <div className="flex items-center justify-between rounded-lg border border-secondary bg-secondary/50 p-4">
          <div>
            <p className="text-sm font-medium text-primary">Hard Limit</p>
            <p className="text-xs text-tertiary">Block requests when budget is exceeded</p>
          </div>
          <Toggle
            isSelected={formData.hardLimit}
            onChange={(isSelected) => setFormData((prev) => ({ ...prev, hardLimit: isSelected }))}
            size="sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-secondary pt-4">
        {onCancel && (
          <Button type="button" size="md" color="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="md" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Budget"}
        </Button>
      </div>
    </form>
  );
};
