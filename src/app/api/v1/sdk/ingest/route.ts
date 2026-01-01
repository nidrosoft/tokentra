/**
 * SDK Ingestion API
 * POST /api/v1/sdk/ingest - Receive telemetry batches from SDK
 * GET /api/v1/sdk/ingest - Health check
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getApiKeyValidationService,
  getAttributionResolver,
  TelemetryEventValidator,
  getSDKEventProcessor,
} from "@/lib/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Pricing tables for cost calculation (per 1M tokens)
const PRICING: Record<string, Record<string, { input: number; output: number; cached?: number }>> = {
  openai: {
    "gpt-4": { input: 30, output: 60 },
    "gpt-4-turbo": { input: 10, output: 30 },
    "gpt-4o": { input: 2.5, output: 10 },
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
    "o1": { input: 15, output: 60 },
    "o1-mini": { input: 3, output: 12 },
    "o1-pro": { input: 150, output: 600 },
    "o3-mini": { input: 1.1, output: 4.4 },
  },
  anthropic: {
    "claude-3-5-sonnet-20241022": { input: 3, output: 15, cached: 0.3 },
    "claude-3-5-haiku-20241022": { input: 0.8, output: 4, cached: 0.08 },
    "claude-3-opus-20240229": { input: 15, output: 75, cached: 1.5 },
    "claude-3-sonnet-20240229": { input: 3, output: 15, cached: 0.3 },
    "claude-3-haiku-20240307": { input: 0.25, output: 1.25, cached: 0.03 },
  },
  google: {
    "gemini-2.0-flash": { input: 0.1, output: 0.4 },
    "gemini-1.5-pro": { input: 1.25, output: 5 },
    "gemini-1.5-flash": { input: 0.075, output: 0.3 },
  },
  azure: {
    "gpt-4": { input: 30, output: 60 },
    "gpt-4o": { input: 2.5, output: 10 },
  },
  aws: {
    "anthropic.claude-3-sonnet": { input: 3, output: 15 },
    "anthropic.claude-3-haiku": { input: 0.25, output: 1.25 },
  },
  xai: {
    "grok-2": { input: 2, output: 10 },
    "grok-2-mini": { input: 0.2, output: 1 },
  },
  deepseek: {
    "deepseek-chat": { input: 0.14, output: 0.28 },
    "deepseek-reasoner": { input: 0.55, output: 2.19 },
  },
  mistral: {
    "mistral-large": { input: 2, output: 6 },
    "mistral-small": { input: 0.2, output: 0.6 },
  },
  cohere: {
    "command-r-plus": { input: 2.5, output: 10 },
    "command-r": { input: 0.15, output: 0.6 },
  },
  groq: {
    "llama-3.3-70b": { input: 0.59, output: 0.79 },
    "mixtral-8x7b": { input: 0.24, output: 0.24 },
  },
};

/**
 * Calculate cost from tokens
 */
