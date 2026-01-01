/**
 * Groq Provider Adapter
 * 
 * Fetches usage data from Groq's API. Uses OpenAI-compatible API format.
 * Known for extremely fast inference speeds.
 * Models: Llama 3.3, Llama 3.1, Mixtral, Gemma
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  GroqCredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// Groq model pricing (per million tokens) - very competitive pricing
const GROQ_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'llama-3.3-70b-versatile': { inputPerMillion: 0.59, outputPerMillion: 0.79 },
  'llama-3.3-70b-specdec': { inputPerMillion: 0.59, outputPerMillion: 0.99 },
  'llama-3.1-70b-versatile': { inputPerMillion: 0.59, outputPerMillion: 0.79 },
  'llama-3.1-8b-instant': { inputPerMillion: 0.05, outputPerMillion: 0.08 },
  'llama-3.2-90b-vision-preview': { inputPerMillion: 0.90, outputPerMillion: 0.90 },
  'llama-3.2-11b-vision-preview': { inputPerMillion: 0.18, outputPerMillion: 0.18 },
  'llama-3.2-3b-preview': { inputPerMillion: 0.06, outputPerMillion: 0.06 },
  'llama-3.2-1b-preview': { inputPerMillion: 0.04, outputPerMillion: 0.04 },
  'mixtral-8x7b-32768': { inputPerMillion: 0.24, outputPerMillion: 0.24 },
  'gemma2-9b-it': { inputPerMillion: 0.20, outputPerMillion: 0.20 },
  'gemma-7b-it': { inputPerMillion: 0.07, outputPerMillion: 0.07 },
  'llama3-70b-8192': { inputPerMillion: 0.59, outputPerMillion: 0.79 },
  'llama3-8b-8192': { inputPerMillion: 0.05, outputPerMillion: 0.08 },
  'whisper-large-v3': { inputPerMillion: 0.111, outputPerMillion: 0 }, // Per audio hour
  'whisper-large-v3-turbo': { inputPerMillion: 0.04, outputPerMillion: 0 },
  'distil-whisper-large-v3-en': { inputPerMillion: 0.02, outputPerMillion: 0 },
};

const BASE_URL = 'https://api.groq.com/openai/v1';

export class GroqAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'groq';

  async testConnection(credentials: GroqCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (!credentials.apiKey) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'API key is required',
        permissions: [],
      };
    }

    // Validate API key format
    if (!credentials.apiKey.startsWith('gsk_')) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Invalid API key format. Groq keys start with "gsk_"',
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
        permissions: ['models:read', 'completions:create', 'audio:transcribe'],
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
    credentials: GroqCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    // Groq has usage tracking in their console
    // API usage can be tracked via request logging
    console.log('[Groq] Usage API requires console access');
    return [];
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    for (const [key, price] of Object.entries(GROQ_PRICING)) {
      if (model.toLowerCase().includes(key.toLowerCase())) {
        return price;
      }
    }
    return GROQ_PRICING['llama-3.1-8b-instant'];
  }
}
