/**
 * SDK Configuration API
 * GET /api/v1/sdk/config - Return SDK configuration for organization
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getApiKeyValidationService } from "@/lib/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v1/sdk/config
 * Get SDK configuration for organization
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Validate API key
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

    const { orgId, rateLimits } = validation.apiKey!;

    // 2. Fetch organization settings
    const { data: orgSettings } = await supabase
      .from("organization_settings")
      .select("*")
      .eq("org_id", orgId)
      .single();

    // 3. Fetch feature flags
    const { data: featureFlags } = await supabase
      .from("feature_flags")
      .select("name, enabled, config")
      .eq("org_id", orgId)
      .eq("enabled", true);

    // 4. Build configuration response
    const config = {
      // Feature flags
      features: {
        smartRouting: featureFlags?.some((f) => f.name === "smart_routing") ?? false,
        semanticCaching: featureFlags?.some((f) => f.name === "semantic_caching") ?? false,
        contentLogging: featureFlags?.some((f) => f.name === "content_logging") ?? false,
        budgetEnforcement: featureFlags?.some((f) => f.name === "budget_enforcement") ?? false,
      },

      // Privacy settings
      privacy: {
        mode: orgSettings?.privacy_mode ?? "metrics_only",
        dataResidency: orgSettings?.data_residency ?? "us",
      },

      // Smart routing config (if enabled)
      routing: {
        enabled: featureFlags?.some((f) => f.name === "smart_routing") ?? false,
        threshold: 0.3,
        routes: {
          "gpt-4": "gpt-4o-mini",
          "gpt-4-turbo": "gpt-4o-mini",
          "gpt-4o": "gpt-4o-mini",
          "claude-3-opus-20240229": "claude-3-haiku-20240307",
          "claude-3-5-sonnet-20241022": "claude-3-5-haiku-20241022",
        },
      },

      // Caching config (if enabled)
      caching: {
        enabled: featureFlags?.some((f) => f.name === "semantic_caching") ?? false,
        ttlSeconds: orgSettings?.cache_ttl ?? 3600,
        similarityThreshold: orgSettings?.cache_similarity ?? 0.95,
      },

      // Rate limits for this key
      rateLimits: {
        perMinute: rateLimits.perMinute,
        perDay: rateLimits.perDay,
      },

      // Telemetry settings
      telemetry: {
        batchSize: orgSettings?.sdk_batch_size ?? 10,
        flushInterval: orgSettings?.sdk_flush_interval ?? 5000,
        endpoint: `${process.env.NEXT_PUBLIC_APP_URL || "https://api.tokentra.com"}/api/v1/sdk/ingest`,
      },

      // SDK version info
      sdk: {
        minVersion: "1.0.0",
        latestVersion: "2.0.0",
        deprecatedVersions: [],
      },
    };

    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("[SDK Config] Error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
