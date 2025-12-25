import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ budgetId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { budgetId } = await params;
  return NextResponse.json({ success: true, data: { id: budgetId } });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { budgetId } = await params;
  return NextResponse.json({ success: true, data: { id: budgetId } });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { budgetId } = await params;
  return NextResponse.json({ success: true }, { status: 204 });
}
