"use client";

import type { FC } from "react";
import { useMemo, useState } from "react";
import { useDashboardData, formatCurrency, formatTokens, formatChange } from "@/hooks/use-dashboard-data";
import Link from "next/link";
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
  Chart,
} from "iconsax-react";
import { EmptyState } from "../shared/empty-state";
import type { SortDescriptor } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Table, TableCard } from "@/components/application/table/table";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { ConnectProviderDialog } from "@/components/dashboard/providers/connect-provider-dialog";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useToastNotification } from "@/components/feedback/toast-notifications";
import { ProvidersSlideout } from "./providers-slideout";
import { TopConsumersSlideout } from "./top-consumers-slideout";
import { OptimizationSlideout } from "./optimization-slideout";
import { cx } from "@/utils/cx";

// Helper to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

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
  { name: "OpenAI", spend: 7234.50, percentage: 56, color: "bg-fg-success-primary", requests: 245000, tokens: "523.4M", trend: "+15%", status: "connected" as const },
  { name: "Anthropic", spend: 3421.80, percentage: 27, color: "bg-fg-brand-primary", requests: 98000, tokens: "198.2M", trend: "+8%", status: "connected" as const },
  { name: "Google AI", spend: 1456.20, percentage: 11, color: "bg-fg-warning-primary", requests: 45000, tokens: "89.1M", trend: "-3%", status: "connected" as const },
  { name: "Azure OpenAI", spend: 734.82, percentage: 6, color: "bg-fg-error-primary", requests: 18000, tokens: "36.5M", trend: "+22%", status: "connected" as const },
];

const topConsumers = [
  {
    id: "team-1",
    name: "Engineering",
    type: "Team" as const,
    spend: 4521.30,
    tokens: "312.4M",
    trend: "+15%",
    avatar: "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80",
    requests: 156000,
    avgCostPerRequest: "$0.029",
  },
  {
    id: "team-2",
    name: "Product",
    type: "Team" as const,
    spend: 3245.80,
    tokens: "224.1M",
    trend: "+8%",
    avatar: "https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80",
    requests: 112000,
    avgCostPerRequest: "$0.029",
  },
  {
    id: "project-1",
    name: "AI Assistant",
    type: "Project" as const,
    spend: 2890.45,
    tokens: "198.7M",
    trend: "+22%",
    avatar: "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80",
    requests: 89000,
    avgCostPerRequest: "$0.032",
  },
  {
    id: "project-2",
    name: "Content Gen",
    type: "Project" as const,
    spend: 1456.20,
    tokens: "102.3M",
    trend: "-3%",
    avatar: "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80",
    requests: 45000,
    avgCostPerRequest: "$0.032",
  },
  {
    id: "team-3",
    name: "Marketing",
    type: "Team" as const,
    spend: 733.57,
    tokens: "51.2M",
    trend: "+5%",
    avatar: "https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80",
    requests: 28000,
    avgCostPerRequest: "$0.026",
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
    impact: "high" as const,
    category: "Model Switch",
    effort: "easy" as const,
    status: "pending" as const,
  },
  {
    id: "rec-2",
    title: "Enable response caching",
    description: "Cache repeated queries to reduce API calls by 35%",
    savings: "$780/mo",
    impact: "medium" as const,
    category: "Caching",
    effort: "moderate" as const,
    status: "pending" as const,
  },
  {
    id: "rec-3",
    title: "Optimize prompt length",
    description: "Reduce average prompt tokens by 20% with prompt compression",
    savings: "$320/mo",
    impact: "low" as const,
    category: "Prompt Optimization",
    effort: "complex" as const,
    status: "pending" as const,
  },
  {
    id: "rec-4",
    title: "Batch similar requests",
    description: "Group similar API calls to reduce overhead and improve throughput",
    savings: "$450/mo",
    impact: "medium" as const,
    category: "Batching",
    effort: "moderate" as const,
    status: "pending" as const,
  },
  {
    id: "rec-5",
    title: "Use Claude Haiku for classification",
    description: "Route simple classification tasks to cheaper Claude Haiku model",
    savings: "$890/mo",
    impact: "high" as const,
    category: "Model Routing",
    effort: "easy" as const,
    status: "pending" as const,
  },
];

