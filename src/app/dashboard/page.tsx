import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/overview";

export const metadata: Metadata = {
  title: "Dashboard - TokenTRA",
  description: "AI cost overview and key metrics",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
