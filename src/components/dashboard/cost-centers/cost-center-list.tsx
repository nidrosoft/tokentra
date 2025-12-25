"use client";

import type { FC } from "react";
import { useState } from "react";
import { SearchNormal1 } from "iconsax-react";
import type { CostCenter } from "@/types";
import { Input } from "@/components/base/input/input";
import { CostCenterCard } from "./cost-center-card";
import { cx } from "@/utils/cx";

export interface CostCenterListProps {
  costCenters: CostCenter[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

const SearchIcon = ({ className }: { className?: string }) => (
  <SearchNormal1 size={20} color="currentColor" className={className} variant="Outline" />
);

export const CostCenterList: FC<CostCenterListProps> = ({
  costCenters,
  onView,
  onEdit,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCostCenters = costCenters.filter((cc) => {
    const matchesSearch =
      cc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cc.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className={cx("space-y-4", className)}>
      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search cost centers..."
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          icon={SearchIcon}
          className="sm:max-w-xs"
        />
      </div>

      {/* Cost Centers Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCostCenters.map((costCenter) => (
          <CostCenterCard
            key={costCenter.id}
            costCenter={costCenter}
            onView={onView}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredCostCenters.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary py-12">
          <p className="text-lg font-medium text-secondary">No cost centers found</p>
          <p className="mt-1 text-sm text-tertiary">
            {searchQuery
              ? "Try adjusting your search"
              : "Create your first cost center to get started"}
          </p>
        </div>
      )}
    </div>
  );
};
