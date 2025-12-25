import { z } from "zod";

export const providerTypes = ["openai", "anthropic", "azure", "google", "aws"] as const;

export const connectProviderSchema = z.object({
  type: z.enum(providerTypes),
  apiKey: z.string().min(1, "API key is required").optional(),
  organizationId: z.string().optional(),
  endpoint: z.string().url().optional(),
  region: z.string().optional(),
});

export const updateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
});

export type ConnectProviderInput = z.infer<typeof connectProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
