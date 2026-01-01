/**
 * TokenTRA Alerting Engine - Notification Dispatcher
 * 
 * Handles sending notifications through multiple channels:
 * - Email (via Resend)
 * - Slack (via Webhook)
 * - PagerDuty (via Events API)
 * - Custom Webhooks
 */

import type {
  Alert,
  NotificationChannel,
  NotificationResult,
  NotificationChannelType,
  AlertSeverity,
  AlertType,
} from "../types";

/**
 * Send notification through a channel
 */
export async function sendNotification(
  channel: NotificationChannel,
  alert: Alert
): Promise<NotificationResult> {
  switch (channel.type) {
    case "email":
      return sendEmail(channel.config as EmailConfig, alert);
    case "slack":
      return sendSlack(channel.config as SlackConfig, alert);
    case "pagerduty":
      return sendPagerDuty(channel.config as PagerDutyConfig, alert);
    case "webhook":
      return sendWebhook(channel.config as WebhookConfig, alert);
    case "teams":
      return sendTeams(channel.config as TeamsConfig, alert);
    case "datadog":
      return sendDatadog(channel.config as DatadogConfig, alert);
    case "jira":
      return sendJira(channel.config as JiraConfig, alert);
    default:
      return { success: false, error: `Unknown channel type: ${channel.type}` };
  }
}

// ============================================================================
// EMAIL
// ============================================================================

interface EmailConfig {
  recipients: string[];
}

async function sendEmail(config: EmailConfig, alert: Alert): Promise<NotificationResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const html = generateEmailHTML(alert);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "TokenTRA Alerts <alerts@tokentra.io>",
        to: config.recipients,
        subject: getEmailSubject(alert),
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || `Email API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

function getEmailSubject(alert: Alert): string {
  const severityEmoji: Record<AlertSeverity, string> = {
    critical: "🔴",
    warning: "🟡",
    info: "🔵",
  };

  return `${severityEmoji[alert.severity]} [TokenTRA] ${alert.title}`;
}

function generateEmailHTML(alert: Alert): string {
  const severityColor: Record<AlertSeverity, string> = {
    critical: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1F2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${severityColor[alert.severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #F9FAFB; padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px; }
    .metric { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border: 1px solid #E5E7EB; }
    .metric-label { color: #6B7280; font-size: 12px; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: 600; color: #1F2937; }
    .context { margin-top: 15px; padding: 15px; background: white; border-radius: 6px; border: 1px solid #E5E7EB; }
    .button { display: inline-block; background: #7F56D9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    .footer { margin-top: 20px; text-align: center; color: #9CA3AF; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">${alert.title}</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">${alert.severity.toUpperCase()} Alert • ${new Date(alert.triggeredAt).toLocaleString()}</p>
    </div>
    <div class="content">
      <p>${alert.description}</p>
      
      <div style="display: flex; gap: 15px;">
        <div class="metric" style="flex: 1;">
          <div class="metric-label">Current Value</div>
          <div class="metric-value">${formatMetricValue(alert.currentValue, alert.type)}</div>
        </div>
        <div class="metric" style="flex: 1;">
          <div class="metric-label">Threshold</div>
          <div class="metric-value">${formatMetricValue(alert.thresholdValue, alert.type)}</div>
        </div>
      </div>
      
      ${renderContext(alert.context)}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.io"}/alerts/${alert.id}" class="button">View Alert Details</a>
    </div>
    <div class="footer">
      <p>You're receiving this because you're subscribed to ${alert.severity} alerts.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.io"}/settings/notifications">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================================================
// SLACK
// ============================================================================

interface SlackConfig {
  webhookUrl: string;
  channel?: string;
}

async function sendSlack(config: SlackConfig, alert: Alert): Promise<NotificationResult> {
  const blocks = generateSlackBlocks(alert);

  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: config.channel,
        username: "TokenTRA Alerts",
        icon_emoji: ":chart_with_upwards_trend:",
        blocks,
        attachments: [
          {
            color: getSeverityColor(alert.severity),
            fallback: `${alert.title}: ${alert.description}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Slack API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

