import type { Metadata } from "next";

interface TeamSettingsPageProps {
  params: Promise<{ teamId: string }>;
}

export async function generateMetadata({ params }: TeamSettingsPageProps): Promise<Metadata> {
  const { teamId } = await params;
  return {
    title: `Team Settings - ${teamId} - TokenTRA`,
    description: "Configure team settings",
  };
}

export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
  const { teamId } = await params;
  
  return (
    <div>
      <h1>Team Settings: {teamId}</h1>
    </div>
  );
}