function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): { inputCost: number; outputCost: number; cachedCost: number; totalCost: number } {
  const providerPricing = PRICING[provider.toLowerCase()];
  let pricing = providerPricing?.[model];

  // Try partial match if exact match not found
  if (!pricing && providerPricing) {
    const modelKey = Object.keys(providerPricing).find((k) =>
      model.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(model.toLowerCase())
    );
    if (modelKey) pricing = providerPricing[modelKey];
  }

  // Default pricing if not found
  if (!pricing) {
    pricing = { input: 1, output: 3, cached: 0.1 };
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const cachedCost = pricing.cached ? (cachedTokens / 1_000_000) * pricing.cached : 0;

  return {
    inputCost,
    outputCost,
    cachedCost,
    totalCost: inputCost + outputCost + cachedCost,
  };
}

/**
 * POST /api/v1/sdk/ingest
 * Ingest telemetry events from SDK
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // 1. Extract and validate API key
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: { code: "MISSING_AUTH", message: "Authorization header required" } },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);
    const keyValidator = getApiKeyValidationService();
    const validation = await keyValidator.validateKey(apiKey, ["usage:write"]);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error?.statusCode || 401 }
      );
    }

    const { orgId, id: apiKeyId, rateLimits } = validation.apiKey!;

    // 2. Check rate limits
    const rateLimit = keyValidator.checkRateLimit(apiKeyId, rateLimits);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Rate limit exceeded",
            resetAt: rateLimit.resetAt.minute.toISOString(),
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining-Minute": rateLimit.remaining.minute.toString(),
            "X-RateLimit-Remaining-Day": rateLimit.remaining.day.toString(),
            "X-RateLimit-Reset-Minute": rateLimit.resetAt.minute.toISOString(),
            "X-RateLimit-Reset-Day": rateLimit.resetAt.day.toISOString(),
            "Retry-After": "60",
          },
        }
      );
    }

    // 3. Parse request body
    const body = await request.json();

    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "events array required" } },
        { status: 400 }
      );
    }

    if (body.events.length > 100) {
      return NextResponse.json(
        { error: { code: "BATCH_TOO_LARGE", message: "Maximum 100 events per batch" } },
        { status: 400 }
      );
    }

    if (body.events.length === 0) {
      return NextResponse.json(
        { error: { code: "EMPTY_BATCH", message: "At least one event required" } },
        { status: 400 }
      );
    }

    // 4. Validate events
    const { valid, invalid } = TelemetryEventValidator.validateBatch(body.events);

    if (invalid.length > 0 && valid.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "All events failed validation",
            details: invalid.slice(0, 10), // Limit error details
          },
        },
        { status: 400 }
      );
    }

    // 5. Process valid events
    const attributionResolver = getAttributionResolver();
    const processedEvents = await Promise.all(
      valid.map(async (result) => {
        const event = result.event!;

        // Resolve attribution
        const attribution = await attributionResolver.resolve(orgId, {
          feature: event.feature,
          team: event.team,
          project: event.project,
          costCenter: event.cost_center,
          userId: event.user_id,
          environment: event.environment,
          metadata: event.metadata as Record<string, unknown>,
        });

        // Calculate costs if not provided
        let costs = {
          inputCost: event.input_cost || 0,
          outputCost: event.output_cost || 0,
          cachedCost: event.cached_cost || 0,
          totalCost: event.total_cost || 0,
        };

        if (!event.input_cost && !event.output_cost) {
          costs = calculateCost(
            event.provider,
            event.model,
            event.input_tokens,
            event.output_tokens,
            event.cached_tokens || 0
          );
        }

        return {
          org_id: orgId,
          api_key_id: apiKeyId,
          request_id: event.request_id || crypto.randomUUID(),
          timestamp: event.timestamp || new Date().toISOString(),
          provider: event.provider,
          model: event.model,
          method_path: event.method_path,
          input_tokens: event.input_tokens,
          output_tokens: event.output_tokens,
          cached_tokens: event.cached_tokens || 0,
          input_cost: costs.inputCost,
          output_cost: costs.outputCost,
          cached_cost: costs.cachedCost,
          latency_ms: event.latency_ms || 0,
          time_to_first_token_ms: event.time_to_first_token_ms,
          feature: attribution.feature,
          team_id: attribution.team_id,
          project_id: attribution.project_id,
          cost_center_id: attribution.cost_center_id,
          user_ids: attribution.user_id ? [attribution.user_id] : [],
          environment: attribution.environment,
          metadata: attribution.metadata,
          was_cached: event.was_cached || false,
          cache_hit_type: event.cache_hit_type,
          original_model: event.original_model,
          routed_by_rule: event.routed_by_rule,
          is_error: event.is_error || false,
          error_code: event.error_code,
          error_type: event.error_type,
          error_message: event.error_message,
          prompt_hash: event.prompt_hash,
          sdk_version: event.sdk_version || "1.0.0",
          sdk_language: event.sdk_language || "typescript",
          is_streaming: event.is_streaming || false,
          source: "sdk",
        };
      })
    );

    // 6. Insert into database
    const { error: insertError } = await supabase
      .from("sdk_usage_records")
      .insert(processedEvents);

    if (insertError) {
      console.error("[SDK Ingest] Failed to insert events:", insertError);
      return NextResponse.json(
        { error: { code: "INGESTION_ERROR", message: "Failed to store events" } },
        { status: 500 }
      );
    }

    // 7. Process events for alerts and budgets (async, non-blocking)
    const eventProcessor = getSDKEventProcessor();
    eventProcessor.processEvents(processedEvents).catch((err) => {
      console.error("[SDK Ingest] Event processing failed:", err);
    });

    // 8. Return success response
    const processingTime = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        success: true,
        processed: valid.length,
        failed: invalid.length,
        errors: invalid.length > 0 ? invalid.slice(0, 10) : undefined,
      },
      {
        headers: {
          "X-Processing-Time-Ms": processingTime.toString(),
          "X-RateLimit-Remaining-Minute": rateLimit.remaining.minute.toString(),
          "X-RateLimit-Remaining-Day": rateLimit.remaining.day.toString(),
        },
      }
    );
  } catch (error) {
    console.error("[SDK Ingest] Error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/sdk/ingest
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "2.0",
    timestamp: new Date().toISOString(),
  });
}
