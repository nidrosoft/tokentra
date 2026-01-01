"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { Refresh2, Setting2, TickCircle, DollarCircle, Activity, Timer1 } from "iconsax-react";
import { OpenAI, Anthropic, Azure, Google, Aws, Mistral, Cohere, DeepSeek, Groq } from "@lobehub/icons";
import { Flash } from "iconsax-react"; // For xAI (Grok)
import type { ProviderConnection } from "@/hooks/use-providers";
import type { ProviderType } from "@/lib/provider-sync/types";
import { Button } from "@/components/base/buttons/button";
import { ProviderStatusBadge } from "./provider-status";
import { ProviderSettingsSlideout } from "./provider-settings-slideout";
import { cx } from "@/utils/cx";

export interface ProviderCardProps {
  provider: ProviderConnection;
  onSync?: (providerId: string) => void;
  onSettings?: (providerId: string) => void;
  isSyncingExternal?: boolean;
  className?: string;
}

const providerLogos: Record<ProviderType, FC<{ size: number; className?: string }>> = {
  openai: ({ size }) => <OpenAI size={size} />,
  anthropic: ({ size }) => <Anthropic size={size} />,
  azure: ({ size }) => <Azure size={size} />,
  google: ({ size }) => <Google size={size} />,
  aws: ({ size }) => <Aws size={size} />,
  xai: ({ size }) => <Flash size={size} color="#1DA1F2" variant="Bold" />,
  deepseek: ({ size }) => <DeepSeek size={size} />,
  mistral: ({ size }) => <Mistral size={size} />,
  cohere: ({ size }) => <Cohere size={size} />,
  groq: ({ size }) => <Groq size={size} />,
};

const providerNames: Record<ProviderType, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  azure: "Azure OpenAI",
  google: "Google AI",
  aws: "AWS Bedrock",
  xai: "xAI (Grok)",
  deepseek: "DeepSeek",
  mistral: "Mistral AI",
  cohere: "Cohere",
  groq: "Groq",
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

const formatLastSync = (date?: string | Date): string => {
  if (!date) return "Never";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
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

type SyncStatus = "idle" | "syncing" | "success" | "error";

export const ProviderCard: FC<ProviderCardProps> = ({
  provider,
  onSync,
  onSettings,
  isSyncingExternal,
  className,
}) => {
  const Logo = providerLogos[provider.provider];
  const providerName = provider.displayName || providerNames[provider.provider];
  const isConnected = provider.status === "connected";
  const hasError = provider.status === "error";
  const isDisconnected = provider.status === "disconnected" || provider.status === "pending";
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handle external sync trigger (from Sync All button)
  useEffect(() => {
    if (isSyncingExternal && syncStatus === "idle") {
      setSyncStatus("syncing");
    } else if (!isSyncingExternal && syncStatus === "syncing") {
      setSyncStatus("success");
    }
  }, [isSyncingExternal, syncStatus]);

  // Reset sync status after success/error
  useEffect(() => {
    if (syncStatus === "success" || syncStatus === "error") {
      const timer = setTimeout(() => setSyncStatus("idle"), 2500);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const handleSync = async () => {
    setSyncStatus("syncing");
    
    // Simulate sync - in real app this would call the API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Simulate success (90% chance) or error
    const success = Math.random() > 0.1;
    setSyncStatus(success ? "success" : "error");
    
    onSync?.(provider.id);
  };

  const handleSettings = () => {
    setIsSettingsOpen(true);
    onSettings?.(provider.id);
  };

  const getSyncButtonContent = () => {
    switch (syncStatus) {
      case "syncing":
        return {
          icon: ({ className }: { className?: string }) => (
            <Refresh2 size={16} color="currentColor" className={cx(className, "animate-spin")} variant="Outline" />
          ),
          text: "Syncing...",
        };
      case "success":
        return {
          icon: ({ className }: { className?: string }) => (
            <TickCircle size={16} color="#12B76A" className={className} variant="Bold" />
          ),
          text: "Synced!",
        };
      case "error":
        return {
          icon: ({ className }: { className?: string }) => (
            <Refresh2 size={16} color="#F04438" className={className} variant="Outline" />
          ),
          text: "Retry",
        };
      default:
        return {
          icon: SyncIcon,
          text: "Sync",
        };
    }
  };

  const syncButton = getSyncButtonContent();

  return (
    <>
    <div
      className={cx(
        "rounded-xl border border-secondary bg-primary p-6 shadow-xs transition-shadow hover:shadow-md",
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
            <h3 className="text-lg font-semibold text-primary">{providerName}</h3>
            <p className="text-sm text-tertiary">{provider.provider}</p>
          </div>
        </div>
        <ProviderStatusBadge status={provider.status as "connected" | "disconnected" | "error" | "syncing"} />
      </div>

      {/* Error Message */}
      {hasError && provider.lastError && (
        <div className="mt-4 rounded-lg bg-error-secondary p-3">
          <p className="text-sm text-error-primary">{provider.lastError}</p>
        </div>
      )}

      {/* Stats - Show sync info for connected providers */}
      {isConnected && (
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-tertiary">
              <DollarCircle size={14} color="currentColor" variant="Outline" />
              <span className="text-xs">Status</span>
            </div>
            <span className="mt-1 text-lg font-semibold text-primary capitalize">
              {provider.status}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-tertiary">
              <Activity size={14} color="currentColor" variant="Outline" />
              <span className="text-xs">Records</span>
            </div>
            <span className="mt-1 text-lg font-semibold text-primary">
              {formatNumber(provider.lastSyncRecords || 0)}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-tertiary">
              <Timer1 size={14} color="currentColor" variant="Outline" />
              <span className="text-xs">Failures</span>
            </div>
            <span className="mt-1 text-lg font-semibold text-primary">
              {provider.consecutiveFailures}
            </span>
          </div>
        </div>
      )}

      {/* Sync Settings Info */}
      {isConnected && provider.settings && (
        <div className="mt-4">
          <p className="text-xs text-tertiary">Sync settings</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary">
              Every {provider.settings.syncInterval || 5}m
            </span>
            {provider.settings.enableRealtime && (
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary">
                Realtime
              </span>
            )}
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary">
              {provider.settings.backfillDays || 30}d backfill
            </span>
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
              color={syncStatus === "success" ? "secondary" : syncStatus === "error" ? "secondary" : "secondary"}
              iconLeading={syncButton.icon}
              onClick={handleSync}
              isDisabled={syncStatus === "syncing"}
              className={cx(
                syncStatus === "success" && "text-success-primary",
                syncStatus === "error" && "text-error-primary"
              )}
            >
              {syncButton.text}
            </Button>
          )}
          <Button
            size="sm"
            color="secondary"
            iconLeading={SettingsIcon}
            onClick={handleSettings}
          >
            Settings
          </Button>
        </div>
      </div>
    </div>

    {/* Settings Slideout */}
    <ProviderSettingsSlideout
      isOpen={isSettingsOpen}
      onOpenChange={setIsSettingsOpen}
      provider={provider}
      onSave={(providerId, credentials, settings) => {
        console.log("Saving provider settings:", providerId, credentials, settings);
      }}
      onDisconnect={(providerId) => {
        console.log("Disconnecting provider:", providerId);
      }}
    />
    </>
  );
};
