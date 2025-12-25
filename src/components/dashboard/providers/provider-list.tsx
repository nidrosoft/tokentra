"use client";

import type { FC } from "react";
import type { ProviderWithStats } from "@/data/mock-providers";
import { ProviderCard } from "./provider-card";
import { cx } from "@/utils/cx";

export interface ProviderListProps {
  providers: ProviderWithStats[];
  onSync?: (providerId: string) => void;
  onSettings?: (providerId: string) => void;
  className?: string;
}

export const ProviderList: FC<ProviderListProps> = ({
  providers,
  onSync,
  onSettings,
  className,
}) => {
  const connectedProviders = providers.filter((p) => p.status === "connected");
  const otherProviders = providers.filter((p) => p.status !== "connected");

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
