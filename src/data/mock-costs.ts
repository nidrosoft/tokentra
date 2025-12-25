import type { CostRecord, CostTrend, CostBreakdown, CostSummary } from "@/types";

// Generate 30 days of cost trend data
export const mockCostTrends: CostTrend[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseValue = 1200 + Math.random() * 800;
  return {
    date: date.toISOString().split("T")[0],
    cost: Math.round(baseValue * 100) / 100,
    tokens: Math.round(baseValue * 10000),
    requests: Math.round(baseValue * 4),
  };
});

// Provider breakdown data
export const mockProviderBreakdown: CostBreakdown[] = [
  { dimension: "provider", value: "OpenAI", cost: 7234.50, percentage: 56.3, tokens: 72345000, requests: 28938 },
  { dimension: "provider", value: "Anthropic", cost: 3421.80, percentage: 26.6, tokens: 34218000, requests: 13687 },
  { dimension: "provider", value: "Google AI", cost: 1456.20, percentage: 11.3, tokens: 14562000, requests: 5825 },
  { dimension: "provider", value: "Azure OpenAI", cost: 734.82, percentage: 5.7, tokens: 7348200, requests: 2939 },
];

// Model breakdown data
export const mockModelBreakdown: CostBreakdown[] = [
  { dimension: "model", value: "gpt-4o", cost: 4521.30, percentage: 35.2, tokens: 45213000, requests: 18085 },
  { dimension: "model", value: "claude-3-5-sonnet", cost: 2890.45, percentage: 22.5, tokens: 28904500, requests: 11562 },
  { dimension: "model", value: "gpt-4o-mini", cost: 1845.20, percentage: 14.4, tokens: 18452000, requests: 7381 },
  { dimension: "model", value: "gemini-1.5-pro", cost: 1234.50, percentage: 9.6, tokens: 12345000, requests: 4938 },
  { dimension: "model", value: "claude-3-haiku", cost: 987.65, percentage: 7.7, tokens: 9876500, requests: 3951 },
  { dimension: "model", value: "gpt-4-turbo", cost: 734.22, percentage: 5.7, tokens: 7342200, requests: 2937 },
  { dimension: "model", value: "Other", cost: 633.50, percentage: 4.9, tokens: 6335000, requests: 2534 },
];

// Team breakdown data
export const mockTeamBreakdown: CostBreakdown[] = [
  { dimension: "team", value: "Engineering", cost: 5234.50, percentage: 40.7, tokens: 52345000, requests: 20938 },
  { dimension: "team", value: "Product", cost: 3421.80, percentage: 26.6, tokens: 34218000, requests: 13687 },
  { dimension: "team", value: "Research", cost: 2156.20, percentage: 16.8, tokens: 21562000, requests: 8625 },
  { dimension: "team", value: "Sales", cost: 1234.82, percentage: 9.6, tokens: 12348200, requests: 4939 },
  { dimension: "team", value: "Marketing", cost: 799.50, percentage: 6.2, tokens: 7995000, requests: 3198 },
];

// Cost summary
export const mockCostSummary: CostSummary = {
  totalCost: 12847.32,
  totalTokens: 128473200,
  totalRequests: 51389,
  avgCostPerRequest: 0.25,
  costByProvider: {
    openai: 7234.50,
    anthropic: 3421.80,
    google: 1456.20,
    azure: 734.82,
  },
  costByModel: {
    "gpt-4o": 4521.30,
    "claude-3-5-sonnet": 2890.45,
    "gpt-4o-mini": 1845.20,
  },
  costByTeam: {
    engineering: 5234.50,
    product: 3421.80,
    research: 2156.20,
  },
  costByProject: {
    "chat-app": 4521.30,
    "search-api": 3421.80,
    analytics: 2890.45,
  },
};

// Detailed cost records for the table
export const mockCostRecords: CostRecord[] = [
  {
    id: "cost_1",
    organizationId: "org_1",
    provider: "openai",
    model: "gpt-4o",
    teamId: "engineering",
    projectId: "chat-app",
    tokensInput: 125000,
    tokensOutput: 45000,
    cost: 425.50,
    currency: "USD",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "cost_2",
    organizationId: "org_1",
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    teamId: "product",
    projectId: "search-api",
    tokensInput: 98000,
    tokensOutput: 32000,
    cost: 312.80,
    currency: "USD",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "cost_3",
    organizationId: "org_1",
    provider: "openai",
    model: "gpt-4o-mini",
    teamId: "engineering",
    projectId: "analytics",
    tokensInput: 450000,
    tokensOutput: 125000,
    cost: 145.20,
    currency: "USD",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
  },
  {
    id: "cost_4",
    organizationId: "org_1",
    provider: "google",
    model: "gemini-1.5-pro",
    teamId: "research",
    projectId: "docs-assistant",
    tokensInput: 78000,
    tokensOutput: 28000,
    cost: 198.45,
    currency: "USD",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: "cost_5",
    organizationId: "org_1",
    provider: "anthropic",
    model: "claude-3-haiku",
    teamId: "sales",
    projectId: "lead-gen",
    tokensInput: 320000,
    tokensOutput: 95000,
    cost: 87.65,
    currency: "USD",
    timestamp: new Date(Date.now() - 1000 * 60 * 150),
  },
  {
    id: "cost_6",
    organizationId: "org_1",
    provider: "azure",
    model: "gpt-4-turbo",
    teamId: "engineering",
    projectId: "code-review",
    tokensInput: 65000,
    tokensOutput: 22000,
    cost: 234.82,
    currency: "USD",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
  {
    id: "cost_7",
    organizationId: "org_1",
    provider: "openai",
    model: "gpt-4o",
    teamId: "product",
    projectId: "chat-app",
    tokensInput: 112000,
    tokensOutput: 38000,
    cost: 378.90,
    currency: "USD",
    timestamp: new Date(Date.now() - 1000 * 60 * 210),
  },
  {
    id: "cost_8",
    organizationId: "org_1",
    provider: "google",
    model: "gemini-1.5-flash",
    teamId: "marketing",
    projectId: "content-gen",
    tokensInput: 520000,
    tokensOutput: 180000,
    cost: 156.30,
    currency: "USD",
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
  },
];
