import type { ProviderType } from "@/lib/providers/types";

interface ModelPricing {
  inputPer1k: number;
  outputPer1k: number;
  cachedInputPer1k?: number;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-4o": { inputPer1k: 0.0025, outputPer1k: 0.01, cachedInputPer1k: 0.00125 },
  "gpt-4o-mini": { inputPer1k: 0.00015, outputPer1k: 0.0006, cachedInputPer1k: 0.000075 },
  "gpt-4-turbo": { inputPer1k: 0.01, outputPer1k: 0.03 },
  "gpt-4": { inputPer1k: 0.03, outputPer1k: 0.06 },
  "gpt-3.5-turbo": { inputPer1k: 0.0005, outputPer1k: 0.0015 },
  "o1": { inputPer1k: 0.015, outputPer1k: 0.06, cachedInputPer1k: 0.0075 },
  "o1-mini": { inputPer1k: 0.003, outputPer1k: 0.012, cachedInputPer1k: 0.0015 },
  "claude-3-5-sonnet-20241022": { inputPer1k: 0.003, outputPer1k: 0.015, cachedInputPer1k: 0.0003 },
  "claude-3-5-haiku-20241022": { inputPer1k: 0.0008, outputPer1k: 0.004, cachedInputPer1k: 0.00008 },
  "claude-3-opus-20240229": { inputPer1k: 0.015, outputPer1k: 0.075, cachedInputPer1k: 0.0015 },
  "gemini-1.5-pro": { inputPer1k: 0.00125, outputPer1k: 0.005 },
  "gemini-1.5-flash": { inputPer1k: 0.000075, outputPer1k: 0.0003 },
};

export function getModelPricing(model: string): ModelPricing | null {
  const normalizedModel = model.toLowerCase();
  
  for (const [key, pricing] of Object.entries(MODEL_PRICING)) {
    if (normalizedModel.includes(key.toLowerCase())) {
      return pricing;
    }
  }
  
  return null;
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): number {
  const pricing = getModelPricing(model);
  if (!pricing) return 0;
  
  const inputCost = ((inputTokens - cachedTokens) / 1000) * pricing.inputPer1k;
  const outputCost = (outputTokens / 1000) * pricing.outputPer1k;
  const cachedCost = pricing.cachedInputPer1k 
    ? (cachedTokens / 1000) * pricing.cachedInputPer1k 
    : 0;
  
  return inputCost + outputCost + cachedCost;
}

export function estimateMonthlyCost(
  dailyCost: number,
  daysInMonth: number = 30
): number {
  return dailyCost * daysInMonth;
}
