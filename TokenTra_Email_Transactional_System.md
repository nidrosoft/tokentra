# TokenTra Email Transactional System - Complete Specification

## Overview

This document specifies the complete email transactional system for TokenTra using Resend as the email provider. It covers all transactional emails across the platform including onboarding, alerts, billing, team management, and system notifications.

---

## 1. Email System Architecture

```
EMAIL SYSTEM ARCHITECTURE
=========================

┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐              │
│   │   Onboarding  │  │    Alerts     │  │    Billing    │              │
│   │    Service    │  │    Engine     │  │    Service    │              │
│   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘              │
│           │                  │                  │                       │
│           └──────────────────┼──────────────────┘                       │
│                              │                                          │
│                              ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    EMAIL SERVICE                                 │   │
│   │                                                                  │   │
│   │   • Template rendering (React Email)                            │   │
│   │   • Email queuing                                               │   │
│   │   • Preference checking                                         │   │
│   │   • Rate limiting                                               │   │
│   │   • Logging & tracking                                          │   │
│   │                                                                  │   │
│   └─────────────────────────────┬───────────────────────────────────┘   │
│                                 │                                       │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         RESEND API                                       │
│                                                                          │
│   • High deliverability                                                 │
│   • React Email support                                                 │
│   • Webhook events                                                      │
│   • Analytics & tracking                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Resend Integration

### 2.1 Configuration

```typescript
// lib/email/resend.ts

import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_CONFIG = {
  from: {
    default: 'TokenTra <hello@tokentra.com>',
    alerts: 'TokenTra Alerts <alerts@tokentra.com>',
    billing: 'TokenTra Billing <billing@tokentra.com>',
    security: 'TokenTra Security <security@tokentra.com>',
    noreply: 'TokenTra <noreply@tokentra.com>',
  },
  replyTo: {
    default: 'support@tokentra.com',
    billing: 'billing@tokentra.com',
  },
  rateLimits: {
    alerts: { perHour: 10, perDay: 50 },
    digests: { perDay: 2 },
    marketing: { perWeek: 2 },
  },
  domain: 'tokentra.com',
  webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
};
```

### 2.2 Environment Variables

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM_DEFAULT=TokenTra <hello@tokentra.com>
APP_URL=https://app.tokentra.com
EMAIL_UNSUBSCRIBE_SECRET=your-secret-key
```

---

## 3. Email Types Registry

