/**
 * TokenTRA Enterprise Optimization Engine - Type Definitions
 * Comprehensive types for enterprise-grade AI cost optimization
 */

// ============================================================================
// PROVIDER & MODEL TYPES
// ============================================================================

export type Provider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'azure' 
  | 'aws_bedrock' 
  | 'deepseek' 
  | 'mistral' 
  | 'cohere' 
  | 'together' 
  | 'replicate'
  | 'groq'
  | 'xai';

export type ModelTier = 'budget' | 'mid' | 'premium' | 'flagship';

export type TaskCategory = 
  | 'chat' 
  | 'content' 
  | 'analysis' 
  | 'coding' 
  | 'reasoning' 
  | 'creative' 
  | 'embedding' 
  | 'multimodal';

export type TaskType =
  // Chat (8 types)
  | 'greeting' | 'faq' | 'clarification' | 'chitchat' | 'instruction_following'
  | 'roleplay' | 'customer_support' | 'information_lookup'
  // Content (8 types)
  | 'summarization' | 'expansion' | 'translation' | 'rewriting' | 'paraphrasing'
  | 'formatting' | 'proofreading' | 'content_generation'
  // Analysis (8 types)
  | 'sentiment' | 'classification' | 'entity_extraction' | 'comparison'
  | 'data_extraction' | 'pattern_recognition' | 'anomaly_detection' | 'clustering'
  // Coding (8 types)
  | 'code_generation' | 'code_review' | 'debugging' | 'code_explanation'
  | 'refactoring' | 'test_generation' | 'documentation' | 'code_completion'
  // Reasoning (7 types)
  | 'math' | 'logic' | 'planning' | 'decision_support' | 'problem_solving'
  | 'causal_reasoning' | 'hypothesis_generation'
  // Creative (8 types)
  | 'copywriting' | 'story_generation' | 'brainstorming' | 'ideation'
  | 'poetry' | 'dialogue_writing' | 'marketing_copy' | 'creative_editing';

// 18 Optimization Categories
export type OptimizationCategory =
  // Model Intelligence (4)
  | 'task_aware_routing' 
  | 'quality_cost_pareto' 
  | 'provider_arbitrage' 
  | 'model_version_optimization'
  // Token Economics (4)
  | 'io_ratio_optimization' 
  | 'context_window_efficiency' 
  | 'prompt_compression' 
  | 'output_format_optimization'
  // Caching (3)
  | 'semantic_caching' 
  | 'partial_response_caching' 
  | 'request_deduplication'
  // Waste Elimination (4)
  | 'retry_storm_detection' 
  | 'timeout_cost_analysis' 
  | 'rate_limit_optimization' 
  | 'abandoned_request_detection'
  // Specialized (3)
  | 'embedding_optimization' 
  | 'time_based_optimization' 
  | 'business_outcome_attribution';

export type RecommendationStatus = 'pending' | 'applied' | 'dismissed' | 'testing' | 'rolled_back';
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type QualityRequirement = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

export interface ModelConfig {
  id: string;
  provider: Provider;
  model: string;
  displayName: string;
  tier: ModelTier;
  inputCostPer1M: number;
  outputCostPer1M: number;
  cachingInputCostPer1M?: number;
  avgLatencyMs: number;
  maxContextTokens: number;
  maxOutputTokens: number;
  qualityScores: Record<TaskCategory, number>;
  capabilities: TaskCategory[];
  supportsBatching: boolean;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVision: boolean;
  deprecationDate?: string;
  alternatives?: string[];
}

// ============================================================================
// TASK CLASSIFICATION
// ============================================================================

export interface TaskClassification {
  taskType: TaskType;
  taskCategory: TaskCategory;
  confidence: number;
  complexityScore: number;
  reasoningDepthRequired: number;
  domainSpecificity: number;
  qualityRequirement: QualityRequirement;
  suggestedTier: ModelTier;
  explanation: string;
  features: TaskFeatures;
}

