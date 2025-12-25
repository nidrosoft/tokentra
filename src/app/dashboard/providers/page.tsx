import type { Metadata } from "next";
import { ProvidersOverview } from "@/components/dashboard/providers";

export const metadata: Metadata = {
  title: "Providers - TokenTRA",
  description: "Manage your AI provider connections",
};

export default function ProvidersPage() {
  return <ProvidersOverview />;
}
