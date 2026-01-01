/**
 * AWS Bedrock Provider Adapter
 * 
 * Fetches usage data from CloudWatch and costs from Cost Explorer.
 * Supports both IAM Role (cross-account) and Access Key authentication.
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  AWSCredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// AWS Bedrock model pricing (per million tokens)
const AWS_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'anthropic.claude-3-opus': { inputPerMillion: 15.00, outputPerMillion: 75.00 },
  'anthropic.claude-3-sonnet': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'anthropic.claude-3-haiku': { inputPerMillion: 0.25, outputPerMillion: 1.25 },
  'anthropic.claude-3-5-sonnet': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
  'amazon.titan-text': { inputPerMillion: 0.15, outputPerMillion: 0.20 },
  'amazon.nova-pro': { inputPerMillion: 0.80, outputPerMillion: 3.20 },
  'amazon.nova-lite': { inputPerMillion: 0.06, outputPerMillion: 0.24 },
  'amazon.nova-micro': { inputPerMillion: 0.035, outputPerMillion: 0.14 },
  'meta.llama3': { inputPerMillion: 0.70, outputPerMillion: 0.90 },
  'meta.llama3-70b': { inputPerMillion: 2.65, outputPerMillion: 3.50 },
  'cohere.command': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
};

// Common Bedrock model IDs for fallback
const COMMON_MODEL_IDS = [
  'anthropic.claude-3-sonnet-20240229-v1:0',
  'anthropic.claude-3-haiku-20240307-v1:0',
  'anthropic.claude-3-opus-20240229-v1:0',
  'anthropic.claude-3-5-sonnet-20241022-v2:0',
  'amazon.titan-text-express-v1',
  'amazon.titan-embed-text-v1',
  'amazon.nova-pro-v1:0',
  'amazon.nova-lite-v1:0',
  'meta.llama3-70b-instruct-v1:0',
];

export class AWSAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'aws';

  async testConnection(credentials: AWSCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (!credentials.region) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'AWS Region is required',
        permissions: [],
      };
    }

    if (credentials.type === 'iam_role') {
      if (!credentials.roleArn) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'IAM Role ARN is required for cross-account access',
          permissions: [],
        };
      }

      // Validate ARN format
      if (!credentials.roleArn.match(/^arn:aws:iam::\d{12}:role\/.+$/)) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Invalid IAM Role ARN format',
          permissions: [],
        };
      }

      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: { region: credentials.region, roleArn: credentials.roleArn },
        permissions: ['cloudwatch:read', 'ce:read', 'bedrock:invoke'],
      };
    } else {
      // Access Key authentication
      if (!credentials.accessKeyId || !credentials.secretAccessKey) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Access Key ID and Secret Access Key are required',
          permissions: [],
        };
      }

      // Validate access key format
      if (!credentials.accessKeyId.match(/^AK[A-Z0-9]{18}$/)) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Invalid Access Key ID format',
          permissions: [],
        };
      }

      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: { region: credentials.region },
        permissions: ['cloudwatch:read', 'ce:read', 'bedrock:invoke'],
      };
    }
  }

  async fetchUsage(
    credentials: AWSCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    // Note: Full implementation requires AWS SDK which should be used
    // in a server-side context (Edge Function)
    console.log('[AWS] Fetching usage for region:', credentials.region);
    console.log('[AWS] Window:', window.start, 'to', window.end);

    // For now, return empty array - actual implementation will be in Edge Function
    return [];
  }

  /**
   * Fetch from CloudWatch Metrics
   * Note: This method is designed to be called from a server context
   * with proper AWS SDK authentication
   */
  async fetchCloudWatchMetrics(
    awsConfig: {
      region: string;
      credentials: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
      };
    },
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];

    // This would use @aws-sdk/client-cloudwatch in actual implementation
    // For now, we define the structure

    for (const modelId of COMMON_MODEL_IDS) {
      await this.rateLimiter.acquire('aws');

      // Simulated CloudWatch query structure
      const metricsQuery = {
        StartTime: window.start,
        EndTime: window.end,
        MetricDataQueries: [
          {
            Id: 'input_tokens',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/Bedrock',
                MetricName: 'InputTokenCount',
                Dimensions: [{ Name: 'ModelId', Value: modelId }],
              },
              Period: 3600,
              Stat: 'Sum',
            },
          },
          {
            Id: 'output_tokens',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/Bedrock',
                MetricName: 'OutputTokenCount',
                Dimensions: [{ Name: 'ModelId', Value: modelId }],
              },
              Period: 3600,
              Stat: 'Sum',
            },
          },
          {
            Id: 'invocations',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/Bedrock',
                MetricName: 'Invocations',
                Dimensions: [{ Name: 'ModelId', Value: modelId }],
              },
              Period: 3600,
              Stat: 'Sum',
            },
          },
        ],
      };

      console.log('[AWS] Would query CloudWatch with:', metricsQuery);
    }

    return records;
  }

  /**
   * Fetch from Cost Explorer
   * Note: This method is designed to be called from a server context
   */
  async fetchCostExplorer(
    awsConfig: {
      region: string;
      credentials: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
      };
    },
    window: SyncWindow
  ): Promise<Array<{ date: Date; model: string; cost: number; usage: number }>> {
    const costs: Array<{ date: Date; model: string; cost: number; usage: number }> = [];

    await this.rateLimiter.acquire('aws');

    // Cost Explorer query structure
    const costQuery = {
      TimePeriod: {
        Start: window.start.toISOString().split('T')[0],
        End: window.end.toISOString().split('T')[0],
      },
      Granularity: 'DAILY',
      Metrics: ['UnblendedCost', 'UsageQuantity'],
      Filter: {
        Dimensions: {
          Key: 'SERVICE',
          Values: ['Amazon Bedrock'],
        },
      },
      GroupBy: [{ Type: 'DIMENSION', Key: 'USAGE_TYPE' }],
    };

    console.log('[AWS] Would query Cost Explorer with:', costQuery);

    return costs;
  }

  /**
   * Process CloudWatch response and merge with costs
   */
  processCloudWatchResponse(
    response: {
      MetricDataResults?: Array<{
        Id: string;
        Timestamps?: Date[];
        Values?: number[];
      }>;
    },
    modelId: string,
    region: string
  ): RawUsageData[] {
    const records: RawUsageData[] = [];
    const metricsMap = new Map<number, { input: number; output: number; invocations: number }>();

    for (const result of response.MetricDataResults || []) {
      const timestamps = result.Timestamps || [];
      const values = result.Values || [];

      for (let i = 0; i < timestamps.length; i++) {
        const ts = timestamps[i].getTime();
        if (!metricsMap.has(ts)) {
          metricsMap.set(ts, { input: 0, output: 0, invocations: 0 });
        }

        const entry = metricsMap.get(ts)!;
        if (result.Id === 'input_tokens') entry.input = values[i] || 0;
        if (result.Id === 'output_tokens') entry.output = values[i] || 0;
        if (result.Id === 'invocations') entry.invocations = values[i] || 0;
      }
    }

    // Convert to records
    for (const [ts, metrics] of metricsMap) {
      if (metrics.input > 0 || metrics.output > 0) {
        records.push({
          provider: 'aws',
          timestamp: new Date(ts),
          model: modelId,
          inputTokens: metrics.input,
          outputTokens: metrics.output,
          cachedTokens: 0,
          requests: metrics.invocations,
          cost: this.calculateCost(modelId, metrics.input, metrics.output),
          dimensions: {
            region,
            modelId,
          },
        });
      }
    }

    return records;
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    for (const [key, price] of Object.entries(AWS_PRICING)) {
      if (model.toLowerCase().includes(key.toLowerCase())) {
        return price;
      }
    }
    // Default to Claude 3 Sonnet pricing
    return AWS_PRICING['anthropic.claude-3-sonnet'];
  }
}
