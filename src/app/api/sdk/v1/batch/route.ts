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
  events: z.array(trackingEventSchema).min(1).max(1000),
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

    const { events } = parsed.data;

    // Process events
    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        // In production, this would store the event in a database
        // For now, we just log it
        const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log("[SDK Batch]", { eventId, ...event });
        processed++;
      } catch (error) {
        failed++;
        errors.push(error instanceof Error ? error.message : "Unknown error");
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        success: failed === 0,
        processed,
        failed,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("[SDK Batch Error]", error);
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
