import type { Metadata } from "next";

interface ProjectSettingsPageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: ProjectSettingsPageProps): Promise<Metadata> {
  const { projectId } = await params;
  return {
    title: `Project Settings - ${projectId} - TokenTRA`,
    description: "Configure project settings",
  };
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { projectId } = await params;
  
  return (
    <div>
      <h1>Project Settings: {projectId}</h1>
    </div>
  );
}
