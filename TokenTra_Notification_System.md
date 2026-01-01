# TokenTra Notification System

## Enterprise-Grade Notification Infrastructure

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## Executive Summary

The TokenTra Notification System is a comprehensive notification infrastructure that delivers timely, relevant, and actionable information to users across multiple channels. It extends beyond the Alerting Engine's notification dispatch to provide in-app notifications, user preferences management, digest emails, push notifications, and intelligent notification routing.

This system ensures users stay informed about their AI costs without notification fatigue—the right information, to the right person, at the right time, through the right channel.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [TypeScript Types](#3-typescript-types)
4. [Notification Categories](#4-notification-categories)
5. [In-App Notification Service](#5-in-app-notification-service)
6. [Notification Preferences Service](#6-notification-preferences-service)
7. [Digest Email Service](#7-digest-email-service)
8. [Real-Time Notification Delivery](#8-real-time-notification-delivery)
9. [Notification Templates](#9-notification-templates)
10. [API Routes](#10-api-routes)
11. [React Components](#11-react-components)
12. [Background Jobs](#12-background-jobs)
13. [Integration Guide](#13-integration-guide)

---

## 1. Architecture Overview

### 1.1 System Design

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       NOTIFICATION SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                        NOTIFICATION SOURCES                                 │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │  │   Alerting   │ │   Budget     │ │  Optimization│ │   Provider   │       │ │
│  │  │   Engine     │ │   System     │ │    Engine    │ │   Sync       │       │ │
│  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘       │ │
│  │         │                │                │                │                │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │  │    Report    │ │   Team       │ │    System    │ │   Billing    │       │ │
│  │  │   Generator  │ │   Activity   │ │   Events     │ │   Events     │       │ │
│  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘       │ │
│  └─────────┼────────────────┼────────────────┼────────────────┼───────────────┘ │
│            │                │                │                │                  │
│            └────────────────┴────────────────┴────────────────┘                  │
│                                      │                                           │
│                                      ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                      NOTIFICATION PROCESSOR                                 │ │
│  │                                                                             │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │  │  Category    │ │  Preference  │ │   Template   │ │  Dedup &     │       │ │
│  │  │  Classifier  │ │  Filter      │ │   Renderer   │ │  Throttle    │       │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │ │
│  │                                                                             │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │  │  DND Check   │ │   Priority   │ │   Batching   │ │  Scheduling  │       │ │
│  │  │              │ │   Escalation │ │   Engine     │ │   Manager    │       │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │ │
│  └─────────────────────────────────┬──────────────────────────────────────────┘ │
│                                    │                                             │
│                                    ▼                                             │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                      DELIVERY CHANNELS                                      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │ │
│  │  │  In-App  │ │  Email   │ │  Slack   │ │   Push   │ │ Webhook  │          │ │
│  │  │  Center  │ │ (Single/ │ │          │ │  (Web/   │ │          │          │ │
│  │  │  /Toast  │ │  Digest) │ │          │ │  Mobile) │ │          │          │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                      NOTIFICATION STATE                                     │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │  │   History    │ │   Read/      │ │   Delivery   │ │   Analytics  │       │ │
│  │  │   Storage    │ │   Unread     │ │   Tracking   │ │   & Metrics  │       │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **User-Centric** | Respect user preferences; never spam |
| **Multi-Channel** | Deliver via the user's preferred channel(s) |
| **Intelligent Batching** | Group related notifications; send digests |
| **Real-Time + Async** | In-app is instant; emails can be batched |
| **Actionable** | Every notification includes clear next steps |
| **Trackable** | Full delivery and engagement analytics |

### 1.3 Notification Flow

```
Source Event → Processor → Preferences Check → Channel Router → Delivery → Tracking
     │              │              │                  │              │          │
     │              │              │                  │              │          │
     ▼              ▼              ▼                  ▼              ▼          ▼
 AlertEngine   Categorize    User wants it?    In-App/Email    Send it    Record
 BudgetSys     Template      DND active?       Slack/Push      via API    engagement
 etc.          Render        Throttle?         Webhook         provider
```

---

## 2. Database Schema

### 2.1 Core Tables

```sql
-- ============================================================================
-- NOTIFICATIONS TABLE
-- Core storage for all notifications (in-app and historical)
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Target: who receives this notification
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('user', 'team', 'org')),
  recipient_id UUID NOT NULL,  -- user_id, team_id, or org_id
  
  -- Classification
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' 
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Content
  title VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,  -- Rich HTML version for emails
  icon VARCHAR(50),  -- Icon identifier (e.g., 'alert-triangle', 'check-circle')
  color VARCHAR(20),  -- Theme color for the notification
  
  -- Metadata
  source_type VARCHAR(50) NOT NULL,  -- 'alert', 'budget', 'optimization', 'system', etc.
  source_id UUID,  -- Reference to the source record
  metadata JSONB DEFAULT '{}',  -- Additional context
  
  -- Actions
  primary_action_label VARCHAR(100),
  primary_action_url VARCHAR(500),
  secondary_action_label VARCHAR(100),
  secondary_action_url VARCHAR(500),
  
  -- State
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  -- Delivery tracking (per channel)
  delivery_status JSONB DEFAULT '{}'::jsonb,
  -- Example: {"email": {"sent": true, "sentAt": "...", "opened": true}, "slack": {...}}
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,  -- Auto-archive after this time
  
  -- Deduplication
  dedup_key VARCHAR(255),
  
  CONSTRAINT unique_dedup_key UNIQUE (org_id, recipient_id, dedup_key)
);

-- Indexes for common queries
CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_category ON notifications(org_id, category, created_at DESC);
CREATE INDEX idx_notifications_source ON notifications(source_type, source_id);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- USER NOTIFICATION PREFERENCES
-- Per-user notification settings
-- ============================================================================

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Global settings
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Do Not Disturb
  dnd_enabled BOOLEAN DEFAULT false,
  dnd_start_time TIME,  -- e.g., 22:00
  dnd_end_time TIME,    -- e.g., 08:00
  dnd_timezone VARCHAR(50) DEFAULT 'UTC',
  dnd_override_urgent BOOLEAN DEFAULT true,  -- Allow urgent notifications during DND
  
  -- Email preferences
  email_enabled BOOLEAN DEFAULT true,
  email_address VARCHAR(255),
  email_frequency VARCHAR(20) DEFAULT 'instant' 
    CHECK (email_frequency IN ('instant', 'hourly', 'daily', 'weekly', 'never')),
  email_digest_time TIME DEFAULT '09:00',  -- When to send daily/weekly digest
  email_digest_day INTEGER DEFAULT 1,  -- Day of week for weekly digest (1=Monday)
  
  -- Slack preferences
  slack_enabled BOOLEAN DEFAULT true,
  slack_user_id VARCHAR(100),  -- Slack user ID for DMs
  slack_dm_enabled BOOLEAN DEFAULT true,  -- Allow direct messages
  
  -- Push preferences
  push_enabled BOOLEAN DEFAULT true,
  push_subscription JSONB,  -- Web push subscription object
  
  -- In-app preferences
  in_app_enabled BOOLEAN DEFAULT true,
  in_app_sound BOOLEAN DEFAULT true,
  in_app_desktop_notifications BOOLEAN DEFAULT true,
  
  -- Per-category preferences (JSONB for flexibility)
  category_preferences JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "alerts": {"email": true, "slack": true, "in_app": true, "push": true},
  --   "budgets": {"email": true, "slack": false, "in_app": true, "push": false},
  --   "optimization": {"email": "daily", "in_app": true}
  -- }
  
  -- Throttling
  max_notifications_per_hour INTEGER DEFAULT 50,
  max_emails_per_day INTEGER DEFAULT 20,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_org_prefs UNIQUE (user_id, org_id)
);

CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_prefs_org ON notification_preferences(org_id);

-- ============================================================================
-- NOTIFICATION TEMPLATES
-- Reusable templates for consistent messaging
-- ============================================================================

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,  -- NULL = system template
  
  -- Identification
  key VARCHAR(100) NOT NULL,  -- e.g., 'budget_80_percent', 'alert_triggered'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Template content (supports variables like {{amount}}, {{percentage}})
  title_template VARCHAR(500) NOT NULL,
  body_template TEXT NOT NULL,
  body_html_template TEXT,
  
  -- Metadata
  category VARCHAR(50) NOT NULL,
  default_priority VARCHAR(20) DEFAULT 'normal',
  default_icon VARCHAR(50),
  default_color VARCHAR(20),
  
  -- Actions
  default_primary_action_label VARCHAR(100),
  default_primary_action_url_template VARCHAR(500),
  default_secondary_action_label VARCHAR(100),
  default_secondary_action_url_template VARCHAR(500),
  
  -- Settings
  is_system BOOLEAN DEFAULT false,  -- System templates cannot be deleted
  enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_template_key UNIQUE (COALESCE(org_id, '00000000-0000-0000-0000-000000000000'), key)
);

CREATE INDEX idx_notification_templates_key ON notification_templates(key);
CREATE INDEX idx_notification_templates_category ON notification_templates(category);

-- ============================================================================
-- NOTIFICATION DELIVERY LOG
-- Detailed tracking of notification delivery attempts
-- ============================================================================

CREATE TABLE notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  
  channel VARCHAR(20) NOT NULL,  -- 'email', 'slack', 'push', 'webhook'
  
  -- Delivery status
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
  
  -- Attempt tracking
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  next_retry_at TIMESTAMPTZ,
  
  -- Response/Error
  provider_response JSONB,
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- Engagement tracking
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Provider-specific IDs
  provider_message_id VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_log_notification ON notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_status ON notification_delivery_log(status) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_delivery_log_retry ON notification_delivery_log(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- ============================================================================
-- EMAIL DIGEST QUEUE
-- Queued notifications for digest emails
-- ============================================================================

CREATE TABLE email_digest_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  
  digest_type VARCHAR(20) NOT NULL CHECK (digest_type IN ('hourly', 'daily', 'weekly')),
  scheduled_for TIMESTAMPTZ NOT NULL,  -- When this digest should be sent
  
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_digest_queue_scheduled ON email_digest_queue(scheduled_for, processed) 
  WHERE processed = false;
CREATE INDEX idx_digest_queue_user ON email_digest_queue(user_id, digest_type);

-- ============================================================================
-- NOTIFICATION SUBSCRIPTIONS
-- Topic-based subscriptions (beyond default preferences)
-- ============================================================================

CREATE TABLE notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Subscription target
  subscription_type VARCHAR(50) NOT NULL,  -- 'budget', 'team', 'project', 'provider', 'model'
  target_id UUID NOT NULL,  -- The ID of the budget/team/project/etc.
  
  -- Channels
  channels JSONB DEFAULT '["in_app"]'::jsonb,  -- ["in_app", "email", "slack"]
  
  -- Filters
  min_severity VARCHAR(20),  -- Only notify for this severity or higher
  
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_subscription UNIQUE (user_id, org_id, subscription_type, target_id)
);

CREATE INDEX idx_subscriptions_user ON notification_subscriptions(user_id, enabled);
CREATE INDEX idx_subscriptions_target ON notification_subscriptions(subscription_type, target_id);

-- ============================================================================
-- NOTIFICATION MUTES
-- Temporary or permanent mutes for specific sources
-- ============================================================================

CREATE TABLE notification_mutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Mute target
  mute_type VARCHAR(50) NOT NULL,  -- 'category', 'source', 'team', 'project', 'alert_rule'
  target_id VARCHAR(255) NOT NULL,  -- Category name or UUID
  
  -- Duration
  muted_until TIMESTAMPTZ,  -- NULL = permanent
  
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_mute UNIQUE (user_id, org_id, mute_type, target_id)
);

CREATE INDEX idx_mutes_user ON notification_mutes(user_id);
CREATE INDEX idx_mutes_active ON notification_mutes(muted_until) WHERE muted_until IS NULL OR muted_until > NOW();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_mutes ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (
    (recipient_type = 'user' AND recipient_id = auth.uid()) OR
    (recipient_type = 'team' AND recipient_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )) OR
    (recipient_type = 'org' AND org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    ))
  );

-- Users can update their own notifications (mark read, etc.)
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (
    recipient_type = 'user' AND recipient_id = auth.uid()
  );

-- Preferences policies
CREATE POLICY "Users manage own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users manage own subscriptions" ON notification_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Mutes policies
CREATE POLICY "Users manage own mutes" ON notification_mutes
  FOR ALL USING (user_id = auth.uid());
```

### 2.2 Database Functions

```sql
-- ============================================================================
-- GET UNREAD COUNT
-- ============================================================================

CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID,
  p_org_id UUID
)
RETURNS TABLE(
  total INTEGER,
  by_category JSONB,
  by_priority JSONB
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH unread AS (
    SELECT 
      n.category,
      n.priority
    FROM notifications n
    WHERE (
      (n.recipient_type = 'user' AND n.recipient_id = p_user_id) OR
      (n.recipient_type = 'org' AND n.org_id = p_org_id)
    )
    AND n.read_at IS NULL
    AND n.archived_at IS NULL
    AND n.dismissed_at IS NULL
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  )
  SELECT
    COUNT(*)::INTEGER as total,
    COALESCE(jsonb_object_agg(category, cat_count), '{}'::jsonb) as by_category,
    COALESCE(jsonb_object_agg(priority, pri_count), '{}'::jsonb) as by_priority
  FROM (
    SELECT category, COUNT(*) as cat_count FROM unread GROUP BY category
  ) cats
  CROSS JOIN (
    SELECT priority, COUNT(*) as pri_count FROM unread GROUP BY priority
  ) pris;
END;
$$;

-- ============================================================================
-- GET NOTIFICATIONS WITH PAGINATION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_notifications(
  p_user_id UUID,
  p_org_id UUID,
  p_category VARCHAR DEFAULT NULL,
  p_priority VARCHAR DEFAULT NULL,
  p_read_status VARCHAR DEFAULT NULL,  -- 'read', 'unread', 'all'
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  category VARCHAR,
  subcategory VARCHAR,
  priority VARCHAR,
  title VARCHAR,
  body TEXT,
  icon VARCHAR,
  color VARCHAR,
  source_type VARCHAR,
  source_id UUID,
  metadata JSONB,
  primary_action_label VARCHAR,
  primary_action_url VARCHAR,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH filtered AS (
    SELECT 
      n.*,
      COUNT(*) OVER() as total_count
    FROM notifications n
    WHERE (
      (n.recipient_type = 'user' AND n.recipient_id = p_user_id) OR
      (n.recipient_type = 'org' AND n.org_id = p_org_id)
    )
    AND n.archived_at IS NULL
    AND n.dismissed_at IS NULL
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
    AND (p_category IS NULL OR n.category = p_category)
    AND (p_priority IS NULL OR n.priority = p_priority)
    AND (
      p_read_status IS NULL OR p_read_status = 'all' OR
      (p_read_status = 'read' AND n.read_at IS NOT NULL) OR
      (p_read_status = 'unread' AND n.read_at IS NULL)
    )
    ORDER BY 
      CASE n.priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'normal' THEN 3 
        ELSE 4 
      END,
      n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  )
  SELECT 
    f.id,
    f.category,
    f.subcategory,
    f.priority,
    f.title,
    f.body,
    f.icon,
    f.color,
    f.source_type,
    f.source_id,
    f.metadata,
    f.primary_action_label,
    f.primary_action_url,
    f.read_at,
    f.created_at,
    f.total_count
  FROM filtered f;
END;
$$;

-- ============================================================================
-- MARK NOTIFICATIONS AS READ
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[],
  p_mark_all BOOLEAN DEFAULT false
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_mark_all THEN
    UPDATE notifications
    SET read_at = NOW()
    WHERE recipient_type = 'user'
      AND recipient_id = p_user_id
      AND read_at IS NULL
    RETURNING 1 INTO v_count;
  ELSE
    UPDATE notifications
    SET read_at = NOW()
    WHERE id = ANY(p_notification_ids)
      AND recipient_type = 'user'
      AND recipient_id = p_user_id
      AND read_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;
  
  RETURN v_count;
END;
$$;

-- ============================================================================
-- CHECK IF USER SHOULD RECEIVE NOTIFICATION
-- ============================================================================

CREATE OR REPLACE FUNCTION should_receive_notification(
  p_user_id UUID,
  p_org_id UUID,
  p_category VARCHAR,
  p_priority VARCHAR,
  p_channel VARCHAR,
  p_source_type VARCHAR DEFAULT NULL,
  p_source_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_prefs notification_preferences%ROWTYPE;
  v_category_pref JSONB;
  v_is_muted BOOLEAN;
  v_in_dnd BOOLEAN;
  v_current_time TIME;
BEGIN
  -- Get user preferences
  SELECT * INTO v_prefs
  FROM notification_preferences
  WHERE user_id = p_user_id AND org_id = p_org_id;
  
  -- If no preferences, use defaults (all enabled)
  IF v_prefs IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check global enabled
  IF NOT v_prefs.notifications_enabled THEN
    RETURN false;
  END IF;
  
  -- Check channel-specific enabled
  CASE p_channel
    WHEN 'email' THEN
      IF NOT v_prefs.email_enabled OR v_prefs.email_frequency = 'never' THEN
        RETURN false;
      END IF;
    WHEN 'slack' THEN
      IF NOT v_prefs.slack_enabled THEN
        RETURN false;
      END IF;
    WHEN 'push' THEN
      IF NOT v_prefs.push_enabled THEN
        RETURN false;
      END IF;
    WHEN 'in_app' THEN
      IF NOT v_prefs.in_app_enabled THEN
        RETURN false;
      END IF;
  END CASE;
  
  -- Check category preferences
  v_category_pref := v_prefs.category_preferences->p_category;
  IF v_category_pref IS NOT NULL THEN
    IF v_category_pref->p_channel = 'false' THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Check mutes
  SELECT EXISTS(
    SELECT 1 FROM notification_mutes
    WHERE user_id = p_user_id
      AND org_id = p_org_id
      AND (muted_until IS NULL OR muted_until > NOW())
      AND (
        (mute_type = 'category' AND target_id = p_category) OR
        (mute_type = 'source' AND target_id = p_source_type) OR
        (mute_type = 'source_id' AND target_id = p_source_id::TEXT)
      )
  ) INTO v_is_muted;
  
  IF v_is_muted THEN
    RETURN false;
  END IF;
  
  -- Check DND (for non-in-app channels)
  IF p_channel != 'in_app' AND v_prefs.dnd_enabled THEN
    -- Allow urgent during DND if configured
    IF p_priority = 'urgent' AND v_prefs.dnd_override_urgent THEN
      RETURN true;
    END IF;
    
    v_current_time := (NOW() AT TIME ZONE v_prefs.dnd_timezone)::TIME;
    
    -- Handle DND that spans midnight
    IF v_prefs.dnd_start_time > v_prefs.dnd_end_time THEN
      v_in_dnd := v_current_time >= v_prefs.dnd_start_time OR v_current_time < v_prefs.dnd_end_time;
    ELSE
      v_in_dnd := v_current_time >= v_prefs.dnd_start_time AND v_current_time < v_prefs.dnd_end_time;
    END IF;
    
    IF v_in_dnd THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- ============================================================================
-- CLEANUP EXPIRED NOTIFICATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Archive expired notifications
  UPDATE notifications
  SET archived_at = NOW()
  WHERE expires_at < NOW()
    AND archived_at IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Delete old archived notifications (older than 90 days)
  DELETE FROM notifications
  WHERE archived_at < NOW() - INTERVAL '90 days';
  
  RETURN v_count;
END;
$$;
```

---

## 3. TypeScript Types

```typescript
// types/notifications.ts

// ============================================================================
// CORE TYPES
// ============================================================================

export type NotificationCategory = 
  | 'alert'           // From alerting engine
  | 'budget'          // Budget-related notifications
  | 'optimization'    // Optimization recommendations
  | 'provider'        // Provider sync/health notifications
  | 'report'          // Report generation notifications
  | 'team'            // Team activity notifications
  | 'system'          // System announcements
  | 'billing'         // Billing/subscription notifications
  | 'security';       // Security-related notifications

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationChannel = 'in_app' | 'email' | 'slack' | 'push' | 'webhook';

export type RecipientType = 'user' | 'team' | 'org';

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';

export type EmailFrequency = 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';

// ============================================================================
// NOTIFICATION
// ============================================================================

export interface Notification {
  id: string;
  orgId: string;
  
  // Target
  recipientType: RecipientType;
  recipientId: string;
  
  // Classification
  category: NotificationCategory;
  subcategory?: string;
  priority: NotificationPriority;
  
  // Content
  title: string;
  body: string;
  bodyHtml?: string;
  icon?: string;
  color?: string;
  
  // Source
  sourceType: string;
  sourceId?: string;
  metadata: Record<string, any>;
  
  // Actions
  primaryActionLabel?: string;
  primaryActionUrl?: string;
  secondaryActionLabel?: string;
  secondaryActionUrl?: string;
  
  // State
  readAt?: string;
  archivedAt?: string;
  dismissedAt?: string;
  
  // Delivery
  deliveryStatus: Record<NotificationChannel, ChannelDeliveryStatus>;
  
  // Timestamps
  createdAt: string;
  expiresAt?: string;
  
  // Dedup
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

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export interface NotificationPreferences {
  id: string;
  userId: string;
  orgId: string;
  
  // Global
  notificationsEnabled: boolean;
  
  // DND
  dndEnabled: boolean;
  dndStartTime?: string;
  dndEndTime?: string;
  dndTimezone: string;
  dndOverrideUrgent: boolean;
  
  // Email
  emailEnabled: boolean;
  emailAddress?: string;
  emailFrequency: EmailFrequency;
  emailDigestTime: string;
  emailDigestDay: number;
  
  // Slack
  slackEnabled: boolean;
  slackUserId?: string;
  slackDmEnabled: boolean;
  
  // Push
  pushEnabled: boolean;
  pushSubscription?: PushSubscription;
  
  // In-app
  inAppEnabled: boolean;
  inAppSound: boolean;
  inAppDesktopNotifications: boolean;
  
  // Per-category preferences
  categoryPreferences: CategoryPreferences;
  
  // Throttling
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

// ============================================================================
// NOTIFICATION TEMPLATE
// ============================================================================

export interface NotificationTemplate {
  id: string;
  orgId?: string;
  
  key: string;
  name: string;
  description?: string;
  
  titleTemplate: string;
  bodyTemplate: string;
  bodyHtmlTemplate?: string;
  
  category: NotificationCategory;
  defaultPriority: NotificationPriority;
  defaultIcon?: string;
  defaultColor?: string;
  
  defaultPrimaryActionLabel?: string;
  defaultPrimaryActionUrlTemplate?: string;
  defaultSecondaryActionLabel?: string;
  defaultSecondaryActionUrlTemplate?: string;
  
  isSystem: boolean;
  enabled: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CREATE NOTIFICATION REQUEST
// ============================================================================

export interface CreateNotificationRequest {
  // Target
  recipientType: RecipientType;
  recipientId?: string;  // Optional for 'org' type
  recipientIds?: string[];  // For batch sending
  
  // Template-based
  templateKey?: string;
  templateVariables?: Record<string, any>;
  
  // Or direct content
  category?: NotificationCategory;
  subcategory?: string;
  priority?: NotificationPriority;
  title?: string;
  body?: string;
  bodyHtml?: string;
  icon?: string;
  color?: string;
  
  // Source
  sourceType: string;
  sourceId?: string;
  metadata?: Record<string, any>;
  
  // Actions
  primaryActionLabel?: string;
  primaryActionUrl?: string;
  secondaryActionLabel?: string;
  secondaryActionUrl?: string;
  
  // Options
  channels?: NotificationChannel[];
  dedupKey?: string;
  expiresIn?: number;  // Seconds until expiration
  
  // Scheduling
  sendAt?: string;  // ISO timestamp for scheduled send
}

// ============================================================================
// NOTIFICATION SUBSCRIPTION
// ============================================================================

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

// ============================================================================
// NOTIFICATION MUTE
// ============================================================================

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

// ============================================================================
// UNREAD COUNT
// ============================================================================

export interface UnreadCount {
  total: number;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
}

// ============================================================================
// NOTIFICATION QUERY
// ============================================================================

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

// ============================================================================
// DELIVERY LOG
// ============================================================================

export interface DeliveryLog {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  attemptCount: number;
  lastAttemptAt: string;
  nextRetryAt?: string;
  providerResponse?: Record<string, any>;
  errorMessage?: string;
  errorCode?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  providerMessageId?: string;
  createdAt: string;
}

// ============================================================================
// DIGEST
// ============================================================================

export interface DigestItem {
  notification: Notification;
  groupKey?: string;
}

export interface Digest {
  userId: string;
  orgId: string;
  digestType: 'hourly' | 'daily' | 'weekly';
  period: {
    start: string;
    end: string;
  };
  items: DigestItem[];
  summary: DigestSummary;
}

export interface DigestSummary {
  totalNotifications: number;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
  highlights: string[];
}
```

---

## 4. Notification Categories

### 4.1 Category Definitions

```typescript
// lib/notifications/categories.ts

export const NOTIFICATION_CATEGORIES: Record<NotificationCategory, CategoryDefinition> = {
  alert: {
    name: 'Alerts',
    description: 'Cost alerts, anomaly detection, and threshold breaches',
    icon: 'bell',
    color: '#EF4444',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'email', 'slack'],
    subcategories: [
      'spend_threshold',
      'budget_threshold',
      'anomaly',
      'usage_spike',
      'forecast_exceeded',
      'provider_error'
    ]
  },
  
  budget: {
    name: 'Budget Updates',
    description: 'Budget utilization, forecasts, and period rollovers',
    icon: 'wallet',
    color: '#F59E0B',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    subcategories: [
      'utilization_warning',
      'utilization_critical',
      'period_start',
      'period_end',
      'forecast_update'
    ]
  },
  
  optimization: {
    name: 'Optimization Insights',
    description: 'Cost-saving recommendations and efficiency insights',
    icon: 'lightbulb',
    color: '#10B981',
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
    subcategories: [
      'model_recommendation',
      'caching_opportunity',
      'prompt_optimization',
      'usage_pattern',
      'savings_achieved'
    ]
  },
  
  provider: {
    name: 'Provider Status',
    description: 'Provider sync status, errors, and health updates',
    icon: 'plug',
    color: '#6366F1',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    subcategories: [
      'sync_complete',
      'sync_error',
      'credentials_expiring',
      'credentials_expired',
      'rate_limit_warning'
    ]
  },
  
  report: {
    name: 'Reports',
    description: 'Report generation and scheduled report delivery',
    icon: 'file-text',
    color: '#8B5CF6',
    defaultPriority: 'low',
    defaultChannels: ['in_app', 'email'],
    subcategories: [
      'report_ready',
      'scheduled_report',
      'export_complete'
    ]
  },
  
  team: {
    name: 'Team Activity',
    description: 'Team membership changes and activity updates',
    icon: 'users',
    color: '#3B82F6',
    defaultPriority: 'low',
    defaultChannels: ['in_app'],
    subcategories: [
      'member_added',
      'member_removed',
      'role_changed',
      'team_created',
      'project_created'
    ]
  },
  
  system: {
    name: 'System Announcements',
    description: 'Platform updates, maintenance, and announcements',
    icon: 'megaphone',
    color: '#64748B',
    defaultPriority: 'normal',
    defaultChannels: ['in_app'],
    subcategories: [
      'maintenance',
      'new_feature',
      'platform_update',
      'security_update'
    ]
  },
  
  billing: {
    name: 'Billing & Subscription',
    description: 'Invoices, payment status, and subscription changes',
    icon: 'credit-card',
    color: '#EC4899',
    defaultPriority: 'normal',
    defaultChannels: ['in_app', 'email'],
    subcategories: [
      'invoice_generated',
      'payment_received',
      'payment_failed',
      'subscription_change',
      'trial_ending',
      'plan_limit_approaching'
    ]
  },
  
  security: {
    name: 'Security',
    description: 'Login alerts, API key events, and security notifications',
    icon: 'shield',
    color: '#DC2626',
    defaultPriority: 'high',
    defaultChannels: ['in_app', 'email'],
    subcategories: [
      'new_login',
      'password_changed',
      'api_key_created',
      'api_key_revoked',
      'suspicious_activity'
    ]
  }
};

export interface CategoryDefinition {
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultPriority: NotificationPriority;
  defaultChannels: NotificationChannel[];
  subcategories: string[];
}
```

### 4.2 Default Templates

```typescript
// lib/notifications/defaultTemplates.ts

export const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  // ========================================
  // ALERT TEMPLATES
  // ========================================
  {
    key: 'alert_spend_threshold',
    name: 'Spend Threshold Alert',
    category: 'alert',
    titleTemplate: '🔴 Spending Alert: {{metric}} exceeded {{threshold}}',
    bodyTemplate: 'Your {{metric}} has reached {{currentValue}}, exceeding your {{threshold}} threshold. Top contributors: {{topContributors}}.',
    bodyHtmlTemplate: `
      <p>Your <strong>{{metric}}</strong> has reached <strong>{{currentValue}}</strong>, 
      exceeding your <strong>{{threshold}}</strong> threshold.</p>
      <h4>Top Contributors</h4>
      <ul>{{#topContributors}}<li>{{name}}: {{amount}}</li>{{/topContributors}}</ul>
    `,
    defaultPriority: 'high',
    defaultIcon: 'alert-triangle',
    defaultColor: '#EF4444',
    defaultPrimaryActionLabel: 'View Details',
    defaultPrimaryActionUrlTemplate: '/alerts/{{alertId}}'
  },
  
  {
    key: 'alert_budget_warning',
    name: 'Budget Warning Alert',
    category: 'alert',
    titleTemplate: '🟡 Budget Alert: {{budgetName}} at {{percentage}}%',
    bodyTemplate: '{{budgetName}} has reached {{percentage}}% utilization ({{currentSpend}} of {{budgetAmount}}). {{daysRemaining}} days remaining in period.',
    defaultPriority: 'high',
    defaultIcon: 'alert-triangle',
    defaultColor: '#F59E0B',
    defaultPrimaryActionLabel: 'View Budget',
    defaultPrimaryActionUrlTemplate: '/budgets/{{budgetId}}'
  },
  
  {
    key: 'alert_anomaly_detected',
    name: 'Anomaly Detected Alert',
    category: 'alert',
    titleTemplate: '⚠️ Unusual Activity: {{description}}',
    bodyTemplate: 'We detected unusual {{metric}} activity. Current value: {{currentValue}} ({{deviation}} from baseline). This could indicate {{possibleCauses}}.',
    defaultPriority: 'high',
    defaultIcon: 'activity',
    defaultColor: '#EF4444',
    defaultPrimaryActionLabel: 'Investigate',
    defaultPrimaryActionUrlTemplate: '/alerts/{{alertId}}'
  },
  
  // ========================================
  // BUDGET TEMPLATES
  // ========================================
  {
    key: 'budget_period_start',
    name: 'Budget Period Started',
    category: 'budget',
    titleTemplate: '📅 Budget Period Started: {{budgetName}}',
    bodyTemplate: 'A new budget period has started for {{budgetName}}. Budget: {{budgetAmount}} for {{periodDuration}}.',
    defaultPriority: 'low',
    defaultIcon: 'calendar',
    defaultColor: '#10B981'
  },
  
  {
    key: 'budget_forecast_warning',
    name: 'Budget Forecast Warning',
    category: 'budget',
    titleTemplate: '📊 Forecast Alert: {{budgetName}} projected to exceed',
    bodyTemplate: 'At current spend rate, {{budgetName}} is projected to reach {{projectedSpend}} ({{projectedPercentage}}% of budget) by end of period.',
    defaultPriority: 'normal',
    defaultIcon: 'trending-up',
    defaultColor: '#F59E0B',
    defaultPrimaryActionLabel: 'View Forecast',
    defaultPrimaryActionUrlTemplate: '/budgets/{{budgetId}}/forecast'
  },
  
  // ========================================
  // OPTIMIZATION TEMPLATES
  // ========================================
  {
    key: 'optimization_model_recommendation',
    name: 'Model Optimization Recommendation',
    category: 'optimization',
    titleTemplate: '💡 Save {{potentialSavings}}/month with model optimization',
    bodyTemplate: 'We identified {{requestCount}} requests that could use {{recommendedModel}} instead of {{currentModel}}, saving approximately {{potentialSavings}}/month with minimal quality impact.',
    defaultPriority: 'low',
    defaultIcon: 'lightbulb',
    defaultColor: '#10B981',
    defaultPrimaryActionLabel: 'View Recommendation',
    defaultPrimaryActionUrlTemplate: '/optimization/{{recommendationId}}'
  },
  
  {
    key: 'optimization_caching_opportunity',
    name: 'Caching Opportunity Detected',
    category: 'optimization',
    titleTemplate: '🔄 Cache {{cacheablePercent}}% of requests, save {{potentialSavings}}/month',
    bodyTemplate: 'We detected {{duplicateCount}} duplicate or similar prompts that could be cached. Estimated savings: {{potentialSavings}}/month.',
    defaultPriority: 'low',
    defaultIcon: 'database',
    defaultColor: '#10B981'
  },
  
  {
    key: 'optimization_savings_achieved',
    name: 'Savings Milestone Achieved',
    category: 'optimization',
    titleTemplate: '🎉 You\'ve saved {{totalSavings}} this {{period}}!',
    bodyTemplate: 'Great news! Your optimization efforts have saved {{totalSavings}} this {{period}}. That\'s {{savingsPercentage}}% less than you would have spent.',
    defaultPriority: 'low',
    defaultIcon: 'award',
    defaultColor: '#10B981'
  },
  
  // ========================================
  // PROVIDER TEMPLATES
  // ========================================
  {
    key: 'provider_sync_error',
    name: 'Provider Sync Error',
    category: 'provider',
    titleTemplate: '❌ {{providerName}} sync failed',
    bodyTemplate: 'Failed to sync data from {{providerName}}: {{errorMessage}}. Last successful sync: {{lastSyncTime}}.',
    defaultPriority: 'high',
    defaultIcon: 'alert-circle',
    defaultColor: '#EF4444',
    defaultPrimaryActionLabel: 'View Details',
    defaultPrimaryActionUrlTemplate: '/settings/providers/{{providerId}}'
  },
  
  {
    key: 'provider_credentials_expiring',
    name: 'Provider Credentials Expiring',
    category: 'provider',
    titleTemplate: '⚠️ {{providerName}} credentials expiring soon',
    bodyTemplate: 'Your {{providerName}} API credentials will expire in {{daysRemaining}} days. Please update them to continue receiving usage data.',
    defaultPriority: 'high',
    defaultIcon: 'key',
    defaultColor: '#F59E0B',
    defaultPrimaryActionLabel: 'Update Credentials',
    defaultPrimaryActionUrlTemplate: '/settings/providers/{{providerId}}/credentials'
  },
  
  // ========================================
  // REPORT TEMPLATES
  // ========================================
  {
    key: 'report_ready',
    name: 'Report Ready',
    category: 'report',
    titleTemplate: '📄 Your {{reportName}} report is ready',
    bodyTemplate: 'Your {{reportName}} covering {{dateRange}} is ready for download.',
    defaultPriority: 'low',
    defaultIcon: 'file-text',
    defaultColor: '#8B5CF6',
    defaultPrimaryActionLabel: 'Download Report',
    defaultPrimaryActionUrlTemplate: '/reports/{{reportId}}/download'
  },
  
  {
    key: 'report_scheduled_delivery',
    name: 'Scheduled Report Delivered',
    category: 'report',
    titleTemplate: '📊 {{reportName}} - {{period}} Report',
    bodyTemplate: 'Your scheduled {{reportName}} for {{period}} is attached. Summary: {{summary}}.',
    defaultPriority: 'low',
    defaultIcon: 'mail',
    defaultColor: '#8B5CF6'
  },
  
  // ========================================
  // TEAM TEMPLATES
  // ========================================
  {
    key: 'team_member_added',
    name: 'Team Member Added',
    category: 'team',
    titleTemplate: '👋 {{memberName}} joined {{teamName}}',
    bodyTemplate: '{{memberName}} has been added to {{teamName}} with {{role}} role.',
    defaultPriority: 'low',
    defaultIcon: 'user-plus',
    defaultColor: '#3B82F6'
  },
  
  {
    key: 'team_member_removed',
    name: 'Team Member Removed',
    category: 'team',
    titleTemplate: '👋 {{memberName}} left {{teamName}}',
    bodyTemplate: '{{memberName}} has been removed from {{teamName}}.',
    defaultPriority: 'low',
    defaultIcon: 'user-minus',
    defaultColor: '#6B7280'
  },
  
  // ========================================
  // BILLING TEMPLATES
  // ========================================
  {
    key: 'billing_invoice_generated',
    name: 'Invoice Generated',
    category: 'billing',
    titleTemplate: '🧾 Invoice #{{invoiceNumber}} - {{amount}}',
    bodyTemplate: 'Your invoice for {{period}} has been generated. Amount due: {{amount}}. Due date: {{dueDate}}.',
    defaultPriority: 'normal',
    defaultIcon: 'file-text',
    defaultColor: '#EC4899',
    defaultPrimaryActionLabel: 'View Invoice',
    defaultPrimaryActionUrlTemplate: '/billing/invoices/{{invoiceId}}'
  },
  
  {
    key: 'billing_payment_failed',
    name: 'Payment Failed',
    category: 'billing',
    titleTemplate: '❌ Payment failed for invoice #{{invoiceNumber}}',
    bodyTemplate: 'We were unable to process your payment of {{amount}}. Reason: {{reason}}. Please update your payment method.',
    defaultPriority: 'high',
    defaultIcon: 'credit-card',
    defaultColor: '#EF4444',
    defaultPrimaryActionLabel: 'Update Payment',
    defaultPrimaryActionUrlTemplate: '/billing/payment-methods'
  },
  
  {
    key: 'billing_trial_ending',
    name: 'Trial Ending Soon',
    category: 'billing',
    titleTemplate: '⏰ Your trial ends in {{daysRemaining}} days',
    bodyTemplate: 'Your TokenTra trial will end on {{endDate}}. Upgrade now to keep access to all features.',
    defaultPriority: 'normal',
    defaultIcon: 'clock',
    defaultColor: '#F59E0B',
    defaultPrimaryActionLabel: 'Upgrade Now',
    defaultPrimaryActionUrlTemplate: '/billing/upgrade'
  },
  
  // ========================================
  // SECURITY TEMPLATES
  // ========================================
  {
    key: 'security_new_login',
    name: 'New Login Detected',
    category: 'security',
    titleTemplate: '🔐 New login to your account',
    bodyTemplate: 'A new login was detected from {{location}} using {{device}} at {{time}}. If this wasn\'t you, please secure your account immediately.',
    defaultPriority: 'normal',
    defaultIcon: 'shield',
    defaultColor: '#3B82F6',
    defaultPrimaryActionLabel: 'Review Activity',
    defaultPrimaryActionUrlTemplate: '/settings/security/activity'
  },
  
  {
    key: 'security_api_key_created',
    name: 'API Key Created',
    category: 'security',
    titleTemplate: '🔑 New API key created: {{keyName}}',
    bodyTemplate: 'A new API key "{{keyName}}" was created by {{createdBy}} at {{time}}.',
    defaultPriority: 'normal',
    defaultIcon: 'key',
    defaultColor: '#3B82F6'
  },
  
  {
    key: 'security_suspicious_activity',
    name: 'Suspicious Activity Detected',
    category: 'security',
    titleTemplate: '🚨 Suspicious activity detected on your account',
    bodyTemplate: 'We detected unusual activity: {{description}}. Please review your account security.',
    defaultPriority: 'urgent',
    defaultIcon: 'alert-octagon',
    defaultColor: '#DC2626',
    defaultPrimaryActionLabel: 'Review Security',
    defaultPrimaryActionUrlTemplate: '/settings/security'
  }
];
```

---

## 5. In-App Notification Service

```typescript
// lib/services/InAppNotificationService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';

export class InAppNotificationService {
  private supabase: SupabaseClient;
  private redis: Redis;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  // ========================================
  // GET NOTIFICATIONS
  // ========================================
  
  /**
   * Get notifications for a user with pagination
   */
  async getNotifications(
    userId: string,
    orgId: string,
    query: NotificationQuery = {}
  ): Promise<NotificationListResponse> {
    const {
      category,
      priority,
      readStatus = 'all',
      sourceType,
      limit = 20,
      offset = 0
    } = query;
    
    const { data, error } = await this.supabase
      .rpc('get_notifications', {
        p_user_id: userId,
        p_org_id: orgId,
        p_category: category,
        p_priority: priority,
        p_read_status: readStatus,
        p_limit: limit,
        p_offset: offset
      });
    
    if (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
    
    const notifications = data.map(this.mapNotification);
    const total = data[0]?.total_count ?? 0;
    
    // Get unread count
    const unreadCount = await this.getUnreadCount(userId, orgId);
    
    return {
      notifications,
      total,
      unreadCount: unreadCount.total,
      hasMore: offset + notifications.length < total
    };
  }
  
  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string, orgId: string): Promise<UnreadCount> {
    // Check cache first
    const cacheKey = `notification:unread:${userId}:${orgId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const { data, error } = await this.supabase
      .rpc('get_unread_notification_count', {
        p_user_id: userId,
        p_org_id: orgId
      });
    
    if (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
    
    const result: UnreadCount = {
      total: data[0]?.total ?? 0,
      byCategory: data[0]?.by_category ?? {},
      byPriority: data[0]?.by_priority ?? {}
    };
    
    // Cache for 30 seconds
    await this.redis.setex(cacheKey, 30, JSON.stringify(result));
    
    return result;
  }
  
  /**
   * Get a single notification by ID
   */
  async getNotification(
    notificationId: string,
    userId: string
  ): Promise<Notification | null> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('recipient_type', 'user')
      .eq('recipient_id', userId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return this.mapNotification(data);
  }
  
  // ========================================
  // MARK AS READ
  // ========================================
  
  /**
   * Mark specific notifications as read
   */
  async markAsRead(
    userId: string,
    orgId: string,
    notificationIds: string[]
  ): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('mark_notifications_read', {
        p_user_id: userId,
        p_notification_ids: notificationIds,
        p_mark_all: false
      });
    
    if (error) {
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
    
    // Invalidate cache
    await this.invalidateUnreadCache(userId, orgId);
    
    // Broadcast update
    await this.broadcastUnreadUpdate(userId, orgId);
    
    return data;
  }
  
  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string, orgId: string): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('mark_notifications_read', {
        p_user_id: userId,
        p_notification_ids: [],
        p_mark_all: true
      });
    
    if (error) {
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
    
    // Invalidate cache
    await this.invalidateUnreadCache(userId, orgId);
    
    // Broadcast update
    await this.broadcastUnreadUpdate(userId, orgId);
    
    return data;
  }
  
  // ========================================
  // DISMISS/ARCHIVE
  // ========================================
  
  /**
   * Dismiss a notification (hide from list but keep in history)
   */
  async dismiss(
    notificationId: string,
    userId: string,
    orgId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('recipient_type', 'user')
      .eq('recipient_id', userId);
    
    if (error) {
      throw new Error(`Failed to dismiss notification: ${error.message}`);
    }
    
    await this.invalidateUnreadCache(userId, orgId);
  }
  
  /**
   * Archive a notification
   */
  async archive(
    notificationId: string,
    userId: string,
    orgId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('recipient_type', 'user')
      .eq('recipient_id', userId);
    
    if (error) {
      throw new Error(`Failed to archive notification: ${error.message}`);
    }
    
    await this.invalidateUnreadCache(userId, orgId);
  }
  
  /**
   * Bulk archive old notifications
   */
  async archiveOlderThan(
    userId: string,
    orgId: string,
    days: number
  ): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ archived_at: new Date().toISOString() })
      .eq('recipient_type', 'user')
      .eq('recipient_id', userId)
      .lt('created_at', cutoff.toISOString())
      .is('archived_at', null)
      .select('id');
    
    if (error) {
      throw new Error(`Failed to archive notifications: ${error.message}`);
    }
    
    await this.invalidateUnreadCache(userId, orgId);
    
    return data?.length ?? 0;
  }
  
  // ========================================
  // REAL-TIME SUBSCRIPTIONS
  // ========================================
  
  /**
   * Subscribe to new notifications for a user
   */
  subscribeToNotifications(
    userId: string,
    orgId: string,
    callback: (notification: Notification) => void
  ): () => void {
    const channel = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          callback(this.mapNotification(payload.new));
        }
      )
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
    };
  }
  
  // ========================================
  // HELPER METHODS
  // ========================================
  
  private async invalidateUnreadCache(userId: string, orgId: string): Promise<void> {
    const cacheKey = `notification:unread:${userId}:${orgId}`;
    await this.redis.del(cacheKey);
  }
  
  private async broadcastUnreadUpdate(userId: string, orgId: string): Promise<void> {
    const count = await this.getUnreadCount(userId, orgId);
    
    // Broadcast via Redis pub/sub for WebSocket servers
    await this.redis.publish(
      `notification:unread:${userId}`,
      JSON.stringify(count)
    );
  }
  
  private mapNotification(row: any): Notification {
    return {
      id: row.id,
      orgId: row.org_id,
      recipientType: row.recipient_type,
      recipientId: row.recipient_id,
      category: row.category,
      subcategory: row.subcategory,
      priority: row.priority,
      title: row.title,
      body: row.body,
      bodyHtml: row.body_html,
      icon: row.icon,
      color: row.color,
      sourceType: row.source_type,
      sourceId: row.source_id,
      metadata: row.metadata ?? {},
      primaryActionLabel: row.primary_action_label,
      primaryActionUrl: row.primary_action_url,
      secondaryActionLabel: row.secondary_action_label,
      secondaryActionUrl: row.secondary_action_url,
      readAt: row.read_at,
      archivedAt: row.archived_at,
      dismissedAt: row.dismissed_at,
      deliveryStatus: row.delivery_status ?? {},
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      dedupKey: row.dedup_key
    };
  }
}
```

---

## 6. Notification Preferences Service

```typescript
// lib/services/NotificationPreferencesService.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class NotificationPreferencesService {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }
  
  // ========================================
  // GET PREFERENCES
  // ========================================
  
  /**
   * Get user notification preferences
   */
  async getPreferences(
    userId: string,
    orgId: string
  ): Promise<NotificationPreferences> {
    const { data, error } = await this.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get preferences: ${error.message}`);
    }
    
    // Return defaults if no preferences exist
    if (!data) {
      return this.getDefaultPreferences(userId, orgId);
    }
    
    return this.mapPreferences(data);
  }
  
  /**
   * Get default preferences
   */
  getDefaultPreferences(userId: string, orgId: string): NotificationPreferences {
    return {
      id: '',
      userId,
      orgId,
      notificationsEnabled: true,
      dndEnabled: false,
      dndStartTime: '22:00',
      dndEndTime: '08:00',
      dndTimezone: 'UTC',
      dndOverrideUrgent: true,
      emailEnabled: true,
      emailFrequency: 'instant',
      emailDigestTime: '09:00',
      emailDigestDay: 1,
      slackEnabled: true,
      slackDmEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      inAppSound: true,
      inAppDesktopNotifications: true,
      categoryPreferences: this.getDefaultCategoryPreferences(),
      maxNotificationsPerHour: 50,
      maxEmailsPerDay: 20,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Get default category preferences
   */
  private getDefaultCategoryPreferences(): CategoryPreferences {
    return {
      alert: {
        email: true,
        slack: true,
        inApp: true,
        push: true
      },
      budget: {
        email: true,
        slack: false,
        inApp: true,
        push: false
      },
      optimization: {
        email: 'daily',
        slack: false,
        inApp: true,
        push: false
      },
      provider: {
        email: false,
        slack: false,
        inApp: true,
        push: false
      },
      report: {
        email: true,
        slack: false,
        inApp: true,
        push: false
      },
      team: {
        email: false,
        slack: false,
        inApp: true,
        push: false
      },
      system: {
        email: false,
        slack: false,
        inApp: true,
        push: false
      },
      billing: {
        email: true,
        slack: false,
        inApp: true,
        push: false
      },
      security: {
        email: true,
        slack: false,
        inApp: true,
        push: true
      }
    };
  }
  
  // ========================================
  // UPDATE PREFERENCES
  // ========================================
  
  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    orgId: string,
    updates: NotificationPreferencesUpdate
  ): Promise<NotificationPreferences> {
    // Map to database columns
    const dbUpdates: Record<string, any> = {};
    
    if (updates.notificationsEnabled !== undefined) {
      dbUpdates.notifications_enabled = updates.notificationsEnabled;
    }
    if (updates.dndEnabled !== undefined) {
      dbUpdates.dnd_enabled = updates.dndEnabled;
    }
    if (updates.dndStartTime !== undefined) {
      dbUpdates.dnd_start_time = updates.dndStartTime;
    }
    if (updates.dndEndTime !== undefined) {
      dbUpdates.dnd_end_time = updates.dndEndTime;
    }
    if (updates.dndTimezone !== undefined) {
      dbUpdates.dnd_timezone = updates.dndTimezone;
    }
    if (updates.dndOverrideUrgent !== undefined) {
      dbUpdates.dnd_override_urgent = updates.dndOverrideUrgent;
    }
    if (updates.emailEnabled !== undefined) {
      dbUpdates.email_enabled = updates.emailEnabled;
    }
    if (updates.emailFrequency !== undefined) {
      dbUpdates.email_frequency = updates.emailFrequency;
    }
    if (updates.emailDigestTime !== undefined) {
      dbUpdates.email_digest_time = updates.emailDigestTime;
    }
    if (updates.emailDigestDay !== undefined) {
      dbUpdates.email_digest_day = updates.emailDigestDay;
    }
    if (updates.slackEnabled !== undefined) {
      dbUpdates.slack_enabled = updates.slackEnabled;
    }
    if (updates.slackDmEnabled !== undefined) {
      dbUpdates.slack_dm_enabled = updates.slackDmEnabled;
    }
    if (updates.pushEnabled !== undefined) {
      dbUpdates.push_enabled = updates.pushEnabled;
    }
    if (updates.inAppEnabled !== undefined) {
      dbUpdates.in_app_enabled = updates.inAppEnabled;
    }
    if (updates.inAppSound !== undefined) {
      dbUpdates.in_app_sound = updates.inAppSound;
    }
    if (updates.inAppDesktopNotifications !== undefined) {
      dbUpdates.in_app_desktop_notifications = updates.inAppDesktopNotifications;
    }
    if (updates.categoryPreferences !== undefined) {
      dbUpdates.category_preferences = updates.categoryPreferences;
    }
    if (updates.maxNotificationsPerHour !== undefined) {
      dbUpdates.max_notifications_per_hour = updates.maxNotificationsPerHour;
    }
    if (updates.maxEmailsPerDay !== undefined) {
      dbUpdates.max_emails_per_day = updates.maxEmailsPerDay;
    }
    
    dbUpdates.updated_at = new Date().toISOString();
    
    // Upsert preferences
    const { data, error } = await this.supabase
      .from('notification_preferences')
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
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
    
    return this.mapPreferences(data);
  }
  
  // ========================================
  // UPDATE CATEGORY PREFERENCE
  // ========================================
  
  /**
   * Update a single category preference
   */
  async updateCategoryPreference(
    userId: string,
    orgId: string,
    category: NotificationCategory,
    channelPrefs: {
      email?: boolean | EmailFrequency;
      slack?: boolean;
      inApp?: boolean;
      push?: boolean;
      minPriority?: NotificationPriority;
    }
  ): Promise<void> {
    // Get current preferences
    const current = await this.getPreferences(userId, orgId);
    
    // Update the specific category
    const updatedCategoryPrefs = {
      ...current.categoryPreferences,
      [category]: {
        ...current.categoryPreferences[category],
        ...channelPrefs
      }
    };
    
    await this.updatePreferences(userId, orgId, {
      categoryPreferences: updatedCategoryPrefs
    });
  }
  
  // ========================================
  // CHECK IF SHOULD NOTIFY
  // ========================================
  
  /**
   * Check if a user should receive a notification
   */
  async shouldNotify(
    userId: string,
    orgId: string,
    category: NotificationCategory,
    priority: NotificationPriority,
    channel: NotificationChannel,
    sourceType?: string,
    sourceId?: string
  ): Promise<boolean> {
    const { data } = await this.supabase
      .rpc('should_receive_notification', {
        p_user_id: userId,
        p_org_id: orgId,
        p_category: category,
        p_priority: priority,
        p_channel: channel,
        p_source_type: sourceType,
        p_source_id: sourceId
      });
    
    return data ?? false;
  }
  
  /**
   * Get effective channels for a notification
   */
  async getEffectiveChannels(
    userId: string,
    orgId: string,
    category: NotificationCategory,
    priority: NotificationPriority
  ): Promise<NotificationChannel[]> {
    const prefs = await this.getPreferences(userId, orgId);
    const channels: NotificationChannel[] = [];
    
    const categoryPref = prefs.categoryPreferences[category] ?? {};
    
    // Check each channel
    if (prefs.inAppEnabled && categoryPref.inApp !== false) {
      channels.push('in_app');
    }
    
    if (prefs.emailEnabled && categoryPref.email !== false) {
      // Handle digest vs instant
      if (categoryPref.email === 'daily' || categoryPref.email === 'weekly') {
        // Will be batched, still counts as a channel
        channels.push('email');
      } else if (prefs.emailFrequency !== 'never') {
        channels.push('email');
      }
    }
    
    if (prefs.slackEnabled && categoryPref.slack !== false) {
      channels.push('slack');
    }
    
    if (prefs.pushEnabled && categoryPref.push !== false) {
      channels.push('push');
    }
    
    return channels;
  }
  
  // ========================================
  // SUBSCRIPTIONS
  // ========================================
  
  /**
   * Subscribe to a specific resource
   */
  async subscribe(
    userId: string,
    orgId: string,
    subscriptionType: string,
    targetId: string,
    channels: NotificationChannel[],
    minSeverity?: NotificationPriority
  ): Promise<NotificationSubscription> {
    const { data, error } = await this.supabase
      .from('notification_subscriptions')
      .upsert({
        user_id: userId,
        org_id: orgId,
        subscription_type: subscriptionType,
        target_id: targetId,
        channels,
        min_severity: minSeverity,
        enabled: true
      }, {
        onConflict: 'user_id,org_id,subscription_type,target_id'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      orgId: data.org_id,
      subscriptionType: data.subscription_type,
      targetId: data.target_id,
      channels: data.channels,
      minSeverity: data.min_severity,
      enabled: data.enabled,
      createdAt: data.created_at
    };
  }
  
  /**
   * Unsubscribe from a resource
   */
  async unsubscribe(
    userId: string,
    orgId: string,
    subscriptionType: string,
    targetId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('notification_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('subscription_type', subscriptionType)
      .eq('target_id', targetId);
    
    if (error) {
      throw new Error(`Failed to delete subscription: ${error.message}`);
    }
  }
  
  /**
   * Get subscriptions for a user
   */
  async getSubscriptions(
    userId: string,
    orgId: string
  ): Promise<NotificationSubscription[]> {
    const { data, error } = await this.supabase
      .from('notification_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('enabled', true);
    
    if (error) {
      throw new Error(`Failed to get subscriptions: ${error.message}`);
    }
    
    return data.map(row => ({
      id: row.id,
      userId: row.user_id,
      orgId: row.org_id,
      subscriptionType: row.subscription_type,
      targetId: row.target_id,
      channels: row.channels,
      minSeverity: row.min_severity,
      enabled: row.enabled,
      createdAt: row.created_at
    }));
  }
  
  // ========================================
  // MUTES
  // ========================================
  
  /**
   * Mute notifications from a source
   */
  async mute(
    userId: string,
    orgId: string,
    muteType: string,
    targetId: string,
    duration?: number,  // Minutes, undefined = permanent
    reason?: string
  ): Promise<NotificationMute> {
    const mutedUntil = duration 
      ? new Date(Date.now() + duration * 60 * 1000).toISOString()
      : null;
    
    const { data, error } = await this.supabase
      .from('notification_mutes')
      .upsert({
        user_id: userId,
        org_id: orgId,
        mute_type: muteType,
        target_id: targetId,
        muted_until: mutedUntil,
        reason
      }, {
        onConflict: 'user_id,org_id,mute_type,target_id'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create mute: ${error.message}`);
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      orgId: data.org_id,
      muteType: data.mute_type,
      targetId: data.target_id,
      mutedUntil: data.muted_until,
      reason: data.reason,
      createdAt: data.created_at
    };
  }
  
  /**
   * Unmute a source
   */
  async unmute(
    userId: string,
    orgId: string,
    muteType: string,
    targetId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('notification_mutes')
      .delete()
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('mute_type', muteType)
      .eq('target_id', targetId);
    
    if (error) {
      throw new Error(`Failed to delete mute: ${error.message}`);
    }
  }
  
  /**
   * Get active mutes for a user
   */
  async getActiveMutes(
    userId: string,
    orgId: string
  ): Promise<NotificationMute[]> {
    const { data, error } = await this.supabase
      .from('notification_mutes')
      .select('*')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .or(`muted_until.is.null,muted_until.gt.${new Date().toISOString()}`);
    
    if (error) {
      throw new Error(`Failed to get mutes: ${error.message}`);
    }
    
    return data.map(row => ({
      id: row.id,
      userId: row.user_id,
      orgId: row.org_id,
      muteType: row.mute_type,
      targetId: row.target_id,
      mutedUntil: row.muted_until,
      reason: row.reason,
      createdAt: row.created_at
    }));
  }
  
  // ========================================
  // HELPER METHODS
  // ========================================
  
  private mapPreferences(row: any): NotificationPreferences {
    return {
      id: row.id,
      userId: row.user_id,
      orgId: row.org_id,
      notificationsEnabled: row.notifications_enabled,
      dndEnabled: row.dnd_enabled,
      dndStartTime: row.dnd_start_time,
      dndEndTime: row.dnd_end_time,
      dndTimezone: row.dnd_timezone,
      dndOverrideUrgent: row.dnd_override_urgent,
      emailEnabled: row.email_enabled,
      emailAddress: row.email_address,
      emailFrequency: row.email_frequency,
      emailDigestTime: row.email_digest_time,
      emailDigestDay: row.email_digest_day,
      slackEnabled: row.slack_enabled,
      slackUserId: row.slack_user_id,
      slackDmEnabled: row.slack_dm_enabled,
      pushEnabled: row.push_enabled,
      pushSubscription: row.push_subscription,
      inAppEnabled: row.in_app_enabled,
      inAppSound: row.in_app_sound,
      inAppDesktopNotifications: row.in_app_desktop_notifications,
      categoryPreferences: row.category_preferences ?? {},
      maxNotificationsPerHour: row.max_notifications_per_hour,
      maxEmailsPerDay: row.max_emails_per_day,
      updatedAt: row.updated_at
    };
  }
}
```

I'll continue with the remaining sections in the next part due to length. Let me add the Digest Email Service, Real-Time Delivery, API Routes, React Components, and Background Jobs:

<function_calls>
<invoke name="str_replace">
<parameter name="description">Adding Part 2: Digest Email Service, Real-Time Delivery, API Routes, Components
---

## 11. React Components

### 11.1 Notification Bell with Dropdown

```tsx
// components/notifications/NotificationBell.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Settings, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismiss,
    fetchMore,
    hasMore
  } = useNotifications();
  
  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Real-time notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      // Show toast for new notification
      showNotificationToast(notification);
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        
        {/* Unread Badge */}
        {unreadCount.total > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-full">
            {unreadCount.total > 99 ? '99+' : unreadCount.total}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount.total > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <a
                href="/settings/notifications"
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </a>
            </div>
          </div>
          
          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => markAsRead([notification.id])}
                    onDismiss={() => dismiss(notification.id)}
                  />
                ))}
                
                {hasMore && (
                  <button
                    onClick={fetchMore}
                    className="w-full py-3 text-sm text-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Load more
                  </button>
                )}
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <a
              href="/notifications"
              className="block w-full py-2 text-center text-sm text-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDismiss: () => void;
}

