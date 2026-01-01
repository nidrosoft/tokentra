"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { SearchNormal1, TickCircle, Add, More, CloseCircle } from "iconsax-react";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { useIntegrations, type Integration } from "@/hooks/use-integrations";
import { cx } from "@/utils/cx";

interface IntegrationUI {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: FC<{ size: number; className?: string }>;
  category: "notifications" | "analytics" | "billing" | "collaboration";
  connected: boolean;
  configuredAt?: Date;
  dbId?: string;
}

const SlackIcon: FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
    <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
    <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/>
    <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const PagerDutyIcon: FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#06AC38" d="M16.965 1.18C15.085.164 13.769 0 10.683 0H3.73v14.55h6.926c2.743 0 4.8-.164 6.61-1.37 1.975-1.303 3.004-3.47 3.004-6.036 0-2.921-1.37-4.964-3.305-5.964zM11.87 10.593H7.96V3.844h3.708c2.564 0 4.12 1.083 4.12 3.305 0 2.4-1.556 3.444-3.918 3.444zM3.73 17.69h4.23V24H3.73z"/>
  </svg>
);

const WebhookIcon: FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const EmailIcon: FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const MSTeamsIcon: FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#5059C9" d="M19.5 6.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    <path fill="#5059C9" d="M22 8h-5a1 1 0 0 0-1 1v6a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3V9a1 1 0 0 0-1-1z"/>
    <path fill="#7B83EB" d="M14 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    <path fill="#7B83EB" d="M15 7H7a2 2 0 0 0-2 2v8a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2z"/>
  </svg>
);

const JiraIcon: FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#2684FF" d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005z"/>
    <path fill="#2684FF" d="M17.447 5.756H5.876a5.218 5.218 0 0 0 5.233 5.214h2.129v2.058a5.218 5.218 0 0 0 5.214 5.215V6.761a1.005 1.005 0 0 0-1.005-1.005z"/>
    <path fill="#2684FF" d="M23.323 0H11.752a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24.309 12.5V1.005A1.005 1.005 0 0 0 23.323 0z"/>
  </svg>
);

const DatadogIcon: FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path fill="#632CA6" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.347c-.614.89-1.588 1.347-2.894 1.347-1.306 0-2.28-.457-2.894-1.347-.614-.89-.894-2.147-.894-3.747s.28-2.857.894-3.747c.614-.89 1.588-1.347 2.894-1.347 1.306 0 2.28.457 2.894 1.347.614.89.894 2.147.894 3.747s-.28 2.857-.894 3.747z"/>
  </svg>
);

const defaultIntegrations: IntegrationUI[] = [
  {
    id: "slack",
    name: "Slack",
    provider: "Slack Technologies",
    description: "Real-time budget alerts, cost spike notifications, and daily summaries to your Slack channels",
    icon: SlackIcon,
    category: "notifications",
    connected: false,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    provider: "Microsoft",
    description: "Send cost alerts and budget notifications to Microsoft Teams channels",
    icon: MSTeamsIcon,
    category: "notifications",
    connected: false,
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    provider: "PagerDuty",
    description: "Escalate critical budget breaches and cost anomalies to on-call teams",
    icon: PagerDutyIcon,
    category: "notifications",
    connected: false,
  },
  {
    id: "datadog",
    name: "Datadog",
    provider: "Datadog",
    description: "Export AI cost metrics and events to your Datadog dashboards for unified observability",
    icon: DatadogIcon,
    category: "analytics",
    connected: false,
  },
  {
    id: "jira",
    name: "Jira",
    provider: "Atlassian",
    description: "Auto-create Jira tickets when budgets are exceeded or cost anomalies are detected",
    icon: JiraIcon,
    category: "collaboration",
    connected: false,
  },
  {
    id: "webhook",
    name: "Webhooks",
    provider: "Custom",
    description: "Send cost events to any custom endpoint with HMAC signature verification",
    icon: WebhookIcon,
    category: "notifications",
    connected: false,
  },
];

const SearchIcon = ({ className }: { className?: string }) => (
  <SearchNormal1 size={20} color="currentColor" className={className} variant="Outline" />
);

const AddIcon = ({ className }: { className?: string }) => (
  <Add size={20} color="currentColor" className={className} variant="Outline" />
);

