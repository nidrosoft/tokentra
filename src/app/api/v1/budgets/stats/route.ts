import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createBudgetService } from "@/lib/budget";

/**
 * GET /api/v1/budgets/stats
 * Get budget statistics for an organization
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const organizationId = searchParams.get("organization_id");
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    const budgetService = createBudgetService(supabase);
    const stats = await budgetService.getBudgetStats(organizationId);

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("[API] Budget stats error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
