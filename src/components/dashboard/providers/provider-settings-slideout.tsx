"use client";

import type { FC } from "react";
import { useState } from "react";
import {
  Setting2,
  Key,
  Trash,
  TickCircle,
  CloseCircle,
  InfoCircle,
  Eye,
  EyeSlash,
  DocumentText,
} from "iconsax-react";
import { OpenAI, Anthropic, Azure, Google, Aws, Mistral, Cohere, DeepSeek, Groq } from "@lobehub/icons";
import { Flash } from "iconsax-react"; // For xAI (Grok)
import type { ProviderType } from "@/lib/provider-sync/types";
import type { ProviderConnection } from "@/hooks/use-providers";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Badge } from "@/components/base/badges/badges";
import { ProviderStatusBadge } from "./provider-status";
import { cx } from "@/utils/cx";

// Provider configuration - reused from connect-provider-dialog
const providerConfigs: Record<ProviderType, {
  name: string;
  docsUrl: string;
  apiKeyUrl: string;
  apiKeyInstructions: string;
  fields: Array<{
    id: string;
    label: string;
    type: "text" | "password" | "textarea";
    placeholder: string;
    hint?: string;
    required: boolean;
  }>;
}> = {
  openai: {
    name: "OpenAI",
    docsUrl: "https://platform.openai.com/docs/api-reference",
    apiKeyUrl: "https://platform.openai.com/api-keys",
    apiKeyInstructions: "Go to platform.openai.com → API Keys → Create new secret key",
    fields: [
      { id: "apiKey", label: "API Key", type: "password", placeholder: "sk-...", required: true },
      { id: "organizationId", label: "Organization ID (Optional)", type: "text", placeholder: "org-...", hint: "Required for organization-level usage tracking", required: false },
    ],
  },
  anthropic: {
    name: "Anthropic",
    docsUrl: "https://docs.anthropic.com/en/api/getting-started",
    apiKeyUrl: "https://console.anthropic.com/settings/keys",
    apiKeyInstructions: "Go to console.anthropic.com → Settings → API Keys → Create Key",
    fields: [
      { id: "apiKey", label: "API Key", type: "password", placeholder: "sk-ant-...", required: true },
    ],
  },
  google: {
    name: "Google Vertex AI",
    docsUrl: "https://cloud.google.com/vertex-ai/docs",
    apiKeyUrl: "https://console.cloud.google.com/iam-admin/serviceaccounts",
    apiKeyInstructions: "Go to Google Cloud Console → IAM & Admin → Service Accounts → Create key (JSON)",
    fields: [
      { id: "serviceAccountKey", label: "Service Account Key (JSON)", type: "textarea", placeholder: '{\n  "type": "service_account",\n  ...\n}', required: true },
      { id: "projectId", label: "Project ID", type: "text", placeholder: "my-gcp-project", hint: "Your Google Cloud project ID", required: true },
      { id: "region", label: "Region", type: "text", placeholder: "us-central1", hint: "The region where your Vertex AI resources are located", required: true },
    ],
  },
  azure: {
    name: "Azure OpenAI",
    docsUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/",
    apiKeyUrl: "https://portal.azure.com/#view/Microsoft_Azure_ProjectOxford/CognitiveServicesHub/~/OpenAI",
    apiKeyInstructions: "Go to Azure Portal → Azure OpenAI → Your resource → Keys and Endpoint",
    fields: [
      { id: "apiKey", label: "API Key", type: "password", placeholder: "Your Azure OpenAI API key", required: true },
      { id: "endpoint", label: "Endpoint URL", type: "text", placeholder: "https://your-resource.openai.azure.com/", hint: "Your Azure OpenAI resource endpoint URL", required: true },
      { id: "deploymentName", label: "Deployment Name", type: "text", placeholder: "gpt-4-deployment", hint: "The name of your model deployment", required: true },
    ],
  },
  aws: {
    name: "AWS Bedrock",
    docsUrl: "https://docs.aws.amazon.com/bedrock/",
    apiKeyUrl: "https://console.aws.amazon.com/iam/home#/security_credentials",
    apiKeyInstructions: "Go to AWS Console → IAM → Security credentials → Create access key",
    fields: [
      { id: "accessKeyId", label: "Access Key ID", type: "text", placeholder: "AKIA...", required: true },
      { id: "secretAccessKey", label: "Secret Access Key", type: "password", placeholder: "Your secret access key", required: true },
      { id: "region", label: "AWS Region", type: "text", placeholder: "us-east-1", hint: "The AWS region where Bedrock is enabled", required: true },
    ],
  },
  xai: {
    name: "xAI (Grok)",
    docsUrl: "https://docs.x.ai/",
    apiKeyUrl: "https://console.x.ai/",
    apiKeyInstructions: "Go to console.x.ai → API Keys → Create new key",
    fields: [
      { id: "apiKey", label: "API Key", type: "password", placeholder: "xai-...", required: true },
    ],
  },
  deepseek: {
    name: "DeepSeek",
    docsUrl: "https://platform.deepseek.com/api-docs",
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    apiKeyInstructions: "Go to platform.deepseek.com → API Keys → Create API Key",
    fields: [
      { id: "apiKey", label: "API Key", type: "password", placeholder: "sk-...", required: true },
    ],
  },
  mistral: {
    name: "Mistral AI",
    docsUrl: "https://docs.mistral.ai/",
    apiKeyUrl: "https://console.mistral.ai/api-keys/",
    apiKeyInstructions: "Go to console.mistral.ai → API Keys → Create new key",
    fields: [
      { id: "apiKey", label: "API Key", type: "password", placeholder: "Your Mistral API key", required: true },
    ],
  },
  cohere: {
    name: "Cohere",
    docsUrl: "https://docs.cohere.com/",
    apiKeyUrl: "https://dashboard.cohere.com/api-keys",
    apiKeyInstructions: "Go to dashboard.cohere.com → API Keys → Create new key",
    fields: [
      { id: "apiKey", label: "API Key", type: "password", placeholder: "Your Cohere API key", required: true },
    ],
  },
  groq: {
    name: "Groq",
    docsUrl: "https://console.groq.com/docs/quickstart",
    apiKeyUrl: "https://console.groq.com/keys",
    apiKeyInstructions: "Go to console.groq.com → API Keys → Create API Key",
    fields: [
      { id: "apiKey", label: "API Key", type: "password", placeholder: "gsk_...", required: true },
    ],
  },
};

