import type { UsageRecord, UsageSummary, DateRangeParams, FilterParams } from "@/types";

export class UsageService {
  async getUsage(params: DateRangeParams & FilterParams): Promise<UsageRecord[]> {
    // TODO: Implement with Supabase
    return [];
  }

  async getUsageSummary(params: DateRangeParams & FilterParams): Promise<UsageSummary> {
    // TODO: Implement with Supabase
    return {
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      totalRequests: 0,
      avgTokensPerRequest: 0,
    };
  }

  async getTokensByModel(params: DateRangeParams): Promise<Record<string, number>> {
    // TODO: Implement with Supabase
    return {};
  }

  async getRequestVolume(params: DateRangeParams & { granularity?: string }): Promise<Array<{ date: string; requests: number }>> {
    // TODO: Implement with Supabase
    return [];
  }
}

export const usageService = new UsageService();
