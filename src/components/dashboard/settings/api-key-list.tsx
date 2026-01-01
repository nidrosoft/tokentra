"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Copy, Key, TickCircle } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useApiKeys } from "@/hooks/use-api-keys";
import { cx } from "@/utils/cx";

export interface ApiKeyListProps {
  className?: string;
}

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr));
};

export const ApiKeyList: FC<ApiKeyListProps> = ({ className }) => {
  const { apiKeys, isLoading, createApiKey, isCreating: isCreatingKey, revokeApiKey, isRevoking } = useApiKeys();
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newSecretKey, setNewSecretKey] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    try {
      const result = await createApiKey({ name: newKeyName });
      setNewSecretKey(result.secretKey);
      setNewKeyName("");
    } catch (error) {
      console.error("Failed to create API key:", error);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeApiKey(id);
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCloseSecretKey = () => {
    setNewSecretKey(null);
    setIsCreating(false);
  };

  return (
    <div className={cx("space-y-6", className)}>
      {/* Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-primary">API Keys</h2>
          <p className="text-sm text-tertiary">Manage API keys for SDK integration and programmatic access.</p>
        </div>
        <Button size="md" iconLeading={AddIcon} onClick={() => setIsCreating(true)}>
          Create API Key
        </Button>
      </div>

      {/* New Secret Key Display */}
      {newSecretKey && (
        <div className="rounded-lg border border-success-primary bg-success-secondary/20 p-4">
          <p className="mb-2 text-sm font-medium text-primary">🔑 Your new API key (copy it now - it won't be shown again!)</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 rounded bg-secondary p-2 text-sm text-primary break-all">{newSecretKey}</code>
            <button
              onClick={() => handleCopy(newSecretKey, "new-key")}
              className="rounded-lg bg-primary p-2 text-tertiary hover:text-primary"
            >
              {copiedId === "new-key" ? (
                <TickCircle size={20} color="#17B26A" variant="Bold" />
              ) : (
                <Copy size={20} color="currentColor" variant="Outline" />
              )}
            </button>
          </div>
          <Button size="sm" color="secondary" className="mt-3" onClick={handleCloseSecretKey}>
            Done
          </Button>
        </div>
      )}

      {/* Create New Key Form */}
      {isCreating && !newSecretKey && (
        <div className="rounded-lg border border-brand-primary bg-brand-secondary/20 p-4">
          <p className="mb-3 text-sm font-medium text-primary">Create New API Key</p>
          <div className="flex gap-3">
            <Input
              placeholder="Key name (e.g., Production SDK)"
              value={newKeyName}
              onChange={(value) => setNewKeyName(value)}
              className="flex-1"
            />
            <Button size="md" onClick={handleCreate} disabled={isCreatingKey}>
              {isCreatingKey ? "Creating..." : "Create"}
            </Button>
            <Button size="md" color="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-secondary bg-primary p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-secondary" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-secondary" />
                  <div className="h-3 w-24 rounded bg-secondary" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Keys List */}
      <div className="space-y-3">
        {apiKeys.map((key) => (
          <div
            key={key.id}
            className="flex flex-col gap-3 rounded-lg border border-secondary bg-primary p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary">
                <Key size={20} color="#7F56D9" variant="Bold" />
              </div>
              <div>
                <p className="font-medium text-primary">{key.name}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-tertiary">{key.keyPrefix}...</code>
                  <button
                    onClick={() => handleCopy(key.keyPrefix, key.id)}
                    className="text-tertiary hover:text-primary"
                  >
                    {copiedId === key.id ? (
                      <TickCircle size={14} color="#17B26A" variant="Bold" />
                    ) : (
                      <Copy size={14} color="currentColor" variant="Outline" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-tertiary">
                <span>Created {formatDate(key.createdAt)}</span>
                {key.lastUsedAt && <span className="ml-3">Last used {formatDate(key.lastUsedAt)}</span>}
              </div>
              <Button
                size="sm"
                color="secondary-destructive"
                onClick={() => handleRevoke(key.id)}
              >
                Revoke
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {apiKeys.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary py-12">
          <Key size={40} color="#98A2B3" variant="Outline" />
          <p className="mt-3 text-lg font-medium text-secondary">No API keys</p>
          <p className="mt-1 text-sm text-tertiary">Create an API key to integrate with the SDK</p>
        </div>
      )}
    </div>
  );
};
