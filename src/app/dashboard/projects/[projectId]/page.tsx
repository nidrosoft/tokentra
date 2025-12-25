import type { Metadata } from "next";

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { projectId } = await params;
  return {
    title: `Project ${projectId} - TokenTRA`,
    description: "View project details",
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = await params;
  
  return (
    <div>
      <h1>Project: {projectId}</h1>
    </div>
  );
}
