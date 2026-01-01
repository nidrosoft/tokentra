import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import { optimizationService } from "@/services/optimization-service";

/**
 * GET /api/v1/optimization
 * Get optimization recommendations for the current organization
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithOrg();
    let organizationId: string;
    
    if (user?.organizationId) {
      organizationId = user.organizationId;
    } else if (process.env.NODE_ENV === 'development' && process.env.DEMO_ORGANIZATION_ID) {
      organizationId = process.env.DEMO_ORGANIZATION_ID;
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const recommendations = await optimizationService.getRecommendations(organizationId, status);
    const summary = await optimizationService.getSummary(organizationId);

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        summary,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/v1/optimization:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
