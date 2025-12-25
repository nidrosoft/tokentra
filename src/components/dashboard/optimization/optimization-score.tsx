"use client";

import type { FC } from "react";
import { cx } from "@/utils/cx";

export interface OptimizationScoreProps {
  score: number;
  breakdown?: {
    modelEfficiency: number;
    cachingUtilization: number;
    promptOptimization: number;
    costAllocation: number;
  };
  className?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#12B76A";
  if (score >= 60) return "#F79009";
  return "#F04438";
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
};

export const OptimizationScore: FC<OptimizationScoreProps> = ({
  score,
  breakdown,
  className,
}) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const breakdownItems = breakdown
    ? [
        { label: "Model Efficiency", value: breakdown.modelEfficiency },
        { label: "Caching", value: breakdown.cachingUtilization },
        { label: "Prompt Optimization", value: breakdown.promptOptimization },
        { label: "Cost Allocation", value: breakdown.costAllocation },
      ]
    : [];

  return (
    <div className={cx("rounded-xl border border-secondary bg-primary p-6 shadow-xs", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">Optimization Score</h3>
        <p className="text-sm text-tertiary">Overall efficiency of your AI spending</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular Gauge */}
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#E4E7EC"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 60 60)"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-primary">{score}</span>
            <span className="text-xs text-tertiary">{label}</span>
          </div>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="flex-1 space-y-3">
            {breakdownItems.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-secondary">{item.label}</span>
                  <span className="text-sm font-medium text-primary">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: getScoreColor(item.value),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
