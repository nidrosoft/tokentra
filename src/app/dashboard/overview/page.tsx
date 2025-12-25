import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/overview";

export const metadata: Metadata = {
  title: "Overview - TokenTRA",
  description: "AI cost overview and key metrics",
};

export default function OverviewPage() {
  return <DashboardOverview />;
}
