/**
 * Alert Evaluation API
 * 
 * POST /api/v1/alerts/evaluate - Trigger alert evaluation for an organization
 * 
 * This endpoint is typically called by:
 * - Background jobs (pg_cron)
 * - Manual trigger from admin UI
 * - Webhooks after usage data ingestion
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createAlertEngine } from "@/lib/alerting";
import { getCurrentUserWithOrg } from "@/lib/auth/session";

/**
 * POST /api/v1/alerts/evaluate
 * Trigger alert evaluation for an organization
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json().catch(() => ({}));

    // Get organization ID from authenticated user
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }
    const orgId = user.organizationId;

    // Create alert engine
    const engine = createAlertEngine(supabase);

    // Evaluate all rules for the organization
    const startTime = Date.now();
    await engine.evaluateOrganization(orgId);
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Alert evaluation completed for organization ${orgId}`,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error("[Alert Evaluate API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to evaluate alerts" },
      { status: 500 }
    );
  }
}
