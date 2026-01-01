import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface UsagePattern {
  type: string;
  description: string;
  data: Record<string, unknown>;
  potentialSavings: number;
  confidence: "high" | "medium" | "low";
}

export interface GeneratedRecommendation {
  type: string;
  title: string;
  description: string;
  impact: {
    estimatedMonthlySavings: number;
    savingsPercentage: number;
    confidence: string;
    affectedRequests: number;
  };
  details: Record<string, unknown>;
}

export class OptimizationEngine {
  private organizationId: string;
  private supabase = getSupabaseAdmin();

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Run full analysis and generate recommendations
   */
  async analyze(): Promise<GeneratedRecommendation[]> {
    const usage = await this.getRecentUsage(30); // Last 30 days
    
    if (usage.length === 0) {
      return [];
    }

    const patterns = await Promise.all([
      this.detectModelDowngradeOpportunities(usage),
      this.detectCachingOpportunities(usage),
      this.detectBatchingOpportunities(usage),
      this.detectErrorPatterns(usage),
      this.detectProviderSwitchOpportunities(usage),
    ]);

    const allPatterns = patterns.flat();
    const recommendations = this.generateRecommendations(allPatterns);
    
    return recommendations;
  }

  /**
   * Run analysis and save recommendations to database
   */
  async analyzeAndSave(): Promise<number> {
    const recommendations = await this.analyze();
    
    for (const rec of recommendations) {
      // Check if similar recommendation already exists
      const { data: existing } = await this.supabase
        .from("recommendations")
        .select("id")
        .eq("organization_id", this.organizationId)
        .eq("type", rec.type)
        .eq("status", "pending")
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing recommendation
        await this.supabase
          .from("recommendations")
          .update({
            title: rec.title,
            description: rec.description,
            impact: rec.impact as unknown as Record<string, never>,
            details: rec.details as unknown as Record<string, never>,
          })
          .eq("id", existing[0].id);
      } else {
        // Create new recommendation
        await this.supabase.from("recommendations").insert({
          organization_id: this.organizationId,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          impact: rec.impact as unknown as Record<string, never>,
          details: rec.details as unknown as Record<string, never>,
          status: "pending",
        });
      }
    }

