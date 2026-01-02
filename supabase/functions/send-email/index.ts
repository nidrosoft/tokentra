import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: string;
  to: string;
  data: Record<string, unknown>;
  userId?: string;
  organizationId?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const SUBJECTS: Record<string, string | ((d: Record<string, unknown>) => string)> = {
  welcome: "Welcome to TokenTra! 👋",
  onboarding_reminder: "Let's finish setting up your TokenTra account",
  first_data_ready: "🎉 Your AI cost data is ready!",
  spend_threshold: (d) => `⚠️ AI Spend Alert: ${d.currentSpend} (${d.percentOfThreshold}% of limit)`,
  budget_warning: (d) => `⚠️ Budget Warning: ${d.budgetName} at ${d.percentUsed}%`,
  budget_exceeded: (d) => `🚨 Budget Exceeded: ${d.budgetName}`,
  anomaly_detected: (d) => `🚨 Anomaly Detected: ${d.description}`,
  payment_receipt: (d) => `Receipt for your ${d.amount} payment`,
  payment_failed: "Action Required: Payment Failed",
  trial_ending: (d) => `Your trial ends in ${d.daysRemaining} days`,
  subscription_updated: "Your subscription has been updated",
  team_invite: (d) => `${d.inviterName} invited you to join ${d.organizationName}`,
  team_member_joined: (d) => `${d.memberName} joined your team`,
  password_reset: "Reset your TokenTra password",
  password_changed: "Your password has been changed",
  api_key_created: "New API key created",
  weekly_digest: (d) => `Weekly AI Cost Report: ${d.totalSpend}`,
  monthly_report: (d) => `Monthly Report: ${d.month} Summary`,
};

const EMAIL_CONFIG = {
  domain: "tokentra.io",
  appUrl: "https://app.tokentra.io",
  from: {
    default: "TokenTra <hello@tokentra.io>",
    alerts: "TokenTra Alerts <alerts@tokentra.io>",
    team: "TokenTra Team <team@tokentra.io>",
    billing: "TokenTra Billing <billing@tokentra.io>",
    security: "TokenTra Security <security@tokentra.io>",
    noreply: "TokenTra <noreply@tokentra.io>",
  },
};

function getSubject(type: string, data: Record<string, unknown>): string {
  const subjectTemplate = SUBJECTS[type];
  if (!subjectTemplate) return `TokenTra Notification`;
  if (typeof subjectTemplate === "function") {
    return subjectTemplate(data);
  }
  return subjectTemplate;
}

function getSender(category: string): string {
  const senderMap: Record<string, keyof typeof EMAIL_CONFIG.from> = {
    onboarding: "team",
    alert: "alerts",
    billing: "billing",
    security: "security",
    team: "team",
    report: "noreply",
  };
  const key = senderMap[category] || "default";
  return EMAIL_CONFIG.from[key];
}

function generateEmailHTML(type: string, data: Record<string, unknown>): string {
  const appUrl = EMAIL_CONFIG.appUrl;
  
  // Base template
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getSubject(type, data)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
    .content { margin-bottom: 24px; }
    .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 24px; }
    .alert-critical { border-left: 4px solid #ef4444; padding-left: 16px; }
    .alert-warning { border-left: 4px solid #f59e0b; padding-left: 16px; }
    .metric { font-size: 32px; font-weight: bold; color: #6366f1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">TokenTra</div>
      </div>
      <div class="content">
        ${generateEmailContent(type, data)}
      </div>
      <div style="text-align: center;">
        <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TokenTra. All rights reserved.</p>
      <p>You're receiving this because you have a TokenTra account.</p>
    </div>
  </div>
</body>
</html>`;
}

function generateEmailContent(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case "welcome":
      return `
        <h2>Welcome to TokenTra! 👋</h2>
        <p>Hi ${data.userName || "there"},</p>
        <p>Thanks for joining TokenTra! We're excited to help you track and optimize your AI costs.</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Connect your first AI provider</li>
          <li>Set up cost alerts</li>
          <li>Create budgets for your teams</li>
        </ul>
      `;
    case "spend_threshold":
      return `
        <div class="alert-warning">
          <h2>⚠️ Spend Alert</h2>
          <p>Your AI spending has reached <strong>${data.percentOfThreshold}%</strong> of your threshold.</p>
          <p class="metric">${data.currentSpend}</p>
          <p>Threshold: ${data.threshold}</p>
        </div>
      `;
    case "budget_exceeded":
      return `
        <div class="alert-critical">
          <h2>🚨 Budget Exceeded</h2>
          <p>The budget <strong>${data.budgetName}</strong> has exceeded its limit.</p>
          <p class="metric">${data.currentSpend} / ${data.budgetAmount}</p>
        </div>
      `;
    case "team_invite":
      return `
        <h2>You've been invited!</h2>
        <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> on TokenTra.</p>
        <p>Click the button below to accept the invitation:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
        </div>
      `;
    case "password_reset":
      return `
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.resetUrl}" class="button">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      `;
    default:
      return `
        <h2>${getSubject(type, data)}</h2>
        <p>${data.message || "You have a new notification from TokenTra."}</p>
      `;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, to, data, userId, organizationId }: EmailRequest = await req.json();

    if (!type || !to) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: type, to" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine email category from type
    const categoryMap: Record<string, string> = {
      welcome: "onboarding",
      onboarding_reminder: "onboarding",
      first_data_ready: "onboarding",
      spend_threshold: "alert",
      budget_warning: "alert",
      budget_exceeded: "alert",
      anomaly_detected: "alert",
      payment_receipt: "billing",
      payment_failed: "billing",
      trial_ending: "billing",
      subscription_updated: "billing",
      team_invite: "team",
      team_member_joined: "team",
      password_reset: "security",
      password_changed: "security",
      api_key_created: "security",
      weekly_digest: "report",
      monthly_report: "report",
    };

    const category = categoryMap[type] || "default";
    const from = getSender(category);
    const subject = getSubject(type, data || {});
    const html = generateEmailHTML(type, data || {});

    // Send via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendResult);
      return new Response(
        JSON.stringify({ success: false, error: resendResult.message || "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("email_logs").insert({
        user_id: userId,
        organization_id: organizationId,
        email: to,
        email_type: type,
        subject,
        from_address: from,
        resend_id: resendResult.id,
        status: "sent",
        template_data: data,
      });
    }

    const result: EmailResult = {
      success: true,
      messageId: resendResult.id,
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Email function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
