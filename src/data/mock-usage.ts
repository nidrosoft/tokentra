import type { UsageRecord, UsageTrend, UsageSummary, TokenUsageByModel } from "@/types";

// Generate 30 days of usage trend data
export const mockUsageTrends: UsageTrend[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseRequests = 4000 + Math.random() * 3000;
  const baseTokens = baseRequests * 250;
  return {
    date: date.toISOString().split("T")[0],
    requests: Math.round(baseRequests),
    inputTokens: Math.round(baseTokens * 0.7),
    outputTokens: Math.round(baseTokens * 0.3),
    avgLatency: Math.round(150 + Math.random() * 100),
  };
});

// Usage summary
export const mockUsageSummary: UsageSummary = {
  totalRequests: 156432,
  totalInputTokens: 89234567,
  totalOutputTokens: 38234123,
  totalCachedTokens: 12456789,
  avgLatency: 187,
  successRate: 99.2,
};

// Token usage by model
export const mockTokenUsageByModel: TokenUsageByModel[] = [
  { model: "gpt-4o", provider: "openai", inputTokens: 35000000, outputTokens: 15000000, cachedTokens: 5000000, requests: 62000 },
  { model: "claude-3-5-sonnet", provider: "anthropic", inputTokens: 28000000, outputTokens: 12000000, cachedTokens: 4000000, requests: 48000 },
  { model: "gpt-4o-mini", provider: "openai", inputTokens: 15000000, outputTokens: 6000000, cachedTokens: 2000000, requests: 28000 },
  { model: "gemini-1.5-pro", provider: "google", inputTokens: 8000000, outputTokens: 3500000, cachedTokens: 1000000, requests: 12000 },
  { model: "claude-3-haiku", provider: "anthropic", inputTokens: 3234567, outputTokens: 1734123, cachedTokens: 456789, requests: 6432 },
];

// Token breakdown by type
export const mockTokenBreakdown = {
  input: 89234567,
  output: 38234123,
  cached: 12456789,
  total: 139925479,
};

// Detailed usage records for the table
export const mockUsageRecords: UsageRecord[] = [
  {
    id: "usage_1",
    organizationId: "org_1",
    provider: "openai",
    model: "gpt-4o",
    teamId: "engineering",
    projectId: "chat-app",
    inputTokens: 2500,
    outputTokens: 850,
    cachedTokens: 500,
    latencyMs: 245,
    statusCode: 200,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "usage_2",
    organizationId: "org_1",
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    teamId: "product",
    projectId: "search-api",
    inputTokens: 1800,
    outputTokens: 620,
    cachedTokens: 0,
    latencyMs: 189,
    statusCode: 200,
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: "usage_3",
    organizationId: "org_1",
    provider: "openai",
    model: "gpt-4o-mini",
    teamId: "engineering",
    projectId: "analytics",
    inputTokens: 4500,
    outputTokens: 1200,
    cachedTokens: 1500,
    latencyMs: 98,
    statusCode: 200,
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    id: "usage_4",
    organizationId: "org_1",
    provider: "google",
    model: "gemini-1.5-pro",
    teamId: "research",
    projectId: "docs-assistant",
    inputTokens: 3200,
    outputTokens: 980,
    cachedTokens: 800,
    latencyMs: 312,
    statusCode: 200,
    timestamp: new Date(Date.now() - 1000 * 60 * 38),
  },
  {
    id: "usage_5",
    organizationId: "org_1",
    provider: "anthropic",
    model: "claude-3-haiku",
    teamId: "sales",
    projectId: "lead-gen",
    inputTokens: 1200,
    outputTokens: 450,
    cachedTokens: 0,
    latencyMs: 67,
    statusCode: 200,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "usage_6",
    organizationId: "org_1",
    provider: "openai",
    model: "gpt-4o",
    teamId: "engineering",
    projectId: "code-review",
    inputTokens: 5800,
    outputTokens: 2100,
    cachedTokens: 2000,
    latencyMs: 423,
    statusCode: 200,
    timestamp: new Date(Date.now() - 1000 * 60 * 52),
  },
  {
    id: "usage_7",
    organizationId: "org_1",
    provider: "openai",
    model: "gpt-4o",
    teamId: "product",
    projectId: "chat-app",
    inputTokens: 1500,
    outputTokens: 0,
    cachedTokens: 0,
    latencyMs: 0,
    statusCode: 429,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "usage_8",
    organizationId: "org_1",
    provider: "google",
    model: "gemini-1.5-flash",
    teamId: "marketing",
    projectId: "content-gen",
    inputTokens: 2800,
    outputTokens: 1100,
    cachedTokens: 600,
    latencyMs: 156,
    statusCode: 200,
    timestamp: new Date(Date.now() - 1000 * 60 * 75),
  },
];