```typescript
// lib/email/types.ts

export type EmailCategory = 
  | 'onboarding'
  | 'alerts'
  | 'billing'
  | 'team'
  | 'security'
  | 'reports'
  | 'system';

export interface EmailType {
  id: string;
  name: string;
  category: EmailCategory;
  description: string;
  defaultEnabled: boolean;
  canDisable: boolean;
  frequency?: 'immediate' | 'batched' | 'scheduled';
}

export const EMAIL_TYPES: Record<string, EmailType> = {
  // ONBOARDING
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    category: 'onboarding',
    description: 'Sent immediately after signup',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  onboarding_reminder: {
    id: 'onboarding_reminder',
    name: 'Onboarding Reminder',
    category: 'onboarding',
    description: 'Reminder to complete setup',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'scheduled',
  },
  first_data_ready: {
    id: 'first_data_ready',
    name: 'First Data Ready',
    category: 'onboarding',
    description: 'Notification when first sync completes',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'immediate',
  },
  
  // ALERTS
  spend_threshold: {
    id: 'spend_threshold',
    name: 'Spend Threshold Alert',
    category: 'alerts',
    description: 'Alert when spending exceeds threshold',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'immediate',
  },
  budget_warning: {
    id: 'budget_warning',
    name: 'Budget Warning',
    category: 'alerts',
    description: 'Warning when approaching budget limit',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'immediate',
  },
  budget_exceeded: {
    id: 'budget_exceeded',
    name: 'Budget Exceeded',
    category: 'alerts',
    description: 'Alert when budget is exceeded',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'immediate',
  },
  anomaly_detected: {
    id: 'anomaly_detected',
    name: 'Anomaly Detected',
    category: 'alerts',
    description: 'Alert for unusual spending patterns',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'immediate',
  },
  provider_error: {
    id: 'provider_error',
    name: 'Provider Error',
    category: 'alerts',
    description: 'Alert when provider sync fails',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'immediate',
  },
  
  // BILLING
  payment_receipt: {
    id: 'payment_receipt',
    name: 'Payment Receipt',
    category: 'billing',
    description: 'Receipt after successful payment',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  payment_failed: {
    id: 'payment_failed',
    name: 'Payment Failed',
    category: 'billing',
    description: 'Alert when payment fails',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  trial_ending: {
    id: 'trial_ending',
    name: 'Trial Ending Soon',
    category: 'billing',
    description: 'Reminder that trial is ending',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'scheduled',
  },
  subscription_updated: {
    id: 'subscription_updated',
    name: 'Subscription Updated',
    category: 'billing',
    description: 'Confirmation of plan change',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  invoice_available: {
    id: 'invoice_available',
    name: 'Invoice Available',
    category: 'billing',
    description: 'Monthly invoice is ready',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  
  // TEAM
  team_invite: {
    id: 'team_invite',
    name: 'Team Invitation',
    category: 'team',
    description: 'Invitation to join organization',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  team_member_joined: {
    id: 'team_member_joined',
    name: 'Team Member Joined',
    category: 'team',
    description: 'Notification when someone joins',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'immediate',
  },
  team_role_changed: {
    id: 'team_role_changed',
    name: 'Role Changed',
    category: 'team',
    description: 'Notification of role change',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  
  // SECURITY
  password_reset: {
    id: 'password_reset',
    name: 'Password Reset',
    category: 'security',
    description: 'Password reset instructions',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  password_changed: {
    id: 'password_changed',
    name: 'Password Changed',
    category: 'security',
    description: 'Confirmation of password change',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  email_changed: {
    id: 'email_changed',
    name: 'Email Changed',
    category: 'security',
    description: 'Confirmation of email change',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  new_login: {
    id: 'new_login',
    name: 'New Login Detected',
    category: 'security',
    description: 'Alert for login from new device/location',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'immediate',
  },
  api_key_created: {
    id: 'api_key_created',
    name: 'API Key Created',
    category: 'security',
    description: 'Notification when API key is created',
    defaultEnabled: true,
    canDisable: false,
    frequency: 'immediate',
  },
  
  // REPORTS
  weekly_digest: {
    id: 'weekly_digest',
    name: 'Weekly Digest',
    category: 'reports',
    description: 'Weekly spending summary',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'scheduled',
  },
  monthly_report: {
    id: 'monthly_report',
    name: 'Monthly Report',
    category: 'reports',
    description: 'Monthly cost report',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'scheduled',
  },
  optimization_insights: {
    id: 'optimization_insights',
    name: 'Optimization Insights',
    category: 'reports',
    description: 'Cost saving recommendations',
    defaultEnabled: true,
    canDisable: true,
    frequency: 'scheduled',
  },
};
```

---

## 4. Email Service Implementation

