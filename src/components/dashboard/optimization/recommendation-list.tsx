"use client";

import type { FC } from "react";
import { useState } from "react";
import type { Recommendation, RecommendationStatus } from "@/types";
import { RecommendationCard } from "./recommendation-card";
import { cx } from "@/utils/cx";

export interface RecommendationListProps {
  recommendations: Recommendation[];
  onApply?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

const statusFilters: { value: RecommendationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "applied", label: "Applied" },
  { value: "dismissed", label: "Dismissed" },
];

export const RecommendationList: FC<RecommendationListProps> = ({
  recommendations,
  onApply,
  onDismiss,
  className,
}) => {
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | "all">("all");

  const filteredRecommendations = recommendations.filter((rec) => {
    if (statusFilter === "all") return true;
    return rec.status === statusFilter;
  });

  const pendingCount = recommendations.filter((r) => r.status === "pending").length;
  const totalSavings = recommendations
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.impact.estimatedMonthlySavings, 0);

  return (
    <div className={cx("space-y-4", className)}>
      {/* Header with filters */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-primary">Recommendations</h3>
          <p className="text-sm text-tertiary">
            {pendingCount} pending · ${totalSavings.toLocaleString()}/mo potential savings
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cx(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === filter.value
                  ? "bg-primary text-primary shadow-sm"
                  : "text-tertiary hover:text-secondary"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredRecommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onApply={onApply}
            onDismiss={onDismiss}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary py-12">
          <p className="text-lg font-medium text-secondary">No recommendations found</p>
          <p className="mt-1 text-sm text-tertiary">
            {statusFilter === "all"
              ? "Your AI usage is already optimized!"
              : `No ${statusFilter} recommendations`}
          </p>
        </div>
      )}
    </div>
  );
};
