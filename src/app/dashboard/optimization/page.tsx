import type { Metadata } from "next";
import { OptimizationOverview } from "@/components/dashboard/optimization";

export const metadata: Metadata = {
  title: "Optimization - TokenTRA",
  description: "AI-powered cost optimization recommendations",
};

export default function OptimizationPage() {
  return <OptimizationOverview />;
}