```typescript
// lib/email/EmailService.ts

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { EMAIL_CONFIG, EMAIL_TYPES, EmailType } from './types';
import jwt from 'jsonwebtoken';

// Import templates
import WelcomeEmail from './templates/welcome';
import OnboardingReminderEmail from './templates/onboarding-reminder';
import FirstDataReadyEmail from './templates/first-data-ready';
import SpendThresholdAlertEmail from './templates/alerts/spend-threshold';
import BudgetWarningEmail from './templates/alerts/budget-warning';
import AnomalyDetectedEmail from './templates/alerts/anomaly-detected';
import PaymentReceiptEmail from './templates/billing/payment-receipt';
import TrialEndingEmail from './templates/billing/trial-ending';
import TeamInviteEmail from './templates/team/team-invite';
import PasswordResetEmail from './templates/security/password-reset';
import WeeklyDigestEmail from './templates/reports/weekly-digest';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Template mapping
const TEMPLATES: Record<string, React.ComponentType<any>> = {
  welcome: WelcomeEmail,
  onboarding_reminder: OnboardingReminderEmail,
  first_data_ready: FirstDataReadyEmail,
  spend_threshold: SpendThresholdAlertEmail,
  budget_warning: BudgetWarningEmail,
  anomaly_detected: AnomalyDetectedEmail,
  payment_receipt: PaymentReceiptEmail,
  trial_ending: TrialEndingEmail,
  team_invite: TeamInviteEmail,
  password_reset: PasswordResetEmail,
  weekly_digest: WeeklyDigestEmail,
};

export class EmailService {
  /**
   * Send an email
   */
  async send(
    type: string,
    to: string,
    data: Record<string, any>
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // 1. Check if email type exists
      const emailType = EMAIL_TYPES[type];
      if (!emailType) {
        throw new Error(`Unknown email type: ${type}`);
      }
      
      // 2. Get user preferences
      const preferences = await this.getPreferences(to);
      
      // 3. Check if user has opted out
      if (preferences && !this.shouldSend(emailType, preferences)) {
        console.log(`Email ${type} skipped for ${to} - user opted out`);
        return { success: true, id: 'skipped' };
      }
      
      // 4. Check rate limits
      const rateLimitOk = await this.checkRateLimit(to, emailType.category);
      if (!rateLimitOk) {
        console.log(`Email ${type} rate limited for ${to}`);
        return { success: false, error: 'rate_limited' };
      }
      
      // 5. Get template
      const Template = TEMPLATES[type];
      if (!Template) {
        throw new Error(`No template found for: ${type}`);
      }
      
      // 6. Add unsubscribe URL
      if (emailType.canDisable) {
        data.unsubscribeUrl = this.generateUnsubscribeUrl(
          data.userId || to,
          to,
          emailType.category
        );
      }
      
      // 7. Determine sender
      const from = this.getSender(emailType.category);
      
      // 8. Generate subject
      const subject = this.getSubject(type, data);
      
      // 9. Send via Resend
      const { data: sendResult, error } = await resend.emails.send({
        from,
        to,
        subject,
        react: Template(data),
        headers: {
          'X-Email-Type': type,
          'X-Email-Category': emailType.category,
        },
      });
      
      if (error) throw error;
      
      // 10. Log the email
      await this.logEmail({
        userId: data.userId,
        email: to,
        emailType: type,
        subject,
        from,
        resendId: sendResult?.id,
        status: 'sent',
        templateData: data,
      });
      
      return { success: true, id: sendResult?.id };
      
    } catch (error) {
      console.error(`Failed to send ${type} email to ${to}:`, error);
      
      await this.logEmail({
        email: to,
        emailType: type,
        subject: this.getSubject(type, data),
        from: this.getSender(EMAIL_TYPES[type]?.category || 'default'),
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        templateData: data,
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  /**
   * Queue email for later
   */
  async queue(
    type: string,
    to: string,
    data: Record<string, any>,
    sendAt: Date
  ): Promise<{ success: boolean; id?: string }> {
    const { data: scheduled, error } = await supabase
      .from('scheduled_emails')
      .insert({
        user_id: data.userId,
        email: to,
        email_type: type,
        template_data: data,
        scheduled_for: sendAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to queue email:', error);
      return { success: false };
    }
    
    return { success: true, id: scheduled.id };
  }
  
  private async getPreferences(email: string) {
    const { data } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('email', email)
      .single();
    return data;
  }
  
  private shouldSend(emailType: EmailType, preferences: any): boolean {
    if (!emailType.canDisable) return true;
    if (preferences.unsubscribed_from_all) return false;
    
    switch (emailType.category) {
      case 'onboarding': return preferences.onboarding_emails;
      case 'alerts': return preferences.alert_emails;
      case 'team': return preferences.team_emails;
      case 'reports': return preferences.report_emails;
      default: return true;
    }
  }
  
  private async checkRateLimit(email: string, category: string): Promise<boolean> {
    const limits = EMAIL_CONFIG.rateLimits[category as keyof typeof EMAIL_CONFIG.rateLimits];
    if (!limits) return true;
    
    if (limits.perHour) {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { count } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', hourAgo.toISOString());
      
      if ((count || 0) >= limits.perHour) return false;
    }
    
    return true;
  }
  
  private generateUnsubscribeUrl(userId: string, email: string, category: string): string {
    const token = jwt.sign(
      { userId, email },
      process.env.EMAIL_UNSUBSCRIBE_SECRET!,
      { expiresIn: '30d' }
    );
    return `${process.env.APP_URL}/api/email/unsubscribe?token=${token}&category=${category}`;
  }
  
  private getSender(category: string): string {
    return EMAIL_CONFIG.from[category as keyof typeof EMAIL_CONFIG.from] 
      || EMAIL_CONFIG.from.default;
  }
  
  private getSubject(type: string, data: Record<string, any>): string {
    const subjects: Record<string, string | ((d: any) => string)> = {
      welcome: 'Welcome to TokenTra! 👋',
      onboarding_reminder: "Let's finish setting up your TokenTra account",
      first_data_ready: '🎉 Your AI cost data is ready!',
      spend_threshold: (d) => `⚠️ AI Spend Alert: ${d.currentSpend} (${d.percentOfThreshold}% of limit)`,
      budget_warning: (d) => `⚠️ Budget Warning: ${d.budgetOwner} at ${d.percentUsed}%`,
      anomaly_detected: (d) => `🚨 Anomaly Detected: ${d.description}`,
      payment_receipt: (d) => `Receipt for your ${d.amount} payment`,
      trial_ending: (d) => `Your trial ends in ${d.daysRemaining} days`,
      team_invite: (d) => `${d.inviterName} invited you to join ${d.organizationName}`,
      password_reset: 'Reset your TokenTra password',
      weekly_digest: (d) => `Weekly AI Cost Report: ${d.totalSpend}`,
    };
    
    const subject = subjects[type];
    return typeof subject === 'function' ? subject(data) : subject || 'TokenTra Notification';
  }
  
  private async logEmail(log: any): Promise<void> {
    await supabase.from('email_logs').insert({
      user_id: log.userId,
      email: log.email,
      email_type: log.emailType,
      subject: log.subject,
      from_address: log.from,
      resend_id: log.resendId,
      status: log.status,
      error_message: log.errorMessage,
      template_data: log.templateData,
      sent_at: log.status === 'sent' ? new Date().toISOString() : null,
    });
  }
}

export const emailService = new EmailService();

export async function sendEmail(type: string, to: string, data: Record<string, any>) {
  return emailService.send(type, to, data);
}

export async function queueEmail(type: string, to: string, data: Record<string, any>, sendAt?: Date) {
  if (sendAt) return emailService.queue(type, to, data, sendAt);
  return emailService.send(type, to, data);
}
```