export interface TaskFeatures {
  hasCodeIndicators: boolean;
  hasMathIndicators: boolean;
  hasMultiStepIndicators: boolean;
  estimatedTokens: number;
  languageDetected?: string;
  domainDetected?: string;
  sentimentIndicators?: string[];
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

export interface UsageRecord {
  id: string;
  orgId: string;
  timestamp: Date;
  provider: Provider;
  model: string;
  requestId: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  latencyMs: number;
  timeToFirstToken?: number;
  teamId?: string;
  projectId?: string;
  featureId?: string;
  userId?: string;
  taskType?: TaskType;
  taskCategory?: TaskCategory;
  promptHash: string;
  systemPromptHash?: string;
  wasStreaming: boolean;
  hadError: boolean;
  errorType?: string;
  retryCount: number;
  wasTimeout: boolean;
  wasRateLimited: boolean;
  wasRouted: boolean;
  originalModel?: string;
  wasCached: boolean;
  wasCompressed: boolean;
  compressionRatio?: number;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export interface Recommendation {
  id: string;
  orgId: string;
  category: OptimizationCategory;
  type: string;
  title: string;
  description: string;
  currentMonthlyCost: number;
  projectedMonthlyCost: number;
  estimatedMonthlySavings: number;
  savingsPercent: number;
  confidence: number;
  priority: RecommendationPriority;
  evidence: RecommendationEvidence[];
  affectedRequests: number;
  sampleRequestIds: string[];
  implementationSteps: string[];
  estimatedEffort: 'minutes' | 'hours' | 'days' | 'weeks';
  riskLevel: 'low' | 'medium' | 'high';
  requiresABTest: boolean;
  suggestedRoutingRule?: Partial<RoutingRule>;
  status: RecommendationStatus;
  createdAt: Date;
  appliedAt?: Date;
  routingRuleId?: string;
  actualSavings?: number;
  expiresAt?: Date;
}

export interface RecommendationEvidence {
  type: 'usage_pattern' | 'cost_analysis' | 'quality_comparison' | 'sample_prompts' | 'benchmark' | 'time_series';
  title: string;
  data: Record<string, unknown>;
  visualization?: 'chart' | 'table' | 'code' | 'text' | 'heatmap';
}

// ============================================================================
// ROUTING RULES
// ============================================================================

export interface RoutingRule {
  id: string;
  orgId: string;
  name: string;
  description: string;
  ruleType: 'model_route' | 'cache' | 'compress' | 'rate_limit' | 'budget_enforce' | 'fallback';
  priority: number;
  enabled: boolean;
  conditions: RoutingCondition[];
  actions: RoutingAction;
  createdFromRecommendationId?: string;
  createdAt: Date;
  updatedAt: Date;
  abTestEnabled: boolean;
  abTestTrafficPercent?: number;
  matchCount: number;
  lastMatchedAt?: Date;
  savingsGenerated: number;
}

export interface RoutingCondition {
  field: RoutingConditionField;
  operator: RoutingOperator;
  value: unknown;
}

export type RoutingConditionField = 
  | 'model' 
  | 'provider' 
  | 'task_type' 
  | 'task_category' 
  | 'input_tokens' 
  | 'output_tokens'
  | 'team_id' 
  | 'project_id' 
  | 'feature_id' 
  | 'complexity_score' 
  | 'quality_requirement' 
  | 'time_of_day' 
  | 'day_of_week'
  | 'prompt_length'
  | 'has_code'
  | 'has_math'
  | 'latency_requirement'
  | 'budget_remaining';

export type RoutingOperator = 
  | 'eq' 
  | 'neq' 
  | 'gt' 
  | 'gte' 
  | 'lt' 
  | 'lte' 
  | 'in' 
  | 'not_in' 
  | 'contains' 
  | 'not_contains'
  | 'regex'
  | 'between';

export interface RoutingAction {
  type: 'route_to_model' | 'enable_cache' | 'compress_prompt' | 'rate_limit' | 'block' | 'alert';
  targetModel?: string;
  targetProvider?: Provider;
  fallbackModel?: string;
  fallbackProvider?: Provider;
  cacheTTLSeconds?: number;
  cacheScope?: 'request' | 'user' | 'team' | 'org';
  similarityThreshold?: number;
  compressionLevel?: 'light' | 'medium' | 'aggressive';
  maxRequestsPerWindow?: number;
  windowSizeSeconds?: number;
  maxCostPerWindow?: number;
  actionOnExceed?: 'queue' | 'reject' | 'alert' | 'downgrade';
  alertChannels?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// SEMANTIC CACHING
// ============================================================================

export interface CacheEntry {
  id: string;
  orgId: string;
  promptHash: string;
  promptEmbedding: number[];
  model: string;
  systemPromptHash?: string;
  taskType?: TaskType;
  response: string;
  outputTokens: number;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
  lastHitAt?: Date;
  originalCost: number;
  savingsGenerated: number;
}

export interface CacheLookupResult {
  hit: boolean;
  entry?: CacheEntry;
  similarity?: number;
  savingsEstimate?: number;
  lookupTimeMs?: number;
}

export interface CacheConfig {
  enabled: boolean;
  similarityThreshold: number;
  defaultTTLSeconds: number;
  maxEntriesPerOrg: number;
  taskSpecificTTL: Partial<Record<TaskType, number>>;
  excludeTaskTypes: TaskType[];
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

export interface Anomaly {
  id: string;
  orgId: string;
  type: AnomalyType;
  severity: AlertSeverity;
  title: string;
  description: string;
  detectedAt: Date;
  detectionMethod: 'z_score' | 'isolation_forest' | 'change_point' | 'threshold' | 'trend';
  currentValue: number;
  expectedValue: number;
  deviationPercent: number;
  zScore?: number;
  affectedResources: string[];
  timeRange: { start: Date; end: Date };
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  relatedRecommendationId?: string;
}

export type AnomalyType = 
  | 'spending_spike' 
  | 'usage_pattern' 
  | 'error_rate' 
  | 'latency' 
  | 'quality_drop'
  | 'retry_storm'
  | 'rate_limit_breach'
  | 'budget_exceeded'
  | 'model_degradation';

// ============================================================================
// OPTIMIZATION RESULTS
// ============================================================================

export interface RoutingDecision {
  selectedModel: string;
  selectedProvider: Provider;
  originalModel: string;
  originalProvider: Provider;
  wasRouted: boolean;
  routingRuleId?: string;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  confidence: number;
  fallbackModels: string[];
  qualityScore?: number;
}

export interface OptimizationResult {
  originalRequest: OptimizeRequestParams;
  optimizedRequest: OptimizeRequestParams;
  optimizationsApplied: string[];
  estimatedSavings: number;
  routingDecision: RoutingDecision;
  taskClassification: TaskClassification;
  cacheHit: boolean;
  cachedResponse?: string;
  latencyOverheadMs: number;
  metadata?: Record<string, unknown>;
}

export interface OptimizeRequestParams {
  orgId: string;
  model: string;
  provider: string;
  messages: Array<{ role: string; content: string }>;
  metadata?: RequestMetadata;
  bypassCache?: boolean;
  bypassRouting?: boolean;
  bypassCompression?: boolean;
  qualityOverride?: QualityRequirement;
  maxLatencyMs?: number;
  maxCost?: number;
}

export interface RequestMetadata {
  teamId?: string;
  projectId?: string;
  featureId?: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  environment?: 'development' | 'staging' | 'production';
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

export interface OptimizationEngineConfig {
  orgId: string;
  enableSemanticCaching: boolean;
  enablePromptCompression: boolean;
  enableModelRouting: boolean;
  enableProviderArbitrage: boolean;
  enableAnomalyDetection: boolean;
  enableRealTimeOptimization: boolean;
  cacheSimilarityThreshold: number;
  minSavingsForRecommendation: number;
  anomalyZScoreThreshold: number;
  analysisModel: string;
  classificationModel: string;
  embeddingModel: string;
  consensusEnabled: boolean;
  maxLatencyOverheadMs: number;
  debugMode: boolean;
}

export const DEFAULT_ENGINE_CONFIG: Omit<OptimizationEngineConfig, 'orgId'> = {
  enableSemanticCaching: true,
  enablePromptCompression: true,
  enableModelRouting: true,
  enableProviderArbitrage: true,
  enableAnomalyDetection: true,
  enableRealTimeOptimization: true,
  cacheSimilarityThreshold: 0.92,
  minSavingsForRecommendation: 50,
  anomalyZScoreThreshold: 3,
  analysisModel: 'claude-3-5-sonnet-20241022',
  classificationModel: 'gpt-4o-mini',
  embeddingModel: 'text-embedding-3-small',
  consensusEnabled: false,
  maxLatencyOverheadMs: 100,
  debugMode: false,
};

// ============================================================================
// ANALYSIS PATTERNS
// ============================================================================

export interface UsagePattern {
  type: OptimizationCategory;
  description: string;
  data: Record<string, unknown>;
  potentialSavings: number;
  confidence: number;
  affectedRequests: number;
  timeRange: { start: Date; end: Date };
  evidence: PatternEvidence[];
}

export interface PatternEvidence {
  metric: string;
  currentValue: number;
  benchmarkValue?: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  samples?: string[];
}

export interface AnalysisResult {
  patterns: UsagePattern[];
  recommendations: Recommendation[];
  anomalies: Anomaly[];
  summary: AnalysisSummary;
  analyzedRecords: number;
  analysisTimeMs: number;
}

export interface AnalysisSummary {
  totalSpend: number;
  totalRequests: number;
  totalTokens: number;
  avgCostPerRequest: number;
  potentialSavings: number;
  savingsPercent: number;
  topOpportunities: Array<{
    category: OptimizationCategory;
    savings: number;
    confidence: number;
  }>;
  healthScore: number;
  riskFactors: string[];
}

// ============================================================================
// METRICS & REPORTING
// ============================================================================

export interface OptimizationMetrics {
  orgId: string;
  period: 'hour' | 'day' | 'week' | 'month';
  timestamp: Date;
  totalRequests: number;
  optimizedRequests: number;
  cacheHits: number;
  cacheHitRate: number;
  routedRequests: number;
  routingRate: number;
  totalCost: number;
  savedCost: number;
  savingsRate: number;
  avgLatencyOverhead: number;
  errorRate: number;
  topOptimizations: Array<{
    type: string;
    count: number;
    savings: number;
  }>;
}

export interface CostBreakdown {
  byProvider: Record<Provider, number>;
  byModel: Record<string, number>;
  byTeam: Record<string, number>;
  byProject: Record<string, number>;
  byTaskCategory: Record<TaskCategory, number>;
  byHour: number[];
  byDayOfWeek: number[];
}

// ============================================================================
// CONSENSUS & QUALITY
// ============================================================================

export interface ConsensusConfig {
  enabled: boolean;
  models: string[];
  minAgreement: number;
  maxIterations: number;
  aggregationMethod: 'majority' | 'weighted' | 'best_of_n';
}

export interface ConsensusResult {
  finalAnswer: unknown;
  confidence: number;
  iterations: number;
  modelResponses: Array<{
    model: string;
    response: unknown;
    confidence: number;
    reasoning: string;
    latencyMs: number;
    cost: number;
  }>;
  consensusReached: boolean;
  dissent?: string[];
  totalCost: number;
  totalLatencyMs: number;
}

// ============================================================================
// EXPORT HELPERS
// ============================================================================

export function isHighPriority(rec: Recommendation): boolean {
  return rec.priority === 'critical' || rec.priority === 'high';
}

export function calculateSavingsPercent(current: number, projected: number): number {
  if (current === 0) return 0;
  return ((current - projected) / current) * 100;
}

export function getOptimizationCategoryLabel(category: OptimizationCategory): string {
  const labels: Record<OptimizationCategory, string> = {
    task_aware_routing: 'Task-Aware Routing',
    quality_cost_pareto: 'Quality-Cost Optimization',
    provider_arbitrage: 'Provider Arbitrage',
    model_version_optimization: 'Model Version Optimization',
    io_ratio_optimization: 'I/O Ratio Optimization',
    context_window_efficiency: 'Context Window Efficiency',
    prompt_compression: 'Prompt Compression',
    output_format_optimization: 'Output Format Optimization',
    semantic_caching: 'Semantic Caching',
    partial_response_caching: 'Partial Response Caching',
    request_deduplication: 'Request Deduplication',
    retry_storm_detection: 'Retry Storm Detection',
    timeout_cost_analysis: 'Timeout Cost Analysis',
    rate_limit_optimization: 'Rate Limit Optimization',
    abandoned_request_detection: 'Abandoned Request Detection',
    embedding_optimization: 'Embedding Optimization',
    time_based_optimization: 'Time-Based Optimization',
    business_outcome_attribution: 'Business Outcome Attribution',
  };
  return labels[category] || category;
}

export function getExpectedSavingsRange(category: OptimizationCategory): { min: number; max: number } {
  const ranges: Record<OptimizationCategory, { min: number; max: number }> = {
    task_aware_routing: { min: 25, max: 40 },
    quality_cost_pareto: { min: 10, max: 20 },
    provider_arbitrage: { min: 15, max: 30 },
    model_version_optimization: { min: 5, max: 15 },
    io_ratio_optimization: { min: 10, max: 30 },
    context_window_efficiency: { min: 5, max: 20 },
    prompt_compression: { min: 20, max: 40 },
    output_format_optimization: { min: 10, max: 25 },
    semantic_caching: { min: 40, max: 60 },
    partial_response_caching: { min: 5, max: 15 },
    request_deduplication: { min: 5, max: 10 },
    retry_storm_detection: { min: 50, max: 80 },
    timeout_cost_analysis: { min: 70, max: 90 },
    rate_limit_optimization: { min: 30, max: 50 },
    abandoned_request_detection: { min: 10, max: 30 },
    embedding_optimization: { min: 30, max: 50 },
    time_based_optimization: { min: 5, max: 10 },
    business_outcome_attribution: { min: 0, max: 0 }, // ROI visibility, not direct savings
  };
  return ranges[category] || { min: 0, max: 0 };
}
