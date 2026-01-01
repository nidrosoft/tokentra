/**
 * Email Templates Index
 * Renders email templates to HTML
 */

import { renderWelcomeEmail } from "./welcome";
import { renderSpendThresholdEmail } from "./alerts/spend-threshold";
import { renderTeamInviteEmail } from "./team/team-invite";
import { renderPasswordResetEmail } from "./security/password-reset";

type TemplateRenderer = (data: Record<string, unknown>) => string;

const TEMPLATE_RENDERERS: Record<string, TemplateRenderer> = {
  welcome: renderWelcomeEmail,
  spend_threshold: renderSpendThresholdEmail,
  team_invite: renderTeamInviteEmail,
  password_reset: renderPasswordResetEmail,
};

/**
 * Render an email template to HTML
 */
export function render(type: string, data: Record<string, unknown>): string {
  const renderer = TEMPLATE_RENDERERS[type];
  if (!renderer) {
    throw new Error(`No template renderer found for: ${type}`);
  }
  return renderer(data);
}

export { renderWelcomeEmail } from "./welcome";
export { renderSpendThresholdEmail } from "./alerts/spend-threshold";
export { renderTeamInviteEmail } from "./team/team-invite";
export { renderPasswordResetEmail } from "./security/password-reset";
