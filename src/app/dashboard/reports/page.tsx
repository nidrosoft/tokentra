import type { Metadata } from "next";
import { ReportsOverview } from "@/components/dashboard/reports";

export const metadata: Metadata = {
  title: "Reports - TokenTRA",
  description: "Generate and view cost reports",
};

export default function ReportsPage() {
  return <ReportsOverview />;
}
