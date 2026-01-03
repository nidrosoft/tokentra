import { NextRequest, NextResponse } from "next/server";
import { inAppNotificationService } from "@/lib/notifications/in-app-notification-service";
import { getCurrentUserWithOrg } from "@/lib/auth/session";
import type { NotificationQuery } from "@/types/notifications";

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
    
    const { searchParams } = new URL(request.url);
    
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
    // Get organization ID from authenticated user
    const user = await getCurrentUserWithOrg();
    if (!user?.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized - no organization found" },
        { status: 401 }
      );
    }
    const orgId = user.organizationId;
    
    const body = await request.json();

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
