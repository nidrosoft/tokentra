import type { Metadata } from "next";
import { UsageAnalytics } from "@/components/dashboard/usage";

export const metadata: Metadata = {
  title: "Usage Analytics - TokenTRA",
  description: "Analyze your AI usage patterns",
};

export default function UsagePage() {
  return <UsageAnalytics />;
}
