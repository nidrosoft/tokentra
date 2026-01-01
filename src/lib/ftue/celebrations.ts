/**
 * Celebration Definitions
 */

import type { Celebration } from "./types";

export const CELEBRATIONS: Celebration[] = [
  {
    id: "first_provider",
    type: "confetti",
    trigger: "provider_connected",
    title: "Provider Connected! 🎉",
    message: "Your data is syncing. You'll see your costs shortly.",
    duration: 5000,
  },
  {
    id: "first_data",
    type: "modal",
    trigger: "first_data_synced",
    title: "Your Data is Ready! 🎉",
    message: "We've synced your AI usage data. Time to explore your spending!",
    emoji: "📊",
    action: {
      label: "View Dashboard",
      url: "/dashboard",
    },
  },
  {
    id: "first_budget",
    type: "toast",
    trigger: "budget_created",
    title: "Budget Created! 💰",
    message: "You'll get alerts when spending approaches your limit.",
    duration: 4000,
  },
  {
    id: "first_alert",
    type: "toast",
    trigger: "alert_created",
    title: "Alert Active! 🔔",
    message: "You'll be notified when this alert triggers.",
    duration: 4000,
  },
  {
    id: "sdk_connected",
    type: "confetti",
    trigger: "sdk_first_request",
    title: "SDK Connected! 🚀",
    message: "You're now tracking costs with full attribution.",
    duration: 5000,
    action: {
      label: "View Attribution",
      url: "/dashboard/usage?view=attribution",
    },
  },
  {
    id: "team_invite_accepted",
    type: "toast",
    trigger: "team_member_joined",
    title: "Team Member Joined! 👋",
    message: "Your team is growing!",
    duration: 4000,
  },
  {
    id: "onboarding_complete",
    type: "confetti",
    trigger: "onboarding_completed",
    title: "Setup Complete! 🎉",
    message: "You're all set to start tracking your AI costs.",
    duration: 5000,
  },
  {
    id: "first_optimization",
    type: "modal",
    trigger: "optimization_implemented",
    title: "Great Savings! 💸",
    message: "You've implemented an optimization. Watch your costs go down!",
    emoji: "📉",
  },
];

/**
 * Get celebration by trigger
 */
export function getCelebrationForTrigger(trigger: string): Celebration | undefined {
  return CELEBRATIONS.find((c) => c.trigger === trigger);
}

/**
 * Get celebration by ID
 */
export function getCelebration(id: string): Celebration | undefined {
  return CELEBRATIONS.find((c) => c.id === id);
}
