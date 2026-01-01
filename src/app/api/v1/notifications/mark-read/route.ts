import { NextRequest, NextResponse } from "next/server";
import { inAppNotificationService } from "@/lib/notifications/in-app-notification-service";

const DEMO_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get("userId") || body.userId || DEMO_USER_ID;
    const { notificationIds, markAll } = body;

    let count = 0;

    if (markAll) {
      count = await inAppNotificationService.markAllAsRead(userId);
    } else if (notificationIds && notificationIds.length > 0) {
      count = await inAppNotificationService.markAsRead(userId, notificationIds);
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
