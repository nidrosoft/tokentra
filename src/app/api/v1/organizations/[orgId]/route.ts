import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ orgId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { orgId } = await params;
  return NextResponse.json({ success: true, data: { id: orgId } });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { orgId } = await params;
  return NextResponse.json({ success: true, data: { id: orgId } });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { orgId } = await params;
  return NextResponse.json({ success: true }, { status: 204 });
}
