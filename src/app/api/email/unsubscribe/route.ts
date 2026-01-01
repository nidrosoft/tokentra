/**
 * Email Unsubscribe API
 * Handles unsubscribe requests from email links
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import type { EmailCategory } from "@/lib/email/config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UnsubscribeToken {
  userId: string;
  email: string;
  category: string;
}

const CATEGORY_TO_PREFERENCE: Record<EmailCategory, string> = {
  onboarding: "onboarding_emails",
  alerts: "alert_emails",
  billing: "billing_emails",
  team: "team_emails",
  security: "security_emails",
  reports: "report_emails",
  system: "onboarding_emails",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const all = searchParams.get("all") === "true";

  if (!token) {
    return NextResponse.redirect(new URL("/unsubscribe?error=missing_token", request.url));
  }

  try {
    const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET || "tokentra-email-secret";
    const decoded = jwt.verify(token, secret) as UnsubscribeToken;

    if (all) {
      // Unsubscribe from all emails
      await supabase
        .from("email_preferences")
        .upsert({
          user_id: decoded.userId,
          email: decoded.email,
          unsubscribed_from_all: true,
          unsubscribed_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });
    } else {
      // Unsubscribe from specific category
      const prefKey = CATEGORY_TO_PREFERENCE[decoded.category as EmailCategory];
      if (prefKey) {
        await supabase
          .from("email_preferences")
          .upsert({
            user_id: decoded.userId,
            email: decoded.email,
            [prefKey]: false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id",
          });
      }
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/unsubscribe?success=true&category=${decoded.category}`, request.url)
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.redirect(
      new URL("/unsubscribe?error=invalid_token", request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, category, all } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET || "tokentra-email-secret";
    const decoded = jwt.verify(token, secret) as UnsubscribeToken;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (all) {
      updateData.unsubscribed_from_all = true;
      updateData.unsubscribed_at = new Date().toISOString();
    } else if (category) {
      const prefKey = CATEGORY_TO_PREFERENCE[category as EmailCategory];
      if (prefKey) {
        updateData[prefKey] = false;
      }
    }

    await supabase
      .from("email_preferences")
      .upsert({
        user_id: decoded.userId,
        email: decoded.email,
        ...updateData,
      }, {
        onConflict: "user_id",
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