---

## 5. Email Templates

### 5.1 Base Template

```typescript
// lib/email/templates/BaseTemplate.tsx

import {
  Body, Container, Head, Html, Img, Link,
  Preview, Section, Text, Hr, Font,
} from '@react-email/components';
import * as React from 'react';

interface BaseTemplateProps {
  previewText: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
}

export function BaseTemplate({ previewText, children, unsubscribeUrl }: BaseTemplateProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://tokentra.com/logo.png"
              width="140"
              height="40"
              alt="TokenTra"
            />
          </Section>
          
          {/* Content */}
          <Section style={styles.main}>
            {children}
          </Section>
          
          {/* Footer */}
          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              TokenTra - AI Cost Intelligence Platform
            </Text>
            <Text style={styles.footerLinks}>
              <Link href="https://app.tokentra.com">Dashboard</Link>
              {' • '}
              <Link href="https://docs.tokentra.com">Docs</Link>
              {' • '}
              <Link href="https://tokentra.com/support">Support</Link>
            </Text>
            {unsubscribeUrl && (
              <Text style={styles.unsubscribe}>
                <Link href={unsubscribeUrl}>Unsubscribe</Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: 'Inter, -apple-system, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #e6ebf1',
    borderRadius: '8px',
    margin: '40px auto',
    maxWidth: '600px',
  },
  header: {
    backgroundColor: '#0f172a',
    borderRadius: '8px 8px 0 0',
    padding: '24px 40px',
    textAlign: 'center' as const,
  },
  main: { padding: '40px' },
  hr: { borderColor: '#e6ebf1', margin: '0' },
  footer: { padding: '24px 40px', textAlign: 'center' as const },
  footerText: { color: '#8898aa', fontSize: '12px', margin: '0 0 8px' },
  footerLinks: { color: '#8898aa', fontSize: '12px', margin: '0 0 8px' },
  unsubscribe: { color: '#8898aa', fontSize: '11px', marginTop: '16px' },
};
```

### 5.2 Welcome Email

