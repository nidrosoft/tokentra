/**
 * Base Email Template
 * Provides consistent styling and structure for all emails
 */

export interface BaseTemplateProps {
  previewText: string;
  content: string;
  unsubscribeUrl?: string;
}

const STYLES = {
  body: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f6f9fc;
    margin: 0;
    padding: 0;
  `,
  container: `
    background-color: #ffffff;
    border: 1px solid #e6ebf1;
    border-radius: 8px;
    margin: 40px auto;
    max-width: 600px;
  `,
  header: `
    background-color: #0f172a;
    border-radius: 8px 8px 0 0;
    padding: 24px 40px;
    text-align: center;
  `,
  logo: `
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    text-decoration: none;
  `,
  main: `
    padding: 40px;
  `,
  footer: `
    padding: 24px 40px;
    text-align: center;
    border-top: 1px solid #e6ebf1;
  `,
  footerText: `
    color: #8898aa;
    font-size: 12px;
    margin: 0 0 8px;
  `,
  footerLinks: `
    color: #8898aa;
    font-size: 12px;
    margin: 0 0 8px;
  `,
  link: `
    color: #3b82f6;
    text-decoration: none;
  `,
  unsubscribe: `
    color: #8898aa;
    font-size: 11px;
    margin-top: 16px;
  `,
};

export function renderBaseTemplate({ previewText, content, unsubscribeUrl }: BaseTemplateProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.tokentra.com";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>TokenTra</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    td { padding: 0; }
  </style>
  <![endif]-->
</head>
<body style="${STYLES.body}">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
  </div>
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" style="${STYLES.container}">
          <!-- Header -->
          <tr>
            <td style="${STYLES.header}">
              <a href="${appUrl}" style="${STYLES.logo}">TokenTra</a>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="${STYLES.main}">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="${STYLES.footer}">
              <p style="${STYLES.footerText}">
                TokenTra - AI Cost Intelligence Platform
              </p>
              <p style="${STYLES.footerLinks}">
                <a href="${appUrl}" style="${STYLES.link}">Dashboard</a>
                &nbsp;•&nbsp;
                <a href="https://docs.tokentra.com" style="${STYLES.link}">Docs</a>
                &nbsp;•&nbsp;
                <a href="mailto:support@tokentra.com" style="${STYLES.link}">Support</a>
              </p>
              ${unsubscribeUrl ? `
              <p style="${STYLES.unsubscribe}">
                <a href="${unsubscribeUrl}" style="${STYLES.link}">Unsubscribe from these emails</a>
              </p>
              ` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Common style helpers
export const emailStyles = {
  heading: `
    color: #0f172a;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 24px;
  `,
  paragraph: `
    color: #334155;
    font-size: 16px;
    line-height: 24px;
    margin: 0 0 16px;
  `,
  button: `
    background-color: #0f172a;
    border-radius: 6px;
    color: #ffffff;
    display: inline-block;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 24px;
    text-decoration: none;
  `,
  secondaryButton: `
    background-color: #f1f5f9;
    border-radius: 6px;
    color: #0f172a;
    display: inline-block;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 24px;
    text-decoration: none;
  `,
  card: `
    background-color: #f8fafc;
    border-radius: 8px;
    padding: 24px;
    margin: 24px 0;
  `,
  alertWarning: `
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    border-radius: 4px;
    padding: 16px;
    margin: 0 0 24px;
  `,
  alertDanger: `
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    border-radius: 4px;
    padding: 16px;
    margin: 0 0 24px;
  `,
  alertSuccess: `
    background-color: #f0fdf4;
    border-left: 4px solid #22c55e;
    border-radius: 4px;
    padding: 16px;
    margin: 0 0 24px;
  `,
  signature: `
    color: #94a3b8;
    font-size: 14px;
    font-style: italic;
    margin: 32px 0 0;
  `,
  link: `
    color: #3b82f6;
    text-decoration: none;
  `,
  muted: `
    color: #64748b;
    font-size: 14px;
  `,
};
