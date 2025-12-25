"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Notification, Warning2 } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { AlertList } from "./alert-list";
import { AlertHistory } from "./alert-history";
import { CreateAlertDialog } from "./create-alert-dialog";
import type { AlertFormData } from "./alert-form";
import { mockAlerts, mockAlertEvents, mockAlertSummary } from "@/data/mock-alerts";
import type { Alert } from "@/types";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

export const AlertsOverview: FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleToggle = (id: string, enabled: boolean) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled } : a))
    );
  };

  const handleEdit = (id: string) => {
    console.log("Editing alert:", id);
  };

  const handleCreateSubmit = (data: AlertFormData) => {
    setIsCreating(true);
    // Simulate API call
    setTimeout(() => {
      const newAlert: Alert = {
        id: `alert_${Date.now()}`,
        organizationId: "org_1",
        name: data.name,
        type: data.type,
        condition: {
          metric: data.metric,
          operator: data.operator,
          value: data.value,
          timeWindow: data.timeWindow || undefined,
        },
        channels: data.channels,
        enabled: data.enabled,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAlerts((prev) => [newAlert, ...prev]);
      setIsCreating(false);
      setIsCreateDialogOpen(false);
    }, 1000);
  };

  const enabledCount = alerts.filter((a) => a.enabled).length;

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
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Total Rules</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{alerts.length}</p>
          <p className="mt-1 text-xs text-quaternary">{enabledCount} enabled</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Triggered Today</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{mockAlertSummary.triggeredToday}</p>
          <p className="mt-1 text-xs text-quaternary">alert events</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Active Alerts</p>
          <div className="mt-1 flex items-center gap-2">
            <Warning2 size={20} color="#F04438" variant="Bold" />
            <span className="text-2xl font-semibold text-error-primary">{mockAlertSummary.activeEvents}</span>
          </div>
          <p className="mt-1 text-xs text-quaternary">{mockAlertSummary.criticalEvents} critical</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Channels Configured</p>
          <div className="mt-1 flex items-center gap-2">
            <Notification size={20} color="#7F56D9" variant="Bold" />
            <span className="text-2xl font-semibold text-primary">4</span>
          </div>
          <p className="mt-1 text-xs text-quaternary">Email, Slack, PagerDuty, Webhook</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Alert Rules */}
        <div className="xl:col-span-2">
          <AlertList
            alerts={alerts}
            onToggle={handleToggle}
            onEdit={handleEdit}
          />
        </div>

        {/* Recent Events */}
        <div>
          <AlertHistory events={mockAlertEvents} />
        </div>
      </div>

      {/* Create Alert Dialog */}
      <CreateAlertDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
      />
    </div>
  );
};
