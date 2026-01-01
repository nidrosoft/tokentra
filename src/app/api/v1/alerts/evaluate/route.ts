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

// Demo organization ID for development
const DEMO_ORG_ID = "b1c2d3e4-f5a6-7890-bcde-f12345678901";

/**
 * POST /api/v1/alerts/evaluate
 * Trigger alert evaluation for an organization
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json().catch(() => ({}));

    // Get organization ID
    const orgId = body.orgId || DEMO_ORG_ID;

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
