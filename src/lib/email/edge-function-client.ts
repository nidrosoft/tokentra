/**
 * Edge Function Email Client
 * Sends emails via Supabase Edge Function instead of direct Resend API
 * This keeps the Resend API key secure in Supabase
 */

export interface EdgeEmailRequest {
  type: string;
  to: string;
  data: Record<string, unknown>;
  userId?: string;
  organizationId?: string;
}

export interface EdgeEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via Supabase Edge Function
 */
export async function sendEmailViaEdgeFunction(
  request: EdgeEmailRequest
): Promise<EdgeEmailResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[EdgeEmailClient] Supabase not configured");
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[EdgeEmailClient] Edge function error:", errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("[EdgeEmailClient] Network error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Convenience function for common email types
 */
export const EdgeEmail = {
  async welcome(to: string, userName: string, userId?: string, organizationId?: string) {
    return sendEmailViaEdgeFunction({
      type: "welcome",
      to,
      data: { userName },
      userId,
      organizationId,
    });
  },

  async spendThreshold(
    to: string,
    data: { currentSpend: string; threshold: string; percentOfThreshold: number },
    userId?: string,
    organizationId?: string
  ) {
    return sendEmailViaEdgeFunction({
      type: "spend_threshold",
      to,
      data,
      userId,
      organizationId,
    });
  },

  async budgetExceeded(
    to: string,
    data: { budgetName: string; currentSpend: string; budgetAmount: string },
    userId?: string,
    organizationId?: string
  ) {
    return sendEmailViaEdgeFunction({
      type: "budget_exceeded",
      to,
      data,
      userId,
      organizationId,
    });
  },

  async teamInvite(
    to: string,
    data: { inviterName: string; organizationName: string; inviteUrl: string },
    userId?: string,
    organizationId?: string
  ) {
    return sendEmailViaEdgeFunction({
      type: "team_invite",
      to,
      data,
      userId,
      organizationId,
    });
  },

  async passwordReset(to: string, resetUrl: string, userId?: string) {
    return sendEmailViaEdgeFunction({
      type: "password_reset",
      to,
      data: { resetUrl },
      userId,
    });
  },
};
