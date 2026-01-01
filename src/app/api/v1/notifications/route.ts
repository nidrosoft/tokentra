import { NextRequest, NextResponse } from "next/server";
import { inAppNotificationService } from "@/lib/notifications/in-app-notification-service";
import type { NotificationQuery } from "@/types/notifications";

const DEMO_ORG_ID = "b1c2d3e4-f5a6-7890-bcde-f12345678901";
const DEMO_USER_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const orgId = searchParams.get("organizationId") || DEMO_ORG_ID;
    const userId = searchParams.get("userId") || DEMO_USER_ID;
    
    const query: NotificationQuery = {
      category: searchParams.get("category") as NotificationQuery["category"] || undefined,
      priority: searchParams.get("priority") as NotificationQuery["priority"] || undefined,
      readStatus: (searchParams.get("readStatus") as NotificationQuery["readStatus"]) || "all",
      limit: parseInt(searchParams.get("limit") || "20", 10),
      offset: parseInt(searchParams.get("offset") || "0", 10),
    };

    const result = await inAppNotificationService.getNotifications(userId, orgId, query);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    
    const orgId = searchParams.get("organizationId") || body.orgId || DEMO_ORG_ID;

    const notification = await inAppNotificationService.createNotification(orgId, body);

    if (!notification) {
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
