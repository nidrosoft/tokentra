import type { Metadata } from "next";
import { BudgetsOverview } from "@/components/dashboard/budgets";

export const metadata: Metadata = {
  title: "Budgets - TokenTRA",
  description: "Manage your AI spending budgets",
};

export default function BudgetsPage() {
  return <BudgetsOverview />;
}
