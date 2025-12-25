import { BaseProvider } from "./base";
import type { ProviderType, ProviderCredentials, RateLimitInfo } from "./types";
import type { CostRecord, UsageRecord } from "@/types";

export class AnthropicProvider extends BaseProvider {
  type: ProviderType = "anthropic";
  name = "Anthropic";
  
  private baseUrl = "https://api.anthropic.com/v1";
  
  constructor(credentials: ProviderCredentials) {
    super(credentials);
  }
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "x-api-key": this.credentials.apiKey!,
          "anthropic-version": "2024-01-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      return response.ok || response.status === 400;
    } catch {
      return false;
    }
  }
  
  async syncUsage(from: Date, to: Date): Promise<UsageRecord[]> {
    // TODO: Implement Anthropic usage sync
    return [];
  }
  
  async syncCosts(from: Date, to: Date): Promise<CostRecord[]> {
    // TODO: Implement Anthropic costs sync
    return [];
  }
  
  async getModels(): Promise<string[]> {
    return [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ];
  }
  
  async getRateLimits(): Promise<RateLimitInfo> {
    return {
      requestsPerMinute: 4000,
      tokensPerMinute: 400000,
      currentUsage: 0,
    };
  }
}
