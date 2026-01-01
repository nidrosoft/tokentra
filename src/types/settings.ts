// ============================================================================
// ORGANIZATION SETTINGS
// ============================================================================

export type NotificationChannel = 'email' | 'in_app' | 'slack' | 'push' | 'webhook';

export interface OrganizationSettings {
  id: string;
  orgId: string;
  
  // General
  displayName?: string;
  logoUrl?: string;
  timezone: string;
  locale: string;
  dateFormat: string;
  currency: string;
  fiscalYearStart: number;
  
  // Defaults
  defaultCostCenterId?: string;
  defaultBudgetPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  defaultAlertChannels: NotificationChannel[];
  
  // Security Policies
  require2FA: boolean;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  passwordRequireNumbers: boolean;
  passwordExpireDays?: number;
  allowedIpRanges: string[];
  
  // Data Retention
  usageDataRetentionDays: number;
  auditLogRetentionDays: number;
  
  // Feature Toggles
  featuresEnabled: Record<string, boolean>;
  
  // Locked Settings
  lockedSettings: LockedSetting[];
  
  createdAt: string;
  updatedAt: string;
}

export interface LockedSetting {
  key: string;
  value: unknown;
  reason?: string;
  lockedBy: string;
  lockedAt: string;
}

export interface OrganizationSettingsUpdate {
  displayName?: string;
  logoUrl?: string;
  timezone?: string;
  locale?: string;
  dateFormat?: string;
  currency?: string;
  fiscalYearStart?: number;
  defaultCostCenterId?: string;
  defaultBudgetPeriod?: string;
  defaultAlertChannels?: NotificationChannel[];
  require2FA?: boolean;
  sessionTimeoutMinutes?: number;
  passwordMinLength?: number;
  passwordRequireSpecial?: boolean;
  passwordRequireNumbers?: boolean;
  passwordExpireDays?: number;
  allowedIpRanges?: string[];
  usageDataRetentionDays?: number;
  auditLogRetentionDays?: number;
  featuresEnabled?: Record<string, boolean>;
}

// ============================================================================
// USER SETTINGS
// ============================================================================

export interface UserSettings {
  id: string;
  userId: string;
  orgId: string;
  
  // Profile
  displayName?: string;
  avatarUrl?: string;
  
  // Preferences
  timezone?: string;
  locale?: string;
  dateFormat?: string;
  theme: 'light' | 'dark' | 'system';
  
  // Dashboard
  defaultDashboardView: string;
  defaultDateRange: string;
  pinnedWidgets: string[];
  collapsedSections: string[];
  
  // Navigation
  sidebarCollapsed: boolean;
  recentPages: RecentPage[];
  favoritePages: string[];
  
  // Table/Chart Preferences
  tablePreferences: Record<string, TablePreference>;
  chartPreferences: Record<string, ChartPreference>;
  
  // Accessibility
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Keyboard
  shortcutsEnabled: boolean;
  customShortcuts: Record<string, string>;
  
  createdAt: string;
  updatedAt: string;
}

export interface RecentPage {
  path: string;
  title: string;
  visitedAt: string;
}

export interface TablePreference {
  columns: string[];
  sort?: { column: string; direction: 'asc' | 'desc' };
  pageSize: number;
  filters?: Record<string, unknown>;
}

export interface ChartPreference {
  type: 'line' | 'bar' | 'area' | 'pie';
  showLegend: boolean;
  showGrid: boolean;
  colorScheme?: string;
}

export interface UserSettingsUpdate {
  displayName?: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
  dateFormat?: string;
  theme?: 'light' | 'dark' | 'system';
  defaultDashboardView?: string;
  defaultDateRange?: string;
  pinnedWidgets?: string[];
  sidebarCollapsed?: boolean;
  tablePreferences?: Record<string, TablePreference>;
  chartPreferences?: Record<string, ChartPreference>;
  shortcutsEnabled?: boolean;
  reduceMotion?: boolean;
  highContrast?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
}

