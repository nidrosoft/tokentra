import { BaseProvider } from "./base";
import type { ProviderType, ProviderCredentials, RateLimitInfo } from "./types";
import type { CostRecord, UsageRecord } from "@/types";

export class GoogleProvider extends BaseProvider {
  type: ProviderType = "google";
  name = "Google Vertex AI";
  
  constructor(credentials: ProviderCredentials) {
    super(credentials);
  }
  
  async testConnection(): Promise<boolean> {
    // TODO: Implement Google connection test
    return false;
  }
  
  async syncUsage(from: Date, to: Date): Promise<UsageRecord[]> {
    // TODO: Implement Google usage sync
    return [];
  }
  
  async syncCosts(from: Date, to: Date): Promise<CostRecord[]> {
    // TODO: Implement Google costs sync
    return [];
  }
  
  async getModels(): Promise<string[]> {
    return [
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-pro",
    ];
  }
  
  async getRateLimits(): Promise<RateLimitInfo> {
    return {
      requestsPerMinute: 0,
      tokensPerMinute: 0,
      currentUsage: 0,
    };
  }
}
