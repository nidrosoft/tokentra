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
    // Try to get authenticated user, fall back to demo org in development
    const user = await getCurrentUserWithOrg();
    let organizationId: string;
    
    if (user?.organizationId) {
      organizationId = user.organizationId;
    } else if (process.env.NODE_ENV === 'development' && process.env.DEMO_ORGANIZATION_ID) {
      // Use demo organization in development when not authenticated
      organizationId = process.env.DEMO_ORGANIZATION_ID;
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

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
