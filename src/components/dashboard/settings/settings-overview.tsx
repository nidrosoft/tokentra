"use client";

import type { FC } from "react";
import { useState } from "react";
import { Tabs, TabList } from "@/components/application/tabs/tabs";
import { NativeSelect } from "@/components/base/select/select-native";
import { GeneralSettings } from "./general-settings";
import { NotificationSettings } from "./notification-settings";
import { IntegrationSettings } from "./integration-settings";
import { ApiKeyList } from "./api-key-list";
import { BillingSettings } from "./billing-settings";
import { SecuritySettings } from "./security-settings";

const tabs = [
  { id: "general", label: "General" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "api-keys", label: "API Keys" },
  { id: "billing", label: "Billing" },
  { id: "security", label: "Security" },
];

export const SettingsOverview: FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("general");

  const renderTabContent = () => {
    switch (selectedTab) {
      case "general":
        return <GeneralSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "integrations":
        return <IntegrationSettings />;
      case "api-keys":
        return <ApiKeyList />;
      case "billing":
        return <BillingSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 pb-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-5">
        <p className="text-md text-tertiary">Manage your account and organization settings.</p>

        {/* Mobile Select */}
        <NativeSelect
          aria-label="Settings tabs"
          className="md:hidden"
          value={selectedTab}
          onChange={(event) => setSelectedTab(event.target.value)}
          options={tabs.map((tab) => ({ label: tab.label, value: tab.id }))}
        />

        {/* Desktop Tabs */}
        <div className="-mx-4 -my-1 hidden overflow-auto px-4 py-1 md:block lg:-mx-8 lg:px-8">
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(value) => setSelectedTab(value as string)}
          >
            <TabList type="button-minimal" items={tabs} />
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-secondary bg-primary p-6 shadow-xs">
        {renderTabContent()}
      </div>
    </div>
  );
};
