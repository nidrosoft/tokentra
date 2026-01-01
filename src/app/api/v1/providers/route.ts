import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSyncEngine,
  mapConnectionFromDb,
  createHealthMonitor,
  type ProviderType,
  type ProviderCredentials,
} from "@/lib/provider-sync";

/**
 * GET /api/v1/providers
 * List all provider connections for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get organization ID from query or session
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organization_id");

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    // Fetch connections
    const { data: connections, error } = await supabase
      .from("provider_connections")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API] Error fetching providers:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Map to response format (exclude encrypted credentials)
    const providers = (connections || []).map((conn) => {
      const mapped = mapConnectionFromDb(conn);
      return {
        id: mapped.id,
        organizationId: mapped.organizationId,
        provider: mapped.provider,
        status: mapped.status,
        displayName: mapped.displayName,
        settings: mapped.settings,
        lastSyncAt: mapped.lastSyncAt,
        lastSyncRecords: mapped.lastSyncRecords,
        lastSyncDurationMs: mapped.lastSyncDurationMs,
        lastError: mapped.lastError,
        lastErrorAt: mapped.lastErrorAt,
        consecutiveFailures: mapped.consecutiveFailures,
        providerMetadata: mapped.providerMetadata,
        createdAt: mapped.createdAt,
        updatedAt: mapped.updatedAt,
      };
    });

    // Get sync summary
    const healthMonitor = createHealthMonitor(supabase);
    const summary = await healthMonitor.getSyncSummary(orgId);

    return NextResponse.json({
      success: true,
      data: providers,
      summary,
    });
  } catch (error) {
    console.error("[API] Providers GET error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/providers
 * Create a new provider connection
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    const { organization_id, provider, credentials, display_name, settings } = body;

    if (!organization_id) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    const validProviders = ["openai", "anthropic", "google", "azure", "aws", "xai", "deepseek", "mistral", "cohere", "groq"];
    if (!provider || !validProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, error: `Valid provider is required (${validProviders.join(", ")})` },
        { status: 400 }
      );
    }

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: "credentials are required" },
        { status: 400 }
      );
    }

    // Create sync engine
    const syncEngine = createSyncEngine(supabase);

    // Create connection (this will test credentials first)
    const connection = await syncEngine.createConnection({
      organizationId: organization_id,
      provider: provider as ProviderType,
      credentials: credentials as ProviderCredentials,
      displayName: display_name,
      settings,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: connection.id,
          organizationId: connection.organizationId,
          provider: connection.provider,
          status: connection.status,
          displayName: connection.displayName,
          settings: connection.settings,
          createdAt: connection.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Providers POST error:", error);
    
    const message = (error as Error).message;
    const status = message.includes("Connection test failed") ? 400 : 500;
    
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
