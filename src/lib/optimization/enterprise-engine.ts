/**
 * TokenTRA Enterprise Optimization Engine
 * Main orchestrator for real-time and batch optimization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  OptimizationResult,
  OptimizeRequestParams,
  OptimizationEngineConfig,
  RoutingDecision,
  TaskClassification,
  Provider,
} from './types';
import { DEFAULT_ENGINE_CONFIG } from './types';
import { modelRegistry } from './model-registry';
import { taskClassifier } from './task-classifier';
import { semanticCache } from './semantic-cache';
import { routingRulesEngine, EvaluationContext } from './routing-rules-engine';

// Re-export for convenience
export { modelRegistry } from './model-registry';
export { taskClassifier } from './task-classifier';
export { semanticCache } from './semantic-cache';
export { routingRulesEngine } from './routing-rules-engine';

interface OptimizationMetric {
  orgId: string;
  timestamp: Date;
  originalModel: string;
  selectedModel: string;
  taskType?: string;
  optimizationsApplied: string[];
  estimatedSavings: number;
  latencyOverheadMs: number;
  cacheHit: boolean;
}

interface EngineStats {
  requestsProcessed: number;
  optimizationsApplied: number;
  cacheHits: number;
  routingDecisions: number;
  totalSavings: number;
  avgLatencyOverhead: number;
  errors: number;
}

export class EnterpriseOptimizationEngine {
  private config: OptimizationEngineConfig;
  private supabase: SupabaseClient;
  private metricsBuffer: OptimizationMetric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private stats: EngineStats = {
    requestsProcessed: 0,
    optimizationsApplied: 0,
    cacheHits: 0,
    routingDecisions: 0,
    totalSavings: 0,
    avgLatencyOverhead: 0,
    errors: 0,
  };

  constructor(config: Partial<OptimizationEngineConfig> & { orgId: string }) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    if (typeof setInterval !== 'undefined') {
      this.flushInterval = setInterval(() => this.flushMetrics(), 5000);
    }
  }

  async optimize(params: OptimizeRequestParams): Promise<OptimizationResult> {
    const startTime = performance.now();
    const optimizationsApplied: string[] = [];
    let estimatedSavings = 0;
    this.stats.requestsProcessed++;

    try {
      const userMessage = params.messages.find(m => m.role === 'user')?.content || '';
      const systemMessage = params.messages.find(m => m.role === 'system')?.content;
      const systemPromptHash = systemMessage ? await this.hashString(systemMessage) : undefined;

      // Task Classification
      const classification = await taskClassifier.classify(userMessage, systemMessage);

      // Semantic Cache Check
      if (this.config.enableSemanticCaching && !params.bypassCache) {
        const cacheResult = await semanticCache.lookup(
          params.orgId, userMessage, params.model, systemPromptHash, classification.taskType
        );
        if (cacheResult.hit && cacheResult.entry) {
          optimizationsApplied.push('semantic_cache_hit');
          this.stats.cacheHits++;
          return {
            originalRequest: params,
            optimizedRequest: params,
            optimizationsApplied,
            estimatedSavings: cacheResult.savingsEstimate || 0,
            routingDecision: this.createDefaultRoutingDecision(params, classification),
            taskClassification: classification,
            cacheHit: true,
            cachedResponse: cacheResult.entry.response,
            latencyOverheadMs: performance.now() - startTime,
          };
        }
      }

      // Routing Rules Evaluation
      let routingDecision = this.createDefaultRoutingDecision(params, classification);
      if (this.config.enableModelRouting && !params.bypassRouting) {
        const context: EvaluationContext = {
          orgId: params.orgId,
          model: params.model,
          provider: params.provider as Provider,
          taskType: classification.taskType,
          taskCategory: classification.taskCategory,
          complexityScore: classification.complexityScore,
          qualityRequirement: classification.qualityRequirement,
          inputTokens: this.estimateTokens(userMessage),
          teamId: params.metadata?.teamId,
          projectId: params.metadata?.projectId,
          featureId: params.metadata?.featureId,
          hasCode: classification.features.hasCodeIndicators,
          hasMath: classification.features.hasMathIndicators,
        };

        const routingResult = await routingRulesEngine.evaluate(context);
        if (routingResult.ruleMatched && routingResult.decision.wasRouted) {
          routingDecision = routingResult.decision;
          optimizationsApplied.push('routing_rule_applied');
          this.stats.routingDecisions++;
          estimatedSavings += this.calculateRoutingSavings(
            params.model, routingResult.decision.selectedModel, this.estimateTokens(userMessage)
          );
        }
      }

      // Smart Model Selection
      if (!routingDecision.wasRouted && this.config.enableModelRouting) {
        const smartDecision = this.selectOptimalModel(classification, params);
        if (smartDecision.wasRouted) {
          routingDecision = smartDecision;
          optimizationsApplied.push('smart_model_selection');
          this.stats.routingDecisions++;
          estimatedSavings += this.calculateRoutingSavings(
            params.model, smartDecision.selectedModel, this.estimateTokens(userMessage)
          );
        }
      }

      // Provider Arbitrage
      if (this.config.enableProviderArbitrage && !routingDecision.wasRouted) {
        const arbitrageDecision = this.applyProviderArbitrage(params, classification);
        if (arbitrageDecision.wasRouted) {
          routingDecision = arbitrageDecision;
          optimizationsApplied.push('provider_arbitrage');
          estimatedSavings += this.calculateRoutingSavings(
            params.model, arbitrageDecision.selectedModel, this.estimateTokens(userMessage)
          );
        }
      }

      if (optimizationsApplied.length > 0) this.stats.optimizationsApplied++;
      this.stats.totalSavings += estimatedSavings;

      const latencyOverhead = performance.now() - startTime;
      this.updateAvgLatency(latencyOverhead);

      return {
        originalRequest: params,
        optimizedRequest: { ...params, model: routingDecision.selectedModel, provider: routingDecision.selectedProvider },
        optimizationsApplied,
        estimatedSavings,
        routingDecision,
        taskClassification: classification,
        cacheHit: false,
        latencyOverheadMs: latencyOverhead,
      };
    } catch (error) {
      console.error('Optimization error:', error);
      this.stats.errors++;
      return {
        originalRequest: params,
        optimizedRequest: params,
        optimizationsApplied: [],
        estimatedSavings: 0,
        routingDecision: this.createDefaultRoutingDecision(params),
        taskClassification: await taskClassifier.classify(params.messages.find(m => m.role === 'user')?.content || ''),
        cacheHit: false,
        latencyOverheadMs: performance.now() - startTime,
      };
    }
  }

  async storeResponse(params: OptimizeRequestParams, response: string, cost: number, outputTokens: number, classification?: TaskClassification): Promise<void> {
    if (!this.config.enableSemanticCaching) return;
    const userMessage = params.messages.find(m => m.role === 'user')?.content || '';
    const systemMessage = params.messages.find(m => m.role === 'system')?.content;
    const systemPromptHash = systemMessage ? await this.hashString(systemMessage) : undefined;
    const taskType = classification?.taskType || (await taskClassifier.classify(userMessage, systemMessage)).taskType;
    await semanticCache.store(params.orgId, userMessage, response, params.model, cost, outputTokens, systemPromptHash, taskType);
  }

  private selectOptimalModel(classification: TaskClassification, params: OptimizeRequestParams): RoutingDecision {
    const originalModel = modelRegistry.getModel(params.model);
    if (!originalModel) return this.createDefaultRoutingDecision(params, classification);

    let targetTier = classification.suggestedTier;
    if (classification.qualityRequirement !== 'critical' && classification.qualityRequirement !== 'high' && originalModel.tier === 'premium') {
      targetTier = 'mid';
    }
    if (classification.qualityRequirement === 'low' && (originalModel.tier === 'premium' || originalModel.tier === 'mid')) {
      targetTier = 'budget';
    }

    const optimalModel = modelRegistry.getOptimalModel(classification.taskCategory, {
      minQualityScore: this.getMinQualityScore(classification.qualityRequirement),
    });

    if (!optimalModel || optimalModel.id === params.model) return this.createDefaultRoutingDecision(params, classification);

    const inputTokens = this.estimateTokens(params.messages.map(m => m.content).join(' '));
    const originalCost = modelRegistry.calculateCost(params.model, inputTokens, inputTokens * 0.5);
    const newCost = modelRegistry.calculateCost(optimalModel.id, inputTokens, inputTokens * 0.5);

    if (newCost >= originalCost) return this.createDefaultRoutingDecision(params, classification);

    const qualityDelta = (optimalModel.qualityScores[classification.taskCategory] || 0) - (originalModel.qualityScores[classification.taskCategory] || 0);
    if (qualityDelta < -15) return this.createDefaultRoutingDecision(params, classification);

    return {
      selectedModel: optimalModel.id,
      selectedProvider: optimalModel.provider,
      originalModel: params.model,
      originalProvider: params.provider as Provider,
      wasRouted: true,
      reason: `Task "${classification.taskType}" optimally handled by ${optimalModel.displayName}`,
      estimatedCost: newCost,
      estimatedLatency: optimalModel.avgLatencyMs,
      confidence: classification.confidence,
      fallbackModels: [params.model],
      qualityScore: optimalModel.qualityScores[classification.taskCategory],
    };
  }

  private applyProviderArbitrage(params: OptimizeRequestParams, classification: TaskClassification): RoutingDecision {
    const cheapestEquivalent = modelRegistry.findCheapestProvider(params.model);
    if (!cheapestEquivalent || cheapestEquivalent.id === params.model) return this.createDefaultRoutingDecision(params, classification);

    const inputTokens = this.estimateTokens(params.messages.map(m => m.content).join(' '));
    const originalCost = modelRegistry.calculateCost(params.model, inputTokens, inputTokens * 0.5);
    const newCost = modelRegistry.calculateCost(cheapestEquivalent.id, inputTokens, inputTokens * 0.5);

    if (newCost >= originalCost) return this.createDefaultRoutingDecision(params, classification);

    return {
      selectedModel: cheapestEquivalent.id,
      selectedProvider: cheapestEquivalent.provider,
      originalModel: params.model,
      originalProvider: params.provider as Provider,
      wasRouted: true,
      reason: `Provider arbitrage: ${cheapestEquivalent.provider} offers better pricing`,
      estimatedCost: newCost,
      estimatedLatency: cheapestEquivalent.avgLatencyMs,
      confidence: 1.0,
      fallbackModels: [params.model],
      qualityScore: cheapestEquivalent.qualityScores[classification.taskCategory],
    };
  }

  private createDefaultRoutingDecision(params: OptimizeRequestParams, classification?: TaskClassification): RoutingDecision {
    const model = modelRegistry.getModel(params.model);
    return {
      selectedModel: params.model,
      selectedProvider: params.provider as Provider,
      originalModel: params.model,
      originalProvider: params.provider as Provider,
      wasRouted: false,
      reason: 'Using original model',
      estimatedCost: model ? modelRegistry.calculateCost(params.model, 1000, 500) : 0,
      estimatedLatency: model?.avgLatencyMs || 1000,
      confidence: 1.0,
      fallbackModels: [],
      qualityScore: classification ? model?.qualityScores[classification.taskCategory] : undefined,
    };
  }

  private calculateRoutingSavings(originalModel: string, newModel: string, inputTokens: number): number {
    const avgOutputTokens = inputTokens * 0.5;
    const originalCost = modelRegistry.calculateCost(originalModel, inputTokens, avgOutputTokens);
    const newCost = modelRegistry.calculateCost(newModel, inputTokens, avgOutputTokens);
    return Math.max(0, originalCost - newCost);
  }

  private getMinQualityScore(requirement: string): number {
    const scores: Record<string, number> = { low: 60, medium: 70, high: 80, critical: 90 };
    return scores[requirement] || 70;
  }

  private estimateTokens(text: string): number { return Math.ceil(text.length / 4); }

  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private updateAvgLatency(latency: number): void {
    const total = this.stats.avgLatencyOverhead * (this.stats.requestsProcessed - 1) + latency;
    this.stats.avgLatencyOverhead = total / this.stats.requestsProcessed;
  }

  private bufferMetric(params: OptimizeRequestParams, result: OptimizationResult): void {
    this.metricsBuffer.push({
      orgId: params.orgId,
      timestamp: new Date(),
      originalModel: params.model,
      selectedModel: result.routingDecision.selectedModel,
      taskType: result.taskClassification.taskType,
      optimizationsApplied: result.optimizationsApplied,
      estimatedSavings: result.estimatedSavings,
      latencyOverheadMs: result.latencyOverheadMs,
      cacheHit: result.cacheHit,
    });
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;
    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];
    try {
      await this.supabase.from('optimization_metrics').insert(metricsToFlush.map(m => ({
        org_id: m.orgId, timestamp: m.timestamp.toISOString(), original_model: m.originalModel,
        selected_model: m.selectedModel, task_type: m.taskType, optimizations_applied: m.optimizationsApplied,
        estimated_savings: m.estimatedSavings, latency_overhead_ms: m.latencyOverheadMs, cache_hit: m.cacheHit,
      })));
    } catch { this.metricsBuffer.unshift(...metricsToFlush); }
  }

  getStats(): EngineStats { return { ...this.stats }; }
  resetStats(): void { this.stats = { requestsProcessed: 0, optimizationsApplied: 0, cacheHits: 0, routingDecisions: 0, totalSavings: 0, avgLatencyOverhead: 0, errors: 0 }; }
  destroy(): void { if (this.flushInterval) clearInterval(this.flushInterval); this.flushMetrics(); }
}

export function createEnterpriseOptimizer(config: Partial<OptimizationEngineConfig> & { orgId: string }): EnterpriseOptimizationEngine {
  return new EnterpriseOptimizationEngine(config);
}
