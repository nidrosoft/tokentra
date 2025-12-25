import type { Metadata } from "next";

interface TeamMembersPageProps {
  params: Promise<{ teamId: string }>;
}

export async function generateMetadata({ params }: TeamMembersPageProps): Promise<Metadata> {
  const { teamId } = await params;
  return {
    title: `Team Members - ${teamId} - TokenTRA`,
    description: "Manage team members",
  };
}

export default async function TeamMembersPage({ params }: TeamMembersPageProps) {
  const { teamId } = await params;
  
  return (
    <div>
      <h1>Team Members: {teamId}</h1>
    </div>
  );
}
