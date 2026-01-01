"use client";

import type { FC } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  TickCircle,
  CloseCircle,
  Key,
  ShieldTick,
  InfoCircle,
  DocumentText,
  Eye,
  EyeSlash,
} from "iconsax-react";
import { OpenAI, Anthropic, Azure, Google, Aws, Mistral, Cohere, DeepSeek, Groq } from "@lobehub/icons";
import { Flash } from "iconsax-react"; // For xAI (Grok)
import { DialogTrigger, Modal, ModalOverlay, Dialog } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

// Provider configuration with latest 2025 models
const providers = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-5.2, GPT-5.2 Thinking, GPT-5.2 Pro, o3, DALL-E 4",
    Icon: OpenAI,
    authType: "api_key" as const,
    apiKeyUrl: "https://platform.openai.com/api-keys",
    apiKeyInstructions: "Go to platform.openai.com → API Keys → Create new secret key",
    fields: [
      {
        id: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "sk-...",
        required: true,
      },
      {
        id: "organizationId",
        label: "Organization ID (Optional)",
        type: "text",
        placeholder: "org-...",
        hint: "Required for organization-level usage tracking",
        required: false,
      },
    ],
    docsUrl: "https://platform.openai.com/docs/api-reference",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4",
    Icon: Anthropic,
    authType: "api_key" as const,
    apiKeyUrl: "https://console.anthropic.com/settings/keys",
    apiKeyInstructions: "Go to console.anthropic.com → Settings → API Keys → Create Key",
    fields: [
      {
        id: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "sk-ant-...",
        required: true,
      },
    ],
    docsUrl: "https://docs.anthropic.com/en/api/getting-started",
  },
  {
    id: "google",
    name: "Google Vertex AI",
    description: "Gemini 3, Gemini 2.5 Pro, Gemini 2.5 Flash",
    Icon: Google,
    authType: "service_account" as const,
    apiKeyUrl: "https://console.cloud.google.com/iam-admin/serviceaccounts",
    apiKeyInstructions: "Go to Google Cloud Console → IAM & Admin → Service Accounts → Create service account → Create key (JSON)",
    fields: [
      {
        id: "serviceAccountKey",
        label: "Service Account Key (JSON)",
        type: "textarea",
        placeholder: '{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}',
        required: true,
      },
      {
        id: "projectId",
        label: "Project ID",
        type: "text",
        placeholder: "my-gcp-project",
        hint: "Your Google Cloud project ID",
        required: true,
      },
      {
        id: "region",
        label: "Region",
        type: "text",
        placeholder: "us-central1",
        hint: "The region where your Vertex AI resources are located",
        required: true,
      },
    ],
    docsUrl: "https://cloud.google.com/vertex-ai/docs",
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    description: "GPT-5, GPT-4o, GPT-4 Turbo via Azure cloud",
    Icon: Azure,
    authType: "api_key_endpoint" as const,
    apiKeyUrl: "https://portal.azure.com/#view/Microsoft_Azure_ProjectOxford/CognitiveServicesHub/~/OpenAI",
    apiKeyInstructions: "Go to Azure Portal → Azure OpenAI → Your resource → Keys and Endpoint",
    fields: [
      {
        id: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Your Azure OpenAI API key",
        required: true,
      },
      {
        id: "endpoint",
        label: "Endpoint URL",
        type: "text",
        placeholder: "https://your-resource.openai.azure.com/",
        hint: "Your Azure OpenAI resource endpoint URL",
        required: true,
      },
      {
        id: "deploymentName",
        label: "Deployment Name",
        type: "text",
        placeholder: "gpt-4-deployment",
        hint: "The name of your model deployment",
        required: true,
      },
    ],
    docsUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/",
  },
  {
    id: "aws",
    name: "AWS Bedrock",
    description: "Claude 4.5, Llama 3.3, Titan, Nova Pro",
    Icon: Aws,
    authType: "iam" as const,
    apiKeyUrl: "https://console.aws.amazon.com/iam/home#/security_credentials",
    apiKeyInstructions: "Go to AWS Console → IAM → Security credentials → Create access key",
    fields: [
      {
        id: "accessKeyId",
        label: "Access Key ID",
        type: "text",
        placeholder: "AKIA...",
        required: true,
      },
      {
        id: "secretAccessKey",
        label: "Secret Access Key",
        type: "password",
        placeholder: "Your secret access key",
        required: true,
      },
      {
        id: "region",
        label: "AWS Region",
        type: "text",
        placeholder: "us-east-1",
        hint: "The AWS region where Bedrock is enabled",
        required: true,
      },
    ],
    docsUrl: "https://docs.aws.amazon.com/bedrock/",
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    description: "Grok-2, Grok-2 Mini, Grok Vision",
    Icon: ({ size }: { size: number }) => <Flash size={size} color="#1DA1F2" variant="Bold" />,
    authType: "api_key" as const,
    apiKeyUrl: "https://console.x.ai/",
    apiKeyInstructions: "Go to console.x.ai → API Keys → Create new key",
    fields: [
      {
        id: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "xai-...",
        required: true,
      },
    ],
    docsUrl: "https://docs.x.ai/",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek-V3, DeepSeek-R1, DeepSeek-Coder",
    Icon: DeepSeek,
    authType: "api_key" as const,
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    apiKeyInstructions: "Go to platform.deepseek.com → API Keys → Create API Key",
    fields: [
      {
        id: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "sk-...",
        required: true,
      },
    ],
    docsUrl: "https://platform.deepseek.com/api-docs",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Mistral Large, Mixtral, Codestral, Ministral",
    Icon: Mistral,
    authType: "api_key" as const,
    apiKeyUrl: "https://console.mistral.ai/api-keys/",
    apiKeyInstructions: "Go to console.mistral.ai → API Keys → Create new key",
    fields: [
      {
        id: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Your Mistral API key",
        required: true,
      },
    ],
    docsUrl: "https://docs.mistral.ai/",
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Command R+, Command R, Embed, Rerank",
    Icon: Cohere,
    authType: "api_key" as const,
    apiKeyUrl: "https://dashboard.cohere.com/api-keys",
    apiKeyInstructions: "Go to dashboard.cohere.com → API Keys → Create new key",
    fields: [
      {
        id: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "Your Cohere API key",
        required: true,
      },
    ],
    docsUrl: "https://docs.cohere.com/",
  },
  {
    id: "groq",
    name: "Groq",
    description: "Llama 3.3, Mixtral, Gemma - Ultra-fast inference",
    Icon: Groq,
    authType: "api_key" as const,
    apiKeyUrl: "https://console.groq.com/keys",
    apiKeyInstructions: "Go to console.groq.com → API Keys → Create API Key",
    fields: [
      {
        id: "apiKey",
        label: "API Key",
        type: "password",
        placeholder: "gsk_...",
        required: true,
      },
    ],
    docsUrl: "https://console.groq.com/docs/quickstart",
  },
];

