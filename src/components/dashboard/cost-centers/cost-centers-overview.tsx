"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import { Add, Building } from "iconsax-react";
import type { CostCenter as LegacyCostCenter } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { CostCenterList } from "./cost-center-list";
import { CreateCostCenterDialog } from "./create-cost-center-dialog";
import type { CostCenterFormData } from "./cost-center-form";
import { useCostCenters, useCreateCostCenter } from "@/hooks/use-cost-centers";
import type { CostCenter } from "@/lib/organization/types";
import { EmptyState } from "../shared/empty-state";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

const CostCenterIcon = () => (
  <Building size={32} color="#7F56D9" variant="Bulk" />
);

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Convert API CostCenter to legacy type for UI compatibility
function convertToLegacyCostCenter(cc: CostCenter): LegacyCostCenter {
  return {
    id: cc.id,
    organizationId: cc.orgId,
    name: cc.name,
    description: cc.description,
    code: cc.code,
    monthlyBudget: 0,
    currentMonthSpend: 0,
    createdAt: new Date(cc.createdAt),
    updatedAt: new Date(cc.updatedAt),
  };
}

export const CostCentersOverview: FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch cost centers from API
  const { data: costCentersData, isLoading: isLoadingCostCenters } = useCostCenters();
  const createCostCenterMutation = useCreateCostCenter();

  // Convert API response to legacy format
  const costCenters: LegacyCostCenter[] = useMemo(() => {
    if (costCentersData && costCentersData.length > 0) {
      return costCentersData.map((cc) => convertToLegacyCostCenter(cc as CostCenter));
    }
    return [];
  }, [costCentersData]);

  const isEmpty = !isLoadingCostCenters && costCenters.length === 0;

  const handleCreateSubmit = async (data: CostCenterFormData) => {
    try {
      await createCostCenterMutation.mutateAsync({
        code: data.code,
        name: data.name,
        description: data.description,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create cost center:", error);
    }
  };

  const handleView = (id: string) => {
    // Cost center viewing is handled via the card
  };

  const handleEdit = (id: string) => {
    // Cost center editing is handled via the card slideout
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
        <MetricsChart04
          title={String(costCenters.length)}
          subtitle="Cost Centers"
          change="+1"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 3 }, { value: 4 }, { value: 4 }, { value: 5 }, { value: 5 }, { value: 6 }]}
          actions={false}
        />
        <MetricsChart04
          title={formatCurrency(totalBudget)}
          subtitle="Total Budget"
          change="+5%"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 50 }, { value: 55 }, { value: 60 }, { value: 65 }, { value: 70 }, { value: 75 }]}
          actions={false}
        />
        <MetricsChart04
          title={formatCurrency(totalSpend)}
          subtitle="Total Spend"
          change="+9.3%"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 30 }, { value: 35 }, { value: 40 }, { value: 45 }, { value: 48 }, { value: 52 }]}
          actions={false}
        />
        <MetricsChart04
          title={`${avgUtilization}%`}
          subtitle="Avg Utilization"
          change="+3%"
          changeTrend="positive"
          chartColor="text-fg-warning-secondary"
          chartData={[{ value: 60 }, { value: 62 }, { value: 65 }, { value: 68 }, { value: 70 }, { value: 72 }]}
          actions={false}
        />
      </div>

      {/* Cost Centers List or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={<CostCenterIcon />}
          title="No cost centers yet"
          description="Create your first cost center to organize and allocate AI costs across departments and business units."
          actionLabel="Create Cost Center"
          onAction={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <CostCenterList
          costCenters={costCenters}
          onView={handleView}
          onEdit={handleEdit}
        />
      )}

      {/* Create Cost Center Dialog */}
      <CreateCostCenterDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createCostCenterMutation.isPending}
      />
    </div>
  );
};
