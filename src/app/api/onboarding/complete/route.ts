/**
 * Onboarding Complete API
 * Marks onboarding as complete and sends welcome email
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
  
  return { user };
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Update onboarding profile
    await supabase
      .from("onboarding_profiles")
      .update({
        onboarding_status: "completed",
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id);

    // Record completion event
    await supabase
      .from("onboarding_events")
      .upsert({
        user_id: session.user.id,
        event_name: "onboarding_completed",
        event_data: { completed_at: new Date().toISOString() },
      }, {
        onConflict: "user_id,event_name",
      });

    // Send welcome email
    if (session.user.email) {
      await sendEmail({
        type: "welcome",
        to: session.user.email,
        data: {
          name: session.user.user_metadata?.full_name || session.user.email.split("@")[0],
        },
        userId: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding complete error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
