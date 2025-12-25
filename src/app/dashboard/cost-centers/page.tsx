import type { Metadata } from "next";
import { CostCentersOverview } from "@/components/dashboard/cost-centers";

export const metadata: Metadata = {
  title: "Cost Centers - TokenTRA",
  description: "Manage your cost centers",
};

export default function CostCentersPage() {
  return <CostCentersOverview />;
}
