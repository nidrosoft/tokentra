export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  apiKeyPatterns: string[];
  monthlyBudget?: number;
  currentMonthSpend: number;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: "lead" | "member";
  joinedAt: Date;
}

export interface TeamCostSummary {
  teamId: string;
  teamName: string;
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  topModels: { model: string; cost: number }[];
}