function generateSlackBlocks(alert: Alert): unknown[] {
  const severityEmoji: Record<AlertSeverity, string> = {
    critical: ":red_circle:",
    warning: ":large_yellow_circle:",
    info: ":large_blue_circle:",
  };

  const blocks: unknown[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${severityEmoji[alert.severity]} ${alert.title}`,
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: alert.description,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Current Value:*\n${formatMetricValue(alert.currentValue, alert.type)}`,
        },
        {
          type: "mrkdwn",
          text: `*Threshold:*\n${formatMetricValue(alert.thresholdValue, alert.type)}`,
        },
      ],
    },
  ];

  // Add context if available
  if (alert.context && Object.keys(alert.context).length > 0) {
    const contextFields = Object.entries(alert.context)
      .filter(([key]) => !["metric", "filters"].includes(key))
      .slice(0, 4)
      .map(([key, value]) => ({
        type: "mrkdwn",
        text: `*${key.replace(/([A-Z])/g, " $1").trim()}:*\n${typeof value === "object" ? JSON.stringify(value) : value}`,
      }));

    if (contextFields.length > 0) {
      blocks.push({
        type: "section",
        fields: contextFields,
      });
    }
  }

  // Add actions
  blocks.push(
    { type: "divider" },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Details", emoji: true },
          url: `${process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.io"}/alerts/${alert.id}`,
          style: "primary",
        },
        {
          type: "button",
          text: { type: "plain_text", text: "Acknowledge", emoji: true },
          action_id: `acknowledge_${alert.id}`,
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Alert ID: ${alert.id} | Triggered: <!date^${Math.floor(new Date(alert.triggeredAt).getTime() / 1000)}^{date_short_pretty} at {time}|${alert.triggeredAt}>`,
        },
      ],
    }
  );

  return blocks;
}

// ============================================================================
// PAGERDUTY
// ============================================================================

interface PagerDutyConfig {
  integrationKey: string;
  allSeverities?: boolean;
}

async function sendPagerDuty(config: PagerDutyConfig, alert: Alert): Promise<NotificationResult> {
  // Only send to PagerDuty for critical alerts by default
  if (alert.severity !== "critical" && !config.allSeverities) {
    return { success: true, skipped: true, reason: "Non-critical alert" };
  }

  const payload = {
    routing_key: config.integrationKey,
    event_action: "trigger",
    dedup_key: `tokentra-${alert.id}`,
    payload: {
      summary: `[TokenTRA] ${alert.title}`,
      severity: mapToPagerDutySeverity(alert.severity),
      source: "TokenTRA",
      timestamp: alert.triggeredAt,
      custom_details: {
        description: alert.description,
        current_value: alert.currentValue,
        threshold: alert.thresholdValue,
        alert_type: alert.type,
        ...alert.context,
      },
    },
    links: [
      {
        href: `${process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.io"}/alerts/${alert.id}`,
        text: "View in TokenTRA",
      },
    ],
  };

  try {
    const response = await fetch("https://events.pagerduty.com/v2/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || `PagerDuty error: ${response.status}` };
    }

    const result = await response.json();
    return { success: true, messageId: result.dedup_key };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

function mapToPagerDutySeverity(severity: AlertSeverity): string {
  switch (severity) {
    case "critical":
      return "critical";
    case "warning":
      return "warning";
    case "info":
      return "info";
  }
}

// ============================================================================
// WEBHOOK
// ============================================================================

interface WebhookConfig {
  url: string;
  secret?: string;
  headers?: Record<string, string>;
}

async function sendWebhook(config: WebhookConfig, alert: Alert): Promise<NotificationResult> {
  const payload = {
    event: "alert.triggered",
    timestamp: new Date().toISOString(),
    alert: {
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      description: alert.description,
      currentValue: alert.currentValue,
      thresholdValue: alert.thresholdValue,
      context: alert.context,
      triggeredAt: alert.triggeredAt,
    },
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "TokenTRA-Webhook/1.0",
  };

  // Sign the payload if secret is provided
  if (config.secret) {
    const signature = await signPayload(JSON.stringify(payload), config.secret);
    headers["X-TokenTRA-Signature"] = signature;
  }

  // Add custom headers
  if (config.headers) {
    Object.assign(headers, config.headers);
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Webhook error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ============================================================================
// HELPERS
// ============================================================================

function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case "critical":
      return "#EF4444";
    case "warning":
      return "#F59E0B";
    case "info":
      return "#3B82F6";
  }
}

function formatMetricValue(value: number, type: AlertType): string {
  if (type === "spend_threshold" || type === "forecast_exceeded") {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (type === "budget_threshold") {
    return `${value.toFixed(1)}%`;
  }
  if (type === "provider_error") {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
}

function renderContext(context: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) return "";

  const items = Object.entries(context)
    .filter(([key]) => !["metric", "filters"].includes(key))
    .slice(0, 5)
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
      const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      return `<li><strong>${label}:</strong> ${displayValue}</li>`;
    });

  if (items.length === 0) return "";

  return `
    <div class="context">
      <h4>Additional Context</h4>
      <ul>${items.join("")}</ul>
    </div>
  `;
}

