import type { Metadata } from "next";

interface CostCenterDetailPageProps {
  params: Promise<{ costCenterId: string }>;
}

export async function generateMetadata({ params }: CostCenterDetailPageProps): Promise<Metadata> {
  const { costCenterId } = await params;
  return {
    title: `Cost Center ${costCenterId} - TokenTRA`,
    description: "View cost center details",
  };
}

export default async function CostCenterDetailPage({ params }: CostCenterDetailPageProps) {
  const { costCenterId } = await params;
  
  return (
    <div>
      <h1>Cost Center: {costCenterId}</h1>
    </div>
  );
}
