import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createBudgetService, type CreateThresholdInput } from "@/lib/budget";

interface RouteParams {
  params: Promise<{ budgetId: string }>;
}

/**
 * GET /api/v1/budgets/[budgetId]/thresholds
 * Get all thresholds for a budget
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { budgetId } = await params;
    const supabase = createServiceClient();

    const budgetService = createBudgetService(supabase);
    const thresholds = await budgetService.getThresholds(budgetId);

    return NextResponse.json({ success: true, data: thresholds });
  } catch (error) {
    console.error("[API] Thresholds GET error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/budgets/[budgetId]/thresholds
 * Create new thresholds for a budget
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { budgetId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    const thresholds: CreateThresholdInput[] = Array.isArray(body.thresholds)
      ? body.thresholds
      : [body];

    if (thresholds.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one threshold is required" },
        { status: 400 }
      );
    }

    for (const threshold of thresholds) {
      if (!threshold.percentage || threshold.percentage <= 0) {
        return NextResponse.json(
          { success: false, error: "percentage must be greater than 0" },
          { status: 400 }
        );
      }
    }

    const budgetService = createBudgetService(supabase);
    const created = await budgetService.createThresholds(budgetId, thresholds);

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Thresholds POST error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/budgets/[budgetId]/thresholds
 * Delete a threshold by ID (passed in query param)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await params; // Validate params
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const thresholdId = searchParams.get("threshold_id");
    if (!thresholdId) {
      return NextResponse.json(
        { success: false, error: "threshold_id is required" },
        { status: 400 }
      );
    }

    const budgetService = createBudgetService(supabase);
    await budgetService.deleteThreshold(thresholdId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Thresholds DELETE error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
