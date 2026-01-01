/**
 * Welcome Email Template
 * Sent immediately after user signup
 */

import { renderBaseTemplate, emailStyles } from "./base";

interface WelcomeEmailData {
  name?: string;
  email?: string;
  appUrl?: string;
}

export function renderWelcomeEmail(data: Record<string, unknown>): string {
  const { name = "there", appUrl = "https://app.tokentra.com" } = data as WelcomeEmailData;
  const firstName = typeof name === "string" ? name.split(" ")[0] : "there";

  const content = `
    <h1 style="${emailStyles.heading}">
      Welcome to TokenTra, ${firstName}! 👋
    </h1>
    
    <p style="${emailStyles.paragraph}">
      Thanks for signing up! You're about to get complete visibility 
      into your AI spending across all providers.
    </p>
    
    <p style="${emailStyles.paragraph}">
      Here's how to get started in under 5 minutes:
    </p>
    
    <div style="${emailStyles.card}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #0f172a; border-radius: 50%; color: #ffffff; font-size: 14px; font-weight: 600; height: 28px; line-height: 28px; text-align: center; width: 28px;">1</td>
                <td style="padding-left: 16px;">
                  <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Connect your AI provider</p>
                  <p style="color: #64748b; font-size: 14px; margin: 0;">Link OpenAI, Anthropic, or any provider you use.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #0f172a; border-radius: 50%; color: #ffffff; font-size: 14px; font-weight: 600; height: 28px; line-height: 28px; text-align: center; width: 28px;">2</td>
                <td style="padding-left: 16px;">
                  <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 4px;">See your cost breakdown</p>
                  <p style="color: #64748b; font-size: 14px; margin: 0;">View spending by model, provider, and time period.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #0f172a; border-radius: 50%; color: #ffffff; font-size: 14px; font-weight: 600; height: 28px; line-height: 28px; text-align: center; width: 28px;">3</td>
                <td style="padding-left: 16px;">
                  <p style="color: #0f172a; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Set up alerts & budgets</p>
                  <p style="color: #64748b; font-size: 14px; margin: 0;">Get notified before costs get out of control.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl}/onboarding" style="${emailStyles.button}">
        Get Started →
      </a>
    </div>
    
    <p style="${emailStyles.signature}">
      — The TokenTra Team
    </p>
  `;

  return renderBaseTemplate({
    previewText: `Welcome to TokenTra, ${firstName}! Get started with AI cost tracking.`,
    content,
  });
}
