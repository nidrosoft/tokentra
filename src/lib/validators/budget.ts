import { z } from "zod";

export const budgetPeriods = ["daily", "weekly", "monthly", "quarterly", "yearly"] as const;
export const budgetScopeTypes = ["organization", "team", "project", "cost_center", "provider", "model"] as const;

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  period: z.enum(budgetPeriods),
  scope: z.object({
    type: z.enum(budgetScopeTypes),
    id: z.string().optional(),
  }),
  alertThresholds: z.array(z.number().min(0).max(100)).default([50, 80, 100]),
  hardLimit: z.boolean().default(false),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
