import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { alertId } = await params;
  return NextResponse.json({ success: true, data: { id: alertId } });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { alertId } = await params;
  return NextResponse.json({ success: true, data: { id: alertId } });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { alertId } = await params;
  return NextResponse.json({ success: true }, { status: 204 });
}
