"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  Building,
  Trash,
} from "iconsax-react";
import type { CostCenter } from "@/types";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useUpdateCostCenter, useDeleteCostCenter } from "@/hooks/use-cost-centers";
import { CostCenterAllocationsManager } from "./cost-center-allocations-manager";

interface CostCenterEditSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  costCenter: CostCenter;
  onSave?: (costCenterId: string, updates: Partial<CostCenter>) => void;
  onDelete?: (costCenterId: string) => void;
}

const CostCenterIcon = ({ className }: { className?: string }) => (
  <Building size={24} color="#7F56D9" className={className} variant="Bulk" />
);

const TrashIcon = ({ className }: { className?: string }) => (
  <Trash size={16} color="currentColor" className={className} variant="Outline" />
);

export const CostCenterEditSlideout: FC<CostCenterEditSlideoutProps> = ({
  isOpen,
  onOpenChange,
  costCenter,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(costCenter.name);
  const [code, setCode] = useState(costCenter.code);
  const [description, setDescription] = useState(costCenter.description || "");
  const [monthlyBudget, setMonthlyBudget] = useState(costCenter.monthlyBudget?.toString() || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateCostCenterMutation = useUpdateCostCenter();
  const deleteCostCenterMutation = useDeleteCostCenter();

  // Reset form when cost center changes
  useEffect(() => {
    setName(costCenter.name);
    setCode(costCenter.code);
    setDescription(costCenter.description || "");
    setMonthlyBudget(costCenter.monthlyBudget?.toString() || "");
    setShowDeleteConfirm(false);
  }, [costCenter]);

  const handleSave = async () => {
    try {
      await updateCostCenterMutation.mutateAsync({
        costCenterId: costCenter.id,
        data: {
          name,
          code,
          description: description || undefined,
        },
      });

      onSave?.(costCenter.id, { name, code, description });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update cost center:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCostCenterMutation.mutateAsync(costCenter.id);
      onDelete?.(costCenter.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete cost center:", error);
    }
  };

  const isFormValid = () => {
    return name.trim().length > 0 && code.trim().length > 0;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <CostCenterIcon />
          </div>
          <section className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-md font-semibold text-primary md:text-lg">
                Edit Cost Center
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-tertiary">{costCenter.name}</span>
              <span className="text-sm text-quaternary">•</span>
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-tertiary">
                {costCenter.code}
              </code>
            </div>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Cost Center Details</h3>

              <Input
                label="Cost Center Name"
                type="text"
                value={name}
                onChange={(val) => setName(val)}
                placeholder="e.g., Engineering Department"
                isRequired
              />

              <Input
                label="Cost Center Code"
                type="text"
                value={code}
                onChange={(val) => setCode(val)}
                placeholder="e.g., ENG-001"
                isRequired
                hint="Unique identifier for this cost center"
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-secondary">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the cost center..."
                  rows={3}
                  className="flex w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary transition-colors placeholder:text-quaternary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                />
              </div>
            </div>

            {/* Budget Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary">Budget Settings</h3>

              <Input
                label="Monthly Budget"
                type="number"
                value={monthlyBudget}
                onChange={(val) => setMonthlyBudget(val)}
                placeholder="e.g., 10000"
                hint={costCenter.monthlyBudget ? `Current spend: ${formatCurrency(costCenter.currentMonthSpend)}` : "Leave empty for no budget limit"}
              />
            </div>

            {/* Cost Allocations */}
            <CostCenterAllocationsManager costCenterId={costCenter.id} costCenterName={costCenter.name} />

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
                  Delete Cost Center
                </Button>
              ) : (
                <div className="rounded-xl border border-error-primary bg-error-secondary p-4">
                  <p className="text-sm font-medium text-error-primary">
                    Are you sure you want to delete this cost center?
                  </p>
                  <p className="mt-1 text-sm text-error-tertiary">
                    This action cannot be undone. All cost allocations will be removed.
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
            isLoading={updateCostCenterMutation.isPending}
            isDisabled={!isFormValid()}
          >
            Save Changes
          </Button>
        </SlideoutMenu.Footer>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
