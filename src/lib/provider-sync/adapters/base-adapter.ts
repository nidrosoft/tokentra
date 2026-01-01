/**
 * Base Provider Adapter - Abstract class for all provider adapters
 * 
 * Provides common functionality and interface that all provider
 * adapters must implement.
 */

import type {
  ProviderType,
  ProviderCredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
  ProviderAdapter,
} from '../types';
import { RateLimiter, getRateLimiter } from '../utils/rate-limiter';
import { RetryHandler, getRetryHandler } from '../utils/retry-handler';

export abstract class BaseProviderAdapter implements ProviderAdapter {
  abstract readonly provider: ProviderType;
  
  protected rateLimiter: RateLimiter;
  protected retryHandler: RetryHandler;

  constructor(rateLimiter?: RateLimiter, retryHandler?: RetryHandler) {
    this.rateLimiter = rateLimiter || getRateLimiter();
    this.retryHandler = retryHandler || getRetryHandler();
  }

  /**
   * Test connection with credentials
   */
  abstract testConnection(credentials: ProviderCredentials): Promise<ConnectionTestResult>;

  /**
   * Fetch usage data for a time window
   */
  abstract fetchUsage(
    credentials: ProviderCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]>;

  /**
   * Make a rate-limited API request with retry logic
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit,
    context: string
  ): Promise<T> {
    // Acquire rate limit slot
    await this.rateLimiter.acquire(this.provider);

    // Execute with retry
    return this.retryHandler.withRetry(async () => {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error = new Error(
          errorBody.error?.message || 
          errorBody.message || 
          `HTTP ${response.status}`
        ) as Error & { status: number; code?: string };
        error.status = response.status;
        error.code = errorBody.error?.code || errorBody.code;
        throw error;
      }

      return response.json();
    }, context);
  }

  /**
   * Calculate cost from tokens using model pricing
   */
  protected calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
    cachedTokens: number = 0
  ): number {
    const pricing = this.getModelPricing(model);
    
    const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillion;
    
    // Cached tokens are typically 90% cheaper
    const cachedDiscount = (cachedTokens / 1_000_000) * pricing.inputPerMillion * 0.9;
    
    return Math.max(0, inputCost + outputCost - cachedDiscount);
  }

  /**
   * Get model pricing - override in subclasses
   */
  protected abstract getModelPricing(model: string): {
    inputPerMillion: number;
    outputPerMillion: number;
  };

  /**
   * Convert Unix timestamp to Date
   */
  protected unixToDate(unix: number): Date {
    return new Date(unix * 1000);
  }

  /**
   * Convert Date to Unix timestamp
   */
  protected dateToUnix(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }

  /**
   * Get bucket width string for API calls
   */
  protected getBucketWidth(granularity: string): string {
    switch (granularity) {
      case '1m': return '1m';
      case '1h': return '1h';
      case '1d': return '1d';
      default: return '1h';
    }
  }
}
