import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSyncEngine } from "@/lib/provider-sync";

interface RouteParams {
  params: Promise<{ providerId: string }>;
}

/**
 * POST /api/v1/providers/[providerId]/sync
 * Trigger a manual sync for a provider connection
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { providerId } = await params;
    const supabase = await createClient();
    const body = await request.json().catch(() => ({}));

    const { backfill, start_date, end_date } = body;

    const syncEngine = createSyncEngine(supabase);

    // Trigger sync (async operation)
    const result = await syncEngine.triggerSync(providerId, {
      backfill: backfill === true,
      startDate: start_date ? new Date(start_date) : undefined,
      endDate: end_date ? new Date(end_date) : undefined,
      syncType: backfill ? "backfill" : "manual",
    });

    return NextResponse.json({
      success: true,
      data: {
        syncId: result.syncId,
        connectionId: result.connectionId,
        status: result.status,
        recordsFetched: result.recordsFetched,
        recordsCreated: result.recordsCreated,
        recordsUpdated: result.recordsUpdated,
        totalCostSynced: result.totalCostSynced,
        totalTokensSynced: result.totalTokensSynced,
        durationMs: result.durationMs,
        syncWindow: result.syncWindow,
      },
    });
  } catch (error) {
    console.error("[API] Provider sync error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/providers/[providerId]/sync
 * Get sync history for a provider connection
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { providerId } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const { data: syncHistory, error } = await supabase
      .from("sync_history")
      .select("*")
      .eq("connection_id", providerId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: syncHistory || [],
    });
  } catch (error) {
    console.error("[API] Provider sync history error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
