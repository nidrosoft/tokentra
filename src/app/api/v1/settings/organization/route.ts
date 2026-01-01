import { NextRequest, NextResponse } from "next/server";
import { organizationSettingsService } from "@/lib/settings/organization-settings-service";

const DEMO_ORG_ID = "b1c2d3e4-f5a6-7890-bcde-f12345678901";
const DEMO_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId") || DEMO_ORG_ID;

    const settings = await organizationSettingsService.getSettings(orgId);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching organization settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get("organizationId") || body.orgId || DEMO_ORG_ID;
    const userId = searchParams.get("userId") || body.userId || DEMO_USER_ID;

    // Remove non-update fields from body
    const { orgId: _, userId: __, ...updates } = body;

    const settings = await organizationSettingsService.updateSettings(
      orgId,
      updates,
      userId
    );

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating organization settings:", error);
    const message = error instanceof Error ? error.message : "Failed to update organization settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
