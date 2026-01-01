/**
 * DeepSeek Provider Adapter
 * 
 * Fetches usage data from DeepSeek's API. Uses OpenAI-compatible API format.
 * Models: DeepSeek-V3, DeepSeek-R1, DeepSeek-Coder
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  DeepSeekCredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// DeepSeek model pricing (per million tokens)
const DEEPSEEK_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'deepseek-chat': { inputPerMillion: 0.14, outputPerMillion: 0.28 },
  'deepseek-reasoner': { inputPerMillion: 0.55, outputPerMillion: 2.19 },
  'deepseek-coder': { inputPerMillion: 0.14, outputPerMillion: 0.28 },
  'deepseek-v3': { inputPerMillion: 0.27, outputPerMillion: 1.10 },
  'deepseek-r1': { inputPerMillion: 0.55, outputPerMillion: 2.19 },
  'deepseek-r1-lite': { inputPerMillion: 0.14, outputPerMillion: 0.28 },
};

const BASE_URL = 'https://api.deepseek.com/v1';

export class DeepSeekAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'deepseek';

  async testConnection(credentials: DeepSeekCredentials): Promise<ConnectionTestResult> {
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
    credentials: DeepSeekCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    // DeepSeek has a usage API at /dashboard/billing/usage
    // However, it requires dashboard access, not API key
    console.log('[DeepSeek] Usage API requires dashboard access');
    return [];
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    for (const [key, price] of Object.entries(DEEPSEEK_PRICING)) {
      if (model.toLowerCase().includes(key)) {
        return price;
      }
    }
    return DEEPSEEK_PRICING['deepseek-chat'];
  }
}