const providerLogos: Record<ProviderType, FC<{ size: number }>> = {
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

const syncIntervals = [
  { value: "15m", label: "Every 15 minutes" },
  { value: "1h", label: "Every hour" },
  { value: "6h", label: "Every 6 hours" },
  { value: "manual", label: "Manual sync only" },
];

interface ProviderSettingsSlideoutProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ProviderConnection;
  onSave?: (providerId: string, credentials: Record<string, string>, settings: { syncInterval: string }) => void;
  onDisconnect?: (providerId: string) => void;
  onTestConnection?: (providerId: string, credentials: Record<string, string>) => Promise<boolean>;
}

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

const SettingsIcon = ({ className }: { className?: string }) => (
  <Setting2 size={24} color="#7F56D9" className={className} variant="Bulk" />
);

const TrashIcon = ({ className }: { className?: string }) => (
  <Trash size={16} color="currentColor" className={className} variant="Outline" />
);

export const ProviderSettingsSlideout: FC<ProviderSettingsSlideoutProps> = ({
  isOpen,
  onOpenChange,
  provider,
  onSave,
  onDisconnect,
  onTestConnection,
}) => {
  const config = providerConfigs[provider.provider];
  const Logo = providerLogos[provider.provider];
  const displayName = provider.displayName || providerNames[provider.provider];
  
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [connectionName, setConnectionName] = useState(displayName);
  const [syncInterval, setSyncInterval] = useState("6h");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const isConnected = provider.status === "connected";
  const hasError = provider.status === "error";
  const isDisconnected = provider.status === "disconnected" || provider.status === "pending";

  const handleCredentialChange = (fieldId: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [fieldId]: value }));
    setTestResult(null);
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const success = await onTestConnection?.(provider.id, credentials) ?? Math.random() > 0.3;
    setTestResult(success ? "success" : "error");
    setIsTesting(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSave?.(provider.id, credentials, { syncInterval });
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleDisconnect = () => {
    onDisconnect?.(provider.id);
    setShowDisconnectConfirm(false);
    onOpenChange(false);
  };

  const isFormValid = () => {
    if (isConnected) return true; // Connected providers can save without re-entering credentials
    return config.fields
      .filter((f) => f.required)
      .every((f) => credentials[f.id]?.trim());
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

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <SlideoutMenu isDismissable>
        <SlideoutMenu.Header
          onClose={() => onOpenChange(false)}
          className="relative flex w-full items-start gap-4 px-4 pt-6 md:px-6"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-utility-brand-50">
            <SettingsIcon />
          </div>
          <section className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-md font-semibold text-primary md:text-lg">
                {displayName} Settings
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ProviderStatusBadge status={provider.status as "connected" | "disconnected" | "error" | "syncing"} />
              <span className="text-sm text-tertiary">
                • Last sync: {formatLastSync(provider.lastSyncAt ? new Date(provider.lastSyncAt) : undefined)}
              </span>
            </div>
          </section>
        </SlideoutMenu.Header>

        <SlideoutMenu.Content>
          <div className="flex flex-col gap-6">
            {/* Error/Disconnected Alert */}
            {hasError && provider.lastError && (
              <div className="flex items-start gap-3 rounded-xl bg-error-secondary p-4">
                <CloseCircle size={20} color="#F04438" variant="Bold" />
                <div>
                  <p className="text-sm font-medium text-error-primary">
                    Connection Error
                  </p>
                  <p className="mt-1 text-sm text-error-tertiary">
                    {provider.lastError}
                  </p>
                </div>
              </div>
            )}

            {isDisconnected && (
              <div className="flex items-start gap-3 rounded-xl bg-warning-secondary p-4">
                <InfoCircle size={20} color="#F79009" variant="Bold" />
                <div>
                  <p className="text-sm font-medium text-warning-primary">
                    Provider Not Configured
                  </p>
                  <p className="mt-1 text-sm text-warning-tertiary">
                    Enter your credentials to start tracking costs.
                  </p>
                </div>
              </div>
            )}

            {/* Provider Info */}
            <div className="flex items-center gap-4 rounded-xl bg-secondary_subtle p-4">
              <div className="flex size-12 shrink-0 items-center justify-center">
                <Logo size={40} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary">{config.name}</h3>
                <p className="text-sm text-tertiary">{provider.provider}</p>
              </div>
              <a
                href={config.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
              >
                <DocumentText size={16} color="#7F56D9" />
                Docs
              </a>
            </div>

            {/* Connection Name */}
            <Input
              label="Connection Name"
              type="text"
              value={connectionName}
              onChange={(value) => setConnectionName(value)}
              placeholder={`My ${config.name} API Key`}
              hint="A friendly name to identify this connection"
            />

            {/* Credentials Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-medium text-secondary">
                  <Key size={16} color="#667085" />
                  Credentials
                </h3>
                {isConnected && (
                  <Badge size="sm" type="pill-color" color="success">
                    Verified
                  </Badge>
                )}
              </div>

              {/* API Key Help */}
              {(hasError || isDisconnected) && (
                <div className="rounded-xl bg-brand-secondary p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-solid">
                      <Key size={16} color="#ffffff" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-brand-primary">
                        Where to find your API Key
                      </p>
                      <p className="mt-1 text-sm text-brand-tertiary">
                        {config.apiKeyInstructions}
                      </p>
                      <a
                        href={config.apiKeyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
                      >
                        Open {config.name} Console →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Credential Fields */}
              {config.fields.map((field) => (
                <div key={field.id}>
                  {field.type === "textarea" ? (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-secondary">
                        {field.label}
                        {field.required && !isConnected && <span className="text-error-primary"> *</span>}
                      </label>
                      <TextArea
                        value={credentials[field.id] || ""}
                        onChange={(value) => handleCredentialChange(field.id, value)}
                        placeholder={isConnected ? "••••••••" : field.placeholder}
                        textAreaClassName="min-h-[100px] font-mono text-sm"
                      />
                      {field.hint && (
                        <p className="text-xs text-tertiary">{field.hint}</p>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        label={field.label}
                        type={field.type === "password" && !showPasswords[field.id] ? "password" : "text"}
                        value={credentials[field.id] || ""}
                        onChange={(value) => handleCredentialChange(field.id, value)}
                        placeholder={isConnected ? "••••••••" : field.placeholder}
                        isRequired={field.required && !isConnected}
                        hint={field.hint}
                      />
                      {field.type === "password" && (
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(field.id)}
                          className="absolute right-3 top-8 text-fg-quaternary hover:text-fg-secondary"
                        >
                          {showPasswords[field.id] ? (
                            <EyeSlash size={18} color="currentColor" />
                          ) : (
                            <Eye size={18} color="currentColor" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Test Result */}
              {testResult === "success" && (
                <div className="flex items-center gap-2 rounded-lg bg-success-secondary p-3">
                  <TickCircle size={18} color="#12B76A" variant="Bold" />
                  <span className="text-sm font-medium text-success-primary">
                    Connection verified successfully!
                  </span>
                </div>
              )}
              {testResult === "error" && (
                <div className="flex items-center gap-2 rounded-lg bg-error-secondary p-3">
                  <CloseCircle size={18} color="#F04438" variant="Bold" />
                  <span className="text-sm font-medium text-error-primary">
                    Connection failed. Please check your credentials.
                  </span>
                </div>
              )}

              {/* Test Connection Button */}
              {(hasError || isDisconnected || Object.keys(credentials).length > 0) && (
                <Button
                  size="sm"
                  color="secondary"
                  onClick={handleTestConnection}
                  isLoading={isTesting}
                  isDisabled={!isFormValid()}
                  className="w-full"
                >
                  {isTesting ? "Testing..." : "Test Connection"}
                </Button>
              )}
            </div>

            {/* Sync Settings - Only for connected providers */}
            {isConnected && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-secondary">Sync Settings</h3>
                <div className="space-y-2">
                  {syncIntervals.map((interval) => (
                    <label
                      key={interval.value}
                      className={cx(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                        syncInterval === interval.value
                          ? "border-brand bg-brand-secondary"
                          : "border-secondary hover:bg-secondary_subtle"
                      )}
                    >
                      <div
                        className={cx(
                          "flex size-4 items-center justify-center rounded-full border-2",
                          syncInterval === interval.value
                            ? "border-brand-solid bg-brand-solid"
                            : "border-tertiary"
                        )}
                      >
                        {syncInterval === interval.value && (
                          <div className="size-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm text-primary">{interval.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="space-y-3 border-t border-secondary pt-6">
              <h3 className="text-sm font-medium text-error-primary">Danger Zone</h3>
              {!showDisconnectConfirm ? (
                <Button
                  size="sm"
                  color="secondary"
                  iconLeading={TrashIcon}
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="text-error-primary hover:bg-error-secondary"
                >
                  Disconnect Provider
                </Button>
              ) : (
                <div className="rounded-xl border border-error-primary bg-error-secondary p-4">
                  <p className="text-sm font-medium text-error-primary">
                    Are you sure you want to disconnect {displayName}?
                  </p>
                  <p className="mt-1 text-sm text-error-tertiary">
                    This will remove all credentials and stop syncing data. Historical data will be preserved.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      color="secondary"
                      onClick={() => setShowDisconnectConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      color="primary-destructive"
                      onClick={handleDisconnect}
                    >
                      Yes, Disconnect
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SlideoutMenu.Content>

        <SlideoutMenu.Footer className="flex w-full justify-between gap-3">
          <Button size="md" color="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={!isFormValid() && !isConnected}
          >
            {isConnected ? "Save Changes" : testResult === "success" ? "Connect" : "Save"}
          </Button>
        </SlideoutMenu.Footer>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
