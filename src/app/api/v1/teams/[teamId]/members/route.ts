import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createTeamsService, TeamRole } from "@/lib/organization";

interface RouteParams {
  params: Promise<{ teamId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const supabase = await createServiceClient();
    const teamsService = createTeamsService(supabase);
    const members = await teamsService.getMembers(teamId);

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const { user_id, role = "member", invited_by } = body as {
      user_id: string;
      role?: TeamRole;
      invited_by?: string;
    };

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const teamsService = createTeamsService(supabase);
    const member = await teamsService.addMember(teamId, user_id, role, invited_by);

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    console.error("Error adding team member:", error);
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
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const teamsService = createTeamsService(supabase);
    await teamsService.removeMember(teamId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
