"use client";

import type { FC } from "react";
import { useState } from "react";
import {
  DollarCircle,
  Trash,
  TickCircle,
  Building,
  People,
  FolderOpen,
  Cpu,
  Warning2,
  InfoCircle,
} from "iconsax-react";
import type { Budget, BudgetPeriod, BudgetScopeType } from "@/types";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Select } from "@/components/base/select/select";
import { BudgetProgress } from "./budget-progress";
import { cx } from "@/utils/cx";

const periodOptions: { value: BudgetPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const scopeOptions: { value: BudgetScopeType; label: string; icon: FC<{ size: number; color: string }> }[] = [
  { value: "organization", label: "Organization", icon: Building },
  { value: "team", label: "Team", icon: People },
  { value: "project", label: "Project", icon: FolderOpen },
  { value: "cost_center", label: "Cost Center", icon: Building },
  { value: "provider", label: "Provider", icon: ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )},
  { value: "model", label: "Model", icon: Cpu },
];

const thresholdOptions = [50, 75, 90, 100];

const statusConfig = {
  ok: { label: "On Track", color: "success" as const, bgColor: "bg-utility-success-50", textColor: "text-utility-success-600" },
  warning: { label: "At Risk", color: "warning" as const, bgColor: "bg-utility-warning-50", textColor: "text-utility-warning-600" },
  exceeded: { label: "Exceeded", color: "error" as const, bgColor: "bg-utility-error-50", textColor: "text-utility-error-600" },
};

interface BudgetEditSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget;
  onSave?: (budgetId: string, updates: Partial<Budget>) => void;
  onDelete?: (budgetId: string) => void;
}

const BudgetIcon = ({ className }: { className?: string }) => (
  <DollarCircle size={24} color="#7F56D9" className={className} variant="Bulk" />
);

const TrashIcon = ({ className }: { className?: string }) => (
  <Trash size={16} color="currentColor" className={className} variant="Outline" />
);

