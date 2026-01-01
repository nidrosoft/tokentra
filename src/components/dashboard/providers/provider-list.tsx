"use client";

import type { FC } from "react";
import type { ProviderConnection } from "@/hooks/use-providers";
import { ProviderCard } from "./provider-card";
import { cx } from "@/utils/cx";

export interface ProviderListProps {
  providers: ProviderConnection[];
  onSync?: (providerId: string) => void;
  onSettings?: (providerId: string) => void;
  syncingProviders?: Set<string>;
  isLoading?: boolean;
  className?: string;
}

export const ProviderList: FC<ProviderListProps> = ({
  providers,
  onSync,
  onSettings,
  syncingProviders,
  isLoading,
  className,
}) => {
  const connectedProviders = providers.filter((p) => p.status === "connected");
  const otherProviders = providers.filter((p) => p.status !== "connected");

  if (isLoading) {
    return (
      <div className={cx("space-y-6", className)}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("space-y-6", className)}>
      {/* Connected Providers */}
      {connectedProviders.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-medium text-tertiary">
            Connected Providers ({connectedProviders.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {connectedProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onSync={onSync}
                onSettings={onSettings}
                isSyncingExternal={syncingProviders?.has(provider.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Providers (Error, Disconnected, Syncing) */}
      {otherProviders.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-medium text-tertiary">
            Other Providers ({otherProviders.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {otherProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onSync={onSync}
                onSettings={onSettings}
                isSyncingExternal={syncingProviders?.has(provider.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {providers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary py-16">
          <p className="text-lg font-medium text-secondary">No providers connected</p>
          <p className="mt-1 text-sm text-tertiary">
            Connect your first AI provider to start tracking costs
          </p>
        </div>
      )}
    </div>
  );
};
