import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createTeamsService, CreateTeamInput } from "@/lib/organization";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organization_id");

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const teamsService = createTeamsService(supabase);
    const teams = await teamsService.getTeams(orgId);

    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization_id, ...input } = body as { organization_id: string } & CreateTeamInput;

    if (!organization_id) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    if (!input.name) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const teamsService = createTeamsService(supabase);
    const team = await teamsService.createTeam(organization_id, input);

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
