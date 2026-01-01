import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createBudgetService, type CreateBudgetInput, type BudgetQueryOptions } from "@/lib/budget";

/**
 * GET /api/v1/budgets
 * List all budgets for an organization
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

    const options: BudgetQueryOptions = {
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("page_size") || "20"),
      sortBy: (searchParams.get("sort_by") as BudgetQueryOptions["sortBy"]) || "createdAt",
      sortOrder: (searchParams.get("sort_order") as BudgetQueryOptions["sortOrder"]) || "desc",
      filters: {},
    };

    // Apply filters
    const type = searchParams.get("type");
    if (type) options.filters!.type = type.split(",") as any;

    const status = searchParams.get("status");
    if (status) options.filters!.status = status.split(",") as any;

    const teamId = searchParams.get("team_id");
    if (teamId) options.filters!.teamId = teamId;

    const projectId = searchParams.get("project_id");
    if (projectId) options.filters!.projectId = projectId;

    const exceededOnly = searchParams.get("exceeded_only");
    if (exceededOnly === "true") options.filters!.exceededOnly = true;

    const budgetService = createBudgetService(supabase);
    const result = await budgetService.listBudgets(organizationId, options);

    return NextResponse.json({
      success: true,
      data: result.budgets,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error("[API] Budgets GET error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/budgets
 * Create a new budget
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const { organization_id, ...budgetData } = body;

    if (!organization_id) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    if (!budgetData.name) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    if (!budgetData.amount || budgetData.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!budgetData.type) {
      return NextResponse.json(
        { success: false, error: "type is required" },
        { status: 400 }
      );
    }

    if (!budgetData.period) {
      return NextResponse.json(
        { success: false, error: "period is required" },
        { status: 400 }
      );
    }

    const input: CreateBudgetInput = {
      name: budgetData.name,
      description: budgetData.description,
      type: budgetData.type,
      teamId: budgetData.team_id,
      projectId: budgetData.project_id,
      costCenterId: budgetData.cost_center_id,
      provider: budgetData.provider,
      model: budgetData.model,
      apiKeyId: budgetData.api_key_id,
      userId: budgetData.user_id,
      amount: budgetData.amount,
      currency: budgetData.currency,
      period: budgetData.period,
      periodStart: budgetData.period_start,
      periodEnd: budgetData.period_end,
      mode: budgetData.mode,
      throttlePercentage: budgetData.throttle_percentage,
      rolloverEnabled: budgetData.rollover_enabled,
      rolloverPercentage: budgetData.rollover_percentage,
      rolloverCap: budgetData.rollover_cap,
      thresholds: budgetData.thresholds,
      tags: budgetData.tags,
      metadata: budgetData.metadata,
    };

    const budgetService = createBudgetService(supabase);
    const budget = await budgetService.createBudget(
      organization_id,
      input,
      budgetData.created_by
    );

    return NextResponse.json(
      { success: true, data: budget },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Budgets POST error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