```typescript
// lib/email/templates/welcome.tsx

import { Text, Section, Link, Row, Column } from '@react-email/components';
import * as React from 'react';
import { BaseTemplate } from './BaseTemplate';

interface WelcomeEmailProps {
  name: string;
  email: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  const firstName = name.split(' ')[0];
  
  return (
    <BaseTemplate previewText={`Welcome to TokenTra, ${firstName}!`}>
      <Text style={styles.heading}>
        Welcome to TokenTra, {firstName}! 👋
      </Text>
      
      <Text style={styles.paragraph}>
        Thanks for signing up! You're about to get complete visibility 
        into your AI spending across all providers.
      </Text>
      
      <Text style={styles.paragraph}>
        Here's how to get started in under 5 minutes:
      </Text>
      
      <Section style={styles.steps}>
        <Row>
          <Column style={styles.stepNumber}>1</Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>Connect your AI provider</Text>
            <Text style={styles.stepDescription}>
              Link OpenAI, Anthropic, or any provider you use.
            </Text>
          </Column>
        </Row>
        
        <Row style={{ marginTop: '16px' }}>
          <Column style={styles.stepNumber}>2</Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>See your cost breakdown</Text>
            <Text style={styles.stepDescription}>
              View spending by model, provider, and time period.
            </Text>
          </Column>
        </Row>
        
        <Row style={{ marginTop: '16px' }}>
          <Column style={styles.stepNumber}>3</Column>
          <Column style={styles.stepContent}>
            <Text style={styles.stepTitle}>Set up alerts & budgets</Text>
            <Text style={styles.stepDescription}>
              Get notified before costs get out of control.
            </Text>
          </Column>
        </Row>
      </Section>
      
      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <Link
          href="https://app.tokentra.com/onboarding"
          style={styles.button}
        >
          Get Started →
        </Link>
      </Section>
      
      <Text style={styles.signature}>
        — The TokenTra Team
      </Text>
    </BaseTemplate>
  );
}

const styles = {
  heading: {
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 24px',
  },
  paragraph: {
    color: '#334155',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px',
  },
  steps: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    margin: '24px 0',
    padding: '24px',
  },
  stepNumber: {
    backgroundColor: '#0f172a',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    height: '28px',
    lineHeight: '28px',
    textAlign: 'center' as const,
    width: '28px',
  },
  stepContent: { paddingLeft: '16px' },
  stepTitle: {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 4px',
  },
  stepDescription: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0,
  },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 24px',
    textDecoration: 'none',
  },
  signature: {
    color: '#94a3b8',
    fontSize: '14px',
    fontStyle: 'italic' as const,
    margin: '32px 0 0',
  },
};
```

### 5.3 Spend Threshold Alert