    return recommendations.length;
  }

  /**
   * Get recent usage records
   */
  private async getRecentUsage(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await this.supabase
      .from("usage_records")
      .select("*")
      .eq("organization_id", this.organizationId)
      .gte("timestamp", since.toISOString())
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching usage:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Detect opportunities to use cheaper models
   */
  private async detectModelDowngradeOpportunities(
    usage: Array<Record<string, unknown>>
  ): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];
    
    // Group by model
    const byModel: Record<string, Array<Record<string, unknown>>> = {};
    for (const record of usage) {
      const model = String(record.model);
      if (!byModel[model]) byModel[model] = [];
      byModel[model].push(record);
    }

    // Check for expensive models that could be downgraded
    const downgradeMap: Record<string, { target: string; savingsPercent: number }> = {
      "gpt-4o": { target: "gpt-4o-mini", savingsPercent: 90 },
      "gpt-4": { target: "gpt-4o-mini", savingsPercent: 95 },
      "gpt-4-turbo": { target: "gpt-4o-mini", savingsPercent: 90 },
      "claude-3-5-sonnet-20241022": { target: "claude-3-5-haiku-20241022", savingsPercent: 80 },
      "claude-3-opus-20240229": { target: "claude-3-5-sonnet-20241022", savingsPercent: 70 },
    };

    for (const [model, records] of Object.entries(byModel)) {
      // Skip if model is already a "mini" or cheap variant
      if (model.toLowerCase().includes("mini") || model.toLowerCase().includes("haiku") || model.toLowerCase().includes("flash")) {
        continue;
      }
      
      const downgrade = Object.entries(downgradeMap).find(([key]) => 
        model.toLowerCase().includes(key.toLowerCase())
      );

      if (downgrade) {
        const [, { target, savingsPercent }] = downgrade;
        const totalCost = records.reduce((sum, r) => sum + Number(r.cost || 0), 0);
        const avgTokens = records.reduce((sum, r) => 
          sum + Number(r.input_tokens || 0) + Number(r.output_tokens || 0), 0
        ) / records.length;

        // Only suggest downgrade for simpler requests (< 1000 avg tokens)
        if (avgTokens < 1000) {
          const potentialSavings = totalCost * (savingsPercent / 100);
          
          patterns.push({
            type: "model_downgrade",
            description: `${records.length} requests to ${model} could use ${target}`,
            data: {
              currentModel: model,
              suggestedModel: target,
              requestCount: records.length,
              currentCost: totalCost,
              avgTokens,
            },
            potentialSavings: potentialSavings * 30 / Math.min(30, records.length), // Monthly estimate
            confidence: avgTokens < 500 ? "high" : "medium",
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Detect caching opportunities from repeated queries
   */
  private async detectCachingOpportunities(
    usage: Array<Record<string, unknown>>
  ): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];
    
    // Simple duplicate detection based on request_id patterns
    // In production, you'd use semantic similarity
    const requestCounts: Record<string, number> = {};
    const requestCosts: Record<string, number> = {};
    
    for (const record of usage) {
      // Use a simplified hash based on model + token count
      const key = `${record.model}_${record.input_tokens}`;
      requestCounts[key] = (requestCounts[key] || 0) + 1;
      requestCosts[key] = (requestCosts[key] || 0) + Number(record.cost || 0);
    }

    // Find patterns with high repetition
    let totalDuplicateCost = 0;
    let duplicateCount = 0;
    
    for (const [key, count] of Object.entries(requestCounts)) {
      if (count > 2) {
        duplicateCount += count - 1; // First request is not a duplicate
        totalDuplicateCost += requestCosts[key] * ((count - 1) / count);
      }
    }

    const duplicateRate = duplicateCount / usage.length;
    
    if (duplicateRate > 0.1) { // More than 10% duplicates
      patterns.push({
        type: "caching_opportunity",
        description: `${(duplicateRate * 100).toFixed(0)}% of requests appear to be similar`,
        data: {
          duplicateRate,
          duplicateCount,
          totalRequests: usage.length,
        },
        potentialSavings: totalDuplicateCost * 30 / Math.min(30, usage.length),
        confidence: duplicateRate > 0.3 ? "high" : "medium",
      });
    }

    return patterns;
  }

  /**
   * Detect batching opportunities
   */
  private async detectBatchingOpportunities(
    usage: Array<Record<string, unknown>>
  ): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];
    
    // Group requests by minute to find burst patterns
    const byMinute: Record<string, Array<Record<string, unknown>>> = {};
    
    for (const record of usage) {
      const timestamp = new Date(String(record.timestamp));
      const minuteKey = `${timestamp.toISOString().slice(0, 16)}`;
      if (!byMinute[minuteKey]) byMinute[minuteKey] = [];
      byMinute[minuteKey].push(record);
    }

    // Find minutes with many requests that could be batched
    let batchableCount = 0;
    let batchableCost = 0;
    
    for (const records of Object.values(byMinute)) {
      if (records.length > 5) {
        batchableCount += records.length;
        batchableCost += records.reduce((sum, r) => sum + Number(r.cost || 0), 0);
      }
    }

    if (batchableCount > usage.length * 0.2) {
      patterns.push({
        type: "batching_opportunity",
        description: `${batchableCount} requests could be batched for efficiency`,
        data: {
          batchableCount,
          totalRequests: usage.length,
          batchablePercentage: (batchableCount / usage.length) * 100,
        },
        potentialSavings: batchableCost * 0.15, // Estimate 15% savings from batching
        confidence: "medium",
      });
    }

    return patterns;
  }

  /**
   * Detect error patterns that waste money
   */
  private async detectErrorPatterns(
    usage: Array<Record<string, unknown>>
  ): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];
    
    const errors = usage.filter(r => r.status === "error" || r.status === "timeout");
    const errorRate = errors.length / usage.length;
    const errorCost = errors.reduce((sum, r) => sum + Number(r.cost || 0), 0);

    if (errorRate > 0.05) { // More than 5% error rate
      patterns.push({
        type: "error_reduction",
        description: `${(errorRate * 100).toFixed(1)}% of requests are failing`,
        data: {
          errorCount: errors.length,
          errorRate,
          errorCost,
          errorTypes: [...new Set(errors.map(e => e.error_code))],
        },
        potentialSavings: errorCost * 30 / Math.min(30, usage.length),
        confidence: "high",
      });
    }

    return patterns;
  }

  /**
   * Detect opportunities to switch providers
   */
  private async detectProviderSwitchOpportunities(
    usage: Array<Record<string, unknown>>
  ): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = [];
    
    // Group by provider
    const byProvider: Record<string, { cost: number; count: number }> = {};
    
    for (const record of usage) {
      const provider = String(record.provider);
      if (!byProvider[provider]) byProvider[provider] = { cost: 0, count: 0 };
      byProvider[provider].cost += Number(record.cost || 0);
      byProvider[provider].count += 1;
    }

    // Check if using expensive providers heavily
    const openaiUsage = byProvider["openai"];
    const anthropicUsage = byProvider["anthropic"];
    
    if (openaiUsage && openaiUsage.cost > 100) {
      // Suggest trying Anthropic or other providers
      patterns.push({
        type: "provider_switch",
        description: "Consider diversifying across providers for better pricing",
        data: {
          currentProvider: "openai",
          currentCost: openaiUsage.cost,
          suggestedProviders: ["anthropic", "google"],
        },
        potentialSavings: openaiUsage.cost * 0.1, // Estimate 10% savings
        confidence: "low",
      });
    }

    return patterns;
  }

  /**
   * Generate recommendations from detected patterns
   */
  private generateRecommendations(patterns: UsagePattern[]): GeneratedRecommendation[] {
    const recommendations: GeneratedRecommendation[] = [];

    for (const pattern of patterns) {
      const rec = this.patternToRecommendation(pattern);
      if (rec) {
        recommendations.push(rec);
      }
    }

    // Sort by potential savings
    recommendations.sort((a, b) => 
      b.impact.estimatedMonthlySavings - a.impact.estimatedMonthlySavings
    );

    return recommendations.slice(0, 10); // Top 10 recommendations
  }

  /**
   * Convert a pattern to a recommendation
   */
  private patternToRecommendation(pattern: UsagePattern): GeneratedRecommendation | null {
    const templates: Record<string, (p: UsagePattern) => GeneratedRecommendation> = {
      model_downgrade: (p) => ({
        type: "model_downgrade",
        title: `Switch from ${p.data.currentModel} to ${p.data.suggestedModel} for simple queries`,
        description: `Analysis shows ${p.data.requestCount} of your ${p.data.currentModel} requests are simple queries that could be handled by ${p.data.suggestedModel} at significantly lower cost.`,
        impact: {
          estimatedMonthlySavings: p.potentialSavings,
          savingsPercentage: Math.round((p.potentialSavings / Number(p.data.currentCost || 1)) * 100),
          confidence: p.confidence,
          affectedRequests: Number(p.data.requestCount),
        },
        details: {
          currentModel: p.data.currentModel,
          recommendedModel: p.data.suggestedModel,
          avgTokensPerRequest: p.data.avgTokens,
          qualityImpact: "minimal",
        },
      }),

      caching_opportunity: (p) => ({
        type: "caching_opportunity",
        title: "Enable semantic caching for repeated queries",
        description: `We detected ${(Number(p.data.duplicateRate) * 100).toFixed(0)}% of your queries are semantically similar. Enabling caching could reduce costs significantly.`,
        impact: {
          estimatedMonthlySavings: p.potentialSavings,
          savingsPercentage: Math.round(Number(p.data.duplicateRate) * 100),
          confidence: p.confidence,
          affectedRequests: Number(p.data.duplicateCount),
        },
        details: {
          duplicateRate: p.data.duplicateRate,
          cachableRequests: p.data.duplicateCount,
        },
      }),

      batching_opportunity: (p) => ({
        type: "batching_opportunity",
        title: "Batch similar requests for efficiency",
        description: `${p.data.batchableCount} requests could be batched together to reduce overhead and improve throughput.`,
        impact: {
          estimatedMonthlySavings: p.potentialSavings,
          savingsPercentage: 15,
          confidence: p.confidence,
          affectedRequests: Number(p.data.batchableCount),
        },
        details: {
          batchablePercentage: p.data.batchablePercentage,
        },
      }),

      error_reduction: (p) => ({
        type: "error_reduction",
        title: "Reduce failed requests to save costs",
        description: `${(Number(p.data.errorRate) * 100).toFixed(1)}% of your requests are failing. Fixing these issues could save $${p.potentialSavings.toFixed(2)}/month.`,
        impact: {
          estimatedMonthlySavings: p.potentialSavings,
          savingsPercentage: Math.round(Number(p.data.errorRate) * 100),
          confidence: p.confidence,
          affectedRequests: Number(p.data.errorCount),
        },
        details: {
          errorRate: p.data.errorRate,
          errorTypes: p.data.errorTypes,
        },
      }),

      provider_switch: (p) => ({
        type: "provider_switch",
        title: "Diversify providers for better pricing",
        description: `Consider using multiple providers to optimize for cost and reliability.`,
        impact: {
          estimatedMonthlySavings: p.potentialSavings,
          savingsPercentage: 10,
          confidence: p.confidence,
          affectedRequests: 0,
        },
        details: {
          currentProvider: p.data.currentProvider,
          suggestedProviders: p.data.suggestedProviders,
        },
      }),
    };

    const template = templates[pattern.type];
    return template ? template(pattern) : null;
  }
}

/**
 * Run optimization analysis for an organization
 */
export async function runOptimizationAnalysis(organizationId: string): Promise<number> {
  const engine = new OptimizationEngine(organizationId);
  return engine.analyzeAndSave();
}

/**
 * Run optimization analysis for all active organizations
 */
export async function runGlobalOptimizationAnalysis(): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id")
    .limit(100);

  if (!orgs) return;

  for (const org of orgs) {
    try {
      await runOptimizationAnalysis(org.id);
    } catch (error) {
      console.error(`Error analyzing org ${org.id}:`, error);
    }
  }
}
