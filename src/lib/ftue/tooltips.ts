/**
 * Contextual Tooltip Definitions
 */

import type { ContextualTooltip } from "./types";

export const CONTEXTUAL_TOOLTIPS: ContextualTooltip[] = [
  // Dashboard tooltips
  {
    id: "date_range_tip",
    target: '[data-tour="date-range"]',
    title: "Change Time Range",
    content:
      "Click to view costs for different periods: last 7 days, 30 days, or a custom range.",
    trigger: { type: "first_hover" },
    dismissBehavior: "once",
    priority: 10,
  },
  {
    id: "export_button_tip",
    target: '[data-action="export"]',
    title: "Export Your Data",
    content:
      "Download cost data as CSV for your finance team or spreadsheet analysis.",
    trigger: { type: "first_hover" },
    dismissBehavior: "once",
    priority: 5,
  },
  {
    id: "model_click_tip",
    target: '[data-tour="model-breakdown"]',
    title: "Click to Filter",
    content:
      "Click on any model to filter the dashboard and see only that model's costs.",
    trigger: { type: "first_hover" },
    dismissBehavior: "action",
    actionToTrack: "model_filter_applied",
    priority: 8,
  },

  // Feature discovery tooltips
  {
    id: "optimization_ready",
    target: '[data-nav="optimization"]',
    title: "💡 Optimization Insights Ready!",
    content:
      "We found ways to reduce your AI costs. Click to see recommendations.",
    trigger: { type: "after_action", action: "optimization_available" },
    dismissBehavior: "action",
    actionToTrack: "viewed_optimization",
    priority: 20,
  },
  {
    id: "sdk_suggestion",
    target: '[data-tour="attribution-section"]',
    title: "Want More Detail?",
    content:
      "Install the SDK to see costs broken down by feature, team, and user.",
    trigger: { type: "time_delay", seconds: 60 },
    dismissBehavior: "action",
    actionToTrack: "sdk_connected",
    priority: 15,
    maxShows: 3,
  },

  // Empty state helpers
  {
    id: "no_alerts_tip",
    target: '[data-empty="alerts"]',
    title: "Protect Your Budget",
    content:
      "Set up alerts to get notified when spending is unusual or exceeds thresholds.",
    trigger: { type: "empty_state", selector: '[data-empty="alerts"]' },
    dismissBehavior: "action",
    actionToTrack: "alert_created",
    priority: 12,
  },
  {
    id: "no_budgets_tip",
    target: '[data-empty="budgets"]',
    title: "Control Your Spending",
    content:
      "Create budgets to set spending limits and avoid surprise bills.",
    trigger: { type: "empty_state", selector: '[data-empty="budgets"]' },
    dismissBehavior: "action",
    actionToTrack: "budget_created",
    priority: 12,
  },
];

/**
 * Get tooltips for a specific page
 */
export function getTooltipsForPage(page: string): ContextualTooltip[] {
  return CONTEXTUAL_TOOLTIPS.filter((tooltip) => {
    if (tooltip.trigger.type === "first_visit") {
      return tooltip.trigger.page === page;
    }
    return true;
  }).sort((a, b) => b.priority - a.priority);
}

/**
 * Get tooltip by ID
 */
export function getTooltip(id: string): ContextualTooltip | undefined {
  return CONTEXTUAL_TOOLTIPS.find((t) => t.id === id);
}
