import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import { usageService } from "@/services/usage-service";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithOrg();
    let organizationId: string;
    
    if (user?.organizationId) {
      organizationId = user.organizationId;
    } else if (process.env.NODE_ENV === "development" && process.env.DEMO_ORGANIZATION_ID) {
      organizationId = process.env.DEMO_ORGANIZATION_ID;
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      startDate: searchParams.get("dateRange") || undefined,
      provider: searchParams.get("provider") || undefined,
    };

    const modelDistribution = await usageService.getModelDistribution(organizationId, filters);

    return NextResponse.json({
      success: true,
      data: modelDistribution,
    });
  } catch (error) {
    console.error("Error in GET /api/v1/usage/models:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch model data" },
      { status: 500 }
    );
  }
}
