"use client";

import type { FC, ReactNode } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Chart, Flash, TrendUp, Wallet } from "iconsax-react";
import { cx } from "@/utils/cx";

export interface TokenBreakdownData {
  input: number;
  output: number;
  cached: number;
  total: number;
}

export interface TokenUsageProps {
  data: TokenBreakdownData;
  className?: string;
}

const formatNumber = (value: number): string => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const tokenTypes = [
  { key: "input", label: "Input Tokens", color: "#7F56D9" },
  { key: "output", label: "Output Tokens", color: "#12B76A" },
  { key: "cached", label: "Cached Tokens", color: "#F79009" },
  { key: "other", label: "Other", color: "#2E90FA" },
] as const;

interface Insight {
  icon: ReactNode;
  title: string;
  description: string;
}

const generateInsights = (data: TokenBreakdownData): Insight[] => {
  const inputRatio = data.input / (data.input + data.output);
  const cachedRatio = data.cached / (data.input + data.output);
  const total = data.input + data.output;
  
  const insights: Insight[] = [];
  
  // Input/Output ratio insight
  if (inputRatio > 0.7) {
    insights.push({
      icon: <Chart size={16} color="#7F56D9" variant="Bold" />,
      title: "High Input Usage",
      description: `Input tokens account for ${(inputRatio * 100).toFixed(0)}% of your usage. Consider optimizing prompts with techniques like few-shot examples or system prompt compression.`,
    });
  } else if (inputRatio < 0.4) {
    insights.push({
      icon: <TrendUp size={16} color="#12B76A" variant="Bold" />,
      title: "Output-Heavy Workload",
      description: `Output tokens dominate at ${((1 - inputRatio) * 100).toFixed(0)}% of usage. This is typical for content generation tasks. Consider using streaming to improve perceived latency.`,
    });
  } else {
    insights.push({
      icon: <Chart size={16} color="#2E90FA" variant="Bold" />,
      title: "Balanced Token Usage",
      description: `Your input-to-output ratio is well balanced at ${(inputRatio * 100).toFixed(0)}/${((1 - inputRatio) * 100).toFixed(0)}. This indicates efficient prompt design for your use case.`,
    });
  }
  
  // Caching insight
  if (cachedRatio > 0.1) {
    insights.push({
      icon: <Wallet size={16} color="#12B76A" variant="Bold" />,
      title: "Cache Savings Active",
      description: `Prompt caching saved you ${formatNumber(data.cached)} tokens (${(cachedRatio * 100).toFixed(1)}% of total). You're saving approximately $${((data.cached / 1000000) * 0.50).toFixed(2)} this period.`,
    });
  } else {
    insights.push({
      icon: <Flash size={16} color="#F79009" variant="Bold" />,
      title: "Optimization Opportunity",
      description: `Enable prompt caching to reduce costs. With your current volume of ${formatNumber(total)} tokens, caching could save up to 25% on repeated prompts.`,
    });
  }
  
  return insights;
};

export const TokenUsage: FC<TokenUsageProps> = ({ data, className }) => {
  const total = data.input + data.output + data.cached;
  
  const chartData = [
    { name: "Input Tokens", value: data.input, color: "#7F56D9" },
    { name: "Output Tokens", value: data.output, color: "#12B76A" },
    { name: "Cached Tokens", value: data.cached, color: "#F79009" },
    { name: "Other", value: Math.round(total * 0.05), color: "#2E90FA" },
  ];

  const displayTotal = total + Math.round(total * 0.05);
  const insights = generateInsights(data);

  return (
    <div className={cx("rounded-xl border border-secondary bg-primary p-6 shadow-xs", className)}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">Token Breakdown</h3>
        <p className="text-sm text-tertiary">Distribution of token usage by type</p>
      </div>

      {/* Top Row: Chart + Legend */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        {/* Chart */}
        <div className="relative mx-auto h-[140px] w-[140px] flex-shrink-0 lg:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const entry = payload[0];
                    return (
                      <div className="rounded-lg border border-secondary bg-primary px-3 py-2 shadow-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className="size-2 rounded-full"
                            style={{ backgroundColor: entry.payload.color }}
                          />
                          <span className="text-secondary">{entry.name}:</span>
                          <span className="font-semibold text-primary">
                            {formatNumber(entry.value as number)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{ outline: "none" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-primary">{formatNumber(displayTotal)}</span>
            <span className="text-[10px] text-tertiary">Total Tokens</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1">
          <div className="space-y-2.5">
            {chartData.map((item) => {
              const percentage = displayTotal > 0 ? (item.value / displayTotal) * 100 : 0;
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="size-2.5 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-secondary">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">
                      {formatNumber(item.value)}
                    </span>
                    <span className="w-12 text-right text-xs text-tertiary">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="my-4 border-t border-secondary" />

      {/* Insights - Full width */}
      <div className="grid gap-4 sm:grid-cols-2">
        {insights.map((insight, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
              {insight.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-primary">{insight.title}</h4>
              <p className="mt-0.5 text-xs leading-relaxed text-tertiary">
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