```typescript
// lib/email/templates/alerts/spend-threshold.tsx

import { Text, Section, Row, Column, Link } from '@react-email/components';
import * as React from 'react';
import { BaseTemplate } from '../BaseTemplate';

interface SpendThresholdAlertEmailProps {
  name: string;
  alertName: string;
  currentSpend: string;
  threshold: string;
  percentOfThreshold: number;
  period: string;
  topCostDriver: string;
  topCostAmount: string;
  dashboardUrl: string;
}

export default function SpendThresholdAlertEmail({
  name,
  alertName,
  currentSpend,
  threshold,
  percentOfThreshold,
  period,
  topCostDriver,
  topCostAmount,
  dashboardUrl,
}: SpendThresholdAlertEmailProps) {
  const firstName = name.split(' ')[0];
  const isExceeded = percentOfThreshold >= 100;
  
  return (
    <BaseTemplate 
      previewText={`⚠️ AI spend alert: ${currentSpend} (${percentOfThreshold}% of limit)`}
      unsubscribeUrl="https://app.tokentra.com/settings/alerts"
    >
      {/* Alert Banner */}
      <Section style={{
        ...styles.alertBanner,
        backgroundColor: isExceeded ? '#fef2f2' : '#fef3c7',
        borderLeft: `4px solid ${isExceeded ? '#ef4444' : '#f59e0b'}`,
      }}>
        <Text style={{ 
          ...styles.alertTitle,
          color: isExceeded ? '#991b1b' : '#92400e',
        }}>
          {isExceeded ? '🚨 Spending Limit Exceeded!' : '⚠️ Spending Alert Triggered'}
        </Text>
        <Text style={{
          ...styles.alertText,
          color: isExceeded ? '#b91c1c' : '#b45309',
        }}>
          Your AI spending has {isExceeded ? 'exceeded' : 'reached'} {percentOfThreshold}% 
          of your configured threshold.
        </Text>
      </Section>
      
      <Text style={styles.heading}>
        {firstName}, your AI spend needs attention
      </Text>
      
      <Text style={styles.paragraph}>
        Alert "<strong>{alertName}</strong>" was triggered:
      </Text>
      
      {/* Spend Summary */}
      <Section style={styles.spendBox}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={styles.spendLabel}>{period} Spend</Text>
            <Text style={styles.spendValue}>{currentSpend}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={styles.spendLabel}>Threshold</Text>
            <Text style={styles.spendThreshold}>{threshold}</Text>
          </Column>
        </Row>
        
        {/* Progress Bar */}
        <Section style={styles.progressContainer}>
          <Section style={{
            ...styles.progressBar,
            width: `${Math.min(percentOfThreshold, 100)}%`,
            backgroundColor: isExceeded ? '#ef4444' : '#f59e0b',
          }} />
        </Section>
        <Text style={styles.progressText}>{percentOfThreshold}% of threshold</Text>
      </Section>
      
      {/* Top Cost Driver */}
      <Section style={styles.driverSection}>
        <Text style={styles.driverTitle}>📊 Biggest Cost Driver</Text>
        <Row>
          <Column>
            <Text style={styles.driverName}>{topCostDriver}</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={styles.driverAmount}>{topCostAmount}</Text>
          </Column>
        </Row>
      </Section>
      
      {/* CTA */}
      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <Link href={dashboardUrl} style={styles.button}>
          View Details & Take Action →
        </Link>
      </Section>
      
      <Text style={styles.helpText}>
        <strong>Quick actions:</strong>{' '}
        <Link href="https://app.tokentra.com/budgets" style={styles.link}>
          Adjust budget
        </Link>
        {' • '}
        <Link href="https://app.tokentra.com/optimization" style={styles.link}>
          See cost-saving tips
        </Link>
      </Text>
    </BaseTemplate>
  );
}

const styles = {
  alertBanner: {
    borderRadius: '4px',
    margin: '0 0 24px',
    padding: '16px',
  },
  alertTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 4px',
  },
  alertText: {
    fontSize: '14px',
    margin: 0,
  },
  heading: {
    color: '#0f172a',
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 16px',
  },
  paragraph: {
    color: '#334155',
    fontSize: '16px',
    margin: '0 0 16px',
  },
  spendBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    margin: '24px 0',
    padding: '24px',
  },
  spendLabel: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 500,
    margin: '0 0 4px',
    textTransform: 'uppercase' as const,
  },
  spendValue: {
    color: '#0f172a',
    fontSize: '32px',
    fontWeight: 700,
    margin: 0,
  },
  spendThreshold: {
    color: '#64748b',
    fontSize: '24px',
    fontWeight: 600,
    margin: 0,
  },
  progressContainer: {
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    height: '8px',
    marginTop: '20px',
    overflow: 'hidden' as const,
  },
  progressBar: {
    height: '8px',
    borderRadius: '4px',
  },
  progressText: {
    color: '#64748b',
    fontSize: '12px',
    margin: '8px 0 0',
    textAlign: 'right' as const,
  },
  driverSection: {
    borderLeft: '3px solid #3b82f6',
    margin: '24px 0',
    paddingLeft: '16px',
  },
  driverTitle: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 600,
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
  },
  driverName: {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
  },
  driverAmount: {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: 700,
    margin: 0,
  },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 24px',
    textDecoration: 'none',
  },
  helpText: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0,
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
};
```

### 5.4 Payment Receipt

