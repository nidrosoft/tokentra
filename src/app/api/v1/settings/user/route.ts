import { NextRequest, NextResponse } from "next/server";
import { userSettingsService } from "@/lib/settings/user-settings-service";
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

    const settings = await userSettingsService.getSettings(userId, orgId);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
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

    // Remove non-update fields from body
    const { orgId: _, userId: __, ...updates } = body;

    const settings = await userSettingsService.updateSettings(userId, orgId, updates);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating user settings:", error);
    const message = error instanceof Error ? error.message : "Failed to update user settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
