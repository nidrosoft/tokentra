/**
 * Email System Configuration
 * Resend integration settings and constants
 * 
 * Domain: tokentra.io
 * Email addresses:
 * - alerts@tokentra.io - Alert notifications
 * - team@tokentra.io - Team invites and collaboration
 * - hello@tokentra.io - General communications
 * - billing@tokentra.io - Invoices, payments, subscriptions
 * - security@tokentra.io - Security alerts, password resets
 * - noreply@tokentra.io - Automated system emails
 */

export const EMAIL_CONFIG = {
  from: {
    default: "TokenTra <hello@tokentra.io>",
    alerts: "TokenTra Alerts <alerts@tokentra.io>",
    billing: "TokenTra Billing <billing@tokentra.io>",
    security: "TokenTra Security <security@tokentra.io>",
    team: "TokenTra Team <team@tokentra.io>",
    noreply: "TokenTra <noreply@tokentra.io>",
  },
  replyTo: {
    default: "hello@tokentra.io",
    billing: "billing@tokentra.io",
    team: "team@tokentra.io",
    alerts: "alerts@tokentra.io",
  },
  rateLimits: {
    alerts: { perHour: 10, perDay: 50 },
    digests: { perDay: 2 },
    marketing: { perWeek: 2 },
  },
  domain: "tokentra.io",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.io",
} as const;

export type EmailFromKey = keyof typeof EMAIL_CONFIG.from;
export type EmailCategory = "onboarding" | "alerts" | "billing" | "team" | "security" | "reports" | "system";
