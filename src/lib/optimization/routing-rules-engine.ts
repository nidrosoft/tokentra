/**
 * TokenTRA Enterprise Routing Rules Engine
 * Intelligent request routing based on configurable rules
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  RoutingRule,
  RoutingCondition,
  RoutingAction,
  RoutingDecision,
  RoutingConditionField,
  RoutingOperator,
  Provider,
  TaskType,
  TaskCategory,
  QualityRequirement,
} from './types';
import { modelRegistry } from './model-registry';

// ============================================================================
// EVALUATION CONTEXT
// ============================================================================

export interface EvaluationContext {
  orgId: string;
  model: string;
  provider: Provider;
  taskType?: TaskType;
  taskCategory?: TaskCategory;
  complexityScore?: number;
  qualityRequirement?: QualityRequirement;
  inputTokens?: number;
  outputTokens?: number;
  teamId?: string;
  projectId?: string;
  featureId?: string;
  userId?: string;
  promptLength?: number;
  hasCode?: boolean;
  hasMath?: boolean;
  latencyRequirement?: number;
  budgetRemaining?: number;
  timeOfDay?: number;
  dayOfWeek?: number;
  metadata?: Record<string, unknown>;
}

export interface EvaluationResult {
  ruleMatched: boolean;
  matchedRule?: RoutingRule;
  matchedRules: RoutingRule[];
  decision: RoutingDecision;
  evaluationTimeMs: number;
  rulesEvaluated: number;
}

// ============================================================================
// ROUTING RULES ENGINE
// ============================================================================

export class RoutingRulesEngine {
  private supabase: SupabaseClient;
  private rulesCache: Map<string, RoutingRule[]> = new Map();
  private lastRefresh: Map<string, number> = new Map();
  private refreshIntervalMs: number = 60000; // 1 minute
  private stats: RoutingStats = {
    evaluations: 0,
    matches: 0,
    misses: 0,
    errors: 0,
    totalSavings: 0,
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // ============================================================================
  // RULE EVALUATION
  // ============================================================================

  /**
   * Evaluate routing rules for a request context
   */
  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const startTime = performance.now();
    this.stats.evaluations++;

    try {
      // Enrich context with time-based fields
      const enrichedContext = this.enrichContext(context);

      // Get rules for the organization
      const rules = await this.getRules(context.orgId);
      const enabledRules = rules.filter(r => r.enabled);
      const sortedRules = enabledRules.sort((a, b) => a.priority - b.priority);

      const matchedRules: RoutingRule[] = [];

      // Evaluate each rule
      for (const rule of sortedRules) {
        if (this.matchesConditions(rule, enrichedContext)) {
          matchedRules.push(rule);

          // For model routing, use first match (highest priority)
          if (rule.ruleType === 'model_route') {
            const decision = this.applyRule(rule, enrichedContext);
            await this.recordMatch(rule.id, decision);
            this.stats.matches++;

            return {
              ruleMatched: true,
              matchedRule: rule,
              matchedRules,
              decision,
              evaluationTimeMs: performance.now() - startTime,
              rulesEvaluated: sortedRules.indexOf(rule) + 1,
            };
          }
        }
      }

      // No routing rule matched
      this.stats.misses++;
      return {
        ruleMatched: matchedRules.length > 0,
        matchedRules,
        decision: this.createDefaultDecision(enrichedContext),
        evaluationTimeMs: performance.now() - startTime,
        rulesEvaluated: sortedRules.length,
      };

    } catch (error) {
      console.error('Rule evaluation error:', error);
      this.stats.errors++;
      return {
        ruleMatched: false,
        matchedRules: [],
        decision: this.createDefaultDecision(context),
        evaluationTimeMs: performance.now() - startTime,
        rulesEvaluated: 0,
      };
    }
  }

  /**
   * Enrich context with computed fields
   */
  private enrichContext(context: EvaluationContext): EvaluationContext {
    const now = new Date();
    return {
      ...context,
      timeOfDay: context.timeOfDay ?? now.getHours(),
      dayOfWeek: context.dayOfWeek ?? now.getDay(),
    };
  }

  /**
   * Check if a rule's conditions match the context
   */
  private matchesConditions(rule: RoutingRule, context: EvaluationContext): boolean {
    // All conditions must match (AND logic)
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: RoutingCondition, context: EvaluationContext): boolean {
    const value = this.getContextValue(condition.field, context);
    
    // Handle undefined values
    if (value === undefined || value === null) {
      // Only 'neq' and 'not_in' should match undefined values
      return condition.operator === 'neq' || condition.operator === 'not_in';
    }

    return this.compareValues(value, condition.operator, condition.value);
  }

  /**
   * Get value from context for a field
   */
  private getContextValue(field: RoutingConditionField, context: EvaluationContext): unknown {
    const fieldMap: Record<RoutingConditionField, unknown> = {
      model: context.model,
      provider: context.provider,
      task_type: context.taskType,
      task_category: context.taskCategory,
      input_tokens: context.inputTokens,
      output_tokens: context.outputTokens,
      team_id: context.teamId,
      project_id: context.projectId,
      feature_id: context.featureId,
      complexity_score: context.complexityScore,
      quality_requirement: context.qualityRequirement,
      time_of_day: context.timeOfDay,
      day_of_week: context.dayOfWeek,
      prompt_length: context.promptLength,
      has_code: context.hasCode,
      has_math: context.hasMath,
      latency_requirement: context.latencyRequirement,
      budget_remaining: context.budgetRemaining,
    };

    return fieldMap[field];
  }

  /**
   * Compare values using the specified operator
   */
  private compareValues(value: unknown, operator: RoutingOperator, target: unknown): boolean {
    switch (operator) {
      case 'eq':
        return value === target;

      case 'neq':
        return value !== target;

      case 'gt':
        return typeof value === 'number' && typeof target === 'number' && value > target;

      case 'gte':
        return typeof value === 'number' && typeof target === 'number' && value >= target;

      case 'lt':
        return typeof value === 'number' && typeof target === 'number' && value < target;

      case 'lte':
        return typeof value === 'number' && typeof target === 'number' && value <= target;

      case 'in':
        return Array.isArray(target) && target.includes(value);

      case 'not_in':
        return Array.isArray(target) && !target.includes(value);

      case 'contains':
        return typeof value === 'string' && typeof target === 'string' && 
          value.toLowerCase().includes(target.toLowerCase());

      case 'not_contains':
        return typeof value === 'string' && typeof target === 'string' && 
          !value.toLowerCase().includes(target.toLowerCase());

      case 'regex':
        try {
          return typeof value === 'string' && typeof target === 'string' && 
            new RegExp(target, 'i').test(value);
        } catch {
          return false;
        }

      case 'between':
        if (typeof value === 'number' && Array.isArray(target) && target.length === 2) {
          const [min, max] = target as [number, number];
          return value >= min && value <= max;
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Apply a matched rule to generate a routing decision
   */
  private applyRule(rule: RoutingRule, context: EvaluationContext): RoutingDecision {
    const action = rule.actions;
    const targetModel = action.targetModel || context.model;
    const targetProvider = action.targetProvider || context.provider;
    const modelConfig = modelRegistry.getModel(targetModel);

    const estimatedCost = modelConfig 
      ? modelRegistry.calculateCost(targetModel, context.inputTokens || 1000, 500)
      : 0;

    const originalCost = modelRegistry.calculateCost(context.model, context.inputTokens || 1000, 500);
    const savings = Math.max(0, originalCost - estimatedCost);

    return {
      selectedModel: targetModel,
      selectedProvider: targetProvider,
      originalModel: context.model,
      originalProvider: context.provider,
      wasRouted: targetModel !== context.model || targetProvider !== context.provider,
      routingRuleId: rule.id,
      reason: `Matched rule: ${rule.name}`,
      estimatedCost,
      estimatedLatency: modelConfig?.avgLatencyMs || 1000,
      confidence: 1.0,
      fallbackModels: action.fallbackModel ? [action.fallbackModel] : [],
      qualityScore: modelConfig?.qualityScores[context.taskCategory || 'chat'],
    };
  }

  /**
   * Create default decision when no rule matches
   */
  private createDefaultDecision(context: EvaluationContext): RoutingDecision {
    const modelConfig = modelRegistry.getModel(context.model);
    
    return {
      selectedModel: context.model,
      selectedProvider: context.provider,
      originalModel: context.model,
      originalProvider: context.provider,
      wasRouted: false,
      reason: 'No routing rule matched',
      estimatedCost: modelConfig 
        ? modelRegistry.calculateCost(context.model, context.inputTokens || 1000, 500)
        : 0,
      estimatedLatency: modelConfig?.avgLatencyMs || 1000,
      confidence: 1.0,
      fallbackModels: [],
      qualityScore: modelConfig?.qualityScores[context.taskCategory || 'chat'],
    };
  }

  // ============================================================================
  // RULE MANAGEMENT
  // ============================================================================

  /**
   * Get rules for an organization (with caching)
   */
  private async getRules(orgId: string): Promise<RoutingRule[]> {
    const lastRefreshTime = this.lastRefresh.get(orgId) || 0;
    const now = Date.now();

    // Return cached rules if still fresh
    if (this.rulesCache.has(orgId) && (now - lastRefreshTime) < this.refreshIntervalMs) {
      return this.rulesCache.get(orgId)!;
    }

    // Fetch fresh rules from database
    const { data: rules, error } = await this.supabase
      .from('routing_rules')
      .select('*')
      .eq('organization_id', orgId)
      .eq('enabled', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Failed to fetch routing rules:', error);
      return this.rulesCache.get(orgId) || [];
    }

    const mappedRules = (rules || []).map(this.mapRule);
    this.rulesCache.set(orgId, mappedRules);
    this.lastRefresh.set(orgId, now);

    return mappedRules;
  }

  /**
   * Map database row to RoutingRule
   */
  private mapRule(row: Record<string, unknown>): RoutingRule {
    return {
      id: row.id as string,
      orgId: row.organization_id as string,
      name: row.name as string,
      description: row.description as string,
      ruleType: row.rule_type as RoutingRule['ruleType'],
      priority: row.priority as number,
      enabled: row.enabled as boolean,
      conditions: (row.conditions as RoutingCondition[]) || [],
      actions: (row.actions as RoutingAction) || { type: 'route_to_model' },
      createdFromRecommendationId: row.created_from_recommendation_id as string | undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      abTestEnabled: row.ab_test_enabled as boolean || false,
      abTestTrafficPercent: row.ab_test_traffic_percent as number | undefined,
      matchCount: row.match_count as number || 0,
      lastMatchedAt: row.last_matched_at ? new Date(row.last_matched_at as string) : undefined,
      savingsGenerated: row.savings_generated as number || 0,
    };
  }

  /**
   * Create a new routing rule
   */
  async createRule(
    orgId: string,
    rule: Omit<RoutingRule, 'id' | 'orgId' | 'createdAt' | 'updatedAt' | 'matchCount' | 'lastMatchedAt' | 'savingsGenerated'>
  ): Promise<RoutingRule> {
    const { data, error } = await this.supabase
      .from('routing_rules')
      .insert({
        organization_id: orgId,
        name: rule.name,
        description: rule.description,
        rule_type: rule.ruleType,
        priority: rule.priority,
        enabled: rule.enabled,
        conditions: rule.conditions,
        actions: rule.actions,
        created_from_recommendation_id: rule.createdFromRecommendationId,
        ab_test_enabled: rule.abTestEnabled,
        ab_test_traffic_percent: rule.abTestTrafficPercent,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create routing rule: ${error.message}`);
    }

    // Invalidate cache
    this.rulesCache.delete(orgId);

    return this.mapRule(data);
  }

  /**
   * Create a rule from a recommendation
   */
  async createRuleFromRecommendation(
    orgId: string,
    recommendationId: string,
    rule: Partial<RoutingRule>
  ): Promise<RoutingRule> {
    return this.createRule(orgId, {
      name: rule.name || 'Auto-generated rule',
      description: rule.description || 'Created from optimization recommendation',
      ruleType: rule.ruleType || 'model_route',
      priority: rule.priority || 100,
      enabled: true,
      conditions: rule.conditions || [],
      actions: rule.actions || { type: 'route_to_model' },
      createdFromRecommendationId: recommendationId,
      abTestEnabled: rule.abTestEnabled || false,
      abTestTrafficPercent: rule.abTestTrafficPercent,
    });
  }

  /**
   * Update an existing rule
   */
  async updateRule(
    ruleId: string,
    updates: Partial<Omit<RoutingRule, 'id' | 'orgId' | 'createdAt'>>
  ): Promise<RoutingRule> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.ruleType !== undefined) updateData.rule_type = updates.ruleType;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
    if (updates.conditions !== undefined) updateData.conditions = updates.conditions;
    if (updates.actions !== undefined) updateData.actions = updates.actions;
    if (updates.abTestEnabled !== undefined) updateData.ab_test_enabled = updates.abTestEnabled;
    if (updates.abTestTrafficPercent !== undefined) updateData.ab_test_traffic_percent = updates.abTestTrafficPercent;

    const { data, error } = await this.supabase
      .from('routing_rules')
      .update(updateData)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update routing rule: ${error.message}`);
    }

    // Invalidate cache for the org
    const orgId = data.organization_id as string;
    this.rulesCache.delete(orgId);

    return this.mapRule(data);
  }

  /**
   * Delete a rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    // Get org ID first for cache invalidation
    const { data: rule } = await this.supabase
      .from('routing_rules')
      .select('organization_id')
      .eq('id', ruleId)
      .single();

    const { error } = await this.supabase
      .from('routing_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      throw new Error(`Failed to delete routing rule: ${error.message}`);
    }

    // Invalidate cache
    if (rule) {
      this.rulesCache.delete(rule.organization_id as string);
    }
  }

  /**
   * Enable/disable a rule
   */
  async setRuleEnabled(ruleId: string, enabled: boolean): Promise<void> {
    await this.updateRule(ruleId, { enabled });
  }

  /**
   * Get all rules for an organization
   */
  async getAllRules(orgId: string): Promise<RoutingRule[]> {
    const { data: rules, error } = await this.supabase
      .from('routing_rules')
      .select('*')
      .eq('organization_id', orgId)
      .order('priority', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch routing rules: ${error.message}`);
    }

    return (rules || []).map(this.mapRule);
  }

  /**
   * Get a single rule by ID
   */
  async getRule(ruleId: string): Promise<RoutingRule | null> {
    const { data, error } = await this.supabase
      .from('routing_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (error) {
      return null;
    }

    return this.mapRule(data);
  }

  // ============================================================================
  // STATISTICS & MONITORING
  // ============================================================================

  /**
   * Record a rule match
   */
  private async recordMatch(ruleId: string, decision: RoutingDecision): Promise<void> {
    try {
      // Calculate savings
      const originalCost = modelRegistry.calculateCost(decision.originalModel, 1000, 500);
      const newCost = modelRegistry.calculateCost(decision.selectedModel, 1000, 500);
      const savings = Math.max(0, originalCost - newCost);

      // Try RPC first
      await this.supabase.rpc('increment_rule_match_count', {
        p_rule_id: ruleId,
        p_savings: savings,
      });
    } catch {
      // Fallback to direct update
      const { data: rule } = await this.supabase
        .from('routing_rules')
        .select('match_count, savings_generated')
        .eq('id', ruleId)
        .single();

      if (rule) {
        await this.supabase
          .from('routing_rules')
          .update({
            match_count: (rule.match_count || 0) + 1,
            last_matched_at: new Date().toISOString(),
          })
          .eq('id', ruleId);
      }
    }
  }

  /**
   * Get routing statistics
   */
  getStats(): RoutingStats {
    return { ...this.stats };
  }

  /**
   * Get match rate
   */
  getMatchRate(): number {
    if (this.stats.evaluations === 0) return 0;
    return this.stats.matches / this.stats.evaluations;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      evaluations: 0,
      matches: 0,
      misses: 0,
      errors: 0,
      totalSavings: 0,
    };
  }

  /**
   * Get rule analytics
   */
  async getRuleAnalytics(orgId: string): Promise<RuleAnalytics> {
    const rules = await this.getAllRules(orgId);

    const enabledRules = rules.filter(r => r.enabled);
    const totalMatches = rules.reduce((sum, r) => sum + r.matchCount, 0);
    const totalSavings = rules.reduce((sum, r) => sum + r.savingsGenerated, 0);

    const byType: Record<string, { count: number; matches: number; savings: number }> = {};
    for (const rule of rules) {
      if (!byType[rule.ruleType]) {
        byType[rule.ruleType] = { count: 0, matches: 0, savings: 0 };
      }
      byType[rule.ruleType].count++;
      byType[rule.ruleType].matches += rule.matchCount;
      byType[rule.ruleType].savings += rule.savingsGenerated;
    }

    const topRules = rules
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        name: r.name,
        matches: r.matchCount,
        savings: r.savingsGenerated,
        lastMatched: r.lastMatchedAt,
      }));

    return {
      totalRules: rules.length,
      enabledRules: enabledRules.length,
      totalMatches,
      totalSavings,
      byType,
      topRules,
    };
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Invalidate cache for an organization
   */
  invalidateCache(orgId: string): void {
    this.rulesCache.delete(orgId);
    this.lastRefresh.delete(orgId);
  }

  /**
   * Invalidate all caches
   */
  invalidateAllCaches(): void {
    this.rulesCache.clear();
    this.lastRefresh.clear();
  }

  /**
   * Set cache refresh interval
   */
  setRefreshInterval(intervalMs: number): void {
    this.refreshIntervalMs = intervalMs;
  }

  // ============================================================================
  // RULE VALIDATION
  // ============================================================================

  /**
   * Validate a rule configuration
   */
  validateRule(rule: Partial<RoutingRule>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!rule.name || rule.name.trim().length === 0) {
      errors.push('Rule name is required');
    }

    if (!rule.ruleType) {
      errors.push('Rule type is required');
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      warnings.push('Rule has no conditions - will match all requests');
    }

    if (!rule.actions) {
      errors.push('Rule actions are required');
    }

    // Validate conditions
    if (rule.conditions) {
      for (let i = 0; i < rule.conditions.length; i++) {
        const condition = rule.conditions[i];
        if (!condition.field) {
          errors.push(`Condition ${i + 1}: field is required`);
        }
        if (!condition.operator) {
          errors.push(`Condition ${i + 1}: operator is required`);
        }
        if (condition.value === undefined) {
          errors.push(`Condition ${i + 1}: value is required`);
        }
      }
    }

    // Validate actions
    if (rule.actions && rule.ruleType === 'model_route') {
      if (!rule.actions.targetModel && !rule.actions.targetProvider) {
        errors.push('Model routing rule must specify targetModel or targetProvider');
      }

      // Check if target model exists
      if (rule.actions.targetModel) {
        const model = modelRegistry.getModel(rule.actions.targetModel);
        if (!model) {
          warnings.push(`Target model "${rule.actions.targetModel}" not found in registry`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Test a rule against sample contexts
   */
  async testRule(
    rule: RoutingRule,
    testContexts: EvaluationContext[]
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const context of testContexts) {
      const enrichedContext = this.enrichContext(context);
      const matches = this.matchesConditions(rule, enrichedContext);
      const decision = matches ? this.applyRule(rule, enrichedContext) : null;

      results.push({
        context,
        matches,
        decision,
        conditionResults: rule.conditions.map(c => ({
          condition: c,
          matched: this.evaluateCondition(c, enrichedContext),
          actualValue: this.getContextValue(c.field, enrichedContext),
        })),
      });
    }

    return results;
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface RoutingStats {
  evaluations: number;
  matches: number;
  misses: number;
  errors: number;
  totalSavings: number;
}

interface RuleAnalytics {
  totalRules: number;
  enabledRules: number;
  totalMatches: number;
  totalSavings: number;
  byType: Record<string, { count: number; matches: number; savings: number }>;
  topRules: Array<{
    id: string;
    name: string;
    matches: number;
    savings: number;
    lastMatched?: Date;
  }>;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface TestResult {
  context: EvaluationContext;
  matches: boolean;
  decision: RoutingDecision | null;
  conditionResults: Array<{
    condition: RoutingCondition;
    matched: boolean;
    actualValue: unknown;
  }>;
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const routingRulesEngine = new RoutingRulesEngine();

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createRoutingRulesEngine(): RoutingRulesEngine {
  return new RoutingRulesEngine();
}
