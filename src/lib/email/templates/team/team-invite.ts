/**
 * Team Invite Email Template
 * Sent when a user is invited to join an organization
 */

import { renderBaseTemplate, emailStyles } from "../base";

interface TeamInviteData {
  inviterName?: string;
  inviterEmail?: string;
  organizationName?: string;
  role?: string;
  inviteUrl?: string;
  expiresIn?: string;
  appUrl?: string;
}

export function renderTeamInviteEmail(data: Record<string, unknown>): string {
  const {
    inviterName = "Someone",
    organizationName = "their organization",
    role = "Member",
    inviteUrl,
    expiresIn = "7 days",
    appUrl = "https://app.tokentra.com",
  } = data as TeamInviteData;

  const content = `
    <h1 style="${emailStyles.heading}">
      You're invited to join ${organizationName}
    </h1>
    
    <p style="${emailStyles.paragraph}">
      <strong>${inviterName}</strong> has invited you to join 
      <strong>${organizationName}</strong> on TokenTra as a <strong>${role}</strong>.
    </p>
    
    <div style="${emailStyles.card}">
      <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 12px;">
        What you'll get access to:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 4px 0;">
            <span style="color: #22c55e; margin-right: 8px;">✓</span>
            <span style="color: #334155; font-size: 14px;">AI cost dashboards and analytics</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <span style="color: #22c55e; margin-right: 8px;">✓</span>
            <span style="color: #334155; font-size: 14px;">Usage tracking across all providers</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <span style="color: #22c55e; margin-right: 8px;">✓</span>
            <span style="color: #334155; font-size: 14px;">Budget alerts and optimization insights</span>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${inviteUrl || appUrl}" style="${emailStyles.button}">
        Accept Invitation →
      </a>
    </div>
    
    <p style="${emailStyles.muted}; text-align: center;">
      This invitation expires in ${expiresIn}.
    </p>
    
    <p style="${emailStyles.muted}; margin-top: 24px;">
      If you weren't expecting this invitation, you can safely ignore this email.
    </p>
  `;

  return renderBaseTemplate({
    previewText: `${inviterName} invited you to join ${organizationName} on TokenTra`,
    content,
  });
}
