/**
 * Onboarding Checklist Configuration
 */

import type { ChecklistItem, OnboardingChecklist } from "./types";

export const CHECKLIST_ITEMS: Omit<ChecklistItem, "completed">[] = [
  // SETUP CATEGORY
  {
    id: "complete_profile",
    title: "Complete your profile",
    description: "Tell us about your company and AI usage",
    icon: "👤",
    completionEvent: "profile_completed",
    actionUrl: "/onboarding/company-profile",
    actionLabel: "Complete Profile",
    priority: 1,
    category: "setup",
  },
  {
    id: "connect_provider",
    title: "Connect an AI provider",
    description: "Link OpenAI, Anthropic, or another provider",
    icon: "🔌",
    completionEvent: "provider_connected",
    actionUrl: "/dashboard/settings/providers",
    actionLabel: "Connect Provider",
    priority: 2,
    category: "setup",
  },
  {
    id: "setup_sdk",
    title: "Install the SDK (optional)",
    description: "Get detailed tracking by feature and team",
    icon: "🛠️",
    completionEvent: "sdk_connected",
    actionUrl: "/onboarding/sdk-setup",
    actionLabel: "Setup SDK",
    priority: 3,
    category: "setup",
  },

  // OPTIMIZE CATEGORY
  {
    id: "view_insights",
    title: "Review your cost breakdown",
    description: "See where your AI spend is going",
    icon: "📊",
    completionEvent: "dashboard_viewed",
    actionUrl: "/dashboard",
    actionLabel: "View Dashboard",
    priority: 4,
    category: "optimize",
  },
  {
    id: "set_budget",
    title: "Set a budget",
    description: "Create spending limits to avoid surprises",
    icon: "💰",
    completionEvent: "budget_created",
    actionUrl: "/dashboard/budgets",
    actionLabel: "Create Budget",
    priority: 5,
    category: "optimize",
  },
  {
    id: "configure_alert",
    title: "Configure an alert",
    description: "Get notified about unusual spending",
    icon: "🔔",
    completionEvent: "alert_created",
    actionUrl: "/dashboard/alerts",
    actionLabel: "Create Alert",
    priority: 6,
    category: "optimize",
  },

  // TEAM CATEGORY
  {
    id: "invite_team",
    title: "Invite your team",
    description: "Add team members to collaborate",
    icon: "👥",
    completionEvent: "team_member_invited",
    actionUrl: "/dashboard/settings/team",
    actionLabel: "Invite Team",
    priority: 7,
    category: "team",
  },
];

/**
 * Get user's onboarding checklist with completion status
 */
export function buildChecklist(completedEvents: string[]): OnboardingChecklist {
  const items: ChecklistItem[] = CHECKLIST_ITEMS.map(item => ({
    ...item,
    completed: completedEvents.includes(item.completionEvent),
  }));

  const completedCount = items.filter(i => i.completed).length;

  return {
    items,
    completedCount,
    totalCount: items.length,
    percentComplete: Math.round((completedCount / items.length) * 100),
  };
}

/**
 * Get the next incomplete checklist item
 */
export function getNextChecklistItem(completedEvents: string[]): ChecklistItem | null {
  const checklist = buildChecklist(completedEvents);
  const incompleteItems = checklist.items.filter(i => !i.completed);
  return incompleteItems.length > 0 ? incompleteItems[0] : null;
}

/**
 * Check if onboarding is complete (core items done)
 */
export function isOnboardingComplete(completedEvents: string[]): boolean {
  const coreEvents = ["profile_completed", "provider_connected"];
  return coreEvents.every(event => completedEvents.includes(event));
}