export const IntegrationSettings: FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [integrations, setIntegrations] = useState<IntegrationUI[]>(defaultIntegrations);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch connected integrations from database
  const { integrations: dbIntegrations, createIntegration, deleteIntegration, isLoading } = useIntegrations();

  // Merge database integrations with default list
  useEffect(() => {
    if (dbIntegrations.length > 0) {
      setIntegrations((prev) =>
        prev.map((integration) => {
          const dbMatch = dbIntegrations.find(
            (db) => db.integrationType === integration.id
          );
          if (dbMatch) {
            return {
              ...integration,
              connected: true,
              configuredAt: new Date(dbMatch.connectedAt || dbMatch.updatedAt),
              dbId: dbMatch.id,
            };
          }
          return { ...integration, connected: false, dbId: undefined };
        })
      );
    }
  }, [dbIntegrations]);

  const connectedIntegrations = integrations.filter((i) => i.connected);
  const availableIntegrations = integrations.filter((i) => !i.connected);

  const filteredConnected = connectedIntegrations.filter(
    (i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           i.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = availableIntegrations.filter(
    (i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           i.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenConnect = (id: string) => {
    setConnectingId(id);
    setError(null);
  };

  const handleCloseConnect = () => {
    setConnectingId(null);
    setError(null);
  };

  const handleConnect = async (id: string, config: Record<string, string>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const integration = integrations.find((i) => i.id === id);
      if (!integration) throw new Error("Integration not found");
      
      await createIntegration({
        integrationType: id,
        name: integration.name,
        config,
      });
      
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, connected: true, configuredAt: new Date() } : i))
      );
      setConnectingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect integration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration?.dbId) return;
    
    try {
      await deleteIntegration(integration.dbId);
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, connected: false, configuredAt: undefined, dbId: undefined } : i))
      );
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Integrations</h2>
          <p className="text-sm text-tertiary">Connect third-party apps to enhance your workflow</p>
        </div>
        <Input
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          icon={SearchIcon}
          className="sm:max-w-xs"
        />
      </div>

      {/* Connected Integrations */}
      {filteredConnected.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-secondary">Connected ({filteredConnected.length})</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredConnected.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onDisconnect={() => handleDisconnect(integration.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      {filteredAvailable.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-secondary">Available ({filteredAvailable.length})</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredAvailable.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={() => handleOpenConnect(integration.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredConnected.length === 0 && filteredAvailable.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-secondary">No integrations found</p>
          <p className="mt-1 text-sm text-tertiary">Try adjusting your search</p>
        </div>
      )}

      {/* Connection Dialog */}
      {connectingId && (
        <ConnectionDialog
          integration={integrations.find((i) => i.id === connectingId)!}
          onClose={handleCloseConnect}
          onConnect={(config) => handleConnect(connectingId, config)}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  );
};

interface IntegrationCardProps {
  integration: IntegrationUI;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const IntegrationCard: FC<IntegrationCardProps> = ({ integration, onConnect, onDisconnect }) => {
  const Icon = integration.icon;

  return (
    <div className="flex flex-col rounded-xl border border-secondary bg-primary p-4 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
            <Icon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-primary">{integration.name}</h4>
            </div>
            <p className="text-xs text-tertiary">{integration.provider}</p>
          </div>
        </div>
        <button className="rounded-md p-1 text-tertiary hover:bg-secondary hover:text-secondary">
          <More size={18} color="currentColor" variant="Outline" />
        </button>
      </div>

      <p className="mt-3 text-sm text-tertiary">{integration.description}</p>

      <div className="mt-4 flex items-center justify-between">
        {integration.connected ? (
          <>
            <div className="flex items-center gap-1.5 text-success-primary">
              <TickCircle size={16} color="currentColor" variant="Bold" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            <Button size="sm" color="tertiary" onClick={onDisconnect}>
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <Badge size="sm" color="gray">Not Connected</Badge>
            <Button size="sm" color="primary" onClick={onConnect}>
              Connect
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CONNECTION DIALOG
// ============================================================================

interface ConnectionDialogProps {
  integration: IntegrationUI;
  onClose: () => void;
  onConnect: (config: Record<string, string>) => void;
  isSubmitting: boolean;
  error: string | null;
}

const ConnectionDialog: FC<ConnectionDialogProps> = ({
  integration,
  onClose,
  onConnect,
  isSubmitting,
  error,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(formData);
  };

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Get form fields based on integration type
  const getFormFields = () => {
    switch (integration.id) {
      case "slack":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Webhook URL</label>
              <Input
                placeholder="https://hooks.slack.com/services/..."
                value={formData.webhookUrl || ""}
                onChange={(value) => updateField("webhookUrl", value)}
                isRequired
              />
              <p className="text-xs text-tertiary">
                Create an incoming webhook in your Slack workspace settings
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Channel (optional)</label>
              <Input
                placeholder="#alerts"
                value={formData.channel || ""}
                onChange={(value) => updateField("channel", value)}
              />
            </div>
          </>
        );

      case "teams":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Webhook URL</label>
            <Input
              placeholder="https://outlook.office.com/webhook/..."
              value={formData.webhookUrl || ""}
              onChange={(value) => updateField("webhookUrl", value)}
              isRequired
            />
            <p className="text-xs text-tertiary">
              Create an incoming webhook connector in your Teams channel
            </p>
          </div>
        );

      case "pagerduty":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Integration Key</label>
              <Input
                placeholder="Enter your PagerDuty integration key"
                value={formData.integrationKey || ""}
                onChange={(value) => updateField("integrationKey", value)}
                isRequired
              />
              <p className="text-xs text-tertiary">
                Found in PagerDuty under Service → Integrations → Events API v2
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="allSeverities"
                checked={formData.allSeverities === "true"}
                onChange={(e) => updateField("allSeverities", e.target.checked ? "true" : "false")}
                className="rounded border-secondary"
              />
              <label htmlFor="allSeverities" className="text-sm text-secondary">
                Send all alert severities (not just critical)
              </label>
            </div>
          </>
        );

      case "datadog":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">API Key</label>
              <Input
                type="password"
                placeholder="Enter your Datadog API key"
                value={formData.apiKey || ""}
                onChange={(value) => updateField("apiKey", value)}
                isRequired
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Site (optional)</label>
              <select
                value={formData.site || "datadoghq.com"}
                onChange={(e) => updateField("site", e.target.value)}
                className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm"
              >
                <option value="datadoghq.com">US (datadoghq.com)</option>
                <option value="datadoghq.eu">EU (datadoghq.eu)</option>
                <option value="us3.datadoghq.com">US3 (us3.datadoghq.com)</option>
                <option value="us5.datadoghq.com">US5 (us5.datadoghq.com)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendMetrics"
                  checked={formData.sendMetrics !== "false"}
                  onChange={(e) => updateField("sendMetrics", e.target.checked ? "true" : "false")}
                  className="rounded border-secondary"
                />
                <label htmlFor="sendMetrics" className="text-sm text-secondary">
                  Send cost metrics
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendEvents"
                  checked={formData.sendEvents !== "false"}
                  onChange={(e) => updateField("sendEvents", e.target.checked ? "true" : "false")}
                  className="rounded border-secondary"
                />
                <label htmlFor="sendEvents" className="text-sm text-secondary">
                  Send alert events
                </label>
              </div>
            </div>
          </>
        );

      case "jira":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Jira URL</label>
              <Input
                placeholder="https://your-domain.atlassian.net"
                value={formData.baseUrl || ""}
                onChange={(value) => updateField("baseUrl", value)}
                isRequired
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Email</label>
              <Input
                type="email"
                placeholder="your-email@company.com"
                value={formData.email || ""}
                onChange={(value) => updateField("email", value)}
                isRequired
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">API Token</label>
              <Input
                type="password"
                placeholder="Enter your Jira API token"
                value={formData.apiToken || ""}
                onChange={(value) => updateField("apiToken", value)}
                isRequired
              />
              <p className="text-xs text-tertiary">
                Generate at id.atlassian.com/manage-profile/security/api-tokens
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Project Key</label>
              <Input
                placeholder="e.g., OPS, ENG, COST"
                value={formData.projectKey || ""}
                onChange={(value) => updateField("projectKey", value)}
                isRequired
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Issue Type (optional)</label>
              <Input
                placeholder="Task"
                value={formData.issueType || ""}
                onChange={(value) => updateField("issueType", value)}
              />
            </div>
          </>
        );

      case "webhook":
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Webhook URL</label>
              <Input
                placeholder="https://api.example.com/webhook"
                value={formData.url || ""}
                onChange={(value) => updateField("url", value)}
                isRequired
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Secret (optional)</label>
              <Input
                type="password"
                placeholder="For HMAC signature verification"
                value={formData.secret || ""}
                onChange={(value) => updateField("secret", value)}
              />
              <p className="text-xs text-tertiary">
                If provided, payloads will be signed with X-TokenTRA-Signature header
              </p>
            </div>
          </>
        );

      default:
        return <p className="text-sm text-tertiary">Configuration not available for this integration.</p>;
    }
  };

  const Icon = integration.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-secondary bg-primary p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-primary">Connect {integration.name}</h3>
              <p className="text-xs text-tertiary">{integration.provider}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-tertiary hover:bg-secondary hover:text-secondary"
          >
            <CloseCircle size={20} color="currentColor" variant="Outline" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {getFormFields()}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-error-secondary/10 p-3 text-sm text-error-primary">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" color="tertiary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
