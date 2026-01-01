import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createSyncEngine,
  type ProviderType,
  type ProviderCredentials,
} from "@/lib/provider-sync";

/**
 * POST /api/v1/providers/test
 * Test provider credentials without creating a connection
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { provider, credentials } = body;

    const validProviders = ["openai", "anthropic", "google", "azure", "aws", "xai", "deepseek", "mistral", "cohere", "groq"];
    if (!provider || !validProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, error: `Valid provider is required (${validProviders.join(", ")})` },
        { status: 400 }
      );
    }

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: "credentials are required" },
        { status: 400 }
      );
    }

    const syncEngine = createSyncEngine(supabase);
    const result = await syncEngine.testConnection(
      provider as ProviderType,
      credentials as ProviderCredentials
    );

    return NextResponse.json({
      success: result.success,
      data: {
        success: result.success,
        latencyMs: result.latencyMs,
        error: result.error,
        errorCode: result.errorCode,
        permissions: result.permissions,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    console.error("[API] Provider test error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
