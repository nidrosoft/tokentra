import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { alertId } = await params;
  return NextResponse.json({ success: true, data: { id: alertId, enabled: true } });
}
