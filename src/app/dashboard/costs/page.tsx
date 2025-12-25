import type { Metadata } from "next";
import { CostAnalysis } from "@/components/dashboard/costs";

export const metadata: Metadata = {
  title: "Cost Analysis - TokenTRA",
  description: "Analyze your AI costs across all providers",
};

export default function CostsPage() {
  return <CostAnalysis />;
}