function NotificationItem({ notification, onRead, onDismiss }: NotificationItemProps) {
  const isUnread = !notification.readAt;
  
  const priorityColors = {
    urgent: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
    high: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    normal: 'border-l-blue-500',
    low: 'border-l-gray-300'
  };
  
  const categoryIcons: Record<string, string> = {
    alert: '🔔',
    budget: '💰',
    optimization: '💡',
    provider: '🔌',
    report: '📄',
    team: '👥',
    system: '📢',
    billing: '💳',
    security: '🔐'
  };
  
  return (
    <div
      className={cn(
        'relative px-4 py-3 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
        priorityColors[notification.priority],
        isUnread && 'bg-purple-50/50 dark:bg-purple-900/10'
      )}
      onClick={() => {
        if (isUnread) onRead();
        if (notification.primaryActionUrl) {
          window.location.href = notification.primaryActionUrl;
        }
      }}
    >
      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-gray-400" />
      </button>
      
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-xl">
          {categoryIcons[notification.category] || '📌'}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'text-sm truncate',
              isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
            )}>
              {notification.title}
            </h4>
            {isUnread && (
              <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-purple-500" />
            )}
          </div>
          
          {/* Body */}
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {notification.body}
          </p>
          
          {/* Meta */}
          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
            <span>{notification.category}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 11.2 Notification Preferences Page

