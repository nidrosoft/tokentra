"use client";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type {
  CostSummary,
  CostTrendPoint,
  CostBreakdown,
  CostRecord,
} from "@/hooks/use-cost-analysis";

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportData {
  summary: CostSummary;
  trends: CostTrendPoint[];
  byProvider: CostBreakdown[];
  byModel: CostBreakdown[];
  records: CostRecord[];
  filters: {
    dateRange: string;
    provider: string;
    model: string;
    team: string;
  };
  generatedAt: string;
}

// ============================================================================
// BRANDING
// ============================================================================

const BRAND_COLORS = {
  primary: "#7F56D9", // Purple
  secondary: "#6941C6",
  success: "#12B76A",
  warning: "#F79009",
  error: "#F04438",
  gray: "#667085",
  dark: "#101828",
  light: "#F9FAFB",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toLocaleString();
}

function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDateRange(dateRange: string): string {
  const ranges: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    last7d: "Last 7 Days",
    last30d: "Last 30 Days",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    last90d: "Last 90 Days",
    last6m: "Last 6 Months",
    lastYear: "Last Year",
  };
  return ranges[dateRange] || dateRange;
}

function getFileName(format: ExportFormat): string {
  const date = new Date().toISOString().split("T")[0];
  const extensions: Record<ExportFormat, string> = {
    csv: "csv",
    excel: "xlsx",
    pdf: "pdf",
  };
  return `TokenTRA-Cost-Analysis-${date}.${extensions[format]}`;
}

// ============================================================================
// CSV EXPORT
// ============================================================================

export function exportToCSV(data: ExportData): void {
  const lines: string[] = [];

  // Header
  lines.push("TokenTRA Cost Analysis Report");
  lines.push(`Generated: ${data.generatedAt}`);
  lines.push(`Period: ${formatDateRange(data.filters.dateRange)}`);
  lines.push("");

  // Summary
  lines.push("SUMMARY");
  lines.push(`Total Spend,${formatCurrency(data.summary.totalCost)}`);
  lines.push(`Total Tokens,${formatNumber(data.summary.totalTokens)}`);
  lines.push(`Total Requests,${formatNumber(data.summary.totalRequests)}`);
  lines.push(`Avg Cost/Request,${formatCurrency(data.summary.avgCostPerRequest)}`);
  lines.push(`Cost Change,${formatPercentage(data.summary.costChange)}`);
  lines.push("");

  // Provider Breakdown
  lines.push("COST BY PROVIDER");
  lines.push("Provider,Cost,Percentage,Tokens,Requests");
  data.byProvider.forEach((p) => {
    lines.push(`${p.value},${p.cost.toFixed(2)},${p.percentage.toFixed(1)}%,${p.tokens},${p.requests}`);
  });
  lines.push("");

  // Model Breakdown
  lines.push("COST BY MODEL");
  lines.push("Model,Cost,Percentage,Tokens,Requests");
  data.byModel.forEach((m) => {
    lines.push(`${m.value},${m.cost.toFixed(2)},${m.percentage.toFixed(1)}%,${m.tokens},${m.requests}`);
  });
  lines.push("");

  // Usage Records
  lines.push("USAGE RECORDS");
  lines.push("Timestamp,Provider,Model,Input Tokens,Output Tokens,Cost,Team");
  data.records.forEach((r) => {
    lines.push(
      `${r.timestamp},${r.provider},${r.model},${r.inputTokens},${r.outputTokens},${r.cost.toFixed(4)},${r.teamName || "-"}`
    );
  });

  const csv = lines.join("\n");
  downloadFile(csv, getFileName("csv"), "text/csv");
}

// ============================================================================
// EXCEL EXPORT
// ============================================================================

