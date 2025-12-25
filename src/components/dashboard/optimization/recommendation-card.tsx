"use client";

import type { FC } from "react";
import {
  ArrowDown2,
  ArrowUp2,
  Box1,
  Edit2,
  Layer,
  Repeat,
  Warning2,
  TickCircle,
  CloseCircle,
} from "iconsax-react";
import type { Recommendation, RecommendationType } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

export interface RecommendationCardProps {
  recommendation: Recommendation;
  onApply?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

const typeConfig: Record<RecommendationType, { icon: FC<{ size: number; color: string }>; label: string; color: string }> = {
  model_downgrade: { icon: ArrowDown2, label: "Model Downgrade", color: "text-success-primary" },
  model_upgrade: { icon: ArrowUp2, label: "Model Upgrade", color: "text-brand-primary" },
  caching_opportunity: { icon: Box1, label: "Caching", color: "text-warning-primary" },
  prompt_optimization: { icon: Edit2, label: "Prompt Optimization", color: "text-brand-primary" },
  batching_opportunity: { icon: Layer, label: "Batching", color: "text-utility-blue-500" },
  provider_switch: { icon: Repeat, label: "Provider Switch", color: "text-success-primary" },
  unused_capacity: { icon: Warning2, label: "Unused Capacity", color: "text-error-primary" },
};

const confidenceColors: Record<string, "success" | "warning" | "gray"> = {
  high: "success",
  medium: "warning",
  low: "gray",
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const ApplyIcon = ({ className }: { className?: string }) => (
  <TickCircle size={16} color="currentColor" className={className} variant="Outline" />
);

const DismissIcon = ({ className }: { className?: string }) => (
  <CloseCircle size={16} color="currentColor" className={className} variant="Outline" />
);

export const RecommendationCard: FC<RecommendationCardProps> = ({
  recommendation,
  onApply,
  onDismiss,
  className,
}) => {
  const config = typeConfig[recommendation.type];
  const Icon = config.icon;
  const isPending = recommendation.status === "pending";
  const isApplied = recommendation.status === "applied";

  return (
    <div
      className={cx(
        "rounded-xl border bg-primary p-5 shadow-xs transition-shadow hover:shadow-md",
        isApplied ? "border-success-primary bg-success-secondary/20" : "border-secondary",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cx("flex size-10 items-center justify-center rounded-lg bg-secondary", config.color)}>
            <Icon size={20} color="currentColor" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-tertiary">{config.label}</span>
              <Badge size="sm" color={confidenceColors[recommendation.impact.confidence]}>
                {recommendation.impact.confidence} confidence
              </Badge>
            </div>
            <h4 className="mt-1 text-base font-semibold text-primary">{recommendation.title}</h4>
          </div>
        </div>
        {isApplied && (
          <Badge size="sm" color="success">Applied</Badge>
        )}
        {recommendation.status === "dismissed" && (
          <Badge size="sm" color="gray">Dismissed</Badge>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-secondary">{recommendation.description}</p>

      {/* Impact Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-secondary p-3">
        <div>
          <p className="text-xs text-tertiary">Est. Savings</p>
          <p className="text-lg font-semibold text-success-primary">
            {formatCurrency(recommendation.impact.estimatedMonthlySavings)}/mo
          </p>
        </div>
        <div>
          <p className="text-xs text-tertiary">Savings %</p>
          <p className="text-lg font-semibold text-primary">
            {recommendation.impact.savingsPercentage}%
          </p>
        </div>
        <div>
          <p className="text-xs text-tertiary">Affected</p>
          <p className="text-lg font-semibold text-primary">
            {formatNumber(recommendation.impact.affectedRequests)} req
          </p>
        </div>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            color="primary"
            iconLeading={ApplyIcon}
            onClick={() => onApply?.(recommendation.id)}
            className="flex-1"
          >
            Apply
          </Button>
          <Button
            size="sm"
            color="secondary"
            iconLeading={DismissIcon}
            onClick={() => onDismiss?.(recommendation.id)}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
};
