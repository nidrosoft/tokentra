import { z } from "zod";

export const alertTypes = [
  "spend_threshold",
  "spend_anomaly",
  "budget_threshold",
  "forecast_exceeded",
  "provider_error",
  "usage_spike",
] as const;

export const alertChannelTypes = ["email", "slack", "pagerduty", "webhook"] as const;
export const alertOperators = ["gt", "gte", "lt", "lte", "eq"] as const;

export const createAlertSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(alertTypes),
  condition: z.object({
    metric: z.string(),
    operator: z.enum(alertOperators),
    value: z.number(),
    timeWindow: z.string().optional(),
  }),
  channels: z.array(z.object({
    type: z.enum(alertChannelTypes),
    config: z.record(z.string()),
  })).min(1, "At least one channel is required"),
  enabled: z.boolean().default(true),
});

export const updateAlertSchema = createAlertSchema.partial();

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