export function exportToExcel(data: ExportData): void {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ["TokenTRA Cost Analysis Report"],
    [""],
    ["Generated", data.generatedAt],
    ["Period", formatDateRange(data.filters.dateRange)],
    [""],
    ["SUMMARY METRICS"],
    ["Metric", "Value", "Change"],
    ["Total Spend", formatCurrency(data.summary.totalCost), formatPercentage(data.summary.costChange)],
    ["Total Tokens", formatNumber(data.summary.totalTokens), formatPercentage(data.summary.tokenChange)],
    ["Total Requests", formatNumber(data.summary.totalRequests), formatPercentage(data.summary.requestChange)],
    ["Avg Cost/Request", formatCurrency(data.summary.avgCostPerRequest), ""],
    ["Avg Tokens/Request", formatNumber(data.summary.avgTokensPerRequest), ""],
    ["Avg Latency", `${data.summary.avgLatency.toFixed(0)}ms`, ""],
    ["Cache Hit Rate", `${data.summary.cacheHitRate.toFixed(1)}%`, ""],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Provider Breakdown Sheet
  const providerData = [
    ["Cost by Provider"],
    [""],
    ["Provider", "Cost (USD)", "Percentage", "Tokens", "Requests", "Avg Cost"],
    ...data.byProvider.map((p) => [
      p.value,
      p.cost,
      `${p.percentage.toFixed(1)}%`,
      p.tokens,
      p.requests,
      p.avgCost.toFixed(4),
    ]),
  ];
  const providerSheet = XLSX.utils.aoa_to_sheet(providerData);
  providerSheet["!cols"] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, providerSheet, "By Provider");

  // Model Breakdown Sheet
  const modelData = [
    ["Cost by Model"],
    [""],
    ["Model", "Cost (USD)", "Percentage", "Tokens", "Requests", "Avg Cost"],
    ...data.byModel.map((m) => [
      m.value,
      m.cost,
      `${m.percentage.toFixed(1)}%`,
      m.tokens,
      m.requests,
      m.avgCost.toFixed(4),
    ]),
  ];
  const modelSheet = XLSX.utils.aoa_to_sheet(modelData);
  modelSheet["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, modelSheet, "By Model");

  // Trends Sheet
  const trendsData = [
    ["Daily Cost Trends"],
    [""],
    ["Date", "Cost (USD)", "Tokens", "Requests", "Avg Latency (ms)"],
    ...data.trends.map((t) => [t.date, t.cost, t.tokens, t.requests, t.avgLatency]),
  ];
  const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
  trendsSheet["!cols"] = [{ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, trendsSheet, "Trends");

  // Usage Records Sheet
  const recordsData = [
    ["Usage Records"],
    [""],
    ["Timestamp", "Provider", "Model", "Input Tokens", "Output Tokens", "Cached Tokens", "Cost (USD)", "Latency (ms)", "Team", "Project"],
    ...data.records.map((r) => [
      r.timestamp,
      r.provider,
      r.model,
      r.inputTokens,
      r.outputTokens,
      r.cachedTokens,
      r.cost,
      r.latencyMs,
      r.teamName || "-",
      r.projectName || "-",
    ]),
  ];
  const recordsSheet = XLSX.utils.aoa_to_sheet(recordsData);
  recordsSheet["!cols"] = [
    { wch: 20 }, { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, recordsSheet, "Records");

  // Generate and download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadBlob(blob, getFileName("excel"));
}

// ============================================================================
// PDF EXPORT
// ============================================================================

export function exportToPDF(data: ExportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header with branding
  doc.setFillColor(127, 86, 217); // Brand purple
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("TokenTRA", 14, 18);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Cost Analysis Report", 14, 28);

  doc.setFontSize(10);
  doc.text(`Generated: ${data.generatedAt}`, 14, 36);
  doc.text(`Period: ${formatDateRange(data.filters.dateRange)}`, pageWidth - 14, 36, { align: "right" });

  yPos = 50;

  // Summary Section
  doc.setTextColor(16, 24, 40); // Dark gray
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 14, yPos);
  yPos += 10;

  // Summary Cards
  const summaryCards = [
    { label: "Total Spend", value: formatCurrency(data.summary.totalCost), change: data.summary.costChange },
    { label: "Total Tokens", value: formatNumber(data.summary.totalTokens), change: data.summary.tokenChange },
    { label: "Total Requests", value: formatNumber(data.summary.totalRequests), change: data.summary.requestChange },
    { label: "Avg Cost/Request", value: formatCurrency(data.summary.avgCostPerRequest), change: null },
  ];

  const cardWidth = (pageWidth - 28 - 15) / 4;
  summaryCards.forEach((card, i) => {
    const x = 14 + i * (cardWidth + 5);

    // Card background
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(x, yPos, cardWidth, 25, 2, 2, "F");

    // Card content
    doc.setFontSize(8);
    doc.setTextColor(102, 112, 133);
    doc.setFont("helvetica", "normal");
    doc.text(card.label, x + 4, yPos + 8);

    doc.setFontSize(12);
    doc.setTextColor(16, 24, 40);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 4, yPos + 17);

    if (card.change !== null) {
      const changeColor = card.change >= 0 ? [18, 183, 106] : [240, 68, 56];
      doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
      doc.setFontSize(8);
      doc.text(formatPercentage(card.change), x + 4, yPos + 22);
    }
  });

  yPos += 35;

  // Provider Breakdown Table
  doc.setTextColor(16, 24, 40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Cost by Provider", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Provider", "Cost", "Share", "Tokens", "Requests"]],
    body: data.byProvider.slice(0, 6).map((p) => [
      p.value,
      formatCurrency(p.cost),
      `${p.percentage.toFixed(1)}%`,
      formatNumber(p.tokens),
      formatNumber(p.requests),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [127, 86, 217],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30, halign: "right" },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Model Breakdown Table
  doc.setTextColor(16, 24, 40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Cost by Model", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Model", "Cost", "Share", "Tokens", "Requests"]],
    body: data.byModel.slice(0, 8).map((m) => [
      m.value,
      formatCurrency(m.cost),
      `${m.percentage.toFixed(1)}%`,
      formatNumber(m.tokens),
      formatNumber(m.requests),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [127, 86, 217],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30, halign: "right" },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // Check if we need a new page for records
  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  // Recent Usage Records
  doc.setTextColor(16, 24, 40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Recent Usage Records", 14, yPos);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    head: [["Time", "Provider", "Model", "Tokens", "Cost"]],
    body: data.records.slice(0, 15).map((r) => [
      new Date(r.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      r.provider,
      r.model.length > 20 ? r.model.substring(0, 18) + "..." : r.model,
      formatNumber(r.inputTokens + r.outputTokens),
      formatCurrency(r.cost),
    ]),
    theme: "striped",
    headStyles: {
      fillColor: [127, 86, 217],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(102, 112, 133);
    doc.text(
      `Page ${i} of ${pageCount} | TokenTRA - AI Cost Management Platform`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save
  doc.save(getFileName("pdf"));
}

// ============================================================================
// DOWNLOAD HELPERS
// ============================================================================

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function exportCostReport(
  format: ExportFormat,
  data: ExportData
): Promise<void> {
  switch (format) {
    case "csv":
      exportToCSV(data);
      break;
    case "excel":
      exportToExcel(data);
      break;
    case "pdf":
      exportToPDF(data);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
