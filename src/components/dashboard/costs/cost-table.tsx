"use client";

import type { FC } from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { ExportSquare, ArrowLeft2, ArrowRight2, DocumentText, DocumentDownload, Document } from "iconsax-react";
import type { SortDescriptor } from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Table } from "@/components/application/table/table";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useToastNotification } from "@/components/feedback/toast-notifications";
import { cx } from "@/utils/cx";
import type { CostRecord } from "@/types";
import * as XLSX from "xlsx";

const PAGE_SIZE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToastNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Export functions
  const exportToCSV = () => {
    const headers = ["Timestamp", "Provider", "Model", "Input Tokens", "Output Tokens", "Cost (USD)", "Team"];
    const rows = sortedData.map((r) => [
      r.timestamp.toISOString(),
      r.provider,
      r.model,
      r.tokensInput,
      r.tokensOutput,
      r.cost.toFixed(4),
      r.teamId || "-",
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    downloadFile(csv, `usage-records-${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
  };

  const exportToExcel = () => {
    const worksheetData = [
      ["Usage Records Export"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["Timestamp", "Provider", "Model", "Input Tokens", "Output Tokens", "Cost (USD)", "Team"],
      ...sortedData.map((r) => [
        r.timestamp.toISOString(),
        r.provider,
        r.model,
        r.tokensInput,
        r.tokensOutput,
        r.cost,
        r.teamId || "-",
      ]),
    ];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet["!cols"] = [{ wch: 22 }, { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    downloadBlob(blob, `usage-records-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async (format: "csv" | "excel") => {
    setIsExporting(true);
    setExportDropdownOpen(false);
    try {
      if (format === "csv") {
        exportToCSV();
      } else {
        exportToExcel();
      }
      showToast("success", "Export Complete", `Usage records exported as ${format.toUpperCase()}.`);
    } catch (err) {
      showToast("error", "Export Failed", "Failed to export usage records.");
    } finally {
      setIsExporting(false);
    }
  };

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

  // Pagination
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

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
        {/* Export Dropdown */}
        <div className="relative" ref={exportDropdownRef}>
          <Button
            size="sm"
            color="secondary"
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            disabled={isExporting || data.length === 0}
          >
            <span className="flex items-center gap-1.5">
              {isExporting ? (
                <LoadingIndicator type="line-spinner" size="sm" />
              ) : (
                <ExportIcon />
              )}
              {isExporting ? "Exporting..." : "Export"}
              <svg
                className={`size-3.5 transition-transform ${exportDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </Button>
          
          {/* Dropdown Menu */}
          {exportDropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-secondary bg-primary shadow-lg">
              <div className="py-1">
                <button
                  onClick={() => handleExport("excel")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-primary transition-colors hover:bg-secondary"
                >
                  <DocumentDownload size={16} color="currentColor" variant="Outline" />
                  <div>
                    <div className="font-medium">Excel</div>
                    <div className="text-xs text-tertiary">Spreadsheet format</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-primary transition-colors hover:bg-secondary"
                >
                  <DocumentText size={16} color="currentColor" variant="Outline" />
                  <div>
                    <div className="font-medium">CSV</div>
                    <div className="text-xs text-tertiary">Raw data</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
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
          <Table.Body items={paginatedData}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-secondary px-6 py-4">
          <p className="text-sm text-tertiary">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, sortedData.length)} of {sortedData.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              color="secondary"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <span className="flex items-center gap-1.5">
                <ArrowLeft2 size={16} color="currentColor" variant="Outline" />
                Previous
              </span>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cx(
                      "flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      currentPage === pageNum
                        ? "bg-brand-solid text-white"
                        : "text-tertiary hover:bg-secondary hover:text-primary"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              size="sm"
              color="secondary"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <span className="flex items-center gap-1.5">
                Next
                <ArrowRight2 size={16} color="currentColor" variant="Outline" />
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