```tsx
// components/notifications/NotificationPreferencesPage.tsx

'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Clock, Moon, Volume2 } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { NOTIFICATION_CATEGORIES } from '@/lib/notifications/categories';

export function NotificationPreferencesPage() {
  const { preferences, updatePreferences, isLoading, isSaving } = useNotificationPreferences();
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading preferences...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notification Preferences
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Control how and when you receive notifications from TokenTra.
        </p>
      </div>
      
      {/* Master Toggle */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                All Notifications
              </h2>
              <p className="text-sm text-gray-500">
                Master toggle for all notifications
              </p>
            </div>
          </div>
          <Toggle
            checked={preferences.notificationsEnabled}
            onChange={(checked) => updatePreferences({ notificationsEnabled: checked })}
          />
        </div>
      </section>
      
      {/* Channels */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        <div className="p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            Notification Channels
          </h2>
          
          <div className="space-y-4">
            {/* In-App */}
            <ChannelToggle
              icon={<Bell className="w-5 h-5" />}
              title="In-App Notifications"
              description="Notifications in the app notification center"
              checked={preferences.inAppEnabled}
              onChange={(checked) => updatePreferences({ inAppEnabled: checked })}
            />
            
            {/* Email */}
            <ChannelToggle
              icon={<Mail className="w-5 h-5" />}
              title="Email Notifications"
              description="Receive notifications via email"
              checked={preferences.emailEnabled}
              onChange={(checked) => updatePreferences({ emailEnabled: checked })}
            >
              {preferences.emailEnabled && (
                <div className="mt-3 pl-10 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Frequency
                    </label>
                    <select
                      value={preferences.emailFrequency}
                      onChange={(e) => updatePreferences({ emailFrequency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="instant">Instant</option>
                      <option value="hourly">Hourly Digest</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                    </select>
                  </div>
                  
                  {(preferences.emailFrequency === 'daily' || preferences.emailFrequency === 'weekly') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Digest Time
                      </label>
                      <input
                        type="time"
                        value={preferences.emailDigestTime}
                        onChange={(e) => updatePreferences({ emailDigestTime: e.target.value })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                  )}
                </div>
              )}
            </ChannelToggle>
            
            {/* Slack */}
            <ChannelToggle
              icon={<MessageSquare className="w-5 h-5" />}
              title="Slack Notifications"
              description="Receive notifications in Slack"
              checked={preferences.slackEnabled}
              onChange={(checked) => updatePreferences({ slackEnabled: checked })}
            />
            
            {/* Push */}
            <ChannelToggle
              icon={<Smartphone className="w-5 h-5" />}
              title="Push Notifications"
              description="Browser and mobile push notifications"
              checked={preferences.pushEnabled}
              onChange={(checked) => updatePreferences({ pushEnabled: checked })}
            />
          </div>
        </div>
      </section>
      
      {/* Do Not Disturb */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Moon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Do Not Disturb
              </h2>
              <p className="text-sm text-gray-500">
                Pause notifications during specific hours
              </p>
            </div>
          </div>
          <Toggle
            checked={preferences.dndEnabled}
            onChange={(checked) => updatePreferences({ dndEnabled: checked })}
          />
        </div>
        
        {preferences.dndEnabled && (
          <div className="pl-10 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.dndStartTime}
                  onChange={(e) => updatePreferences({ dndStartTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.dndEndTime}
                  onChange={(e) => updatePreferences({ dndEndTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.dndOverrideUrgent}
                onChange={(e) => updatePreferences({ dndOverrideUrgent: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Allow urgent notifications during Do Not Disturb
              </span>
            </label>
          </div>
        )}
      </section>
      
      {/* Category Preferences */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Notification Categories
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose which types of notifications you want to receive
          </p>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Object.entries(NOTIFICATION_CATEGORIES).map(([key, category]) => (
            <CategoryPreference
              key={key}
              categoryKey={key}
              category={category}
              preferences={preferences.categoryPreferences[key] || {}}
              onChange={(prefs) => {
                updatePreferences({
                  categoryPreferences: {
                    ...preferences.categoryPreferences,
                    [key]: prefs
                  }
                });
              }}
            />
          ))}
        </div>
      </section>
      
      {/* Sound Settings */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Volume2 className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Sound & Desktop
          </h2>
        </div>
        
        <div className="space-y-3 pl-10">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.inAppSound}
              onChange={(e) => updatePreferences({ inAppSound: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Play sound for new notifications
            </span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.inAppDesktopNotifications}
              onChange={(e) => updatePreferences({ inAppDesktopNotifications: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show desktop notifications
            </span>
          </label>
        </div>
      </section>
    </div>
  );
}

// Component implementations...
function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

function ChannelToggle({ 
  icon, 
  title, 
  description, 
  checked, 
  onChange, 
  children 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-gray-400">{icon}</div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {children}
    </div>
  );
}

function CategoryPreference({
  categoryKey,
  category,
  preferences,
  onChange
}: {
  categoryKey: string;
  category: CategoryDefinition;
  preferences: any;
  onChange: (prefs: any) => void;
}) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <span className="text-lg">{getCategoryEmoji(categoryKey)}</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500">{category.description}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-4 pl-11">
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={preferences.inApp !== false}
            onChange={(e) => onChange({ ...preferences, inApp: e.target.checked })}
            className="rounded border-gray-300"
          />
          In-App
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={preferences.email !== false}
            onChange={(e) => onChange({ ...preferences, email: e.target.checked })}
            className="rounded border-gray-300"
          />
          Email
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={preferences.slack === true}
            onChange={(e) => onChange({ ...preferences, slack: e.target.checked })}
            className="rounded border-gray-300"
          />
          Slack
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={preferences.push === true}
            onChange={(e) => onChange({ ...preferences, push: e.target.checked })}
            className="rounded border-gray-300"
          />
          Push
        </label>
      </div>
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    alert: '🔔',
    budget: '💰',
    optimization: '💡',
    provider: '🔌',
    report: '📄',
    team: '👥',
    system: '📢',
    billing: '💳',
    security: '🔐'
  };
  return emojis[category] || '📌';
}
```

