import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEMO_ORG_ID = "b1c2d3e4-f5a6-7890-bcde-f12345678901";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || DEMO_ORG_ID;

    const { data, error } = await supabase
      .from("integration_settings")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching integrations:", error);
      // Return empty array if table doesn't exist
      if (error.code === "42P01") {
        return NextResponse.json([]);
      }
      throw error;
    }

    const integrations = (data || []).map((row) => ({
      id: row.id,
      orgId: row.org_id,
      integrationType: row.integration_type,
      name: row.name,
      config: row.config || {},
      enabled: row.enabled,
      status: row.status,
      lastUsedAt: row.last_used_at,
      errorMessage: row.error_message,
      connectedBy: row.connected_by,
      connectedAt: row.connected_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json(integrations);
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { integrationType, name, config = {} } = body;

    const orgId = body.organizationId || DEMO_ORG_ID;
    const userId = body.userId;

    if (!integrationType || !name) {
      return NextResponse.json({ error: "Integration type and name are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("integration_settings")
      .insert({
        org_id: orgId,
        integration_type: integrationType,
        name,
        config,
        enabled: true,
        status: "active",
        connected_by: userId,
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating integration:", error);
      throw error;
    }

    return NextResponse.json({
      id: data.id,
      integrationType: data.integration_type,
      name: data.name,
      status: data.status,
      connectedAt: data.connected_at,
    });
  } catch (error) {
    console.error("Error creating integration:", error);
    const message = error instanceof Error ? error.message : "Failed to create integration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("id");

    if (!integrationId) {
      return NextResponse.json({ error: "Integration ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("integration_settings")
      .delete()
      .eq("id", integrationId);

    if (error) {
      console.error("Error deleting integration:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting integration:", error);
    const message = error instanceof Error ? error.message : "Failed to delete integration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
