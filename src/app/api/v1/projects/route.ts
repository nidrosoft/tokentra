import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createProjectsService, CreateProjectInput } from "@/lib/organization";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organization_id");
    const teamId = searchParams.get("team_id") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "organization_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const projectsService = createProjectsService(supabase);
    const projects = await projectsService.getProjects(orgId, { teamId, status, category });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization_id, ...input } = body as { organization_id: string } & CreateProjectInput;

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
    const projectsService = createProjectsService(supabase);
    const project = await projectsService.createProject(organization_id, input);

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
