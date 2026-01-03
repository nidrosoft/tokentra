/**
 * Alert Events API
 * 
 * GET /api/v1/alerts/events - List triggered alerts (events)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentUserWithOrg } from "@/lib/auth/session";
import type { Alert } from "@/lib/alerting/types";

/**
 * GET /api/v1/alerts/events
 * List triggered alerts (events) for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    // Get organization ID from authenticated user
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }
    const orgId = user.organizationId;
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("triggered_alerts")
      .select("*, alert_rules(name)", { count: "exact" })
      .eq("organization_id", orgId)
      .order("triggered_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (severity) {
      query = query.eq("severity", severity);
    }
    if (type) {
      query = query.eq("type", type);
    }

    const { data: alerts, error, count } = await query;

    if (error) {
      console.error("[Alerts Events API] Error fetching alerts:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch alert events" },
        { status: 500 }
      );
    }

    // Map to frontend format
    const mappedAlerts = (alerts || []).map(mapAlertFromDb);

    // Calculate summary stats
    const activeCount = mappedAlerts.filter((a) => a.status === "active").length;
    const criticalCount = mappedAlerts.filter(
      (a) => a.severity === "critical" && a.status === "active"
    ).length;

    return NextResponse.json({
      success: true,
      data: mappedAlerts,
      total: count || 0,
      summary: {
        active: activeCount,
        critical: criticalCount,
      },
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("[Alerts Events API] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Map database alert to frontend format
 */
function mapAlertFromDb(dbAlert: Record<string, unknown>): Alert {
  const ruleName = (dbAlert.alert_rules as { name?: string } | null)?.name;
  
  return {
    id: dbAlert.id as string,
    orgId: dbAlert.organization_id as string,
    ruleId: dbAlert.rule_id as string,
    type: dbAlert.type as Alert["type"],
    severity: dbAlert.severity as Alert["severity"],
    status: dbAlert.status as Alert["status"],
    title: dbAlert.title as string,
    description: dbAlert.description as string,
    currentValue: dbAlert.current_value as number,
    thresholdValue: dbAlert.threshold_value as number,
    context: {
      ...(dbAlert.context as Record<string, unknown>) || {},
      ruleName,
    },
    triggeredAt: new Date(dbAlert.triggered_at as string),
    acknowledgedAt: dbAlert.acknowledged_at
      ? new Date(dbAlert.acknowledged_at as string)
      : undefined,
    acknowledgedBy: dbAlert.acknowledged_by as string | undefined,
    acknowledgmentNote: dbAlert.acknowledgment_note as string | undefined,
    resolvedAt: dbAlert.resolved_at
      ? new Date(dbAlert.resolved_at as string)
      : undefined,
    resolvedBy: dbAlert.resolved_by as string | undefined,
    resolutionType: dbAlert.resolution_type as Alert["resolutionType"],
    resolutionNote: dbAlert.resolution_note as string | undefined,
    snoozedUntil: dbAlert.snoozed_until
      ? new Date(dbAlert.snoozed_until as string)
      : undefined,
    snoozedBy: dbAlert.snoozed_by as string | undefined,
    notificationsSent: (dbAlert.notifications_sent as Alert["notificationsSent"]) || [],
    createdAt: new Date(dbAlert.created_at as string),
  };
}
