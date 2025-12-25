import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const trackingEventSchema = z.object({
  provider: z.string(),
  model: z.string(),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  cachedTokens: z.number().int().min(0).optional(),
  latencyMs: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  teamId: z.string().optional(),
  projectId: z.string().optional(),
  featureTag: z.string().optional(),
  userId: z.string().optional(),
  requestId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

const requestSchema = z.object({
  event: trackingEventSchema,
});

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid API key" } },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid API key format" } },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const { event } = parsed.data;

    // Generate event ID
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // In production, this would store the event in a database
    // For now, we just log it and return success
    console.log("[SDK Track]", { eventId, ...event });

    return NextResponse.json({
      success: true,
      data: { success: true, eventId },
    });
  } catch (error) {
    console.error("[SDK Track Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
