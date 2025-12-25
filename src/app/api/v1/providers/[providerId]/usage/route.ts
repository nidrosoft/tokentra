import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ providerId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { providerId } = await params;
  return NextResponse.json({ success: true, data: [] });
}
