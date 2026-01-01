import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: {
    estimatedMonthlySavings?: number;
    savingsPercentage?: number;
  };
  details: Record<string, unknown>;
  status: "pending" | "applied" | "dismissed" | "expired";
  createdAt: string;
  appliedAt?: string;
  dismissedAt?: string;
}

export interface OptimizationSummary {
  totalPotentialSavings: number;
  recommendationCount: number;
  appliedSavings: number;
  topOpportunities: Recommendation[];
}

export class OptimizationService {
  async getRecommendations(organizationId: string, status?: string): Promise<Recommendation[]> {
    const supabase = getSupabaseAdmin();
    
    let query = supabase
      .from("recommendations")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    
    if (status) {
      query = query.eq("status", status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
    
    return (data || []).map(this.mapRecommendation);
  }

  async getRecommendation(id: string): Promise<Recommendation | null> {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return this.mapRecommendation(data);
  }

  async getSummary(organizationId: string): Promise<OptimizationSummary> {
    const supabase = getSupabaseAdmin();
    
    // Get pending recommendations
    const { data: pending } = await supabase
      .from("recommendations")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("status", "pending");
    
    // Get applied recommendations for actual savings
    const { data: applied } = await supabase
      .from("optimization_actions")
      .select("actual_savings")
      .eq("organization_id", organizationId);
    
    const pendingRecs = (pending || []).map(this.mapRecommendation);
    const totalPotentialSavings = pendingRecs.reduce(
      (sum, r) => sum + (r.impact.estimatedMonthlySavings || 0),
      0
    );
    const appliedSavings = (applied || []).reduce(
      (sum, a) => sum + (Number(a.actual_savings) || 0),
      0
    );
    
    return {
      totalPotentialSavings,
      recommendationCount: pendingRecs.length,
      appliedSavings,
      topOpportunities: pendingRecs.slice(0, 5),
    };
  }

  async applyRecommendation(
    id: string,
    organizationId: string,
    userId?: string
  ): Promise<{ success: boolean; error?: string; ruleId?: string }> {
    const supabase = getSupabaseAdmin();
    
    // Get the recommendation
    const { data: rec, error: fetchError } = await supabase
      .from("recommendations")
      .select("*")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .single();
    
    if (fetchError || !rec) {
      return { success: false, error: "Recommendation not found" };
    }
    
    if (rec.status !== "pending") {
      return { success: false, error: `Recommendation already ${rec.status}` };
    }

    // Create a routing rule based on the recommendation type
    const rule = this.createRoutingRule(rec, organizationId);
    let ruleId: string | undefined;
    
    if (rule) {
      // Insert routing rule - using type assertion since table is newly created
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: insertedRule, error: ruleError } = await (supabase as any)
        .from("routing_rules")
        .insert({
          organization_id: organizationId,
          name: rule.name,
          description: rule.description,
          rule_type: rule.ruleType,
          priority: rule.priority,
          conditions: rule.conditions,
          actions: rule.actions,
          enabled: true,
          created_from_recommendation_id: id,
        })
        .select("id")
        .single();
      
      if (ruleError) {
        console.error("Error creating routing rule:", ruleError);
      } else {
        ruleId = insertedRule?.id;
      }
    }
    
    // Update recommendation status
    const { error: updateError } = await supabase
      .from("recommendations")
      .update({
        status: "applied",
        applied_at: new Date().toISOString(),
        applied_by: userId || null,
        routing_rule_id: ruleId || null,
      })
      .eq("id", id);
    
    if (updateError) {
      console.error("Error applying recommendation:", updateError);
      return { success: false, error: "Failed to apply recommendation" };
    }
    
    // Log the optimization action
    const impact = rec.impact as { estimatedMonthlySavings?: number };
    await supabase.from("optimization_actions").insert({
      organization_id: organizationId,
      recommendation_id: id,
      action_type: rec.type,
      before_state: rec.details,
      after_state: { applied: true, routing_rule_id: ruleId },
      actual_savings: impact?.estimatedMonthlySavings || 0,
      applied_by: userId || null,
    });
    
    return { success: true, ruleId };
  }

  /**
   * Create a routing rule from a recommendation
   * Supports both legacy types and new enterprise 18-category types
   */
  private createRoutingRule(
    rec: Record<string, unknown>,
    organizationId: string
  ): {
    name: string;
    description: string;
    ruleType: string;
    priority: number;
    conditions: Record<string, unknown>;
    actions: Record<string, unknown>;
  } | null {
    const details = (rec.details as Record<string, unknown>) || {};
    const metadata = (rec.metadata as Record<string, unknown>) || {};
    const recType = rec.type as string;

    switch (recType) {
      // Legacy type
      case "model_downgrade":
        return {
          name: `Route ${details.currentModel} to ${details.recommendedModel}`,
          description: `Automatically route simple requests from ${details.currentModel} to ${details.recommendedModel}`,
          ruleType: "model_route",
          priority: 10,
          conditions: {
            original_model: details.currentModel,
            max_input_tokens: 500,
          },
          actions: {
            route_to_model: details.recommendedModel,
            fallback_on_error: true,
          },
        };

      // Enterprise: Model Intelligence (4 categories)
      case "task_aware_routing":
        return {
          name: "Task-Aware Model Routing",
          description: "Route simple tasks to cost-effective models based on task classification",
          ruleType: "model_route",
          priority: 10,
          conditions: {
            complexity_score: { operator: "lt", value: 0.5 },
            quality_requirement: { operator: "in", value: ["low", "medium"] },
          },
          actions: {
            type: "route_to_model",
            targetModel: "gpt-4o-mini",
            fallbackModel: "gpt-4o",
          },
        };

      case "quality_cost_pareto":
        return {
          name: "Quality-Cost Optimization",
          description: "Use mid-tier models for non-critical tasks",
          ruleType: "model_route",
          priority: 15,
          conditions: {
            task_category: { operator: "not_in", value: ["reasoning", "coding"] },
            quality_requirement: { operator: "neq", value: "critical" },
          },
          actions: {
            type: "route_to_model",
            targetModel: "gpt-4o",
            fallbackModel: "claude-3-5-sonnet-20241022",
          },
        };

      case "provider_arbitrage":
        return {
          name: "Provider Cost Arbitrage",
          description: "Route to cheaper provider offering equivalent model",
          ruleType: "model_route",
          priority: 20,
          conditions: {},
          actions: {
            type: "route_to_provider",
            enableArbitrage: true,
            preferredProviders: ["deepseek", "google", "openai"],
          },
        };

      case "model_version_optimization":
        return {
          name: "Model Version Upgrade",
          description: "Migrate from deprecated models to current versions",
          ruleType: "model_route",
          priority: 5,
          conditions: {},
          actions: {
            type: "upgrade_model",
            autoUpgrade: true,
          },
        };

      // Enterprise: Caching (3 categories)
      case "semantic_caching":
      case "caching_opportunity":
        return {
          name: "Enable Semantic Caching",
          description: "Cache similar queries to reduce API calls and costs",
          ruleType: "cache",
          priority: 25,
          conditions: {
            similarity_threshold: 0.92,
          },
          actions: {
            type: "enable_cache",
            cache_ttl_seconds: 3600,
            cache_scope: "organization",
          },
        };

      case "partial_response_caching":
        return {
          name: "System Prompt Caching",
          description: "Cache frequently used system prompts",
          ruleType: "cache",
          priority: 26,
          conditions: {
            has_system_prompt: true,
          },
          actions: {
            type: "enable_prompt_cache",
            cache_ttl_seconds: 86400,
          },
        };

      case "request_deduplication":
        return {
          name: "Request Deduplication",
          description: "Deduplicate rapid identical requests",
          ruleType: "cache",
          priority: 1,
          conditions: {
            dedup_window_ms: 1000,
          },
          actions: {
            type: "deduplicate",
            enabled: true,
          },
        };

      // Enterprise: Token Economics (4 categories)
      case "io_ratio_optimization":
        return {
          name: "Output Length Control",
          description: "Limit excessive output generation",
          ruleType: "compress",
          priority: 30,
          conditions: {},
          actions: {
            type: "limit_output",
            max_output_ratio: 2.0,
          },
        };

      case "context_window_efficiency":
        return {
          name: "Context Window Optimization",
          description: "Use appropriately-sized context windows",
          ruleType: "model_route",
          priority: 18,
          conditions: {
            input_tokens: { operator: "lt", value: 30000 },
          },
          actions: {
            type: "route_to_model",
            preferSmallContext: true,
          },
        };

      case "prompt_compression":
        return {
          name: "Prompt Compression",
          description: "Compress long prompts to reduce token costs",
          ruleType: "compress",
          priority: 28,
          conditions: {
            input_tokens: { operator: "gt", value: 2000 },
          },
          actions: {
            type: "compress_prompt",
            compressionLevel: "medium",
          },
        };

      case "output_format_optimization":
        return {
          name: "Structured Output Format",
          description: "Use JSON/structured formats to reduce output tokens",
          ruleType: "compress",
          priority: 29,
          conditions: {},
          actions: {
            type: "format_output",
            preferStructured: true,
          },
        };

      // Enterprise: Waste Elimination (4 categories)
      case "retry_storm_detection":
        return {
          name: "Retry Storm Prevention",
          description: "Implement exponential backoff and retry limits",
          ruleType: "rate_limit",
          priority: 2,
          conditions: {},
          actions: {
            type: "limit_retries",
            max_retries: 3,
            backoff_multiplier: 2,
          },
        };

      case "timeout_cost_analysis":
        return {
          name: "Timeout Optimization",
          description: "Cancel requests approaching timeout to save costs",
          ruleType: "rate_limit",
          priority: 3,
          conditions: {},
          actions: {
            type: "timeout_control",
            cancel_on_timeout: true,
          },
        };

      case "rate_limit_optimization":
      case "rate_limit":
        return {
          name: "Rate Limit Management",
          description: "Implement intelligent rate limiting",
          ruleType: "rate_limit",
          priority: 4,
          conditions: {
            time_window: "1h",
          },
          actions: {
            type: "rate_limit",
            max_requests: 1000,
            action_on_exceed: "queue",
          },
        };

      case "abandoned_request_detection":
        return {
          name: "Abandoned Request Handling",
          description: "Detect and cancel abandoned streaming requests",
          ruleType: "rate_limit",
          priority: 6,
          conditions: {
            streaming: true,
          },
          actions: {
            type: "detect_abandoned",
            heartbeat_interval_ms: 5000,
          },
        };

      // Enterprise: Specialized (3 categories)
      case "embedding_optimization":
        return {
          name: "Embedding Model Optimization",
          description: "Use smaller embedding models where appropriate",
          ruleType: "model_route",
          priority: 22,
          conditions: {
            task_category: { operator: "eq", value: "embedding" },
          },
          actions: {
            type: "route_to_model",
            targetModel: "text-embedding-3-small",
            fallbackModel: "text-embedding-3-large",
          },
        };

      case "time_based_optimization":
        return {
          name: "Off-Peak Scheduling",
          description: "Schedule non-urgent work during off-peak hours",
          ruleType: "rate_limit",
          priority: 50,
          conditions: {
            urgent: false,
          },
          actions: {
            type: "schedule",
            prefer_off_peak: true,
          },
        };

      case "business_outcome_attribution":
        // This is for visibility, not routing - return null
        return null;

      // Legacy batching
      case "batching_opportunity":
        return {
          name: "Enable Request Batching",
          description: "Batch similar requests for efficiency",
          ruleType: "batch",
          priority: 5,
          conditions: {
            batch_window_ms: 100,
            max_batch_size: 10,
          },
          actions: {
            type: "batch",
            batch_enabled: true,
          },
        };

      default:
        // For unknown types, don't create a routing rule
        return null;
    }
  }

  async dismissRecommendation(
    id: string,
    organizationId: string,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase
      .from("recommendations")
      .update({
        status: "dismissed",
        dismissed_at: new Date().toISOString(),
        dismissed_by: userId || null,
      })
      .eq("id", id)
      .eq("organization_id", organizationId)
      .eq("status", "pending");
    
    if (error) {
      console.error("Error dismissing recommendation:", error);
      return { success: false, error: "Failed to dismiss recommendation" };
    }
    
    return { success: true };
  }

  private mapRecommendation(data: Record<string, unknown>): Recommendation {
    const impact = (data.impact as Record<string, unknown>) || {};
    const details = (data.details as Record<string, unknown>) || {};
    
    return {
      id: data.id as string,
      type: data.type as string,
      title: data.title as string,
      description: data.description as string,
      impact: {
        estimatedMonthlySavings: impact.estimatedMonthlySavings as number | undefined,
        savingsPercentage: impact.savingsPercentage as number | undefined,
      },
      details,
      status: data.status as "pending" | "applied" | "dismissed" | "expired",
      createdAt: data.created_at as string,
      appliedAt: data.applied_at as string | undefined,
      dismissedAt: data.dismissed_at as string | undefined,
    };
  }
}

export const optimizationService = new OptimizationService();
