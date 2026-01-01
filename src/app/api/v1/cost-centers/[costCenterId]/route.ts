import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createCostCentersService, UpdateCostCenterInput } from "@/lib/organization";

interface RouteParams {
  params: Promise<{ costCenterId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { costCenterId } = await params;
    const supabase = await createServiceClient();
    const costCentersService = createCostCentersService(supabase);
    const costCenter = await costCentersService.getCostCenter(costCenterId);

    if (!costCenter) {
      return NextResponse.json(
        { success: false, error: "Cost center not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: costCenter });
  } catch (error) {
    console.error("Error fetching cost center:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { costCenterId } = await params;
    const body = await request.json();
    const input = body as UpdateCostCenterInput;

    const supabase = await createServiceClient();
    const costCentersService = createCostCentersService(supabase);
    const costCenter = await costCentersService.updateCostCenter(costCenterId, input);

    return NextResponse.json({ success: true, data: costCenter });
  } catch (error) {
    console.error("Error updating cost center:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { costCenterId } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get("hard") === "true";

    const supabase = await createServiceClient();
    const costCentersService = createCostCentersService(supabase);
    await costCentersService.deleteCostCenter(costCenterId, hard);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cost center:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
