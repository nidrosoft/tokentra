import type { Metadata } from "next";

interface TeamDetailPageProps {
  params: Promise<{ teamId: string }>;
}

export async function generateMetadata({ params }: TeamDetailPageProps): Promise<Metadata> {
  const { teamId } = await params;
  return {
    title: `Team ${teamId} - TokenTRA`,
    description: "View team details",
  };
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = await params;
  
  return (
    <div>
      <h1>Team: {teamId}</h1>
    </div>
  );
}
