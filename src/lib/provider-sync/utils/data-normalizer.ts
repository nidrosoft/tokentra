/**
 * Data Normalizer - Unified Schema Transformation
 * 
 * Transforms raw provider data into a normalized schema that works
 * consistently across all providers.
 */

import type {
  ProviderType,
  RawUsageData,
  NormalizedUsageRecord,
  UsageDimensions,
  Granularity,
  ProviderConnection,
} from '../types';

export class DataNormalizer {
  /**
   * Normalize raw provider data to unified schema
   */
  normalize(
    provider: ProviderType,
    rawData: RawUsageData[],
    connection: ProviderConnection
  ): NormalizedUsageRecord[] {
    return rawData.map((raw) => this.normalizeRecord(provider, raw, connection));
  }

  /**
   * Normalize a single record
   */
  private normalizeRecord(
    provider: ProviderType,
    raw: RawUsageData,
    connection: ProviderConnection
  ): NormalizedUsageRecord {
    const { modelFamily, modelVersion } = this.parseModel(raw.model, provider);
    const dimensions = this.normalizeDimensions(raw.dimensions, provider);
    const dimensionHash = this.hashDimensions(dimensions);

    return {
      id: crypto.randomUUID(),
      organizationId: connection.organizationId,
      connectionId: connection.id,
      provider,

      // Time
      timestamp: raw.timestamp,
      endTime: raw.endTime,
      granularity: this.inferGranularity(raw.timestamp, raw.endTime),

      // Model
      model: this.normalizeModelName(raw.model, provider),
      modelFamily,
      modelVersion,

      // Tokens
      inputTokens: raw.inputTokens || 0,
      outputTokens: raw.outputTokens || 0,
      totalTokens: (raw.inputTokens || 0) + (raw.outputTokens || 0),
      cachedInputTokens: raw.cachedTokens || 0,
      cacheCreationTokens: raw.cacheCreationTokens || 0,

      // Requests
      requests: raw.requests || 0,

      // Cost
      cost: raw.cost || 0,
      currency: 'USD',

      // Attribution
      dimensions,
      dimensionHash,

      // Provider-specific
      providerMetadata: raw.rawData,
    };
  }

  /**
   * Normalize model names across providers to consistent format
   */
  normalizeModelName(model: string, provider: ProviderType): string {
    // Remove version suffixes and normalize common patterns
    const normalizations: Record<string, string> = {
      // OpenAI
      'gpt-4o-2024-08-06': 'gpt-4o',
      'gpt-4o-2024-11-20': 'gpt-4o',
      'gpt-4o-mini-2024-07-18': 'gpt-4o-mini',
      'gpt-4-turbo-2024-04-09': 'gpt-4-turbo',
      'gpt-4-0125-preview': 'gpt-4-turbo',
      'gpt-4-1106-preview': 'gpt-4-turbo',
      'gpt-3.5-turbo-0125': 'gpt-3.5-turbo',

      // Anthropic
      'claude-sonnet-4-20250514': 'claude-4-sonnet',
      'claude-3-5-sonnet-20241022': 'claude-3.5-sonnet',
      'claude-3-5-sonnet-20240620': 'claude-3.5-sonnet',
      'claude-3-5-haiku-20241022': 'claude-3.5-haiku',
      'claude-3-opus-20240229': 'claude-3-opus',
      'claude-3-sonnet-20240229': 'claude-3-sonnet',
      'claude-3-haiku-20240307': 'claude-3-haiku',
    };

    return normalizations[model] || model;
  }

  /**
   * Parse model into family and version
   */
  parseModel(
    model: string,
    provider: ProviderType
  ): { modelFamily: string; modelVersion?: string } {
    const patterns: Record<ProviderType, RegExp> = {
      openai: /^(gpt-[\d.]+[a-z]*|o[\d]+(?:-mini)?|dall-e-[\d]+|whisper|tts)(?:-(\d{4}-\d{2}-\d{2}))?/i,
      anthropic: /^(claude-[\d.]+(?:-[a-z]+)?)(?:-(\d{8}))?/i,
      google: /^(gemini-[\d.]+(?:-[a-z]+)?)/i,
      azure: /^(gpt-[\d.]+[a-z]*)/i,
      aws: /^(?:[a-z]+\.)?([a-z]+-[\d.]+(?:-[a-z]+)?)/i,
    };

    const pattern = patterns[provider] || /.+/;
    const match = model.match(pattern);

    return {
      modelFamily: match?.[1] || model,
      modelVersion: match?.[2],
    };
  }

  /**
   * Normalize dimensions across providers
   */
  normalizeDimensions(
    raw: Record<string, string | undefined> | undefined,
    provider: ProviderType
  ): UsageDimensions {
    if (!raw) return {};

    return {
      projectId: raw.projectId || raw.project_id,
      workspaceId: raw.workspaceId || raw.workspace_id,
      teamId: raw.teamId || raw.team_id,
      userId: raw.userId || raw.user_id,
      apiKeyId: raw.apiKeyId || raw.api_key_id,
      costCenterId: raw.costCenterId || raw.cost_center_id,
      environment: raw.environment,
      feature: raw.feature,
      resourceId: raw.resourceId || raw.resource_id,
      deploymentName: raw.deploymentName || raw.deployment_name,
      region: raw.region,
    };
  }

  /**
   * Create hash for dimension combination (for deduplication)
   */
  hashDimensions(dimensions: UsageDimensions): string {
    // Sort keys and create deterministic string
    const sortedKeys = Object.keys(dimensions).sort();
    const values = sortedKeys
      .map((key) => dimensions[key as keyof UsageDimensions])
      .filter(Boolean);

    if (values.length === 0) {
      return 'default';
    }

    const str = values.join('|');

    // Simple hash function (djb2)
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }

    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Infer granularity from timestamps
   */
  inferGranularity(start: Date, end?: Date): Granularity {
    if (!end) return '1h';

    const diffMs = end.getTime() - start.getTime();
    const diffMins = diffMs / (60 * 1000);

    if (diffMins <= 5) return '1m';
    if (diffMins <= 120) return '1h';
    return '1d';
  }

  /**
   * Merge duplicate records by summing values
   */
  mergeRecords(records: NormalizedUsageRecord[]): NormalizedUsageRecord[] {
    const merged = new Map<string, NormalizedUsageRecord>();

    for (const record of records) {
      // Create unique key based on timestamp, model, and dimensions
      const key = `${record.timestamp.toISOString()}_${record.model}_${record.dimensionHash}`;

      const existing = merged.get(key);
      if (existing) {
        // Sum numeric values
        existing.inputTokens += record.inputTokens;
        existing.outputTokens += record.outputTokens;
        existing.totalTokens += record.totalTokens;
        existing.cachedInputTokens += record.cachedInputTokens;
        existing.cacheCreationTokens += record.cacheCreationTokens;
        existing.requests += record.requests;
        existing.cost += record.cost;
      } else {
        merged.set(key, { ...record });
      }
    }

    return Array.from(merged.values());
  }
}

// Singleton instance
let normalizerInstance: DataNormalizer | null = null;

export function getDataNormalizer(): DataNormalizer {
  if (!normalizerInstance) {
    normalizerInstance = new DataNormalizer();
  }
  return normalizerInstance;
}
