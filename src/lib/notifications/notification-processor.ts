import { inAppNotificationService } from "./in-app-notification-service";
import type { NotificationCategory, NotificationPriority } from "@/types/notifications";

interface NotificationTriggerParams {
  orgId: string;
  recipientId: string;
  category: NotificationCategory;
  subcategory?: string;
  priority?: NotificationPriority;
  title: string;
  body: string;
  sourceType: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
  primaryActionLabel?: string;
  primaryActionUrl?: string;
}

export class NotificationProcessor {
  async triggerAlertNotification(params: {
    orgId: string;
    recipientId: string;
    alertName: string;
    alertType: string;
    currentValue: string;
    threshold: string;
    alertId?: string;
  }) {
    return this.createNotification({
      orgId: params.orgId,
      recipientId: params.recipientId,
      category: "alert",
      subcategory: params.alertType,
      priority: "high",
      title: `Alert: ${params.alertName}`,
      body: `${params.alertName} triggered. Current value: ${params.currentValue}, Threshold: ${params.threshold}`,
      sourceType: "alert",
      sourceId: params.alertId,
      primaryActionLabel: "View Alert",
      primaryActionUrl: params.alertId ? `/dashboard/alerts?id=${params.alertId}` : "/dashboard/alerts",
    });
  }

  async triggerBudgetNotification(params: {
    orgId: string;
    recipientId: string;
    budgetName: string;
    percentage: number;
    currentSpend: string;
    budgetAmount: string;
    budgetId?: string;
  }) {
    const priority: NotificationPriority = params.percentage >= 100 ? "urgent" : params.percentage >= 90 ? "high" : "normal";
    const subcategory = params.percentage >= 100 ? "utilization_critical" : "utilization_warning";

    return this.createNotification({
      orgId: params.orgId,
      recipientId: params.recipientId,
      category: "budget",
      subcategory,
      priority,
      title: `Budget ${params.percentage >= 100 ? "Exceeded" : "Warning"}: ${params.budgetName}`,
      body: `${params.budgetName} is at ${params.percentage}% utilization (${params.currentSpend} of ${params.budgetAmount})`,
      sourceType: "budget",
      sourceId: params.budgetId,
      primaryActionLabel: "View Budget",
      primaryActionUrl: params.budgetId ? `/dashboard/budgets?id=${params.budgetId}` : "/dashboard/budgets",
    });
  }

  async triggerOptimizationNotification(params: {
    orgId: string;
    recipientId: string;
    recommendationType: string;
    potentialSavings: string;
    description: string;
    recommendationId?: string;
  }) {
    return this.createNotification({
      orgId: params.orgId,
      recipientId: params.recipientId,
      category: "optimization",
      subcategory: params.recommendationType,
      priority: "low",
      title: `Save ${params.potentialSavings} with optimization`,
      body: params.description,
      sourceType: "optimization",
      sourceId: params.recommendationId,
      primaryActionLabel: "View Recommendation",
      primaryActionUrl: params.recommendationId
        ? `/dashboard/optimization?id=${params.recommendationId}`
        : "/dashboard/optimization",
    });
  }

  async triggerProviderNotification(params: {
    orgId: string;
    recipientId: string;
    providerName: string;
    eventType: "sync_complete" | "sync_error" | "credentials_expiring";
    message: string;
    providerId?: string;
  }) {
    const priority: NotificationPriority = params.eventType === "sync_error" ? "high" : "normal";

    return this.createNotification({
      orgId: params.orgId,
      recipientId: params.recipientId,
      category: "provider",
      subcategory: params.eventType,
      priority,
      title: `${params.providerName}: ${params.eventType.replace(/_/g, " ")}`,
      body: params.message,
      sourceType: "provider",
      sourceId: params.providerId,
      primaryActionLabel: "View Provider",
      primaryActionUrl: params.providerId
        ? `/dashboard/providers?id=${params.providerId}`
        : "/dashboard/providers",
    });
  }

  async triggerTeamNotification(params: {
    orgId: string;
    recipientId: string;
    teamName: string;
    eventType: "member_added" | "member_removed" | "role_changed";
    memberName: string;
    role?: string;
    teamId?: string;
  }) {
    let title = "";
    let body = "";

    switch (params.eventType) {
      case "member_added":
        title = `${params.memberName} joined ${params.teamName}`;
        body = `${params.memberName} has been added to ${params.teamName}${params.role ? ` as ${params.role}` : ""}.`;
        break;
      case "member_removed":
        title = `${params.memberName} left ${params.teamName}`;
        body = `${params.memberName} has been removed from ${params.teamName}.`;
        break;
      case "role_changed":
        title = `Role changed for ${params.memberName}`;
        body = `${params.memberName}'s role in ${params.teamName} has been changed${params.role ? ` to ${params.role}` : ""}.`;
        break;
    }

    return this.createNotification({
      orgId: params.orgId,
      recipientId: params.recipientId,
      category: "team",
      subcategory: params.eventType,
      priority: "low",
      title,
      body,
      sourceType: "team",
      sourceId: params.teamId,
      primaryActionLabel: "View Team",
      primaryActionUrl: params.teamId ? `/dashboard/teams?id=${params.teamId}` : "/dashboard/teams",
    });
  }

  async triggerSecurityNotification(params: {
    orgId: string;
    recipientId: string;
    eventType: "new_login" | "api_key_created" | "api_key_revoked" | "password_changed";
    details: string;
    metadata?: Record<string, unknown>;
  }) {
    const titles: Record<string, string> = {
      new_login: "New login detected",
      api_key_created: "New API key created",
      api_key_revoked: "API key revoked",
      password_changed: "Password changed",
    };

    return this.createNotification({
      orgId: params.orgId,
      recipientId: params.recipientId,
      category: "security",
      subcategory: params.eventType,
      priority: params.eventType === "new_login" ? "normal" : "high",
      title: titles[params.eventType] || "Security event",
      body: params.details,
      sourceType: "security",
      metadata: params.metadata,
      primaryActionLabel: "Review Security",
      primaryActionUrl: "/dashboard/settings?tab=security",
    });
  }

  private async createNotification(params: NotificationTriggerParams) {
    return inAppNotificationService.createNotification(params.orgId, {
      recipientType: "user",
      recipientId: params.recipientId,
      category: params.category,
      subcategory: params.subcategory,
      priority: params.priority ?? "normal",
      title: params.title,
      body: params.body,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      metadata: params.metadata,
      primaryActionLabel: params.primaryActionLabel,
      primaryActionUrl: params.primaryActionUrl,
    });
  }
}

export const notificationProcessor = new NotificationProcessor();
