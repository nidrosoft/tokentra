import type { Metadata } from "next";

interface ProviderDetailPageProps {
  params: Promise<{ providerId: string }>;
}

export async function generateMetadata({ params }: ProviderDetailPageProps): Promise<Metadata> {
  const { providerId } = await params;
  return {
    title: `Provider ${providerId} - TokenTRA`,
    description: "View provider details and usage",
  };
}

export default async function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  const { providerId } = await params;
  
  return (
    <div>
      <h1>Provider: {providerId}</h1>
    </div>
  );
}
