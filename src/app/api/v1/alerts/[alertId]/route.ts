/**
 * Individual Alert Rule API
 * 
 * GET /api/v1/alerts/[alertId] - Get a specific alert rule
 * PATCH /api/v1/alerts/[alertId] - Update an alert rule
 * DELETE /api/v1/alerts/[alertId] - Delete an alert rule
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { AlertRule, AlertRuleConfig, NotificationChannel } from "@/lib/alerting/types";

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

/**
 * GET /api/v1/alerts/[alertId]
 * Get a specific alert rule
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { alertId } = await params;
    const supabase = createServiceClient();

    const { data: rule, error } = await supabase
      .from("alert_rules")
      .select("*")
      .eq("id", alertId)
      .single();

    if (error || !rule) {
      return NextResponse.json(
        { success: false, error: "Alert rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mapRuleFromDb(rule),
    });
  } catch (error) {
    console.error("[Alerts API] Error fetching rule:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/alerts/[alertId]
 * Update an alert rule
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { alertId } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.enabled !== undefined) updateData.enabled = body.enabled;
    if (body.config !== undefined) updateData.config = body.config;
    if (body.channels !== undefined) updateData.channels = body.channels;
    if (body.cooldownMinutes !== undefined) updateData.cooldown_minutes = body.cooldownMinutes;
    if (body.maxAlertsPerHour !== undefined) updateData.max_alerts_per_hour = body.maxAlertsPerHour;
    if (body.activeHours !== undefined) updateData.active_hours = body.activeHours;
    if (body.activeDays !== undefined) updateData.active_days = body.activeDays;

    const { data: rule, error } = await supabase
      .from("alert_rules")
      .update(updateData)
      .eq("id", alertId)
      .select()
      .single();

    if (error || !rule) {
      return NextResponse.json(
        { success: false, error: "Failed to update alert rule" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mapRuleFromDb(rule),
    });
  } catch (error) {
    console.error("[Alerts API] Error updating rule:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/alerts/[alertId]
 * Delete an alert rule
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { alertId } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("alert_rules")
      .delete()
      .eq("id", alertId);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to delete alert rule" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Alerts API] Error deleting rule:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Map database rule to frontend format
 */
function mapRuleFromDb(dbRule: Record<string, unknown>): AlertRule {
  return {
    id: dbRule.id as string,
    orgId: dbRule.organization_id as string,
    name: dbRule.name as string,
    description: dbRule.description as string | undefined,
    type: dbRule.type as AlertRule["type"],
    enabled: dbRule.enabled as boolean,
    config: dbRule.config as AlertRuleConfig,
    channels: (dbRule.channels as NotificationChannel[]) || [],
    cooldownMinutes: dbRule.cooldown_minutes as number | undefined,
    maxAlertsPerHour: dbRule.max_alerts_per_hour as number | undefined,
    activeHours: dbRule.active_hours as AlertRule["activeHours"],
    activeDays: dbRule.active_days as number[] | undefined,
    createdAt: new Date(dbRule.created_at as string),
    updatedAt: new Date(dbRule.updated_at as string),
    createdBy: dbRule.created_by as string | undefined,
  };
}
