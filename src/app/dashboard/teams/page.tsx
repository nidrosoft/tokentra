import type { Metadata } from "next";
import { TeamsOverview } from "@/components/dashboard/teams";

export const metadata: Metadata = {
  title: "Teams - TokenTRA",
  description: "Manage your teams",
};

export default function TeamsPage() {
  return <TeamsOverview />;
}
