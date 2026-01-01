/**
 * Individual Alert Event API
 * 
 * GET /api/v1/alerts/events/[eventId] - Get a specific alert event
 * PATCH /api/v1/alerts/events/[eventId] - Update alert status (acknowledge, snooze, resolve)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  acknowledgeAlert,
  snoozeAlert,
  resolveAlert,
  getAlertTimeline,
} from "@/lib/alerting/lifecycle";
import type { Alert, SnoozeDuration, ResolutionType } from "@/lib/alerting";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

/**
 * GET /api/v1/alerts/events/[eventId]
 * Get a specific alert event with timeline
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params;
    const supabase = createServiceClient();

    const { data: alert, error } = await supabase
      .from("triggered_alerts")
      .select("*, alert_rules(name, type, config)")
      .eq("id", eventId)
      .single();

    if (error || !alert) {
      return NextResponse.json(
        { success: false, error: "Alert event not found" },
        { status: 404 }
      );
    }

    // Get timeline
    const timeline = await getAlertTimeline(supabase, eventId);

    return NextResponse.json({
      success: true,
      data: {
        ...mapAlertFromDb(alert),
        timeline,
      },
    });
  } catch (error) {
    console.error("[Alert Event API] Error fetching alert:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/alerts/events/[eventId]
 * Update alert status (acknowledge, snooze, resolve)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    const { action, userId, note, duration, customMinutes, resolution } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing required field: action" },
        { status: 400 }
      );
    }

    // Default user ID for demo (must be a valid UUID)
    const DEMO_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const user = userId || DEMO_USER_ID;

    let updatedAlert: Alert;

    switch (action) {
      case "acknowledge":
        updatedAlert = await acknowledgeAlert(supabase, eventId, user, note);
        break;

      case "snooze":
        if (!duration) {
          return NextResponse.json(
            { success: false, error: "Missing required field: duration for snooze" },
            { status: 400 }
          );
        }
        updatedAlert = await snoozeAlert(
          supabase,
          eventId,
          user,
          duration as SnoozeDuration,
          customMinutes
        );
        break;

      case "resolve":
        if (!resolution) {
          return NextResponse.json(
            { success: false, error: "Missing required field: resolution for resolve" },
            { status: 400 }
          );
        }
        updatedAlert = await resolveAlert(
          supabase,
          eventId,
          user,
          resolution as ResolutionType,
          note
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert,
    });
  } catch (error) {
    console.error("[Alert Event API] Error updating alert:", error);
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
  const rule = dbAlert.alert_rules as { name?: string; type?: string; config?: unknown } | null;

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
      ...((dbAlert.context as Record<string, unknown>) || {}),
      ruleName: rule?.name,
      ruleConfig: rule?.config,
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
