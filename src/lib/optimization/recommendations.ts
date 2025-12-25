import type { Recommendation, RecommendationType } from "@/types";

export function sortRecommendations(
  recommendations: Recommendation[],
  sortBy: "savings" | "confidence" | "date" = "savings"
): Recommendation[] {
  return [...recommendations].sort((a, b) => {
    switch (sortBy) {
      case "savings":
        return b.impact.estimatedMonthlySavings - a.impact.estimatedMonthlySavings;
      case "confidence":
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.impact.confidence] - confidenceOrder[a.impact.confidence];
      case "date":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });
}

export function filterRecommendations(
  recommendations: Recommendation[],
  filters: {
    types?: RecommendationType[];
    minSavings?: number;
    status?: Recommendation["status"][];
  }
): Recommendation[] {
  return recommendations.filter((rec) => {
    if (filters.types && !filters.types.includes(rec.type)) return false;
    if (filters.minSavings && rec.impact.estimatedMonthlySavings < filters.minSavings) return false;
    if (filters.status && !filters.status.includes(rec.status)) return false;
    return true;
  });
}

export function calculateTotalSavings(recommendations: Recommendation[]): number {
  return recommendations
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.impact.estimatedMonthlySavings, 0);
}
