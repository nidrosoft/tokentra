import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ costCenterId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { costCenterId } = await params;
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { costCenterId } = await params;
  return NextResponse.json({ success: true, data: {} }, { status: 201 });
}
