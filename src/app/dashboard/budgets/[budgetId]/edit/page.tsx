import type { Metadata } from "next";

interface EditBudgetPageProps {
  params: Promise<{ budgetId: string }>;
}

export async function generateMetadata({ params }: EditBudgetPageProps): Promise<Metadata> {
  const { budgetId } = await params;
  return {
    title: `Edit Budget ${budgetId} - TokenTRA`,
    description: "Edit budget settings",
  };
}

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
  const { budgetId } = await params;
  
  return (
    <div>
      <h1>Edit Budget: {budgetId}</h1>
    </div>
  );
}
