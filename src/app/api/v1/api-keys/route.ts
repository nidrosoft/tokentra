import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

import { requireAuthWithOrg } from "@/lib/auth/session";
import type { Database } from "@/lib/supabase/types";

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Generate a secure API key
 * Format: tt_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx (32 random chars)
 */
function generateApiKey(environment: string = "production"): { key: string; prefix: string; hash: string } {
  const prefix = environment === "production" ? "tt_live_" : "tt_test_";
  const randomPart = crypto.randomBytes(24).toString("base64url");
  const key = `${prefix}${randomPart}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  
  return {
    key,
    prefix: key.substring(0, 12), // Show first 12 chars to user
    hash,
  };
}

/**
 * GET /api/v1/api-keys
 * List all API keys for the current organization
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthWithOrg();
    const organizationId = user.organizationId as string;
    const supabase = getSupabaseAdmin();

    const { data: apiKeys, error } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, environment, scopes, last_used_at, expires_at, revoked_at, created_at")
      .eq("organization_id", organizationId)
      .is("revoked_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API keys:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch API keys" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: apiKeys.map((key) => ({
        id: key.id,
        name: key.name,
        keyPreview: key.key_prefix + "...",
        environment: key.environment,
        scopes: key.scopes,
        lastUsedAt: key.last_used_at,
        expiresAt: key.expires_at,
        createdAt: key.created_at,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/v1/api-keys:", error);
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * POST /api/v1/api-keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthWithOrg();
    const organizationId = user.organizationId as string;
    const userId = user.id as string;
    const body = await request.json();
    
    const { name, environment = "production", scopes = ["track"], expiresAt } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { key, prefix, hash } = generateApiKey(environment);

    const { data: apiKey, error } = await supabase
      .from("api_keys")
      .insert({
        organization_id: organizationId,
        name,
        key_prefix: prefix,
        key_hash: hash,
        environment,
        scopes,
        expires_at: expiresAt || null,
        created_by: userId,
      })
      .select("id, name, key_prefix, environment, scopes, created_at")
      .single();

    if (error) {
      console.error("Error creating API key:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create API key" },
        { status: 500 }
      );
    }

    // Return the full key only once - it cannot be retrieved again
    return NextResponse.json(
      {
        success: true,
        data: {
          id: apiKey.id,
          name: apiKey.name,
          key: key, // Full key - only shown once!
          keyPreview: prefix + "...",
          environment: apiKey.environment,
          scopes: apiKey.scopes,
          createdAt: apiKey.created_at,
        },
        message: "API key created. Save this key securely - it won't be shown again.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/v1/api-keys:", error);
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
