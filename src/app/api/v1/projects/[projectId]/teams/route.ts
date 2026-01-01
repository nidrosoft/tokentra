import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("project_teams")
      .select(`
        id,
        team_id,
        access_level,
        added_at,
        teams:team_id (
          id,
          name
        )
      `)
      .eq("project_id", projectId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const projectTeams = (data || []).map((pt: any) => ({
      id: pt.id,
      teamId: pt.team_id,
      teamName: pt.teams?.name || "Unknown Team",
      accessLevel: pt.access_level || "contributor",
      addedAt: pt.added_at,
    }));

    return NextResponse.json({ success: true, data: projectTeams });
  } catch (error) {
    console.error("Error fetching project teams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { team_id, access_level = "contributor" } = body;

    if (!team_id) {
      return NextResponse.json(
        { success: false, error: "team_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if team is already assigned
    const { data: existing } = await supabase
      .from("project_teams")
      .select("id")
      .eq("project_id", projectId)
      .eq("team_id", team_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Team is already assigned to this project" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("project_teams")
      .insert({
        project_id: projectId,
        team_id,
        access_level,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error adding project team:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add team to project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("team_id");

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "team_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("project_teams")
      .delete()
      .eq("project_id", projectId)
      .eq("team_id", teamId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing project team:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove team from project" },
      { status: 500 }
    );
  }
}
