/**
 * Mistral AI Provider Adapter
 * 
 * Fetches usage data from Mistral's API.
 * Models: Mistral Large, Mistral Medium, Mistral Small, Mixtral, Codestral
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  MistralCredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// Mistral model pricing (per million tokens)
const MISTRAL_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'mistral-large-latest': { inputPerMillion: 2.00, outputPerMillion: 6.00 },
  'mistral-large': { inputPerMillion: 2.00, outputPerMillion: 6.00 },
  'mistral-medium': { inputPerMillion: 2.70, outputPerMillion: 8.10 },
  'mistral-small-latest': { inputPerMillion: 0.20, outputPerMillion: 0.60 },
  'mistral-small': { inputPerMillion: 0.20, outputPerMillion: 0.60 },
  'open-mistral-7b': { inputPerMillion: 0.25, outputPerMillion: 0.25 },
  'open-mixtral-8x7b': { inputPerMillion: 0.70, outputPerMillion: 0.70 },
  'open-mixtral-8x22b': { inputPerMillion: 2.00, outputPerMillion: 6.00 },
  'codestral-latest': { inputPerMillion: 0.20, outputPerMillion: 0.60 },
  'codestral': { inputPerMillion: 0.20, outputPerMillion: 0.60 },
  'mistral-embed': { inputPerMillion: 0.10, outputPerMillion: 0 },
  'pixtral-large-latest': { inputPerMillion: 2.00, outputPerMillion: 6.00 },
  'ministral-8b': { inputPerMillion: 0.10, outputPerMillion: 0.10 },
  'ministral-3b': { inputPerMillion: 0.04, outputPerMillion: 0.04 },
};

const BASE_URL = 'https://api.mistral.ai/v1';

export class MistralAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'mistral';

  async testConnection(credentials: MistralCredentials): Promise<ConnectionTestResult> {
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
          modelsAvailable: data.data?.length || 0,
        },
        permissions: ['models:read', 'completions:create'],
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
    credentials: MistralCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    // Mistral has a billing API but requires console access
    // Usage can be tracked via request logging
    console.log('[Mistral] Usage API requires console access');
    return [];
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    for (const [key, price] of Object.entries(MISTRAL_PRICING)) {
      if (model.toLowerCase().includes(key.toLowerCase())) {
        return price;
      }
    }
    return MISTRAL_PRICING['mistral-small-latest'];
  }
}
