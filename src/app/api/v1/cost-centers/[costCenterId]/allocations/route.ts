import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ costCenterId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { costCenterId } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("cost_center_allocations")
      .select("*")
      .eq("cost_center_id", costCenterId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Fetch entity names for each allocation
    const allocations = await Promise.all(
      (data || []).map(async (allocation: any) => {
        let entityName = "Unknown";

        if (allocation.entity_type === "team") {
          const { data: team } = await supabase
            .from("teams")
            .select("name")
            .eq("id", allocation.entity_id)
            .single();
          entityName = team?.name || "Unknown Team";
        } else if (allocation.entity_type === "project") {
          const { data: project } = await supabase
            .from("projects")
            .select("name")
            .eq("id", allocation.entity_id)
            .single();
          entityName = project?.name || "Unknown Project";
        }

        return {
          id: allocation.id,
          costCenterId: allocation.cost_center_id,
          entityType: allocation.entity_type,
          entityId: allocation.entity_id,
          entityName,
          allocationPercentage: parseFloat(allocation.allocation_percentage) || 100,
          effectiveFrom: allocation.effective_from,
          effectiveUntil: allocation.effective_until,
        };
      })
    );

    return NextResponse.json({ success: true, data: allocations });
  } catch (error) {
    console.error("Error fetching allocations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch allocations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { costCenterId } = await params;
    const body = await request.json();
    const { entity_type, entity_id, allocation_percentage = 100, effective_from } = body;

    if (!entity_type || !entity_id) {
      return NextResponse.json(
        { success: false, error: "entity_type and entity_id are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if allocation already exists
    const { data: existing } = await supabase
      .from("cost_center_allocations")
      .select("id")
      .eq("cost_center_id", costCenterId)
      .eq("entity_id", entity_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Allocation already exists for this entity" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("cost_center_allocations")
      .insert({
        cost_center_id: costCenterId,
        entity_type,
        entity_id,
        allocation_percentage,
        effective_from: effective_from || new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Error adding allocation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add allocation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { costCenterId } = await params;
    const { searchParams } = new URL(request.url);
    const allocationId = searchParams.get("allocation_id");

    if (!allocationId) {
      return NextResponse.json(
        { success: false, error: "allocation_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("cost_center_allocations")
      .delete()
      .eq("id", allocationId)
      .eq("cost_center_id", costCenterId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing allocation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove allocation" },
      { status: 500 }
    );
  }
}
