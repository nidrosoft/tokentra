import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSyncEngine } from "@/lib/provider-sync";

/**
 * POST /api/v1/providers/sync-all
 * Trigger sync for all provider connections in an organization
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { organization_id } = body;

    if (!organization_id) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    const syncEngine = createSyncEngine(supabase);
    const results = await syncEngine.syncOrganization(organization_id);

    const successful = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return NextResponse.json({
      success: true,
      data: {
        total: results.length,
        successful,
        failed,
        results: results.map((r) => ({
          syncId: r.syncId,
          connectionId: r.connectionId,
          status: r.status,
          recordsCreated: r.recordsCreated,
          recordsUpdated: r.recordsUpdated,
          durationMs: r.durationMs,
          error: r.error,
        })),
      },
    });
  } catch (error) {
    console.error("[API] Sync all providers error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
