"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Refresh2 } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { ProviderList } from "./provider-list";
import { ConnectProviderDialog } from "./connect-provider-dialog";
import { mockProviders } from "@/data/mock-providers";

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

const SyncAllIcon = ({ className }: { className?: string }) => (
  <Refresh2 size={20} color="currentColor" className={className} variant="Outline" />
);

export const ProvidersOverview: FC = () => {
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);

  const connectedCount = mockProviders.filter((p) => p.status === "connected").length;
  const totalSpend = mockProviders.reduce((sum, p) => sum + p.totalSpend, 0);

  const handleSync = (providerId: string) => {
    console.log("Syncing provider:", providerId);
  };

  const handleSettings = (providerId: string) => {
    console.log("Opening settings for:", providerId);
  };

  const handleSyncAll = () => {
    console.log("Syncing all providers");
  };

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
          <Button size="md" color="secondary" iconLeading={SyncAllIcon} onClick={handleSyncAll}>
            Sync All
          </Button>
          <Button size="md" iconLeading={AddIcon} onClick={() => setIsAddProviderOpen(true)}>
            Add Provider
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Connected Providers</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{connectedCount}</p>
          <p className="mt-1 text-xs text-quaternary">of {mockProviders.length} configured</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Total Monthly Spend</p>
          <p className="mt-1 text-2xl font-semibold text-primary">
            ${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-quaternary">across all providers</p>
        </div>
        <div className="rounded-xl border border-secondary bg-primary p-5 shadow-xs">
          <p className="text-sm font-medium text-tertiary">Available Providers</p>
          <p className="mt-1 text-2xl font-semibold text-primary">5</p>
          <p className="mt-1 text-xs text-quaternary">OpenAI, Anthropic, Google, Azure, AWS</p>
        </div>
      </div>

      {/* Provider List */}
      <ProviderList
        providers={mockProviders}
        onSync={handleSync}
        onSettings={handleSettings}
      />

      {/* Connect Provider Dialog */}
      <ConnectProviderDialog
        open={isAddProviderOpen}
        onOpenChange={setIsAddProviderOpen}
      />
    </div>
  );
};
