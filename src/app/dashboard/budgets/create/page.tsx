import type { Metadata } from "next";
import { CreateBudgetPageContent } from "./create-budget-content";

export const metadata: Metadata = {
  title: "Create Budget - TokenTRA",
  description: "Create a new budget",
};

export default function CreateBudgetPage() {
  return <CreateBudgetPageContent />;
}
