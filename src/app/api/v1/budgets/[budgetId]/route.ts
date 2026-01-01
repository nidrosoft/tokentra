import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createBudgetService, type UpdateBudgetInput } from "@/lib/budget";

interface RouteParams {
  params: Promise<{ budgetId: string }>;
}

/**
 * GET /api/v1/budgets/[budgetId]
 * Get a specific budget with its thresholds and current period
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { budgetId } = await params;
    const supabase = createServiceClient();

    const budgetService = createBudgetService(supabase);
    const budget = await budgetService.getBudget(budgetId);

    if (!budget) {
      return NextResponse.json(
        { success: false, error: "Budget not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error("[API] Budget GET error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/budgets/[budgetId]
 * Update a budget
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { budgetId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    const input: UpdateBudgetInput = {};

    if (body.name !== undefined) input.name = body.name;
    if (body.description !== undefined) input.description = body.description;
    if (body.amount !== undefined) input.amount = body.amount;
    if (body.mode !== undefined) input.mode = body.mode;
    if (body.throttle_percentage !== undefined) input.throttlePercentage = body.throttle_percentage;
    if (body.rollover_enabled !== undefined) input.rolloverEnabled = body.rollover_enabled;
    if (body.rollover_percentage !== undefined) input.rolloverPercentage = body.rollover_percentage;
    if (body.rollover_cap !== undefined) input.rolloverCap = body.rollover_cap;
    if (body.status !== undefined) input.status = body.status;
    if (body.tags !== undefined) input.tags = body.tags;
    if (body.metadata !== undefined) input.metadata = body.metadata;

    const budgetService = createBudgetService(supabase);
    const budget = await budgetService.updateBudget(budgetId, input);

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error("[API] Budget PATCH error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/budgets/[budgetId]
 * Delete a budget (or archive it)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { budgetId } = await params;
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const budgetService = createBudgetService(supabase);

    // Check if we should archive instead of delete
    const archive = searchParams.get("archive") === "true";

    if (archive) {
      await budgetService.archiveBudget(budgetId);
    } else {
      await budgetService.deleteBudget(budgetId);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[API] Budget DELETE error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