// ============================================================================
// BILLING SETTINGS
// ============================================================================

export type PlanType = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export interface BillingSettings {
  id: string;
  orgId: string;
  
  plan: PlanType;
  planStartedAt: string;
  planExpiresAt?: string;
  trialEndsAt?: string;
  
  billingEmail?: string;
  billingName?: string;
  billingAddress?: BillingAddress;
  
  stripeCustomerId?: string;
  defaultPaymentMethodId?: string;
  
  invoicePrefix?: string;
  taxId?: string;
  taxIdType?: string;
  
  usageBasedPricing: boolean;
  usageRatePercent: number;
  minimumMonthlyFee: number;
  
  aiSpendLimit?: number;
  seatsLimit?: number;
  providersLimit?: number;
  
  autoCharge: boolean;
  invoiceDueDays: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface PlanLimits {
  aiSpendLimit: number;
  seatsLimit: number;
  providersLimit: number;
  features: string[];
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    aiSpendLimit: 1000,
    seatsLimit: 3,
    providersLimit: 2,
    features: ['dashboard', 'basic_alerts']
  },
  starter: {
    aiSpendLimit: 10000,
    seatsLimit: 10,
    providersLimit: 5,
    features: ['dashboard', 'alerts', 'cost_centers', 'csv_export']
  },
  pro: {
    aiSpendLimit: 50000,
    seatsLimit: 25,
    providersLimit: 10,
    features: ['dashboard', 'alerts', 'cost_centers', 'optimization', 'sdk', 'slack']
  },
  business: {
    aiSpendLimit: 200000,
    seatsLimit: 100,
    providersLimit: 20,
    features: ['dashboard', 'alerts', 'cost_centers', 'optimization', 'sdk', 'slack', 'smart_routing', 'api']
  },
  enterprise: {
    aiSpendLimit: Infinity,
    seatsLimit: Infinity,
    providersLimit: Infinity,
    features: ['all', 'sso', 'audit_logs', 'custom_sla', 'dedicated_support']
  }
};

// ============================================================================
// INTEGRATIONS
// ============================================================================

export type IntegrationType = 'slack' | 'pagerduty' | 'webhook' | 'sso' | 'jira' | 'linear';

export interface IntegrationSettings {
  id: string;
  orgId: string;
  integrationType: IntegrationType;
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
  status: 'active' | 'error' | 'pending';
  lastUsedAt?: string;
  errorMessage?: string;
  connectedBy?: string;
  connectedAt: string;
  updatedAt: string;
}

// ============================================================================
// WEBHOOKS
// ============================================================================

export type WebhookEvent = 
  | 'alert.triggered'
  | 'alert.resolved'
  | 'budget.created'
  | 'budget.exceeded'
  | 'budget.warning'
  | 'report.generated'
  | 'provider.connected'
  | 'provider.error'
  | 'optimization.recommendation';

export interface Webhook {
  id: string;
  orgId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  customHeaders: Record<string, string>;
  retryCount: number;
  retryDelaySeconds: number;
  enabled: boolean;
  status: 'active' | 'failing' | 'disabled';
  lastTriggeredAt?: string;
  lastStatusCode?: number;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  scope: 'platform' | 'org' | 'user';
  targetId?: string;
  enabled: boolean;
  value?: unknown;
  rolloutPercentage: number;
  category?: string;
  tags: string[];
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SETTINGS AUDIT LOG
// ============================================================================

export interface SettingsAuditEntry {
  id: string;
  orgId?: string;
  userId?: string;
  entityType: string;
  entityId: string;
  settingKey: string;
  oldValue?: unknown;
  newValue?: unknown;
  action: 'create' | 'update' | 'delete';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ============================================================================
// RESOLVED SETTINGS
// ============================================================================

export interface ResolvedSettings {
  org: OrganizationSettings;
  user: UserSettings;
  billing: BillingSettings;
  features: Record<string, boolean>;
  limits: PlanLimits;
}
