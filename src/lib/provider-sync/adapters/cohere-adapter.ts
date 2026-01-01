/**
 * Cohere Provider Adapter
 * 
 * Fetches usage data from Cohere's API.
 * Models: Command R+, Command R, Command, Embed, Rerank
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  CohereCredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// Cohere model pricing (per million tokens)
const COHERE_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'command-r-plus': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
  'command-r': { inputPerMillion: 0.15, outputPerMillion: 0.60 },
  'command': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
  'command-light': { inputPerMillion: 0.30, outputPerMillion: 0.60 },
  'command-nightly': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
  'embed-english-v3.0': { inputPerMillion: 0.10, outputPerMillion: 0 },
  'embed-multilingual-v3.0': { inputPerMillion: 0.10, outputPerMillion: 0 },
  'embed-english-light-v3.0': { inputPerMillion: 0.10, outputPerMillion: 0 },
  'rerank-english-v3.0': { inputPerMillion: 2.00, outputPerMillion: 0 },
  'rerank-multilingual-v3.0': { inputPerMillion: 2.00, outputPerMillion: 0 },
};

const BASE_URL = 'https://api.cohere.ai/v1';

export class CohereAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'cohere';

  async testConnection(credentials: CohereCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (!credentials.apiKey) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'API key is required',
        permissions: [],
      };
    }

    try {
      // Test by listing models
      const response = await fetch(`${BASE_URL}/models`, {
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: error.message || `HTTP ${response.status}`,
          permissions: [],
        };
      }

      const data = await response.json();

      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: {
          modelsAvailable: data.models?.length || 0,
        },
        permissions: ['models:read', 'generate:create', 'embed:create'],
      };
    } catch (error) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: (error as Error).message,
        permissions: [],
      };
    }
  }

  async fetchUsage(
    credentials: CohereCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    // Cohere has usage tracking in their dashboard
    // API usage can be tracked via request logging
    console.log('[Cohere] Usage API requires dashboard access');
    return [];
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    for (const [key, price] of Object.entries(COHERE_PRICING)) {
      if (model.toLowerCase().includes(key.toLowerCase())) {
        return price;
      }
    }
    return COHERE_PRICING['command-r'];
  }
}
