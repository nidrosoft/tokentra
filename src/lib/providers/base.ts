import type { ProviderType, ProviderCredentials, RateLimitInfo } from "./types";
import type { CostRecord, UsageRecord } from "@/types";

export abstract class BaseProvider {
  abstract type: ProviderType;
  abstract name: string;
  
  protected credentials: ProviderCredentials;
  
  constructor(credentials: ProviderCredentials) {
    this.credentials = credentials;
  }
  
  abstract testConnection(): Promise<boolean>;
  
  abstract syncUsage(from: Date, to: Date): Promise<UsageRecord[]>;
  
  abstract syncCosts(from: Date, to: Date): Promise<CostRecord[]>;
  
  abstract getModels(): Promise<string[]>;
  
  abstract getRateLimits(): Promise<RateLimitInfo>;
}
