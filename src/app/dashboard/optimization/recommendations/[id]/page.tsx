import type { Metadata } from "next";

interface RecommendationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RecommendationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Recommendation ${id} - TokenTRA`,
    description: "View recommendation details",
  };
}

export default async function RecommendationDetailPage({ params }: RecommendationDetailPageProps) {
  const { id } = await params;
  
  return (
    <div>
      <h1>Recommendation: {id}</h1>
    </div>
  );
}
