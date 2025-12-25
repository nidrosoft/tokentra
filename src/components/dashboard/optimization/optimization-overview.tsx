"use client";

import type { FC } from "react";
import { useState } from "react";
import { Lamp, ExportSquare } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { OptimizationScore } from "./optimization-score";
import { RecommendationList } from "./recommendation-list";
import { SavingsChart } from "./savings-chart";
import {
  mockRecommendations,
  mockSavingsHistory,
  mockOptimizationScore,
} from "@/data/mock-recommendations";

const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);

export const OptimizationOverview: FC = () => {
  const [recommendations, setRecommendations] = useState(mockRecommendations);

  const pendingCount = recommendations.filter((r) => r.status === "pending").length;
  const appliedCount = recommendations.filter((r) => r.status === "applied").length;
  const totalPotentialSavings = recommendations
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.impact.estimatedMonthlySavings, 0);

  const handleApply = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "applied" as const, appliedAt: new Date() } : r
      )
    );
  };

  const handleDismiss = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "dismissed" as const, dismissedAt: new Date() } : r
      )
    );
  };

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
              Optimization
            </h1>
            {pendingCount > 0 && (
              <span className="flex size-6 items-center justify-center rounded-full bg-brand-primary text-xs font-medium text-white">
                {pendingCount}
              </span>
            )}
          </div>
          <p className="text-md text-tertiary">
            AI-powered recommendations to reduce your spending.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md" color="secondary" iconLeading={ExportIcon}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Pending Recommendations</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{pendingCount}</p>
          <p className="mt-1 text-xs text-quaternary">actionable opportunities</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Potential Savings</p>
          <p className="mt-1 text-2xl font-semibold text-success-primary">
            ${totalPotentialSavings.toLocaleString()}/mo
          </p>
          <p className="mt-1 text-xs text-quaternary">if all recommendations applied</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Applied This Month</p>
          <p className="mt-1 text-2xl font-semibold text-brand-primary">{appliedCount}</p>
          <p className="mt-1 text-xs text-quaternary">recommendations implemented</p>
        </div>
      </div>

      {/* Score and Chart Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OptimizationScore
          score={mockOptimizationScore.score}
          breakdown={mockOptimizationScore.breakdown}
        />
        <SavingsChart data={mockSavingsHistory} />
      </div>

      {/* Recommendations List */}
      <RecommendationList
        recommendations={recommendations}
        onApply={handleApply}
        onDismiss={handleDismiss}
      />
    </div>
  );
};
