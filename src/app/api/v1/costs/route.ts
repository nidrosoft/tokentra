import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import {
  getCostAnalysisData,
  exportCostDataToCSV,
  getCostAnomalies,
  type CostAnalysisFilters,
} from "@/lib/data/cost-analysis";

/**
 * GET /api/v1/costs
 * Get comprehensive cost analysis data with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithOrg();
    let organizationId: string;

    if (user?.organizationId) {
      organizationId = user.organizationId;
    } else if (process.env.NODE_ENV === "development" && process.env.DEMO_ORGANIZATION_ID) {
      organizationId = process.env.DEMO_ORGANIZATION_ID;
    } else {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse filters from query params
    const filters: CostAnalysisFilters = {
      dateRange: searchParams.get("dateRange") || "last30d",
      provider: searchParams.get("provider") || "all",
      model: searchParams.get("model") || "all",
      team: searchParams.get("team") || "all",
      project: searchParams.get("project") || "all",
      costCenter: searchParams.get("costCenter") || "all",
      granularity: (searchParams.get("granularity") as CostAnalysisFilters["granularity"]) || "day",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);

    // Check if export is requested
    const exportFormat = searchParams.get("export");
    if (exportFormat === "csv") {
      const csv = await exportCostDataToCSV(organizationId, filters);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="cost-analysis-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Check if anomalies are requested
    const includeAnomalies = searchParams.get("anomalies") === "true";

    // Get cost analysis data
    const data = await getCostAnalysisData(organizationId, filters, page, pageSize);

    // Optionally include anomalies
    let anomalies = null;
    if (includeAnomalies) {
      anomalies = await getCostAnomalies(organizationId, filters);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        anomalies,
        pagination: {
          page,
          pageSize,
          totalRecords: data.totalRecords,
          totalPages: Math.ceil(data.totalRecords / pageSize),
        },
      },
    });
  } catch (error) {
    console.error("Error in GET /api/v1/costs:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: false, error: "Failed to fetch cost data" }, { status: 500 });
  }
}
