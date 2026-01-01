import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHealthMonitor } from "@/lib/provider-sync";

interface RouteParams {
  params: Promise<{ providerId: string }>;
}

/**
 * GET /api/v1/providers/[providerId]/health
 * Get health status for a provider connection
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { providerId } = await params;
    const supabase = await createClient();

    const healthMonitor = createHealthMonitor(supabase);
    const health = await healthMonitor.getConnectionHealth(providerId);

    if (!health) {
      return NextResponse.json(
        { success: false, error: "Provider connection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error("[API] Provider health error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
