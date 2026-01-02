/**
 * Rate Limiter - Provider API Rate Limiting
 * 
 * Implements a token bucket algorithm to prevent API throttling
 * when syncing data from providers.
 */

import type { ProviderType } from '../types';

// Rate limits per provider (requests per minute)
const PROVIDER_RATE_LIMITS: Record<ProviderType, number> = {
  openai: 60,
  anthropic: 60,
  google: 100,
  azure: 100,
  aws: 100,
  xai: 60,
  deepseek: 60,
  mistral: 60,
  cohere: 100,
  groq: 100,
};

interface RequestQueue {
  requestsPerMinute: number;
  queue: Array<() => void>;
  requestTimes: number[];
  processing: boolean;
}

export class RateLimiter {
  private queues: Map<string, RequestQueue> = new Map();

  /**
   * Acquire a rate limit slot for a provider
   * Will wait if rate limit is exceeded
   */
  async acquire(provider: ProviderType): Promise<void> {
    if (!this.queues.has(provider)) {
      this.queues.set(provider, {
        requestsPerMinute: PROVIDER_RATE_LIMITS[provider] || 60,
        queue: [],
        requestTimes: [],
        processing: false,
      });
    }

    return new Promise((resolve) => {
      const queue = this.queues.get(provider)!;
      queue.queue.push(resolve);
      this.processQueue(provider);
    });
  }

  /**
   * Get current rate limit status for a provider
   */
  getStatus(provider: ProviderType): { 
    available: number; 
    total: number; 
    resetInMs: number 
  } {
    const queue = this.queues.get(provider);
    if (!queue) {
      const total = PROVIDER_RATE_LIMITS[provider] || 60;
      return { available: total, total, resetInMs: 0 };
    }

    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = queue.requestTimes.filter((t) => t > oneMinuteAgo);
    const available = Math.max(0, queue.requestsPerMinute - recentRequests.length);
    
    const resetInMs = recentRequests.length > 0 
      ? Math.max(0, recentRequests[0] + 60000 - Date.now())
      : 0;

    return {
      available,
      total: queue.requestsPerMinute,
      resetInMs,
    };
  }

  /**
   * Set custom rate limit for a provider
   */
  setRateLimit(provider: ProviderType, requestsPerMinute: number): void {
    const queue = this.queues.get(provider);
    if (queue) {
      queue.requestsPerMinute = requestsPerMinute;
    } else {
      this.queues.set(provider, {
        requestsPerMinute,
        queue: [],
        requestTimes: [],
        processing: false,
      });
    }
  }

  /**
   * Clear rate limit tracking for a provider
   */
  reset(provider: ProviderType): void {
    const queue = this.queues.get(provider);
    if (queue) {
      queue.requestTimes = [];
    }
  }

  private async processQueue(provider: ProviderType): Promise<void> {
    const queue = this.queues.get(provider);
    if (!queue || queue.processing) return;

    queue.processing = true;

    while (queue.queue.length > 0) {
      // Clean old request times (older than 1 minute)
      const oneMinuteAgo = Date.now() - 60000;
      queue.requestTimes = queue.requestTimes.filter((t) => t > oneMinuteAgo);

      // Check if we're at the rate limit
      if (queue.requestTimes.length >= queue.requestsPerMinute) {
        // Calculate wait time until oldest request expires
        const waitTime = queue.requestTimes[0] - oneMinuteAgo + 100; // +100ms buffer
        await this.sleep(Math.max(waitTime, 100));
        continue;
      }

      // Process next request
      const resolve = queue.queue.shift();
      if (resolve) {
        queue.requestTimes.push(Date.now());
        resolve();
      }
    }

    queue.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}
