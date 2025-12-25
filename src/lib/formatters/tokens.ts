export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) {
    return `${(tokens / 1_000_000_000).toFixed(1)}B`;
  }
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

export function formatTokensDetailed(tokens: number): string {
  return new Intl.NumberFormat("en-US").format(tokens);
}

export function calculateTokenCost(
  tokens: number,
  costPer1k: number
): number {
  return (tokens / 1000) * costPer1k;
}
