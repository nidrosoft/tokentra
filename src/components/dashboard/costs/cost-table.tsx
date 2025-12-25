"use client";

import type { FC } from "react";
import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, ExportSquare } from "iconsax-react";
import type { SortDescriptor } from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Table } from "@/components/application/table/table";
import { cx } from "@/utils/cx";
import type { CostRecord } from "@/types";

export interface CostTableProps {
  data: CostRecord[];
  className?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const providerColors: Record<string, "brand" | "success" | "warning" | "error" | "gray"> = {
  openai: "success",
  anthropic: "brand",
  google: "warning",
  azure: "blue" as "brand",
  aws: "error",
};

const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);

export const CostTable: FC<CostTableProps> = ({ data, className }) => {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "timestamp",
    direction: "descending",
  });

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const column = sortDescriptor.column as keyof CostRecord;
      const aVal = a[column];
      const bVal = b[column];

      if (aVal === undefined || bVal === undefined) return 0;

      let aCompare: string | number = aVal as string | number;
      let bCompare: string | number = bVal as string | number;

      if (column === "timestamp") {
        aCompare = new Date(aVal as Date).getTime();
        bCompare = new Date(bVal as Date).getTime();
      } else if (typeof aVal === "string") {
        aCompare = aVal.toLowerCase();
        bCompare = (bVal as string).toLowerCase();
      }

      if (aCompare < bCompare) return sortDescriptor.direction === "ascending" ? -1 : 1;
      if (aCompare > bCompare) return sortDescriptor.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortDescriptor]);

  const columns = [
    { id: "timestamp", name: "Time", allowsSorting: true },
    { id: "provider", name: "Provider", allowsSorting: true },
    { id: "model", name: "Model", allowsSorting: true },
    { id: "tokensInput", name: "Input Tokens", allowsSorting: true },
    { id: "tokensOutput", name: "Output Tokens", allowsSorting: true },
    { id: "cost", name: "Cost", allowsSorting: true },
    { id: "teamId", name: "Team", allowsSorting: true },
  ];

  return (
    <div className={cx("rounded-xl border border-secondary bg-primary shadow-xs", className)}>
      <div className="flex items-center justify-between border-b border-secondary px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">Recent Costs</h3>
          <p className="text-sm text-tertiary">Detailed breakdown of recent API usage</p>
        </div>
        <Button size="sm" color="secondary" iconLeading={ExportIcon}>
          Export
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table
          aria-label="Cost records table"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Head
                id={column.id}
                allowsSorting={column.allowsSorting}
                isRowHeader={column.id === "timestamp"}
              >
                {column.name}
              </Table.Head>
            )}
          </Table.Header>
          <Table.Body items={sortedData}>
            {(item) => (
              <Table.Row id={item.id}>
                <Table.Cell>{formatTime(item.timestamp)}</Table.Cell>
                <Table.Cell>
                  <Badge size="sm" color={providerColors[item.provider] || "gray"}>
                    {item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-medium text-primary">{item.model}</span>
                </Table.Cell>
                <Table.Cell>{formatNumber(item.tokensInput)}</Table.Cell>
                <Table.Cell>{formatNumber(item.tokensOutput)}</Table.Cell>
                <Table.Cell>
                  <span className="font-semibold text-primary">{formatCurrency(item.cost)}</span>
                </Table.Cell>
                <Table.Cell>
                  <span className="capitalize text-tertiary">{item.teamId || "-"}</span>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};
