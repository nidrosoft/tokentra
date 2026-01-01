/**
 * TokenTRA Enterprise Semantic Cache Engine
 * High-performance caching with vector similarity search
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { 
  CacheEntry, 
  CacheLookupResult, 
  CacheConfig, 
  TaskType 
} from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  similarityThreshold: 0.92,
  defaultTTLSeconds: 3600, // 1 hour
  maxEntriesPerOrg: 100000,
  taskSpecificTTL: {
    // Very short TTL - dynamic responses
    greeting: 60,
    chitchat: 60,
    
    // Short TTL - may change frequently
    information_lookup: 300,
    customer_support: 300,
    
    // Medium TTL - relatively stable
    faq: 3600,
    summarization: 3600,
    sentiment: 3600,
    classification: 3600,
    entity_extraction: 3600,
    formatting: 3600,
    proofreading: 3600,
    
    // Long TTL - very stable
    translation: 7200,
    code_explanation: 86400,
    documentation: 86400,
    
    // No caching - unique responses needed
    brainstorming: 0,
    ideation: 0,
    story_generation: 0,
    poetry: 0,
    creative_editing: 0,
    
    // No caching - accuracy critical
    math: 0,
    logic: 0,
    debugging: 0,
  },
  excludeTaskTypes: [
    'brainstorming', 'ideation', 'story_generation', 'poetry', 
    'creative_editing', 'math', 'logic', 'debugging'
  ],
};

// ============================================================================
// SEMANTIC CACHE ENGINE
// ============================================================================

export class SemanticCacheEngine {
  private config: CacheConfig;
  private supabase: SupabaseClient;
  private embeddingCache: Map<string, number[]> = new Map();
  private hashCache: Map<string, string> = new Map();
  private stats: CacheStats = {
    lookups: 0,
    hits: 0,
    misses: 0,
    stores: 0,
    evictions: 0,
    totalSavings: 0,
  };

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // ============================================================================
  // CACHE LOOKUP
  // ============================================================================

  /**
   * Look up a cached response for a prompt
   */
  async lookup(
    orgId: string,
    prompt: string,
    model: string,
    systemPromptHash?: string,
    taskType?: TaskType
  ): Promise<CacheLookupResult> {
    const startTime = performance.now();
    this.stats.lookups++;

    // Check if caching is disabled for this task type
    if (!this.config.enabled) {
      return { hit: false, lookupTimeMs: performance.now() - startTime };
    }

    if (taskType && this.config.excludeTaskTypes.includes(taskType)) {
      return { hit: false, lookupTimeMs: performance.now() - startTime };
    }

    if (taskType && this.config.taskSpecificTTL[taskType] === 0) {
      return { hit: false, lookupTimeMs: performance.now() - startTime };
    }

    try {
      // Generate embedding for the prompt
      const embedding = await this.getEmbedding(prompt);
      
      // Try exact hash match first (faster)
      const promptHash = await this.hashString(prompt);
      const exactMatch = await this.lookupExact(orgId, promptHash, model, systemPromptHash);
      
      if (exactMatch) {
        this.stats.hits++;
        return {
          hit: true,
          entry: exactMatch,
          similarity: 1.0,
          savingsEstimate: exactMatch.originalCost,
          lookupTimeMs: performance.now() - startTime,
        };
      }

      // Fall back to semantic similarity search
      const semanticMatch = await this.lookupSemantic(
        orgId, 
        embedding, 
        model, 
        systemPromptHash,
        this.config.similarityThreshold
      );

      if (semanticMatch) {
        this.stats.hits++;
        this.stats.totalSavings += semanticMatch.entry?.originalCost || 0;
        return {
          ...semanticMatch,
          lookupTimeMs: performance.now() - startTime,
        };
      }

      this.stats.misses++;
      return { hit: false, lookupTimeMs: performance.now() - startTime };

    } catch (error) {
      console.error('Semantic cache lookup failed:', error);
      this.stats.misses++;
      return { hit: false, lookupTimeMs: performance.now() - startTime };
    }
  }

  /**
   * Exact hash-based lookup
   */
  private async lookupExact(
    orgId: string,
    promptHash: string,
    model: string,
    systemPromptHash?: string
  ): Promise<CacheEntry | null> {
    let query = this.supabase
      .from('semantic_cache')
      .select('*')
      .eq('org_id', orgId)
      .eq('prompt_hash', promptHash)
      .eq('model', model)
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (systemPromptHash) {
      query = query.eq('system_prompt_hash', systemPromptHash);
    }

    const { data, error } = await query.single();

    if (error || !data) return null;

    // Update hit count
    await this.incrementHitCount(data.id);

    return this.mapToCacheEntry(data);
  }

  /**
   * Semantic similarity-based lookup using vector search
   */
  private async lookupSemantic(
    orgId: string,
    embedding: number[],
    model: string,
    systemPromptHash?: string,
    similarityThreshold: number = 0.92
  ): Promise<CacheLookupResult | null> {
    try {
      // Use Supabase RPC for vector similarity search
      const { data: matches, error } = await this.supabase.rpc('match_cache_entries', {
        p_org_id: orgId,
        p_embedding: embedding,
        p_model: model,
        p_system_hash: systemPromptHash || null,
        p_similarity_threshold: similarityThreshold,
        p_limit: 5,
      });

      if (error) {
        // If RPC doesn't exist, fall back to basic query
        console.warn('Vector search RPC not available, using fallback');
        return null;
      }

      if (!matches || matches.length === 0) return null;

      // Find the best non-expired match
      const now = new Date();
      for (const match of matches) {
        if (new Date(match.expires_at) > now) {
          await this.incrementHitCount(match.id);

          return {
            hit: true,
            entry: this.mapToCacheEntry(match),
            similarity: match.similarity,
            savingsEstimate: match.original_cost,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Semantic lookup failed:', error);
      return null;
    }
  }

  // ============================================================================
  // CACHE STORAGE
  // ============================================================================

  /**
   * Store a response in the cache
   */
  async store(
    orgId: string,
    prompt: string,
    response: string,
    model: string,
    cost: number,
    outputTokens: number,
    systemPromptHash?: string,
    taskType?: TaskType
  ): Promise<boolean> {
    // Check if caching is disabled for this task type
    if (!this.config.enabled) return false;

    if (taskType && this.config.excludeTaskTypes.includes(taskType)) {
      return false;
    }

    const ttlSeconds = taskType 
      ? (this.config.taskSpecificTTL[taskType] ?? this.config.defaultTTLSeconds)
      : this.config.defaultTTLSeconds;

    if (ttlSeconds === 0) return false;

    try {
      const embedding = await this.getEmbedding(prompt);
      const promptHash = await this.hashString(prompt);
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

      // Check if we need to evict old entries
      await this.enforceMaxEntries(orgId);

      const { error } = await this.supabase
        .from('semantic_cache')
        .upsert({
          org_id: orgId,
          prompt_hash: promptHash,
          prompt_embedding: embedding,
          model,
          system_prompt_hash: systemPromptHash,
          task_type: taskType,
          response,
          output_tokens: outputTokens,
          original_cost: cost,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          hit_count: 0,
          savings_generated: 0,
        }, {
          onConflict: 'org_id,prompt_hash,model',
        });

      if (error) {
        console.error('Failed to store cache entry:', error);
        return false;
      }

      this.stats.stores++;
      return true;

    } catch (error) {
      console.error('Cache store failed:', error);
      return false;
    }
  }

  /**
   * Store with additional metadata
   */
  async storeWithMetadata(
    orgId: string,
    prompt: string,
    response: string,
    metadata: {
      model: string;
      cost: number;
      outputTokens: number;
      inputTokens: number;
      latencyMs: number;
      systemPromptHash?: string;
      taskType?: TaskType;
      teamId?: string;
      projectId?: string;
    }
  ): Promise<boolean> {
    return this.store(
      orgId,
      prompt,
      response,
      metadata.model,
      metadata.cost,
      metadata.outputTokens,
      metadata.systemPromptHash,
      metadata.taskType
    );
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Invalidate cache entries matching criteria
   */
  async invalidate(
    orgId: string,
    criteria: {
      model?: string;
      taskType?: TaskType;
      olderThan?: Date;
      promptHashPrefix?: string;
    }
  ): Promise<number> {
    let query = this.supabase
      .from('semantic_cache')
      .delete()
      .eq('org_id', orgId);

    if (criteria.model) {
      query = query.eq('model', criteria.model);
    }

    if (criteria.taskType) {
      query = query.eq('task_type', criteria.taskType);
    }

    if (criteria.olderThan) {
      query = query.lt('created_at', criteria.olderThan.toISOString());
    }

    if (criteria.promptHashPrefix) {
      query = query.like('prompt_hash', `${criteria.promptHashPrefix}%`);
    }

    const { data, error } = await query.select('id');

    if (error) {
      console.error('Cache invalidation failed:', error);
      return 0;
    }

    const count = data?.length || 0;
    this.stats.evictions += count;
    return count;
  }

  /**
   * Clear all cache entries for an organization
   */
  async clearAll(orgId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('semantic_cache')
      .delete()
      .eq('org_id', orgId)
      .select('id');

    if (error) {
      console.error('Cache clear failed:', error);
      return 0;
    }

    const count = data?.length || 0;
    this.stats.evictions += count;
    return count;
  }

  /**
   * Remove expired entries
   */
  async cleanupExpired(orgId?: string): Promise<number> {
    let query = this.supabase
      .from('semantic_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (orgId) {
      query = query.eq('org_id', orgId);
    }

    const { data, error } = await query.select('id');

    if (error) {
      console.error('Expired cleanup failed:', error);
      return 0;
    }

    const count = data?.length || 0;
    this.stats.evictions += count;
    return count;
  }

  /**
   * Enforce maximum entries per organization
   */
  private async enforceMaxEntries(orgId: string): Promise<void> {
    const { count, error } = await this.supabase
      .from('semantic_cache')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    if (error || !count) return;

    if (count >= this.config.maxEntriesPerOrg) {
      // Delete oldest entries (LRU eviction)
      const toDelete = Math.ceil(this.config.maxEntriesPerOrg * 0.1); // Delete 10%
      
      const { data: oldestEntries } = await this.supabase
        .from('semantic_cache')
        .select('id')
        .eq('org_id', orgId)
        .order('last_hit_at', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(toDelete);

      if (oldestEntries && oldestEntries.length > 0) {
        const ids = oldestEntries.map(e => e.id);
        await this.supabase
          .from('semantic_cache')
          .delete()
          .in('id', ids);

        this.stats.evictions += ids.length;
      }
    }
  }

  // ============================================================================
  // EMBEDDING GENERATION
  // ============================================================================

  /**
   * Get embedding for text (with caching)
   */
  private async getEmbedding(text: string): Promise<number[]> {
    // Truncate text for cache key
    const cacheKey = await this.hashString(text.substring(0, 1000));
    
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    const embedding = await this.generateEmbedding(text);

    // Manage cache size
    if (this.embeddingCache.size > 10000) {
      const keysToDelete = Array.from(this.embeddingCache.keys()).slice(0, 5000);
      keysToDelete.forEach(k => this.embeddingCache.delete(k));
    }

    this.embeddingCache.set(cacheKey, embedding);
    return embedding;
  }

  /**
   * Generate embedding using OpenAI API
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Truncate to max tokens for embedding model
      const truncatedText = text.substring(0, 8000);

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: truncatedText,
          dimensions: 1536,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;

    } catch (error) {
      console.error('Embedding generation failed:', error);
      // Return zero vector as fallback (will not match anything)
      return new Array(1536).fill(0);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Hash a string using SHA-256
   */
  private async hashString(str: string): Promise<string> {
    // Check cache first
    if (this.hashCache.has(str)) {
      return this.hashCache.get(str)!;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Cache the hash
    if (this.hashCache.size > 10000) {
      const keysToDelete = Array.from(this.hashCache.keys()).slice(0, 5000);
      keysToDelete.forEach(k => this.hashCache.delete(k));
    }
    this.hashCache.set(str, hash);

    return hash;
  }

  /**
   * Increment hit count for a cache entry
   */
  private async incrementHitCount(entryId: string): Promise<void> {
    try {
      // Try RPC first
      await this.supabase.rpc('increment_cache_hit_count', { p_entry_id: entryId });
    } catch {
      // Fallback to direct update
      const { data: entry } = await this.supabase
        .from('semantic_cache')
        .select('hit_count, original_cost, savings_generated')
        .eq('id', entryId)
        .single();

      if (entry) {
        await this.supabase
          .from('semantic_cache')
          .update({
            hit_count: (entry.hit_count || 0) + 1,
            last_hit_at: new Date().toISOString(),
            savings_generated: (entry.savings_generated || 0) + (entry.original_cost || 0),
          })
          .eq('id', entryId);
      }
    }
  }

  /**
   * Map database row to CacheEntry
   */
  private mapToCacheEntry(row: Record<string, unknown>): CacheEntry {
    return {
      id: row.id as string,
      orgId: row.org_id as string,
      promptHash: row.prompt_hash as string,
      promptEmbedding: row.prompt_embedding as number[],
      model: row.model as string,
      systemPromptHash: row.system_prompt_hash as string | undefined,
      taskType: row.task_type as TaskType | undefined,
      response: row.response as string,
      outputTokens: row.output_tokens as number,
      createdAt: new Date(row.created_at as string),
      expiresAt: new Date(row.expires_at as string),
      hitCount: row.hit_count as number,
      lastHitAt: row.last_hit_at ? new Date(row.last_hit_at as string) : undefined,
      originalCost: row.original_cost as number,
      savingsGenerated: row.savings_generated as number,
    };
  }

  // ============================================================================
  // STATISTICS & MONITORING
  // ============================================================================

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get hit rate
   */
  getHitRate(): number {
    if (this.stats.lookups === 0) return 0;
    return this.stats.hits / this.stats.lookups;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      lookups: 0,
      hits: 0,
      misses: 0,
      stores: 0,
      evictions: 0,
      totalSavings: 0,
    };
  }

  /**
   * Get cache size for an organization
   */
  async getCacheSize(orgId: string): Promise<{ count: number; sizeBytes: number }> {
    const { count, error } = await this.supabase
      .from('semantic_cache')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    if (error) {
      return { count: 0, sizeBytes: 0 };
    }

    // Estimate size (rough approximation)
    const avgEntrySize = 5000; // ~5KB per entry
    return {
      count: count || 0,
      sizeBytes: (count || 0) * avgEntrySize,
    };
  }

  /**
   * Get cache analytics for an organization
   */
  async getAnalytics(orgId: string): Promise<CacheAnalytics> {
    const { data: entries, error } = await this.supabase
      .from('semantic_cache')
      .select('model, task_type, hit_count, original_cost, savings_generated, created_at')
      .eq('org_id', orgId);

    if (error || !entries) {
      return {
        totalEntries: 0,
        totalHits: 0,
        totalSavings: 0,
        avgHitsPerEntry: 0,
        byModel: {},
        byTaskType: {},
        topEntries: [],
      };
    }

    const byModel: Record<string, { count: number; hits: number; savings: number }> = {};
    const byTaskType: Record<string, { count: number; hits: number; savings: number }> = {};
    let totalHits = 0;
    let totalSavings = 0;

    for (const entry of entries) {
      totalHits += entry.hit_count || 0;
      totalSavings += entry.savings_generated || 0;

      // By model
      if (!byModel[entry.model]) {
        byModel[entry.model] = { count: 0, hits: 0, savings: 0 };
      }
      byModel[entry.model].count++;
      byModel[entry.model].hits += entry.hit_count || 0;
      byModel[entry.model].savings += entry.savings_generated || 0;

      // By task type
      const taskType = entry.task_type || 'unknown';
      if (!byTaskType[taskType]) {
        byTaskType[taskType] = { count: 0, hits: 0, savings: 0 };
      }
      byTaskType[taskType].count++;
      byTaskType[taskType].hits += entry.hit_count || 0;
      byTaskType[taskType].savings += entry.savings_generated || 0;
    }

    // Top entries by hits
    const topEntries = entries
      .sort((a, b) => (b.hit_count || 0) - (a.hit_count || 0))
      .slice(0, 10)
      .map(e => ({
        model: e.model,
        taskType: e.task_type,
        hits: e.hit_count || 0,
        savings: e.savings_generated || 0,
      }));

    return {
      totalEntries: entries.length,
      totalHits,
      totalSavings,
      avgHitsPerEntry: entries.length > 0 ? totalHits / entries.length : 0,
      byModel,
      byTaskType,
      topEntries,
    };
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Update cache configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Set similarity threshold
   */
  setSimilarityThreshold(threshold: number): void {
    this.config.similarityThreshold = Math.max(0.5, Math.min(1.0, threshold));
  }

  /**
   * Set TTL for a specific task type
   */
  setTaskTTL(taskType: TaskType, ttlSeconds: number): void {
    this.config.taskSpecificTTL[taskType] = ttlSeconds;
  }

  /**
   * Enable/disable caching for a task type
   */
  setTaskCachingEnabled(taskType: TaskType, enabled: boolean): void {
    if (enabled) {
      this.config.excludeTaskTypes = this.config.excludeTaskTypes.filter(t => t !== taskType);
    } else if (!this.config.excludeTaskTypes.includes(taskType)) {
      this.config.excludeTaskTypes.push(taskType);
    }
  }

  /**
   * Clear in-memory caches
   */
  clearMemoryCache(): void {
    this.embeddingCache.clear();
    this.hashCache.clear();
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface CacheStats {
  lookups: number;
  hits: number;
  misses: number;
  stores: number;
  evictions: number;
  totalSavings: number;
}

interface CacheAnalytics {
  totalEntries: number;
  totalHits: number;
  totalSavings: number;
  avgHitsPerEntry: number;
  byModel: Record<string, { count: number; hits: number; savings: number }>;
  byTaskType: Record<string, { count: number; hits: number; savings: number }>;
  topEntries: Array<{
    model: string;
    taskType: string | null;
    hits: number;
    savings: number;
  }>;
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const semanticCache = new SemanticCacheEngine();

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createSemanticCache(config?: Partial<CacheConfig>): SemanticCacheEngine {
  return new SemanticCacheEngine(config);
}
