import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createAllocationService, type CreateAdjustmentInput } from "@/lib/budget";

interface RouteParams {
  params: Promise<{ budgetId: string }>;
}

/**
 * GET /api/v1/budgets/[budgetId]/adjustments
 * Get adjustment history for a budget
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { budgetId } = await params;
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "50");

    const allocationService = createAllocationService(supabase);
    const adjustments = await allocationService.getAdjustments(budgetId, limit);

    return NextResponse.json({ success: true, data: adjustments });
  } catch (error) {
    console.error("[API] Adjustments GET error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/budgets/[budgetId]/adjustments
 * Create a budget adjustment
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { budgetId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    if (!body.adjustment_type) {
      return NextResponse.json(
        { success: false, error: "adjustment_type is required" },
        { status: 400 }
      );
    }

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!body.reason) {
      return NextResponse.json(
        { success: false, error: "reason is required" },
        { status: 400 }
      );
    }

    if (!body.user_id) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const input: CreateAdjustmentInput = {
      adjustmentType: body.adjustment_type,
      amount: body.amount,
      reason: body.reason,
      relatedBudgetId: body.related_budget_id,
    };

    const allocationService = createAllocationService(supabase);
    const adjustment = await allocationService.createAdjustment(
      budgetId,
      input,
      body.user_id
    );

    return NextResponse.json(
      { success: true, data: adjustment },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Adjustments POST error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
