"use client";

import type { FC } from "react";
import { useMemo, useState } from "react";
import {
  DollarCircle,
  Activity,
  TrendUp,
  TrendDown,
  Flash,
  Cloud,
  ArrowRight2,
  Add,
  ExportSquare,
  Cpu,
  Magicpen,
  Timer1,
} from "iconsax-react";
import type { SortDescriptor } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Table, TableCard } from "@/components/application/table/table";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { ConnectProviderDialog } from "@/components/dashboard/providers/connect-provider-dialog";
import { cx } from "@/utils/cx";

// Icon wrapper for Button component compatibility - use color="currentColor" for iconsax
const ExportIcon = ({ className }: { className?: string }) => (
  <ExportSquare size={20} color="currentColor" className={className} variant="Outline" />
);
const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <ArrowRight2 size={16} color="currentColor" className={className} variant="Outline" />
);

// Mock data for the dashboard
const statsData = [
  {
    id: "total-spend",
    title: "Total AI Spend",
    value: "$12,847.32",
    change: "+12.5%",
    trend: "up" as const,
    period: "vs last month",
    icon: DollarCircle,
  },
  {
    id: "total-tokens",
    title: "Total Tokens",
    value: "847.2M",
    change: "+8.3%",
    trend: "up" as const,
    period: "vs last month",
    icon: Activity,
  },
  {
    id: "avg-cost",
    title: "Avg Cost/Request",
    value: "$0.0023",
    change: "-5.2%",
    trend: "down" as const,
    period: "vs last month",
    icon: TrendDown,
  },
  {
    id: "savings",
    title: "Potential Savings",
    value: "$2,340",
    change: "3 recommendations",
    trend: "neutral" as const,
    period: "available",
    icon: Flash,
  },
];

const providerData = [
  { name: "OpenAI", spend: 7234.50, percentage: 56, color: "bg-fg-success-primary" },
  { name: "Anthropic", spend: 3421.80, percentage: 27, color: "bg-fg-brand-primary" },
  { name: "Google AI", spend: 1456.20, percentage: 11, color: "bg-fg-warning-primary" },
  { name: "Azure OpenAI", spend: 734.82, percentage: 6, color: "bg-fg-error-primary" },
];

const topConsumers = [
  {
    id: "team-1",
    name: "Engineering",
    type: "Team",
    spend: 4521.30,
    tokens: "312.4M",
    trend: "+15%",
    avatar: "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80",
  },
  {
    id: "team-2",
    name: "Product",
    type: "Team",
    spend: 3245.80,
    tokens: "224.1M",
    trend: "+8%",
    avatar: "https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80",
  },
  {
    id: "project-1",
    name: "AI Assistant",
    type: "Project",
    spend: 2890.45,
    tokens: "198.7M",
    trend: "+22%",
    avatar: "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80",
  },
  {
    id: "project-2",
    name: "Content Gen",
    type: "Project",
    spend: 1456.20,
    tokens: "102.3M",
    trend: "-3%",
    avatar: "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80",
  },
  {
    id: "team-3",
    name: "Marketing",
    type: "Team",
    spend: 733.57,
    tokens: "51.2M",
    trend: "+5%",
    avatar: "https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80",
  },
];

const recentAlerts = [
  {
    id: "alert-1",
    title: "Budget threshold reached",
    description: "Engineering team has used 80% of monthly budget",
    type: "warning",
    time: "2 hours ago",
  },
  {
    id: "alert-2",
    title: "Unusual spike detected",
    description: "AI Assistant project saw 3x normal usage",
    type: "error",
    time: "5 hours ago",
  },
  {
    id: "alert-3",
    title: "New optimization available",
    description: "Switch to GPT-4 Turbo to save $340/month",
    type: "success",
    time: "1 day ago",
  },
];

const recommendations = [
  {
    id: "rec-1",
    title: "Switch to GPT-4 Turbo",
    description: "Replace GPT-4 with GPT-4 Turbo for similar quality at 3x lower cost",
    savings: "$1,240/mo",
    impact: "high",
  },
  {
    id: "rec-2",
    title: "Enable response caching",
    description: "Cache repeated queries to reduce API calls by 35%",
    savings: "$780/mo",
    impact: "medium",
  },
  {
    id: "rec-3",
    title: "Optimize prompt length",
    description: "Reduce average prompt tokens by 20% with prompt compression",
    savings: "$320/mo",
    impact: "low",
  },
];

