/**
 * OpenAI Provider Adapter
 * 
 * Fetches usage and cost data from OpenAI's Organization API.
 * Supports completions, embeddings, images, audio, and moderations.
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  OpenAICredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// OpenAI model pricing (per million tokens)
const OPENAI_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'gpt-4o': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.60 },
  'gpt-4-turbo': { inputPerMillion: 10.00, outputPerMillion: 30.00 },
  'gpt-4': { inputPerMillion: 30.00, outputPerMillion: 60.00 },
  'gpt-3.5-turbo': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
  'o1': { inputPerMillion: 15.00, outputPerMillion: 60.00 },
  'o1-mini': { inputPerMillion: 3.00, outputPerMillion: 12.00 },
  'o3-mini': { inputPerMillion: 1.10, outputPerMillion: 4.40 },
  'text-embedding-3-small': { inputPerMillion: 0.02, outputPerMillion: 0 },
  'text-embedding-3-large': { inputPerMillion: 0.13, outputPerMillion: 0 },
  'text-embedding-ada-002': { inputPerMillion: 0.10, outputPerMillion: 0 },
};

const BASE_URL = 'https://api.openai.com/v1/organization';

export class OpenAIAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'openai';

  async testConnection(credentials: OpenAICredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    // Validate API key format
    if (!credentials.adminApiKey?.startsWith('sk-')) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Invalid API key format. OpenAI keys start with "sk-"',
        permissions: [],
      };
    }

    try {
      // Test usage API access
      const startTimeUnix = this.dateToUnix(new Date(Date.now() - 86400000));
      await this.makeRequest(
        `${BASE_URL}/usage/completions?start_time=${startTimeUnix}&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${credentials.adminApiKey}`,
            'Content-Type': 'application/json',
          },
        },
        'OpenAI connection test'
      );

      // Try to get organization info
      let orgMetadata: Record<string, unknown> = {};
      try {
        orgMetadata = await this.makeRequest(
          'https://api.openai.com/v1/organization',
          {
            headers: { Authorization: `Bearer ${credentials.adminApiKey}` },
          },
          'OpenAI org info'
        );
      } catch {
        // Organization endpoint is optional
      }

      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: {
          organizationId: orgMetadata.id,
          organizationName: orgMetadata.name,
        },
        permissions: ['usage:read', 'costs:read', 'projects:read'],
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
    credentials: OpenAICredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const allRecords: RawUsageData[] = [];

    // Fetch from multiple endpoints
    const endpoints = [
      '/usage/completions',
      '/usage/embeddings',
      '/usage/images',
      '/usage/audio',
      '/usage/moderations',
    ];

    for (const endpoint of endpoints) {
      try {
        const records = await this.fetchEndpoint(credentials, endpoint, window);
        allRecords.push(...records);
      } catch (error) {
        console.warn(`[OpenAI] Failed to fetch ${endpoint}:`, (error as Error).message);
      }
    }

    // Fetch cost data and merge
    const costData = await this.fetchCosts(credentials, window);
    return this.mergeUsageAndCosts(allRecords, costData);
  }

  private async fetchEndpoint(
    credentials: OpenAICredentials,
    endpoint: string,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];
    let page: string | undefined;

    const startTime = this.dateToUnix(window.start);
    const endTime = this.dateToUnix(window.end);
    const bucketWidth = this.getBucketWidth(window.granularity);

    do {
      const url = new URL(`${BASE_URL}${endpoint}`);
      url.searchParams.set('start_time', startTime.toString());
      url.searchParams.set('end_time', endTime.toString());
      url.searchParams.set('bucket_width', bucketWidth);
      url.searchParams.set('group_by', 'model,project_id');
      url.searchParams.set('limit', '1000');
      if (page) {
        url.searchParams.set('page', page);
      }

      const data = await this.makeRequest<{
        data: Array<{
          start_time: number;
          end_time: number;
          results: Array<{
            input_tokens?: number;
            output_tokens?: number;
            input_cached_tokens?: number;
            num_model_requests?: number;
            model?: string;
            project_id?: string;
            user_id?: string;
            api_key_id?: string;
            batch?: boolean;
            service_tier?: string;
          }>;
        }>;
        has_more?: boolean;
        next_page?: string;
      }>(
        url.toString(),
        {
          headers: {
            Authorization: `Bearer ${credentials.adminApiKey}`,
            'Content-Type': 'application/json',
          },
        },
        `OpenAI ${endpoint}`
      );

      // Process buckets
      for (const bucket of data.data || []) {
        for (const result of bucket.results || []) {
          records.push({
            provider: 'openai',
            timestamp: this.unixToDate(bucket.start_time),
            endTime: this.unixToDate(bucket.end_time),
            model: result.model || 'unknown',
            inputTokens: result.input_tokens || 0,
            outputTokens: result.output_tokens || 0,
            cachedTokens: result.input_cached_tokens || 0,
            requests: result.num_model_requests || 0,
            dimensions: {
              projectId: result.project_id,
              userId: result.user_id,
              apiKeyId: result.api_key_id,
              batch: result.batch?.toString(),
              serviceTier: result.service_tier,
            },
            rawData: result as Record<string, unknown>,
          });
        }
      }

      page = data.has_more ? data.next_page : undefined;
    } while (page);

    return records;
  }

  private async fetchCosts(
    credentials: OpenAICredentials,
    window: SyncWindow
  ): Promise<Array<{
    date: Date;
    projectId?: string;
    amount: number;
    currency: string;
  }>> {
    const costs: Array<{
      date: Date;
      projectId?: string;
      amount: number;
      currency: string;
    }> = [];
    let page: string | undefined;

    const startTime = this.dateToUnix(window.start);

    do {
      try {
        const url = new URL(`${BASE_URL}/costs`);
        url.searchParams.set('start_time', startTime.toString());
        url.searchParams.set('bucket_width', '1d');
        url.searchParams.set('group_by', 'project_id');
        url.searchParams.set('limit', '100');
        if (page) {
          url.searchParams.set('page', page);
        }

        const data = await this.makeRequest<{
          data: Array<{
            start_time: number;
            results: Array<{
              project_id?: string;
              amount?: { value: number; currency: string };
              line_item?: string;
            }>;
          }>;
          has_more?: boolean;
          next_page?: string;
        }>(
          url.toString(),
          {
            headers: {
              Authorization: `Bearer ${credentials.adminApiKey}`,
              'Content-Type': 'application/json',
            },
          },
          'OpenAI costs'
        );

        for (const bucket of data.data || []) {
          for (const result of bucket.results || []) {
            costs.push({
              date: this.unixToDate(bucket.start_time),
              projectId: result.project_id,
              amount: result.amount?.value || 0,
              currency: result.amount?.currency || 'USD',
            });
          }
        }

        page = data.has_more ? data.next_page : undefined;
      } catch (error) {
        console.warn('[OpenAI] Failed to fetch costs:', (error as Error).message);
        break;
      }
    } while (page);

    return costs;
  }

  private mergeUsageAndCosts(
    usage: RawUsageData[],
    costs: Array<{ date: Date; projectId?: string; amount: number }>
  ): RawUsageData[] {
    // Create cost lookup by date + project
    const costLookup = new Map<string, number>();
    for (const cost of costs) {
      const key = `${cost.date.toISOString().split('T')[0]}_${cost.projectId || 'default'}`;
      costLookup.set(key, (costLookup.get(key) || 0) + cost.amount);
    }

    // Add cost to usage records
    return usage.map((record) => {
      const dateKey = record.timestamp.toISOString().split('T')[0];
      const key = `${dateKey}_${record.dimensions?.projectId || 'default'}`;
      const dailyCost = costLookup.get(key);

      return {
        ...record,
        cost: dailyCost !== undefined
          ? dailyCost
          : this.calculateCost(record.model, record.inputTokens, record.outputTokens, record.cachedTokens),
      };
    });
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    // Find matching model pricing
    for (const [key, price] of Object.entries(OPENAI_PRICING)) {
      if (model.includes(key)) {
        return price;
      }
    }
    // Default to GPT-4o pricing
    return OPENAI_PRICING['gpt-4o'];
  }
}
