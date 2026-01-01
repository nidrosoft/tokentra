"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { ArrowRight, Check, Link01, AlertCircle } from "@untitledui/icons";

const PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4, GPT-3.5, DALL-E, Whisper",
    logo: "/images/providers/openai.svg",
    docsUrl: "https://platform.openai.com/settings/organization/admin-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude 3, Claude 2, Claude Instant",
    logo: "/images/providers/anthropic.svg",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "google",
    name: "Google AI",
    description: "Gemini Pro, PaLM 2",
    logo: "/images/providers/google.svg",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    description: "Azure-hosted OpenAI models",
    logo: "/images/providers/azure.svg",
    docsUrl: "https://portal.azure.com",
  },
];

export default function ProviderSetupPage() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);

  const handleConnect = async () => {
    if (!selectedProvider || !apiKey) return;

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/providers/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          credentials: { apiKey },
        }),
      });

      if (response.ok) {
        setConnectedProviders(prev => [...prev, selectedProvider]);
        setSelectedProvider(null);
        setApiKey("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to connect provider");
      }
    } catch (err) {
      setError("Connection failed. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleContinue = async () => {
    // Record event and continue
    await fetch("/api/onboarding/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "provider_setup_viewed" }),
    });

    router.push("/onboarding/complete");
  };

  const provider = PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 text-sm text-tertiary">
        <span className="font-medium text-primary">Step 2 of 3</span>
        <span>•</span>
        <span>Connect Provider</span>
      </div>

      <div className="rounded-xl border border-primary bg-primary p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
            <Link01 className="h-5 w-5" />
            Connect your AI provider
          </h2>
          <p className="mt-1 text-sm text-tertiary">
            Connect at least one provider to start tracking your AI costs
          </p>
        </div>

        {/* Provider Selection */}
        {!selectedProvider && (
          <div className="space-y-3">
            {PROVIDERS.map(p => {
              const isConnected = connectedProviders.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => !isConnected && setSelectedProvider(p.id)}
                  disabled={isConnected}
                  className={`w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-4 ${
                    isConnected
                      ? "border-success bg-success-primary cursor-default"
                      : "border-secondary hover:border-primary cursor-pointer"
                  }`}
                >
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-lg font-bold">{p.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-primary">{p.name}</div>
                    <div className="text-sm text-tertiary">{p.description}</div>
                  </div>
                  {isConnected && (
                    <div className="flex items-center gap-1 text-success-primary">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* API Key Input */}
        {selectedProvider && provider && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-lg font-bold">{provider.name[0]}</span>
                </div>
                <div>
                  <div className="font-medium text-primary">{provider.name}</div>
                  <div className="text-sm text-tertiary">{provider.description}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  setApiKey("");
                  setError(null);
                }}
                className="text-sm text-tertiary hover:text-primary"
              >
                Change
              </button>
            </div>

            <div className="rounded-lg bg-secondary p-4 space-y-3">
              <div className="text-sm font-medium text-primary">
                How to get your API key:
              </div>
              <ol className="text-sm text-tertiary space-y-1 list-decimal list-inside">
                <li>Go to your {provider.name} dashboard</li>
                <li>Navigate to API keys or Admin keys section</li>
                <li>Create a new key and copy it</li>
              </ol>
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-brand-secondary hover:underline"
              >
                Open {provider.name} Dashboard →
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={`Enter your ${provider.name} API key`}
                className="w-full px-3 py-2 rounded-lg border border-primary bg-primary text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <p className="text-xs text-tertiary">
                Your key is encrypted and stored securely. We only use it to read usage data.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-error-primary text-error-primary">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                color="secondary"
                onClick={() => {
                  setSelectedProvider(null);
                  setApiKey("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                isDisabled={!apiKey || isConnecting}
                isLoading={isConnecting}
              >
                Connect {provider.name}
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!selectedProvider && (
          <div className="flex items-center justify-between pt-6 border-t border-secondary mt-6">
            <Button
              color="tertiary"
              onClick={() => router.push("/dashboard")}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleContinue}
              iconTrailing={ArrowRight}
            >
              {connectedProviders.length > 0 ? "Continue" : "Skip & Continue"}
            </Button>
          </div>
        )}
      </div>

      {/* Connected providers summary */}
      {connectedProviders.length > 0 && !selectedProvider && (
        <div className="rounded-lg bg-success-primary p-4">
          <div className="flex items-center gap-2 text-success-primary">
            <Check className="h-5 w-5" />
            <span className="font-medium">
              {connectedProviders.length} provider{connectedProviders.length > 1 ? "s" : ""} connected
            </span>
          </div>
          <p className="mt-1 text-sm text-success-secondary">
            Your usage data is being synced. This usually takes 1-2 minutes.
          </p>
        </div>
      )}
    </div>
  );
}
