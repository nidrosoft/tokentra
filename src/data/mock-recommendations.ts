import type { Recommendation, OptimizationSummary } from "@/types";

export const mockRecommendations: Recommendation[] = [
  {
    id: "rec_1",
    organizationId: "org_1",
    type: "model_downgrade",
    title: "Switch to GPT-4o-mini for simple tasks",
    description: "Analysis shows 45% of your GPT-4o requests could use GPT-4o-mini with similar quality, saving approximately $1,200/month.",
    impact: {
      estimatedMonthlySavings: 1200,
      savingsPercentage: 35,
      confidence: "high",
      affectedRequests: 15000,
    },
    status: "pending",
    details: {
      currentState: { model: "gpt-4o", avgCost: 0.025, requestCount: 15000 },
      suggestedState: { model: "gpt-4o-mini", avgCost: 0.0015 },
      implementation: "Update your routing logic to use GPT-4o-mini for classification and simple Q&A tasks.",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
  },
  {
    id: "rec_2",
    organizationId: "org_1",
    type: "caching_opportunity",
    title: "Enable prompt caching for repetitive requests",
    description: "Detected 30% of requests have identical system prompts. Enabling caching could save $800/month.",
    impact: {
      estimatedMonthlySavings: 800,
      savingsPercentage: 25,
      confidence: "high",
      affectedRequests: 10000,
    },
    status: "pending",
    details: {
      currentState: { cacheHitRate: 0, duplicatePrompts: 10000 },
      suggestedState: { cacheHitRate: 0.3 },
      implementation: "Enable prompt caching in your API configuration.",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 27),
  },
  {
    id: "rec_3",
    organizationId: "org_1",
    type: "prompt_optimization",
    title: "Reduce system prompt length",
    description: "Your average system prompt is 2,500 tokens. Optimizing to 1,000 tokens could save $500/month.",
    impact: {
      estimatedMonthlySavings: 500,
      savingsPercentage: 15,
      confidence: "medium",
      affectedRequests: 20000,
    },
    status: "applied",
    details: {
      currentState: { avgSystemPromptTokens: 2500 },
      suggestedState: { avgSystemPromptTokens: 1000 },
      implementation: "Refactor system prompts to be more concise.",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: "rec_4",
    organizationId: "org_1",
    type: "batching_opportunity",
    title: "Batch similar requests together",
    description: "Grouping 500+ similar requests per hour into batches could reduce overhead costs by $350/month.",
    impact: {
      estimatedMonthlySavings: 350,
      savingsPercentage: 12,
      confidence: "medium",
      affectedRequests: 8000,
    },
    status: "pending",
    details: {
      currentState: { avgBatchSize: 1, requestsPerHour: 500 },
      suggestedState: { avgBatchSize: 10 },
      implementation: "Implement request batching for non-real-time workloads.",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
  },
  {
    id: "rec_5",
    organizationId: "org_1",
    type: "provider_switch",
    title: "Use Claude for long-context tasks",
    description: "Claude 3.5 Sonnet offers better pricing for 100K+ context windows. Switching could save $600/month.",
    impact: {
      estimatedMonthlySavings: 600,
      savingsPercentage: 20,
      confidence: "medium",
      affectedRequests: 5000,
    },
    status: "pending",
    details: {
      currentState: { provider: "openai", model: "gpt-4o", avgContextLength: 120000 },
      suggestedState: { provider: "anthropic", model: "claude-3-5-sonnet" },
      implementation: "Route long-context requests to Claude 3.5 Sonnet.",
      risks: ["May require prompt adjustments", "Different response format"],
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 29),
  },
  {
    id: "rec_6",
    organizationId: "org_1",
    type: "unused_capacity",
    title: "Remove unused Azure deployment",
    description: "Your Azure OpenAI deployment has had 0 requests in 30 days. Removing it saves $150/month in base costs.",
    impact: {
      estimatedMonthlySavings: 150,
      savingsPercentage: 100,
      confidence: "high",
      affectedRequests: 0,
    },
    status: "dismissed",
    details: {
      currentState: { deployment: "azure-gpt4-eastus", lastUsed: "30+ days ago" },
      suggestedState: { deployment: "removed" },
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    dismissedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
  },
];

// Savings history for chart
export const mockSavingsHistory = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseSavings = 50 + Math.random() * 100;
  return {
    date: date.toISOString().split("T")[0],
    savings: Math.round(baseSavings * (1 + i * 0.05)),
    applied: Math.round(baseSavings * 0.6 * (1 + i * 0.03)),
  };
});

// Optimization summary
export const mockOptimizationSummary: OptimizationSummary = {
  totalPotentialSavings: 3100,
  recommendationCount: 5,
  appliedSavings: 500,
  topOpportunities: mockRecommendations.filter((r) => r.status === "pending").slice(0, 3),
};

// Optimization score (0-100)
export const mockOptimizationScore = {
  score: 72,
  breakdown: {
    modelEfficiency: 68,
    cachingUtilization: 45,
    promptOptimization: 85,
    costAllocation: 90,
  },
};