### 11.3 React Hooks

```tsx
// hooks/useNotifications.ts

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@/hooks/useOrganization';

export function useNotifications() {
  const { currentOrg } = useOrganization();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<UnreadCount>({ total: 0, byCategory: {}, byPriority: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  
  const fetchNotifications = useCallback(async (reset = false) => {
    if (!currentOrg?.id) return;
    
    setIsLoading(true);
    try {
      const newOffset = reset ? 0 : offset;
      const response = await fetch(
        `/api/notifications?orgId=${currentOrg.id}&limit=20&offset=${newOffset}`
      );
      const data = await response.json();
      
      if (reset) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
      }
      
      setUnreadCount({ total: data.unreadCount, byCategory: {}, byPriority: {} });
      setHasMore(data.hasMore);
      setOffset(newOffset + data.notifications.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id, offset]);
  
  const fetchUnreadCount = useCallback(async () => {
    if (!currentOrg?.id) return;
    
    try {
      const response = await fetch(`/api/notifications/unread-count?orgId=${currentOrg.id}`);
      const data = await response.json();
      setUnreadCount(data);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [currentOrg?.id]);
  
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!currentOrg?.id) return;
    
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrg.id, notificationIds })
      });
      
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id)
            ? { ...n, readAt: new Date().toISOString() }
            : n
        )
      );
      
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [currentOrg?.id, fetchUnreadCount]);
  
  const markAllAsRead = useCallback(async () => {
    if (!currentOrg?.id) return;
    
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrg.id, markAll: true })
      });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      
      setUnreadCount({ total: 0, byCategory: {}, byPriority: {} });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [currentOrg?.id]);
  
  const dismiss = useCallback(async (notificationId: string) => {
    if (!currentOrg?.id) return;
    
    try {
      await fetch(`/api/notifications/${notificationId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrg.id })
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  }, [currentOrg?.id, fetchUnreadCount]);
  
  const fetchMore = useCallback(() => {
    fetchNotifications(false);
  }, [fetchNotifications]);
  
  // Initial fetch
  useEffect(() => {
    fetchNotifications(true);
  }, [currentOrg?.id]);
  
  // Real-time updates
  useEffect(() => {
    if (!currentOrg?.id) return;
    
    const eventSource = new EventSource(`/api/notifications/stream?orgId=${currentOrg.id}`);
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => ({ ...prev, total: prev.total + 1 }));
    };
    
    return () => eventSource.close();
  }, [currentOrg?.id]);
  
  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    dismiss,
    fetchMore,
    refresh: () => fetchNotifications(true)
  };
}

