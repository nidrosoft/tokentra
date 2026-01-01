/**
 * Onboarding Status API
 * Returns user's onboarding status and progress
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildChecklist, isOnboardingComplete } from "@/lib/onboarding/checklist";

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
  
  return { user };
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get onboarding profile
    const { data: profile } = await supabase
      .from("onboarding_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    // Get completed events
    const { data: events } = await supabase
      .from("onboarding_events")
      .select("event_name")
      .eq("user_id", session.user.id);

    const completedEvents = events?.map(e => e.event_name) || [];
    const checklist = buildChecklist(completedEvents);
    const isComplete = isOnboardingComplete(completedEvents);

    return NextResponse.json({
      status: profile?.onboarding_status || "not_started",
      step: profile?.onboarding_step,
      isComplete,
      checklist,
      profile: profile || null,
    });
  } catch (error) {
    console.error("Status fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
