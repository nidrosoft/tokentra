import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { getCurrentUserWithOrg } from "@/lib/auth/session";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    // Get organization ID from authenticated user
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }
    const orgId = user.organizationId;
    
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("api_keys")
      .select("id, organization_id, created_by, name, key_prefix, scopes, environment, expires_at, last_used_at, revoked_at, created_at")
      .eq("organization_id", orgId)
      .is("revoked_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API keys:", error);
      // Return empty array if table doesn't exist
      if (error.code === "42P01") {
        return NextResponse.json([]);
      }
      throw error;
    }

    const apiKeys = (data || []).map((row) => ({
      id: row.id,
      orgId: row.organization_id,
      userId: row.created_by,
      name: row.name,
      keyPrefix: row.key_prefix,
      scopes: row.scopes || ["read"],
      environment: row.environment || "production",
      expiresAt: row.expires_at,
      lastUsedAt: row.last_used_at,
      revoked: !!row.revoked_at,
      revokedAt: row.revoked_at,
      createdAt: row.created_at,
    }));

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { name, scopes = ["read"], expiresAt } = body;

    // Get organization ID from authenticated user
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId || !user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }
    const orgId = user.organizationId;
    const userId = user.id;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate API key
    const keyBytes = crypto.randomBytes(32);
    const secretKey = `tk_live_${keyBytes.toString("base64url")}`;
    const keyPrefix = secretKey.substring(0, 16);
    const keyHash = crypto.createHash("sha256").update(secretKey).digest("hex");

    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        organization_id: orgId,
        created_by: userId,
        name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes,
        environment: "production",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating API key:", error);
      throw error;
    }

    return NextResponse.json({
      apiKey: {
        id: data.id,
        name: data.name,
        keyPrefix: data.key_prefix,
        scopes: data.scopes,
        createdAt: data.created_at,
      },
      secretKey, // Only returned once!
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    const message = error instanceof Error ? error.message : "Failed to create API key";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");
    
    // Get organization ID from authenticated user
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }

    if (!keyId) {
      return NextResponse.json({ error: "Key ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("api_keys")
      .update({
        revoked_at: new Date().toISOString(),
      })
      .eq("id", keyId);

    if (error) {
      console.error("Error revoking API key:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking API key:", error);
    const message = error instanceof Error ? error.message : "Failed to revoke API key";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
