"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Building, Wallet, Chart, PercentageCircle } from "iconsax-react";
import type { CostCenter } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { CostCenterList } from "./cost-center-list";
import { CreateCostCenterDialog } from "./create-cost-center-dialog";
import type { CostCenterFormData } from "./cost-center-form";
import { mockCostCenters, mockCostCentersSummary } from "@/data/mock-cost-centers";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CostCentersOverview: FC = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>(mockCostCenters);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = (data: CostCenterFormData) => {
    setIsCreating(true);
    setTimeout(() => {
      const newCostCenter: CostCenter = {
        id: `cc_${Date.now()}`,
        organizationId: "org_1",
        name: data.name,
        description: data.description,
        code: data.code,
        monthlyBudget: data.monthlyBudget,
        currentMonthSpend: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCostCenters((prev) => [newCostCenter, ...prev]);
      setIsCreating(false);
      setIsCreateDialogOpen(false);
    }, 1000);
  };

  const handleView = (id: string) => {
    console.log("Viewing cost center:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Editing cost center:", id);
  };

  const totalBudget = costCenters.reduce((sum, cc) => sum + (cc.monthlyBudget || 0), 0);
  const totalSpend = costCenters.reduce((sum, cc) => sum + cc.currentMonthSpend, 0);
  const avgUtilization = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Cost Centers
          </h1>
          <p className="text-md text-tertiary">
            Organize and allocate AI costs across departments and business units.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md" iconLeading={AddIcon} onClick={() => setIsCreateDialogOpen(true)}>
            Create Cost Center
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
              <Building size={20} color="#7F56D9" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Cost Centers</p>
              <p className="text-2xl font-semibold text-primary">{costCenters.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-success-secondary">
              <Wallet size={20} color="#17B26A" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Total Budget</p>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning-secondary">
              <Chart size={20} color="#F79009" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Total Spend</p>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(totalSpend)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
              <PercentageCircle size={20} color="#7F56D9" variant="Bold" />
            </div>
            <div>
              <p className="text-sm font-medium text-tertiary">Avg Utilization</p>
              <p className="text-2xl font-semibold text-primary">{avgUtilization}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Centers List */}
      <CostCenterList
        costCenters={costCenters}
        onView={handleView}
        onEdit={handleEdit}
      />

      {/* Create Cost Center Dialog */}
      <CreateCostCenterDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />
    </div>
  );
};
