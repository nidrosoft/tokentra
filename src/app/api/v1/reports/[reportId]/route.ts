import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import { reportsService } from "@/services/reports-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    
    const report = await reportsService.getReport(reportId);
    
    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/reports/[reportId]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const user = await getCurrentUserWithOrg();
    
    if (!user?.organizationId && process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reportId } = await params;
    
    await reportsService.deleteReport(reportId);

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/v1/reports/[reportId]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
