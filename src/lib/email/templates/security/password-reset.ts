/**
 * Password Reset Email Template
 * Sent when user requests a password reset
 */

import { renderBaseTemplate, emailStyles } from "../base";

interface PasswordResetData {
  name?: string;
  resetUrl?: string;
  expiresIn?: string;
  ipAddress?: string;
  userAgent?: string;
  appUrl?: string;
}

export function renderPasswordResetEmail(data: Record<string, unknown>): string {
  const {
    name = "there",
    resetUrl,
    expiresIn = "1 hour",
    ipAddress,
    appUrl = "https://app.tokentra.com",
  } = data as PasswordResetData;

  const firstName = typeof name === "string" ? name.split(" ")[0] : "there";

  const content = `
    <h1 style="${emailStyles.heading}">
      Reset your password
    </h1>
    
    <p style="${emailStyles.paragraph}">
      Hi ${firstName},
    </p>
    
    <p style="${emailStyles.paragraph}">
      We received a request to reset your TokenTra password. Click the button below 
      to create a new password:
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl || appUrl}" style="${emailStyles.button}">
        Reset Password →
      </a>
    </div>
    
    <p style="${emailStyles.muted}; text-align: center;">
      This link expires in ${expiresIn}.
    </p>
    
    <div style="${emailStyles.alertWarning}; margin-top: 32px;">
      <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px;">
        Didn't request this?
      </p>
      <p style="color: #92400e; font-size: 14px; margin: 0;">
        If you didn't request a password reset, you can safely ignore this email. 
        Your password will remain unchanged.
      </p>
    </div>
    
    ${ipAddress ? `
    <p style="${emailStyles.muted}; margin-top: 24px; font-size: 12px;">
      This request was made from IP address: ${ipAddress}
    </p>
    ` : ""}
    
    <p style="${emailStyles.muted}; margin-top: 16px;">
      If you're having trouble clicking the button, copy and paste this URL into your browser:
      <br>
      <span style="color: #3b82f6; word-break: break-all;">${resetUrl || appUrl}</span>
    </p>
  `;

  return renderBaseTemplate({
    previewText: "Reset your TokenTra password",
    content,
  });
}
