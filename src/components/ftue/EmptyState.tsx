"use client";

import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { Zap, Users01, Bell01, File06, BarChart01, Settings01 } from "@untitledui/icons";
import type { EmptyStateConfig } from "@/lib/ftue/types";

interface EmptyStateProps extends EmptyStateConfig {
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  users: Users01,
  bell: Bell01,
  file: File06,
  chart: BarChart01,
  settings: Settings01,
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  const IconComponent = ICON_MAP[icon] || Zap;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
        <IconComponent className="w-8 h-8 text-quaternary" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-tertiary max-w-md mb-6">{description}</p>
      <div className="flex gap-3">
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
        {secondaryAction && (
          <Link href={secondaryAction.href}>
            <Button color="secondary">{secondaryAction.label}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// Pre-defined empty states
export const EMPTY_STATES: Record<string, EmptyStateConfig> = {
  dashboard_no_providers: {
    title: "Connect your first AI provider",
    description:
      "Link OpenAI, Anthropic, or another provider to start seeing your AI costs in real-time.",
    icon: "zap",
    action: { label: "Connect Provider", href: "/dashboard/settings/providers" },
    secondaryAction: { label: "Learn More", href: "/docs/getting-started" },
  },

  dashboard_syncing: {
    title: "Syncing your data...",
    description:
      "We're pulling your usage data now. This usually takes 1-2 minutes. Feel free to explore while you wait!",
    icon: "zap",
    action: { label: "Explore Features", href: "#features" },
  },

  usage_no_data: {
    title: "No usage data yet",
    description:
      "Once you connect a provider and start using AI APIs, your usage will appear here with detailed breakdowns.",
    icon: "file",
    action: { label: "Connect Provider", href: "/dashboard/settings/providers" },
  },

  budgets_empty: {
    title: "No budgets set up",
    description:
      "Create spending limits to avoid surprise bills. Get alerted when you're approaching or exceeding your budget.",
    icon: "bell",
    action: { label: "Create Budget", href: "/dashboard/budgets/new" },
    secondaryAction: { label: "Learn About Budgets", href: "/docs/budgets" },
  },

  alerts_empty: {
    title: "No alerts configured",
    description:
      "Set up alerts to get notified about unusual spending, budget thresholds, or anomalies in your AI usage.",
    icon: "bell",
    action: { label: "Create Alert", href: "/dashboard/alerts/new" },
  },

  team_empty: {
    title: "Invite your team",
    description:
      "Collaborate with your team on AI cost management. Each member can have customized access and dashboards.",
    icon: "users",
    action: { label: "Invite Members", href: "/dashboard/settings/team" },
  },

  attribution_no_sdk: {
    title: "No SDK data yet",
    description:
      "Install the TokenTra SDK to track costs by feature, team, and user. Get detailed attribution for every AI request.",
    icon: "zap",
    action: { label: "Set Up SDK", href: "/dashboard/settings/sdk" },
    secondaryAction: { label: "View Docs", href: "/docs/sdk" },
  },

  optimization_not_ready: {
    title: "Optimization insights coming soon",
    description:
      "We need at least 7 days of data to generate meaningful optimization recommendations. Check back soon!",
    icon: "chart",
    action: { label: "View Dashboard", href: "/dashboard" },
  },

  reports_empty: {
    title: "No reports yet",
    description:
      "Generate detailed cost reports for your team, finance department, or clients. Schedule automatic report delivery.",
    icon: "file",
    action: { label: "Create Report", href: "/dashboard/reports/new" },
  },
};

// Helper component for specific empty states
export function DashboardEmptyState() {
  return <EmptyState {...EMPTY_STATES.dashboard_no_providers} data-empty="dashboard" />;
}

export function BudgetsEmptyState() {
  return <EmptyState {...EMPTY_STATES.budgets_empty} data-empty="budgets" />;
}

export function AlertsEmptyState() {
  return <EmptyState {...EMPTY_STATES.alerts_empty} data-empty="alerts" />;
}

export function TeamEmptyState() {
  return <EmptyState {...EMPTY_STATES.team_empty} data-empty="team" />;
}

export function ReportsEmptyState() {
  return <EmptyState {...EMPTY_STATES.reports_empty} data-empty="reports" />;
}
