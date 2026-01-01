import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import { usageService } from "@/services/usage-service";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithOrg();
    let organizationId: string;
    
    if (user?.organizationId) {
      organizationId = user.organizationId;
    } else if (process.env.NODE_ENV === "development" && process.env.DEMO_ORGANIZATION_ID) {
      organizationId = process.env.DEMO_ORGANIZATION_ID;
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      startDate: searchParams.get("dateRange") || searchParams.get("startDate") || undefined,
      provider: searchParams.get("provider") || undefined,
      model: searchParams.get("model") || undefined,
      team: searchParams.get("team") || undefined,
      granularity: searchParams.get("granularity") || undefined,
    };

    const [summary, trends, tokenBreakdown, modelDistribution, records] = await Promise.all([
      usageService.getSummary(organizationId, filters),
      usageService.getTrends(organizationId, filters),
      usageService.getTokenBreakdown(organizationId, filters),
      usageService.getModelDistribution(organizationId, filters),
      usageService.getRecords(organizationId, filters),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        trends,
        tokenBreakdown,
        modelDistribution,
        records,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/v1/usage:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
