"use client";

import type { FC } from "react";
import { ExportSquare, MagicStar, Refresh2 } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { OptimizationScore } from "./optimization-score";
import { RecommendationList } from "./recommendation-list";
import { SavingsChart } from "./savings-chart";
import { EmptyState } from "../shared/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useRecommendations, useOptimizationSummary, useApplyRecommendation, useDismissRecommendation, useAnalyzeOptimization } from "@/hooks/use-optimization";
import { useToastNotification } from "@/components/feedback/toast-notifications";
import {
  mockSavingsHistory,
  mockOptimizationScore,
} from "@/data/mock-recommendations";

const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);

const OptimizationIcon = () => (
  <MagicStar size={32} color="#7F56D9" variant="Bulk" />
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <Refresh2 size={20} color="currentColor" className={className} variant="Outline" />
);

export const OptimizationOverview: FC = () => {
  const { showToast } = useToastNotification();
  
  // Fetch recommendations from API
  const { data: recommendationsData, isLoading, refetch } = useRecommendations();
  const { data: summaryData } = useOptimizationSummary();
  const applyMutation = useApplyRecommendation();
  const dismissMutation = useDismissRecommendation();
  const analyzeMutation = useAnalyzeOptimization();

  // Define recommendation type for this component
  type LocalRec = {
    id: string;
    status: string;
    impact?: { estimatedMonthlySavings?: number };
    [key: string]: unknown;
  };

  // API returns { success, data: { recommendations, summary } } - extract the array
  const apiResponse = recommendationsData as unknown as { data?: { recommendations?: LocalRec[] } } | LocalRec[] | undefined;
  const recommendations: LocalRec[] = Array.isArray(apiResponse) 
    ? apiResponse 
    : (apiResponse?.data?.recommendations || []);

  const summaryResponse = summaryData as unknown as { data?: { summary?: { totalPotentialSavings?: number } } } | undefined;
  const totalPotentialSavingsFromSummary = summaryResponse?.data?.summary?.totalPotentialSavings;

  const pendingCount = recommendations.filter((r) => r.status === "pending").length;
  const appliedCount = recommendations.filter((r) => r.status === "applied").length;
  const totalPotentialSavings = totalPotentialSavingsFromSummary || 
    recommendations.filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + (r.impact?.estimatedMonthlySavings || 0), 0);
  
  const isEmpty = !isLoading && recommendations.length === 0;

  const handleApply = async (id: string) => {
    try {
      await applyMutation.mutateAsync(id);
      showToast("success", "Recommendation Applied", "The optimization has been applied successfully.");
      refetch();
    } catch (error) {
      showToast("error", "Failed to Apply", "Could not apply the recommendation. Please try again.");
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissMutation.mutateAsync(id);
      showToast("info", "Recommendation Dismissed", "The recommendation has been dismissed.");
      refetch();
    } catch (error) {
      showToast("error", "Failed to Dismiss", "Could not dismiss the recommendation. Please try again.");
    }
  };

  const handleAnalyze = async () => {
    try {
      await analyzeMutation.mutateAsync();
      showToast("success", "Analysis Complete", "New recommendations have been generated based on your usage.");
      refetch();
    } catch (error) {
      showToast("error", "Analysis Failed", "Could not run optimization analysis. Please try again.");
    }
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
          <Button 
            size="md" 
            color="secondary" 
            iconLeading={RefreshIcon}
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending}
          >
            {analyzeMutation.isPending ? "Analyzing..." : "Run Analysis"}
          </Button>
          <Button size="md" color="secondary" iconLeading={ExportIcon}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <LoadingIndicator type="line-simple" size="lg" label="Loading recommendations..." />
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricsChart04
          title={String(pendingCount)}
          subtitle="Pending Recommendations"
          change="actionable"
          changeTrend="positive"
          chartColor="text-fg-warning-secondary"
          chartData={[{ value: 5 }, { value: 6 }, { value: 4 }, { value: 7 }, { value: 5 }, { value: 6 }]}
          actions={false}
        />
        <MetricsChart04
          title={`$${totalPotentialSavings.toLocaleString()}/mo`}
          subtitle="Potential Savings"
          change="available"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 800 }, { value: 1000 }, { value: 1200 }, { value: 1400 }, { value: 1600 }, { value: 1800 }]}
          actions={false}
        />
        <MetricsChart04
          title={String(appliedCount)}
          subtitle="Applied This Month"
          change="+3"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }]}
          actions={false}
        />
      </div>

      {/* Score and Chart Row or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={<OptimizationIcon />}
          title="No optimization data yet"
          description="Connect AI providers and start tracking usage to receive AI-powered recommendations for reducing your spending."
          actionLabel="View Providers"
          onAction={() => window.location.href = "/dashboard/providers"}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <OptimizationScore
              score={mockOptimizationScore.score}
              breakdown={mockOptimizationScore.breakdown}
            />
            <SavingsChart data={mockSavingsHistory} />
          </div>

          {/* Recommendations List */}
          <RecommendationList
            recommendations={recommendations as unknown as import("@/types").Recommendation[]}
            onApply={handleApply}
            onDismiss={handleDismiss}
          />
        </>
      )}
    </div>
  );
};
