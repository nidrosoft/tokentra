import type { Team, TeamCostSummary } from "@/types";

export const mockTeams: Team[] = [
  {
    id: "team_1",
    organizationId: "org_1",
    name: "Engineering",
    description: "Core engineering team building product features",
    apiKeyPatterns: ["eng-*", "dev-*"],
    monthlyBudget: 5000,
    currentMonthSpend: 3250.75,
    memberCount: 12,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
  },
  {
    id: "team_2",
    organizationId: "org_1",
    name: "Data Science",
    description: "ML and analytics team for insights",
    apiKeyPatterns: ["ds-*", "ml-*"],
    monthlyBudget: 8000,
    currentMonthSpend: 6500.00,
    memberCount: 8,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
  },
  {
    id: "team_3",
    organizationId: "org_1",
    name: "Product",
    description: "Product development and design",
    apiKeyPatterns: ["prod-*"],
    monthlyBudget: 3000,
    currentMonthSpend: 1200.50,
    memberCount: 6,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
  },
  {
    id: "team_4",
    organizationId: "org_1",
    name: "Customer Success",
    description: "Customer support and success operations",
    apiKeyPatterns: ["cs-*", "support-*"],
    monthlyBudget: 2000,
    currentMonthSpend: 850.25,
    memberCount: 5,
    createdAt: new Date("2024-02-01T00:00:00Z"),
    updatedAt: new Date("2024-02-15T00:00:00Z"),
  },
  {
    id: "team_5",
    organizationId: "org_1",
    name: "Research",
    description: "R&D and experimental projects",
    apiKeyPatterns: ["research-*", "exp-*"],
    monthlyBudget: 10000,
    currentMonthSpend: 7800.00,
    memberCount: 4,
    createdAt: new Date("2024-03-01T00:00:00Z"),
    updatedAt: new Date("2024-03-15T00:00:00Z"),
  },
];

export const mockTeamCostSummaries: TeamCostSummary[] = [
  {
    teamId: "team_1",
    teamName: "Engineering",
    totalCost: 3250.75,
    totalTokens: 32500000,
    totalRequests: 15000,
    topModels: [
      { model: "gpt-4o", cost: 2000 },
      { model: "claude-3-5-sonnet", cost: 1000 },
      { model: "gpt-4o-mini", cost: 250.75 },
    ],
  },
  {
    teamId: "team_2",
    teamName: "Data Science",
    totalCost: 6500.00,
    totalTokens: 65000000,
    totalRequests: 25000,
    topModels: [
      { model: "gpt-4o", cost: 4000 },
      { model: "claude-3-opus", cost: 2000 },
      { model: "gemini-1.5-pro", cost: 500 },
    ],
  },
];

export const mockTeamsSummary = {
  totalTeams: mockTeams.length,
  totalMembers: mockTeams.reduce((sum, t) => sum + t.memberCount, 0),
  totalSpend: mockTeams.reduce((sum, t) => sum + t.currentMonthSpend, 0),
  totalBudget: mockTeams.reduce((sum, t) => sum + (t.monthlyBudget || 0), 0),
};
