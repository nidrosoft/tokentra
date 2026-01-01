import { NextRequest, NextResponse } from "next/server";
import { inAppNotificationService } from "@/lib/notifications/in-app-notification-service";

const DEMO_ORG_ID = "b1c2d3e4-f5a6-7890-bcde-f12345678901";
const DEMO_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const orgId = searchParams.get("organizationId") || DEMO_ORG_ID;
    const userId = searchParams.get("userId") || DEMO_USER_ID;

    const unreadCount = await inAppNotificationService.getUnreadCount(userId, orgId);

    return NextResponse.json(unreadCount);
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
