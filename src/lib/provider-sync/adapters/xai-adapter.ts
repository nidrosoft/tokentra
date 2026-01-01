/**
 * xAI (Grok) Provider Adapter
 * 
 * Fetches usage data from xAI's API. Uses OpenAI-compatible API format.
 * Models: Grok-2, Grok-2 Mini, Grok-1.5
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  XAICredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// xAI model pricing (per million tokens) - estimated based on market rates
const XAI_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'grok-2': { inputPerMillion: 2.00, outputPerMillion: 10.00 },
  'grok-2-mini': { inputPerMillion: 0.20, outputPerMillion: 1.00 },
  'grok-2-1212': { inputPerMillion: 2.00, outputPerMillion: 10.00 },
  'grok-2-vision-1212': { inputPerMillion: 2.00, outputPerMillion: 10.00 },
  'grok-beta': { inputPerMillion: 5.00, outputPerMillion: 15.00 },
};

const BASE_URL = 'https://api.x.ai/v1';

export class XAIAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'xai';

  async testConnection(credentials: XAICredentials): Promise<ConnectionTestResult> {
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
          error: error.error?.message || `HTTP ${response.status}`,
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
    credentials: XAICredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    // xAI doesn't have a public usage API yet
    // Usage tracking would need to be done via request logging
    console.log('[xAI] Usage API not yet available, returning empty');
    return [];
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    for (const [key, price] of Object.entries(XAI_PRICING)) {
      if (model.toLowerCase().includes(key)) {
        return price;
      }
    }
    return XAI_PRICING['grok-2'];
  }
}
