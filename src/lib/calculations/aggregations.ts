import type { CostRecord } from "@/types";

export interface AggregatedCost {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  avgCostPerRequest: number;
}

export function aggregateCosts(records: CostRecord[]): AggregatedCost {
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const totalTokens = records.reduce((sum, r) => sum + r.tokensInput + r.tokensOutput, 0);
  const totalRequests = records.length;
  
  return {
    totalCost,
    totalTokens,
    totalRequests,
    avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
  };
}

export function groupByProvider(records: CostRecord[]): Record<string, CostRecord[]> {
  return records.reduce((acc, record) => {
    const key = record.provider;
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {} as Record<string, CostRecord[]>);
}

export function groupByModel(records: CostRecord[]): Record<string, CostRecord[]> {
  return records.reduce((acc, record) => {
    const key = record.model;
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {} as Record<string, CostRecord[]>);
}

export function groupByDate(records: CostRecord[], granularity: "day" | "week" | "month" = "day"): Record<string, CostRecord[]> {
  return records.reduce((acc, record) => {
    const date = new Date(record.timestamp);
    let key: string;
    
    switch (granularity) {
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      default:
        key = date.toISOString().split("T")[0];
    }
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {} as Record<string, CostRecord[]>);
}