export const DashboardOverview = () => {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);

  const sortedConsumers = useMemo(() => {
    if (!sortDescriptor) return topConsumers;

    return [...topConsumers].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];

      if (typeof first === "number" && typeof second === "number") {
        return sortDescriptor.direction === "ascending" ? first - second : second - first;
      }

      if (typeof first === "string" && typeof second === "string") {
        const result = first.localeCompare(second);
        return sortDescriptor.direction === "ascending" ? result : -result;
      }

      return 0;
    });
  }, [sortDescriptor]);

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 px-4 lg:flex-row lg:items-center lg:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            AI Cost Dashboard
          </h1>
          <p className="text-md text-tertiary">
            Track, analyze, and optimize your AI spending across all providers.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md" color="secondary" iconLeading={ExportIcon}>
            Export
          </Button>
          <Button size="md" iconLeading={AddIcon} onClick={() => setIsAddProviderOpen(true)}>
            Add Provider
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:px-8">
        {statsData.map((stat, index) => (
          <div
            key={stat.id}
            className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-5 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div
                className={cx(
                  "flex size-10 items-center justify-center rounded-lg",
                  index === 0 && "bg-fg-brand-primary",
                  index === 1 && "bg-fg-success-primary",
                  index === 2 && "bg-fg-error-primary",
                  index === 3 && "bg-fg-warning-primary"
                )}
              >
                <stat.icon
                  size={20}
                  color="#ffffff"
                  variant="Bold"
                />
              </div>
              <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                {stat.trend === "up" && (
                  <TrendUp size={12} color="#17B26A" variant="Bold" />
                )}
                {stat.trend === "down" && (
                  <TrendDown size={12} color="#F04438" variant="Bold" />
                )}
                <span
                  className={cx(
                    "text-xs font-medium",
                    stat.trend === "up" && "text-success-primary",
                    stat.trend === "down" && "text-error-primary",
                    stat.trend === "neutral" && "text-tertiary"
                  )}
                >
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-tertiary">{stat.title}</span>
              <span className="text-xl font-semibold text-primary">
                {stat.value}
              </span>
              <span className="text-xs text-quaternary">{stat.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-3 lg:px-8">
        {/* Provider Breakdown */}
        <div className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-5 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Spend by Provider</h2>
            <Button size="sm" color="link-gray" iconTrailing={ArrowRightIcon}>
              View all
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {providerData.map((provider) => (
              <div key={provider.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud size={16} className="text-fg-quaternary" variant="Outline" />
                    <span className="text-sm font-medium text-primary">{provider.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    ${provider.spend.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cx("h-full rounded-full", provider.color)}
                      style={{ width: `${provider.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-tertiary">{provider.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Recommendations */}
        <div className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-primary">Optimization Opportunities</h2>
              <Badge size="sm" type="pill-color" color="success">
                ${(1240 + 780 + 320).toLocaleString()}/mo
              </Badge>
            </div>
            <Button size="sm" color="link-gray" iconTrailing={ArrowRightIcon}>
              View all
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between rounded-lg border border-secondary bg-secondary_subtle p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cx(
                      "flex size-10 items-center justify-center rounded-lg",
                      rec.impact === "high" && "bg-fg-success-primary",
                      rec.impact === "medium" && "bg-fg-warning-primary",
                      rec.impact === "low" && "bg-fg-quaternary"
                    )}
                  >
                    <Flash
                      size={22}
                      color="#ffffff"
                      variant="Bold"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary">{rec.title}</span>
                    <span className="text-sm text-tertiary">{rec.description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    size="md"
                    type="pill-color"
                    color={rec.impact === "high" ? "success" : rec.impact === "medium" ? "warning" : "gray"}
                  >
                    Save {rec.savings}
                  </Badge>
                  <Button size="sm" color="secondary">
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="flex flex-col gap-4 px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Recent Alerts</h2>
          <Button size="sm" color="link-gray" iconTrailing={ArrowRightIcon}>
            View all
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col gap-2 rounded-xl border border-secondary bg-primary p-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <BadgeWithDot
                  size="sm"
                  type="modern"
                  color={
                    alert.type === "error"
                      ? "error"
                      : alert.type === "warning"
                        ? "warning"
                        : "success"
                  }
                >
                  {alert.type === "error" ? "Critical" : alert.type === "warning" ? "Warning" : "Info"}
                </BadgeWithDot>
                <span className="text-xs text-quaternary">{alert.time}</span>
              </div>
              <h3 className="text-sm font-medium text-primary">{alert.title}</h3>
              <p className="text-sm text-tertiary">{alert.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Consumers Table */}
      <div className="flex flex-col gap-4 px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Top Consumers</h2>
          <Button size="sm" color="link-gray" iconTrailing={ArrowRightIcon}>
            View all
          </Button>
        </div>
        <TableCard.Root className="-mx-4 rounded-none lg:mx-0 lg:rounded-xl">
          <Table
            aria-label="Top consumers"
            selectionMode="none"
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
          >
            <Table.Header className="bg-primary">
              <Table.Head id="name" isRowHeader allowsSorting label="Name" className="w-full" />
              <Table.Head id="type" label="Type" />
              <Table.Head id="spend" label="Spend" allowsSorting />
              <Table.Head id="tokens" label="Tokens" />
              <Table.Head id="trend" label="Trend" />
            </Table.Header>
            <Table.Body items={sortedConsumers}>
              {(consumer) => (
                <Table.Row id={consumer.id}>
                  <Table.Cell className="lg:px-2">
                    <div className="flex items-center gap-3">
                      <Avatar src={consumer.avatar} alt={consumer.name} size="sm" />
                      <span className="text-sm font-medium text-primary">{consumer.name}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge size="sm" type="modern" color="gray">
                      {consumer.type}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm font-semibold text-primary">
                      ${consumer.spend.toLocaleString()}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-tertiary">{consumer.tokens}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-1">
                      {consumer.trend.startsWith("+") ? (
                        <TrendUp size={14} className="text-fg-success-primary" variant="Outline" />
                      ) : (
                        <TrendDown size={14} className="text-fg-error-primary" variant="Outline" />
                      )}
                      <span
                        className={cx(
                          "text-sm font-medium",
                          consumer.trend.startsWith("+")
                            ? "text-success-primary"
                            : "text-error-primary"
                        )}
                      >
                        {consumer.trend}
                      </span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
          <PaginationCardMinimal page={1} total={5} align="left" />
        </TableCard.Root>
      </div>

      {/* Add Provider Modal */}
      <ConnectProviderDialog
        open={isAddProviderOpen}
        onOpenChange={setIsAddProviderOpen}
        onConnect={(provider, credentials) => {
          console.log("Connected provider:", provider, credentials);
        }}
      />
    </>
  );
};
