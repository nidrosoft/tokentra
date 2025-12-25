"use client";

import type { FC } from "react";
import { Refresh2, Setting2, Trash, DollarCircle, Activity, Timer1 } from "iconsax-react";
import { OpenAI, Anthropic, Azure, Google, Aws } from "@lobehub/icons";
import type { ProviderType } from "@/types";
import type { ProviderWithStats } from "@/data/mock-providers";
import { Button } from "@/components/base/buttons/button";
import { ProviderStatusBadge } from "./provider-status";
import { cx } from "@/utils/cx";

export interface ProviderCardProps {
  provider: ProviderWithStats;
  onSync?: (providerId: string) => void;
  onSettings?: (providerId: string) => void;
  className?: string;
}

const providerLogos: Record<ProviderType, FC<{ size: number; className?: string }>> = {
  openai: ({ size }) => <OpenAI size={size} />,
  anthropic: ({ size }) => <Anthropic size={size} />,
  azure: ({ size }) => <Azure size={size} />,
  google: ({ size }) => <Google size={size} />,
  aws: ({ size }) => <Aws size={size} />,
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

const formatLastSync = (date?: Date): string => {
  if (!date) return "Never";
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const SyncIcon = ({ className }: { className?: string }) => (
  <Refresh2 size={16} color="currentColor" className={className} variant="Outline" />
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <Setting2 size={16} color="currentColor" className={className} variant="Outline" />
);

export const ProviderCard: FC<ProviderCardProps> = ({
  provider,
  onSync,
  onSettings,
  className,
}) => {
  const Logo = providerLogos[provider.type];
  const isConnected = provider.status === "connected";
  const hasError = provider.status === "error";

  return (
    <div
      className={cx(
        "rounded-xl border bg-primary p-6 shadow-xs transition-shadow hover:shadow-md",
        hasError ? "border-error-primary" : "border-secondary",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-secondary">
            <Logo size={28} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">{provider.name}</h3>
            <p className="text-sm text-tertiary">{provider.config.apiKeyMasked || "Not configured"}</p>
          </div>
        </div>
        <ProviderStatusBadge status={provider.status} />
      </div>

      {/* Error Message */}
      {hasError && provider.syncError && (
        <div className="mt-4 rounded-lg bg-error-secondary p-3">
          <p className="text-sm text-error-primary">{provider.syncError}</p>
        </div>
      )}

      {/* Stats */}
      {isConnected && (
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-tertiary">
              <DollarCircle size={14} color="currentColor" variant="Outline" />
              <span className="text-xs">Spend</span>
            </div>
            <span className="mt-1 text-lg font-semibold text-primary">
              {formatCurrency(provider.totalSpend)}
            </span>
            {provider.monthlyChange !== 0 && (
              <span
                className={cx(
                  "text-xs",
                  provider.monthlyChange > 0 ? "text-error-primary" : "text-success-primary"
                )}
              >
                {provider.monthlyChange > 0 ? "+" : ""}
                {provider.monthlyChange}%
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-tertiary">
              <Activity size={14} color="currentColor" variant="Outline" />
              <span className="text-xs">Tokens</span>
            </div>
            <span className="mt-1 text-lg font-semibold text-primary">
              {formatNumber(provider.totalTokens)}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-tertiary">
              <Timer1 size={14} color="currentColor" variant="Outline" />
              <span className="text-xs">Requests</span>
            </div>
            <span className="mt-1 text-lg font-semibold text-primary">
              {formatNumber(provider.totalRequests)}
            </span>
          </div>
        </div>
      )}

      {/* Models */}
      {isConnected && provider.modelsUsed.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-tertiary">Models used</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {provider.modelsUsed.slice(0, 3).map((model) => (
              <span
                key={model}
                className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary"
              >
                {model}
              </span>
            ))}
            {provider.modelsUsed.length > 3 && (
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-tertiary">
                +{provider.modelsUsed.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-secondary pt-4">
        <span className="text-xs text-quaternary">
          Last sync: {formatLastSync(provider.lastSyncAt)}
        </span>
        <div className="flex gap-2">
          {(isConnected || hasError) && (
            <Button
              size="sm"
              color="secondary"
              iconLeading={SyncIcon}
              onClick={() => onSync?.(provider.id)}
            >
              Sync
            </Button>
          )}
          <Button
            size="sm"
            color="secondary"
            iconLeading={SettingsIcon}
            onClick={() => onSettings?.(provider.id)}
          >
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
