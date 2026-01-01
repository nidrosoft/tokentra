import { auth } from "./config";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/**
 * Get the current user with their organization membership
 */
export async function getCurrentUserWithOrg() {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: membership } = await supabase
    .from("organization_members")
    .select(`
      role,
      organization:organizations (
        id,
        name,
        slug,
        plan
      )
    `)
    .eq("user_id", session.user.id)
    .single();

  return {
    ...session.user,
    organizationId: membership?.organization?.id,
    organizationName: membership?.organization?.name,
    organizationSlug: membership?.organization?.slug,
    organizationPlan: membership?.organization?.plan,
    role: membership?.role,
  };
}

/**
 * Require auth and return user with organization context
 */
export async function requireAuthWithOrg() {
  const user = await getCurrentUserWithOrg();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (!user.organizationId) {
    throw new Error("No organization found");
  }
  return user;
}
