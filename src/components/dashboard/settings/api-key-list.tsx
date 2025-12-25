"use client";

import type { FC } from "react";
import { useState } from "react";
import { Add, Copy, Trash, Key, TickCircle } from "iconsax-react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

export interface ApiKeyListProps {
  className?: string;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date;
  lastUsed?: Date;
}

const mockApiKeys: ApiKey[] = [
  { id: "key_1", name: "Production SDK", prefix: "tk_live_abc123", createdAt: new Date("2024-01-15"), lastUsed: new Date("2024-03-20") },
  { id: "key_2", name: "Development", prefix: "tk_test_xyz789", createdAt: new Date("2024-02-01"), lastUsed: new Date("2024-03-19") },
  { id: "key_3", name: "CI/CD Pipeline", prefix: "tk_live_def456", createdAt: new Date("2024-03-01") },
];

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

export const ApiKeyList: FC<ApiKeyListProps> = ({ className }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      prefix: `tk_live_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date(),
    };
    setApiKeys((prev) => [newKey, ...prev]);
    setNewKeyName("");
    setIsCreating(false);
  };

  const handleRevoke = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleCopy = (prefix: string, id: string) => {
    navigator.clipboard.writeText(prefix);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

      {/* Create New Key Form */}
      {isCreating && (
        <div className="rounded-lg border border-brand-primary bg-brand-secondary/20 p-4">
          <p className="mb-3 text-sm font-medium text-primary">Create New API Key</p>
          <div className="flex gap-3">
            <Input
              placeholder="Key name (e.g., Production SDK)"
              value={newKeyName}
              onChange={(value) => setNewKeyName(value)}
              className="flex-1"
            />
            <Button size="md" onClick={handleCreate}>Create</Button>
            <Button size="md" color="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
          </div>
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
                  <code className="text-xs text-tertiary">{key.prefix}...</code>
                  <button
                    onClick={() => handleCopy(key.prefix, key.id)}
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
                {key.lastUsed && <span className="ml-3">Last used {formatDate(key.lastUsed)}</span>}
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
