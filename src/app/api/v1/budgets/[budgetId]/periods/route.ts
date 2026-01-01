import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createBudgetService, createCalculationEngine } from "@/lib/budget";

interface RouteParams {
  params: Promise<{ budgetId: string }>;
}

/**
 * GET /api/v1/budgets/[budgetId]/periods
 * Get period history for a budget
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { budgetId } = await params;
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "12");

    const budgetService = createBudgetService(supabase);
    const periods = await budgetService.getPeriodHistory(budgetId, limit);

    return NextResponse.json({ success: true, data: periods });
  } catch (error) {
    console.error("[API] Periods GET error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/budgets/[budgetId]/periods/recalculate
 * Recalculate the current period's spend
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { budgetId } = await params;
    const supabase = createServiceClient();

    const budgetService = createBudgetService(supabase);
    const calculationEngine = createCalculationEngine(supabase);

    // Ensure current period exists
    const period = await budgetService.ensureCurrentPeriod(budgetId);

    // Recalculate spend
    const updatedPeriod = await calculationEngine.updatePeriodSpend(period.id);

    // Calculate forecast
    const forecast = await calculationEngine.calculateForecast(budgetId);

    return NextResponse.json({
      success: true,
      data: {
        period: updatedPeriod,
        forecast,
      },
    });
  } catch (error) {
    console.error("[API] Periods recalculate error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