```typescript
// lib/email/templates/billing/payment-receipt.tsx

import { Text, Section, Row, Column, Hr, Link } from '@react-email/components';
import * as React from 'react';
import { BaseTemplate } from '../BaseTemplate';

interface PaymentReceiptEmailProps {
  name: string;
  receiptNumber: string;
  paymentDate: string;
  amount: string;
  plan: string;
  billingPeriod: string;
  paymentMethod: string;
  companyName?: string;
  invoiceUrl: string;
  lineItems: Array<{ description: string; quantity?: string; amount: string }>;
}

export default function PaymentReceiptEmail({
  name, receiptNumber, paymentDate, amount, plan,
  billingPeriod, paymentMethod, companyName, invoiceUrl, lineItems,
}: PaymentReceiptEmailProps) {
  const firstName = name.split(' ')[0];
  
  return (
    <BaseTemplate previewText={`Receipt for your TokenTra payment of ${amount}`}>
      <Section style={styles.receiptHeader}>
        <Text style={styles.receiptTitle}>Payment Receipt</Text>
        <Text style={styles.receiptNumber}>Receipt #{receiptNumber}</Text>
      </Section>
      
      <Text style={styles.greeting}>Hi {firstName},</Text>
      
      <Text style={styles.paragraph}>
        Thank you for your payment. Here's your receipt for {companyName || 'your account'}:
      </Text>
      
      {/* Amount Box */}
      <Section style={styles.amountBox}>
        <Text style={styles.amountLabel}>Amount Paid</Text>
        <Text style={styles.amountValue}>{amount}</Text>
        <Text style={styles.amountDate}>{paymentDate}</Text>
      </Section>
      
      {/* Details */}
      <Section style={styles.details}>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>Plan</Column>
          <Column style={styles.detailValue}>{plan}</Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>Billing Period</Column>
          <Column style={styles.detailValue}>{billingPeriod}</Column>
        </Row>
        <Row style={styles.detailRow}>
          <Column style={styles.detailLabel}>Payment Method</Column>
          <Column style={styles.detailValue}>{paymentMethod}</Column>
        </Row>
      </Section>
      
      <Hr style={styles.hr} />
      
      {/* Line Items */}
      <Section style={styles.lineItems}>
        <Text style={styles.lineItemsTitle}>Summary</Text>
        {lineItems.map((item, index) => (
          <Row key={index} style={styles.lineItem}>
            <Column style={{ width: '70%' }}>
              <Text style={styles.lineItemDesc}>{item.description}</Text>
            </Column>
            <Column style={{ width: '30%', textAlign: 'right' as const }}>
              <Text style={styles.lineItemAmount}>{item.amount}</Text>
            </Column>
          </Row>
        ))}
        
        <Hr style={{ ...styles.hr, margin: '16px 0' }} />
        
        <Row>
          <Column style={{ width: '70%' }}>
            <Text style={styles.totalLabel}>Total</Text>
          </Column>
          <Column style={{ width: '30%', textAlign: 'right' as const }}>
            <Text style={styles.totalAmount}>{amount}</Text>
          </Column>
        </Row>
      </Section>
      
      {/* CTA */}
      <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
        <Link href={invoiceUrl} style={styles.button}>
          Download Invoice (PDF)
        </Link>
      </Section>
      
      <Text style={styles.helpText}>
        Questions about this charge?{' '}
        <Link href="mailto:billing@tokentra.com" style={styles.link}>
          Contact billing support
        </Link>
      </Text>
    </BaseTemplate>
  );
}

const styles = {
  receiptHeader: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    margin: '-40px -40px 24px',
    padding: '32px 40px',
    textAlign: 'center' as const,
  },
  receiptTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 8px',
  },
  receiptNumber: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0,
  },
  greeting: {
    color: '#334155',
    fontSize: '16px',
    margin: '0 0 8px',
  },
  paragraph: {
    color: '#334155',
    fontSize: '16px',
    margin: '0 0 24px',
  },
  amountBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    margin: '24px 0',
    padding: '24px',
    textAlign: 'center' as const,
  },
  amountLabel: {
    color: '#15803d',
    fontSize: '12px',
    fontWeight: 500,
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
  },
  amountValue: {
    color: '#166534',
    fontSize: '36px',
    fontWeight: 700,
    margin: '0 0 4px',
  },
  amountDate: {
    color: '#22c55e',
    fontSize: '14px',
    margin: 0,
  },
  details: { margin: '24px 0' },
  detailRow: { padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
  detailLabel: { color: '#64748b', fontSize: '14px', width: '40%' },
  detailValue: { color: '#0f172a', fontSize: '14px', fontWeight: 500, textAlign: 'right' as const, width: '60%' },
  hr: { borderColor: '#e2e8f0', margin: '24px 0' },
  lineItems: { margin: '24px 0' },
  lineItemsTitle: { color: '#0f172a', fontSize: '16px', fontWeight: 600, margin: '0 0 16px' },
  lineItem: { padding: '8px 0' },
  lineItemDesc: { color: '#334155', fontSize: '14px', margin: 0 },
  lineItemAmount: { color: '#334155', fontSize: '14px', margin: 0 },
  totalLabel: { color: '#0f172a', fontSize: '16px', fontWeight: 600, margin: 0 },
  totalAmount: { color: '#0f172a', fontSize: '18px', fontWeight: 700, margin: 0 },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 24px',
    textDecoration: 'none',
  },
  helpText: { color: '#64748b', fontSize: '14px', margin: 0, textAlign: 'center' as const },
  link: { color: '#3b82f6', textDecoration: 'none' },
};
```

