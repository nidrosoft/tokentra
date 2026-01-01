import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createCalculationEngine, createThresholdChecker } from "@/lib/budget";
import { createPeriodManager } from "@/lib/budget/period-manager";

/**
 * POST /api/v1/budgets/jobs
 * Run budget background jobs (period management, threshold checking, recalculation)
 * 
 * This endpoint should be called by a cron job or scheduler.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const { organization_id, job_type } = body;

    if (!organization_id) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    const validJobTypes = ["all", "periods", "thresholds", "recalculate", "forecast"];
    if (job_type && !validJobTypes.includes(job_type)) {
      return NextResponse.json(
        { success: false, error: `job_type must be one of: ${validJobTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const jobType = job_type || "all";
    const results: Record<string, unknown> = {};

    // Period management
    if (jobType === "all" || jobType === "periods") {
      const periodManager = createPeriodManager(supabase);
      
      // Ensure all budgets have current periods
      const ensured = await periodManager.ensureAllPeriodsExist(organization_id);
      
      // Process expired periods (rollover)
      const rollovers = await periodManager.processExpiredPeriods(organization_id);
      
      results.periods = {
        ensured,
        rollovers: rollovers.length,
        rolloverDetails: rollovers,
      };
    }

    // Recalculate budget spend
    if (jobType === "all" || jobType === "recalculate") {
      const calculationEngine = createCalculationEngine(supabase);
      const recalculated = await calculationEngine.recalculateOrgBudgets(organization_id);
      
      results.recalculate = {
        budgetsUpdated: recalculated,
      };
    }

    // Check thresholds
    if (jobType === "all" || jobType === "thresholds") {
      const thresholdChecker = createThresholdChecker(supabase);
      const thresholdResults = await thresholdChecker.checkAllOrgThresholds(organization_id);
      
      const triggered = thresholdResults.filter((r) => r.triggered);
      
      results.thresholds = {
        checked: thresholdResults.length,
        triggered: triggered.length,
        triggeredDetails: triggered,
      };
    }

    // Calculate forecasts
    if (jobType === "all" || jobType === "forecast") {
      const calculationEngine = createCalculationEngine(supabase);
      
      // Get all active budgets
      const { data: budgets } = await supabase
        .from("budgets")
        .select("id")
        .eq("organization_id", organization_id)
        .eq("status", "active");

      let forecastsUpdated = 0;
      for (const budget of budgets || []) {
        await calculationEngine.calculateForecast(budget.id);
        forecastsUpdated++;
      }

      results.forecast = {
        budgetsUpdated: forecastsUpdated,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        jobType,
        organizationId: organization_id,
        timestamp: new Date().toISOString(),
        results,
      },
    });
  } catch (error) {
    console.error("[API] Budget jobs error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/budgets/jobs
 * Get job status and statistics
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

    const periodManager = createPeriodManager(supabase);
    const periodStats = await periodManager.getPeriodStats(organizationId);

    const thresholdChecker = createThresholdChecker(supabase);
    const alertStatus = await thresholdChecker.getAlertStatus(organizationId);

    const exceededAlerts = alertStatus.filter((a) => a.thresholdStatus === "exceeded");
    const approachingAlerts = alertStatus.filter((a) => a.thresholdStatus === "approaching");

    return NextResponse.json({
      success: true,
      data: {
        periods: periodStats,
        alerts: {
          total: alertStatus.length,
          exceeded: exceededAlerts.length,
          approaching: approachingAlerts.length,
          details: alertStatus.slice(0, 10), // Return top 10
        },
      },
    });
  } catch (error) {
    console.error("[API] Budget jobs status error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
