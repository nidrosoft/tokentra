import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSyncEngine,
  mapConnectionFromDb,
  createHealthMonitor,
  type ProviderCredentials,
} from "@/lib/provider-sync";

interface RouteParams {
  params: Promise<{ providerId: string }>;
}

/**
 * GET /api/v1/providers/[providerId]
 * Get a single provider connection with health info
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { providerId } = await params;
    const supabase = await createClient();

    // Fetch connection
    const { data: connection, error } = await supabase
      .from("provider_connections")
      .select("*")
      .eq("id", providerId)
      .single();

    if (error || !connection) {
      return NextResponse.json(
        { success: false, error: "Provider connection not found" },
        { status: 404 }
      );
    }

    const mapped = mapConnectionFromDb(connection);

    // Get health info
    const healthMonitor = createHealthMonitor(supabase);
    const health = await healthMonitor.getConnectionHealth(providerId);

    // Get recent sync history
    const { data: syncHistory } = await supabase
      .from("sync_history")
      .select("*")
      .eq("connection_id", providerId)
      .order("started_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
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
        health,
        syncHistory: syncHistory || [],
      },
    });
  } catch (error) {
    console.error("[API] Provider GET error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/providers/[providerId]
 * Update provider connection settings or credentials
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { providerId } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { display_name, settings, credentials } = body;

    const syncEngine = createSyncEngine(supabase);

    // If credentials are being updated, use the engine method
    if (credentials) {
      await syncEngine.updateCredentials(providerId, credentials as ProviderCredentials);
    }

    // Update other fields
    if (display_name !== undefined || settings !== undefined) {
      await syncEngine.updateConnection(providerId, {
        displayName: display_name,
        settings,
      });
    }

    // Fetch updated connection
    const connection = await syncEngine.getConnection(providerId);

    if (!connection) {
      return NextResponse.json(
        { success: false, error: "Provider connection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: connection.id,
        organizationId: connection.organizationId,
        provider: connection.provider,
        status: connection.status,
        displayName: connection.displayName,
        settings: connection.settings,
        lastSyncAt: connection.lastSyncAt,
        updatedAt: connection.updatedAt,
      },
    });
  } catch (error) {
    console.error("[API] Provider PATCH error:", error);
    
    const message = (error as Error).message;
    const status = message.includes("test failed") ? 400 : 500;
    
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

/**
 * DELETE /api/v1/providers/[providerId]
 * Delete a provider connection
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { providerId } = await params;
    const supabase = await createClient();

    const syncEngine = createSyncEngine(supabase);
    await syncEngine.deleteConnection(providerId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[API] Provider DELETE error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
