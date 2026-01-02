/**
 * Email Service
 * Core service for sending transactional emails via Resend
 */

import { Resend } from "resend";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { EMAIL_CONFIG, type EmailCategory } from "./config";
import { EMAIL_TYPES, type EmailType, type EmailPreferences, type SendEmailOptions, type EmailResult } from "./types";

// Lazy-load to avoid build-time errors when env vars are not available
let _resend: Resend | null = null;
let _supabase: SupabaseClient | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "");
  }
  return _resend;
}

function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// Subject line generators
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

export class EmailService {
  /**
   * Send an email
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    const { type, to, data, userId, organizationId } = options;

    try {
      const emailType = EMAIL_TYPES[type];
      if (!emailType) {
        throw new Error(`Unknown email type: ${type}`);
      }

      // Check user preferences
      if (userId) {
        const preferences = await this.getPreferences(userId);
        if (preferences && !this.shouldSend(emailType, preferences)) {
          return { success: true, id: "skipped-preference" };
        }
      }

      // Check rate limits
      const rateLimitOk = await this.checkRateLimit(to, emailType.category);
      if (!rateLimitOk) {
        return { success: false, error: "rate_limited" };
      }

      // Add unsubscribe URL if email can be disabled
      const emailData = { ...data };
      if (emailType.canDisable && userId) {
        emailData.unsubscribeUrl = this.generateUnsubscribeUrl(userId, to, emailType.category);
      }
      emailData.appUrl = EMAIL_CONFIG.appUrl;

      // Get sender and subject
      const from = this.getSender(emailType.category);
      const subject = this.getSubject(type, emailData);

      // Send via Resend
      const { data: sendResult, error } = await getResend().emails.send({
        from,
        to,
        subject,
        html: await this.renderTemplate(type, emailData),
        headers: {
          "X-Email-Type": type,
          "X-Email-Category": emailType.category,
        },
      });

      if (error) throw error;

      // Log the email
      await this.logEmail({
        userId,
        organizationId,
        email: to,
        emailType: type,
        subject,
        from,
        resendId: sendResult?.id,
        status: "sent",
        templateData: emailData,
      });

      return { success: true, id: sendResult?.id };
    } catch (error) {
      console.error(`Failed to send ${type} email to ${to}:`, error);

      await this.logEmail({
        userId,
        organizationId,
        email: to,
        emailType: type,
        subject: this.getSubject(type, data),
        from: this.getSender(EMAIL_TYPES[type]?.category || "system"),
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        templateData: data,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Queue email for later sending
   */
  async queue(
    type: string,
    to: string,
    data: Record<string, unknown>,
    sendAt: Date,
    userId?: string,
    organizationId?: string
  ): Promise<EmailResult> {
    const { error } = await getSupabaseClient().from("scheduled_emails").insert({
      user_id: userId,
      organization_id: organizationId,
      email: to,
      email_type: type,
      template_data: data,
      scheduled_for: sendAt.toISOString(),
      status: "pending",
    });

    if (error) {
      console.error("Failed to queue email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Get user email preferences
   */
  private async getPreferences(userId: string): Promise<EmailPreferences | null> {
    const { data } = await getSupabaseClient()
      .from("email_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data;
  }

  /**
   * Check if email should be sent based on preferences
   */
  private shouldSend(emailType: EmailType, preferences: EmailPreferences): boolean {
    if (!emailType.canDisable) return true;
    if (preferences.unsubscribed_from_all) return false;

    const categoryMap: Record<EmailCategory, keyof EmailPreferences> = {
      onboarding: "onboarding_emails",
      alerts: "alert_emails",
      billing: "billing_emails",
      team: "team_emails",
      security: "security_emails",
      reports: "report_emails",
      system: "onboarding_emails", // System emails always sent
    };

    const prefKey = categoryMap[emailType.category];
    return prefKey ? preferences[prefKey] !== false : true;
  }

  /**
   * Check rate limits for email category
   */
  private async checkRateLimit(email: string, category: EmailCategory): Promise<boolean> {
    const limits = EMAIL_CONFIG.rateLimits[category as keyof typeof EMAIL_CONFIG.rateLimits];
    if (!limits) return true;

    if ("perHour" in limits) {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { count } = await getSupabaseClient()
        .from("email_logs")
        .select("*", { count: "exact", head: true })
        .eq("email", email)
        .gte("created_at", hourAgo.toISOString());

      if ((count || 0) >= limits.perHour) return false;
    }

    return true;
  }

  /**
   * Generate unsubscribe URL with signed token
   */
  private generateUnsubscribeUrl(userId: string, email: string, category: string): string {
    const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET || "tokentra-email-secret";
    const token = jwt.sign({ userId, email, category }, secret, { expiresIn: "30d" });
    return `${EMAIL_CONFIG.appUrl}/api/email/unsubscribe?token=${token}`;
  }

  /**
   * Get sender address for category
   */
  private getSender(category: EmailCategory): string {
    const senderMap: Record<EmailCategory, keyof typeof EMAIL_CONFIG.from> = {
      onboarding: "default",
      alerts: "alerts",
      billing: "billing",
      team: "team",
      security: "security",
      reports: "default",
      system: "noreply",
    };
    return EMAIL_CONFIG.from[senderMap[category] || "default"];
  }

  /**
   * Get subject line for email type
   */
  private getSubject(type: string, data: Record<string, unknown>): string {
    const subject = SUBJECTS[type];
    if (!subject) return "TokenTra Notification";
    return typeof subject === "function" ? subject(data) : subject;
  }

  /**
   * Render email template to HTML
   */
  private async renderTemplate(type: string, data: Record<string, unknown>): Promise<string> {
    // Dynamic import of template
    try {
      const { render } = await import("./templates");
      return render(type, data);
    } catch {
      // Fallback to simple HTML if template not found
      return this.renderFallbackTemplate(type, data);
    }
  }

  /**
   * Fallback template for when React Email templates aren't available
   */
  private renderFallbackTemplate(type: string, data: Record<string, unknown>): string {
    const subject = this.getSubject(type, data);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0f172a;">${subject}</h1>
            <p style="color: #334155;">This is a notification from TokenTra.</p>
            <p style="color: #64748b; font-size: 12px; margin-top: 40px;">
              TokenTra - AI Cost Intelligence Platform
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Log email to database
   */
  private async logEmail(log: {
    userId?: string;
    organizationId?: string;
    email: string;
    emailType: string;
    subject: string;
    from: string;
    resendId?: string;
    status: string;
    errorMessage?: string;
    templateData: Record<string, unknown>;
  }): Promise<void> {
    await getSupabaseClient().from("email_logs").insert({
      user_id: log.userId,
      organization_id: log.organizationId,
      email: log.email,
      email_type: log.emailType,
      subject: log.subject,
      from_address: log.from,
      resend_id: log.resendId,
      status: log.status,
      error_message: log.errorMessage,
      template_data: log.templateData,
      sent_at: log.status === "sent" ? new Date().toISOString() : null,
    });
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

// Convenience functions
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  return getEmailService().send(options);
}

export async function queueEmail(
  type: string,
  to: string,
  data: Record<string, unknown>,
  sendAt?: Date,
  userId?: string,
  organizationId?: string
): Promise<EmailResult> {
  if (sendAt) {
    return getEmailService().queue(type, to, data, sendAt, userId, organizationId);
  }
  return getEmailService().send({ type, to, data, userId, organizationId });
}
