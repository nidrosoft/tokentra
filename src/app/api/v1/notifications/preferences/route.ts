import { NextRequest, NextResponse } from "next/server";
import { notificationPreferencesService } from "@/lib/notifications/notification-preferences-service";
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
    
    const body = await request.json();

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
