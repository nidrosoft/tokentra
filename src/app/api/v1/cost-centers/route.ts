import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createCostCentersService, CreateCostCenterInput } from "@/lib/organization";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organization_id");
    const includeHierarchy = searchParams.get("hierarchy") === "true";

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const costCentersService = createCostCentersService(supabase);

    if (includeHierarchy) {
      const hierarchy = await costCentersService.getCostCenterHierarchy(orgId);
      return NextResponse.json({ success: true, data: hierarchy });
    }

    const costCenters = await costCentersService.getCostCenters(orgId);
    return NextResponse.json({ success: true, data: costCenters });
  } catch (error) {
    console.error("Error fetching cost centers:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization_id, ...input } = body as { organization_id: string } & CreateCostCenterInput;

    if (!organization_id) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    if (!input.code || !input.name) {
      return NextResponse.json(
        { success: false, error: "code and name are required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const costCentersService = createCostCentersService(supabase);
    const costCenter = await costCentersService.createCostCenter(organization_id, input);

    return NextResponse.json({ success: true, data: costCenter }, { status: 201 });
  } catch (error) {
    console.error("Error creating cost center:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
