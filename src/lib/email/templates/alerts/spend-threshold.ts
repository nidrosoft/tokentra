/**
 * Spend Threshold Alert Email Template
 * Sent when spending exceeds configured threshold
 */

import { renderBaseTemplate, emailStyles } from "../base";

interface SpendThresholdData {
  name?: string;
  alertName?: string;
  currentSpend?: string;
  threshold?: string;
  percentOfThreshold?: number;
  period?: string;
  topCostDriver?: string;
  topCostAmount?: string;
  dashboardUrl?: string;
  appUrl?: string;
  unsubscribeUrl?: string;
}

export function renderSpendThresholdEmail(data: Record<string, unknown>): string {
  const {
    name = "there",
    alertName = "Spend Alert",
    currentSpend = "$0",
    threshold = "$0",
    percentOfThreshold = 0,
    period = "This Month",
    topCostDriver = "Unknown",
    topCostAmount = "$0",
    dashboardUrl,
    appUrl = "https://app.tokentra.com",
    unsubscribeUrl,
  } = data as SpendThresholdData;

  const firstName = typeof name === "string" ? name.split(" ")[0] : "there";
  const isExceeded = percentOfThreshold >= 100;
  const alertStyle = isExceeded ? emailStyles.alertDanger : emailStyles.alertWarning;
  const alertColor = isExceeded ? "#991b1b" : "#92400e";
  const progressColor = isExceeded ? "#ef4444" : "#f59e0b";

  const content = `
    <!-- Alert Banner -->
    <div style="${alertStyle}">
      <p style="color: ${alertColor}; font-size: 14px; font-weight: 600; margin: 0 0 4px;">
        ${isExceeded ? "🚨 Spending Limit Exceeded!" : "⚠️ Spending Alert Triggered"}
      </p>
      <p style="color: ${alertColor}; font-size: 14px; margin: 0;">
        Your AI spending has ${isExceeded ? "exceeded" : "reached"} ${percentOfThreshold}% 
        of your configured threshold.
      </p>
    </div>
    
    <h1 style="${emailStyles.heading}">
      ${firstName}, your AI spend needs attention
    </h1>
    
    <p style="${emailStyles.paragraph}">
      Alert "<strong>${alertName}</strong>" was triggered:
    </p>
    
    <!-- Spend Summary -->
    <div style="${emailStyles.card}">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 50%;">
            <p style="color: #64748b; font-size: 12px; font-weight: 500; margin: 0 0 4px; text-transform: uppercase;">${period} Spend</p>
            <p style="color: #0f172a; font-size: 32px; font-weight: 700; margin: 0;">${currentSpend}</p>
          </td>
          <td style="width: 50%; text-align: right;">
            <p style="color: #64748b; font-size: 12px; font-weight: 500; margin: 0 0 4px; text-transform: uppercase;">Threshold</p>
            <p style="color: #64748b; font-size: 24px; font-weight: 600; margin: 0;">${threshold}</p>
          </td>
        </tr>
      </table>
      
      <!-- Progress Bar -->
      <div style="background-color: #e2e8f0; border-radius: 4px; height: 8px; margin-top: 20px; overflow: hidden;">
        <div style="background-color: ${progressColor}; height: 8px; width: ${Math.min(percentOfThreshold, 100)}%;"></div>
      </div>
      <p style="color: #64748b; font-size: 12px; margin: 8px 0 0; text-align: right;">${percentOfThreshold}% of threshold</p>
    </div>
    
    <!-- Top Cost Driver -->
    <div style="border-left: 3px solid #3b82f6; margin: 24px 0; padding-left: 16px;">
      <p style="color: #64748b; font-size: 12px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase;">📊 Biggest Cost Driver</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="color: #0f172a; font-size: 14px; font-weight: 500; margin: 0;">${topCostDriver}</p>
          </td>
          <td style="text-align: right;">
            <p style="color: #0f172a; font-size: 14px; font-weight: 700; margin: 0;">${topCostAmount}</p>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardUrl || appUrl}/dashboard" style="${emailStyles.button}">
        View Details & Take Action →
      </a>
    </div>
    
    <p style="${emailStyles.muted}">
      <strong>Quick actions:</strong>
      <a href="${appUrl}/budgets" style="${emailStyles.link}">Adjust budget</a>
      &nbsp;•&nbsp;
      <a href="${appUrl}/optimization" style="${emailStyles.link}">See cost-saving tips</a>
    </p>
  `;

  return renderBaseTemplate({
    previewText: `⚠️ AI spend alert: ${currentSpend} (${percentOfThreshold}% of limit)`,
    content,
    unsubscribeUrl,
  });
}
