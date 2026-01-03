import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import {
  getDashboardStats,
  getProviderBreakdown,
  getTopConsumers,
  getRecentAlerts,
  getPendingRecommendations,
  getCostTrends,
} from "@/lib/data/dashboard";

/**
 * GET /api/v1/dashboard
 * Get dashboard overview data for the current organization
 */
export async function GET(request: NextRequest) {
  try {
    // Get organization ID from authenticated user
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }
    const organizationId = user.organizationId;

    // Fetch all dashboard data in parallel
    const [stats, providers, consumers, alerts, recommendations, trends] = await Promise.all([
      getDashboardStats(organizationId),
      getProviderBreakdown(organizationId),
      getTopConsumers(organizationId, 5),
      getRecentAlerts(organizationId, 5),
      getPendingRecommendations(organizationId, 5),
      getCostTrends(organizationId, 30),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        providers,
        consumers,
        alerts,
        recommendations,
        trends,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/v1/dashboard:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
