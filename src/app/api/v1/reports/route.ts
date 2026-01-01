import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import { reportsService } from "@/services/reports-service";

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
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const [reports, summary] = await Promise.all([
      reportsService.getReports(organizationId, limit),
      reportsService.getSummary(organizationId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reports,
        summary,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/v1/reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
