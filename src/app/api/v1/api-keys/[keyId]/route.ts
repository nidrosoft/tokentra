import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ keyId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { keyId } = await params;
  return NextResponse.json({ success: true, data: { id: keyId } });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { keyId } = await params;
  return NextResponse.json({ success: true }, { status: 204 });
}
