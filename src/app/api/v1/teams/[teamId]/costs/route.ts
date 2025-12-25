import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ teamId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  return NextResponse.json({ success: true, data: [] });
}
