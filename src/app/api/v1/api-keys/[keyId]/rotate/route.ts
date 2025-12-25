import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ keyId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { keyId } = await params;
  return NextResponse.json({ success: true, data: { id: keyId, rotated: true } });
}
