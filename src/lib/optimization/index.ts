/**
 * TokenTRA Enterprise Optimization Engine
 * Comprehensive AI cost optimization with 18 categories
 */

// Core types
export * from './types';

// Model registry with December 2025 pricing
export { modelRegistry, ModelRegistry } from './model-registry';

// Task classification engine
export { taskClassifier, TaskClassifier } from './task-classifier';

// Semantic caching engine
export { semanticCache, SemanticCacheEngine, createSemanticCache } from './semantic-cache';

// Routing rules engine
export { routingRulesEngine, RoutingRulesEngine, createRoutingRulesEngine } from './routing-rules-engine';

// Enterprise optimization engine (real-time)
export { EnterpriseOptimizationEngine, createEnterpriseOptimizer } from './enterprise-engine';

// Analysis engine (batch analysis, 18 categories)
export { AnalysisEngine, createAnalysisEngine } from './analysis-engine';

// Legacy exports for backward compatibility
export { analyzeCosts } from './analyzer';
export { sortRecommendations, filterRecommendations, calculateTotalSavings } from './recommendations';
export { selectOptimalModel } from './model-selector';
