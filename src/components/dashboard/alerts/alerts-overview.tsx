"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Notification } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { AlertList } from "./alert-list";
import { AlertHistory } from "./alert-history";
import { CreateAlertDialog } from "./create-alert-dialog";
import type { AlertFormData } from "./alert-form";
import {
  useAlertRules,
  useAlertEvents,
  useCreateAlertRule,
  useToggleAlertRule,
} from "@/hooks/use-alerts";
import type { NotificationChannelType } from "@/lib/alerting/types";
import { EmptyState } from "../shared/empty-state";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

export const AlertsOverview: FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch alert rules
  const {
    data: rulesData,
    isLoading: isLoadingRules,
    error: rulesError,
  } = useAlertRules();

  // Fetch alert events
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
  } = useAlertEvents({ limit: 10 });

  // Mutations
  const createRule = useCreateAlertRule();
  const toggleRule = useToggleAlertRule();

  // Transform API data to match legacy Alert type expected by components
  const rawAlerts = (rulesData?.data || []) as unknown as Array<Record<string, unknown>>;
  const alerts = rawAlerts.map((rule) => {
    // If rule has 'config' (new API format), transform to 'condition' (legacy format)
    const config = rule.config as Record<string, unknown> | undefined;
    const existingCondition = rule.condition as Record<string, unknown> | undefined;
    
    // Build condition from either existing condition or config
    const condition = {
      metric: (existingCondition?.metric || config?.metric || "daily_cost") as string,
      operator: (existingCondition?.operator || config?.operator || "gt") as string,
      value: (existingCondition?.value ?? config?.threshold ?? config?.value ?? 0) as number,
      timeWindow: (existingCondition?.timeWindow || config?.timeWindow || undefined) as string | undefined,
    };
    
    return {
      id: rule.id as string,
      organizationId: (rule.orgId || rule.organizationId || "") as string,
      name: rule.name as string,
      type: rule.type as string,
      enabled: rule.enabled as boolean,
      condition,
      channels: (rule.channels || []) as Array<{ type: string; config: Record<string, string> }>,
      createdAt: rule.createdAt ? new Date(rule.createdAt as string) : new Date(),
      updatedAt: rule.updatedAt ? new Date(rule.updatedAt as string) : new Date(),
    };
  });
  const alertEvents = eventsData?.data || [];
  const summary = eventsData?.summary || { active: 0, critical: 0 };

  const handleToggle = (id: string, enabled: boolean) => {
    toggleRule.mutate({ alertId: id, enabled });
  };

  const handleEdit = (id: string) => {
    console.log("Editing alert:", id);
  };

  const handleCreateSubmit = (data: AlertFormData) => {
    // Build config based on alert type - cast to unknown for flexibility with form data
    const config = {
      type: data.type,
      metric: data.metric,
      operator: data.operator,
      threshold: data.value,
      timeWindow: data.timeWindow || "24h",
    } as unknown;

    // Build channels - extract type string from channel object
    const channels = data.channels.map((ch) => ({
      type: (typeof ch === "object" && ch !== null ? (ch as { type: string }).type : ch) as NotificationChannelType,
      config: { recipients: [] },
      enabled: true,
    }));

    createRule.mutate(
      {
        name: data.name,
        type: data.type,
        config,
        channels,
        enabled: data.enabled,
      } as Parameters<typeof createRule.mutate>[0],
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
        },
      }
    );
  };

  const enabledCount = alerts.filter((a: { enabled: boolean }) => a.enabled).length;
  const isLoading = isLoadingRules || isLoadingEvents;
  const isEmpty = !isLoading && alerts.length === 0;

  const AlertIcon = () => (
    <Notification size={32} color="#7F56D9" variant="Bulk" />
  );

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Alerts
          </h1>
          <p className="text-md text-tertiary">
            Configure alert rules and monitor triggered events.
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="md" iconLeading={AddIcon} onClick={() => setIsCreateDialogOpen(true)}>
            Create Alert
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsChart04
          title={String(alerts.length)}
          subtitle="Total Rules"
          change={`${enabledCount} enabled`}
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 5 }, { value: 6 }, { value: 7 }, { value: 8 }, { value: 9 }, { value: 10 }]}
          actions={false}
        />
        <MetricsChart04
          title={String(alertEvents.length)}
          subtitle="Triggered Today"
          change="events"
          changeTrend={alertEvents.length > 5 ? "negative" : "positive"}
          chartColor={alertEvents.length > 5 ? "text-fg-warning-secondary" : "text-fg-success-secondary"}
          chartData={[{ value: 2 }, { value: 3 }, { value: 4 }, { value: 3 }, { value: 5 }, { value: 4 }]}
          actions={false}
        />
        <MetricsChart04
          title={String(summary.active)}
          subtitle="Active Alerts"
          change={`${summary.critical} critical`}
          changeTrend={summary.active > 0 ? "negative" : "positive"}
          chartColor="text-fg-error-secondary"
          chartData={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 4 }, { value: 3 }]}
          actions={false}
        />
        <MetricsChart04
          title="4"
          subtitle="Channels Configured"
          change="active"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 2 }, { value: 3 }, { value: 3 }, { value: 4 }, { value: 4 }, { value: 4 }]}
          actions={false}
        />
      </div>

      {/* Main Content or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={<AlertIcon />}
          title="No alerts configured"
          description="Create your first alert rule to get notified when spending thresholds are exceeded or anomalies are detected."
          actionLabel="Create Alert"
          onAction={() => setIsCreateDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Alert Rules */}
          <div className="xl:col-span-2">
            <AlertList
              alerts={alerts as Parameters<typeof AlertList>[0]["alerts"]}
              onToggle={handleToggle}
              onEdit={handleEdit}
            />
          </div>

          {/* Recent Events */}
          <div>
            <AlertHistory events={(alertEvents as unknown as Array<Record<string, unknown>>).map((e) => ({
              id: e.id as string,
              alertId: (e.ruleId || e.alertId || e.id) as string,
              organizationId: (e.orgId || e.organizationId || "") as string,
              type: (e.type || "spend_threshold") as "spend_threshold" | "budget_threshold" | "spend_anomaly" | "forecast_exceeded" | "provider_error" | "usage_spike",
              title: e.title as string,
              message: (e.description || e.message || "") as string,
              severity: e.severity as "critical" | "warning" | "info",
              status: e.status as "active" | "acknowledged" | "resolved",
              triggeredAt: typeof e.triggeredAt === "string" ? new Date(e.triggeredAt as string) : e.triggeredAt as Date,
            }))} />
          </div>
        </div>
      )}

      {/* Create Alert Dialog */}
      <CreateAlertDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createRule.isPending}
      />
    </div>
  );
};
