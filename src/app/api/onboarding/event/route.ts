/**
 * Onboarding Event API
 * Records onboarding events for tracking progress
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { event, data = {} } = await request.json();

    if (!event) {
      return NextResponse.json({ error: "Event name required" }, { status: 400 });
    }

    // Record event
    await supabase
      .from("onboarding_events")
      .upsert({
        user_id: session.user.id,
        event_name: event,
        event_data: data,
      }, {
        onConflict: "user_id,event_name",
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event recording error:", error);
    return NextResponse.json(
      { error: "Failed to record event" },
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
    .from("onboarding_events")
    .select("event_name, event_data, created_at")
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }

  return NextResponse.json({ events: data || [] });
}
