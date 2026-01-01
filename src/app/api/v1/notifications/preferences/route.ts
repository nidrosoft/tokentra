import { NextRequest, NextResponse } from "next/server";
import { notificationPreferencesService } from "@/lib/notifications/notification-preferences-service";

const DEMO_ORG_ID = "b1c2d3e4-f5a6-7890-bcde-f12345678901";
const DEMO_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const orgId = searchParams.get("organizationId") || DEMO_ORG_ID;
    const userId = searchParams.get("userId") || DEMO_USER_ID;

    const preferences = await notificationPreferencesService.getPreferences(userId, orgId);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
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

    const preferences = await notificationPreferencesService.updatePreferences(
      userId,
      orgId,
      body
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
