/**
 * Email System - Main Export
 */

export { EMAIL_CONFIG, type EmailFromKey, type EmailCategory } from "./config";
export { EMAIL_TYPES, type EmailType, type EmailPreferences, type SendEmailOptions, type EmailResult } from "./types";
export { EmailService, getEmailService, sendEmail, queueEmail } from "./email-service";

// Edge Function client for sending emails via Supabase (recommended)
export { sendEmailViaEdgeFunction, EdgeEmail, type EdgeEmailRequest, type EdgeEmailResult } from "./edge-function-client";