export const BudgetEditSlideout: FC<BudgetEditSlideoutProps> = ({
  isOpen,
  onOpenChange,
  budget,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(budget.name);
  const [amount, setAmount] = useState(budget.amount.toString());
  const [period, setPeriod] = useState<BudgetPeriod>(budget.period);
  const [scopeType, setScopeType] = useState<BudgetScopeType>(budget.scope.type);
  const [scopeName, setScopeName] = useState(budget.scope.name || "");
  const [alertThresholds, setAlertThresholds] = useState<number[]>(budget.alertThresholds);
  const [hardLimit, setHardLimit] = useState(budget.hardLimit);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const statusInfo = statusConfig[budget.status];
  const percentUsed = Math.round((budget.currentSpend / budget.amount) * 100);

  const handleThresholdToggle = (threshold: number) => {
    setAlertThresholds((prev) =>
      prev.includes(threshold)
        ? prev.filter((t) => t !== threshold)
        : [...prev, threshold].sort((a, b) => a - b)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    onSave?.(budget.id, {
      name,
      amount: parseFloat(amount),
      period,
      scope: { type: scopeType, name: scopeName },
      alertThresholds,
      hardLimit,
    });
    
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete?.(budget.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const isFormValid = () => {
    return name.trim() && parseFloat(amount) > 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: budget.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <BudgetIcon />
          </div>
          <section className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-md font-semibold text-primary md:text-lg">
                Edit Budget
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-tertiary">{budget.name}</span>
              <span className="text-sm text-quaternary">•</span>
              <span className="text-sm text-tertiary capitalize">{budget.period}</span>
            </div>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-6">
            {/* Current Status Card */}
            <div className={cx("rounded-xl p-4", statusInfo.bgColor)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge size="sm" type="pill-color" color={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                  <span className={cx("text-sm font-medium", statusInfo.textColor)}>
                    {formatCurrency(budget.currentSpend)} of {formatCurrency(budget.amount)}
                  </span>
                </div>
                <span className={cx("text-lg font-semibold", statusInfo.textColor)}>
                  {percentUsed}%
                </span>
              </div>
              <BudgetProgress
                spent={budget.currentSpend}
                limit={budget.amount}
                status={budget.status}
              />
            </div>

            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Budget Settings</h3>
              
              <Input
                label="Budget Name"
                type="text"
                value={name}
                onChange={(value) => setName(value)}
                placeholder="e.g., Engineering Team Budget"
                isRequired
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Budget Amount"
                  type="number"
                  value={amount}
                  onChange={(value) => setAmount(value)}
                  placeholder="10000"
                  isRequired
                  hint={`Current: ${formatCurrency(budget.currentSpend)}`}
                />

                <Select
                  label="Period"
                  selectedKey={period}
                  onSelectionChange={(key) => setPeriod(key as BudgetPeriod)}
                  placeholder="Select period"
                >
                  {periodOptions.map((opt) => (
                    <Select.Item key={opt.value} id={opt.value} label={opt.label} />
                  ))}
                </Select>
              </div>
            </div>

            {/* Scope Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Budget Scope</h3>
              
              <div className="grid grid-cols-3 gap-2">
                {scopeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setScopeType(opt.value)}
                      className={cx(
                        "flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors",
                        scopeType === opt.value
                          ? "border-brand bg-brand-secondary"
                          : "border-secondary hover:bg-secondary_subtle"
                      )}
                    >
                      <Icon size={20} color={scopeType === opt.value ? "#7F56D9" : "#667085"} />
                      <span className={cx(
                        "text-xs font-medium",
                        scopeType === opt.value ? "text-brand-primary" : "text-tertiary"
                      )}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Input
                label="Scope Target"
                type="text"
                value={scopeName}
                onChange={(value) => setScopeName(value)}
                placeholder={`Select ${scopeType}...`}
                hint={`The specific ${scopeType} this budget applies to`}
              />
            </div>

            {/* Alert Thresholds */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Alert Thresholds</h3>
              <p className="text-xs text-tertiary">
                Receive notifications when spending reaches these percentages of your budget.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {thresholdOptions.map((threshold) => (
                  <label
                    key={threshold}
                    className={cx(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                      alertThresholds.includes(threshold)
                        ? "border-brand bg-brand-secondary"
                        : "border-secondary hover:bg-secondary_subtle"
                    )}
                  >
                    <div
                      className={cx(
                        "flex size-5 items-center justify-center rounded border-2 transition-colors",
                        alertThresholds.includes(threshold)
                          ? "border-brand-solid bg-brand-solid"
                          : "border-tertiary bg-primary"
                      )}
                    >
                      {alertThresholds.includes(threshold) && (
                        <TickCircle size={12} color="#ffffff" variant="Bold" />
                      )}
                    </div>
                    <span className="text-sm text-primary">Alert at {threshold}%</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hard Limit Toggle */}
            <div className="space-y-3">
              <label
                className={cx(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  hardLimit
                    ? "border-warning-primary bg-warning-secondary"
                    : "border-secondary hover:bg-secondary_subtle"
                )}
                onClick={() => setHardLimit(!hardLimit)}
              >
                <div
                  className={cx(
                    "mt-0.5 flex size-5 items-center justify-center rounded border-2 transition-colors",
                    hardLimit
                      ? "border-warning-solid bg-warning-solid"
                      : "border-tertiary bg-primary"
                  )}
                >
                  {hardLimit && (
                    <TickCircle size={12} color="#ffffff" variant="Bold" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Warning2 size={16} color={hardLimit ? "#F79009" : "#667085"} variant="Bold" />
                    <span className={cx(
                      "text-sm font-medium",
                      hardLimit ? "text-warning-primary" : "text-primary"
                    )}>
                      Enable Hard Limit
                    </span>
                  </div>
                  <p className={cx(
                    "mt-1 text-xs",
                    hardLimit ? "text-warning-tertiary" : "text-tertiary"
                  )}>
                    Block API calls when budget is exceeded. This will prevent any further spending.
                  </p>
                </div>
              </label>

              {hardLimit && (
                <div className="flex items-start gap-3 rounded-lg bg-warning-secondary p-3">
                  <InfoCircle size={16} color="#F79009" variant="Bold" className="mt-0.5 shrink-0" />
                  <p className="text-xs text-warning-tertiary">
                    <strong className="text-warning-primary">Warning:</strong> Enabling hard limits may cause service interruptions for your applications when the budget is exceeded.
                  </p>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="space-y-3 border-t border-secondary pt-6">
              <h3 className="text-sm font-medium text-error-primary">Danger Zone</h3>
              {!showDeleteConfirm ? (
                <Button
                  size="sm"
                  color="secondary"
                  iconLeading={TrashIcon}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-error-primary hover:bg-error-secondary"
                >
                  Delete Budget
                </Button>
              ) : (
                <div className="rounded-xl border border-error-primary bg-error-secondary p-4">
                  <p className="text-sm font-medium text-error-primary">
                    Are you sure you want to delete this budget?
                  </p>
                  <p className="mt-1 text-sm text-error-tertiary">
                    This action cannot be undone. All alert configurations will be removed.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      color="secondary"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      color="primary-destructive"
                      onClick={handleDelete}
                    >
                      Yes, Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SlideoutMenu.Content>

        <SlideoutMenu.Footer className="flex w-full justify-between gap-3">
          <Button size="md" color="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={!isFormValid()}
          >
            Save Changes
          </Button>
        </SlideoutMenu.Footer>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
