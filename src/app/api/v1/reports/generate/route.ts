import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import { reportsService, type GenerateReportRequest } from "@/services/reports-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithOrg();
    let organizationId: string;
    let userId: string | undefined;
    
    if (user?.organizationId) {
      organizationId = user.organizationId;
      userId = user.id;
    } else if (process.env.NODE_ENV === "development" && process.env.DEMO_ORGANIZATION_ID) {
      organizationId = process.env.DEMO_ORGANIZATION_ID;
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const reportRequest: GenerateReportRequest = {
      templateId: body.templateId,
      type: body.type || "custom",
      name: body.name,
      dateRange: body.dateRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
      format: body.format || "json",
      filters: body.filters,
    };

    const report = await reportsService.generateReport(organizationId, reportRequest, userId);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error in POST /api/v1/reports/generate:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate report" },
      { status: 500 }
    );
  }
}
