/**
 * Product Tour Definitions
 */

import type { Tour } from "./types";

export const TOURS: Record<string, Tour> = {
  dashboard_intro: {
    id: "dashboard_intro",
    name: "Dashboard Introduction",
    description: "Learn the basics of your AI cost dashboard",
    triggerCondition: { type: "first_visit", page: "/dashboard" },
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "Welcome to TokenTra! 🎉",
        content:
          "This is your AI cost command center. Let me show you around - it only takes a minute.",
        placement: "center",
        showSkip: true,
        nextButtonText: "Show me around",
      },
      {
        id: "total_spend",
        target: '[data-tour="total-spend"]',
        title: "Total AI Spend",
        content:
          "This shows your total AI spending for the selected time period. Click to drill down by provider or model.",
        placement: "bottom",
        highlightPadding: 8,
      },
      {
        id: "date_range",
        target: '[data-tour="date-range"]',
        title: "Change Time Range",
        content:
          "View spending for different periods - last 7 days, 30 days, or set a custom range.",
        placement: "bottom",
      },
      {
        id: "spend_chart",
        target: '[data-tour="spend-chart"]',
        title: "Spending Trends",
        content:
          "Track how your AI costs change over time. Hover over any point for daily details.",
        placement: "top",
      },
      {
        id: "model_breakdown",
        target: '[data-tour="model-breakdown"]',
        title: "Cost by Model",
        content:
          "See which models are driving your costs. GPT-4 is often the biggest contributor - we'll help you optimize.",
        placement: "left",
      },
      {
        id: "sidebar",
        target: '[data-tour="sidebar-nav"]',
        title: "Explore More",
        content:
          "Use the sidebar to access detailed Usage, Providers, Optimization suggestions, Budgets, and Alerts.",
        placement: "right",
      },
      {
        id: "complete",
        target: "body",
        title: "You're all set! 🚀",
        content:
          "That's the basics! Explore your dashboard, and click the help button anytime to restart this tour or get support.",
        placement: "center",
        nextButtonText: "Start exploring",
      },
    ],
  },

  usage_intro: {
    id: "usage_intro",
    name: "Usage Analytics Tour",
    description: "Understand your AI usage patterns",
    triggerCondition: { type: "first_visit", page: "/dashboard/usage" },
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "Usage Analytics 📊",
        content:
          "This page shows detailed breakdowns of your AI API usage across all providers.",
        placement: "center",
        showSkip: true,
      },
      {
        id: "usage_chart",
        target: '[data-tour="usage-chart"]',
        title: "Usage Over Time",
        content:
          "See how your token usage and request counts change over time. Identify patterns and anomalies.",
        placement: "bottom",
      },
      {
        id: "model_usage",
        target: '[data-tour="model-usage"]',
        title: "Usage by Model",
        content:
          "Compare usage across different models. Find opportunities to use more cost-effective alternatives.",
        placement: "left",
      },
      {
        id: "filters",
        target: '[data-tour="usage-filters"]',
        title: "Filter Your Data",
        content:
          "Filter by provider, model, team, or project to focus on specific usage patterns.",
        placement: "bottom",
      },
    ],
  },

  providers_intro: {
    id: "providers_intro",
    name: "Providers Tour",
    description: "Manage your AI provider connections",
    triggerCondition: { type: "first_visit", page: "/dashboard/providers" },
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "AI Providers 🔌",
        content:
          "Connect and manage your AI providers here. We support OpenAI, Anthropic, Google, and more.",
        placement: "center",
        showSkip: true,
      },
      {
        id: "provider_list",
        target: '[data-tour="provider-list"]',
        title: "Connected Providers",
        content:
          "See all your connected providers, their sync status, and recent activity.",
        placement: "bottom",
      },
      {
        id: "add_provider",
        target: '[data-tour="add-provider"]',
        title: "Add More Providers",
        content:
          "Connect additional providers to get a unified view of all your AI costs.",
        placement: "left",
      },
    ],
  },

  budgets_intro: {
    id: "budgets_intro",
    name: "Budgets Tour",
    description: "Set up spending limits",
    triggerCondition: { type: "first_visit", page: "/dashboard/budgets" },
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "Budget Management 💰",
        content:
          "Create budgets to control your AI spending and avoid surprise bills.",
        placement: "center",
        showSkip: true,
      },
      {
        id: "budget_list",
        target: '[data-tour="budget-list"]',
        title: "Your Budgets",
        content:
          "View all your budgets, their current status, and how much you've spent.",
        placement: "bottom",
      },
      {
        id: "create_budget",
        target: '[data-tour="create-budget"]',
        title: "Create a Budget",
        content:
          "Set spending limits by provider, team, or project. Get alerted before you exceed them.",
        placement: "left",
      },
    ],
  },

  alerts_intro: {
    id: "alerts_intro",
    name: "Alerts Tour",
    description: "Configure spending alerts",
    triggerCondition: { type: "first_visit", page: "/dashboard/alerts" },
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "Alert Configuration 🔔",
        content:
          "Set up alerts to get notified about unusual spending, budget thresholds, or anomalies.",
        placement: "center",
        showSkip: true,
      },
      {
        id: "alert_list",
        target: '[data-tour="alert-list"]',
        title: "Active Alerts",
        content:
          "See all your configured alerts and their recent trigger history.",
        placement: "bottom",
      },
      {
        id: "create_alert",
        target: '[data-tour="create-alert"]',
        title: "Create an Alert",
        content:
          "Choose from spending thresholds, anomaly detection, or custom conditions.",
        placement: "left",
      },
    ],
  },

  optimization_intro: {
    id: "optimization_intro",
    name: "Optimization Tour",
    description: "Discover cost-saving opportunities",
    triggerCondition: { type: "feature_unlock", feature: "optimization_insights" },
    steps: [
      {
        id: "welcome",
        target: "body",
        title: "Optimization Insights 💡",
        content:
          "We've analyzed your usage and found ways to reduce your AI costs!",
        placement: "center",
        showSkip: true,
      },
      {
        id: "recommendations",
        target: '[data-tour="recommendations"]',
        title: "Recommendations",
        content:
          "Each card shows a specific optimization with estimated savings. Click to learn more.",
        placement: "bottom",
      },
      {
        id: "savings_summary",
        target: '[data-tour="savings-summary"]',
        title: "Potential Savings",
        content:
          "See your total potential savings if you implement all recommendations.",
        placement: "left",
      },
    ],
  },
};

/**
 * Get tour by ID
 */
export function getTour(tourId: string): Tour | undefined {
  return TOURS[tourId];
}

/**
 * Get tour for a specific page (first visit)
 */
export function getTourForPage(page: string): Tour | undefined {
  return Object.values(TOURS).find(
    (tour) =>
      tour.triggerCondition.type === "first_visit" &&
      tour.triggerCondition.page === page
  );
}
