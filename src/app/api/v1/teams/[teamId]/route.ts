import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createTeamsService, UpdateTeamInput } from "@/lib/organization";

interface RouteParams {
  params: Promise<{ teamId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const supabase = await createServiceClient();
    const teamsService = createTeamsService(supabase);
    const team = await teamsService.getTeam(teamId);

    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const input = body as UpdateTeamInput;

    const supabase = await createServiceClient();
    const teamsService = createTeamsService(supabase);
    const team = await teamsService.updateTeam(teamId, input);

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get("hard") === "true";

    const supabase = await createServiceClient();
    const teamsService = createTeamsService(supabase);
    await teamsService.deleteTeam(teamId, hard);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