---

## 6. Database Schema

```sql
-- Email preferences
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  
  onboarding_emails BOOLEAN DEFAULT TRUE,
  alert_emails BOOLEAN DEFAULT TRUE,
  billing_emails BOOLEAN DEFAULT TRUE,
  team_emails BOOLEAN DEFAULT TRUE,
  security_emails BOOLEAN DEFAULT TRUE,
  report_emails BOOLEAN DEFAULT TRUE,
  
  weekly_digest BOOLEAN DEFAULT TRUE,
  monthly_report BOOLEAN DEFAULT TRUE,
  
  unsubscribed_from_all BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT email_preferences_user_unique UNIQUE (user_id)
);

-- Email logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  email_type VARCHAR(100) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  resend_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'queued',
  template_data JSONB,
  error_message TEXT,
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_user ON email_logs (user_id, created_at DESC);
CREATE INDEX idx_email_logs_email ON email_logs (email, created_at DESC);
CREATE INDEX idx_email_logs_type ON email_logs (email_type, created_at DESC);

-- Scheduled emails
CREATE TABLE scheduled_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  email_type VARCHAR(100) NOT NULL,
  template_data JSONB,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_emails_pending ON scheduled_emails (scheduled_for) 
  WHERE status = 'pending';
```

---

## 7. Webhook Handler

```typescript
// app/api/webhooks/resend/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const event = JSON.parse(body);
  
  try {
    // Log event
    await supabase.from('email_events').insert({
      email_id: event.data.email_id,
      event_type: event.type,
      event_data: event.data,
    });
    
    // Handle specific events
    switch (event.type) {
      case 'email.bounced':
        // Mark user email as invalid
        await supabase
          .from('users')
          .update({ email_status: 'invalid' })
          .eq('email', event.data.to);
        break;
      
      case 'email.complained':
        // Auto-unsubscribe
        await supabase
          .from('email_preferences')
          .update({ unsubscribed_from_all: true })
          .eq('email', event.data.to);
        break;
      
      case 'email.delivered':
        await supabase
          .from('email_logs')
          .update({ 
            status: 'delivered',
            delivered_at: new Date().toISOString(),
          })
          .eq('resend_id', event.data.email_id);
        break;
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## 8. Email Template Directory Structure

```
lib/email/templates/
├── BaseTemplate.tsx
├── components/
│   ├── Button.tsx
│   ├── Metric.tsx
│   └── Alert.tsx
├── welcome.tsx
├── onboarding-reminder.tsx
├── first-data-ready.tsx
├── alerts/
│   ├── spend-threshold.tsx
│   ├── budget-warning.tsx
│   ├── budget-exceeded.tsx
│   └── anomaly-detected.tsx
├── billing/
│   ├── payment-receipt.tsx
│   ├── payment-failed.tsx
│   ├── trial-ending.tsx
│   └── subscription-updated.tsx
├── team/
│   ├── team-invite.tsx
│   ├── team-member-joined.tsx
│   └── role-changed.tsx
├── security/
│   ├── password-reset.tsx
│   ├── password-changed.tsx
│   └── new-login.tsx
└── reports/
    ├── weekly-digest.tsx
    └── monthly-report.tsx
```

---

## Summary

This email transactional system provides:

1. **Complete Resend integration** with webhooks
2. **20+ email templates** covering all needs
3. **React Email components** for responsive design
4. **User preference management** with unsubscribe
5. **Rate limiting** to prevent email fatigue
6. **Comprehensive logging** for analytics
7. **Scheduled emails** for digests

---

*TokenTra Email Transactional System v1.0*
*December 2025*
