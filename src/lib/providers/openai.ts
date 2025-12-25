import { BaseProvider } from "./base";
import type { ProviderType, ProviderCredentials, RateLimitInfo } from "./types";
import type { CostRecord, UsageRecord } from "@/types";

export class OpenAIProvider extends BaseProvider {
  type: ProviderType = "openai";
  name = "OpenAI";
  
  private baseUrl = "https://api.openai.com/v1";
  
  constructor(credentials: ProviderCredentials) {
    super(credentials);
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.credentials.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  async syncUsage(from: Date, to: Date): Promise<UsageRecord[]> {
    // TODO: Implement OpenAI usage sync
    return [];
  }
  
  async syncCosts(from: Date, to: Date): Promise<CostRecord[]> {
    // TODO: Implement OpenAI costs sync
    return [];
  }
  
  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.credentials.apiKey}`,
        },
      });
      
      const data = await response.json();
      return data.data
        .filter((m: { id: string }) => m.id.includes("gpt") || m.id.includes("o1"))
        .map((m: { id: string }) => m.id);
    } catch {
      return [];
    }
  }
  
  async getRateLimits(): Promise<RateLimitInfo> {
    return {
      requestsPerMinute: 10000,
      tokensPerMinute: 2000000,
      currentUsage: 0,
    };
  }
}
