"use client";

import type { FC } from "react";
import { useState, useEffect, useCallback } from "react";
import { Add, Refresh2, TickCircle, Cloud } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { MetricsChart04 } from "@/components/application/metrics/metrics";
import { ProviderList } from "./provider-list";
import { ConnectProviderDialog } from "./connect-provider-dialog";
import { cx } from "@/utils/cx";
import { useProviders, useSyncProvider, useSyncAllProviders } from "@/hooks/use-providers";
import { EmptyState } from "../shared/empty-state";

// Demo organization ID for development
const DEMO_ORG_ID = "b1c2d3e4-f5a6-7890-bcde-f12345678901";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

type SyncAllStatus = "idle" | "syncing" | "success";

export const ProvidersOverview: FC = () => {
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [syncAllStatus, setSyncAllStatus] = useState<SyncAllStatus>("idle");
  const [syncingProviders, setSyncingProviders] = useState<Set<string>>(new Set());

  // Use demo org ID for now (will be replaced with auth context)
  const orgId = DEMO_ORG_ID;

  // Fetch providers from API
  const { data: providersResponse, isLoading, refetch } = useProviders(orgId);
  const syncProviderMutation = useSyncProvider();
  const syncAllMutation = useSyncAllProviders();

  // Extract providers and summary from response
  const providers = providersResponse?.data || [];
  const summary = providersResponse?.summary;

  // Calculate stats
  const connectedCount = summary?.connectedCount ?? providers.filter((p) => p.status === "connected").length;
  const totalProviders = summary?.totalConnections ?? providers.length;
  const syncableProviders = providers.filter((p) => p.status === "connected" || p.status === "error");
  const isEmpty = !isLoading && providers.length === 0;

  const ProviderIcon = () => (
    <Cloud size={32} color="#7F56D9" variant="Bulk" />
  );

  // Reset sync all status after success
  useEffect(() => {
    if (syncAllStatus === "success") {
      const timer = setTimeout(() => setSyncAllStatus("idle"), 2500);
      return () => clearTimeout(timer);
    }
  }, [syncAllStatus]);

  const handleSync = useCallback(async (providerId: string) => {
    setSyncingProviders((prev) => new Set(prev).add(providerId));
    
    try {
      await syncProviderMutation.mutateAsync({ providerId });
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncingProviders((prev) => {
        const next = new Set(prev);
        next.delete(providerId);
        return next;
      });
    }
  }, [syncProviderMutation]);

  const handleSettings = (providerId: string) => {
    window.location.href = `/dashboard/providers/${providerId}/settings`;
  };

  const handleSyncAll = async () => {
    if (syncAllStatus === "syncing" || !orgId) return;
    
    setSyncAllStatus("syncing");
    
    // Mark all syncable providers as syncing
    syncableProviders.forEach((p) => {
      setSyncingProviders((prev) => new Set(prev).add(p.id));
    });
    
    try {
      await syncAllMutation.mutateAsync(orgId);
      setSyncAllStatus("success");
      refetch();
    } catch (error) {
      console.error("Sync all failed:", error);
      setSyncAllStatus("idle");
    } finally {
      setSyncingProviders(new Set());
    }
  };

  const getSyncAllButtonContent = () => {
    switch (syncAllStatus) {
      case "syncing":
        return {
          icon: ({ className }: { className?: string }) => (
            <Refresh2 size={20} color="currentColor" className={cx(className, "animate-spin")} variant="Outline" />
          ),
          text: "Syncing All...",
        };
      case "success":
        return {
          icon: ({ className }: { className?: string }) => (
            <TickCircle size={20} color="#12B76A" className={className} variant="Bold" />
          ),
          text: "All Synced!",
        };
      default:
        return {
          icon: ({ className }: { className?: string }) => (
            <Refresh2 size={20} color="currentColor" className={className} variant="Outline" />
          ),
          text: "Sync All",
        };
    }
  };

  const syncAllButton = getSyncAllButtonContent();

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
            Providers
          </h1>
          <p className="text-md text-tertiary">
            Manage your AI provider connections and monitor their status.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            size="md" 
            color="secondary" 
            iconLeading={syncAllButton.icon} 
            onClick={handleSyncAll}
            isDisabled={syncAllStatus === "syncing"}
            className={cx(syncAllStatus === "success" && "text-success-primary")}
          >
            {syncAllButton.text}
          </Button>
          <Button size="md" iconLeading={AddIcon} onClick={() => setIsAddProviderOpen(true)}>
            Add Provider
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricsChart04
          title={String(connectedCount)}
          subtitle="Connected Providers"
          change={`${totalProviders} total`}
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 2 }, { value: 3 }, { value: 3 }, { value: 4 }, { value: 4 }, { value: connectedCount }]}
          actions={false}
        />
        <MetricsChart04
          title={`$${(summary?.totalCostToday || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle="Total Cost Today"
          change={`${summary?.totalSyncsToday || 0} syncs`}
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 8 }, { value: 10 }, { value: 12 }, { value: 11 }, { value: 14 }, { value: 15 }]}
          actions={false}
        />
        <MetricsChart04
          title="5"
          subtitle="Available Providers"
          change="integrated"
          changeTrend="positive"
          chartColor="text-fg-success-secondary"
          chartData={[{ value: 3 }, { value: 4 }, { value: 4 }, { value: 5 }, { value: 5 }, { value: 5 }]}
          actions={false}
        />
      </div>

      {/* Provider List or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={<ProviderIcon />}
          title="No providers connected"
          description="Connect your first AI provider to start tracking costs and usage across OpenAI, Anthropic, Google, and more."
          actionLabel="Add Provider"
          onAction={() => setIsAddProviderOpen(true)}
        />
      ) : (
        <ProviderList
          providers={providers}
          onSync={handleSync}
          onSettings={handleSettings}
          syncingProviders={syncingProviders}
          isLoading={isLoading}
        />
      )}

      {/* Connect Provider Dialog */}
      <ConnectProviderDialog
        open={isAddProviderOpen}
        onOpenChange={setIsAddProviderOpen}
      />
    </div>
  );
};
