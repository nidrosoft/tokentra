import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { projectId } = await params;
  return NextResponse.json({ success: true, data: { id: projectId } });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { projectId } = await params;
  return NextResponse.json({ success: true, data: { id: projectId } });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { projectId } = await params;
  return NextResponse.json({ success: true }, { status: 204 });
}
