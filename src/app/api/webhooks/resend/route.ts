/**
 * Resend Webhook Handler
 * Handles email delivery events from Resend
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verify webhook signature from Resend
 */
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature || !process.env.RESEND_WEBHOOK_SECRET) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RESEND_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("svix-signature");

    // Verify signature in production
    if (process.env.NODE_ENV === "production" && !verifySignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    console.log(`Resend webhook received: ${type}`, data?.email_id);

    // Log the event
    await supabase.from("email_events").insert({
      resend_id: data?.email_id,
      event_type: type,
      event_data: data,
    });

    // Handle specific events
    switch (type) {
      case "email.sent":
        await supabase
          .from("email_logs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("resend_id", data.email_id);
        break;

      case "email.delivered":
        await supabase
          .from("email_logs")
          .update({
            status: "delivered",
            delivered_at: new Date().toISOString(),
          })
          .eq("resend_id", data.email_id);
        break;

      case "email.opened":
        await supabase
          .from("email_logs")
          .update({
            status: "opened",
            opened_at: new Date().toISOString(),
          })
          .eq("resend_id", data.email_id);
        break;

      case "email.clicked":
        await supabase
          .from("email_logs")
          .update({
            clicked_at: new Date().toISOString(),
          })
          .eq("resend_id", data.email_id);
        break;

      case "email.bounced":
        // Mark email as bounced
        await supabase
          .from("email_logs")
          .update({
            status: "bounced",
            bounced_at: new Date().toISOString(),
            error_message: data.bounce?.message || "Email bounced",
          })
          .eq("resend_id", data.email_id);

        // Optionally mark user email as invalid
        if (data.to) {
          const toEmail = Array.isArray(data.to) ? data.to[0] : data.to;
          await supabase.rpc("mark_email_invalid", { email_address: toEmail });
        }
        break;

      case "email.complained":
        // Auto-unsubscribe user who complained
        if (data.to) {
          const toEmail = Array.isArray(data.to) ? data.to[0] : data.to;
          await supabase
            .from("email_preferences")
            .update({
              unsubscribed_from_all: true,
              unsubscribed_at: new Date().toISOString(),
            })
            .eq("email", toEmail);
        }
        break;

      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
