// Notification System Types

export type NotificationChannel = 'in_app' | 'email' | 'slack' | 'push' | 'webhook';
export type NotificationCategory = 'alert' | 'budget' | 'optimization' | 'provider' | 'report' | 'team' | 'system' | 'billing' | 'security';
export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';
export type RecipientType = 'user' | 'team' | 'org';
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
export type EmailFrequency = 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';

export interface Notification {
  id: string;
  orgId: string;
  recipientType: RecipientType;
  recipientId: string;
  category: NotificationCategory;
  subcategory?: string;
  priority: NotificationPriority;
  title: string;
  body: string;
  bodyHtml?: string;
  icon?: string;
  color?: string;
  sourceType: string;
  sourceId?: string;
  metadata: Record<string, unknown>;
  primaryActionLabel?: string;
  primaryActionUrl?: string;
  secondaryActionLabel?: string;
  secondaryActionUrl?: string;
  readAt?: string;
  archivedAt?: string;
  dismissedAt?: string;
  deliveryStatus: Record<NotificationChannel, ChannelDeliveryStatus>;
  createdAt: string;
  expiresAt?: string;
  dedupKey?: string;
}

export interface ChannelDeliveryStatus {
  sent: boolean;
  sentAt?: string;
  delivered?: boolean;
  deliveredAt?: string;
  opened?: boolean;
  openedAt?: string;
  clicked?: boolean;
  clickedAt?: string;
  error?: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  orgId: string;
  notificationsEnabled: boolean;
  dndEnabled: boolean;
  dndStartTime?: string;
  dndEndTime?: string;
  dndTimezone: string;
  dndOverrideUrgent: boolean;
  emailEnabled: boolean;
  emailAddress?: string;
  emailFrequency: EmailFrequency;
  emailDigestTime: string;
  emailDigestDay: number;
  slackEnabled: boolean;
  slackUserId?: string;
  slackDmEnabled: boolean;
  pushEnabled: boolean;
  pushSubscription?: PushSubscriptionJSON;
  inAppEnabled: boolean;
  inAppSound: boolean;
  inAppDesktopNotifications: boolean;
  categoryPreferences: CategoryPreferences;
  maxNotificationsPerHour: number;
  maxEmailsPerDay: number;
  updatedAt: string;
}

export interface CategoryPreferences {
  [category: string]: {
    email?: boolean | EmailFrequency;
    slack?: boolean;
    inApp?: boolean;
    push?: boolean;
    minPriority?: NotificationPriority;
  };
}

export interface NotificationPreferencesUpdate {
  notificationsEnabled?: boolean;
  dndEnabled?: boolean;
  dndStartTime?: string;
  dndEndTime?: string;
  dndTimezone?: string;
  dndOverrideUrgent?: boolean;
  emailEnabled?: boolean;
  emailFrequency?: EmailFrequency;
  emailDigestTime?: string;
  emailDigestDay?: number;
  slackEnabled?: boolean;
  slackDmEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  inAppSound?: boolean;
  inAppDesktopNotifications?: boolean;
  categoryPreferences?: CategoryPreferences;
  maxNotificationsPerHour?: number;
  maxEmailsPerDay?: number;
}

export interface UnreadCount {
  total: number;
  byCategory: Partial<Record<NotificationCategory, number>>;
  byPriority: Partial<Record<NotificationPriority, number>>;
}

export interface NotificationQuery {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  readStatus?: 'read' | 'unread' | 'all';
  sourceType?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface CreateNotificationRequest {
  recipientType: RecipientType;
  recipientId?: string;
  recipientIds?: string[];
  templateKey?: string;
  templateVariables?: Record<string, unknown>;
  category?: NotificationCategory;
  subcategory?: string;
  priority?: NotificationPriority;
  title?: string;
  body?: string;
  bodyHtml?: string;
  icon?: string;
  color?: string;
  sourceType: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
  primaryActionLabel?: string;
  primaryActionUrl?: string;
  secondaryActionLabel?: string;
  secondaryActionUrl?: string;
  channels?: NotificationChannel[];
  dedupKey?: string;
  expiresIn?: number;
  sendAt?: string;
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  orgId: string;
  subscriptionType: 'budget' | 'team' | 'project' | 'provider' | 'model' | 'alert_rule';
  targetId: string;
  channels: NotificationChannel[];
  minSeverity?: NotificationPriority;
  enabled: boolean;
  createdAt: string;
}

export interface NotificationMute {
  id: string;
  userId: string;
  orgId: string;
  muteType: 'category' | 'source' | 'team' | 'project' | 'alert_rule';
  targetId: string;
  mutedUntil?: string;
  reason?: string;
  createdAt: string;
}

export interface DeliveryLog {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  attemptCount: number;
  lastAttemptAt: string;
  nextRetryAt?: string;
  providerResponse?: Record<string, unknown>;
  errorMessage?: string;
  errorCode?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  providerMessageId?: string;
  createdAt: string;
}

// Category definitions for UI
export interface CategoryDefinition {
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultPriority: NotificationPriority;
  defaultChannels: NotificationChannel[];
  subcategories: string[];
}

export const NOTIFICATION_CATEGORIES: Record<NotificationCategory, CategoryDefinition> = {
  alert: {
    name: 'Alerts',
    description: 'Cost alerts, anomaly detection, and threshold breaches',
    icon: 'bell',
    color: '#EF4444',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'email'],
    subcategories: ['spend_threshold', 'budget_threshold', 'anomaly', 'usage_spike']
  },
  budget: {
    name: 'Budget Updates',
    description: 'Budget utilization, forecasts, and period rollovers',
    icon: 'wallet',
    color: '#F59E0B',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    subcategories: ['utilization_warning', 'utilization_critical', 'period_start', 'period_end']
  },
  optimization: {
    name: 'Optimization Insights',
    description: 'Cost-saving recommendations and efficiency insights',
    icon: 'lightbulb',
    color: '#10B981',
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
    subcategories: ['model_recommendation', 'caching_opportunity', 'savings_achieved']
  },
  provider: {
    name: 'Provider Status',
    description: 'Provider sync status, errors, and health updates',
    icon: 'plug',
    color: '#6366F1',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    subcategories: ['sync_complete', 'sync_error', 'credentials_expiring']
  },
  report: {
    name: 'Reports',
    description: 'Report generation and scheduled report delivery',
    icon: 'file-text',
    color: '#8B5CF6',
    defaultPriority: 'low',
    defaultChannels: ['in_app', 'email'],
    subcategories: ['report_ready', 'scheduled_report', 'export_complete']
  },
  team: {
    name: 'Team Activity',
    description: 'Team membership changes and activity updates',
    icon: 'users',
    color: '#3B82F6',
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
    subcategories: ['member_added', 'member_removed', 'role_changed']
  },
  system: {
    name: 'System Announcements',
    description: 'Platform updates, maintenance, and announcements',
    icon: 'megaphone',
    color: '#64748B',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    subcategories: ['maintenance', 'new_feature', 'platform_update']
  },
  billing: {
    name: 'Billing & Subscription',
    description: 'Invoices, payment status, and subscription changes',
    icon: 'credit-card',
    color: '#EC4899',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    subcategories: ['invoice_generated', 'payment_received', 'payment_failed']
  },
  security: {
    name: 'Security',
    description: 'Login alerts, API key events, and security notifications',
    icon: 'shield',
    color: '#DC2626',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'email'],
    subcategories: ['new_login', 'password_changed', 'api_key_created']
  }
};
