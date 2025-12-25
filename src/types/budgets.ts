export type BudgetPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type BudgetScopeType = "organization" | "team" | "project" | "cost_center" | "provider" | "model";

export type BudgetStatus = "ok" | "warning" | "exceeded";

export interface Budget {
  id: string;
  organizationId: string;
  name: string;
  amount: number;
  currency: string;
  period: BudgetPeriod;
  scope: BudgetScope;
  alertThresholds: number[];
  hardLimit: boolean;
  currentSpend: number;
  status: BudgetStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetScope {
  type: BudgetScopeType;
  id?: string;
  name?: string;
}

export interface BudgetProgress {
  budgetId: string;
  spent: number;
  remaining: number;
  percentUsed: number;
  projectedOverage: number;
  daysRemaining: number;
}
