"use client";

import type { FC } from "react";
import { useState } from "react";
import { DocumentText, Chart, Receipt, Magicpen } from "iconsax-react";
import type { ReportType, ReportConfig } from "@/types";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select, type SelectItemType } from "@/components/base/select/select";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { cx } from "@/utils/cx";

export interface ReportBuilderProps {
  onGenerate?: (config: ReportConfig & { name: string; type: ReportType }) => void;
  isLoading?: boolean;
  className?: string;
}

const reportTypes: { value: ReportType; label: string; description: string; icon: FC<{ size: number; color: string }> }[] = [
  { value: "cost_summary", label: "Cost Summary", description: "Total costs by provider and model", icon: DocumentText },
  { value: "usage_summary", label: "Usage Summary", description: "Token usage and request metrics", icon: Chart },
  { value: "chargeback", label: "Chargeback", description: "Cost allocation by team/project", icon: Receipt },
  { value: "optimization", label: "Optimization", description: "Savings opportunities", icon: Magicpen },
];

const dateRangeItems: SelectItemType[] = [
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "last_quarter", label: "Last quarter" },
  { id: "custom", label: "Custom range" },
];

const formatItems: SelectItemType[] = [
  { id: "pdf", label: "PDF Document" },
  { id: "csv", label: "CSV Spreadsheet" },
  { id: "xlsx", label: "Excel Workbook" },
];

const groupByOptions = [
  { id: "provider", label: "Provider" },
  { id: "model", label: "Model" },
  { id: "team", label: "Team" },
  { id: "project", label: "Project" },
];

export const ReportBuilder: FC<ReportBuilderProps> = ({
  onGenerate,
  isLoading = false,
  className,
}) => {
  const [reportType, setReportType] = useState<ReportType>("cost_summary");
  const [reportName, setReportName] = useState("");
  const [dateRange, setDateRange] = useState("last_30_days");
  const [format, setFormat] = useState<"pdf" | "csv" | "xlsx">("pdf");
  const [groupBy, setGroupBy] = useState<string[]>(["provider", "model"]);

  const handleGroupByToggle = (id: string, isSelected: boolean) => {
    setGroupBy((prev) =>
      isSelected ? [...prev, id] : prev.filter((g) => g !== id)
    );
  };

  const handleGenerate = () => {
    const config: ReportConfig & { name: string; type: ReportType } = {
      name: reportName || `${reportTypes.find((t) => t.value === reportType)?.label} - ${new Date().toLocaleDateString()}`,
      type: reportType,
      dateRange: { from: dateRange, to: dateRange },
      groupBy,
      format,
    };
    onGenerate?.(config);
  };

  return (
    <div className={cx("rounded-xl border border-secondary bg-primary p-6 shadow-xs", className)}>
      <h3 className="text-lg font-semibold text-primary">Generate Report</h3>
      <p className="mt-1 text-sm text-tertiary">Configure and generate a new report</p>

      <div className="mt-6 space-y-5">
        {/* Report Type Selection */}
        <div>
          <p className="mb-3 text-sm font-medium text-secondary">Report Type</p>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = reportType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setReportType(type.value)}
                  className={cx(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-all",
                    isSelected
                      ? "border-brand-solid bg-brand-secondary ring-2 ring-brand"
                      : "border-secondary hover:border-tertiary"
                  )}
                >
                  <Icon size={20} color={isSelected ? "#7F56D9" : "currentColor"} />
                  <div className="min-w-0">
                    <p className={cx("text-sm font-medium", isSelected ? "text-brand-primary" : "text-primary")}>
                      {type.label}
                    </p>
                    <p className="mt-0.5 text-xs text-tertiary">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Name */}
        <Input
          label="Report Name (Optional)"
          placeholder="Auto-generated if empty"
          value={reportName}
          onChange={(value) => setReportName(value)}
        />

        {/* Date Range & Format */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Date Range"
            selectedKey={dateRange}
            onSelectionChange={(key) => setDateRange(key as string)}
            items={dateRangeItems}
          >
            {(item) => <Select.Item key={item.id} id={item.id} textValue={item.label}>{item.label}</Select.Item>}
          </Select>
          <Select
            label="Format"
            selectedKey={format}
            onSelectionChange={(key) => setFormat(key as "pdf" | "csv" | "xlsx")}
            items={formatItems}
          >
            {(item) => <Select.Item key={item.id} id={item.id} textValue={item.label}>{item.label}</Select.Item>}
          </Select>
        </div>

        {/* Group By */}
        <div>
          <p className="mb-2 text-sm font-medium text-secondary">Group By</p>
          <div className="flex flex-wrap gap-4">
            {groupByOptions.map((option) => (
              <Checkbox
                key={option.id}
                isSelected={groupBy.includes(option.id)}
                onChange={(isSelected) => handleGroupByToggle(option.id, isSelected)}
                label={option.label}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          size="md"
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </div>
  );
};
