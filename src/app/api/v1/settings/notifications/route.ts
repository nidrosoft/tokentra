import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEMO_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Default notification preferences
const DEFAULT_PREFERENCES = {
  budgetAlerts: true,
  costSpikes: true,
  weeklySummary: false,
  monthlyReport: true,
  teamActivity: false,
  optimizationTips: true,
  securityAlerts: true,
  billingAlerts: true,
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || DEMO_USER_ID;

    const { data, error } = await supabase
      .from("email_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching notification preferences:", error);
      // Return defaults if table doesn't exist
      if (error.code === "42P01") {
        return NextResponse.json(DEFAULT_PREFERENCES);
      }
    }

    if (!data) {
      return NextResponse.json(DEFAULT_PREFERENCES);
    }

    return NextResponse.json({
      budgetAlerts: data.alert_emails !== false,
      costSpikes: data.alert_emails !== false,
      weeklySummary: data.report_emails === true,
      monthlyReport: data.report_emails !== false,
      teamActivity: data.team_emails === true,
      optimizationTips: data.alert_emails !== false,
      securityAlerts: data.security_emails !== false,
      billingAlerts: data.billing_emails !== false,
    });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(DEFAULT_PREFERENCES);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const userId = body.userId || DEMO_USER_ID;

    // Map frontend preferences to database columns
    const dbUpdates: Record<string, boolean> = {};
    
    if (body.budgetAlerts !== undefined || body.costSpikes !== undefined || body.optimizationTips !== undefined) {
      dbUpdates.alert_emails = body.budgetAlerts ?? body.costSpikes ?? body.optimizationTips ?? true;
    }
    if (body.weeklySummary !== undefined || body.monthlyReport !== undefined) {
      dbUpdates.report_emails = body.monthlyReport ?? body.weeklySummary ?? true;
    }
    if (body.teamActivity !== undefined) {
      dbUpdates.team_emails = body.teamActivity;
    }
    if (body.securityAlerts !== undefined) {
      dbUpdates.security_emails = body.securityAlerts;
    }
    if (body.billingAlerts !== undefined) {
      dbUpdates.billing_emails = body.billingAlerts;
    }

    const { error } = await supabase
      .from("email_preferences")
      .upsert(
        {
          user_id: userId,
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Error updating notification preferences:", error);
      // If table doesn't exist, just return success
      if (error.code === "42P01") {
        return NextResponse.json({ success: true });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    const message = error instanceof Error ? error.message : "Failed to update preferences";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
