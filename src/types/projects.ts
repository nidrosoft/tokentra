export interface Project {
  id: string;
  organizationId: string;
  teamId?: string;
  name: string;
  description?: string;
  tags: string[];
  apiKeyPatterns: string[];
  monthlyBudget?: number;
  currentMonthSpend: number;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCostSummary {
  projectId: string;
  projectName: string;
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  costByProvider: Record<string, number>;
}

export interface CostCenter {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  code: string;
  monthlyBudget?: number;
  currentMonthSpend: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostAllocation {
  id: string;
  costCenterId: string;
  teamId?: string;
  projectId?: string;
  percentage: number;
  createdAt: Date;
}