export const DashboardOverview = () => {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [isProvidersSlideoutOpen, setIsProvidersSlideoutOpen] = useState(false);
  const [isConsumersSlideoutOpen, setIsConsumersSlideoutOpen] = useState(false);
  const [isOptimizationSlideoutOpen, setIsOptimizationSlideoutOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  
  // Toast notifications
  const { showToast } = useToastNotification();

  // Fetch real data from API
  const { data: dashboardData, isLoading, error } = useDashboardData();

  // Use real data if available, otherwise fall back to mock data
  const stats = dashboardData?.stats;
  const realProviders = dashboardData?.providers || [];
  const realConsumers = dashboardData?.consumers || [];
  const realAlerts = dashboardData?.alerts || [];
  const realRecommendations = dashboardData?.recommendations || [];

  // Check if this is a new user with no data
  const hasNoData = !isLoading && !error && (!stats || (stats.totalSpend === 0 && stats.totalTokens === 0 && stats.totalRequests === 0));

  const DashboardIcon = () => (
    <Chart size={32} color="#7F56D9" variant="Bulk" />
  );

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

  // Show empty state for new users with no data
  if (hasNoData) {
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
            <Button size="md" iconLeading={AddIcon} onClick={() => setIsAddProviderOpen(true)}>
              Add Provider
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="px-4 lg:px-8">
          <EmptyState
            icon={<DashboardIcon />}
            title="Welcome to TokenTRA"
            description="Connect your first AI provider to start tracking costs, usage, and get optimization recommendations. We support OpenAI, Anthropic, Google, Azure, AWS Bedrock, and more."
            actionLabel="Connect Provider"
            onAction={() => setIsAddProviderOpen(true)}
          />
        </div>

        {/* Add Provider Modal */}
        <ConnectProviderDialog
          open={isAddProviderOpen}
          onOpenChange={setIsAddProviderOpen}
          onConnect={(provider, credentials) => {
            // Provider connection handled by dialog - refresh page to show new provider
            window.location.reload();
          }}
        />
      </>
    );
  }

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
        <MetricsChart04
          title={stats ? formatCurrency(stats.totalSpend) : "$12,847.32"}
          subtitle="Total AI Spend"
          change={stats ? formatChange(stats.spendChange) : "+12.5%"}
          changeTrend={stats && stats.spendChange >= 0 ? "positive" : "negative"}
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 8 }, { value: 12 }, { value: 10 }, { value: 15 }, { value: 14 }, { value: 18 }]}
          actions={false}
        />
        <MetricsChart04
          title={stats ? formatTokens(stats.totalTokens) : "847.2M"}
          subtitle="Total Tokens"
          change={stats ? formatChange(stats.tokensChange) : "+8.3%"}
          changeTrend={stats && stats.tokensChange >= 0 ? "positive" : "negative"}
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 5 }, { value: 8 }, { value: 7 }, { value: 12 }, { value: 10 }, { value: 14 }]}
          actions={false}
        />
        <MetricsChart04
          title={stats ? `$${stats.avgCostPerRequest.toFixed(4)}` : "$0.0023"}
          subtitle="Avg Cost/Request"
          change="-5.2%"
          changeTrend="negative"
          chartColor="text-fg-error-secondary"
          chartData={[{ value: 15 }, { value: 12 }, { value: 14 }, { value: 10 }, { value: 11 }, { value: 8 }]}
          actions={false}
        />
        <MetricsChart04
          title={stats ? formatCurrency(stats.potentialSavings) : "$2,340"}
          subtitle="Potential Savings"
          change={stats ? `${stats.pendingRecommendations} tips` : "3 tips"}
          changeTrend="positive"
          chartColor="text-fg-warning-secondary"
          chartData={[{ value: 3 }, { value: 5 }, { value: 8 }, { value: 6 }, { value: 10 }, { value: 12 }]}
          actions={false}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 px-4 lg:grid-cols-3 lg:px-8">
        {/* Provider Breakdown */}
        <div className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-5 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Spend by Provider</h2>
            <Button size="sm" color="link-gray" iconTrailing={ArrowRightIcon} onClick={() => setIsProvidersSlideoutOpen(true)}>
              View all
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {(realProviders.length > 0 ? realProviders : providerData).map((provider, index) => {
              const providerColors = ["bg-fg-success-primary", "bg-fg-brand-primary", "bg-fg-warning-primary", "bg-fg-error-primary"];
              const color = providerColors[index % providerColors.length];
              const name = 'provider' in provider ? provider.provider : provider.name;
              const spend = provider.spend;
              const percentage = provider.percentage;
              
              return (
                <div key={name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud size={16} className="text-fg-quaternary" variant="Outline" />
                      <span className="text-sm font-medium text-primary capitalize">{name}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      ${spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cx("h-full rounded-full", color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-tertiary">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optimization Recommendations */}
        <div className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-primary">Optimization Opportunities</h2>
              <Badge size="sm" type="pill-color" color="success">
                ${realRecommendations.length > 0 
                  ? realRecommendations.reduce((sum, r) => sum + r.estimatedSavings, 0).toLocaleString()
                  : (1240 + 780 + 320 + 450 + 890).toLocaleString()}/mo
              </Badge>
              {realRecommendations.length === 0 && (
                <Badge size="sm" type="pill-color" color="gray">Demo Data</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                color={isAnalyzing ? "secondary" : "secondary"}
                disabled={isAnalyzing}
                onClick={async () => {
                  setIsAnalyzing(true);
                  try {
                    const response = await fetch('/api/v1/optimization/analyze', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ days: 30 }),
                    });
                    const data = await response.json();
                    if (data.success) {
                      const count = data.data.recommendationsGenerated;
                      const savings = data.data.summary.potentialSavings;
                      if (count > 0) {
                        showToast(
                          'success',
                          'Analysis Complete',
                          `${count} recommendation${count > 1 ? 's' : ''} generated. Potential savings: $${savings.toLocaleString()}/mo`
                        );
                      } else {
                        showToast(
                          'info',
                          'Analysis Complete',
                          'No new recommendations found. Your usage is already optimized!'
                        );
                      }
                      window.location.reload();
                    } else {
                      showToast('error', 'Analysis Failed', data.error || 'Unknown error occurred');
                    }
                  } catch (error) {
                    console.error('Analysis failed:', error);
                    showToast('error', 'Analysis Failed', 'Failed to run analysis. Please try again.');
                  } finally {
                    setIsAnalyzing(false);
                  }
                }}
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <LoadingIndicator type="line-simple" size="sm" />
                    Analyzing...
                  </span>
                ) : (
                  'Run Analysis'
                )}
              </Button>
              <Button size="sm" color="link-gray" iconTrailing={ArrowRightIcon} onClick={() => setIsOptimizationSlideoutOpen(true)}>
                View all
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {(realRecommendations.length > 0 ? realRecommendations : recommendations).slice(0, 3).map((rec) => {
              const isRealRec = 'estimatedSavings' in rec;
              const savingsNum = isRealRec ? Number(rec.estimatedSavings) : 0;
              const savingsDisplay = isRealRec ? `$${savingsNum.toLocaleString()}/mo` : (rec as typeof recommendations[0]).savings;
              const impactLevel = isRealRec 
                ? (savingsNum > 200 ? "high" : savingsNum > 100 ? "medium" : "low")
                : (rec as typeof recommendations[0]).impact;
              
              const handleApply = async () => {
                if (!isRealRec) {
                  showToast(
                    'info',
                    'Run Analysis First',
                    'Click "Run Analysis" to generate recommendations based on your usage data.'
                  );
                  return;
                }
                setIsApplying(rec.id);
                try {
                  const response = await fetch(`/api/v1/optimization/${rec.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'apply' }),
                  });
                  if (response.ok) {
                    showToast(
                      'success',
                      'Recommendation Applied',
                      `"${rec.title}" has been applied. A routing rule has been created.`
                    );
                    window.location.reload();
                  } else {
                    const data = await response.json();
                    showToast('error', 'Failed to Apply', data.error || 'Unknown error occurred');
                  }
                } catch (error) {
                  console.error('Failed to apply recommendation:', error);
                  showToast('error', 'Failed to Apply', 'An error occurred. Please try again.');
                } finally {
                  setIsApplying(null);
                }
              };
              
              return (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-lg border border-secondary bg-secondary_subtle p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cx(
                        "flex size-10 items-center justify-center rounded-lg",
                        impactLevel === "high" ? "bg-utility-success-50" :
                        impactLevel === "medium" ? "bg-utility-warning-50" :
                        "bg-utility-gray-100"
                      )}
                    >
                      <Flash
                        size={22}
                        color={
                          impactLevel === "high" ? "#12B76A" :
                          impactLevel === "medium" ? "#F79009" :
                          "#667085"
                        }
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
                      color={impactLevel === "high" ? "success" : impactLevel === "medium" ? "warning" : "gray"}
                    >
                      Save {savingsDisplay}
                    </Badge>
                    <Button 
                      size="sm" 
                      color={isApplying === rec.id ? "secondary" : "secondary"} 
                      disabled={isApplying === rec.id}
                      onClick={handleApply}
                    >
                      {isApplying === rec.id ? (
                        <span className="flex items-center gap-2">
                          <LoadingIndicator type="line-simple" size="sm" />
                          Applying...
                        </span>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="flex flex-col gap-4 px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Recent Alerts</h2>
          <Link href="/dashboard/alerts">
            <Button size="sm" color="link-gray" iconTrailing={ArrowRightIcon}>
              View all
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(realAlerts.length > 0 ? realAlerts : recentAlerts).map((alert) => {
            const isRealAlert = 'severity' in alert;
            const severity = isRealAlert ? alert.severity : (alert as typeof recentAlerts[0]).type;
            const description = isRealAlert ? alert.message : (alert as typeof recentAlerts[0]).description;
            const time = isRealAlert 
              ? formatTimeAgo(alert.triggeredAt)
              : (alert as typeof recentAlerts[0]).time;
            
            return (
              <div
                key={alert.id}
                className="flex flex-col gap-2 rounded-xl border border-secondary bg-primary p-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <BadgeWithDot
                    size="sm"
                    type="modern"
                    color={
                      severity === "critical" || severity === "error"
                        ? "error"
                        : severity === "warning"
                          ? "warning"
                          : "success"
                    }
                  >
                    {severity === "critical" || severity === "error" ? "Critical" : severity === "warning" ? "Warning" : "Info"}
                  </BadgeWithDot>
                  <span className="text-xs text-quaternary">{time}</span>
                </div>
                <h3 className="text-sm font-medium text-primary">{alert.title}</h3>
                <p className="text-sm text-tertiary">{description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Consumers Table */}
      <div className="flex flex-col gap-4 px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Top Consumers</h2>
          <Button size="sm" color="link-gray" iconTrailing={ArrowRightIcon} onClick={() => setIsConsumersSlideoutOpen(true)}>
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
            <Table.Body items={realConsumers.length > 0 ? realConsumers as unknown as typeof sortedConsumers : sortedConsumers}>
              {(consumer) => {
                const consumerAny = consumer as unknown as Record<string, unknown>;
                const isRealConsumer = typeof consumerAny.tokens === 'number';
                const tokensValue = isRealConsumer ? Number(consumerAny.tokens) : 0;
                const trendValue = isRealConsumer ? Number(consumerAny.trend) : 0;
                const tokens = isRealConsumer ? formatTokens(tokensValue) : String(consumerAny.tokens);
                const trend = isRealConsumer ? formatChange(trendValue) : String(consumerAny.trend);
                const trendPositive = isRealConsumer ? trendValue >= 0 : String(consumerAny.trend).startsWith("+");
                const avatar = isRealConsumer ? undefined : String(consumerAny.avatar);
                const type = String(consumerAny.type).charAt(0).toUpperCase() + String(consumerAny.type).slice(1);
                
                return (
                  <Table.Row id={consumer.id}>
                    <Table.Cell className="lg:px-2">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <Avatar src={avatar} alt={consumer.name} size="sm" />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-full bg-utility-brand-50 text-sm font-medium text-brand-primary">
                            {consumer.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-primary">{consumer.name}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge size="sm" type="modern" color="gray">
                        {type}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm font-semibold text-primary">
                        ${consumer.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-tertiary">{tokens}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        {trendPositive ? (
                          <TrendUp size={14} className="text-fg-success-primary" variant="Outline" />
                        ) : (
                          <TrendDown size={14} className="text-fg-error-primary" variant="Outline" />
                        )}
                        <span
                          className={cx(
                            "text-sm font-medium",
                            trendPositive
                              ? "text-success-primary"
                              : "text-error-primary"
                          )}
                        >
                          {trend}
                        </span>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              }}
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
          // Provider connection handled by dialog - refresh page to show new provider
          window.location.reload();
        }}
      />

      {/* Slideout Panels */}
      <ProvidersSlideout
        isOpen={isProvidersSlideoutOpen}
        onOpenChange={setIsProvidersSlideoutOpen}
        providers={providerData}
      />

      <TopConsumersSlideout
        isOpen={isConsumersSlideoutOpen}
        onOpenChange={setIsConsumersSlideoutOpen}
        consumers={topConsumers}
      />

      <OptimizationSlideout
        isOpen={isOptimizationSlideoutOpen}
        onOpenChange={setIsOptimizationSlideoutOpen}
        recommendations={recommendations}
        onApply={(id) => {
          // TODO: Implement recommendation apply API call
        }}
        onDismiss={(id) => {
          // TODO: Implement recommendation dismiss API call
        }}
      />
    </>
  );
};
