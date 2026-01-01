/**
 * Email Types Registry
 * Defines all email types and their configurations
 */

import type { EmailCategory } from "./config";

export interface EmailType {
  id: string;
  name: string;
  category: EmailCategory;
  description: string;
  defaultEnabled: boolean;
  canDisable: boolean;
  frequency?: "immediate" | "batched" | "scheduled";
}

export const EMAIL_TYPES: Record<string, EmailType> = {
  // ONBOARDING
  welcome: {
    id: "welcome",
    name: "Welcome Email",
    category: "onboarding",
    description: "Sent immediately after signup",
    defaultEnabled: true,
    canDisable: false,
    frequency: "immediate",
  },
  onboarding_reminder: {
    id: "onboarding_reminder",
    name: "Onboarding Reminder",
    category: "onboarding",
    description: "Reminder to complete setup",
    defaultEnabled: true,
    canDisable: true,
    frequency: "scheduled",
  },
  first_data_ready: {
    id: "first_data_ready",
    name: "First Data Ready",
    category: "onboarding",
    description: "Notification when first sync completes",
    defaultEnabled: true,
    canDisable: true,
    frequency: "immediate",
  },

  // ALERTS
  spend_threshold: {
    id: "spend_threshold",
    name: "Spend Threshold Alert",
    category: "alerts",
    description: "Alert when spending exceeds threshold",
    defaultEnabled: true,
    canDisable: true,
    frequency: "immediate",
  },
  budget_warning: {
    id: "budget_warning",
    name: "Budget Warning",
    category: "alerts",
    description: "Warning when approaching budget limit",
    defaultEnabled: true,
    canDisable: true,
    frequency: "immediate",
  },
  budget_exceeded: {
    id: "budget_exceeded",
    name: "Budget Exceeded",
    category: "alerts",
    description: "Alert when budget is exceeded",
    defaultEnabled: true,
    canDisable: true,
    frequency: "immediate",
  },
  anomaly_detected: {
    id: "anomaly_detected",
    name: "Anomaly Detected",
    category: "alerts",
    description: "Alert for unusual spending patterns",
    defaultEnabled: true,
    canDisable: true,
    frequency: "immediate",
  },

  // BILLING
  payment_receipt: {
    id: "payment_receipt",
    name: "Payment Receipt",
    category: "billing",
    description: "Receipt after successful payment",
    defaultEnabled: true,
    canDisable: false,
    frequency: "immediate",
  },
  payment_failed: {
    id: "payment_failed",
    name: "Payment Failed",
    category: "billing",
    description: "Alert when payment fails",
    defaultEnabled: true,
    canDisable: false,
    frequency: "immediate",
  },
  trial_ending: {
    id: "trial_ending",
    name: "Trial Ending Soon",
    category: "billing",
    description: "Reminder that trial is ending",
    defaultEnabled: true,
    canDisable: true,
    frequency: "scheduled",
  },
  subscription_updated: {
    id: "subscription_updated",
    name: "Subscription Updated",
    category: "billing",
    description: "Confirmation of plan change",
    defaultEnabled: true,
    canDisable: false,
    frequency: "immediate",
  },

  // TEAM
  team_invite: {
    id: "team_invite",
    name: "Team Invitation",
    category: "team",
    description: "Invitation to join organization",
    defaultEnabled: true,
    canDisable: false,
    frequency: "immediate",
  },
  team_member_joined: {
    id: "team_member_joined",
    name: "Team Member Joined",
    category: "team",
    description: "Notification when someone joins",
    defaultEnabled: true,
    canDisable: true,
    frequency: "immediate",
  },

  // SECURITY
  password_reset: {
    id: "password_reset",
    name: "Password Reset",
    category: "security",
    description: "Password reset instructions",
    defaultEnabled: true,
    canDisable: false,
    frequency: "immediate",
  },
  password_changed: {
    id: "password_changed",
    name: "Password Changed",
    category: "security",
    description: "Confirmation of password change",
    defaultEnabled: true,
    canDisable: false,
    frequency: "immediate",
  },
  api_key_created: {
    id: "api_key_created",
    name: "API Key Created",
    category: "security",
    description: "Notification when API key is created",
    defaultEnabled: true,
    canDisable: false,
    frequency: "immediate",
  },

  // REPORTS
  weekly_digest: {
    id: "weekly_digest",
    name: "Weekly Digest",
    category: "reports",
    description: "Weekly spending summary",
    defaultEnabled: true,
    canDisable: true,
    frequency: "scheduled",
  },
  monthly_report: {
    id: "monthly_report",
    name: "Monthly Report",
    category: "reports",
    description: "Monthly cost report",
    defaultEnabled: true,
    canDisable: true,
    frequency: "scheduled",
  },
};

export interface EmailPreferences {
  onboarding_emails: boolean;
  alert_emails: boolean;
  billing_emails: boolean;
  team_emails: boolean;
  security_emails: boolean;
  report_emails: boolean;
  weekly_digest: boolean;
  monthly_report: boolean;
  unsubscribed_from_all: boolean;
}

export interface SendEmailOptions {
  type: string;
  to: string;
  data: Record<string, unknown>;
  userId?: string;
  organizationId?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}
