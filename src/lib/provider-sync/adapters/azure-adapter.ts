/**
 * Azure OpenAI Provider Adapter
 * 
 * Fetches usage data from Azure Monitor and costs from Azure Cost Management API.
 * Supports both Service Principal and API Key authentication.
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  AzureCredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// Azure OpenAI uses similar pricing to OpenAI
const AZURE_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'gpt-4o': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.60 },
  'gpt-4-turbo': { inputPerMillion: 10.00, outputPerMillion: 30.00 },
  'gpt-4': { inputPerMillion: 30.00, outputPerMillion: 60.00 },
  'gpt-35-turbo': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
};

export class AzureAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'azure';

  async testConnection(credentials: AzureCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (credentials.type === 'service_principal') {
      if (!credentials.tenantId || !credentials.clientId || !credentials.clientSecret) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Service Principal requires tenantId, clientId, and clientSecret',
          permissions: [],
        };
      }

      try {
        // Test OAuth token acquisition
        const tokenUrl = `https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`;

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            scope: 'https://management.azure.com/.default',
            grant_type: 'client_credentials',
          }),
        });

        if (!tokenResponse.ok) {
          return {
            success: false,
            latencyMs: Date.now() - startTime,
            error: 'Failed to authenticate with Azure. Check your Service Principal credentials.',
            permissions: [],
          };
        }

        return {
          success: true,
          latencyMs: Date.now() - startTime,
          metadata: {
            subscriptionId: credentials.subscriptionId,
            resourceGroup: credentials.resourceGroup,
          },
          permissions: ['costs:read', 'metrics:read', 'resources:read'],
        };
      } catch (error) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: (error as Error).message,
          permissions: [],
        };
      }
    } else {
      // API Key authentication
      if (!credentials.apiKey || !credentials.endpoint) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'API Key and Endpoint are required',
          permissions: [],
        };
      }

      try {
        const testUrl = `${credentials.endpoint.replace(/\/$/, '')}/openai/models?api-version=2024-02-01`;
        const response = await fetch(testUrl, {
          headers: { 'api-key': credentials.apiKey },
        });

        if (!response.ok) {
          return {
            success: false,
            latencyMs: Date.now() - startTime,
            error: `Azure OpenAI API error: ${response.status}`,
            permissions: [],
          };
        }

        return {
          success: true,
          latencyMs: Date.now() - startTime,
          metadata: { endpoint: credentials.endpoint },
          permissions: ['models:read', 'completions:create'],
        };
      } catch (error) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: `Failed to connect to Azure endpoint: ${(error as Error).message}`,
          permissions: [],
        };
      }
    }
  }

  async fetchUsage(
    credentials: AzureCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    if (credentials.type !== 'service_principal') {
      console.warn('[Azure] Usage sync requires Service Principal authentication');
      return [];
    }

    try {
      const accessToken = await this.getAccessToken(credentials);
      
      const [metricsData, costData] = await Promise.all([
        this.fetchAzureMonitorMetrics(accessToken, credentials, window),
        this.fetchCostManagement(accessToken, credentials, window),
      ]);

      return this.mergeData(metricsData, costData);
    } catch (error) {
      console.error('[Azure] Failed to fetch usage:', error);
      return [];
    }
  }

  private async getAccessToken(credentials: AzureCredentials): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: credentials.clientId!,
        client_secret: credentials.clientSecret!,
        scope: 'https://management.azure.com/.default',
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Azure');
    }

    const data = await response.json();
    return data.access_token;
  }

  private async fetchAzureMonitorMetrics(
    accessToken: string,
    credentials: AzureCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];

    // Get all Azure OpenAI resources
    const resources = await this.listOpenAIResources(accessToken, credentials);

    for (const resource of resources) {
      await this.rateLimiter.acquire('azure');

      const metricsUrl =
        `https://management.azure.com${resource.id}/providers/Microsoft.Insights/metrics?` +
        `api-version=2023-10-01` +
        `&timespan=${window.start.toISOString()}/${window.end.toISOString()}` +
        `&interval=PT1H` +
        `&metricnames=ProcessedPromptTokens,GeneratedCompletionTokens` +
        `&aggregation=Total`;

      try {
        const data = await this.makeRequest<{
          value?: Array<{
            name: { value: string };
            timeseries?: Array<{
              data?: Array<{
                timeStamp: string;
                total?: number;
              }>;
            }>;
          }>;
        }>(
          metricsUrl,
          { headers: { Authorization: `Bearer ${accessToken}` } },
          'Azure Monitor metrics'
        );

        // Process metrics
        const metricsMap = new Map<string, { input: number; output: number }>();

        for (const metric of data.value || []) {
          for (const timeseries of metric.timeseries || []) {
            for (const point of timeseries.data || []) {
              const timestamp = point.timeStamp;
              const key = timestamp;

              if (!metricsMap.has(key)) {
                metricsMap.set(key, { input: 0, output: 0 });
              }

              const entry = metricsMap.get(key)!;
              if (metric.name.value === 'ProcessedPromptTokens') {
                entry.input = point.total || 0;
              } else if (metric.name.value === 'GeneratedCompletionTokens') {
                entry.output = point.total || 0;
              }
            }
          }
        }

        // Convert to records
        for (const [timestamp, tokens] of metricsMap) {
          if (tokens.input > 0 || tokens.output > 0) {
            records.push({
              provider: 'azure',
              timestamp: new Date(timestamp),
              model: resource.properties?.model || 'azure-openai',
              inputTokens: tokens.input,
              outputTokens: tokens.output,
              cachedTokens: 0,
              requests: 0,
              dimensions: {
                resourceId: resource.id,
                resourceGroup: credentials.resourceGroup,
                deploymentName: resource.name,
              },
            });
          }
        }
      } catch (error) {
        console.warn(`[Azure] Failed to fetch metrics for ${resource.name}:`, error);
      }
    }

    return records;
  }

  private async fetchCostManagement(
    accessToken: string,
    credentials: AzureCredentials,
    window: SyncWindow
  ): Promise<Array<{ date: Date; resourceId?: string; cost: number }>> {
    const costs: Array<{ date: Date; resourceId?: string; cost: number }> = [];

    await this.rateLimiter.acquire('azure');

    const costUrl = `https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`;

    try {
      const data = await this.makeRequest<{
        properties?: {
          rows?: Array<[number, number, string, string, string]>;
        };
      }>(
        costUrl,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'ActualCost',
            timeframe: 'Custom',
            timePeriod: {
              from: window.start.toISOString().split('T')[0],
              to: window.end.toISOString().split('T')[0],
            },
            dataSet: {
              granularity: 'Daily',
              aggregation: {
                totalCost: { name: 'Cost', function: 'Sum' },
                totalQuantity: { name: 'UsageQuantity', function: 'Sum' },
              },
              filter: {
                dimensions: {
                  name: 'ServiceName',
                  operator: 'In',
                  values: ['Cognitive Services'],
                },
              },
              grouping: [
                { type: 'Dimension', name: 'MeterSubCategory' },
                { type: 'Dimension', name: 'ResourceId' },
                { type: 'Dimension', name: 'UsageDate' },
              ],
            },
          }),
        },
        'Azure Cost Management'
      );

      // Parse response rows
      for (const row of data.properties?.rows || []) {
        costs.push({
          cost: row[0],
          resourceId: row[3],
          date: new Date(row[4].toString()),
        });
      }
    } catch (error) {
      console.warn('[Azure] Cost Management API failed:', error);
    }

    return costs;
  }

  private async listOpenAIResources(
    accessToken: string,
    credentials: AzureCredentials
  ): Promise<Array<{ id: string; name: string; properties?: { model?: string } }>> {
    const url = `https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.CognitiveServices/accounts?api-version=2023-05-01`;

    try {
      const data = await this.makeRequest<{
        value?: Array<{
          id: string;
          name: string;
          kind?: string;
          properties?: { kind?: string; model?: string };
        }>;
      }>(
        url,
        { headers: { Authorization: `Bearer ${accessToken}` } },
        'Azure list resources'
      );

      // Filter to OpenAI resources only
      return (data.value || []).filter(
        (r) => r.kind === 'OpenAI' || r.properties?.kind === 'OpenAI'
      );
    } catch (error) {
      console.warn('[Azure] Failed to list resources:', error);
      return [];
    }
  }

  private mergeData(
    metrics: RawUsageData[],
    costs: Array<{ date: Date; resourceId?: string; cost: number }>
  ): RawUsageData[] {
    const costLookup = new Map<string, number>();

    for (const cost of costs) {
      const key = `${cost.date.toISOString().split('T')[0]}_${cost.resourceId}`;
      costLookup.set(key, (costLookup.get(key) || 0) + cost.cost);
    }

    return metrics.map((record) => {
      const dateKey = record.timestamp.toISOString().split('T')[0];
      const key = `${dateKey}_${record.dimensions?.resourceId}`;
      const cost = costLookup.get(key);

      return {
        ...record,
        cost: cost !== undefined
          ? cost
          : this.calculateCost(record.model, record.inputTokens, record.outputTokens),
      };
    });
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    for (const [key, price] of Object.entries(AZURE_PRICING)) {
      if (model.includes(key)) {
        return price;
      }
    }
    // Default to GPT-4o pricing
    return AZURE_PRICING['gpt-4o'];
  }
}
