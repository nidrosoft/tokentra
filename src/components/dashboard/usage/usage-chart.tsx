"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import { cx } from "@/utils/cx";
import type { UsageTrend } from "@/types";

export interface UsageChartProps {
  data: UsageTrend[];
  className?: string;
}

type ViewMode = "tokens" | "requests";

const formatNumber = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const UsageChart: FC<UsageChartProps> = ({ data, className }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("tokens");

  const chartData = useMemo(() => {
    if (!data.length) return { points: [], maxValue: 0, minValue: 0 };

    const values = data.map((d) =>
      viewMode === "tokens" ? d.inputTokens + d.outputTokens : d.requests
    );
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
      const value = viewMode === "tokens" ? d.inputTokens + d.outputTokens : d.requests;
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 80 - 10;
      return { x, y, value, ...d };
    });

    return { points, maxValue, minValue };
  }, [data, viewMode]);

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
    const { maxValue, minValue } = chartData;
    const step = (maxValue - minValue) / 4;
    return Array.from({ length: 5 }, (_, i) => maxValue - step * i);
  }, [chartData]);

  const xAxisLabels = useMemo(() => {
    if (data.length <= 7) return data.map((d) => formatDate(d.date));
    const step = Math.floor(data.length / 6);
    return data.filter((_, i) => i % step === 0 || i === data.length - 1).map((d) => formatDate(d.date));
  }, [data]);

  const gradientId = viewMode === "tokens" ? "tokensGradient" : "requestsGradient";
  const strokeColor = viewMode === "tokens" ? "#7F56D9" : "#12B76A";

  return (
    <div className={cx("rounded-xl border border-secondary bg-primary p-6 shadow-xs", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">Usage Over Time</h3>
          <p className="text-sm text-tertiary">
            {viewMode === "tokens" ? "Token consumption" : "Request volume"} for the selected period
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          <button
            onClick={() => setViewMode("tokens")}
            className={cx(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "tokens"
                ? "bg-primary text-primary shadow-sm"
                : "text-tertiary hover:text-secondary"
            )}
          >
            Tokens
          </button>
          <button
            onClick={() => setViewMode("requests")}
            className={cx(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "requests"
                ? "bg-primary text-primary shadow-sm"
                : "text-tertiary hover:text-secondary"
            )}
          >
            Requests
          </button>
        </div>
      </div>

      <div className="relative h-64">
        <div className="absolute left-0 top-0 flex h-full w-16 flex-col justify-between py-2 text-right">
          {yAxisLabels.map((label, i) => (
            <span key={i} className="text-xs text-quaternary">
              {formatNumber(label)}
            </span>
          ))}
        </div>

        <div className="ml-16 h-full">
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

            <path d={areaPath} fill={`url(#${gradientId})`} opacity="0.3" />

            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <defs>
              <linearGradient id="tokensGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7F56D9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7F56D9" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#12B76A" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#12B76A" stopOpacity="0" />
              </linearGradient>
            </defs>

            {chartData.points.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="0.8"
                fill={strokeColor}
                className="cursor-pointer"
              >
                <title>{`${formatDate(point.date)}: ${formatNumber(point.value)}`}</title>
              </circle>
            ))}
          </svg>
        </div>

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
