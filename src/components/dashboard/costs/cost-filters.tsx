"use client";

import type { FC } from "react";
import { Calendar, Refresh2 } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";

export interface CostFilters {
  dateRange: string;
  provider: string;
  model: string;
  team: string;
  granularity: string;
}

export interface FilterOptions {
  providers?: string[];
  models?: string[];
  teams?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  costCenters?: { id: string; name: string }[];
}

export interface CostFiltersProps {
  filters: CostFilters;
  onFilterChange: (filters: CostFilters) => void;
  onReset?: () => void;
  filterOptions?: FilterOptions;
  className?: string;
}

const dateRangeOptions = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7d", label: "Last 7 days" },
  { id: "last30d", label: "Last 30 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "last90d", label: "Last 90 days" },
  { id: "last6m", label: "Last 6 months" },
  { id: "lastYear", label: "Last year" },
];

const defaultProviderOptions = [
  { id: "all", label: "All Providers" },
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
  { id: "google", label: "Google AI" },
  { id: "azure", label: "Azure OpenAI" },
  { id: "aws", label: "AWS Bedrock" },
  { id: "cohere", label: "Cohere" },
  { id: "mistral", label: "Mistral AI" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "xai", label: "xAI" },
];

const defaultModelOptions = [
  { id: "all", label: "All Models" },
];

const granularityOptions = [
  { id: "hour", label: "Hourly" },
  { id: "day", label: "Daily" },
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
];

const CalendarIcon = ({ className }: { className?: string }) => (
  <Calendar size={20} color="currentColor" className={className} variant="Outline" />
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <Refresh2 size={20} color="currentColor" className={className} variant="Outline" />
);

export const CostFiltersBar: FC<CostFiltersProps> = ({ filters, onFilterChange, onReset, filterOptions, className }) => {
  const handleFilterChange = (key: keyof CostFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFilterChange({
      dateRange: "last30d",
      provider: "all",
      model: "all",
      team: "all",
      granularity: "day",
    });
    onReset?.();
  };

  // Build provider options from API data or use defaults
  const providerOptions = [
    { id: "all", label: "All Providers" },
    ...(filterOptions?.providers?.map((p) => ({ 
      id: p, 
      label: p.charAt(0).toUpperCase() + p.slice(1) 
    })) || defaultProviderOptions.slice(1)),
  ];

  // Build model options from API data
  const modelOptions = [
    { id: "all", label: "All Models" },
    ...(filterOptions?.models?.map((m) => ({ id: m, label: m })) || []),
  ];

  // Build team options from API data
  const teamOptions = [
    { id: "all", label: "All Teams" },
    ...(filterOptions?.teams?.map((t) => ({ id: t.id, label: t.name })) || []),
  ];

  return (
    <div className={cx("flex flex-wrap items-center gap-3", className)}>
      {/* Date Range */}
      <div className="w-40">
        <Select
          size="sm"
          placeholder="Date Range"
          placeholderIcon={CalendarIcon}
          selectedKey={filters.dateRange}
          onSelectionChange={(key) => handleFilterChange("dateRange", key as string)}
          items={dateRangeOptions}
        >
          {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
        </Select>
      </div>

      {/* Provider */}
      <div className="w-36">
        <Select
          size="sm"
          placeholder="Provider"
          selectedKey={filters.provider}
          onSelectionChange={(key) => handleFilterChange("provider", key as string)}
          items={providerOptions}
        >
          {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
        </Select>
      </div>

      {/* Model */}
      <div className="w-44">
        <Select
          size="sm"
          placeholder="Model"
          selectedKey={filters.model}
          onSelectionChange={(key) => handleFilterChange("model", key as string)}
          items={modelOptions}
        >
          {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
        </Select>
      </div>

      {/* Team */}
      <div className="w-36">
        <Select
          size="sm"
          placeholder="Team"
          selectedKey={filters.team}
          onSelectionChange={(key) => handleFilterChange("team", key as string)}
          items={teamOptions}
        >
          {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
        </Select>
      </div>

      {/* Granularity */}
      <div className="w-32">
        <Select
          size="sm"
          placeholder="Granularity"
          selectedKey={filters.granularity}
          onSelectionChange={(key) => handleFilterChange("granularity", key as string)}
          items={granularityOptions}
        >
          {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
        </Select>
      </div>

      {/* Reset Button */}
      <Button size="sm" color="secondary" iconLeading={RefreshIcon} onClick={handleReset}>
        Reset
      </Button>
    </div>
  );
};
