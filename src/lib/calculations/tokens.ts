export interface TokenBreakdown {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalTokens: number;
}

export function calculateTotalTokens(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): number {
  return inputTokens + outputTokens + cachedTokens;
}

export function calculateTokenCost(
  tokens: number,
  pricePerMillion: number
): number {
  return (tokens / 1_000_000) * pricePerMillion;
}

export function estimateTokensFromText(text: string): number {
  // Rough estimation: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) {
    return `${(tokens / 1_000_000_000).toFixed(2)}B`;
  }
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toLocaleString();
}

export function calculateTokenEfficiency(
  inputTokens: number,
  outputTokens: number
): number {
  if (inputTokens === 0) return 0;
  return outputTokens / inputTokens;
}

export function aggregateTokenUsage(
  records: Array<{ inputTokens: number; outputTokens: number; cachedTokens?: number }>
): TokenBreakdown {
  return records.reduce(
    (acc, record) => ({
      inputTokens: acc.inputTokens + record.inputTokens,
      outputTokens: acc.outputTokens + record.outputTokens,
      cachedTokens: acc.cachedTokens + (record.cachedTokens || 0),
      totalTokens:
        acc.totalTokens +
        record.inputTokens +
        record.outputTokens +
        (record.cachedTokens || 0),
    }),
    { inputTokens: 0, outputTokens: 0, cachedTokens: 0, totalTokens: 0 }
  );
}
