import { NextResponse } from "next/server";

const SDK_VERSION = "0.1.0";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    version: SDK_VERSION,
    timestamp: new Date().toISOString(),
  });
}
