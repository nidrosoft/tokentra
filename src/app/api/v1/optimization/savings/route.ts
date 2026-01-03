import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUserWithOrg } from "@/lib/auth/session";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * GET /api/v1/optimization/savings
 * Get savings history and optimization score for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }
    const organizationId = user.organizationId;
    const supabase = getSupabaseAdmin();

    // Get savings history from optimization_actions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: actions } = await supabase
      .from("optimization_actions")
      .select("actual_savings, applied_at")
      .eq("organization_id", organizationId)
      .gte("applied_at", thirtyDaysAgo.toISOString())
      .order("applied_at", { ascending: true });

    // Group savings by date
    const savingsByDate = new Map<string, { savings: number; applied: number }>();
    
    // Initialize last 30 days with zeros
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      savingsByDate.set(dateStr, { savings: 0, applied: 0 });
    }

    // Aggregate actual savings by date
    (actions || []).forEach((action) => {
      if (action.applied_at) {
        const dateStr = new Date(action.applied_at).toISOString().split("T")[0];
        const existing = savingsByDate.get(dateStr) || { savings: 0, applied: 0 };
        existing.savings += Number(action.actual_savings) || 0;
        existing.applied += 1;
        savingsByDate.set(dateStr, existing);
      }
    });

    // Convert to array format for chart
    const savingsHistory = Array.from(savingsByDate.entries()).map(([date, data]) => ({
      date,
      savings: Math.round(data.savings),
      applied: data.applied,
    }));

    // Calculate optimization score based on various factors
    const { data: recommendations } = await supabase
      .from("recommendations")
      .select("status, type")
      .eq("organization_id", organizationId);

    const recs = recommendations || [];
    const totalRecs = recs.length;
    const appliedRecs = recs.filter((r) => r.status === "applied").length;
    const pendingRecs = recs.filter((r) => r.status === "pending").length;

    // Score breakdown (0-100 for each category)
    const modelEfficiency = totalRecs > 0 
      ? Math.min(100, Math.round((appliedRecs / Math.max(totalRecs, 1)) * 100 + 50))
      : 50;
    
    // Check for caching recommendations
    const cachingRecs = recs.filter((r) => 
      r.type?.includes("caching") || r.type?.includes("cache")
    );
    const cachingApplied = cachingRecs.filter((r) => r.status === "applied").length;
    const cachingUtilization = cachingRecs.length > 0
      ? Math.round((cachingApplied / cachingRecs.length) * 100)
      : 50;

    // Check for prompt optimization
    const promptRecs = recs.filter((r) => 
      r.type?.includes("prompt") || r.type?.includes("compression")
    );
    const promptApplied = promptRecs.filter((r) => r.status === "applied").length;
    const promptOptimization = promptRecs.length > 0
      ? Math.round((promptApplied / promptRecs.length) * 100)
      : 70;

    // Cost allocation score (based on having budgets set up)
    const { count: budgetCount } = await supabase
      .from("budgets")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);
    
    const costAllocation = Math.min(100, (budgetCount || 0) * 20 + 50);

    // Overall score is weighted average
    const overallScore = Math.round(
      modelEfficiency * 0.35 +
      cachingUtilization * 0.25 +
      promptOptimization * 0.20 +
      costAllocation * 0.20
    );

    return NextResponse.json({
      success: true,
      data: {
        savingsHistory,
        optimizationScore: {
          score: overallScore,
          breakdown: {
            modelEfficiency,
            cachingUtilization,
            promptOptimization,
            costAllocation,
          },
        },
        summary: {
          totalApplied: appliedRecs,
          totalPending: pendingRecs,
          totalSavings: savingsHistory.reduce((sum, d) => sum + d.savings, 0),
        },
      },
    });
  } catch (error) {
    console.error("Error in GET /api/v1/optimization/savings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch savings data" },
      { status: 500 }
    );
  }
}
