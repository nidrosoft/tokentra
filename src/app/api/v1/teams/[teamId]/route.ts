import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ teamId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  return NextResponse.json({ success: true, data: { id: teamId } });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  return NextResponse.json({ success: true, data: { id: teamId } });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  return NextResponse.json({ success: true }, { status: 204 });
}