// hooks/useNotificationPreferences.ts

export function useNotificationPreferences() {
  const { currentOrg } = useOrganization();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    async function fetch() {
      if (!currentOrg?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/notifications/preferences?orgId=${currentOrg.id}`);
        const data = await response.json();
        setPreferences(data);
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetch();
  }, [currentOrg?.id]);
  
  const updatePreferences = useCallback(async (updates: NotificationPreferencesUpdate) => {
    if (!currentOrg?.id || !preferences) return;
    
    // Optimistic update
    setPreferences({ ...preferences, ...updates });
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: currentOrg.id, ...updates })
      });
      
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      // Revert optimistic update
      // Could refetch here
    } finally {
      setIsSaving(false);
    }
  }, [currentOrg?.id, preferences]);
  
  return {
    preferences: preferences as NotificationPreferences,
    isLoading,
    isSaving,
    updatePreferences
  };
}
```

---

## 12. Background Jobs

```typescript
// lib/jobs/notificationJobs.ts

import { CronJob } from 'cron';
import { DigestEmailService } from '@/lib/services/DigestEmailService';
import { createClient } from '@supabase/supabase-js';

const digestService = new DigestEmailService();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ============================================
// PROCESS EMAIL DIGESTS
// Runs every 15 minutes
// ============================================

export const processDigestsJob = new CronJob(
  '*/15 * * * *',  // Every 15 minutes
  async () => {
    console.log('[Notifications] Processing email digests...');
    
    try {
      const processed = await digestService.processDigests();
      console.log(`[Notifications] Processed ${processed} digest items`);
    } catch (error) {
      console.error('[Notifications] Failed to process digests:', error);
    }
  },
  null,
  false,
  'UTC'
);

// ============================================
// CLEANUP EXPIRED NOTIFICATIONS
// Runs daily at 3 AM
// ============================================

export const cleanupExpiredJob = new CronJob(
  '0 3 * * *',  // Daily at 3 AM
  async () => {
    console.log('[Notifications] Cleaning up expired notifications...');
    
    try {
      const { data } = await supabase.rpc('cleanup_expired_notifications');
      console.log(`[Notifications] Archived ${data} expired notifications`);
    } catch (error) {
      console.error('[Notifications] Failed to cleanup:', error);
    }
  },
  null,
  false,
  'UTC'
);

// ============================================
// RETRY FAILED DELIVERIES
// Runs every 5 minutes
// ============================================

export const retryFailedDeliveriesJob = new CronJob(
  '*/5 * * * *',  // Every 5 minutes
  async () => {
    console.log('[Notifications] Retrying failed deliveries...');
    
    try {
      // Get failed deliveries that are due for retry
      const { data: pending } = await supabase
        .from('notification_delivery_log')
        .select(`
          id,
          notification_id,
          channel,
          attempt_count,
          notifications (*)
        `)
        .eq('status', 'failed')
        .lt('attempt_count', 3)
        .lte('next_retry_at', new Date().toISOString())
        .limit(100);
      
      if (!pending?.length) {
        return;
      }
      
      console.log(`[Notifications] Found ${pending.length} deliveries to retry`);
      
      for (const delivery of pending) {
        // Retry logic here...
        // Update attempt_count and next_retry_at
      }
    } catch (error) {
      console.error('[Notifications] Failed to retry deliveries:', error);
    }
  },
  null,
  false,
  'UTC'
);

// ============================================
// CLEAR OLD DELIVERY LOGS
// Runs weekly on Sunday at 4 AM
// ============================================

export const clearOldLogsJob = new CronJob(
  '0 4 * * 0',  // Weekly on Sunday at 4 AM
  async () => {
    console.log('[Notifications] Clearing old delivery logs...');
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { error } = await supabase
        .from('notification_delivery_log')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());
      
      if (error) {
        throw error;
      }
      
      console.log('[Notifications] Cleared old delivery logs');
    } catch (error) {
      console.error('[Notifications] Failed to clear logs:', error);
    }
  },
  null,
  false,
  'UTC'
);

// ============================================
// START ALL JOBS
// ============================================

export function startNotificationJobs() {
  processDigestsJob.start();
  cleanupExpiredJob.start();
  retryFailedDeliveriesJob.start();
  clearOldLogsJob.start();
  
  console.log('[Notifications] All notification jobs started');
}

export function stopNotificationJobs() {
  processDigestsJob.stop();
  cleanupExpiredJob.stop();
  retryFailedDeliveriesJob.stop();
  clearOldLogsJob.stop();
  
  console.log('[Notifications] All notification jobs stopped');
}
```

```sql
-- pg_cron jobs (run in Supabase SQL editor)

-- Process digests every 15 minutes
SELECT cron.schedule(
  'process-notification-digests',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://app.tokentra.io/api/cron/process-digests',
    headers := '{"Authorization": "Bearer ' || current_setting('app.cron_secret') || '"}'::jsonb
  );
  $$
);

-- Cleanup expired notifications daily
SELECT cron.schedule(
  'cleanup-expired-notifications',
  '0 3 * * *',
  $$
  SELECT cleanup_expired_notifications();
  $$
);

-- Clear processed digest queue items daily
SELECT cron.schedule(
  'clear-processed-digests',
  '0 4 * * *',
  $$
  DELETE FROM email_digest_queue
  WHERE processed = true
    AND processed_at < NOW() - INTERVAL '7 days';
  $$
);
```

---

## 13. Integration Guide

### 13.1 Sending Notifications from Other Services

```typescript
// Example: Alerting Engine integration

import { NotificationDeliveryService } from '@/lib/services/NotificationDeliveryService';

const notificationService = new NotificationDeliveryService();

// In AlertingEngine.ts
async function onAlertTriggered(alert: Alert, orgId: string) {
  // Get users who should be notified
  const recipients = await getAlertRecipients(alert);
  
  for (const userId of recipients) {
    await notificationService.createAndDeliver({
      recipientType: 'user',
      recipientId: userId,
      templateKey: `alert_${alert.type}`,
      templateVariables: {
        alertId: alert.id,
        metric: alert.rule.metric,
        currentValue: formatCurrency(alert.currentValue),
        threshold: formatCurrency(alert.thresholdValue),
        topContributors: alert.context.topContributors
      },
      sourceType: 'alert',
      sourceId: alert.id,
      metadata: {
        alertType: alert.type,
        severity: alert.severity
      }
    }, orgId);
  }
}

// Example: Budget System integration

async function onBudgetThresholdReached(
  budget: Budget,
  percentage: number,
  orgId: string
) {
  // Notify budget owner and admins
  const recipients = await getBudgetNotificationRecipients(budget);
  
  for (const userId of recipients) {
    await notificationService.createAndDeliver({
      recipientType: 'user',
      recipientId: userId,
      templateKey: percentage >= 100 ? 'alert_budget_exceeded' : 'alert_budget_warning',
      templateVariables: {
        budgetId: budget.id,
        budgetName: budget.name,
        percentage: percentage.toFixed(1),
        currentSpend: formatCurrency(budget.currentSpend),
        budgetAmount: formatCurrency(budget.amount),
        daysRemaining: budget.daysRemaining
      },
      sourceType: 'budget',
      sourceId: budget.id
    }, orgId);
  }
}
```

### 13.2 Subscribing to Real-Time Notifications

```typescript
// Client-side subscription

import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`
      },
      (payload) => {
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}
```

### 13.3 Environment Variables

```env
# Email (Resend)
RESEND_API_KEY=re_...

# Web Push (VAPID)
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# Slack
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...

# Redis (for real-time pub/sub)
REDIS_URL=redis://...
```

---

## Summary

The TokenTra Notification System provides:

| Feature | Description |
|---------|-------------|
| **Multi-Channel Delivery** | In-app, email, Slack, push notifications |
| **User Preferences** | Per-channel, per-category, DND settings |
| **Digest Emails** | Hourly, daily, weekly batching |
| **Real-Time Updates** | Instant in-app notifications via Supabase Realtime |
| **Template System** | Reusable, customizable notification templates |
| **Muting & Subscriptions** | Fine-grained control over what to receive |
| **Delivery Tracking** | Full audit trail of delivery attempts |
| **Background Jobs** | Automated digest processing and cleanup |

This system ensures users stay informed about their AI costs without notification fatigue—delivering the right information, to the right person, at the right time, through the right channel.
