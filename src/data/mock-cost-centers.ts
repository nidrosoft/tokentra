import type { CostCenter, CostAllocation } from "@/types";

export const mockCostCenters: CostCenter[] = [
  {
    id: "cc_1",
    organizationId: "org_1",
    name: "Engineering",
    description: "All engineering department costs",
    code: "ENG-001",
    monthlyBudget: 15000,
    currentMonthSpend: 12500,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-03-15"),
  },
  {
    id: "cc_2",
    organizationId: "org_1",
    name: "Research & Development",
    description: "R&D experiments and prototypes",
    code: "RND-001",
    monthlyBudget: 8000,
    currentMonthSpend: 6200,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-10"),
  },
  {
    id: "cc_3",
    organizationId: "org_1",
    name: "Customer Success",
    description: "Customer-facing AI features",
    code: "CS-001",
    monthlyBudget: 5000,
    currentMonthSpend: 4800,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-03-18"),
  },
  {
    id: "cc_4",
    organizationId: "org_1",
    name: "Marketing",
    description: "Marketing automation and content",
    code: "MKT-001",
    monthlyBudget: 3000,
    currentMonthSpend: 1200,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-03-12"),
  },
  {
    id: "cc_5",
    organizationId: "org_1",
    name: "Operations",
    description: "Internal operations and automation",
    code: "OPS-001",
    monthlyBudget: 2000,
    currentMonthSpend: 850,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-20"),
  },
];

export const mockCostAllocations: CostAllocation[] = [
  { id: "alloc_1", costCenterId: "cc_1", teamId: "team_1", percentage: 60, createdAt: new Date("2024-01-01") },
  { id: "alloc_2", costCenterId: "cc_1", teamId: "team_3", percentage: 40, createdAt: new Date("2024-01-01") },
  { id: "alloc_3", costCenterId: "cc_2", teamId: "team_5", percentage: 100, createdAt: new Date("2024-01-15") },
  { id: "alloc_4", costCenterId: "cc_3", teamId: "team_4", percentage: 100, createdAt: new Date("2024-02-01") },
  { id: "alloc_5", costCenterId: "cc_4", projectId: "project_1", percentage: 50, createdAt: new Date("2024-02-15") },
  { id: "alloc_6", costCenterId: "cc_4", projectId: "project_4", percentage: 50, createdAt: new Date("2024-02-15") },
];

export const mockCostCentersSummary = {
  totalCostCenters: mockCostCenters.length,
  totalBudget: mockCostCenters.reduce((sum, cc) => sum + (cc.monthlyBudget || 0), 0),
  totalSpend: mockCostCenters.reduce((sum, cc) => sum + cc.currentMonthSpend, 0),
  avgUtilization: Math.round(
    (mockCostCenters.reduce((sum, cc) => sum + (cc.monthlyBudget ? (cc.currentMonthSpend / cc.monthlyBudget) * 100 : 0), 0) /
      mockCostCenters.length)
  ),
};
