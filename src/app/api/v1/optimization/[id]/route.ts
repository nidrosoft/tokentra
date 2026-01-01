import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import { optimizationService } from "@/services/optimization-service";

/**
 * GET /api/v1/optimization/[id]
 * Get a specific recommendation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recommendation = await optimizationService.getRecommendation(id);

    if (!recommendation) {
      return NextResponse.json(
        { success: false, error: "Recommendation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/optimization/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recommendation" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/optimization/[id]
 * Apply or dismiss a recommendation
 * Body: { action: "apply" | "dismiss" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithOrg();
    let organizationId: string;
    let userId: string | undefined;
    
    if (user?.organizationId) {
      organizationId = user.organizationId;
      userId = user.id;
    } else if (process.env.NODE_ENV === 'development' && process.env.DEMO_ORGANIZATION_ID) {
      organizationId = process.env.DEMO_ORGANIZATION_ID;
      userId = process.env.DEMO_USER_ID;
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["apply", "dismiss"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'apply' or 'dismiss'" },
        { status: 400 }
      );
    }

    let result;
    if (action === "apply") {
      result = await optimizationService.applyRecommendation(id, organizationId, userId);
    } else {
      result = await optimizationService.dismissRecommendation(id, organizationId, userId);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Recommendation ${action === "apply" ? "applied" : "dismissed"} successfully`,
    });
  } catch (error) {
    console.error("Error in POST /api/v1/optimization/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}
