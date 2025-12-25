import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ costCenterId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { costCenterId } = await params;
  return NextResponse.json({ success: true, data: { id: costCenterId } });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { costCenterId } = await params;
  return NextResponse.json({ success: true, data: { id: costCenterId } });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { costCenterId } = await params;
  return NextResponse.json({ success: true }, { status: 204 });
}
