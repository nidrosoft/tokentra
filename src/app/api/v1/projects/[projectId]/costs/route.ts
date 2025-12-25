import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { projectId } = await params;
  return NextResponse.json({ success: true, data: [] });
}
