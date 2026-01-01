# TokenTra Settings System

## Unified Settings Architecture & Configuration Management

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## Executive Summary

The TokenTra Settings System provides a unified architecture for managing all application settings—from organization-level configurations to individual user preferences. This document defines the complete settings hierarchy, data models, services, and UI components that power the Settings experience throughout the platform.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Settings Hierarchy](#2-settings-hierarchy)
3. [Database Schema](#3-database-schema)
4. [TypeScript Types](#4-typescript-types)
5. [Organization Settings Service](#5-organization-settings-service)
6. [User Settings Service](#6-user-settings-service)
7. [Security Settings Service](#7-security-settings-service)
8. [Billing Settings Service](#8-billing-settings-service)
9. [Integration Settings Service](#9-integration-settings-service)
10. [Feature Flags Service](#10-feature-flags-service)
11. [API Keys Service](#11-api-keys-service)
12. [Unified Settings Service](#12-unified-settings-service)
13. [API Routes](#13-api-routes)
14. [React Components](#14-react-components)
15. [React Hooks](#15-react-hooks)
16. [Audit Logging](#16-audit-logging)
17. [Integration Guide](#17-integration-guide)

---

## 1. Architecture Overview

### 1.1 System Design

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SETTINGS SYSTEM ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                         SETTINGS HIERARCHY                                  │ │
│  │                                                                             │ │
│  │   ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │   │                    PLATFORM DEFAULTS                                 │  │ │
│  │   │            (System-wide defaults, feature flags)                     │  │ │
│  │   └─────────────────────────────┬───────────────────────────────────────┘  │ │
│  │                                 │                                           │ │
│  │   ┌─────────────────────────────▼───────────────────────────────────────┐  │ │
│  │   │                  ORGANIZATION SETTINGS                               │  │ │
│  │   │        (Org config, billing, security policies, integrations)        │  │ │
│  │   └─────────────────────────────┬───────────────────────────────────────┘  │ │
│  │                                 │                                           │ │
│  │          ┌──────────────────────┼──────────────────────┐                    │ │
│  │          │                      │                      │                    │ │
│  │   ┌──────▼──────┐       ┌───────▼───────┐      ┌───────▼───────┐           │ │
│  │   │    TEAM     │       │    PROJECT    │      │     USER      │           │ │
│  │   │  SETTINGS   │       │   SETTINGS    │      │   SETTINGS    │           │ │
│  │   └─────────────┘       └───────────────┘      └───────────────┘           │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                         SETTINGS CATEGORIES                                 │ │
│  │                                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │   General   │ │  Security   │ │   Billing   │ │Integrations │           │ │
│  │  │  Settings   │ │  Settings   │ │  Settings   │ │  Settings   │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  │                                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │  │Notification │ │   Data &    │ │   Feature   │ │   API &     │           │ │
│  │  │  Settings   │ │   Privacy   │ │    Flags    │ │  Webhooks   │           │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **Hierarchical Inheritance** | Settings cascade from platform → org → team → user |
| **Role-Based Access** | Settings access controlled by user roles |
| **Audit Trail** | All changes logged for compliance |
| **Validation** | Schema validation before save |
| **Caching** | Fast reads with Redis caching |
| **Real-Time Sync** | Changes propagate instantly |

### 1.3 Settings Categories

| Category | Scope | Description |
|----------|-------|-------------|
| **General** | Org/User | Name, timezone, locale, defaults |
| **Security** | Org/User | 2FA, sessions, password policies |
| **Billing** | Org | Subscription, payment, invoices |
| **Integrations** | Org | Slack, webhooks, SSO |
| **Notifications** | Org/User | Alert preferences, channels |
| **Data & Privacy** | Org/User | Data retention, exports |
| **Feature Flags** | Platform/Org | Feature toggles |
| **API** | Org/User | API keys, rate limits |

---

## 2. Settings Hierarchy

### 2.1 Inheritance Model

```typescript
// Settings are resolved in order: User → Team → Org → Platform Defaults

interface SettingsResolution {
  platformDefault: {
    emailFrequency: 'daily',
    pushEnabled: true
  };
  
  orgSettings: {
    emailFrequency: 'instant',  // Overrides platform
    pushEnabled: true           // Inherited from platform
  };
  
  userSettings: {
    emailFrequency: 'weekly',   // Overrides org
    pushEnabled: false          // Overrides org
  };
  
  // Final resolved settings for user:
  resolved: {
    emailFrequency: 'weekly',   // From user
    pushEnabled: false          // From user
  };
}
```

### 2.2 Locked Settings

Organizations can lock certain settings to enforce policies:

```typescript
interface LockedSetting {
  key: string;
  value: any;
  reason?: string;
  lockedBy: string;
  lockedAt: string;
}

// Example: Org requires 2FA for all users
const lockedSettings: LockedSetting[] = [
  {
    key: 'security.require2FA',
    value: true,
    reason: 'Company security policy requires 2FA',
    lockedBy: 'admin@company.com',
    lockedAt: '2025-01-15T10:00:00Z'
  }
];
```

---

## 3. Database Schema

```sql
-- ============================================================================
-- ORGANIZATION SETTINGS
-- ============================================================================

CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- General
  display_name VARCHAR(255),
  logo_url VARCHAR(500),
  timezone VARCHAR(100) DEFAULT 'UTC',
  locale VARCHAR(20) DEFAULT 'en-US',
  date_format VARCHAR(50) DEFAULT 'MMM DD, YYYY',
  currency VARCHAR(3) DEFAULT 'USD',
  fiscal_year_start INTEGER DEFAULT 1,
  
  -- Defaults
  default_cost_center_id UUID REFERENCES cost_centers(id),
  default_budget_period VARCHAR(20) DEFAULT 'monthly',
  default_alert_channels JSONB DEFAULT '["email", "in_app"]'::jsonb,
  
  -- Security Policies
  require_2fa BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 1440,
  password_min_length INTEGER DEFAULT 12,
  password_require_special BOOLEAN DEFAULT true,
  password_require_numbers BOOLEAN DEFAULT true,
  password_expire_days INTEGER,
  allowed_ip_ranges JSONB DEFAULT '[]'::jsonb,
  
  -- Data Retention
  usage_data_retention_days INTEGER DEFAULT 365,
  audit_log_retention_days INTEGER DEFAULT 730,
  
  -- Feature Toggles
  features_enabled JSONB DEFAULT '{}'::jsonb,
  
  -- Locked Settings
  locked_settings JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_org_settings UNIQUE (org_id)
);

CREATE INDEX idx_org_settings_org ON organization_settings(org_id);

-- ============================================================================
-- USER SETTINGS
-- ============================================================================

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Profile
  display_name VARCHAR(255),
  avatar_url VARCHAR(500),
  
  -- Preferences
  timezone VARCHAR(100),
  locale VARCHAR(20),
  date_format VARCHAR(50),
  theme VARCHAR(20) DEFAULT 'system',
  
  -- Dashboard
  default_dashboard_view VARCHAR(50) DEFAULT 'overview',
  default_date_range VARCHAR(20) DEFAULT '30d',
  pinned_widgets JSONB DEFAULT '[]'::jsonb,
  collapsed_sections JSONB DEFAULT '[]'::jsonb,
  
  -- Navigation
  sidebar_collapsed BOOLEAN DEFAULT false,
  recent_pages JSONB DEFAULT '[]'::jsonb,
  favorite_pages JSONB DEFAULT '[]'::jsonb,
  
  -- Table/Chart Preferences
  table_preferences JSONB DEFAULT '{}'::jsonb,
  chart_preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Accessibility
  reduce_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  font_size VARCHAR(20) DEFAULT 'medium',
  
  -- Keyboard
  shortcuts_enabled BOOLEAN DEFAULT true,
  custom_shortcuts JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_org_settings UNIQUE (user_id, org_id)
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_user_settings_org ON user_settings(org_id);

-- ============================================================================
-- BILLING SETTINGS
-- ============================================================================

CREATE TABLE billing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Subscription
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  plan_started_at TIMESTAMPTZ DEFAULT NOW(),
  plan_expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  
  -- Billing Contact
  billing_email VARCHAR(255),
  billing_name VARCHAR(255),
  billing_address JSONB,
  
  -- Payment
  stripe_customer_id VARCHAR(255),
  default_payment_method_id VARCHAR(255),
  
  -- Invoice Settings
  invoice_prefix VARCHAR(20),
  tax_id VARCHAR(50),
  tax_id_type VARCHAR(20),
  
  -- Usage-Based Billing
  usage_based_pricing BOOLEAN DEFAULT false,
  usage_rate_percent NUMERIC DEFAULT 0.5,
  minimum_monthly_fee NUMERIC DEFAULT 99,
  
  -- Limits
  ai_spend_limit NUMERIC,
  seats_limit INTEGER,
  providers_limit INTEGER,
  
  -- Invoicing
  auto_charge BOOLEAN DEFAULT true,
  invoice_due_days INTEGER DEFAULT 30,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_billing_settings UNIQUE (org_id)
);

CREATE INDEX idx_billing_settings_org ON billing_settings(org_id);
CREATE INDEX idx_billing_settings_stripe ON billing_settings(stripe_customer_id);

-- ============================================================================
-- INTEGRATION SETTINGS
-- ============================================================================

CREATE TABLE integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  integration_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  
  -- Configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  config_encrypted TEXT,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active',
  last_used_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Metadata
  connected_by UUID REFERENCES users(id),
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_integration UNIQUE (org_id, integration_type, name)
);

CREATE INDEX idx_integration_settings_org ON integration_settings(org_id);

-- ============================================================================
-- API KEYS
-- ============================================================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  
  -- Permissions
  scopes JSONB DEFAULT '["read"]'::jsonb,
  
  -- Restrictions
  allowed_ips JSONB DEFAULT '[]'::jsonb,
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Tracking
  last_used_at TIMESTAMPTZ,
  last_used_ip VARCHAR(45),
  usage_count INTEGER DEFAULT 0,
  
  -- Status
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id),
  revoke_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_key_prefix UNIQUE (org_id, key_prefix)
);

CREATE INDEX idx_api_keys_org ON api_keys(org_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- ============================================================================
-- WEBHOOKS
-- ============================================================================

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  secret VARCHAR(255),
  custom_headers JSONB DEFAULT '{}'::jsonb,
  
  -- Retry
  retry_count INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  
  -- Status
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'active',
  last_triggered_at TIMESTAMPTZ,
  last_status_code INTEGER,
  failure_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_org ON webhooks(org_id);

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================

CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Targeting
  scope VARCHAR(20) NOT NULL DEFAULT 'platform',
  target_id UUID,
  
  -- Value
  enabled BOOLEAN DEFAULT false,
  value JSONB,
  rollout_percentage INTEGER DEFAULT 100,
  
  -- Metadata
  category VARCHAR(50),
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Lifecycle
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_feature_flag UNIQUE (key, scope, COALESCE(target_id, '00000000-0000-0000-0000-000000000000'))
);

CREATE INDEX idx_feature_flags_key ON feature_flags(key);

-- ============================================================================
-- SETTINGS AUDIT LOG
-- ============================================================================

CREATE TABLE settings_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  setting_key VARCHAR(255) NOT NULL,
  
  old_value JSONB,
  new_value JSONB,
  
  action VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_audit_org ON settings_audit_log(org_id, created_at DESC);
CREATE INDEX idx_settings_audit_entity ON settings_audit_log(entity_type, entity_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage org settings" ON organization_settings
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users manage own settings" ON user_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Billing admins manage billing" ON billing_settings
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'billing_admin')
    )
  );

CREATE POLICY "Users manage own API keys" ON api_keys
  FOR ALL USING (
    user_id = auth.uid() OR
    org_id IN (
      SELECT org_id FROM org_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
```

---

## 4. TypeScript Types

```typescript
// types/settings.ts

// ============================================================================
// ORGANIZATION SETTINGS
// ============================================================================

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
  
  updatedAt: string;
}

export interface LockedSetting {
  key: string;
  value: any;
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
  filters?: Record<string, any>;
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
    seatsLimit: 1,
    providersLimit: 2,
    features: ['dashboard', 'basic_alerts']
  },
  starter: {
    aiSpendLimit: 10000,
    seatsLimit: 5,
    providersLimit: 5,
    features: ['dashboard', 'alerts', 'cost_centers', 'csv_export']
  },
  pro: {
    aiSpendLimit: 50000,
    seatsLimit: 20,
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
// API KEYS
// ============================================================================

export interface ApiKey {
  id: string;
  orgId: string;
  userId?: string;
  name: string;
  keyPrefix: string;
  scopes: ApiScope[];
  allowedIps: string[];
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  expiresAt?: string;
  lastUsedAt?: string;
  lastUsedIp?: string;
  usageCount: number;
  revoked: boolean;
  revokedAt?: string;
  createdAt: string;
}

export type ApiScope = 'read' | 'write' | 'admin' | 'usage:read' | 'costs:read' | 'budgets:write' | 'alerts:write';

export interface CreateApiKeyRequest {
  name: string;
  scopes: ApiScope[];
  allowedIps?: string[];
  rateLimitPerMinute?: number;
  rateLimitPerDay?: number;
  expiresAt?: string;
}

export interface ApiKeyCreatedResponse {
  apiKey: ApiKey;
  secretKey: string; // Only shown once!
}

// ============================================================================
// WEBHOOKS
// ============================================================================

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
  value?: any;
  rolloutPercentage: number;
  category?: string;
  tags: string[];
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INTEGRATIONS
// ============================================================================

export type IntegrationType = 'slack' | 'pagerduty' | 'webhook' | 'sso' | 'jira' | 'linear';

export interface IntegrationSettings {
  id: string;
  orgId: string;
  integrationType: IntegrationType;
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  status: 'active' | 'error' | 'pending';
  lastUsedAt?: string;
  errorMessage?: string;
  connectedBy?: string;
  connectedAt: string;
  updatedAt: string;
}

export interface SlackIntegrationConfig {
  teamId: string;
  teamName: string;
  botUserId: string;
  accessToken: string;
  defaultChannel?: string;
  channels: SlackChannel[];
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
}

export interface SSOConfig {
  provider: 'okta' | 'azure_ad' | 'google' | 'onelogin' | 'custom_saml';
  entityId?: string;
  ssoUrl?: string;
  certificate?: string;
  clientId?: string;
  clientSecret?: string;
  issuer?: string;
  autoProvision: boolean;
  defaultRole: string;
  allowedDomains: string[];
}

// ============================================================================
// RESOLVED SETTINGS
// ============================================================================

export interface ResolvedSettings {
  org: OrganizationSettings;
  user: UserSettings;
  notifications: NotificationPreferences;
  billing: BillingSettings;
  features: Record<string, boolean>;
  limits: PlanLimits;
}
```

---

## 5. Organization Settings Service

```typescript
// lib/services/OrganizationSettingsService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';

export class OrganizationSettingsService {
  private supabase: SupabaseClient;
  private redis: Redis;
  private auditService: SettingsAuditService;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    this.redis = new Redis(process.env.REDIS_URL!);
    this.auditService = new SettingsAuditService();
  }
  
  /**
   * Get organization settings with caching
   */
  async getSettings(orgId: string): Promise<OrganizationSettings> {
    const cacheKey = `settings:org:${orgId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const { data, error } = await this.supabase
      .from('organization_settings')
      .select('*')
      .eq('org_id', orgId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get settings: ${error.message}`);
    }
    
    const settings = data ? this.mapSettings(data) : this.getDefaults(orgId);
    
    await this.redis.setex(cacheKey, 300, JSON.stringify(settings));
    
    return settings;
  }
  
  /**
   * Get default organization settings
   */
  getDefaults(orgId: string): OrganizationSettings {
    return {
      id: '',
      orgId,
      timezone: 'UTC',
      locale: 'en-US',
      dateFormat: 'MMM DD, YYYY',
      currency: 'USD',
      fiscalYearStart: 1,
      defaultBudgetPeriod: 'monthly',
      defaultAlertChannels: ['email', 'in_app'],
      require2FA: false,
      sessionTimeoutMinutes: 1440,
      passwordMinLength: 12,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      allowedIpRanges: [],
      usageDataRetentionDays: 365,
      auditLogRetentionDays: 730,
      featuresEnabled: {},
      lockedSettings: [],
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Update organization settings
   */
  async updateSettings(
    orgId: string,
    updates: OrganizationSettingsUpdate,
    userId: string
  ): Promise<OrganizationSettings> {
    const current = await this.getSettings(orgId);
    
    this.validateUpdates(updates);
    
    const dbUpdates = this.mapToDb(updates);
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await this.supabase
      .from('organization_settings')
      .upsert({
        org_id: orgId,
        ...dbUpdates
      }, {
        onConflict: 'org_id'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }
    
    const newSettings = this.mapSettings(data);
    
    // Audit changes
    await this.auditChanges(orgId, userId, current, newSettings, updates);
    
    // Invalidate cache
    await this.redis.del(`settings:org:${orgId}`);
    
    // Broadcast update
    await this.redis.publish(
      `settings:org:${orgId}`,
      JSON.stringify({ type: 'update', settings: newSettings })
    );
    
    return newSettings;
  }
  
  /**
   * Lock a setting to prevent user override
   */
  async lockSetting(
    orgId: string,
    settingKey: string,
    value: any,
    reason: string,
    userId: string
  ): Promise<void> {
    const settings = await this.getSettings(orgId);
    
    const lockedSetting: LockedSetting = {
      key: settingKey,
      value,
      reason,
      lockedBy: userId,
      lockedAt: new Date().toISOString()
    };
    
    const lockedSettings = settings.lockedSettings.filter(s => s.key !== settingKey);
    lockedSettings.push(lockedSetting);
    
    await this.supabase
      .from('organization_settings')
      .update({ locked_settings: lockedSettings })
      .eq('org_id', orgId);
    
    await this.redis.del(`settings:org:${orgId}`);
  }
  
  /**
   * Check if a setting is locked
   */
  isSettingLocked(settings: OrganizationSettings, key: string): LockedSetting | null {
    return settings.lockedSettings.find(s => s.key === key) || null;
  }
  
  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(orgId: string, feature: string): Promise<boolean> {
    const settings = await this.getSettings(orgId);
    return settings.featuresEnabled[feature] === true;
  }
  
  private validateUpdates(updates: OrganizationSettingsUpdate): void {
    if (updates.passwordMinLength !== undefined) {
      if (updates.passwordMinLength < 8 || updates.passwordMinLength > 128) {
        throw new Error('Password minimum length must be between 8 and 128');
      }
    }
    
    if (updates.sessionTimeoutMinutes !== undefined) {
      if (updates.sessionTimeoutMinutes < 15 || updates.sessionTimeoutMinutes > 43200) {
        throw new Error('Session timeout must be between 15 minutes and 30 days');
      }
    }
    
    if (updates.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: updates.timezone });
      } catch {
        throw new Error(`Invalid timezone: ${updates.timezone}`);
      }
    }
  }
  
  private async auditChanges(
    orgId: string,
    userId: string,
    oldSettings: OrganizationSettings,
    newSettings: OrganizationSettings,
    updates: OrganizationSettingsUpdate
  ): Promise<void> {
    for (const key of Object.keys(updates)) {
      const oldValue = (oldSettings as any)[key];
      const newValue = (newSettings as any)[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        await this.auditService.log({
          orgId,
          userId,
          entityType: 'org_settings',
          entityId: orgId,
          settingKey: key,
          oldValue,
          newValue,
          action: 'update'
        });
      }
    }
  }
  
  private mapSettings(row: any): OrganizationSettings {
    return {
      id: row.id,
      orgId: row.org_id,
      displayName: row.display_name,
      logoUrl: row.logo_url,
      timezone: row.timezone,
      locale: row.locale,
      dateFormat: row.date_format,
      currency: row.currency,
      fiscalYearStart: row.fiscal_year_start,
      defaultCostCenterId: row.default_cost_center_id,
      defaultBudgetPeriod: row.default_budget_period,
      defaultAlertChannels: row.default_alert_channels,
      require2FA: row.require_2fa,
      sessionTimeoutMinutes: row.session_timeout_minutes,
      passwordMinLength: row.password_min_length,
      passwordRequireSpecial: row.password_require_special,
      passwordRequireNumbers: row.password_require_numbers,
      passwordExpireDays: row.password_expire_days,
      allowedIpRanges: row.allowed_ip_ranges,
      usageDataRetentionDays: row.usage_data_retention_days,
      auditLogRetentionDays: row.audit_log_retention_days,
      featuresEnabled: row.features_enabled,
      lockedSettings: row.locked_settings,
      updatedAt: row.updated_at
    };
  }
  
  private mapToDb(updates: OrganizationSettingsUpdate): Record<string, any> {
    const mapping: Record<string, string> = {
      displayName: 'display_name',
      logoUrl: 'logo_url',
      timezone: 'timezone',
      locale: 'locale',
      dateFormat: 'date_format',
      currency: 'currency',
      fiscalYearStart: 'fiscal_year_start',
      defaultCostCenterId: 'default_cost_center_id',
      defaultBudgetPeriod: 'default_budget_period',
      defaultAlertChannels: 'default_alert_channels',
      require2FA: 'require_2fa',
      sessionTimeoutMinutes: 'session_timeout_minutes',
      passwordMinLength: 'password_min_length',
      passwordRequireSpecial: 'password_require_special',
      passwordRequireNumbers: 'password_require_numbers',
      passwordExpireDays: 'password_expire_days',
      allowedIpRanges: 'allowed_ip_ranges',
      usageDataRetentionDays: 'usage_data_retention_days',
      auditLogRetentionDays: 'audit_log_retention_days',
      featuresEnabled: 'features_enabled'
    };
    
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (mapping[key]) {
        result[mapping[key]] = value;
      }
    }
    
    return result;
  }
}
```

---

## 6. User Settings Service

```typescript
// lib/services/UserSettingsService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';

export class UserSettingsService {
  private supabase: SupabaseClient;
  private redis: Redis;
  private orgSettingsService: OrganizationSettingsService;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    this.redis = new Redis(process.env.REDIS_URL!);
    this.orgSettingsService = new OrganizationSettingsService();
  }
  
  /**
   * Get user settings with caching
   */
  async getSettings(userId: string, orgId: string): Promise<UserSettings> {
    const cacheKey = `settings:user:${userId}:${orgId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get settings: ${error.message}`);
    }
    
    const settings = data ? this.mapSettings(data) : this.getDefaults(userId, orgId);
    
    await this.redis.setex(cacheKey, 300, JSON.stringify(settings));
    
    return settings;
  }
  
  /**
   * Get resolved settings (with inheritance from org)
   */
  async getResolvedSettings(userId: string, orgId: string): Promise<ResolvedUserSettings> {
    const [orgSettings, userSettings] = await Promise.all([
      this.orgSettingsService.getSettings(orgId),
      this.getSettings(userId, orgId)
    ]);
    
    return {
      timezone: userSettings.timezone || orgSettings.timezone,
      locale: userSettings.locale || orgSettings.locale,
      dateFormat: userSettings.dateFormat || orgSettings.dateFormat,
      theme: userSettings.theme,
      sidebarCollapsed: userSettings.sidebarCollapsed,
      defaultDashboardView: userSettings.defaultDashboardView,
      defaultDateRange: userSettings.defaultDateRange,
      pinnedWidgets: userSettings.pinnedWidgets,
      tablePreferences: userSettings.tablePreferences,
      chartPreferences: userSettings.chartPreferences,
      shortcutsEnabled: userSettings.shortcutsEnabled,
      customShortcuts: userSettings.customShortcuts,
      reduceMotion: userSettings.reduceMotion,
      highContrast: userSettings.highContrast,
      fontSize: userSettings.fontSize
    };
  }
  
  /**
   * Get default user settings
   */
  getDefaults(userId: string, orgId: string): UserSettings {
    return {
      id: '',
      userId,
      orgId,
      theme: 'system',
      defaultDashboardView: 'overview',
      defaultDateRange: '30d',
      pinnedWidgets: [],
      collapsedSections: [],
      sidebarCollapsed: false,
      recentPages: [],
      favoritePages: [],
      tablePreferences: {},
      chartPreferences: {},
      shortcutsEnabled: true,
      customShortcuts: {},
      reduceMotion: false,
      highContrast: false,
      fontSize: 'medium',
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Update user settings
   */
  async updateSettings(
    userId: string,
    orgId: string,
    updates: UserSettingsUpdate
  ): Promise<UserSettings> {
    // Check for locked settings
    const orgSettings = await this.orgSettingsService.getSettings(orgId);
    
    for (const key of Object.keys(updates)) {
      const locked = this.orgSettingsService.isSettingLocked(orgSettings, `user.${key}`);
      if (locked) {
        throw new Error(`Setting "${key}" is locked by organization policy: ${locked.reason}`);
      }
    }
    
    const dbUpdates = this.mapToDb(updates);
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await this.supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        org_id: orgId,
        ...dbUpdates
      }, {
        onConflict: 'user_id,org_id'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }
    
    const settings = this.mapSettings(data);
    
    // Invalidate cache
    await this.redis.del(`settings:user:${userId}:${orgId}`);
    
    // Broadcast update
    await this.redis.publish(
      `settings:user:${userId}`,
      JSON.stringify({ type: 'update', settings })
    );
    
    return settings;
  }
  
  /**
   * Update theme
   */
  async setTheme(
    userId: string,
    orgId: string,
    theme: 'light' | 'dark' | 'system'
  ): Promise<void> {
    await this.updateSettings(userId, orgId, { theme });
  }
  
  /**
   * Toggle sidebar
   */
  async toggleSidebar(userId: string, orgId: string): Promise<boolean> {
    const settings = await this.getSettings(userId, orgId);
    const newValue = !settings.sidebarCollapsed;
    
    await this.updateSettings(userId, orgId, { sidebarCollapsed: newValue });
    
    return newValue;
  }
  
  /**
   * Add page to favorites
   */
  async addFavoritePage(userId: string, orgId: string, path: string): Promise<void> {
    const settings = await this.getSettings(userId, orgId);
    
    if (!settings.favoritePages.includes(path)) {
      const favoritePages = [...settings.favoritePages, path];
      await this.updateSettings(userId, orgId, { favoritePages } as any);
    }
  }
  
  /**
   * Update table preference
   */
  async updateTablePreference(
    userId: string,
    orgId: string,
    tableId: string,
    preference: TablePreference
  ): Promise<void> {
    const settings = await this.getSettings(userId, orgId);
    
    const tablePreferences = {
      ...settings.tablePreferences,
      [tableId]: preference
    };
    
    await this.updateSettings(userId, orgId, { tablePreferences });
  }
  
  /**
   * Pin a widget to dashboard
   */
  async pinWidget(userId: string, orgId: string, widgetId: string): Promise<void> {
    const settings = await this.getSettings(userId, orgId);
    
    if (!settings.pinnedWidgets.includes(widgetId)) {
      const pinnedWidgets = [...settings.pinnedWidgets, widgetId];
      await this.updateSettings(userId, orgId, { pinnedWidgets });
    }
  }
  
  private mapSettings(row: any): UserSettings {
    return {
      id: row.id,
      userId: row.user_id,
      orgId: row.org_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      timezone: row.timezone,
      locale: row.locale,
      dateFormat: row.date_format,
      theme: row.theme,
      defaultDashboardView: row.default_dashboard_view,
      defaultDateRange: row.default_date_range,
      pinnedWidgets: row.pinned_widgets,
      collapsedSections: row.collapsed_sections,
      sidebarCollapsed: row.sidebar_collapsed,
      recentPages: row.recent_pages,
      favoritePages: row.favorite_pages,
      tablePreferences: row.table_preferences,
      chartPreferences: row.chart_preferences,
      shortcutsEnabled: row.shortcuts_enabled,
      customShortcuts: row.custom_shortcuts,
      reduceMotion: row.reduce_motion,
      highContrast: row.high_contrast,
      fontSize: row.font_size,
      updatedAt: row.updated_at
    };
  }
  
  private mapToDb(updates: UserSettingsUpdate): Record<string, any> {
    const mapping: Record<string, string> = {
      displayName: 'display_name',
      avatarUrl: 'avatar_url',
      timezone: 'timezone',
      locale: 'locale',
      dateFormat: 'date_format',
      theme: 'theme',
      defaultDashboardView: 'default_dashboard_view',
      defaultDateRange: 'default_date_range',
      pinnedWidgets: 'pinned_widgets',
      sidebarCollapsed: 'sidebar_collapsed',
      tablePreferences: 'table_preferences',
      chartPreferences: 'chart_preferences',
      shortcutsEnabled: 'shortcuts_enabled',
      reduceMotion: 'reduce_motion',
      highContrast: 'high_contrast',
      fontSize: 'font_size'
    };
    
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (mapping[key]) {
        result[mapping[key]] = value;
      }
    }
    
    return result;
  }
}

interface ResolvedUserSettings {
  timezone: string;
  locale: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  defaultDashboardView: string;
  defaultDateRange: string;
  pinnedWidgets: string[];
  tablePreferences: Record<string, TablePreference>;
  chartPreferences: Record<string, ChartPreference>;
  shortcutsEnabled: boolean;
  customShortcuts: Record<string, string>;
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}
```

---

## 7. Security Settings Service

```typescript
// lib/services/SecuritySettingsService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { authenticator } from 'otplib';

export class SecuritySettingsService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  
  // ========================================
  // TWO-FACTOR AUTHENTICATION
  // ========================================
  
  /**
   * Enable 2FA setup - generate secret
   */
  async initiate2FASetup(userId: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  }> {
    const secret = authenticator.generateSecret();
    
    const { data: user } = await this.supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    
    const qrCodeUrl = authenticator.keyuri(
      user?.email || 'user',
      'TokenTra',
      secret
    );
    
    const backupCodes = this.generateBackupCodes(10);
    
    await this.supabase
      .from('user_2fa_pending')
      .upsert({
        user_id: userId,
        secret_encrypted: await this.encrypt(secret),
        backup_codes_hash: backupCodes.map(c => this.hashCode(c)),
        created_at: new Date().toISOString()
      });
    
    return { secret, qrCodeUrl, backupCodes };
  }
  
  /**
   * Verify and enable 2FA
   */
  async verify2FASetup(userId: string, code: string): Promise<boolean> {
    const { data: pending } = await this.supabase
      .from('user_2fa_pending')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!pending) {
      throw new Error('No pending 2FA setup found');
    }
    
    const secret = await this.decrypt(pending.secret_encrypted);
    const isValid = authenticator.verify({ token: code, secret });
    
    if (!isValid) {
      return false;
    }
    
    await this.supabase
      .from('user_security')
      .upsert({
        user_id: userId,
        two_fa_enabled: true,
        two_fa_secret_encrypted: pending.secret_encrypted,
        two_fa_backup_codes: pending.backup_codes_hash,
        two_fa_enabled_at: new Date().toISOString()
      });
    
    await this.supabase
      .from('user_2fa_pending')
      .delete()
      .eq('user_id', userId);
    
    return true;
  }
  
  /**
   * Verify 2FA code during login
   */
  async verify2FACode(userId: string, code: string): Promise<boolean> {
    const { data: security } = await this.supabase
      .from('user_security')
      .select('two_fa_secret_encrypted, two_fa_backup_codes')
      .eq('user_id', userId)
      .single();
    
    if (!security?.two_fa_secret_encrypted) {
      return false;
    }
    
    const secret = await this.decrypt(security.two_fa_secret_encrypted);
    if (authenticator.verify({ token: code, secret })) {
      return true;
    }
    
    const codeHash = this.hashCode(code);
    if (security.two_fa_backup_codes?.includes(codeHash)) {
      const remainingCodes = security.two_fa_backup_codes.filter(
        (c: string) => c !== codeHash
      );
      
      await this.supabase
        .from('user_security')
        .update({ two_fa_backup_codes: remainingCodes })
        .eq('user_id', userId);
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, password: string): Promise<void> {
    const passwordValid = await this.verifyPassword(userId, password);
    if (!passwordValid) {
      throw new Error('Invalid password');
    }
    
    await this.supabase
      .from('user_security')
      .update({
        two_fa_enabled: false,
        two_fa_secret_encrypted: null,
        two_fa_backup_codes: null,
        two_fa_disabled_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }
  
  // ========================================
  // SESSIONS
  // ========================================
  
  /**
   * Get active sessions
   */
  async getActiveSessions(userId: string): Promise<Session[]> {
    const { data } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('revoked', false)
      .order('last_active_at', { ascending: false });
    
    return data?.map(this.mapSession) || [];
  }
  
  /**
   * Revoke a session
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await this.supabase
      .from('user_sessions')
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', userId);
  }
  
  /**
   * Revoke all sessions except current
   */
  async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    await this.supabase
      .from('user_sessions')
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .neq('id', currentSessionId)
      .eq('revoked', false);
  }
  
  // ========================================
  // PASSWORD
  // ========================================
  
  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const passwordValid = await this.verifyPassword(userId, currentPassword);
    if (!passwordValid) {
      throw new Error('Current password is incorrect');
    }
    
    const { data: member } = await this.supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', userId)
      .single();
    
    if (member) {
      const policy = await this.getPasswordPolicy(member.org_id);
      this.validatePassword(newPassword, policy);
    }
    
    const { error } = await this.supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    
    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
    
    await this.supabase
      .from('user_security')
      .upsert({
        user_id: userId,
        password_changed_at: new Date().toISOString()
      });
  }
  
  /**
   * Get password policy for organization
   */
  async getPasswordPolicy(orgId: string): Promise<PasswordPolicy> {
    const { data } = await this.supabase
      .from('organization_settings')
      .select(`
        password_min_length,
        password_require_special,
        password_require_numbers,
        password_expire_days
      `)
      .eq('org_id', orgId)
      .single();
    
    return {
      minLength: data?.password_min_length || 12,
      requireSpecial: data?.password_require_special ?? true,
      requireNumbers: data?.password_require_numbers ?? true,
      expireDays: data?.password_expire_days
    };
  }
  
  /**
   * Validate password against policy
   */
  validatePassword(password: string, policy: PasswordPolicy): void {
    if (password.length < policy.minLength) {
      throw new Error(`Password must be at least ${policy.minLength} characters`);
    }
    
    if (policy.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
    
    if (policy.requireNumbers && !/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
  }
  
  // ========================================
  // LOGIN HISTORY
  // ========================================
  
  /**
   * Get login history
   */
  async getLoginHistory(userId: string, limit: number = 20): Promise<LoginEvent[]> {
    const { data } = await this.supabase
      .from('login_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return data?.map(this.mapLoginEvent) || [];
  }
  
  /**
   * Record login event
   */
  async recordLoginEvent(
    userId: string,
    event: {
      success: boolean;
      ipAddress: string;
      userAgent: string;
      method: 'password' | 'oauth' | 'magic_link' | 'api_key';
      failureReason?: string;
    }
  ): Promise<void> {
    const deviceInfo = this.parseUserAgent(event.userAgent);
    
    await this.supabase.from('login_events').insert({
      user_id: userId,
      success: event.success,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      method: event.method,
      failure_reason: event.failureReason,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os
    });
  }
  
  // ========================================
  // HELPERS
  // ========================================
  
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }
  
  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }
  
  private async encrypt(text: string): Promise<string> {
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }
  
  private async decrypt(encryptedData: string): Promise<string> {
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const [ivHex, tagHex, encrypted] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  private async verifyPassword(userId: string, password: string): Promise<boolean> {
    // Implementation depends on auth setup
    return true;
  }
  
  private parseUserAgent(ua: string): { device: string; browser: string; os: string } {
    let device = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown';
    
    if (ua.includes('Mobile')) device = 'Mobile';
    else if (ua.includes('Tablet')) device = 'Tablet';
    
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';
    
    return { device, browser, os };
  }
  
  private mapSession(row: any): Session {
    return {
      id: row.id,
      device: row.device,
      browser: row.browser,
      os: row.os,
      ipAddress: row.ip_address,
      location: row.location,
      lastActiveAt: row.last_active_at,
      createdAt: row.created_at,
      isCurrent: row.is_current
    };
  }
  
  private mapLoginEvent(row: any): LoginEvent {
    return {
      id: row.id,
      success: row.success,
      method: row.method,
      ipAddress: row.ip_address,
      device: row.device,
      browser: row.browser,
      os: row.os,
      location: row.location,
      failureReason: row.failure_reason,
      createdAt: row.created_at
    };
  }
}

interface PasswordPolicy {
  minLength: number;
  requireSpecial: boolean;
  requireNumbers: boolean;
  expireDays?: number;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

interface LoginEvent {
  id: string;
  success: boolean;
  method: string;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  failureReason?: string;
  createdAt: string;
}
```

---

## 8. Billing Settings Service

```typescript
// lib/services/BillingSettingsService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class BillingSettingsService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  
  /**
   * Get billing settings
   */
  async getBillingSettings(orgId: string): Promise<BillingSettings> {
    const { data, error } = await this.supabase
      .from('billing_settings')
      .select('*')
      .eq('org_id', orgId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get billing settings: ${error.message}`);
    }
    
    return data ? this.mapBillingSettings(data) : this.getDefaults(orgId);
  }
  
  getDefaults(orgId: string): BillingSettings {
    return {
      id: '',
      orgId,
      plan: 'free',
      planStartedAt: new Date().toISOString(),
      usageBasedPricing: false,
      usageRatePercent: 0.5,
      minimumMonthlyFee: 99,
      aiSpendLimit: PLAN_LIMITS.free.aiSpendLimit,
      seatsLimit: PLAN_LIMITS.free.seatsLimit,
      providersLimit: PLAN_LIMITS.free.providersLimit,
      autoCharge: true,
      invoiceDueDays: 30,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Create Stripe checkout session for plan upgrade
   */
  async createCheckoutSession(
    orgId: string,
    plan: PlanType,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string }> {
    const settings = await this.getBillingSettings(orgId);
    
    let customerId = settings.stripeCustomerId;
    
    if (!customerId) {
      const { data: org } = await this.supabase
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .single();
      
      const customer = await stripe.customers.create({
        name: org?.name,
        metadata: { orgId }
      });
      
      customerId = customer.id;
      
      await this.supabase
        .from('billing_settings')
        .upsert({
          org_id: orgId,
          stripe_customer_id: customerId
        });
    }
    
    const priceId = this.getPriceId(plan);
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orgId, plan }
    });
    
    return { url: session.url! };
  }
  
  /**
   * Handle successful subscription
   */
  async handleSubscriptionCreated(
    orgId: string,
    subscription: Stripe.Subscription
  ): Promise<void> {
    const plan = subscription.metadata.plan as PlanType;
    const limits = PLAN_LIMITS[plan];
    
    await this.supabase
      .from('billing_settings')
      .upsert({
        org_id: orgId,
        plan,
        plan_started_at: new Date(subscription.start_date * 1000).toISOString(),
        plan_expires_at: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        ai_spend_limit: limits.aiSpendLimit,
        seats_limit: limits.seatsLimit,
        providers_limit: limits.providersLimit,
        updated_at: new Date().toISOString()
      });
  }
  
  /**
   * Get payment methods
   */
  async getPaymentMethods(orgId: string): Promise<PaymentMethod[]> {
    const settings = await this.getBillingSettings(orgId);
    
    if (!settings.stripeCustomerId) {
      return [];
    }
    
    const methods = await stripe.paymentMethods.list({
      customer: settings.stripeCustomerId,
      type: 'card'
    });
    
    return methods.data.map(m => ({
      id: m.id,
      brand: m.card?.brand || 'unknown',
      last4: m.card?.last4 || '****',
      expMonth: m.card?.exp_month || 0,
      expYear: m.card?.exp_year || 0,
      isDefault: m.id === settings.defaultPaymentMethodId
    }));
  }
  
  /**
   * Get invoices
   */
  async getInvoices(orgId: string, limit: number = 10): Promise<Invoice[]> {
    const settings = await this.getBillingSettings(orgId);
    
    if (!settings.stripeCustomerId) {
      return [];
    }
    
    const invoices = await stripe.invoices.list({
      customer: settings.stripeCustomerId,
      limit
    });
    
    return invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      status: inv.status as InvoiceStatus,
      amount: inv.amount_due / 100,
      currency: inv.currency.toUpperCase(),
      periodStart: new Date(inv.period_start * 1000).toISOString(),
      periodEnd: new Date(inv.period_end * 1000).toISOString(),
      dueDate: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
      pdfUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url
    }));
  }
  
  /**
   * Get current usage against limits
   */
  async getUsage(orgId: string): Promise<UsageMetrics> {
    const settings = await this.getBillingSettings(orgId);
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data: spendData } = await this.supabase
      .from('usage_records')
      .select('cost')
      .eq('org_id', orgId)
      .gte('timestamp', monthStart.toISOString());
    
    const currentSpend = spendData?.reduce((sum, r) => sum + (r.cost || 0), 0) || 0;
    
    const { count: seatCount } = await this.supabase
      .from('org_members')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);
    
    const { count: providerCount } = await this.supabase
      .from('provider_connections')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);
    
    return {
      aiSpend: {
        current: currentSpend,
        limit: settings.aiSpendLimit || Infinity,
        percentage: settings.aiSpendLimit 
          ? (currentSpend / settings.aiSpendLimit) * 100 
          : 0
      },
      seats: {
        current: seatCount || 0,
        limit: settings.seatsLimit || Infinity,
        percentage: settings.seatsLimit 
          ? ((seatCount || 0) / settings.seatsLimit) * 100 
          : 0
      },
      providers: {
        current: providerCount || 0,
        limit: settings.providersLimit || Infinity,
        percentage: settings.providersLimit 
          ? ((providerCount || 0) / settings.providersLimit) * 100 
          : 0
      }
    };
  }
  
  private getPriceId(plan: PlanType): string {
    const priceIds: Record<PlanType, string> = {
      free: '',
      starter: process.env.STRIPE_PRICE_STARTER!,
      pro: process.env.STRIPE_PRICE_PRO!,
      business: process.env.STRIPE_PRICE_BUSINESS!,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE!
    };
    return priceIds[plan];
  }
  
  private mapBillingSettings(row: any): BillingSettings {
    return {
      id: row.id,
      orgId: row.org_id,
      plan: row.plan,
      planStartedAt: row.plan_started_at,
      planExpiresAt: row.plan_expires_at,
      trialEndsAt: row.trial_ends_at,
      billingEmail: row.billing_email,
      billingName: row.billing_name,
      billingAddress: row.billing_address,
      stripeCustomerId: row.stripe_customer_id,
      defaultPaymentMethodId: row.default_payment_method_id,
      invoicePrefix: row.invoice_prefix,
      taxId: row.tax_id,
      taxIdType: row.tax_id_type,
      usageBasedPricing: row.usage_based_pricing,
      usageRatePercent: row.usage_rate_percent,
      minimumMonthlyFee: row.minimum_monthly_fee,
      aiSpendLimit: row.ai_spend_limit,
      seatsLimit: row.seats_limit,
      providersLimit: row.providers_limit,
      autoCharge: row.auto_charge,
      invoiceDueDays: row.invoice_due_days,
      updatedAt: row.updated_at
    };
  }
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';

interface Invoice {
  id: string;
  number?: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  dueDate?: string;
  pdfUrl?: string;
  hostedUrl?: string;
}

interface UsageMetrics {
  aiSpend: { current: number; limit: number; percentage: number };
  seats: { current: number; limit: number; percentage: number };
  providers: { current: number; limit: number; percentage: number };
}
```

---

## 9. Integration Settings Service

```typescript
// lib/services/IntegrationSettingsService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export class IntegrationSettingsService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  
  /**
   * List all integrations for an organization
   */
  async listIntegrations(orgId: string): Promise<IntegrationSettings[]> {
    const { data, error } = await this.supabase
      .from('integration_settings')
      .select('*')
      .eq('org_id', orgId)
      .order('integration_type');
    
    if (error) {
      throw new Error(`Failed to list integrations: ${error.message}`);
    }
    
    return data.map(this.mapIntegration);
  }
  
  /**
   * Get integration by type
   */
  async getIntegration(
    orgId: string,
    integrationType: IntegrationType
  ): Promise<IntegrationSettings | null> {
    const { data, error } = await this.supabase
      .from('integration_settings')
      .select('*')
      .eq('org_id', orgId)
      .eq('integration_type', integrationType)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get integration: ${error.message}`);
    }
    
    return data ? this.mapIntegration(data) : null;
  }
  
  /**
   * Initialize Slack OAuth
   */
  async initSlackOAuth(orgId: string): Promise<{ url: string }> {
    const state = crypto.randomUUID();
    
    await this.supabase.from('oauth_states').insert({
      state,
      org_id: orgId,
      provider: 'slack',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });
    
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      scope: 'channels:read,chat:write,users:read',
      redirect_uri: `${process.env.APP_URL}/api/integrations/slack/callback`,
      state
    });
    
    return {
      url: `https://slack.com/oauth/v2/authorize?${params}`
    };
  }
  
  /**
   * Complete Slack OAuth
   */
  async completeSlackOAuth(code: string, state: string): Promise<IntegrationSettings> {
    const { data: stateData } = await this.supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'slack')
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (!stateData) {
      throw new Error('Invalid or expired OAuth state');
    }
    
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.APP_URL}/api/integrations/slack/callback`
      })
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Slack OAuth failed: ${data.error}`);
    }
    
    const integration = await this.saveIntegration(stateData.org_id, {
      integrationType: 'slack',
      name: data.team.name,
      config: {
        teamId: data.team.id,
        teamName: data.team.name,
        botUserId: data.bot_user_id,
        accessToken: data.access_token
      },
      enabled: true,
      status: 'active'
    });
    
    await this.supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);
    
    return integration;
  }
  
  /**
   * Create webhook
   */
  async createWebhook(
    orgId: string,
    webhook: Omit<Webhook, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>
  ): Promise<Webhook> {
    try {
      new URL(webhook.url);
    } catch {
      throw new Error('Invalid webhook URL');
    }
    
    const secret = crypto.randomBytes(32).toString('hex');
    
    const { data, error } = await this.supabase
      .from('webhooks')
      .insert({
        org_id: orgId,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        secret,
        custom_headers: webhook.customHeaders || {},
        retry_count: webhook.retryCount || 3,
        retry_delay_seconds: webhook.retryDelaySeconds || 60,
        enabled: webhook.enabled ?? true
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create webhook: ${error.message}`);
    }
    
    return this.mapWebhook(data);
  }
  
  /**
   * Test webhook
   */
  async testWebhook(webhookId: string): Promise<{ 
    success: boolean; 
    statusCode?: number; 
    error?: string 
  }> {
    const { data: webhook } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();
    
    if (!webhook) {
      throw new Error('Webhook not found');
    }
    
    try {
      const payload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: { message: 'This is a test webhook' }
      };
      
      const signature = this.signPayload(JSON.stringify(payload), webhook.secret);
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TokenTra-Signature': signature,
          ...webhook.custom_headers
        },
        body: JSON.stringify(payload)
      });
      
      return {
        success: response.ok,
        statusCode: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
  
  /**
   * Save/update integration
   */
  private async saveIntegration(
    orgId: string,
    integration: {
      integrationType: IntegrationType;
      name: string;
      config: Record<string, any>;
      enabled: boolean;
      status: string;
    }
  ): Promise<IntegrationSettings> {
    const { data, error } = await this.supabase
      .from('integration_settings')
      .upsert({
        org_id: orgId,
        integration_type: integration.integrationType,
        name: integration.name,
        config: integration.config,
        enabled: integration.enabled,
        status: integration.status,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'org_id,integration_type,name'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to save integration: ${error.message}`);
    }
    
    return this.mapIntegration(data);
  }
  
  /**
   * Toggle integration
   */
  async toggleIntegration(
    orgId: string,
    integrationId: string,
    enabled: boolean
  ): Promise<void> {
    await this.supabase
      .from('integration_settings')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('id', integrationId)
      .eq('org_id', orgId);
  }
  
  /**
   * Delete integration
   */
  async deleteIntegration(orgId: string, integrationId: string): Promise<void> {
    await this.supabase
      .from('integration_settings')
      .delete()
      .eq('id', integrationId)
      .eq('org_id', orgId);
  }
  
  private signPayload(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }
  
  private mapIntegration(row: any): IntegrationSettings {
    return {
      id: row.id,
      orgId: row.org_id,
      integrationType: row.integration_type,
      name: row.name,
      config: row.config,
      enabled: row.enabled,
      status: row.status,
      lastUsedAt: row.last_used_at,
      errorMessage: row.error_message,
      connectedBy: row.connected_by,
      connectedAt: row.connected_at,
      updatedAt: row.updated_at
    };
  }
  
  private mapWebhook(row: any): Webhook {
    return {
      id: row.id,
      orgId: row.org_id,
      name: row.name,
      url: row.url,
      events: row.events,
      secret: row.secret,
      customHeaders: row.custom_headers,
      retryCount: row.retry_count,
      retryDelaySeconds: row.retry_delay_seconds,
      enabled: row.enabled,
      status: row.status,
      lastTriggeredAt: row.last_triggered_at,
      lastStatusCode: row.last_status_code,
      failureCount: row.failure_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
```

---

## 10. Feature Flags Service

```typescript
// lib/services/FeatureFlagService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';
import crypto from 'crypto';

export class FeatureFlagService {
  private supabase: SupabaseClient;
  private redis: Redis;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  /**
   * Check if feature is enabled for context
   */
  async isEnabled(
    key: string,
    context: { orgId?: string; userId?: string } = {}
  ): Promise<boolean> {
    const cacheKey = `feature:${key}:${context.orgId || 'platform'}:${context.userId || 'none'}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached !== null) {
      return cached === 'true';
    }
    
    // Check user-level flag first
    if (context.userId) {
      const userFlag = await this.getFlag(key, 'user', context.userId);
      if (userFlag) {
        const result = this.evaluateFlag(userFlag, context.userId);
        await this.redis.setex(cacheKey, 60, result.toString());
        return result;
      }
    }
    
    // Then org-level
    if (context.orgId) {
      const orgFlag = await this.getFlag(key, 'org', context.orgId);
      if (orgFlag) {
        const result = this.evaluateFlag(orgFlag, context.userId || context.orgId);
        await this.redis.setex(cacheKey, 60, result.toString());
        return result;
      }
    }
    
    // Finally platform-level
    const platformFlag = await this.getFlag(key, 'platform');
    if (platformFlag) {
      const result = this.evaluateFlag(platformFlag, context.userId || context.orgId || 'default');
      await this.redis.setex(cacheKey, 60, result.toString());
      return result;
    }
    
    await this.redis.setex(cacheKey, 60, 'false');
    return false;
  }
  
  /**
   * Get all enabled features for context
   */
  async getEnabledFeatures(
    context: { orgId?: string; userId?: string } = {}
  ): Promise<string[]> {
    const flags = await this.getAllFlags(context);
    
    return flags
      .filter(flag => this.evaluateFlag(flag, context.userId || context.orgId || 'default'))
      .map(flag => flag.key);
  }
  
  /**
   * Create or update a feature flag
   */
  async upsertFlag(flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeatureFlag> {
    const { data, error } = await this.supabase
      .from('feature_flags')
      .upsert({
        key: flag.key,
        name: flag.name,
        description: flag.description,
        scope: flag.scope,
        target_id: flag.targetId,
        enabled: flag.enabled,
        value: flag.value,
        rollout_percentage: flag.rolloutPercentage,
        category: flag.category,
        tags: flag.tags,
        starts_at: flag.startsAt,
        expires_at: flag.expiresAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key,scope,target_id'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to upsert flag: ${error.message}`);
    }
    
    await this.invalidateCache(flag.key);
    
    return this.mapFlag(data);
  }
  
  /**
   * Toggle flag
   */
  async toggleFlag(
    key: string,
    scope: 'platform' | 'org' | 'user',
    targetId?: string
  ): Promise<boolean> {
    const flag = await this.getFlag(key, scope, targetId);
    
    if (!flag) {
      throw new Error('Flag not found');
    }
    
    const newEnabled = !flag.enabled;
    
    await this.supabase
      .from('feature_flags')
      .update({ enabled: newEnabled, updated_at: new Date().toISOString() })
      .eq('id', flag.id);
    
    await this.invalidateCache(key);
    
    return newEnabled;
  }
  
  private async getFlag(
    key: string,
    scope: 'platform' | 'org' | 'user',
    targetId?: string
  ): Promise<FeatureFlag | null> {
    let query = this.supabase
      .from('feature_flags')
      .select('*')
      .eq('key', key)
      .eq('scope', scope);
    
    if (targetId) {
      query = query.eq('target_id', targetId);
    } else {
      query = query.is('target_id', null);
    }
    
    const { data } = await query.single();
    
    return data ? this.mapFlag(data) : null;
  }
  
  private async getAllFlags(
    context: { orgId?: string; userId?: string }
  ): Promise<FeatureFlag[]> {
    const flags: FeatureFlag[] = [];
    const seenKeys = new Set<string>();
    
    if (context.userId) {
      const userFlags = await this.listFlags({ scope: 'user', targetId: context.userId });
      for (const flag of userFlags) {
        flags.push(flag);
        seenKeys.add(flag.key);
      }
    }
    
    if (context.orgId) {
      const orgFlags = await this.listFlags({ scope: 'org', targetId: context.orgId });
      for (const flag of orgFlags) {
        if (!seenKeys.has(flag.key)) {
          flags.push(flag);
          seenKeys.add(flag.key);
        }
      }
    }
    
    const platformFlags = await this.listFlags({ scope: 'platform' });
    for (const flag of platformFlags) {
      if (!seenKeys.has(flag.key)) {
        flags.push(flag);
      }
    }
    
    return flags;
  }
  
  async listFlags(options?: {
    scope?: 'platform' | 'org' | 'user';
    targetId?: string;
  }): Promise<FeatureFlag[]> {
    let query = this.supabase
      .from('feature_flags')
      .select('*')
      .order('key');
    
    if (options?.scope) {
      query = query.eq('scope', options.scope);
    }
    if (options?.targetId) {
      query = query.eq('target_id', options.targetId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to list flags: ${error.message}`);
    }
    
    return data.map(this.mapFlag);
  }
  
  private evaluateFlag(flag: FeatureFlag, identifier: string): boolean {
    if (!flag.enabled) {
      return false;
    }
    
    const now = new Date();
    if (flag.startsAt && new Date(flag.startsAt) > now) {
      return false;
    }
    if (flag.expiresAt && new Date(flag.expiresAt) < now) {
      return false;
    }
    
    if (flag.rolloutPercentage < 100) {
      const hash = crypto
        .createHash('md5')
        .update(`${flag.key}:${identifier}`)
        .digest('hex');
      
      const hashInt = parseInt(hash.substring(0, 8), 16);
      const bucket = hashInt % 100;
      
      if (bucket >= flag.rolloutPercentage) {
        return false;
      }
    }
    
    return true;
  }
  
  private async invalidateCache(key: string): Promise<void> {
    const pattern = `feature:${key}:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  
  private mapFlag(row: any): FeatureFlag {
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
      scope: row.scope,
      targetId: row.target_id,
      enabled: row.enabled,
      value: row.value,
      rolloutPercentage: row.rollout_percentage,
      category: row.category,
      tags: row.tags,
      startsAt: row.starts_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

// Feature flag definitions
export const FEATURE_FLAGS = {
  OPTIMIZATION_ENGINE: 'optimization_engine',
  SMART_ROUTING: 'smart_routing',
  SEMANTIC_CACHING: 'semantic_caching',
  ANOMALY_DETECTION: 'anomaly_detection',
  SSO: 'sso',
  AUDIT_LOGS: 'audit_logs',
  API_ACCESS: 'api_access',
  AI_INSIGHTS: 'ai_insights',
  COST_PREDICTIONS: 'cost_predictions',
  NEW_DASHBOARD: 'new_dashboard'
} as const;
```

---

## 11. API Keys Service

```typescript
// lib/services/ApiKeyService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export class ApiKeyService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  
  /**
   * Create a new API key
   */
  async createApiKey(
    orgId: string,
    userId: string | null,
    request: CreateApiKeyRequest
  ): Promise<ApiKeyCreatedResponse> {
    // Generate key: tt_live_xxxxxxxxxxxxxxxxxxxx
    const prefix = 'tt_live_';
    const randomPart = crypto.randomBytes(24).toString('base64url');
    const secretKey = `${prefix}${randomPart}`;
    
    // Store only hash
    const keyHash = crypto.createHash('sha256').update(secretKey).digest('hex');
    const keyPrefix = secretKey.substring(0, 12);
    
    const { data, error } = await this.supabase
      .from('api_keys')
      .insert({
        org_id: orgId,
        user_id: userId,
        name: request.name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes: request.scopes,
        allowed_ips: request.allowedIps || [],
        rate_limit_per_minute: request.rateLimitPerMinute || 60,
        rate_limit_per_day: request.rateLimitPerDay || 10000,
        expires_at: request.expiresAt
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }
    
    return {
      apiKey: this.mapApiKey(data),
      secretKey // Only returned once!
    };
  }
  
  /**
   * List API keys for an organization
   */
  async listApiKeys(orgId: string, userId?: string): Promise<ApiKey[]> {
    let query = this.supabase
      .from('api_keys')
      .select('*')
      .eq('org_id', orgId)
      .eq('revoked', false)
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to list API keys: ${error.message}`);
    }
    
    return data.map(this.mapApiKey);
  }
  
  /**
   * Validate an API key
   */
  async validateApiKey(key: string): Promise<{
    valid: boolean;
    apiKey?: ApiKey;
    error?: string;
  }> {
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    
    const { data } = await this.supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .eq('revoked', false)
      .single();
    
    if (!data) {
      return { valid: false, error: 'Invalid API key' };
    }
    
    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'API key expired' };
    }
    
    // Update last used
    await this.supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: data.usage_count + 1
      })
      .eq('id', data.id);
    
    return {
      valid: true,
      apiKey: this.mapApiKey(data)
    };
  }
  
  /**
   * Revoke an API key
   */
  async revokeApiKey(
    orgId: string,
    keyId: string,
    revokedBy: string,
    reason?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('api_keys')
      .update({
        revoked: true,
        revoked_at: new Date().toISOString(),
        revoked_by: revokedBy,
        revoke_reason: reason
      })
      .eq('id', keyId)
      .eq('org_id', orgId);
    
    if (error) {
      throw new Error(`Failed to revoke API key: ${error.message}`);
    }
  }
  
  /**
   * Check rate limit for an API key
   */
  async checkRateLimit(apiKey: ApiKey): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: string;
  }> {
    // Implementation would use Redis for rate limiting
    return {
      allowed: true,
      remaining: apiKey.rateLimitPerMinute,
      resetAt: new Date(Date.now() + 60000).toISOString()
    };
  }
  
  private mapApiKey(row: any): ApiKey {
    return {
      id: row.id,
      orgId: row.org_id,
      userId: row.user_id,
      name: row.name,
      keyPrefix: row.key_prefix,
      scopes: row.scopes,
      allowedIps: row.allowed_ips,
      rateLimitPerMinute: row.rate_limit_per_minute,
      rateLimitPerDay: row.rate_limit_per_day,
      expiresAt: row.expires_at,
      lastUsedAt: row.last_used_at,
      lastUsedIp: row.last_used_ip,
      usageCount: row.usage_count,
      revoked: row.revoked,
      revokedAt: row.revoked_at,
      createdAt: row.created_at
    };
  }
}
```

---

## 12. Unified Settings Service

```typescript
// lib/services/SettingsService.ts

import { OrganizationSettingsService } from './OrganizationSettingsService';
import { UserSettingsService } from './UserSettingsService';
import { SecuritySettingsService } from './SecuritySettingsService';
import { BillingSettingsService } from './BillingSettingsService';
import { IntegrationSettingsService } from './IntegrationSettingsService';
import { FeatureFlagService, FEATURE_FLAGS } from './FeatureFlagService';
import { ApiKeyService } from './ApiKeyService';

/**
 * Unified settings service that provides access to all settings
 */
export class SettingsService {
  readonly organization: OrganizationSettingsService;
  readonly user: UserSettingsService;
  readonly security: SecuritySettingsService;
  readonly billing: BillingSettingsService;
  readonly integrations: IntegrationSettingsService;
  readonly features: FeatureFlagService;
  readonly apiKeys: ApiKeyService;
  
  constructor() {
    this.organization = new OrganizationSettingsService();
    this.user = new UserSettingsService();
    this.security = new SecuritySettingsService();
    this.billing = new BillingSettingsService();
    this.integrations = new IntegrationSettingsService();
    this.features = new FeatureFlagService();
    this.apiKeys = new ApiKeyService();
  }
  
  /**
   * Get all settings for a user in an organization
   */
  async getAllSettings(
    userId: string,
    orgId: string
  ): Promise<ResolvedSettings> {
    const [
      orgSettings,
      userSettings,
      billingSettings,
      enabledFeatures
    ] = await Promise.all([
      this.organization.getSettings(orgId),
      this.user.getSettings(userId, orgId),
      this.billing.getBillingSettings(orgId),
      this.features.getEnabledFeatures({ orgId, userId })
    ]);
    
    const features: Record<string, boolean> = {};
    for (const feature of enabledFeatures) {
      features[feature] = true;
    }
    
    return {
      org: orgSettings,
      user: userSettings,
      billing: billingSettings,
      features,
      limits: PLAN_LIMITS[billingSettings.plan]
    };
  }
  
  /**
   * Check if user has access to a feature
   */
  async hasFeature(
    userId: string,
    orgId: string,
    feature: string
  ): Promise<boolean> {
    const billingSettings = await this.billing.getBillingSettings(orgId);
    const planFeatures = PLAN_LIMITS[billingSettings.plan].features;
    
    if (planFeatures.includes('all') || planFeatures.includes(feature)) {
      const orgSettings = await this.organization.getSettings(orgId);
      if (orgSettings.featuresEnabled[feature] === false) {
        return false;
      }
      return true;
    }
    
    return this.features.isEnabled(feature, { orgId, userId });
  }
  
  /**
   * Get resolved setting value with inheritance
   */
  async getSettingValue<T>(
    userId: string,
    orgId: string,
    key: string,
    defaultValue: T
  ): Promise<T> {
    const [orgSettings, userSettings] = await Promise.all([
      this.organization.getSettings(orgId),
      this.user.getSettings(userId, orgId)
    ]);
    
    const locked = this.organization.isSettingLocked(orgSettings, key);
    if (locked) {
      return locked.value as T;
    }
    
    const userValue = this.getNestedValue(userSettings, key);
    if (userValue !== undefined) {
      return userValue as T;
    }
    
    const orgValue = this.getNestedValue(orgSettings, key);
    if (orgValue !== undefined) {
      return orgValue as T;
    }
    
    return defaultValue;
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
```

---

## 13. API Routes

```typescript
// app/api/settings/organization/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { settingsService } from '@/lib/services/SettingsService';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const orgId = request.nextUrl.searchParams.get('orgId');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    const settings = await settingsService.organization.getSettings(orgId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { orgId, ...updates } = body;
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    const { data: member } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .single();
    
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const settings = await settingsService.organization.updateSettings(orgId, updates, user.id);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

// app/api/settings/user/route.ts

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const orgId = request.nextUrl.searchParams.get('orgId');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    const settings = await settingsService.user.getSettings(user.id, orgId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { orgId, ...updates } = body;
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    const settings = await settingsService.user.updateSettings(user.id, orgId, updates);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

// app/api/settings/all/route.ts

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const orgId = request.nextUrl.searchParams.get('orgId');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    const settings = await settingsService.getAllSettings(user.id, orgId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching all settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// app/api/settings/api-keys/route.ts

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const orgId = request.nextUrl.searchParams.get('orgId');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    const apiKeys = await settingsService.apiKeys.listApiKeys(orgId);
    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { orgId, ...keyRequest } = body;
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }
    
    const result = await settingsService.apiKeys.createApiKey(orgId, user.id, keyRequest);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}
```

---

## 14. React Components

### 14.1 Settings Layout

```tsx
// components/settings/SettingsLayout.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2, User, Shield, CreditCard, Bell,
  Plug, Key, Database, Palette, Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNavigation = [
  { name: 'Organization', href: '/settings/organization', icon: Building2 },
  { name: 'Profile', href: '/settings/profile', icon: User },
  { name: 'Security', href: '/settings/security', icon: Shield },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell },
  { name: 'Integrations', href: '/settings/integrations', icon: Plug },
  { name: 'API Keys', href: '/settings/api-keys', icon: Key },
  { name: 'Data & Privacy', href: '/settings/data-privacy', icon: Database },
  { name: 'Appearance', href: '/settings/appearance', icon: Palette },
  { name: 'Shortcuts', href: '/settings/shortcuts', icon: Keyboard },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
        
        <nav className="px-3 pb-6">
          {settingsNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm transition-colors',
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### 14.2 Settings Section Component

```tsx
// components/settings/SettingsSection.tsx

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function SettingsSection({
  title,
  description,
  children,
  actions
}: SettingsSectionProps) {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
```

### 14.3 Setting Row Component

```tsx
// components/settings/SettingRow.tsx

import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  locked?: boolean;
  lockedReason?: string;
}

export function SettingRow({
  label,
  description,
  children,
  locked,
  lockedReason
}: SettingRowProps) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex-1 pr-8">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-900 dark:text-white">
            {label}
          </label>
          {locked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
        {locked && lockedReason && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            {lockedReason}
          </p>
        )}
      </div>
      <div className={cn(locked && 'opacity-50 pointer-events-none')}>
        {children}
      </div>
    </div>
  );
}
```

### 14.4 API Key Management Component

```tsx
// components/settings/ApiKeyManagement.tsx

'use client';

import { useState } from 'react';
import { Key, Copy, Trash2, Eye, EyeOff, Plus } from 'lucide-react';
import { useApiKeys } from '@/hooks/useApiKeys';
import { SettingsSection } from './SettingsSection';
import { formatDistanceToNow } from 'date-fns';

export function ApiKeyManagement() {
  const { apiKeys, isLoading, createKey, revokeKey } = useApiKeys();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  
  const handleCreate = async (data: CreateApiKeyRequest) => {
    const result = await createKey(data);
    setNewKeySecret(result.secretKey);
    setShowCreateModal(false);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <SettingsSection
      title="API Keys"
      description="Manage API keys for programmatic access to TokenTra"
      actions={
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Create Key
        </button>
      }
    >
      {/* New Key Display */}
      {newKeySecret && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            API key created successfully. Copy it now - it won't be shown again!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded font-mono text-sm">
              {newKeySecret}
            </code>
            <button
              onClick={() => copyToClipboard(newKeySecret)}
              className="p-2 text-green-700 hover:bg-green-100 dark:hover:bg-green-800 rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setNewKeySecret(null)}
            className="mt-2 text-sm text-green-700 dark:text-green-300 hover:underline"
          >
            I've copied the key
          </button>
        </div>
      )}
      
      {/* Key List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-8">
          <Key className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No API keys yet</p>
          <p className="text-sm text-gray-400">Create a key to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white dark:bg-gray-700 rounded">
                  <Key className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {key.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {key.keyPrefix}... · Created {formatDistanceToNow(new Date(key.createdAt))} ago
                  </p>
                  <div className="flex gap-2 mt-1">
                    {key.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm text-gray-500">
                  {key.lastUsedAt ? (
                    <>Last used {formatDistanceToNow(new Date(key.lastUsedAt))} ago</>
                  ) : (
                    <>Never used</>
                  )}
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsSection>
  );
}
```

---

## 15. React Hooks

```typescript
// hooks/useSettings.ts

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@/hooks/useOrganization';

export function useOrganizationSettings() {
  const { currentOrg } = useOrganization();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSettings = useCallback(async () => {
    if (!currentOrg?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/settings/organization?orgId=${currentOrg.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id]);
  
  const updateSettings = useCallback(async (updates: OrganizationSettingsUpdate) => {
    if (!currentOrg?.id) return;
    
    setIsSaving(true);
    setError(null);
    
    // Optimistic update
    if (settings) {
      setSettings({ ...settings, ...updates } as OrganizationSettings);
    }
    
    try {
      const response = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrg.id, ...updates })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      const data = await response.json();
      setSettings(data);
      return data;
    } catch (err) {
      await fetchSettings();
      setError((err as Error).message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [currentOrg?.id, settings, fetchSettings]);
  
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  return {
    settings,
    isLoading,
    isSaving,
    error,
    updateSettings,
    refreshSettings: fetchSettings
  };
}

export function useUserSettings() {
  const { currentOrg } = useOrganization();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSettings = useCallback(async () => {
    if (!currentOrg?.id) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/settings/user?orgId=${currentOrg.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id]);
  
  const updateSettings = useCallback(async (updates: UserSettingsUpdate) => {
    if (!currentOrg?.id) return;
    
    setIsSaving(true);
    
    // Optimistic update
    if (settings) {
      setSettings({ ...settings, ...updates } as UserSettings);
    }
    
    try {
      const response = await fetch('/api/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrg.id, ...updates })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      const data = await response.json();
      setSettings(data);
      return data;
    } catch (err) {
      await fetchSettings();
      setError((err as Error).message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [currentOrg?.id, settings, fetchSettings]);
  
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  return {
    settings,
    isLoading,
    isSaving,
    error,
    updateSettings,
    refreshSettings: fetchSettings
  };
}

export function useFeatureFlag(featureKey: string): {
  isEnabled: boolean;
  isLoading: boolean;
} {
  const { currentOrg } = useOrganization();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!currentOrg?.id) {
      setIsLoading(false);
      return;
    }
    
    fetch(`/api/features/${featureKey}?orgId=${currentOrg.id}`)
      .then(res => res.json())
      .then(data => {
        setIsEnabled(data.enabled);
        setIsLoading(false);
      })
      .catch(() => {
        setIsEnabled(false);
        setIsLoading(false);
      });
  }, [featureKey, currentOrg?.id]);
  
  return { isEnabled, isLoading };
}

export function useTheme() {
  const { settings, updateSettings } = useUserSettings();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const theme = settings?.theme || 'system';
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedTheme(theme);
    }
  }, [settings?.theme]);
  
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [resolvedTheme]);
  
  const setTheme = useCallback(async (theme: 'light' | 'dark' | 'system') => {
    await updateSettings({ theme });
  }, [updateSettings]);
  
  return {
    theme: settings?.theme || 'system',
    resolvedTheme,
    setTheme
  };
}

export function useApiKeys() {
  const { currentOrg } = useOrganization();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchKeys = useCallback(async () => {
    if (!currentOrg?.id) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/settings/api-keys?orgId=${currentOrg.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      
      const data = await response.json();
      setApiKeys(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id]);
  
  const createKey = useCallback(async (request: CreateApiKeyRequest): Promise<ApiKeyCreatedResponse> => {
    if (!currentOrg?.id) throw new Error('No organization');
    
    const response = await fetch('/api/settings/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: currentOrg.id, ...request })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create API key');
    }
    
    const result = await response.json();
    await fetchKeys();
    return result;
  }, [currentOrg?.id, fetchKeys]);
  
  const revokeKey = useCallback(async (keyId: string) => {
    if (!currentOrg?.id) return;
    
    await fetch(`/api/settings/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: currentOrg.id })
    });
    
    await fetchKeys();
  }, [currentOrg?.id, fetchKeys]);
  
  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);
  
  return {
    apiKeys,
    isLoading,
    error,
    createKey,
    revokeKey,
    refreshKeys: fetchKeys
  };
}
```

---

## 16. Audit Logging

```typescript
// lib/services/SettingsAuditService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface AuditLogEntry {
  orgId?: string;
  userId?: string;
  entityType: string;
  entityId: string;
  settingKey: string;
  oldValue?: any;
  newValue?: any;
  action: 'create' | 'update' | 'delete';
  ipAddress?: string;
  userAgent?: string;
}

export class SettingsAuditService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  
  /**
   * Log a settings change
   */
  async log(entry: AuditLogEntry): Promise<void> {
    await this.supabase.from('settings_audit_log').insert({
      org_id: entry.orgId,
      user_id: entry.userId,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      setting_key: entry.settingKey,
      old_value: entry.oldValue,
      new_value: entry.newValue,
      action: entry.action,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      created_at: new Date().toISOString()
    });
  }
  
  /**
   * Get audit log for an organization
   */
  async getAuditLog(
    orgId: string,
    options?: {
      entityType?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ entries: SettingsAuditEntry[]; total: number }> {
    let query = this.supabase
      .from('settings_audit_log')
      .select('*, users(email)', { count: 'exact' })
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    
    if (options?.entityType) {
      query = query.eq('entity_type', options.entityType);
    }
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }
    if (options?.startDate) {
      query = query.gte('created_at', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('created_at', options.endDate);
    }
    
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    query = query.range(offset, offset + limit - 1);
    
    const { data, count, error } = await query;
    
    if (error) {
      throw new Error(`Failed to get audit log: ${error.message}`);
    }
    
    return {
      entries: data?.map(this.mapEntry) || [],
      total: count || 0
    };
  }
  
  private mapEntry(row: any): SettingsAuditEntry {
    return {
      id: row.id,
      orgId: row.org_id,
      userId: row.user_id,
      userEmail: row.users?.email,
      entityType: row.entity_type,
      entityId: row.entity_id,
      settingKey: row.setting_key,
      oldValue: row.old_value,
      newValue: row.new_value,
      action: row.action,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      createdAt: row.created_at
    };
  }
}

interface SettingsAuditEntry {
  id: string;
  orgId?: string;
  userId?: string;
  userEmail?: string;
  entityType: string;
  entityId: string;
  settingKey: string;
  oldValue?: any;
  newValue?: any;
  action: 'create' | 'update' | 'delete';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
```

---

## 17. Integration Guide

### 17.1 Integration with Notification System

The Settings System integrates with the Notification System to respect user preferences:

```typescript
// When sending notifications, check user preferences
import { settingsService } from '@/lib/services/SettingsService';

async function sendNotification(userId: string, orgId: string, notification: Notification) {
  // Get user's notification preferences from Settings
  const userSettings = await settingsService.user.getSettings(userId, orgId);
  
  // Check if notifications are enabled for this category
  // (Notification preferences are managed by the Notification System)
  
  // Apply user's timezone for scheduling
  const timezone = userSettings.timezone || 
    (await settingsService.organization.getSettings(orgId)).timezone;
  
  // Use timezone for digest scheduling, DND calculations, etc.
}
```

### 17.2 Integration with Alerting Engine

```typescript
// Alerting Engine uses Settings for default channels
import { settingsService } from '@/lib/services/SettingsService';

async function createAlert(orgId: string, alert: AlertConfig) {
  const orgSettings = await settingsService.organization.getSettings(orgId);
  
  // Use default alert channels if not specified
  const channels = alert.channels || orgSettings.defaultAlertChannels;
  
  // Check feature flags for advanced alerting
  const hasAnomalyDetection = await settingsService.hasFeature(
    alert.createdBy,
    orgId,
    'anomaly_detection'
  );
}
```

### 17.3 Integration with Provider System

```typescript
// Provider System checks plan limits
import { settingsService } from '@/lib/services/SettingsService';

async function addProviderConnection(orgId: string, provider: ProviderConfig) {
  const billingSettings = await settingsService.billing.getBillingSettings(orgId);
  const usage = await settingsService.billing.getUsage(orgId);
  
  if (usage.providers.current >= (billingSettings.providersLimit || Infinity)) {
    throw new Error('Provider limit reached. Please upgrade your plan.');
  }
}
```

### 17.4 Settings Context Provider

```tsx
// providers/SettingsProvider.tsx

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAllSettings } from '@/hooks/useSettings';

interface SettingsContextType {
  settings: ResolvedSettings | null;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { settings, isLoading, error, refreshSettings } = useAllSettings();
  
  return (
    <SettingsContext.Provider value={{ settings, isLoading, error, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
```

---

## Summary

The TokenTra Settings System provides a comprehensive, enterprise-grade configuration management architecture:

| Component | Purpose |
|-----------|---------|
| **Organization Settings** | Global org config, security policies, defaults |
| **User Settings** | Personal preferences, UI customization |
| **Security Settings** | 2FA, sessions, password policies |
| **Billing Settings** | Plans, subscriptions, usage limits |
| **Integration Settings** | Slack, webhooks, SSO |
| **Feature Flags** | Gradual rollouts, beta features |
| **API Keys** | Programmatic access management |
| **Audit Logging** | Compliance and change tracking |

Key features:
- **Hierarchical inheritance**: Platform → Org → Team → User
- **Locked settings**: Org admins can enforce policies
- **Real-time sync**: Changes propagate instantly via Redis pub/sub
- **Caching**: Redis caching for fast reads
- **Audit trail**: All changes logged for compliance
- **Role-based access**: Proper permission checks throughout

---

*End of TokenTra Settings System Specification*
