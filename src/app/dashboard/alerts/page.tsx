import type { Metadata } from "next";
import { AlertsOverview } from "@/components/dashboard/alerts";

export const metadata: Metadata = {
  title: "Alerts - TokenTRA",
  description: "Manage your cost alert rules",
};

export default function AlertsPage() {
  return <AlertsOverview />;
}
