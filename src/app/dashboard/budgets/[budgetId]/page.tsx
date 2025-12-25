import type { Metadata } from "next";

interface BudgetDetailPageProps {
  params: Promise<{ budgetId: string }>;
}

export async function generateMetadata({ params }: BudgetDetailPageProps): Promise<Metadata> {
  const { budgetId } = await params;
  return {
    title: `Budget ${budgetId} - TokenTRA`,
    description: "View budget details",
  };
}

export default async function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const { budgetId } = await params;
  
  return (
    <div>
      <h1>Budget: {budgetId}</h1>
    </div>
  );
}
