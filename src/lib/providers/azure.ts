import { BaseProvider } from "./base";
import type { ProviderType, ProviderCredentials, RateLimitInfo } from "./types";
import type { CostRecord, UsageRecord } from "@/types";

export class AzureProvider extends BaseProvider {
  type: ProviderType = "azure";
  name = "Azure OpenAI";
  
  constructor(credentials: ProviderCredentials) {
    super(credentials);
  }
  
  async testConnection(): Promise<boolean> {
    // TODO: Implement Azure connection test
    return false;
  }
  
  async syncUsage(from: Date, to: Date): Promise<UsageRecord[]> {
    // TODO: Implement Azure usage sync
    return [];
  }
  
  async syncCosts(from: Date, to: Date): Promise<CostRecord[]> {
    // TODO: Implement Azure costs sync
    return [];
  }
  
  async getModels(): Promise<string[]> {
    // TODO: Fetch from Azure deployments
    return [];
  }
  
  async getRateLimits(): Promise<RateLimitInfo> {
    return {
      requestsPerMinute: 0,
      tokensPerMinute: 0,
      currentUsage: 0,
    };
  }
}
