export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Pricing per 1M tokens (simplified)
  const pricing: Record<string, Record<string, { input: number; output: number }>> = {
    openai: {
      "gpt-4o": { input: 2.5, output: 10 },
      "gpt-4o-mini": { input: 0.15, output: 0.6 },
      "gpt-4-turbo": { input: 10, output: 30 },
      "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
    },
    anthropic: {
      "claude-3-5-sonnet-20241022": { input: 3, output: 15 },
      "claude-3-opus-20240229": { input: 15, output: 75 },
      "claude-3-haiku-20240307": { input: 0.25, output: 1.25 },
    },
    google: {
      "gemini-1.5-pro": { input: 1.25, output: 5 },
      "gemini-1.5-flash": { input: 0.075, output: 0.3 },
    },
  };

  const modelPricing = pricing[provider]?.[model];
  if (!modelPricing) {
    return 0;
  }

  const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
  const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

  return inputCost + outputCost;
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}
