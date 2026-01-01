import { NextRequest, NextResponse } from "next/server";
import { inAppNotificationService } from "@/lib/notifications/in-app-notification-service";

const DEMO_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get("userId") || body.userId || DEMO_USER_ID;
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required" },
        { status: 400 }
      );
    }

    const success = await inAppNotificationService.dismiss(notificationId, userId);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Error dismissing notification:", error);
    return NextResponse.json(
      { error: "Failed to dismiss notification" },
      { status: 500 }
    );
  }
}
