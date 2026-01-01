/**
 * SDK Optimization Config API
 * GET /api/v1/sdk/optimization/config - Return optimization config for SDK
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getApiKeyValidationService } from "@/lib/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/sdk/optimization/config
 * Get optimization configuration including routing rules and model mappings
 */
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: { code: "MISSING_AUTH", message: "Authorization header required" } },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);
    const keyValidator = getApiKeyValidationService();
    const validation = await keyValidator.validateKey(apiKey);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error?.statusCode || 401 }
      );
    }

    const { orgId } = validation.apiKey!;

    // Fetch organization settings
    const { data: orgSettings } = await supabase
      .from("organization_settings")
      .select("*")
      .eq("org_id", orgId)
      .single();

    // Fetch enabled routing rules
    const { data: routingRules } = await supabase
      .from("routing_rules")
      .select("*")
      .eq("org_id", orgId)
      .eq("enabled", true)
      .order("priority", { ascending: true });

    // Fetch model mappings (from recommendations that were applied)
    const { data: appliedRecommendations } = await supabase
      .from("recommendations")
      .select("*")
      .eq("org_id", orgId)
      .eq("status", "applied")
      .in("category", ["task_aware_routing", "quality_cost_pareto", "provider_arbitrage"]);

    // Build model mappings from applied recommendations
    const modelMappings = (appliedRecommendations || [])
      .filter((r) => r.suggested_routing_rule)
      .map((r) => {
        const rule = r.suggested_routing_rule;
        return {
          sourceModel: rule.conditions?.find((c: { field: string }) => c.field === "model")?.value || "",
          targetModel: rule.actions?.targetModel || "",
          targetProvider: rule.actions?.targetProvider || "",
          taskTypes: rule.conditions
            ?.filter((c: { field: string }) => c.field === "task_type")
            .map((c: { value: string }) => c.value) || [],
          maxComplexity: rule.conditions?.find((c: { field: string }) => c.field === "complexity_score")?.value,
          savingsPercent: r.savings_percent || 0,
        };
      })
      .filter((m) => m.sourceModel && m.targetModel);

    // Format routing rules for SDK
    const formattedRules = (routingRules || []).map((rule) => ({
      id: rule.id,
      name: rule.name,
      priority: rule.priority,
      conditions: rule.conditions || [],
      targetModel: rule.actions?.targetModel || "",
      targetProvider: rule.actions?.targetProvider || "",
      fallbackModel: rule.actions?.fallbackModel,
    }));

    // Check if optimization is enabled
    const optimizationEnabled = orgSettings?.optimization_enabled !== false;
    const routingEnabled = orgSettings?.routing_enabled !== false && formattedRules.length > 0;
    const cachingEnabled = orgSettings?.caching_enabled !== false;

    const config = {
      enabled: optimizationEnabled,
      enableRouting: routingEnabled,
      enableCaching: cachingEnabled,
      routingRules: formattedRules,
      modelMappings,
      cacheSimilarityThreshold: orgSettings?.cache_similarity_threshold || 0.92,
    };

    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("[SDK Optimization Config] Error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
