import type { Metadata } from "next";
import { SettingsOverview } from "@/components/dashboard/settings";

export const metadata: Metadata = {
  title: "Settings - TokenTRA",
  description: "Manage your account settings",
};

export default function SettingsPage() {
  return <SettingsOverview />;
}