// Steps configuration
const steps = [
  { id: "select", label: "Select Provider" },
  { id: "configure", label: "Configure" },
  { id: "test", label: "Test Connection" },
  { id: "success", label: "Complete" },
];

type Step = "select" | "configure" | "test" | "success";

export interface ConnectProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect?: (provider: string, credentials: Record<string, string>) => void;
}

export const ConnectProviderDialog: FC<ConnectProviderDialogProps> = ({
  open,
  onOpenChange,
  onConnect,
}) => {
  const [step, setStep] = useState<Step>("select");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [connectionName, setConnectionName] = useState<string>("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const provider = providers.find((p) => p.id === selectedProvider);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setCredentials({});
    setConnectionName("");
    setStep("configure");
  };

  const handleBack = () => {
    if (step === "configure") {
      setStep("select");
      setSelectedProvider(null);
      setCredentials({});
    } else if (step === "test") {
      setStep("configure");
      setTestResult(null);
      setTestError(null);
    }
  };

  const handleCredentialChange = (fieldId: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [fieldId]: value }));
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    setTestError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For demo, randomly succeed or fail
    const success = Math.random() > 0.3;
    if (success) {
      setTestResult("success");
      setStep("test");
    } else {
      setTestResult("error");
      setTestError("Invalid API key. Please check your credentials and try again.");
    }
    setIsTestingConnection(false);
  };

  const handleConnect = () => {
    if (selectedProvider) {
      onConnect?.(selectedProvider, credentials);
      setStep("success");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setStep("select");
      setSelectedProvider(null);
      setCredentials({});
      setConnectionName("");
      setTestResult(null);
      setTestError(null);
    }, 300);
  };

  const isFormValid = () => {
    if (!provider) return false;
    return provider.fields
      .filter((f) => f.required)
      .every((f) => credentials[f.id]?.trim());
  };

  // Get current step index for progress indicator
  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <DialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <ModalOverlay isDismissable>
        <Modal className="w-full max-w-5xl">
          <Dialog className="outline-none">
            <div className="flex h-[700px] w-full flex-col overflow-hidden rounded-2xl border border-secondary bg-primary shadow-xl">
              {/* Header */}
              <div className="border-b border-secondary px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {step !== "select" && step !== "success" && (
                      <button
                        onClick={handleBack}
                        className="flex size-8 items-center justify-center rounded-lg text-fg-quaternary transition-colors hover:bg-secondary hover:text-fg-secondary"
                      >
                        <ArrowLeft size={20} />
                      </button>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-primary">
                        {step === "select" && "Connect AI Provider"}
                        {step === "configure" && `Connect ${provider?.name}`}
                        {step === "test" && "Connection Successful"}
                        {step === "success" && "Provider Connected"}
                      </h2>
                      <p className="text-sm text-tertiary">
                        {step === "select" && "Choose a provider to start tracking your AI costs"}
                        {step === "configure" && "Enter your credentials to connect"}
                        {step === "test" && "Your connection has been verified"}
                        {step === "success" && "You're all set to start tracking"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex size-8 items-center justify-center rounded-lg text-fg-quaternary transition-colors hover:bg-secondary hover:text-fg-secondary"
                  >
                    <CloseCircle size={20} />
                  </button>
                </div>

                {/* Progress Stepper */}
                <div className="mt-5 flex items-center gap-2">
                  {steps.map((s, index) => (
                    <div key={s.id} className="flex flex-1 items-center gap-2">
                      <div className="flex flex-1 flex-col items-center gap-1.5">
                        <div
                          className={cx(
                            "flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                            index < currentStepIndex && "bg-fg-brand-primary text-white",
                            index === currentStepIndex && "bg-brand-solid text-white ring-4 ring-brand-secondary",
                            index > currentStepIndex && "bg-secondary text-tertiary"
                          )}
                        >
                          {index < currentStepIndex ? (
                            <TickCircle size={16} color="#ffffff" variant="Bold" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span
                          className={cx(
                            "text-xs font-medium",
                            index <= currentStepIndex ? "text-brand-primary" : "text-tertiary"
                          )}
                        >
                          {s.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={cx(
                            "mb-5 h-0.5 flex-1 rounded-full transition-colors",
                            index < currentStepIndex ? "bg-fg-brand-primary" : "bg-secondary"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Step 1: Provider Selection */}
                {step === "select" && (
                  <div className="space-y-5">
                    {/* Provider List - Vertical Radio-style Selection */}
                    <div className="space-y-3">
                      {providers.map((p) => {
                        const ProviderIcon = p.Icon;
                        const isSelected = selectedProvider === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setSelectedProvider(p.id)}
                            className={cx(
                              "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                              isSelected
                                ? "border-brand bg-brand-secondary"
                                : "border-secondary bg-primary hover:border-tertiary hover:bg-secondary_subtle"
                            )}
                          >
                            {/* Radio indicator */}
                            <div
                              className={cx(
                                "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                isSelected
                                  ? "border-brand-solid bg-brand-solid"
                                  : "border-tertiary bg-primary"
                              )}
                            >
                              {isSelected && (
                                <div className="size-2 rounded-full bg-white" />
                              )}
                            </div>

                            {/* Provider Logo */}
                            <div className="flex size-10 shrink-0 items-center justify-center">
                              <ProviderIcon size={32} />
                            </div>

                            {/* Provider Info */}
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-primary">{p.name}</span>
                              <p className="mt-0.5 text-sm text-tertiary">
                                {p.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Info Box - Fixed styling without black border */}
                    <div className="flex items-start gap-3 rounded-xl bg-brand-secondary p-4">
                      <InfoCircle size={20} className="shrink-0 text-fg-brand-primary" />
                      <div>
                        <p className="text-sm font-medium text-brand-primary">
                          Secure Connection
                        </p>
                        <p className="mt-1 text-sm text-brand-tertiary">
                          Your API keys are encrypted at rest and never stored in plain text.
                          We only use read-only access to fetch usage and cost data.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Configure Credentials */}
                {step === "configure" && provider && (
                  <div className="space-y-6">
                    {/* Provider Header */}
                    <div className="flex items-center gap-4 rounded-xl bg-secondary_subtle p-4">
                      <div className="flex size-12 shrink-0 items-center justify-center">
                        <provider.Icon size={40} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary">{provider.name}</h3>
                        <p className="text-sm text-tertiary">{provider.description}</p>
                      </div>
                      <a
                        href={provider.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
                      >
                        <DocumentText size={16} />
                        View Docs
                      </a>
                    </div>

                    {/* Where to find your API Key */}
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
                            {provider.apiKeyInstructions}
                          </p>
                          <a
                            href={provider.apiKeyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
                          >
                            Open {provider.name} Console →
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Connection Name (Optional) */}
                    <div className="space-y-4">
                      <Input
                        label="Connection Name (Optional)"
                        type="text"
                        value={connectionName}
                        onChange={(value) => setConnectionName(value)}
                        placeholder={`My ${provider.name} API Key`}
                        hint="Give this connection a name to easily identify it later (e.g., 'Production API', 'Development Key')"
                      />
                    </div>

                    {/* Credential Fields */}
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-sm font-medium text-secondary">
                        <Key size={16} />
                        Authentication Credentials
                      </h3>

                      {provider.fields.map((field) => (
                        <div key={field.id}>
                          {field.type === "textarea" ? (
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-secondary">
                                {field.label}
                                {field.required && <span className="text-error-primary"> *</span>}
                              </label>
                              <TextArea
                                value={credentials[field.id] || ""}
                                onChange={(value) => handleCredentialChange(field.id, value)}
                                placeholder={field.placeholder}
                                textAreaClassName="min-h-[120px] font-mono text-sm"
                              />
                              {"hint" in field && field.hint && (
                                <p className="text-xs text-tertiary">{field.hint}</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <Input
                                label={field.label}
                                type={
                                  field.type === "password" && !showPasswords[field.id]
                                    ? "password"
                                    : "text"
                                }
                                value={credentials[field.id] || ""}
                                onChange={(value) =>
                                  handleCredentialChange(field.id, value)
                                }
                                placeholder={field.placeholder}
                                isRequired={field.required}
                                hint={"hint" in field ? field.hint : undefined}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Test Result Error */}
                    {testResult === "error" && testError && (
                      <div className="flex items-start gap-3 rounded-xl bg-error-secondary p-4">
                        <CloseCircle size={20} className="shrink-0 text-fg-error-primary" />
                        <div>
                          <p className="text-sm font-medium text-error-primary">
                            Connection Failed
                          </p>
                          <p className="mt-1 text-sm text-error-tertiary">{testError}</p>
                        </div>
                      </div>
                    )}

                    {/* Security Info - Redesigned with green styling and lock icon */}
                    <div className="rounded-xl bg-success-secondary p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fg-success-primary">
                          <ShieldTick size={20} color="#ffffff" variant="Bold" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-success-primary">
                            Your credentials are secure
                          </p>
                          <p className="mt-1 text-sm text-success-tertiary">
                            We take security seriously. Your API keys are protected with enterprise-grade encryption.
                          </p>
                          <div className="mt-3 grid grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-black/20">
                              <TickCircle size={16} className="shrink-0 text-fg-success-primary" />
                              <span className="text-xs font-medium text-success-primary">AES-256 Encryption</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-black/20">
                              <TickCircle size={16} className="shrink-0 text-fg-success-primary" />
                              <span className="text-xs font-medium text-success-primary">Read-only Access</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-black/20">
                              <TickCircle size={16} className="shrink-0 text-fg-success-primary" />
                              <span className="text-xs font-medium text-success-primary">Revoke Anytime</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Test Success */}
                {step === "test" && provider && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="flex size-20 items-center justify-center rounded-full bg-success-secondary">
                      <TickCircle size={40} color="#17B26A" variant="Bold" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-primary">
                      Connection Verified!
                    </h3>
                    <p className="mt-2 text-center text-tertiary">
                      We successfully connected to your {provider.name} account.
                      <br />
                      Click "Connect Provider" to start tracking your AI costs.
                    </p>

                    {/* Connection Details */}
                    <div className="mt-8 w-full max-w-md rounded-xl border border-secondary bg-secondary_subtle p-4">
                      <h4 className="text-sm font-medium text-secondary">Connection Details</h4>
                      <div className="mt-3 space-y-2">
                        {connectionName && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-tertiary">Connection Name</span>
                            <span className="text-sm font-medium text-primary">{connectionName}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-tertiary">Provider</span>
                          <span className="text-sm font-medium text-primary">{provider.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-tertiary">Status</span>
                          <Badge size="sm" type="pill-color" color="success">
                            Connected
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-tertiary">Data Sync</span>
                          <span className="text-sm font-medium text-primary">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Success */}
                {step === "success" && provider && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="flex size-20 items-center justify-center rounded-full bg-brand-secondary">
                      <TickCircle size={40} color="#7F56D9" variant="Bold" />
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-primary">
                      {connectionName || provider.name} Connected!
                    </h3>
                    <p className="mt-2 text-center text-tertiary">
                      Your {provider.name} connection has been successfully added.
                      <br />
                      We'll start syncing your usage and cost data shortly.
                    </p>

                    {/* Next Steps */}
                    <div className="mt-8 w-full max-w-md space-y-3">
                      <h4 className="text-sm font-medium text-secondary">What happens next?</h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3 rounded-lg border border-secondary bg-primary p-3">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-xs font-semibold text-brand-primary">
                            1
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">Initial Data Sync</p>
                            <p className="text-xs text-tertiary">
                              We'll fetch your historical usage data (up to 30 days)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg border border-secondary bg-primary p-3">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-xs font-semibold text-brand-primary">
                            2
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">Cost Analysis</p>
                            <p className="text-xs text-tertiary">
                              View detailed breakdowns by model, team, and project
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-lg border border-secondary bg-primary p-3">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-xs font-semibold text-brand-primary">
                            3
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">Optimization Tips</p>
                            <p className="text-xs text-tertiary">
                              Get personalized recommendations to reduce costs
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-secondary px-6 py-4">
                <div>
                  {step === "configure" && (
                    <p className="text-xs text-tertiary">
                      Fields marked with <span className="text-error-primary">*</span> are required
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {step === "select" && (
                    <>
                      <Button size="md" color="secondary" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button
                        size="md"
                        isDisabled={!selectedProvider}
                        onClick={() => selectedProvider && setStep("configure")}
                      >
                        Continue
                      </Button>
                    </>
                  )}

                  {step === "configure" && (
                    <>
                      <Button size="md" color="secondary" onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        size="md"
                        isDisabled={!isFormValid()}
                        isLoading={isTestingConnection}
                        onClick={handleTestConnection}
                      >
                        {isTestingConnection ? "Testing Connection..." : "Test Connection"}
                      </Button>
                    </>
                  )}

                  {step === "test" && (
                    <>
                      <Button size="md" color="secondary" onClick={handleBack}>
                        Back
                      </Button>
                      <Button size="md" onClick={handleConnect}>
                        Connect Provider
                      </Button>
                    </>
                  )}

                  {step === "success" && (
                    <>
                      <Button size="md" color="secondary" href="/dashboard/providers">
                        View All Providers
                      </Button>
                      <Button size="md" onClick={handleClose}>
                        Done
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};
