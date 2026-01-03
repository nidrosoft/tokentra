/**
 * Alert Rules API
 * 
 * GET /api/v1/alerts - List all alert rules for the organization
 * POST /api/v1/alerts - Create a new alert rule
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentUserWithOrg } from "@/lib/auth/session";
import { validateRequestBody } from "@/lib/api/validate-request";
import type { AlertRule, AlertRuleConfig, NotificationChannel } from "@/lib/alerting/types";

const createAlertBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["spend_threshold", "spend_anomaly", "budget_threshold", "forecast_exceeded", "provider_error", "usage_spike"]),
  description: z.string().optional(),
  config: z.object({
    metric: z.string().optional(),
    operator: z.enum(["gt", "gte", "lt", "lte", "eq"]).optional(),
    threshold: z.number().optional(),
    value: z.number().optional(),
    timeWindow: z.string().optional(),
  }),
  condition: z.object({
    metric: z.string(),
    operator: z.enum(["gt", "gte", "lt", "lte", "eq"]),
    value: z.number(),
    timeWindow: z.string().optional(),
  }).optional(),
  channels: z.array(z.object({
    type: z.enum(["email", "slack", "pagerduty", "webhook"]),
    config: z.record(z.string()).optional(),
  })).optional(),
  enabled: z.boolean().optional().default(true),
  cooldownMinutes: z.number().int().positive().optional(),
  maxAlertsPerHour: z.number().int().positive().optional(),
  activeHours: z.object({ start: z.number(), end: z.number() }).optional(),
  activeDays: z.array(z.number().int().min(0).max(6)).optional(),
  createdBy: z.string().optional(),
});

/**
 * GET /api/v1/alerts
 * List all alert rules for the organization
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
    const enabled = searchParams.get("enabled");
    const type = searchParams.get("type");

    // Build query
    let query = supabase
      .from("alert_rules")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (enabled !== null) {
      query = query.eq("enabled", enabled === "true");
    }
    if (type) {
      query = query.eq("type", type);
    }

    const { data: rules, error } = await query;

    if (error) {
      console.error("[Alerts API] Error fetching rules:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch alert rules" },
        { status: 500 }
      );
    }

    // Map to frontend format
    const mappedRules = (rules || []).map(mapRuleFromDb);

    return NextResponse.json({
      success: true,
      data: mappedRules,
      total: mappedRules.length,
    });
  } catch (error) {
    console.error("[Alerts API] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/alerts
 * Create a new alert rule
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Validate request body with Zod
    const validation = await validateRequestBody(request, createAlertBodySchema);
    if (!validation.success) {
      return validation.response;
    }
    const body = validation.data;

    // Get organization ID from authenticated user
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }
    const orgId = user.organizationId;

    // Build condition from config for legacy compatibility
    const condition = body.condition || {
      metric: body.config?.metric || "daily_cost",
      operator: body.config?.operator || "gt",
      value: body.config?.threshold ?? body.config?.value ?? 0,
      timeWindow: body.config?.timeWindow,
    };

    // Prepare rule data
    const ruleData = {
      organization_id: orgId,
      name: body.name,
      description: body.description || null,
      type: body.type,
      enabled: body.enabled ?? true,
      condition: condition,
      config: body.config,
      channels: body.channels || [],
      cooldown_minutes: body.cooldownMinutes || 60,
      max_alerts_per_hour: body.maxAlertsPerHour || 10,
      active_hours: body.activeHours || null,
      active_days: body.activeDays || null,
      created_by: body.createdBy || null,
    };

    // Insert rule
    const { data: rule, error } = await supabase
      .from("alert_rules")
      .insert(ruleData)
      .select()
      .single();

    if (error) {
      console.error("[Alerts API] Error creating rule:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create alert rule" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: mapRuleFromDb(rule),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Alerts API] Unexpected error:", error);
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
