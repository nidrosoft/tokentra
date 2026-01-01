import type { Provider } from "@/types";
import type { ProviderType } from "@/lib/provider-sync/types";

export interface ProviderWithStats extends Provider {
  totalSpend: number;
  totalTokens: number;
  totalRequests: number;
  modelsUsed: string[];
  monthlyChange: number;
}

export const mockProviders: ProviderWithStats[] = [
  {
    id: "provider_openai_1",
    organizationId: "org_1",
    type: "openai",
    name: "OpenAI",
    status: "connected",
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 15),
    config: {
      apiKeyMasked: "sk-...abc123",
      organizationId: "org-xxx",
    },
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    totalSpend: 7234.50,
    totalTokens: 72345000,
    totalRequests: 28938,
    modelsUsed: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-preview"],
    monthlyChange: 12.5,
  },
  {
    id: "provider_anthropic_1",
    organizationId: "org_1",
    type: "anthropic",
    name: "Anthropic",
    status: "connected",
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 30),
    config: {
      apiKeyMasked: "sk-ant-...xyz789",
    },
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    totalSpend: 3421.80,
    totalTokens: 34218000,
    totalRequests: 13687,
    modelsUsed: ["claude-3-5-sonnet", "claude-3-haiku", "claude-3-opus"],
    monthlyChange: 8.3,
  },
  {
    id: "provider_google_1",
    organizationId: "org_1",
    type: "google",
    name: "Google AI",
    status: "connected",
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 45),
    config: {
      apiKeyMasked: "AIza...def456",
    },
    createdAt: new Date("2024-01-05T00:00:00Z"),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45),
    totalSpend: 1456.20,
    totalTokens: 14562000,
    totalRequests: 5825,
    modelsUsed: ["gemini-1.5-pro", "gemini-1.5-flash"],
    monthlyChange: -3.2,
  },
  {
    id: "provider_azure_1",
    organizationId: "org_1",
    type: "azure",
    name: "Azure OpenAI",
    status: "error",
    syncError: "API key expired. Please update your credentials.",
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    config: {
      apiKeyMasked: "azure-...ghi789",
      endpoint: "https://myorg.openai.azure.com",
      region: "eastus",
    },
    createdAt: new Date("2024-01-03T00:00:00Z"),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    totalSpend: 734.82,
    totalTokens: 7348200,
    totalRequests: 2939,
    modelsUsed: ["gpt-4", "gpt-35-turbo"],
    monthlyChange: 0,
  },
  {
    id: "provider_aws_1",
    organizationId: "org_1",
    type: "aws",
    name: "AWS Bedrock",
    status: "disconnected",
    config: {},
    createdAt: new Date("2024-01-10T00:00:00Z"),
    updatedAt: new Date("2024-01-10T00:00:00Z"),
    totalSpend: 0,
    totalTokens: 0,
    totalRequests: 0,
    modelsUsed: [],
    monthlyChange: 0,
  },
];

export const availableProviders: { type: ProviderType; name: string; description: string }[] = [
  { type: "openai", name: "OpenAI", description: "GPT-5, GPT-4o, o3, DALL-E 4, Whisper" },
  { type: "anthropic", name: "Anthropic", description: "Claude 4.5 Opus/Sonnet/Haiku" },
  { type: "google", name: "Google AI", description: "Gemini 2.5 Pro, Gemini 2.5 Flash" },
  { type: "azure", name: "Azure OpenAI", description: "Enterprise OpenAI models on Azure" },
  { type: "aws", name: "AWS Bedrock", description: "Claude, Titan, Llama, Nova on AWS" },
  { type: "xai", name: "xAI (Grok)", description: "Grok-2, Grok-2 Mini, Grok Vision" },
  { type: "deepseek", name: "DeepSeek", description: "DeepSeek-V3, DeepSeek-R1, DeepSeek-Coder" },
  { type: "mistral", name: "Mistral AI", description: "Mistral Large, Mixtral, Codestral" },
  { type: "cohere", name: "Cohere", description: "Command R+, Command R, Embed, Rerank" },
  { type: "groq", name: "Groq", description: "Llama 3.3, Mixtral, Gemma - Ultra-fast" },
];
