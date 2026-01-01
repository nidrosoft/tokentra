/**
 * Anthropic Provider Adapter
 * 
 * Fetches usage and cost data from Anthropic's Admin API.
 * Supports messages usage reports and cost reports.
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  AnthropicCredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// Anthropic model pricing (per million tokens)
const ANTHROPIC_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'claude-opus-4': { inputPerMillion: 15.00, outputPerMillion: 75.00 },
  'claude-sonnet-4': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-haiku-4': { inputPerMillion: 0.25, outputPerMillion: 1.25 },
  'claude-3-5-sonnet': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-3-5-haiku': { inputPerMillion: 0.80, outputPerMillion: 4.00 },
  'claude-3-opus': { inputPerMillion: 15.00, outputPerMillion: 75.00 },
  'claude-3-sonnet': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'claude-3-haiku': { inputPerMillion: 0.25, outputPerMillion: 1.25 },
};

const BASE_URL = 'https://api.anthropic.com/v1/organizations';

export class AnthropicAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'anthropic';

  async testConnection(credentials: AnthropicCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    // Validate Admin API key format
    if (!credentials.adminApiKey?.startsWith('sk-ant-admin-')) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Invalid Admin API key. Anthropic Admin keys start with "sk-ant-admin-"',
        permissions: [],
      };
    }

    try {
      // Test usage API
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      await this.makeRequest(
        `${BASE_URL}/usage_report/messages?starting_at=${startDate}&limit=1`,
        {
          headers: {
            'x-api-key': credentials.adminApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        },
        'Anthropic connection test'
      );

      return {
        success: true,
        latencyMs: Date.now() - startTime,
        permissions: ['usage:read', 'costs:read', 'workspaces:read'],
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
    credentials: AnthropicCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const [usageRecords, costRecords] = await Promise.all([
      this.fetchUsageReport(credentials, window),
      this.fetchCostReport(credentials, window),
    ]);

    return this.mergeUsageAndCosts(usageRecords, costRecords);
  }

  private async fetchUsageReport(
    credentials: AnthropicCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];
    let page: string | undefined;

    const startingAt = window.start.toISOString();
    const endingAt = window.end.toISOString();
    const bucketWidth = this.getBucketWidth(window.granularity);

    do {
      const url = new URL(`${BASE_URL}/usage_report/messages`);
      url.searchParams.set('starting_at', startingAt);
      url.searchParams.set('ending_at', endingAt);
      url.searchParams.set('bucket_width', bucketWidth);
      url.searchParams.append('group_by[]', 'model');
      url.searchParams.append('group_by[]', 'workspace_id');
      url.searchParams.append('group_by[]', 'api_key_id');
      url.searchParams.set('limit', '1000');
      if (page) {
        url.searchParams.set('page', page);
      }

      const data = await this.makeRequest<{
        data: Array<{
          starting_at: string;
          ending_at: string;
          results: Array<{
            uncached_input_tokens?: number;
            cache_creation?: {
              ephemeral_1h_input_tokens?: number;
              ephemeral_5m_input_tokens?: number;
            };
            cache_read_input_tokens?: number;
            output_tokens?: number;
            model?: string;
            workspace_id?: string;
            api_key_id?: string;
            service_tier?: string;
            context_window?: string;
            server_tool_use?: {
              web_search_requests?: number;
            };
          }>;
        }>;
        has_more?: boolean;
        next_page?: string;
      }>(
        url.toString(),
        {
          headers: {
            'x-api-key': credentials.adminApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        },
        'Anthropic usage report'
      );

      for (const bucket of data.data || []) {
        for (const result of bucket.results || []) {
          // Calculate total cached tokens
          const cacheCreationTokens =
            (result.cache_creation?.ephemeral_1h_input_tokens || 0) +
            (result.cache_creation?.ephemeral_5m_input_tokens || 0);

          records.push({
            provider: 'anthropic',
            timestamp: new Date(bucket.starting_at),
            endTime: new Date(bucket.ending_at),
            model: result.model || 'unknown',
            inputTokens: result.uncached_input_tokens || 0,
            outputTokens: result.output_tokens || 0,
            cachedTokens: result.cache_read_input_tokens || 0,
            cacheCreationTokens,
            requests: 1, // Anthropic doesn't provide request count directly
            dimensions: {
              workspaceId: result.workspace_id,
              apiKeyId: result.api_key_id,
              serviceTier: result.service_tier,
              contextWindow: result.context_window,
            },
            rawData: result as Record<string, unknown>,
          });
        }
      }

      page = data.has_more ? data.next_page : undefined;
    } while (page);

    return records;
  }

  private async fetchCostReport(
    credentials: AnthropicCredentials,
    window: SyncWindow
  ): Promise<Array<{
    date: Date;
    workspaceId?: string;
    model?: string;
    amount: number;
  }>> {
    const costs: Array<{
      date: Date;
      workspaceId?: string;
      model?: string;
      amount: number;
    }> = [];
    let page: string | undefined;

    do {
      try {
        const url = new URL(`${BASE_URL}/cost_report`);
        url.searchParams.set('starting_at', window.start.toISOString());
        url.searchParams.append('group_by[]', 'workspace_id');
        url.searchParams.append('group_by[]', 'description');
        url.searchParams.set('bucket_width', '1d');
        url.searchParams.set('limit', '100');
        if (page) {
          url.searchParams.set('page', page);
        }

        const data = await this.makeRequest<{
          data: Array<{
            starting_at: string;
            results: Array<{
              workspace_id?: string;
              model?: string;
              amount?: string;
              currency?: string;
              description?: string;
              token_type?: string;
              cost_type?: string;
            }>;
          }>;
          has_more?: boolean;
          next_page?: string;
        }>(
          url.toString(),
          {
            headers: {
              'x-api-key': credentials.adminApiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
          },
          'Anthropic cost report'
        );

        for (const bucket of data.data || []) {
          for (const result of bucket.results || []) {
            costs.push({
              date: new Date(bucket.starting_at),
              workspaceId: result.workspace_id,
              model: result.model,
              amount: parseFloat(result.amount || '0') || 0,
            });
          }
        }

        page = data.has_more ? data.next_page : undefined;
      } catch (error) {
        console.warn('[Anthropic] Failed to fetch costs:', (error as Error).message);
        break;
      }
    } while (page);

    return costs;
  }

  private mergeUsageAndCosts(
    usage: RawUsageData[],
    costs: Array<{ date: Date; workspaceId?: string; model?: string; amount: number }>
  ): RawUsageData[] {
    // Create cost lookup by date + workspace + model
    const costLookup = new Map<string, number>();
    for (const cost of costs) {
      const key = `${cost.date.toISOString().split('T')[0]}_${cost.workspaceId}_${cost.model}`;
      costLookup.set(key, (costLookup.get(key) || 0) + cost.amount);
    }

    return usage.map((record) => {
      const dateKey = record.timestamp.toISOString().split('T')[0];
      const key = `${dateKey}_${record.dimensions?.workspaceId}_${record.model}`;
      const dailyCost = costLookup.get(key);

      return {
        ...record,
        cost: dailyCost !== undefined
          ? dailyCost
          : this.calculateAnthropicCost(record),
      };
    });
  }

  private calculateAnthropicCost(record: RawUsageData): number {
    const pricing = this.getModelPricing(record.model);

    const inputCost = (record.inputTokens / 1_000_000) * pricing.inputPerMillion;
    const outputCost = (record.outputTokens / 1_000_000) * pricing.outputPerMillion;

    // Cached reads are 90% cheaper
    const cachedReadCost = (record.cachedTokens / 1_000_000) * pricing.inputPerMillion * 0.1;

    // Cache creation is 25% more expensive
    const cacheCreationCost =
      ((record.cacheCreationTokens || 0) / 1_000_000) * pricing.inputPerMillion * 1.25;

    return inputCost + outputCost + cachedReadCost + cacheCreationCost;
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    for (const [key, price] of Object.entries(ANTHROPIC_PRICING)) {
      if (model.includes(key)) {
        return price;
      }
    }
    // Default to Claude 3.5 Sonnet pricing
    return ANTHROPIC_PRICING['claude-3-5-sonnet'];
  }
}
