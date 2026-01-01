/**
 * TokenTRA Enterprise Analysis Engine
 * Batch analysis for 18 optimization categories
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  UsagePattern,
  AnalysisResult,
  AnalysisSummary,
  Recommendation,
  Anomaly,
  OptimizationCategory,
  RecommendationPriority,
  OptimizationEngineConfig,
} from './types';
import { DEFAULT_ENGINE_CONFIG } from './types';
import { modelRegistry } from './model-registry';

// Usage record from database
interface UsageRecord {
  id: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  timestamp: Date;
  taskType?: string;
  taskCategory?: string;
  promptHash: string;
  systemPromptHash?: string;
  teamId?: string;
  projectId?: string;
  featureId?: string;
  retryCount: number;
  wasTimeout: boolean;
  wasRateLimited: boolean;
  wasStreaming: boolean;
  latencyMs: number;
}

export class AnalysisEngine {
  private config: OptimizationEngineConfig;
  private supabase: SupabaseClient;

  constructor(config: Partial<OptimizationEngineConfig> & { orgId: string }) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Run comprehensive analysis on usage data
   */
  async analyze(days: number = 30): Promise<AnalysisResult> {
    const startTime = performance.now();
    const usage = await this.getUsageRecords(days);

    if (usage.length === 0) {
      return {
        patterns: [],
        recommendations: [],
        anomalies: [],
        summary: this.createEmptySummary(),
        analyzedRecords: 0,
        analysisTimeMs: performance.now() - startTime,
      };
    }

    // Run all pattern detection in parallel
    const [
      modelPatterns,
      tokenPatterns,
      cachingPatterns,
      wastePatterns,
      specializedPatterns,
    ] = await Promise.all([
      this.detectModelIntelligencePatterns(usage),
      this.detectTokenEconomicsPatterns(usage),
      this.detectCachingPatterns(usage),
      this.detectWasteEliminationPatterns(usage),
      this.detectSpecializedPatterns(usage),
    ]);

    const allPatterns = [
      ...modelPatterns,
      ...tokenPatterns,
      ...cachingPatterns,
      ...wastePatterns,
      ...specializedPatterns,
    ];

    const recommendations = this.generateRecommendations(allPatterns);
    const anomalies = this.detectAnomalies(usage);
    const summary = this.generateSummary(usage, allPatterns, recommendations);

    return {
      patterns: allPatterns,
      recommendations,
      anomalies,
      summary,
      analyzedRecords: usage.length,
      analysisTimeMs: performance.now() - startTime,
    };
  }

  /**
   * Run analysis and save recommendations
   */
  async analyzeAndSave(): Promise<number> {
    const result = await this.analyze();
    
    for (const rec of result.recommendations) {
      await this.saveRecommendation(rec);
    }

    return result.recommendations.length;
  }

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  private async getUsageRecords(days: number): Promise<UsageRecord[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('usage_records')
      .select('*')
      .eq('organization_id', this.config.orgId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })
      .limit(50000);

    if (error) {
      console.error('Failed to fetch usage records:', error);
      return [];
    }

    return (data || []).map(r => ({
      id: r.id,
      model: r.model,
      provider: r.provider,
      inputTokens: r.input_tokens || 0,
      outputTokens: r.output_tokens || 0,
      totalCost: r.cost || 0,
      timestamp: new Date(r.timestamp),
      taskType: r.metadata?.task_type,
      taskCategory: r.metadata?.task_category,
      promptHash: r.metadata?.prompt_hash || r.id,
      systemPromptHash: r.metadata?.system_prompt_hash,
      teamId: r.team_id,
      projectId: r.project_id,
      featureId: r.feature_tag,
      retryCount: r.metadata?.retry_count || 0,
      wasTimeout: r.status === 'timeout',
      wasRateLimited: r.error_code === 'rate_limit',
      wasStreaming: r.metadata?.streaming || false,
      latencyMs: r.latency_ms || 0,
    }));
  }

  // ============================================================================
  // MODEL INTELLIGENCE PATTERNS (4 categories)
  // ============================================================================

  private async detectModelIntelligencePatterns(usage: UsageRecord[]): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];

    // 1. Task-Aware Routing
    const taskRouting = this.detectTaskAwareRouting(usage);
    if (taskRouting) patterns.push(taskRouting);

    // 2. Quality-Cost Pareto
    const pareto = this.detectQualityCostPareto(usage);
    if (pareto) patterns.push(pareto);

    // 3. Provider Arbitrage
    const arbitrage = this.detectProviderArbitrage(usage);
    if (arbitrage) patterns.push(arbitrage);

    // 4. Model Version Optimization
    const version = this.detectModelVersionOptimization(usage);
    if (version) patterns.push(version);

    return patterns;
  }

  private detectTaskAwareRouting(usage: UsageRecord[]): UsagePattern | null {
    const byModel: Record<string, UsageRecord[]> = {};
    for (const r of usage) {
      if (!byModel[r.model]) byModel[r.model] = [];
      byModel[r.model].push(r);
    }

    let totalSavings = 0;
    let affected = 0;

    for (const [model, records] of Object.entries(byModel)) {
      const config = modelRegistry.getModel(model);
      if (!config || config.tier === 'budget') continue;

      // Simple requests (low token count) on expensive models
      const simple = records.filter(r => (r.inputTokens + r.outputTokens) < 1000);
      if (simple.length > records.length * 0.3) {
        const downgrade = modelRegistry.getSuggestedDowngrade(model);
        if (downgrade) {
          const current = simple.reduce((s, r) => s + r.totalCost, 0);
          const projected = simple.reduce((s, r) => 
            s + modelRegistry.calculateCost(downgrade.id, r.inputTokens, r.outputTokens), 0);
          totalSavings += current - projected;
          affected += simple.length;
        }
      }
    }

    if (totalSavings < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'task_aware_routing',
      description: 'Simple requests using expensive models could be routed to cheaper alternatives',
      data: { totalSavings, affected },
      potentialSavings: totalSavings * 30,
      confidence: 0.85,
      affectedRequests: affected,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Simple requests on premium models', currentValue: affected }],
    };
  }

  private detectQualityCostPareto(usage: UsageRecord[]): UsagePattern | null {
    const overqualified = usage.filter(r => {
      const model = modelRegistry.getModel(r.model);
      return model?.tier === 'premium' && r.taskCategory && !['reasoning', 'coding'].includes(r.taskCategory);
    });

    if (overqualified.length < usage.length * 0.1) return null;

    const current = overqualified.reduce((s, r) => s + r.totalCost, 0);
    const projected = overqualified.reduce((s, r) => {
      const mid = modelRegistry.getBestModelForTask(r.taskCategory as any || 'chat', 'mid');
      return s + (mid ? modelRegistry.calculateCost(mid.id, r.inputTokens, r.outputTokens) : r.totalCost);
    }, 0);

    const savings = current - projected;
    if (savings < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'quality_cost_pareto',
      description: 'Premium models used for tasks that don\'t require premium quality',
      data: { overqualifiedCount: overqualified.length },
      potentialSavings: savings * 30,
      confidence: 0.75,
      affectedRequests: overqualified.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Overqualified requests', currentValue: overqualified.length }],
    };
  }

  private detectProviderArbitrage(usage: UsageRecord[]): UsagePattern | null {
    const byModel: Record<string, { records: UsageRecord[]; cost: number }> = {};
    for (const r of usage) {
      if (!byModel[r.model]) byModel[r.model] = { records: [], cost: 0 };
      byModel[r.model].records.push(r);
      byModel[r.model].cost += r.totalCost;
    }

    let totalSavings = 0;
    let affected = 0;

    for (const [model, data] of Object.entries(byModel)) {
      const cheapest = modelRegistry.findCheapestProvider(model);
      if (!cheapest || cheapest.id === model) continue;

      const projected = data.records.reduce((s, r) => 
        s + modelRegistry.calculateCost(cheapest.id, r.inputTokens, r.outputTokens), 0);
      const savings = data.cost - projected;
      if (savings > 0) {
        totalSavings += savings;
        affected += data.records.length;
      }
    }

    if (totalSavings < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'provider_arbitrage',
      description: 'Same models available at lower cost from different providers',
      data: { totalSavings },
      potentialSavings: totalSavings * 30,
      confidence: 0.9,
      affectedRequests: affected,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Arbitrage opportunities', currentValue: affected }],
    };
  }

  private detectModelVersionOptimization(usage: UsageRecord[]): UsagePattern | null {
    const deprecated = usage.filter(r => {
      const model = modelRegistry.getModel(r.model);
      return model?.deprecationDate && new Date(model.deprecationDate) > new Date();
    });

    if (deprecated.length === 0) return null;

    const cost = deprecated.reduce((s, r) => s + r.totalCost, 0);

    return {
      type: 'model_version_optimization',
      description: 'Using deprecated or outdated model versions',
      data: { deprecatedCount: deprecated.length },
      potentialSavings: cost * 0.1 * 30,
      confidence: 0.95,
      affectedRequests: deprecated.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Deprecated model usage', currentValue: deprecated.length }],
    };
  }

  // ============================================================================
  // TOKEN ECONOMICS PATTERNS (4 categories)
  // ============================================================================

  private async detectTokenEconomicsPatterns(usage: UsageRecord[]): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];

    // 5. I/O Ratio Optimization
    const io = this.detectIORatioOptimization(usage);
    if (io) patterns.push(io);

    // 6. Context Window Efficiency
    const context = this.detectContextWindowEfficiency(usage);
    if (context) patterns.push(context);

    // 7. Prompt Compression
    const compression = this.detectPromptCompression(usage);
    if (compression) patterns.push(compression);

    // 8. Output Format Optimization
    const output = this.detectOutputFormatOptimization(usage);
    if (output) patterns.push(output);

    return patterns;
  }

  private detectIORatioOptimization(usage: UsageRecord[]): UsagePattern | null {
    const highOutput = usage.filter(r => r.inputTokens > 0 && (r.outputTokens / r.inputTokens) > 5);
    if (highOutput.length < usage.length * 0.1) return null;

    const excessCost = highOutput.reduce((s, r) => {
      const model = modelRegistry.getModel(r.model);
      if (!model) return s;
      const excess = r.outputTokens - (r.inputTokens * 2);
      return s + (excess / 1_000_000) * model.outputCostPer1M;
    }, 0);

    if (excessCost < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'io_ratio_optimization',
      description: 'Requests generating excessive output relative to input',
      data: { highOutputCount: highOutput.length },
      potentialSavings: excessCost * 0.5 * 30,
      confidence: 0.7,
      affectedRequests: highOutput.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'High output ratio requests', currentValue: highOutput.length }],
    };
  }

  private detectContextWindowEfficiency(usage: UsageRecord[]): UsagePattern | null {
    const largeContext = usage.filter(r => r.inputTokens > 10000);
    if (largeContext.length < 10) return null;

    const savings = largeContext.reduce((s, r) => {
      const model = modelRegistry.getModel(r.model);
      if (!model || model.maxContextTokens <= 100000 || r.inputTokens >= 30000) return s;
      const cheaper = modelRegistry.getCheapestModelForTask(r.taskCategory as any || 'chat', 70);
      if (!cheaper || cheaper.maxContextTokens < r.inputTokens) return s;
      return s + Math.max(0, r.totalCost - modelRegistry.calculateCost(cheaper.id, r.inputTokens, r.outputTokens));
    }, 0);

    if (savings < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'context_window_efficiency',
      description: 'Using large context models for requests that don\'t need them',
      data: { largeContextCount: largeContext.length },
      potentialSavings: savings * 30,
      confidence: 0.65,
      affectedRequests: largeContext.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Large context requests', currentValue: largeContext.length }],
    };
  }

  private detectPromptCompression(usage: UsageRecord[]): UsagePattern | null {
    const longPrompts = usage.filter(r => r.inputTokens > 2000);
    if (longPrompts.length < 10) return null;

    const savings = longPrompts.reduce((s, r) => {
      const model = modelRegistry.getModel(r.model);
      if (!model) return s;
      const compressed = r.inputTokens * 0.7;
      return s + ((r.inputTokens - compressed) / 1_000_000) * model.inputCostPer1M;
    }, 0);

    if (savings < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'prompt_compression',
      description: 'Long prompts could be compressed to reduce token costs',
      data: { longPromptCount: longPrompts.length },
      potentialSavings: savings * 30,
      confidence: 0.6,
      affectedRequests: longPrompts.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Long prompt requests', currentValue: longPrompts.length }],
    };
  }

  private detectOutputFormatOptimization(usage: UsageRecord[]): UsagePattern | null {
    const verbose = usage.filter(r => r.outputTokens > 1000);
    if (verbose.length < 10) return null;

    const savings = verbose.reduce((s, r) => {
      const model = modelRegistry.getModel(r.model);
      if (!model) return s;
      const structured = r.outputTokens * 0.6;
      return s + ((r.outputTokens - structured) / 1_000_000) * model.outputCostPer1M;
    }, 0);

    if (savings < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'output_format_optimization',
      description: 'Verbose outputs could use structured formats to reduce tokens',
      data: { verboseCount: verbose.length },
      potentialSavings: savings * 30,
      confidence: 0.55,
      affectedRequests: verbose.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Verbose output requests', currentValue: verbose.length }],
    };
  }

  // ============================================================================
  // CACHING PATTERNS (3 categories)
  // ============================================================================

  private async detectCachingPatterns(usage: UsageRecord[]): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];

    // 9. Semantic Caching
    const semantic = this.detectSemanticCaching(usage);
    if (semantic) patterns.push(semantic);

    // 10. Partial Response Caching
    const partial = this.detectPartialCaching(usage);
    if (partial) patterns.push(partial);

    // 11. Request Deduplication
    const dedup = this.detectDeduplication(usage);
    if (dedup) patterns.push(dedup);

    return patterns;
  }

  private detectSemanticCaching(usage: UsageRecord[]): UsagePattern | null {
    const byHash: Record<string, UsageRecord[]> = {};
    for (const r of usage) {
      if (!byHash[r.promptHash]) byHash[r.promptHash] = [];
      byHash[r.promptHash].push(r);
    }

    let duplicates = 0;
    let duplicateCost = 0;

    for (const records of Object.values(byHash)) {
      if (records.length > 1) {
        duplicates += records.length - 1;
        duplicateCost += records.slice(1).reduce((s, r) => s + r.totalCost, 0);
      }
    }

    const rate = duplicates / usage.length;
    if (rate < 0.1 || duplicateCost < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'semantic_caching',
      description: `${(rate * 100).toFixed(0)}% of requests are duplicates that could be cached`,
      data: { duplicates, rate, duplicateCost },
      potentialSavings: duplicateCost * 30,
      confidence: 0.9,
      affectedRequests: duplicates,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Duplicate rate', currentValue: rate * 100, benchmarkValue: 5 }],
    };
  }

  private detectPartialCaching(usage: UsageRecord[]): UsagePattern | null {
    const bySystem: Record<string, UsageRecord[]> = {};
    for (const r of usage) {
      if (r.systemPromptHash) {
        if (!bySystem[r.systemPromptHash]) bySystem[r.systemPromptHash] = [];
        bySystem[r.systemPromptHash].push(r);
      }
    }

    const frequent = Object.entries(bySystem)
      .filter(([, records]) => records.length > 10)
      .map(([hash, records]) => ({
        hash,
        count: records.length,
        tokens: records.reduce((s, r) => s + r.inputTokens, 0),
      }));

    if (frequent.length === 0) return null;

    const savings = frequent.reduce((s, sp) => {
      const systemTokens = sp.tokens * 0.3;
      return s + (systemTokens / 1_000_000) * 0.9 * 2.5;
    }, 0);

    if (savings < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'partial_response_caching',
      description: 'Frequently used system prompts could leverage prompt caching',
      data: { frequentCount: frequent.length },
      potentialSavings: savings * 30,
      confidence: 0.8,
      affectedRequests: frequent.reduce((s, sp) => s + sp.count, 0),
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Frequent system prompts', currentValue: frequent.length }],
    };
  }

  private detectDeduplication(usage: UsageRecord[]): UsagePattern | null {
    const sorted = [...usage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    let duplicates = 0;
    let cost = 0;

    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i];
      const prev = sorted[i - 1];
      const diff = curr.timestamp.getTime() - prev.timestamp.getTime();

      if (diff < 1000 && curr.model === prev.model && curr.promptHash === prev.promptHash) {
        duplicates++;
        cost += curr.totalCost;
      }
    }

    if (duplicates < 10 || cost < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'request_deduplication',
      description: 'Duplicate requests sent within milliseconds could be deduplicated',
      data: { duplicates, cost },
      potentialSavings: cost * 30,
      confidence: 0.85,
      affectedRequests: duplicates,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Rapid duplicate requests', currentValue: duplicates }],
    };
  }

  // ============================================================================
  // WASTE ELIMINATION PATTERNS (4 categories)
  // ============================================================================

  private async detectWasteEliminationPatterns(usage: UsageRecord[]): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];

    // 12. Retry Storm Detection
    const retry = this.detectRetryStorm(usage);
    if (retry) patterns.push(retry);

    // 13. Timeout Cost Analysis
    const timeout = this.detectTimeoutCost(usage);
    if (timeout) patterns.push(timeout);

    // 14. Rate Limit Optimization
    const rateLimit = this.detectRateLimitOptimization(usage);
    if (rateLimit) patterns.push(rateLimit);

    // 15. Abandoned Request Detection
    const abandoned = this.detectAbandonedRequests(usage);
    if (abandoned) patterns.push(abandoned);

    return patterns;
  }

  private detectRetryStorm(usage: UsageRecord[]): UsagePattern | null {
    const highRetry = usage.filter(r => r.retryCount > 2);
    if (highRetry.length < 10) return null;

    const cost = highRetry.reduce((s, r) => s + (r.totalCost * r.retryCount), 0);
    if (cost < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'retry_storm_detection',
      description: 'Excessive retries causing wasted spend',
      data: { highRetryCount: highRetry.length },
      potentialSavings: cost * 0.8 * 30,
      confidence: 0.9,
      affectedRequests: highRetry.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'High retry requests', currentValue: highRetry.length }],
    };
  }

  private detectTimeoutCost(usage: UsageRecord[]): UsagePattern | null {
    const timeouts = usage.filter(r => r.wasTimeout);
    if (timeouts.length < 5) return null;

    const cost = timeouts.reduce((s, r) => s + r.totalCost, 0);
    if (cost < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'timeout_cost_analysis',
      description: 'Requests timing out still incur costs',
      data: { timeoutCount: timeouts.length, cost },
      potentialSavings: cost * 0.9 * 30,
      confidence: 0.95,
      affectedRequests: timeouts.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Timeout requests', currentValue: timeouts.length }],
    };
  }

  private detectRateLimitOptimization(usage: UsageRecord[]): UsagePattern | null {
    const rateLimited = usage.filter(r => r.wasRateLimited);
    if (rateLimited.length < 10) return null;

    const cost = rateLimited.reduce((s, r) => s + (r.totalCost * (r.retryCount + 1)), 0);
    if (cost < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'rate_limit_optimization',
      description: 'Rate limiting causing retries and wasted spend',
      data: { rateLimitedCount: rateLimited.length },
      potentialSavings: cost * 0.5 * 30,
      confidence: 0.8,
      affectedRequests: rateLimited.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Rate limited requests', currentValue: rateLimited.length }],
    };
  }

  private detectAbandonedRequests(usage: UsageRecord[]): UsagePattern | null {
    const abandoned = usage.filter(r => r.wasStreaming && r.outputTokens < 50 && r.inputTokens > 500);
    if (abandoned.length < 10) return null;

    const cost = abandoned.reduce((s, r) => s + r.totalCost, 0);
    if (cost < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'abandoned_request_detection',
      description: 'Streaming requests abandoned before completion',
      data: { abandonedCount: abandoned.length },
      potentialSavings: cost * 0.7 * 30,
      confidence: 0.6,
      affectedRequests: abandoned.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Abandoned streaming requests', currentValue: abandoned.length }],
    };
  }

  // ============================================================================
  // SPECIALIZED PATTERNS (3 categories)
  // ============================================================================

  private async detectSpecializedPatterns(usage: UsageRecord[]): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];

    // 16. Embedding Optimization
    const embedding = this.detectEmbeddingOptimization(usage);
    if (embedding) patterns.push(embedding);

    // 17. Time-Based Optimization
    const timeBased = this.detectTimeBasedOptimization(usage);
    if (timeBased) patterns.push(timeBased);

    // 18. Business Outcome Attribution
    const attribution = this.detectAttributionOpportunity(usage);
    if (attribution) patterns.push(attribution);

    return patterns;
  }

  private detectEmbeddingOptimization(usage: UsageRecord[]): UsagePattern | null {
    const embeddings = usage.filter(r => r.model.includes('embedding') || r.taskCategory === 'embedding');
    if (embeddings.length < 100) return null;

    const large = embeddings.filter(r => r.model.includes('large') || r.model.includes('3-large'));
    if (large.length < embeddings.length * 0.3) return null;

    const current = large.reduce((s, r) => s + r.totalCost, 0);
    const projected = current * 0.15;
    const savings = current - projected;

    if (savings < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'embedding_optimization',
      description: 'Using large embedding models where small would suffice',
      data: { largeCount: large.length },
      potentialSavings: savings * 30,
      confidence: 0.75,
      affectedRequests: large.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Large embedding usage', currentValue: large.length }],
    };
  }

  private detectTimeBasedOptimization(usage: UsageRecord[]): UsagePattern | null {
    const byHour: Record<number, { count: number; cost: number }> = {};
    for (const r of usage) {
      const hour = r.timestamp.getHours();
      if (!byHour[hour]) byHour[hour] = { count: 0, cost: 0 };
      byHour[hour].count++;
      byHour[hour].cost += r.totalCost;
    }

    const hours = Object.entries(byHour).map(([h, d]) => ({ hour: parseInt(h), ...d })).sort((a, b) => b.count - a.count);
    const peak = hours.slice(0, 6);
    const offPeak = hours.slice(6);

    if (peak.length === 0 || offPeak.length === 0) return null;

    const peakCost = peak.reduce((s, h) => s + h.cost, 0);
    const savings = peakCost * 0.2 * 0.05;

    if (savings < this.config.minSavingsForRecommendation) return null;

    return {
      type: 'time_based_optimization',
      description: 'Non-urgent requests could be scheduled for off-peak hours',
      data: { peakHours: peak.map(h => h.hour) },
      potentialSavings: savings * 30,
      confidence: 0.5,
      affectedRequests: peak.reduce((s, h) => s + h.count, 0),
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Peak hour concentration', currentValue: (peak.reduce((s, h) => s + h.count, 0) / usage.length) * 100 }],
    };
  }

  private detectAttributionOpportunity(usage: UsageRecord[]): UsagePattern | null {
    const unattributed = usage.filter(r => !r.teamId && !r.projectId && !r.featureId);
    if (unattributed.length < usage.length * 0.3) return null;

    const cost = unattributed.reduce((s, r) => s + r.totalCost, 0);

    return {
      type: 'business_outcome_attribution',
      description: 'Requests missing attribution data for ROI analysis',
      data: { unattributedCount: unattributed.length, cost },
      potentialSavings: 0,
      confidence: 1.0,
      affectedRequests: unattributed.length,
      timeRange: this.getTimeRange(usage),
      evidence: [{ metric: 'Unattributed requests', currentValue: (unattributed.length / usage.length) * 100, benchmarkValue: 10 }],
    };
  }

  // ============================================================================
  // ANOMALY DETECTION
  // ============================================================================

  private detectAnomalies(usage: UsageRecord[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Spending spike detection
    const dailyCosts = this.aggregateByDay(usage);
    const avgCost = dailyCosts.reduce((s, d) => s + d.cost, 0) / dailyCosts.length;
    const stdDev = Math.sqrt(dailyCosts.reduce((s, d) => s + Math.pow(d.cost - avgCost, 2), 0) / dailyCosts.length);

    for (const day of dailyCosts) {
      const zScore = (day.cost - avgCost) / stdDev;
      if (zScore > this.config.anomalyZScoreThreshold) {
        anomalies.push({
          id: crypto.randomUUID(),
          orgId: this.config.orgId,
          type: 'spending_spike',
          severity: zScore > 4 ? 'critical' : 'warning',
          title: `Spending spike on ${day.date.toDateString()}`,
          description: `Daily spend was ${((day.cost / avgCost - 1) * 100).toFixed(0)}% above average`,
          detectedAt: new Date(),
          detectionMethod: 'z_score',
          currentValue: day.cost,
          expectedValue: avgCost,
          deviationPercent: ((day.cost / avgCost - 1) * 100),
          zScore,
          affectedResources: [],
          timeRange: { start: day.date, end: new Date(day.date.getTime() + 86400000) },
          acknowledged: false,
          resolved: false,
        });
      }
    }

    return anomalies;
  }

  private aggregateByDay(usage: UsageRecord[]): Array<{ date: Date; cost: number; count: number }> {
    const byDay: Record<string, { date: Date; cost: number; count: number }> = {};
    for (const r of usage) {
      const key = r.timestamp.toISOString().split('T')[0];
      if (!byDay[key]) byDay[key] = { date: new Date(key), cost: 0, count: 0 };
      byDay[key].cost += r.totalCost;
      byDay[key].count++;
    }
    return Object.values(byDay).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // ============================================================================
  // RECOMMENDATION GENERATION
  // ============================================================================

  private generateRecommendations(patterns: UsagePattern[]): Recommendation[] {
    return patterns
      .filter(p => p.potentialSavings >= this.config.minSavingsForRecommendation)
      .map(p => this.patternToRecommendation(p))
      .sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings)
      .slice(0, 20);
  }

  private patternToRecommendation(pattern: UsagePattern): Recommendation {
    const priority = this.calculatePriority(pattern);
    const risk = this.calculateRisk(pattern);

    return {
      id: crypto.randomUUID(),
      orgId: this.config.orgId,
      category: pattern.type,
      type: pattern.type,
      title: this.getTitle(pattern.type),
      description: pattern.description,
      currentMonthlyCost: 0,
      projectedMonthlyCost: 0,
      estimatedMonthlySavings: pattern.potentialSavings,
      savingsPercent: 0,
      confidence: pattern.confidence,
      priority,
      evidence: pattern.evidence.map(e => ({
        type: 'usage_pattern' as const,
        title: e.metric,
        data: { currentValue: e.currentValue, benchmarkValue: e.benchmarkValue },
        visualization: 'chart' as const,
      })),
      affectedRequests: pattern.affectedRequests,
      sampleRequestIds: [],
      implementationSteps: this.getSteps(pattern.type),
      estimatedEffort: this.getEffort(pattern.type),
      riskLevel: risk,
      requiresABTest: risk === 'high',
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  private calculatePriority(pattern: UsagePattern): RecommendationPriority {
    if (pattern.potentialSavings > 1000 && pattern.confidence > 0.8) return 'critical';
    if (pattern.potentialSavings > 500 || pattern.confidence > 0.85) return 'high';
    if (pattern.potentialSavings > 100) return 'medium';
    return 'low';
  }

  private calculateRisk(pattern: UsagePattern): 'low' | 'medium' | 'high' {
    const highRisk: OptimizationCategory[] = ['task_aware_routing', 'quality_cost_pareto', 'prompt_compression'];
    if (highRisk.includes(pattern.type)) return 'high';
    if (pattern.confidence < 0.7) return 'medium';
    return 'low';
  }

  private getTitle(category: OptimizationCategory): string {
    const titles: Record<OptimizationCategory, string> = {
      task_aware_routing: 'Route simple tasks to cost-effective models',
      quality_cost_pareto: 'Optimize model selection for task requirements',
      provider_arbitrage: 'Switch to cheaper provider for same models',
      model_version_optimization: 'Upgrade from deprecated model versions',
      io_ratio_optimization: 'Reduce excessive output generation',
      context_window_efficiency: 'Use appropriately-sized context windows',
      prompt_compression: 'Compress long prompts to reduce costs',
      output_format_optimization: 'Use structured output formats',
      semantic_caching: 'Enable caching for repeated queries',
      partial_response_caching: 'Cache frequently used system prompts',
      request_deduplication: 'Deduplicate rapid duplicate requests',
      retry_storm_detection: 'Reduce excessive retry attempts',
      timeout_cost_analysis: 'Optimize timeout handling',
      rate_limit_optimization: 'Implement rate limit management',
      abandoned_request_detection: 'Handle abandoned streaming requests',
      embedding_optimization: 'Use smaller embedding models',
      time_based_optimization: 'Schedule non-urgent work off-peak',
      business_outcome_attribution: 'Add attribution for ROI tracking',
    };
    return titles[category] || category;
  }

  private getSteps(category: OptimizationCategory): string[] {
    const defaultSteps = ['Review recommendation', 'Implement changes', 'Monitor results'];
    const steps: Partial<Record<OptimizationCategory, string[]>> = {
      semantic_caching: ['Enable semantic cache', 'Configure threshold', 'Monitor hit rates'],
      task_aware_routing: ['Configure routing rules', 'Set up A/B test', 'Monitor quality'],
      provider_arbitrage: ['Configure provider', 'Set up failover', 'Enable switching'],
    };
    return steps[category] || defaultSteps;
  }

  private getEffort(category: OptimizationCategory): 'minutes' | 'hours' | 'days' | 'weeks' {
    const efforts: Partial<Record<OptimizationCategory, 'minutes' | 'hours' | 'days' | 'weeks'>> = {
      semantic_caching: 'minutes',
      model_version_optimization: 'minutes',
      provider_arbitrage: 'hours',
      task_aware_routing: 'hours',
      prompt_compression: 'days',
    };
    return efforts[category] || 'hours';
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private getTimeRange(usage: UsageRecord[]): { start: Date; end: Date } {
    if (usage.length === 0) return { start: new Date(), end: new Date() };
    const sorted = usage.map(r => r.timestamp.getTime()).sort((a, b) => a - b);
    return { start: new Date(sorted[0]), end: new Date(sorted[sorted.length - 1]) };
  }

  private createEmptySummary(): AnalysisSummary {
    return {
      totalSpend: 0,
      totalRequests: 0,
      totalTokens: 0,
      avgCostPerRequest: 0,
      potentialSavings: 0,
      savingsPercent: 0,
      topOpportunities: [],
      healthScore: 100,
      riskFactors: [],
    };
  }

  private generateSummary(usage: UsageRecord[], patterns: UsagePattern[], recommendations: Recommendation[]): AnalysisSummary {
    const totalSpend = usage.reduce((s, r) => s + r.totalCost, 0);
    const totalTokens = usage.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0);
    const potentialSavings = recommendations.reduce((s, r) => s + r.estimatedMonthlySavings, 0);

    return {
      totalSpend,
      totalRequests: usage.length,
      totalTokens,
      avgCostPerRequest: usage.length > 0 ? totalSpend / usage.length : 0,
      potentialSavings,
      savingsPercent: totalSpend > 0 ? (potentialSavings / (totalSpend * 30)) * 100 : 0,
      topOpportunities: patterns.slice(0, 5).map(p => ({
        category: p.type,
        savings: p.potentialSavings,
        confidence: p.confidence,
      })),
      healthScore: Math.max(0, 100 - (recommendations.filter(r => r.priority === 'critical').length * 20)),
      riskFactors: recommendations.filter(r => r.priority === 'critical').map(r => r.title),
    };
  }

  private async saveRecommendation(rec: Recommendation): Promise<void> {
    try {
      await this.supabase.from('recommendations').upsert({
        id: rec.id,
        organization_id: rec.orgId,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        impact: {
          estimatedMonthlySavings: rec.estimatedMonthlySavings,
          confidence: rec.confidence,
          affectedRequests: rec.affectedRequests,
        },
        status: rec.status,
        created_at: rec.createdAt.toISOString(),
        metadata: {
          category: rec.category,
          priority: rec.priority,
          riskLevel: rec.riskLevel,
          implementationSteps: rec.implementationSteps,
          estimatedEffort: rec.estimatedEffort,
        },
      });
    } catch (error) {
      console.error('Failed to save recommendation:', error);
    }
  }
}

export function createAnalysisEngine(config: Partial<OptimizationEngineConfig> & { orgId: string }): AnalysisEngine {
  return new AnalysisEngine(config);
}
