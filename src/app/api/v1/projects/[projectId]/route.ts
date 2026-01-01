import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createProjectsService, UpdateProjectInput } from "@/lib/organization";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createServiceClient();
    const projectsService = createProjectsService(supabase);
    const project = await projectsService.getProject(projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const input = body as UpdateProjectInput;

    const supabase = await createServiceClient();
    const projectsService = createProjectsService(supabase);
    const project = await projectsService.updateProject(projectId, input);

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get("hard") === "true";

    const supabase = await createServiceClient();
    const projectsService = createProjectsService(supabase);
    await projectsService.deleteProject(projectId, hard);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
