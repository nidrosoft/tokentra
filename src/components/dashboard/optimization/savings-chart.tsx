"use client";

import type { FC } from "react";
import { useMemo } from "react";
import { cx } from "@/utils/cx";

export interface SavingsDataPoint {
  date: string;
  savings: number;
  applied: number;
}

export interface SavingsChartProps {
  data: SavingsDataPoint[];
  className?: string;
}

const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString()}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const SavingsChart: FC<SavingsChartProps> = ({ data, className }) => {
  const chartData = useMemo(() => {
    if (!data.length) return { points: [], appliedPoints: [], maxValue: 0 };

    const maxValue = Math.max(...data.map((d) => d.savings));
    const minValue = 0;
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.savings - minValue) / range) * 80 - 10;
      return { x, y, value: d.savings, ...d };
    });

    const appliedPoints = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.applied - minValue) / range) * 80 - 10;
      return { x, y, value: d.applied, ...d };
    });

    return { points, appliedPoints, maxValue };
  }, [data]);

  const createPath = (points: { x: number; y: number }[]): string => {
    if (points.length < 2) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  const potentialPath = createPath(chartData.points);
  const appliedPath = createPath(chartData.appliedPoints);

  const xAxisLabels = useMemo(() => {
    if (data.length <= 7) return data.map((d) => formatDate(d.date));
    const step = Math.floor(data.length / 5);
    return data.filter((_, i) => i % step === 0 || i === data.length - 1).map((d) => formatDate(d.date));
  }, [data]);

  const totalPotential = data.reduce((sum, d) => sum + d.savings, 0);
  const totalApplied = data.reduce((sum, d) => sum + d.applied, 0);

  return (
    <div className={cx("rounded-xl border border-secondary bg-primary p-6 shadow-xs", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Savings Over Time</h3>
          <p className="text-sm text-tertiary">Potential vs applied savings this month</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-fg-brand-primary" />
            <span className="text-sm text-secondary">Potential</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-fg-success-primary" />
            <span className="text-sm text-secondary">Applied</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-brand-secondary p-3">
          <p className="text-xs text-brand-primary">Total Potential</p>
          <p className="text-xl font-semibold text-brand-primary">{formatCurrency(totalPotential)}</p>
        </div>
        <div className="rounded-lg bg-success-secondary p-3">
          <p className="text-xs text-success-primary">Total Applied</p>
          <p className="text-xl font-semibold text-success-primary">{formatCurrency(totalApplied)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48">
        <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-border-secondary"
            />
          ))}

          {/* Potential savings line */}
          <path
            d={potentialPath}
            fill="none"
            stroke="#7F56D9"
            strokeWidth="0.5"
            strokeLinecap="round"
          />

          {/* Applied savings line */}
          <path
            d={appliedPath}
            fill="none"
            stroke="#12B76A"
            strokeWidth="0.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="mt-2 flex justify-between">
          {xAxisLabels.map((label, i) => (
            <span key={i} className="text-xs text-quaternary">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
