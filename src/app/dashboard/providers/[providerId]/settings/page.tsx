import type { Metadata } from "next";

interface ProviderSettingsPageProps {
  params: Promise<{ providerId: string }>;
}

export async function generateMetadata({ params }: ProviderSettingsPageProps): Promise<Metadata> {
  const { providerId } = await params;
  return {
    title: `Provider Settings - ${providerId} - TokenTRA`,
    description: "Configure provider settings",
  };
}

export default async function ProviderSettingsPage({ params }: ProviderSettingsPageProps) {
  const { providerId } = await params;
  
  return (
    <div>
      <h1>Provider Settings: {providerId}</h1>
    </div>
  );
}
