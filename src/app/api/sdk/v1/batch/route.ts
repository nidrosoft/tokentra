import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { z } from "zod";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const trackingEventSchema = z.object({
  provider: z.string(),
  model: z.string(),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  cachedTokens: z.number().int().min(0).optional(),
  latencyMs: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  endpoint: z.string().optional(),
  status: z.enum(["success", "error", "timeout"]).optional(),
  errorCode: z.string().optional(),
  teamId: z.string().optional(),
  projectId: z.string().optional(),
  costCenterId: z.string().optional(),
  featureTag: z.string().optional(),
  userId: z.string().optional(),
  requestId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

const requestSchema = z.object({
  events: z.array(trackingEventSchema).min(1).max(1000),
});

async function validateApiKey(apiKey: string): Promise<{ organizationId: string; apiKeyId: string } | null> {
  const supabase = getSupabaseAdmin();
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, organization_id, expires_at, revoked_at")
    .eq("key_hash", keyHash)
    .single();

  if (error || !data) return null;
  if (data.revoked_at) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { organizationId: data.organization_id, apiKeyId: data.id };
}

async function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data: pricing } = await supabase
    .from("model_pricing")
    .select("input_price_per_1m, output_price_per_1m, cached_price_per_1m")
    .eq("provider", provider.toLowerCase())
    .eq("model", model)
    .eq("is_active", true)
    .single();

  if (!pricing) {
    return (inputTokens * 0.001 + outputTokens * 0.002) / 1000;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input_price_per_1m;
  const outputCost = (outputTokens / 1_000_000) * pricing.output_price_per_1m;
  const cachedCost = pricing.cached_price_per_1m
    ? (cachedTokens / 1_000_000) * pricing.cached_price_per_1m
    : 0;

  return inputCost + outputCost + cachedCost;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid API key" } },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid API key format" } },
        { status: 401 }
      );
    }

    const keyInfo = await validateApiKey(apiKey);
    if (!keyInfo) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired API key" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const { events } = parsed.data;
    const supabase = getSupabaseAdmin();

    // Prepare records with costs
    const records = await Promise.all(
      events.map(async (event) => {
        const cost = event.cost ?? await calculateCost(
          event.provider,
          event.model,
          event.inputTokens,
          event.outputTokens,
          event.cachedTokens ?? 0
        );

        return {
          organization_id: keyInfo.organizationId,
          api_key_id: keyInfo.apiKeyId,
          provider: event.provider.toLowerCase(),
          model: event.model,
          endpoint: event.endpoint,
          input_tokens: event.inputTokens,
          output_tokens: event.outputTokens,
          cached_tokens: event.cachedTokens ?? 0,
          cost,
          latency_ms: event.latencyMs,
          status: event.status ?? "success",
          error_code: event.errorCode,
          team_id: event.teamId,
          project_id: event.projectId,
          cost_center_id: event.costCenterId,
          feature_tag: event.featureTag,
          user_id: event.userId,
          request_id: event.requestId,
          metadata: event.metadata as Record<string, unknown>,
          timestamp: event.timestamp ?? new Date().toISOString(),
        };
      })
    );

    // Batch insert
    const { error } = await supabase.from("usage_records").insert(records);

    if (error) {
      console.error("[SDK Batch Error] Failed to insert records:", error);
      return NextResponse.json(
        {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Failed to store usage events" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        success: true,
        processed: events.length,
        failed: 0,
      },
    });
  } catch (error) {
    console.error("[SDK Batch Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
