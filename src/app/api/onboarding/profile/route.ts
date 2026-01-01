/**
 * Onboarding Profile API
 * Saves and retrieves user onboarding profile
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { computeUserSegment, getRecommendedPath, getNextStepUrl } from "@/lib/onboarding/segmentation";
import { sendEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSession(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") || request.cookies.get("sb-access-token")?.value;
  
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  
  // Get user's organization
  const { data: membership } = await supabase
    .from("team_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();
  
  return {
    user: {
      id: user.id,
      email: user.email,
      org_id: membership?.organization_id,
    },
  };
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Compute segment and recommended path
    const segment = computeUserSegment(data);
    const recommendedPath = getRecommendedPath(segment, data.monthlyAiSpend);

    // Upsert profile
    const { error } = await supabase
      .from("onboarding_profiles")
      .upsert({
        user_id: session.user.id,
        organization_id: session.user.org_id,
        onboarding_status: "in_progress",
        onboarding_step: "company_profile",
        user_role: data.userRole,
        company_name: data.companyName,
        company_size: data.companySize,
        monthly_ai_spend: data.monthlyAiSpend,
        goals: data.goals || [],
        user_segment: segment,
        recommended_path: recommendedPath,
        profile_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (error) throw error;

    // Update organization name if provided
    if (data.companyName && session.user.org_id) {
      await supabase
        .from("organizations")
        .update({ name: data.companyName })
        .eq("id", session.user.org_id);
    }

    // Record onboarding event
    await supabase
      .from("onboarding_events")
      .upsert({
        user_id: session.user.id,
        event_name: "profile_completed",
        event_data: { segment, recommendedPath },
      }, {
        onConflict: "user_id,event_name",
      });

    // Get next step URL
    const nextStep = getNextStepUrl("company_profile", recommendedPath);

    return NextResponse.json({
      success: true,
      segment,
      recommendedPath,
      nextStep,
    });
  } catch (error) {
    console.error("Profile save error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("onboarding_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }

  return NextResponse.json({ profile: data || null });
}