// ============================================================================
// MICROSOFT TEAMS
// ============================================================================

interface TeamsConfig {
  webhookUrl: string;
}

async function sendTeams(config: TeamsConfig, alert: Alert): Promise<NotificationResult> {
  const severityColor: Record<AlertSeverity, string> = {
    critical: "EF4444",
    warning: "F59E0B",
    info: "3B82F6",
  };

  const severityEmoji: Record<AlertSeverity, string> = {
    critical: "🔴",
    warning: "🟡",
    info: "🔵",
  };

  // Build facts from context
  const facts = [
    { name: "Current Value", value: formatMetricValue(alert.currentValue, alert.type) },
    { name: "Threshold", value: formatMetricValue(alert.thresholdValue, alert.type) },
  ];

  // Add context fields as facts
  if (alert.context) {
    Object.entries(alert.context)
      .filter(([key]) => !["metric", "filters"].includes(key))
      .slice(0, 4)
      .forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
        facts.push({
          name: label,
          value: typeof value === "object" ? JSON.stringify(value) : String(value),
        });
      });
  }

  const messageCard = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: severityColor[alert.severity],
    summary: `${severityEmoji[alert.severity]} ${alert.title}`,
    sections: [
      {
        activityTitle: `${severityEmoji[alert.severity]} ${alert.title}`,
        activitySubtitle: `${alert.severity.toUpperCase()} Alert • ${new Date(alert.triggeredAt).toLocaleString()}`,
        activityImage: "https://app.tokentra.io/images/logo-icon.png",
        facts,
        markdown: true,
      },
      {
        text: alert.description,
      },
    ],
    potentialAction: [
      {
        "@type": "OpenUri",
        name: "View in TokenTra",
        targets: [
          {
            os: "default",
            uri: `${process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.io"}/alerts/${alert.id}`,
          },
        ],
      },
      {
        "@type": "OpenUri",
        name: "Acknowledge Alert",
        targets: [
          {
            os: "default",
            uri: `${process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.io"}/alerts/${alert.id}?action=acknowledge`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messageCard),
    });

    if (!response.ok) {
      return { success: false, error: `Teams API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============================================================================
// DATADOG
// ============================================================================

interface DatadogConfig {
  apiKey: string;
  site?: string;
  sendMetrics?: boolean;
  sendEvents?: boolean;
}

async function sendDatadog(config: DatadogConfig, alert: Alert): Promise<NotificationResult> {
  const site = config.site || "datadoghq.com";
  const sendMetrics = config.sendMetrics !== false;
  const sendEvents = config.sendEvents !== false;
  const results: { metrics?: NotificationResult; events?: NotificationResult } = {};

  // Build tags from context
  const tags = [
    `severity:${alert.severity}`,
    `type:${alert.type}`,
    `status:${alert.status}`,
  ];

  if (alert.context) {
    if (alert.context.provider) tags.push(`provider:${alert.context.provider}`);
    if (alert.context.team) tags.push(`team:${alert.context.team}`);
    if (alert.context.project) tags.push(`project:${alert.context.project}`);
    if (alert.context.model) tags.push(`model:${alert.context.model}`);
    if (alert.context.budgetName) tags.push(`budget:${alert.context.budgetName}`);
  }

  // Send metric
  if (sendMetrics) {
    const metricName = `tokentra.alert.${alert.type.replace(/_/g, ".")}`;
    const timestamp = Math.floor(new Date(alert.triggeredAt).getTime() / 1000);

    const metricsPayload = {
      series: [
        {
          metric: metricName,
          type: "gauge",
          points: [[timestamp, alert.currentValue]],
          tags,
        },
        {
          metric: `${metricName}.threshold`,
          type: "gauge",
          points: [[timestamp, alert.thresholdValue]],
          tags,
        },
      ],
    };

    try {
      const response = await fetch(`https://api.${site}/api/v2/series`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "DD-API-KEY": config.apiKey,
        },
        body: JSON.stringify(metricsPayload),
      });

      results.metrics = response.ok
        ? { success: true }
        : { success: false, error: `Datadog metrics error: ${response.status}` };
    } catch (error) {
      results.metrics = { success: false, error: (error as Error).message };
    }
  }

  // Send event
  if (sendEvents) {
    const alertTypeMap: Record<AlertSeverity, string> = {
      critical: "error",
      warning: "warning",
      info: "info",
    };

    const eventPayload = {
      title: `[TokenTra] ${alert.title}`,
      text: `${alert.description}\n\nCurrent Value: ${formatMetricValue(alert.currentValue, alert.type)}\nThreshold: ${formatMetricValue(alert.thresholdValue, alert.type)}\n\n[View in TokenTra](${process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.io"}/alerts/${alert.id})`,
      alert_type: alertTypeMap[alert.severity],
      source_type_name: "tokentra",
      tags,
      date_happened: Math.floor(new Date(alert.triggeredAt).getTime() / 1000),
    };

    try {
      const response = await fetch(`https://api.${site}/api/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "DD-API-KEY": config.apiKey,
        },
        body: JSON.stringify(eventPayload),
      });

      if (response.ok) {
        const data = await response.json();
        results.events = { success: true, messageId: String(data.event?.id) };
      } else {
        results.events = { success: false, error: `Datadog events error: ${response.status}` };
      }
    } catch (error) {
      results.events = { success: false, error: (error as Error).message };
    }
  }

  // Return combined result
  const allSuccess = Object.values(results).every((r) => r?.success);
  const errors = Object.entries(results)
    .filter(([, r]) => !r?.success && r?.error)
    .map(([k, r]) => `${k}: ${r?.error}`)
    .join("; ");

  return allSuccess
    ? { success: true }
    : { success: false, error: errors || "Unknown Datadog error" };
}

// ============================================================================
// JIRA
// ============================================================================

interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  issueType?: string;
  priority?: string;
}

async function sendJira(config: JiraConfig, alert: Alert): Promise<NotificationResult> {
  const severityToPriority: Record<AlertSeverity, string> = {
    critical: "Highest",
    warning: "High",
    info: "Medium",
  };

  // Build description with ADF (Atlassian Document Format)
  const contextRows = Object.entries(alert.context || {})
    .filter(([key]) => !["metric", "filters"].includes(key))
    .slice(0, 6)
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
      const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      return `| ${label} | ${displayValue} |`;
    });

  const description = `
h2. Alert Details

${alert.description}

||Field||Value||
|Current Value|${formatMetricValue(alert.currentValue, alert.type)}|
|Threshold|${formatMetricValue(alert.thresholdValue, alert.type)}|
|Severity|${alert.severity.toUpperCase()}|
|Alert Type|${alert.type}|
|Triggered At|${new Date(alert.triggeredAt).toLocaleString()}|
${contextRows.join("\n")}

[View in TokenTra|${process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.io"}/alerts/${alert.id}]

----
_This issue was automatically created by TokenTra Alerting System._
  `.trim();

  const issuePayload = {
    fields: {
      project: { key: config.projectKey },
      summary: `[TokenTra] ${alert.title}`,
      description,
      issuetype: { name: config.issueType || "Task" },
      priority: { name: config.priority || severityToPriority[alert.severity] },
      labels: ["tokentra", "cost-alert", alert.type.replace(/_/g, "-"), alert.severity],
    },
  };

  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");

  try {
    const response = await fetch(`${config.baseUrl}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(issuePayload),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.errorMessages?.join(", ") || `Jira API error: ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, messageId: data.key };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
