"use client";

import type { FC } from "react";
import { useState } from "react";
import { SearchNormal1, TickCircle, Add, More } from "iconsax-react";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

interface Integration {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: FC<{ size: number; className?: string }>;
  category: "notifications" | "analytics" | "billing" | "collaboration";
  connected: boolean;
  configuredAt?: Date;
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

const mockIntegrations: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    provider: "SLACK",
    description: "Send alerts and notifications to Slack channels",
    icon: SlackIcon,
    category: "notifications",
    connected: true,
    configuredAt: new Date("2024-02-15"),
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    provider: "PAGERDUTY",
    description: "Trigger incidents for critical cost alerts",
    icon: PagerDutyIcon,
    category: "notifications",
    connected: true,
    configuredAt: new Date("2024-03-01"),
  },
  {
    id: "email",
    name: "Email (SMTP)",
    provider: "EMAIL",
    description: "Send email notifications via custom SMTP server",
    icon: EmailIcon,
    category: "notifications",
    connected: true,
    configuredAt: new Date("2024-01-10"),
  },
  {
    id: "webhook",
    name: "Webhooks",
    provider: "WEBHOOK",
    description: "Send alerts to custom webhook endpoints",
    icon: WebhookIcon,
    category: "notifications",
    connected: false,
  },
  {
    id: "ms-teams",
    name: "Microsoft Teams",
    provider: "MICROSOFT",
    description: "Send notifications to Microsoft Teams channels",
    icon: MSTeamsIcon,
    category: "collaboration",
    connected: false,
  },
  {
    id: "jira",
    name: "Jira",
    provider: "ATLASSIAN",
    description: "Create Jira tickets from cost alerts",
    icon: JiraIcon,
    category: "collaboration",
    connected: false,
  },
  {
    id: "datadog",
    name: "Datadog",
    provider: "DATADOG",
    description: "Export cost metrics to Datadog dashboards",
    icon: DatadogIcon,
    category: "analytics",
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
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);

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

  const handleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: true, configuredAt: new Date() } : i))
    );
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: false, configuredAt: undefined } : i))
    );
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
                onConnect={() => handleConnect(integration.id)}
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
    </div>
  );
};

interface IntegrationCardProps {
  integration: Integration;
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
