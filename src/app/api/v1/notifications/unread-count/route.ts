import { NextRequest, NextResponse } from "next/server";
import { inAppNotificationService } from "@/lib/notifications/in-app-notification-service";
import { getCurrentUserWithOrg } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    // Get organization ID from authenticated user
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId || !user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }
    const orgId = user.organizationId;
    const userId = user.id;

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
