"use client";

import type { FC } from "react";
import { useMemo } from "react";
import { cx } from "@/utils/cx";
import type { CostTrend } from "@/types";

export interface CostChartProps {
  data: CostTrend[];
  className?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const CostChart: FC<CostChartProps> = ({ data, className }) => {
  const chartData = useMemo(() => {
    if (!data.length) return { points: [], maxCost: 0, minCost: 0 };
    
    const costs = data.map((d) => d.cost);
    const maxCost = Math.max(...costs);
    const minCost = Math.min(...costs);
    const range = maxCost - minCost || 1;
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.cost - minCost) / range) * 80 - 10;
      return { x, y, ...d };
    });
    
    return { points, maxCost, minCost };
  }, [data]);

  const pathD = useMemo(() => {
    if (chartData.points.length < 2) return "";
    
    const points = chartData.points;
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  }, [chartData.points]);

  const areaPath = useMemo(() => {
    if (!pathD) return "";
    const lastPoint = chartData.points[chartData.points.length - 1];
    const firstPoint = chartData.points[0];
    return `${pathD} L ${lastPoint.x} 100 L ${firstPoint.x} 100 Z`;
  }, [pathD, chartData.points]);

  const yAxisLabels = useMemo(() => {
    const { maxCost, minCost } = chartData;
    const step = (maxCost - minCost) / 4;
    return Array.from({ length: 5 }, (_, i) => maxCost - step * i);
  }, [chartData]);

  const xAxisLabels = useMemo(() => {
    if (data.length <= 7) return data.map((d) => formatDate(d.date));
    const step = Math.floor(data.length / 6);
    return data.filter((_, i) => i % step === 0 || i === data.length - 1).map((d) => formatDate(d.date));
  }, [data]);

  return (
    <div className={cx("rounded-xl border border-secondary bg-primary p-6 shadow-xs", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Spend Over Time</h3>
          <p className="text-sm text-tertiary">Daily cost breakdown for the selected period</p>
        </div>
      </div>

      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full w-16 flex-col justify-between py-2 text-right">
          {yAxisLabels.map((label, i) => (
            <span key={i} className="text-xs text-quaternary">
              {formatCurrency(label)}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="ml-16 h-full">
          <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
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

            {/* Area fill */}
            <path d={areaPath} fill="url(#costGradient)" opacity="0.3" />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#7F56D9"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7F56D9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7F56D9" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Data points */}
            {chartData.points.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="0.8"
                fill="#7F56D9"
                className="cursor-pointer transition-all hover:r-[1.2]"
              >
                <title>{`${formatDate(point.date)}: ${formatCurrency(point.cost)}`}</title>
              </circle>
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="ml-16 mt-2 flex justify-between">
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
