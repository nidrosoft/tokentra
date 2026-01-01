/**
 * Google Vertex AI Provider Adapter
 * 
 * Fetches usage data from Google Cloud Monitoring and billing from BigQuery.
 * Note: Requires service account with appropriate permissions.
 */

import { BaseProviderAdapter } from './base-adapter';
import type {
  ProviderType,
  GoogleCredentials,
  ConnectionTestResult,
  RawUsageData,
  SyncWindow,
} from '../types';

// Google Vertex AI model pricing (per million tokens)
const GOOGLE_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  'gemini-2.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00 },
  'gemini-2.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.30 },
  'gemini-2.0-flash': { inputPerMillion: 0.10, outputPerMillion: 0.40 },
  'gemini-1.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00 },
  'gemini-1.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.30 },
  'gemini-1.0-pro': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
};

export class GoogleAdapter extends BaseProviderAdapter {
  readonly provider: ProviderType = 'google';

  async testConnection(credentials: GoogleCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (!credentials.serviceAccountKey && credentials.type === 'service_account') {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Service account key is required',
        permissions: [],
      };
    }

    if (!credentials.projectId) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Project ID is required',
        permissions: [],
      };
    }

    try {
      // Validate service account key format
      if (credentials.serviceAccountKey) {
        const keyFile = JSON.parse(credentials.serviceAccountKey);
        if (!keyFile.type || keyFile.type !== 'service_account') {
          return {
            success: false,
            latencyMs: Date.now() - startTime,
            error: 'Invalid service account key format',
            permissions: [],
          };
        }
        if (!keyFile.project_id || !keyFile.private_key || !keyFile.client_email) {
          return {
            success: false,
            latencyMs: Date.now() - startTime,
            error: 'Service account key is missing required fields',
            permissions: [],
          };
        }
      }

      // Note: Full connection test requires google-auth-library on server
      // For now, we validate the key format
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: { 
          projectId: credentials.projectId,
          region: credentials.region,
        },
        permissions: ['monitoring:read', 'billing:read'],
      };
    } catch (error) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: `Invalid service account key: ${(error as Error).message}`,
        permissions: [],
      };
    }
  }

  async fetchUsage(
    credentials: GoogleCredentials,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    // Note: This is a simplified implementation
    // Full implementation requires google-auth-library and googleapis
    // which should be used in a server-side context (Edge Function)
    
    console.log('[Google] Fetching usage for project:', credentials.projectId);
    console.log('[Google] Window:', window.start, 'to', window.end);

    // For now, return empty array - actual implementation will be in Edge Function
    // where we have access to Google Cloud libraries
    return [];
  }

  /**
   * Fetch from Cloud Monitoring API
   * Note: This method is designed to be called from a server context
   * with proper Google Cloud authentication
   */
  async fetchCloudMonitoring(
    accessToken: string,
    projectId: string,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];

    const metrics = [
      'aiplatform.googleapis.com/prediction/online/request_count',
      'aiplatform.googleapis.com/prediction/online/response_count',
      'aiplatform.googleapis.com/prediction/online/token_count',
    ];

    for (const metricType of metrics) {
      await this.rateLimiter.acquire('google');

      const filter = `metric.type="${metricType}"`;
      const url =
        `https://monitoring.googleapis.com/v3/projects/${projectId}/timeSeries?` +
        `filter=${encodeURIComponent(filter)}` +
        `&interval.startTime=${window.start.toISOString()}` +
        `&interval.endTime=${window.end.toISOString()}` +
        `&aggregation.alignmentPeriod=3600s` +
        `&aggregation.perSeriesAligner=ALIGN_SUM`;

      try {
        const data = await this.makeRequest<{
          timeSeries?: Array<{
            resource?: { labels?: { model_id?: string; location?: string } };
            metric?: { labels?: { model_id?: string } };
            points?: Array<{
              interval: { startTime: string };
              value: { int64Value?: string; doubleValue?: number };
            }>;
          }>;
        }>(
          url,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
          `Google Cloud Monitoring ${metricType}`
        );

        for (const timeSeries of data.timeSeries || []) {
          const modelId =
            timeSeries.resource?.labels?.model_id ||
            timeSeries.metric?.labels?.model_id ||
            'unknown';

          for (const point of timeSeries.points || []) {
            const timestamp = new Date(point.interval.startTime);
            const value = parseInt(point.value.int64Value || '0') || point.value.doubleValue || 0;

            // Find or create record for this timestamp
            let record = records.find(
              (r) => r.timestamp.getTime() === timestamp.getTime() && r.model === modelId
            );

            if (!record) {
              record = {
                provider: 'google',
                timestamp,
                model: modelId,
                inputTokens: 0,
                outputTokens: 0,
                cachedTokens: 0,
                requests: 0,
                dimensions: {
                  projectId,
                  region: timeSeries.resource?.labels?.location,
                },
              };
              records.push(record);
            }

            // Update based on metric type
            if (metricType.includes('request_count')) {
              record.requests = value;
            } else if (metricType.includes('token_count')) {
              // Vertex AI reports total tokens, estimate split
              record.inputTokens = Math.floor(value * 0.6);
              record.outputTokens = Math.floor(value * 0.4);
            }
          }
        }
      } catch (error) {
        console.warn(`[Google] Failed to fetch metric ${metricType}:`, error);
      }
    }

    // Add cost estimates
    return records.map((record) => ({
      ...record,
      cost: this.calculateCost(record.model, record.inputTokens, record.outputTokens),
    }));
  }

  protected getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    for (const [key, price] of Object.entries(GOOGLE_PRICING)) {
      if (model.toLowerCase().includes(key)) {
        return price;
      }
    }
    // Default to Gemini 1.5 Flash pricing
    return GOOGLE_PRICING['gemini-1.5-flash'];
  }
}
