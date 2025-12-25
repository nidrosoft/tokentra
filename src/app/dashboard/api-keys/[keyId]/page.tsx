import type { Metadata } from "next";

interface ApiKeyDetailPageProps {
  params: Promise<{ keyId: string }>;
}

export async function generateMetadata({ params }: ApiKeyDetailPageProps): Promise<Metadata> {
  const { keyId } = await params;
  return {
    title: `API Key ${keyId} - TokenTRA`,
    description: "View API key details",
  };
}

export default async function ApiKeyDetailPage({ params }: ApiKeyDetailPageProps) {
  const { keyId } = await params;
  
  return (
    <div>
      <h1>API Key: {keyId}</h1>
    </div>
  );
}
