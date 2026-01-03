import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { createBudgetService, type CreateBudgetInput, type BudgetQueryOptions } from "@/lib/budget";
import { validateRequestBody } from "@/lib/api/validate-request";

const createBudgetBodySchema = z.object({
  organization_id: z.string().uuid("Invalid organization ID"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["organization", "team", "project", "cost_center", "provider", "model", "api_key", "user"]),
  team_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  cost_center_id: z.string().uuid().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  api_key_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  period: z.enum(["weekly", "monthly", "quarterly", "annual", "custom"]),
  period_start: z.string().datetime().optional(),
  period_end: z.string().datetime().optional(),
  mode: z.enum(["soft", "hard", "throttle"]).default("soft"),
  throttle_percentage: z.number().min(0).max(100).optional(),
  rollover_enabled: z.boolean().optional(),
  rollover_percentage: z.number().min(0).max(100).optional(),
  rollover_cap: z.number().positive().optional(),
  thresholds: z.array(z.object({
    percentage: z.number().min(0).max(100),
    action: z.enum(["alert", "throttle", "block"]).optional(),
    alertEnabled: z.boolean().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  created_by: z.string().uuid().optional(),
});

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
    
    // Validate request body with Zod
    const validation = await validateRequestBody(request, createBudgetBodySchema);
    if (!validation.success) {
      return validation.response;
    }
    const { organization_id, ...budgetData } = validation.data;

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
