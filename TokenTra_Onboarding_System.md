# TokenTra Onboarding System - Complete Enterprise Specification

## Overview

This document specifies the complete onboarding experience for TokenTra, from initial signup through first value realization. The onboarding system is designed to:

1. **Capture critical user and company information** for personalization and sales qualification
2. **Guide users to their first "aha moment"** (seeing their AI costs visualized)
3. **Educate users on platform capabilities** through contextual guidance
4. **Maximize activation rate** by reducing friction to first value

---

## Table of Contents

1. [Onboarding Philosophy](#1-onboarding-philosophy)
2. [Signup Flow](#2-signup-flow)
3. [Company Profile Questionnaire](#3-company-profile-questionnaire)
4. [Provider Connection Wizard](#4-provider-connection-wizard)
5. [SDK Setup Wizard](#5-sdk-setup-wizard)
6. [First Dashboard Experience](#6-first-dashboard-experience)
7. [Guided Product Tour](#7-guided-product-tour)
8. [Progressive Disclosure](#8-progressive-disclosure)
9. [Onboarding Checklist](#9-onboarding-checklist)
10. [Database Schema](#10-database-schema)
11. [API Routes](#11-api-routes)
12. [UI Components](#12-ui-components)
13. [Analytics & Tracking](#13-analytics--tracking)

---

## 1. Onboarding Philosophy

### 1.1 Core Principles

```
TOKENTRA ONBOARDING PRINCIPLES
==============================

1. TIME TO VALUE < 10 MINUTES
   Get users seeing their AI costs within 10 minutes of signup.
   Everything else can wait.

2. PROGRESSIVE PROFILING
   Don't ask everything upfront. Collect information
   incrementally as users engage with features.

3. CONTEXTUAL EDUCATION
   Teach features when users need them, not before.
   Just-in-time learning beats front-loaded tutorials.

4. CELEBRATE MILESTONES
   Acknowledge progress. Make users feel successful.
   Dopamine drives retention.

5. FRICTIONLESS DEFAULTS
   Smart defaults > configuration screens.
   Let users start with zero setup.

6. CLEAR ESCAPE HATCHES
   Always let users skip or defer.
   Forced tours create resentment.
```

### 1.2 Key Activation Metrics

| Metric | Target | Definition |
|--------|--------|------------|
| Time to First Provider | < 5 min | Time from signup to first provider connected |
| Time to First Data | < 10 min | Time from signup to seeing cost data |
| Day 1 Activation | > 60% | % of users who connect a provider on day 1 |
| Day 7 Retention | > 40% | % of users active after 7 days |
| Onboarding Completion | > 70% | % of users who complete core onboarding |

### 1.3 User Segments & Paths

```
USER SEGMENTATION
=================

┌─────────────────────────────────────────────────────────────────────────┐
│                         SIGNUP ENTRY POINTS                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   [Marketing Site]    [Product Hunt]    [Referral]    [Direct]          │
│         │                   │               │             │              │
│         └───────────────────┴───────────────┴─────────────┘              │
│                                     │                                    │
│                                     ▼                                    │
│                              ┌─────────────┐                            │
│                              │   SIGNUP    │                            │
│                              └──────┬──────┘                            │
│                                     │                                    │
│                    ┌────────────────┼────────────────┐                  │
│                    │                │                │                  │
│                    ▼                ▼                ▼                  │
│             ┌───────────┐    ┌───────────┐    ┌───────────┐            │
│             │  STARTUP  │    │MID-MARKET │    │ENTERPRISE │            │
│             │  < $10K   │    │$10K-$100K │    │  > $100K  │            │
│             │  AI/month │    │  AI/month │    │  AI/month │            │
│             └─────┬─────┘    └─────┬─────┘    └─────┬─────┘            │
│                   │                │                │                   │
│                   ▼                ▼                ▼                   │
│            Self-Serve       Guided Setup     Sales-Assisted            │
│            Onboarding       Onboarding         Onboarding              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

PERSONA-SPECIFIC PATHS:

1. PLATFORM ENGINEER / DEVELOPER
   → Fast-track to SDK setup
   → Technical documentation emphasis
   → API key generation highlighted

2. FINOPS / FINANCE
   → Focus on dashboards and reports
   → Budget and alert setup priority
   → Cost allocation walkthrough

3. CTO / ENGINEERING LEADER
   → Executive summary view
   → Team management features
   → ROI calculator emphasis

4. AGENCY / CONSULTANT
   → Multi-client setup
   → Client billing features
   → White-label options (future)
```

---

## 2. Signup Flow

### 2.1 Signup Page Design

```
SIGNUP PAGE LAYOUT
==================

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │                              │  │                                   │ │
│  │   [TokenTra Logo]            │  │   "See where your AI              │ │
│  │                              │  │    dollars are going"             │ │
│  │   ─────────────────────────  │  │                                   │ │
│  │                              │  │   ✓ Free 14-day trial            │ │
│  │   [Continue with Google]     │  │   ✓ No credit card required      │ │
│  │                              │  │   ✓ Setup in under 5 minutes     │ │
│  │   [Continue with GitHub]     │  │                                   │ │
│  │                              │  │   ─────────────────────────────   │ │
│  │   [Continue with Microsoft]  │  │                                   │ │
│  │                              │  │   "TokenTra helped us cut our     │ │
│  │   ──── or ────               │  │    AI costs by 40% in the        │ │
│  │                              │  │    first month."                  │ │
│  │   Work Email                 │  │                                   │ │
│  │   ┌──────────────────────┐   │  │    — Sarah Chen, CTO @ Acme AI   │ │
│  │   │                      │   │  │                                   │ │
│  │   └──────────────────────┘   │  │   [Company Logos: trusted by]    │ │
│  │                              │  │                                   │ │
│  │   [Continue with Email]      │  │                                   │ │
│  │                              │  │                                   │ │
│  │   By signing up, you agree   │  │                                   │ │
│  │   to our Terms and Privacy   │  │                                   │ │
│  │                              │  │                                   │ │
│  └──────────────────────────────┘  └──────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Authentication Options

```typescript
// lib/auth/signup-options.ts

export interface SignupOptions {
  // Social/SSO providers
  google: {
    enabled: true;
    scopes: ['email', 'profile'];
    allowPersonalAccounts: true;  // Allow gmail.com
    preferWorkspaceAccounts: true;  // Suggest Google Workspace
  };
  
  github: {
    enabled: true;
    scopes: ['user:email', 'read:org'];
    extractOrgInfo: true;  // Get company from GitHub org
  };
  
  microsoft: {
    enabled: true;
    scopes: ['User.Read', 'Organization.Read.All'];
    azureADOnly: false;  // Also allow personal Microsoft accounts
  };
  
  // Email/password
  email: {
    enabled: true;
    requireVerification: true;
    allowedDomains: null;  // null = all domains allowed
    blockedDomains: ['tempmail.com', 'guerrillamail.com'];  // Block disposable
  };
  
  // Enterprise SSO (configured per-org)
  saml: {
    enabled: true;
    onlyForConfiguredDomains: true;
  };
}
```

### 2.3 Signup API Implementation

```typescript
// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),  // Not required for OAuth
  fullName: z.string().min(2),
  authProvider: z.enum(['email', 'google', 'github', 'microsoft']),
  referralSource: z.string().optional(),
  utmParams: z.object({
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_content: z.string().optional(),
    utm_term: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  try {
    const body = await request.json();
    const data = signupSchema.parse(body);
    
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: data.authProvider !== 'email',  // Auto-confirm OAuth
      user_metadata: {
        full_name: data.fullName,
        auth_provider: data.authProvider,
      },
    });
    
    if (authError) throw authError;
    
    // 2. Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        auth_provider: data.authProvider,
        onboarding_status: 'started',
        onboarding_step: 'company_profile',
        signup_metadata: {
          referral_source: data.referralSource,
          utm_params: data.utmParams,
          signup_timestamp: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for'),
          user_agent: request.headers.get('user-agent'),
        },
      });
    
    if (profileError) throw profileError;
    
    // 3. Track signup event
    await trackEvent('user_signed_up', authData.user.id, {
      auth_provider: data.authProvider,
      referral_source: data.referralSource,
      ...data.utmParams,
    });
    
    // 4. Trigger welcome email (async)
    await queueEmail('welcome', data.email, {
      name: data.fullName.split(' ')[0],
    });
    
    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      nextStep: '/onboarding/company',
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 400 }
    );
  }
}
```

---

## 3. Company Profile Questionnaire

### 3.1 Questions & Data Collection

The company profile questionnaire collects information in a conversational, non-intimidating flow. Questions are prioritized by importance.

```
COMPANY PROFILE QUESTIONNAIRE
=============================

STEP 1: BASIC COMPANY INFO (Required)
─────────────────────────────────────

Q1: "What's your company name?"
    Type: Text input
    Field: company_name
    Validation: Required, 2-100 chars
    Why: Core identification

Q2: "What's your role?"
    Type: Single select
    Field: user_role
    Options:
      - "Engineering / Developer"
      - "Platform / DevOps / SRE"
      - "FinOps / Finance"
      - "Engineering Manager / Lead"
      - "CTO / VP Engineering"
      - "Founder / CEO"
      - "Other"
    Why: Personalize onboarding path

Q3: "How many people work at your company?"
    Type: Single select
    Field: company_size
    Options:
      - "Just me (solo/freelance)"
      - "2-10 employees"
      - "11-50 employees"
      - "51-200 employees"
      - "201-1000 employees"
      - "1000+ employees"
    Why: Segment for features and pricing


STEP 2: AI USAGE PROFILE (Required)
───────────────────────────────────

Q4: "Roughly how much do you spend on AI APIs per month?"
    Type: Single select
    Field: monthly_ai_spend
    Options:
      - "Less than $100"
      - "$100 - $1,000"
      - "$1,000 - $10,000"
      - "$10,000 - $50,000"
      - "$50,000 - $100,000"
      - "More than $100,000"
      - "Not sure"
    Why: Critical for segmentation, pricing, sales qualification

Q5: "Which AI providers do you use?" (Select all that apply)
    Type: Multi-select with icons
    Field: ai_providers
    Options:
      - OpenAI (GPT-4, GPT-3.5, etc.)
      - Anthropic (Claude)
      - Google (Gemini, Vertex AI)
      - Azure OpenAI
      - AWS Bedrock
      - Cohere
      - Mistral
      - Other (text input)
    Why: Prioritize provider connections, understand ecosystem

Q6: "What's your primary use case for AI?"
    Type: Multi-select
    Field: use_cases
    Options:
      - "Customer-facing chatbot / assistant"
      - "Internal productivity tools"
      - "Content generation"
      - "Code generation / assistance"
      - "Data analysis / insights"
      - "Search / RAG applications"
      - "Image / video generation"
      - "Research / experimentation"
      - "Other"
    Why: Understand value proposition fit


STEP 3: GOALS & PAIN POINTS (Required)
──────────────────────────────────────

Q7: "What brought you to TokenTra?" (Select all that apply)
    Type: Multi-select
    Field: goals
    Options:
      - "Need visibility into AI costs"
      - "Want to reduce AI spending"
      - "Need to allocate costs to teams/projects"
      - "Want to set budgets and alerts"
      - "Optimizing model selection"
      - "Tracking AI usage for billing clients"
      - "Compliance / governance requirements"
      - "Just exploring"
    Why: Prioritize features to show, tailor onboarding


STEP 4: TEAM SETUP (Optional - Can Skip)
────────────────────────────────────────

Q8: "Would you like to invite team members now?"
    Type: Email list input
    Field: team_invites
    Options:
      - [Email input field - can add multiple]
      - "I'll do this later"
    Why: Increase stickiness, get more users


STEP 5: ADDITIONAL CONTEXT (Optional - Progressive)
───────────────────────────────────────────────────

These questions are asked later, during natural product usage:

Q9: "What's your website?" (Asked when setting up organization)
    Field: company_website
    Why: Enrichment, sales research

Q10: "What industry are you in?" (Asked in settings later)
    Field: industry
    Options: [Standard industry list]
    Why: Benchmarking, content personalization

Q11: "How did you hear about us?" (Asked in settings or via email)
    Field: acquisition_channel
    Why: Marketing attribution
```

### 3.2 Questionnaire UI Flow

```
QUESTIONNAIRE UI FLOW
=====================

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   [TokenTra Logo]                                    Step 1 of 3         │
│                                                      ████░░░░░░░░        │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   👋 Welcome! Let's get you set up.                                      │
│                                                                          │
│   We'll ask a few quick questions to personalize your experience.       │
│   This takes about 2 minutes.                                           │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   What's your company name?                                      │   │
│   │                                                                  │   │
│   │   ┌──────────────────────────────────────────────────────────┐  │   │
│   │   │ Acme Inc                                              │  │   │
│   │   └──────────────────────────────────────────────────────────┘  │   │
│   │                                                                  │   │
│   │   What's your role?                                              │   │
│   │                                                                  │   │
│   │   ┌─────────────────┐  ┌─────────────────┐                      │   │
│   │   │ 👨‍💻 Engineering  │  │ 🔧 Platform/DevOps │                    │   │
│   │   └─────────────────┘  └─────────────────┘                      │   │
│   │                                                                  │   │
│   │   ┌─────────────────┐  ┌─────────────────┐                      │   │
│   │   │ 💰 FinOps/Finance │  │ 👔 Eng Manager  │                      │   │
│   │   └─────────────────┘  └─────────────────┘                      │   │
│   │                                                                  │   │
│   │   ┌─────────────────┐  ┌─────────────────┐                      │   │
│   │   │ 🚀 CTO/VP Eng   │  │ 🏢 Founder/CEO   │                      │   │
│   │   └─────────────────┘  └─────────────────┘                      │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                                                [Continue →]              │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│   [Skip for now]                                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Data Model for Onboarding

```typescript
// lib/types/onboarding.ts

export interface OnboardingProfile {
  // User info
  userId: string;
  fullName: string;
  email: string;
  userRole: UserRole;
  
  // Company info
  companyName: string;
  companySize: CompanySize;
  companyWebsite?: string;
  industry?: string;
  
  // AI usage
  monthlyAiSpend: SpendRange;
  aiProviders: AIProvider[];
  useCases: UseCase[];
  
  // Goals
  goals: Goal[];
  
  // Team
  teamInvites?: string[];
  
  // Tracking
  completedAt?: string;
  skippedSteps: string[];
  
  // Computed
  segment: UserSegment;  // Computed from answers
  recommendedPath: OnboardingPath;
}

export type UserRole = 
  | 'engineering'
  | 'platform_devops'
  | 'finops_finance'
  | 'engineering_manager'
  | 'cto_vp'
  | 'founder_ceo'
  | 'other';

export type CompanySize = 
  | 'solo'
  | '2-10'
  | '11-50'
  | '51-200'
  | '201-1000'
  | '1000+';

export type SpendRange = 
  | 'under_100'
  | '100_1000'
  | '1000_10000'
  | '10000_50000'
  | '50000_100000'
  | 'over_100000'
  | 'not_sure';

export type AIProvider = 
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'azure'
  | 'aws'
  | 'cohere'
  | 'mistral'
  | 'other';

export type UseCase = 
  | 'chatbot'
  | 'internal_tools'
  | 'content_generation'
  | 'code_generation'
  | 'data_analysis'
  | 'search_rag'
  | 'image_video'
  | 'research'
  | 'other';

export type Goal = 
  | 'visibility'
  | 'cost_reduction'
  | 'cost_allocation'
  | 'budgets_alerts'
  | 'model_optimization'
  | 'client_billing'
  | 'compliance'
  | 'exploring';

export type UserSegment = 
  | 'startup_technical'      // Small company, technical role
  | 'startup_business'       // Small company, business role
  | 'midmarket_technical'    // Medium company, technical role
  | 'midmarket_finops'       // Medium company, FinOps role
  | 'enterprise_technical'   // Large company, technical role
  | 'enterprise_finops'      // Large company, FinOps role
  | 'enterprise_executive'   // Large company, executive
  | 'agency';                // Agency/consultant

export type OnboardingPath = 
  | 'quick_connect'          // Just connect provider, start using
  | 'sdk_first'              // Technical user, SDK setup priority
  | 'guided_tour'            // Full product tour
  | 'sales_assisted';        // Enterprise, schedule demo
```

### 3.4 Segmentation Logic

```typescript
// lib/onboarding/segmentation.ts

export function computeUserSegment(profile: OnboardingProfile): UserSegment {
  const { companySize, userRole, monthlyAiSpend } = profile;
  
  // Determine company tier
  const isStartup = ['solo', '2-10', '11-50'].includes(companySize);
  const isMidmarket = ['51-200', '201-1000'].includes(companySize);
  const isEnterprise = companySize === '1000+';
  
  // Determine role category
  const isTechnical = ['engineering', 'platform_devops'].includes(userRole);
  const isFinOps = userRole === 'finops_finance';
  const isExecutive = ['cto_vp', 'founder_ceo', 'engineering_manager'].includes(userRole);
  
  // Check for agency indicators
  const isAgency = profile.useCases.includes('client_billing');
  
  if (isAgency) return 'agency';
  
  if (isStartup) {
    return isTechnical ? 'startup_technical' : 'startup_business';
  }
  
  if (isMidmarket) {
    return isFinOps ? 'midmarket_finops' : 'midmarket_technical';
  }
  
  if (isEnterprise) {
    if (isExecutive) return 'enterprise_executive';
    if (isFinOps) return 'enterprise_finops';
    return 'enterprise_technical';
  }
  
  return 'startup_technical';  // Default
}

export function getRecommendedPath(
  segment: UserSegment,
  aiSpend: SpendRange
): OnboardingPath {
  // High spenders get sales-assisted
  if (['50000_100000', 'over_100000'].includes(aiSpend)) {
    return 'sales_assisted';
  }
  
  // Technical users prefer SDK-first
  if (['startup_technical', 'midmarket_technical', 'enterprise_technical'].includes(segment)) {
    return 'sdk_first';
  }
  
  // FinOps and business users get guided tour
  if (['midmarket_finops', 'enterprise_finops', 'startup_business'].includes(segment)) {
    return 'guided_tour';
  }
  
  // Agencies need special setup
  if (segment === 'agency') {
    return 'guided_tour';
  }
  
  // Executives get quick demo
  if (segment === 'enterprise_executive') {
    return 'sales_assisted';
  }
  
  return 'quick_connect';
}
```

---

## 4. Provider Connection Wizard

### 4.1 Provider Connection Flow

```
PROVIDER CONNECTION WIZARD
==========================

This is the CRITICAL step for time-to-value. Users need to connect
at least one provider to see their data.

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   [TokenTra Logo]                                    Step 2 of 3         │
│                                                      ████████░░░░        │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   🔌 Connect your first AI provider                                      │
│                                                                          │
│   We'll pull your usage data automatically. Your API keys stay          │
│   secure on your providers - we never see them.                         │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   RECOMMENDED FOR YOU (based on your selections)                │   │
│   │   ─────────────────────────────────────────────                 │   │
│   │                                                                  │   │
│   │   ┌───────────────────────────────────────────────────────────┐ │   │
│   │   │  [OpenAI Logo]                                            │ │   │
│   │   │                                                           │ │   │
│   │   │  OpenAI                                   [Connect →]     │ │   │
│   │   │  GPT-4, GPT-3.5, DALL-E, Whisper                         │ │   │
│   │   │  ✓ 2-click setup with Admin API Key                      │ │   │
│   │   │                                                           │ │   │
│   │   └───────────────────────────────────────────────────────────┘ │   │
│   │                                                                  │   │
│   │   ┌───────────────────────────────────────────────────────────┐ │   │
│   │   │  [Anthropic Logo]                                         │ │   │
│   │   │                                                           │ │   │
│   │   │  Anthropic                                [Connect →]     │ │   │
│   │   │  Claude 3.5 Sonnet, Claude 3 Opus                        │ │   │
│   │   │  ✓ Admin API Key required                                │ │   │
│   │   │                                                           │ │   │
│   │   └───────────────────────────────────────────────────────────┘ │   │
│   │                                                                  │   │
│   │   ALL PROVIDERS                                                 │   │
│   │   ─────────────────                                             │   │
│   │                                                                  │   │
│   │   [Google Vertex] [Azure OpenAI] [AWS Bedrock] [+ More]        │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│   [I'll do this later - skip to dashboard]                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 OpenAI Connection Modal

```
OPENAI CONNECTION FLOW
======================

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                    [X]   │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   [OpenAI Logo] Connect OpenAI                                          │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   STEP 1: Get your Admin API Key                                        │
│                                                                          │
│   1. Go to platform.openai.com/settings/organization/admin-keys         │
│   2. Click "Create new admin key"                                       │
│   3. Name it "TokenTra" and copy the key                                │
│                                                                          │
│   [Open OpenAI Dashboard ↗]                                             │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   STEP 2: Paste your Admin API Key                                      │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │ sk-admin-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                        │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   🔒 Your key is encrypted and stored securely. We only use it to      │
│      read your usage data - we never make API calls on your behalf.    │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│                        [Cancel]     [Connect OpenAI →]                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

CONNECTION SUCCESS STATE:
────────────────────────

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ✅ OpenAI Connected Successfully!                                      │
│                                                                          │
│   We're syncing your usage data now. This usually takes 1-2 minutes.   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   Syncing usage data...                                         │   │
│   │   ████████████░░░░░░░░░░░░░░░░░░░░  35%                        │   │
│   │                                                                  │   │
│   │   ✓ Connected to OpenAI API                                     │   │
│   │   ✓ Found 3 projects                                            │   │
│   │   ○ Fetching last 30 days of usage...                          │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                              [View Dashboard →]                         │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   Want to connect another provider?                                     │
│   [+ Add Anthropic]  [+ Add Google]  [+ Add Azure]                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Provider Connection API

```typescript
// app/api/providers/connect/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/security/encryption';
import { validateProviderCredentials } from '@/lib/providers/validation';
import { queueProviderSync } from '@/lib/jobs/provider-sync';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { provider, credentials, name } = await request.json();
  
  try {
    // 1. Validate credentials with provider
    const validation = await validateProviderCredentials(provider, credentials);
    
    if (!validation.valid) {
      return NextResponse.json({
        error: 'Invalid credentials',
        details: validation.error,
      }, { status: 400 });
    }
    
    // 2. Encrypt and store credentials
    const encryptedCredentials = encrypt(JSON.stringify(credentials));
    
    const { data: connection, error } = await supabase
      .from('provider_connections')
      .insert({
        org_id: session.user.org_id,
        provider,
        name: name || `${provider} (${validation.accountName})`,
        credentials_encrypted: encryptedCredentials,
        status: 'connected',
        last_sync_at: null,
        metadata: {
          account_name: validation.accountName,
          account_id: validation.accountId,
          connected_by: session.user.id,
          connected_at: new Date().toISOString(),
        },
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // 3. Queue initial sync
    await queueProviderSync({
      connectionId: connection.id,
      orgId: session.user.org_id,
      provider,
      type: 'initial',
      daysBack: 30,  // Fetch last 30 days on initial sync
    });
    
    // 4. Update onboarding progress
    await supabase
      .from('users')
      .update({
        onboarding_step: 'provider_connected',
        onboarding_metadata: supabase.sql`
          onboarding_metadata || jsonb_build_object(
            'first_provider_connected', '${provider}',
            'first_provider_connected_at', '${new Date().toISOString()}'
          )
        `,
      })
      .eq('id', session.user.id);
    
    // 5. Track event
    await trackEvent('provider_connected', session.user.id, {
      provider,
      is_first_provider: true,  // Check if first
      connection_id: connection.id,
    });
    
    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        provider,
        name: connection.name,
        status: 'syncing',
      },
    });
    
  } catch (error) {
    console.error('Provider connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect provider' },
      { status: 500 }
    );
  }
}
```

---

## 5. SDK Setup Wizard

### 5.1 SDK Setup Flow

For technical users, the SDK setup wizard provides step-by-step guidance.

```
SDK SETUP WIZARD
================

Shown to users who indicated technical role or selected "SDK setup" goal.

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   [TokenTra Logo]                                                        │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   🛠️ Set up the TokenTra SDK                                            │
│                                                                          │
│   Get detailed cost tracking by feature, team, and user.                │
│   Takes about 5 minutes to integrate.                                   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   SELECT YOUR LANGUAGE                                          │   │
│   │                                                                  │   │
│   │   ┌─────────────────┐  ┌─────────────────┐                      │   │
│   │   │   [Node.js]     │  │   [Python]      │                      │   │
│   │   │   JavaScript /  │  │   Python 3.8+   │                      │   │
│   │   │   TypeScript    │  │                 │                      │   │
│   │   └─────────────────┘  └─────────────────┘                      │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│   [Skip - I'll set this up later]                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: INSTALL THE SDK (Node.js selected)
──────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   Step 1 of 4: Install the SDK                          [Node.js ▼]     │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   Run this command in your project:                                     │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  $ npm install @tokentra/sdk                           [Copy]   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   Or with yarn:                                                         │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  $ yarn add @tokentra/sdk                              [Copy]   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                                                                          │
│                        [← Back]     [Next: Get API Key →]               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

STEP 2: GET YOUR API KEY
────────────────────────

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   Step 2 of 4: Get your API Key                                         │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   Your TokenTra API Key:                                                │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  tt_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6             [Copy]   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ⚠️ Save this key now - you won't be able to see it again!           │
│                                                                          │
│   Add to your environment variables:                                    │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  # .env                                                         │   │
│   │  TOKENTRA_API_KEY=tt_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                        [← Back]     [Next: Add to Code →]               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

STEP 3: ADD TO YOUR CODE
────────────────────────

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   Step 3 of 4: Add to your code                                         │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   Wrap your AI client with TokenTra:                                    │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  import { TokenTra } from '@tokentra/sdk';                      │   │
│   │  import OpenAI from 'openai';                                   │   │
│   │                                                                  │   │
│   │  // Initialize TokenTra (do this once)                          │   │
│   │  const tokentra = new TokenTra({                                │   │
│   │    apiKey: process.env.TOKENTRA_API_KEY                         │   │
│   │  });                                                            │   │
│   │                                                                  │   │
│   │  // Wrap your OpenAI client                                     │   │
│   │  const openai = tokentra.wrap(new OpenAI());                    │   │
│   │                                                                  │   │
│   │  // Use normally - tracking happens automatically               │   │
│   │  const response = await openai.chat.completions.create({        │   │
│   │    model: 'gpt-4',                                              │   │
│   │    messages: [{ role: 'user', content: 'Hello!' }]             │   │
│   │  });                                                            │   │
│   │                                                           [Copy] │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                        [← Back]     [Next: Verify →]                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

STEP 4: VERIFY INSTALLATION
───────────────────────────

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   Step 4 of 4: Verify installation                                      │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   Make an AI request to verify everything is working:                   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   Waiting for your first SDK request...                         │   │
│   │                                                                  │   │
│   │   ○ ○ ○                                                         │   │
│   │                                                                  │   │
│   │   Run your application and make an AI request.                  │   │
│   │   We'll detect it automatically.                                │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   Troubleshooting:                                                      │
│   • Make sure TOKENTRA_API_KEY is set in your environment              │
│   • Check that you're using the wrapped client                         │
│   • See our troubleshooting guide →                                    │
│                                                                          │
│                        [← Back]     [Skip Verification]                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

SUCCESS STATE:
──────────────

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   🎉 SDK Connected Successfully!                                         │
│                                                                          │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   ✅ First SDK request received!                                │   │
│   │                                                                  │   │
│   │   Request details:                                              │   │
│   │   • Provider: OpenAI                                            │   │
│   │   • Model: gpt-4                                                │   │
│   │   • Tokens: 127 input, 45 output                               │   │
│   │   • Cost: $0.0064                                               │   │
│   │   • Latency: 1,234ms                                            │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   NEXT STEPS:                                                           │
│                                                                          │
│   • Add attribution to track by feature/team                           │
│     [See Attribution Guide →]                                          │
│                                                                          │
│   • Set up budgets and alerts                                          │
│     [Configure Budgets →]                                              │
│                                                                          │
│                              [Go to Dashboard →]                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. First Dashboard Experience

### 6.1 Empty State (No Data Yet)

```
EMPTY STATE - NO DATA
=====================

Shown when user reaches dashboard before data has synced.

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   [Logo] TokenTra          [Dashboard] [Usage] [Providers] ...  [User]  │
│                                                                          │
│   ═══════════════════════════════════════════════════════════════════   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │                                                                  │   │
│   │                         🔄                                       │   │
│   │                                                                  │   │
│   │              Syncing your AI usage data...                      │   │
│   │                                                                  │   │
│   │              This usually takes 1-2 minutes.                    │   │
│   │              We're fetching the last 30 days from OpenAI.       │   │
│   │                                                                  │   │
│   │              ████████████████░░░░░░░░░░░░░░  65%                │   │
│   │                                                                  │   │
│   │                                                                  │   │
│   │   ─────────────────────────────────────────────────────────────  │   │
│   │                                                                  │   │
│   │   WHILE YOU WAIT:                                               │   │
│   │                                                                  │   │
│   │   ┌───────────────────┐  ┌───────────────────┐                  │   │
│   │   │ 📚 Read the Docs  │  │ 🔧 Set Up SDK    │                  │   │
│   │   │ Learn about       │  │ Add cost tracking │                  │   │
│   │   │ TokenTra features │  │ to your code      │                  │   │
│   │   └───────────────────┘  └───────────────────┘                  │   │
│   │                                                                  │   │
│   │   ┌───────────────────┐  ┌───────────────────┐                  │   │
│   │   │ 👥 Invite Team    │  │ + Add Provider   │                  │   │
│   │   │ Get your team on  │  │ Connect Anthropic │                  │   │
│   │   │ TokenTra          │  │ Azure, or more    │                  │   │
│   │   └───────────────────┘  └───────────────────┘                  │   │
│   │                                                                  │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 First Data Experience

```
FIRST DATA - AHA MOMENT
=======================

The first time user sees their actual data. This is the "aha moment".

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   [Logo] TokenTra          [Dashboard] [Usage] [Providers] ...  [User]  │
│                                                                          │
│   ═══════════════════════════════════════════════════════════════════   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │  🎉 YOUR DATA IS READY!                          [Dismiss]      │   │
│   │                                                                  │   │
│   │  We've synced your last 30 days of AI usage from OpenAI.       │   │
│   │  Here's what we found:                                          │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                                                                  │   │
│   │   LAST 30 DAYS                                                  │   │
│   │                                                                  │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │   │
│   │   │  Total Spend    │  │  Total Tokens   │  │  API Requests   │ │   │
│   │   │                 │  │                 │  │                 │ │   │
│   │   │   $4,832.47     │  │   12.3M         │  │   45,231        │ │   │
│   │   │   ↑ 23% vs prev │  │   ↑ 18% vs prev│  │   ↑ 12% vs prev │ │   │
│   │   └─────────────────┘  └─────────────────┘  └─────────────────┘ │   │
│   │                                                                  │   │
│   │   ─────────────────────────────────────────────────────────────  │   │
│   │                                                                  │   │
│   │   COST BY MODEL                                                 │   │
│   │                                                                  │   │
│   │   [====== GPT-4 (68%) ======][== GPT-3.5 (22%) ==][= Other =]  │   │
│   │                                                                  │   │
│   │   ┌──────────────────────────────────────────────────────────┐  │   │
│   │   │  💡 INSIGHT                                              │  │   │
│   │   │                                                          │  │   │
│   │   │  68% of your spend is on GPT-4, but 45% of those        │  │   │
│   │   │  requests could use GPT-4o-mini instead.                │  │   │
│   │   │                                                          │  │   │
│   │   │  Potential savings: $1,547/month                        │  │   │
│   │   │                                                          │  │   │
│   │   │  [Learn More →]  [See Optimization Suggestions →]       │  │   │
│   │   │                                                          │  │   │
│   │   └──────────────────────────────────────────────────────────┘  │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Guided Product Tour

### 7.1 Tour Configuration

```typescript
// lib/onboarding/product-tour.ts

export interface TourStep {
  id: string;
  target: string;           // CSS selector
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  action?: {
    type: 'click' | 'input' | 'wait';
    target?: string;
    value?: string;
  };
  showSkip?: boolean;
  nextCondition?: 'click' | 'manual' | 'auto';
}

export interface ProductTour {
  id: string;
  name: string;
  trigger: TourTrigger;
  steps: TourStep[];
  completionEvent: string;
}

export type TourTrigger = 
  | { type: 'first_visit'; page: string }
  | { type: 'feature_unlock'; feature: string }
  | { type: 'manual'; buttonId: string }
  | { type: 'onboarding_step'; step: string };

// ============================================
// MAIN DASHBOARD TOUR
// ============================================

export const dashboardTour: ProductTour = {
  id: 'dashboard_intro',
  name: 'Dashboard Introduction',
  trigger: { type: 'first_visit', page: '/dashboard' },
  steps: [
    {
      id: 'welcome',
      target: '.dashboard-header',
      title: 'Welcome to TokenTra! 👋',
      content: 'This is your AI cost command center. Let me show you around.',
      placement: 'bottom',
      showSkip: true,
      nextCondition: 'manual',
    },
    {
      id: 'total_spend',
      target: '.metric-card-total-spend',
      title: 'Total AI Spend',
      content: 'See your total spend across all connected providers. Click to drill down by time period.',
      placement: 'bottom',
      spotlightPadding: 8,
      nextCondition: 'manual',
    },
    {
      id: 'spend_chart',
      target: '.spend-trend-chart',
      title: 'Spending Trends',
      content: 'Track how your AI costs change over time. Hover for daily details.',
      placement: 'top',
      nextCondition: 'manual',
    },
    {
      id: 'model_breakdown',
      target: '.model-breakdown-chart',
      title: 'Cost by Model',
      content: 'Understand which models are driving your costs. GPT-4 is often the biggest contributor.',
      placement: 'left',
      nextCondition: 'manual',
    },
    {
      id: 'navigation',
      target: '.sidebar-nav',
      title: 'Explore More',
      content: 'Use the sidebar to access Usage details, Provider settings, Optimization suggestions, Budgets, and Alerts.',
      placement: 'right',
      nextCondition: 'manual',
    },
    {
      id: 'help',
      target: '.help-button',
      title: 'Need Help?',
      content: 'Click here anytime to restart this tour, access docs, or contact support.',
      placement: 'left',
      nextCondition: 'manual',
    },
  ],
  completionEvent: 'dashboard_tour_completed',
};

// ============================================
// SDK ATTRIBUTION TOUR
// ============================================

export const sdkAttributionTour: ProductTour = {
  id: 'sdk_attribution',
  name: 'SDK Attribution Setup',
  trigger: { type: 'feature_unlock', feature: 'sdk_connected' },
  steps: [
    {
      id: 'intro',
      target: '.sdk-usage-section',
      title: 'SDK Data Detected! 🎉',
      content: 'You\'re now tracking AI costs through our SDK. Let me show you how to add attribution.',
      placement: 'bottom',
      nextCondition: 'manual',
    },
    {
      id: 'attribution_example',
      target: '.code-example',
      title: 'Add Attribution Tags',
      content: 'Tag your requests with feature, team, or user IDs to see exactly where costs come from.',
      placement: 'right',
      nextCondition: 'manual',
    },
    {
      id: 'view_breakdown',
      target: '.attribution-breakdown',
      title: 'View by Dimension',
      content: 'Once you add tags, you\'ll see costs broken down by feature, team, project, and more.',
      placement: 'top',
      nextCondition: 'manual',
    },
  ],
  completionEvent: 'sdk_attribution_tour_completed',
};

// ============================================
// BUDGETS & ALERTS TOUR
// ============================================

export const budgetsAlertsTour: ProductTour = {
  id: 'budgets_alerts',
  name: 'Budgets & Alerts Setup',
  trigger: { type: 'first_visit', page: '/budgets' },
  steps: [
    {
      id: 'intro',
      target: '.budgets-header',
      title: 'Control Your AI Spend',
      content: 'Set budgets and get alerts before costs get out of control.',
      placement: 'bottom',
      nextCondition: 'manual',
    },
    {
      id: 'create_budget',
      target: '.create-budget-button',
      title: 'Create Your First Budget',
      content: 'Set a monthly budget for your team, project, or entire organization.',
      placement: 'left',
      action: { type: 'click' },
      nextCondition: 'click',
    },
    {
      id: 'alert_thresholds',
      target: '.alert-thresholds',
      title: 'Set Alert Thresholds',
      content: 'Get notified at 50%, 80%, and 100% of budget. Never be surprised by AI bills again.',
      placement: 'right',
      nextCondition: 'manual',
    },
  ],
  completionEvent: 'budgets_tour_completed',
};
```

### 7.2 Tour UI Component

```typescript
// components/onboarding/ProductTour.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourStep } from '@/lib/onboarding/product-tour';

interface ProductTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function ProductTour({ steps, isOpen, onComplete, onSkip }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  const step = steps[currentStep];
  
  useEffect(() => {
    if (!isOpen || !step) return;
    
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      
      // Scroll target into view
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen, step]);
  
  if (!isOpen || !step) return null;
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const getTooltipPosition = () => {
    if (!targetRect) return {};
    
    const padding = step.spotlightPadding || 8;
    
    switch (step.placement) {
      case 'top':
        return {
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.top - padding - 16,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.bottom + padding + 16,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          left: targetRect.left - padding - 16,
          top: targetRect.top + targetRect.height / 2,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          left: targetRect.right + padding + 16,
          top: targetRect.top + targetRect.height / 2,
          transform: 'translate(0, -50%)',
        };
    }
  };
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Overlay with spotlight cutout */}
        <div className="absolute inset-0 bg-black/50">
          {targetRect && (
            <div
              className="absolute bg-transparent border-2 border-primary rounded-lg"
              style={{
                left: targetRect.left - (step.spotlightPadding || 8),
                top: targetRect.top - (step.spotlightPadding || 8),
                width: targetRect.width + (step.spotlightPadding || 8) * 2,
                height: targetRect.height + (step.spotlightPadding || 8) * 2,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              }}
            />
          )}
        </div>
        
        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute bg-white rounded-lg shadow-xl p-4 max-w-sm"
          style={getTooltipPosition()}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            {step.showSkip && (
              <button
                onClick={onSkip}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-4">{step.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="ghost" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  'Done'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
```

---

## 8. Progressive Disclosure

### 8.1 Feature Unlock System

```typescript
// lib/onboarding/feature-unlocks.ts

/**
 * Features are progressively unlocked as users complete actions.
 * This prevents overwhelming new users while rewarding engagement.
 */

export interface FeatureUnlock {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: UnlockCondition;
  celebrationMessage: string;
  nextSteps: string[];
}

export type UnlockCondition = 
  | { type: 'action'; action: string }
  | { type: 'count'; metric: string; threshold: number }
  | { type: 'time'; daysAfterSignup: number }
  | { type: 'plan'; minimumPlan: string };

export const FEATURE_UNLOCKS: FeatureUnlock[] = [
  {
    id: 'basic_dashboard',
    name: 'Cost Dashboard',
    description: 'View your AI spending overview',
    icon: '📊',
    unlockCondition: { type: 'action', action: 'signup_completed' },
    celebrationMessage: 'Your dashboard is ready!',
    nextSteps: ['Connect a provider to see your data'],
  },
  {
    id: 'provider_insights',
    name: 'Provider Insights',
    description: 'Deep dive into provider-specific costs',
    icon: '🔌',
    unlockCondition: { type: 'action', action: 'provider_connected' },
    celebrationMessage: 'Provider connected! Your data is syncing.',
    nextSteps: ['Explore the Usage page', 'Set up a budget'],
  },
  {
    id: 'cost_attribution',
    name: 'Cost Attribution',
    description: 'Track costs by feature, team, and user',
    icon: '🏷️',
    unlockCondition: { type: 'action', action: 'sdk_connected' },
    celebrationMessage: 'SDK connected! Attribution is now available.',
    nextSteps: ['Add tags to your requests', 'View costs by dimension'],
  },
  {
    id: 'smart_routing',
    name: 'Smart Model Routing',
    description: 'Automatically route to cost-efficient models',
    icon: '🧠',
    unlockCondition: { type: 'count', metric: 'sdk_requests', threshold: 1000 },
    celebrationMessage: 'Smart Routing unlocked! You have enough data.',
    nextSteps: ['Enable smart routing', 'Configure routing rules'],
  },
  {
    id: 'optimization_engine',
    name: 'Optimization Recommendations',
    description: 'AI-powered suggestions to reduce costs',
    icon: '💡',
    unlockCondition: { type: 'time', daysAfterSignup: 7 },
    celebrationMessage: 'Optimization insights are ready!',
    nextSteps: ['Review recommendations', 'Implement top suggestions'],
  },
  {
    id: 'advanced_alerts',
    name: 'Advanced Alerting',
    description: 'Anomaly detection and predictive alerts',
    icon: '🚨',
    unlockCondition: { type: 'plan', minimumPlan: 'pro' },
    celebrationMessage: 'Advanced alerting is now available!',
    nextSteps: ['Set up anomaly detection', 'Configure alert channels'],
  },
];

/**
 * Check if a feature is unlocked for a user
 */
export async function isFeatureUnlocked(
  userId: string,
  featureId: string
): Promise<boolean> {
  const feature = FEATURE_UNLOCKS.find(f => f.id === featureId);
  if (!feature) return false;
  
  const condition = feature.unlockCondition;
  
  switch (condition.type) {
    case 'action':
      return await hasCompletedAction(userId, condition.action);
    
    case 'count':
      const count = await getMetricCount(userId, condition.metric);
      return count >= condition.threshold;
    
    case 'time':
      const signupDate = await getSignupDate(userId);
      const daysSinceSignup = Math.floor(
        (Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceSignup >= condition.daysAfterSignup;
    
    case 'plan':
      const userPlan = await getUserPlan(userId);
      return isPlanAtLeast(userPlan, condition.minimumPlan);
    
    default:
      return false;
  }
}
```

### 8.2 Contextual Tooltips

```typescript
// lib/onboarding/contextual-tooltips.ts

export interface ContextualTooltip {
  id: string;
  target: string;       // CSS selector
  title: string;
  content: string;
  showCondition: TooltipCondition;
  dismissAfter: 'once' | 'never' | 'action';
  action?: string;      // Action that dismisses if dismissAfter === 'action'
}

export type TooltipCondition = 
  | { type: 'first_visit' }
  | { type: 'feature_available'; feature: string }
  | { type: 'empty_state'; dataType: string }
  | { type: 'after_action'; action: string };

export const CONTEXTUAL_TOOLTIPS: ContextualTooltip[] = [
  {
    id: 'date_range_tip',
    target: '.date-range-selector',
    title: 'Change Time Range',
    content: 'Click here to view costs for different time periods: last 7 days, 30 days, or custom range.',
    showCondition: { type: 'first_visit' },
    dismissAfter: 'once',
  },
  {
    id: 'export_tip',
    target: '.export-button',
    title: 'Export Your Data',
    content: 'Export cost data as CSV for your finance team or spreadsheet analysis.',
    showCondition: { type: 'after_action', action: 'viewed_dashboard_3_times' },
    dismissAfter: 'once',
  },
  {
    id: 'add_attribution_tip',
    target: '.attribution-empty-state',
    title: 'Add Attribution Tags',
    content: 'Use our SDK to tag requests with feature, team, or user IDs for detailed cost breakdown.',
    showCondition: { type: 'empty_state', dataType: 'attribution' },
    dismissAfter: 'action',
    action: 'sdk_connected',
  },
  {
    id: 'optimization_available',
    target: '.optimization-nav-item',
    title: '💡 New Optimization Insights!',
    content: 'We found 3 ways to reduce your AI costs. Click to see recommendations.',
    showCondition: { type: 'feature_available', feature: 'optimization_engine' },
    dismissAfter: 'action',
    action: 'viewed_optimization_page',
  },
];
```

---

## 9. Onboarding Checklist

### 9.1 Checklist Configuration

```typescript
// lib/onboarding/checklist.ts

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  completionEvent: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: number;      // Lower = more important
  category: 'setup' | 'optimize' | 'team';
}

export interface OnboardingChecklist {
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
  percentComplete: number;
}

export const CHECKLIST_ITEMS: Omit<ChecklistItem, 'completed'>[] = [
  // SETUP CATEGORY
  {
    id: 'complete_profile',
    title: 'Complete your profile',
    description: 'Tell us about your company and AI usage',
    icon: '👤',
    completionEvent: 'profile_completed',
    actionUrl: '/settings/profile',
    actionLabel: 'Complete Profile',
    priority: 1,
    category: 'setup',
  },
  {
    id: 'connect_provider',
    title: 'Connect an AI provider',
    description: 'Link OpenAI, Anthropic, or another provider',
    icon: '🔌',
    completionEvent: 'provider_connected',
    actionUrl: '/providers',
    actionLabel: 'Connect Provider',
    priority: 2,
    category: 'setup',
  },
  {
    id: 'setup_sdk',
    title: 'Install the SDK (optional)',
    description: 'Get detailed tracking by feature and team',
    icon: '🛠️',
    completionEvent: 'sdk_connected',
    actionUrl: '/settings/sdk',
    actionLabel: 'Setup SDK',
    priority: 3,
    category: 'setup',
  },
  
  // OPTIMIZE CATEGORY
  {
    id: 'view_insights',
    title: 'Review your cost breakdown',
    description: 'See where your AI spend is going',
    icon: '📊',
    completionEvent: 'dashboard_viewed',
    actionUrl: '/dashboard',
    actionLabel: 'View Dashboard',
    priority: 4,
    category: 'optimize',
  },
  {
    id: 'set_budget',
    title: 'Set a budget',
    description: 'Create spending limits to avoid surprises',
    icon: '💰',
    completionEvent: 'budget_created',
    actionUrl: '/budgets',
    actionLabel: 'Create Budget',
    priority: 5,
    category: 'optimize',
  },
  {
    id: 'configure_alert',
    title: 'Configure an alert',
    description: 'Get notified about unusual spending',
    icon: '🔔',
    completionEvent: 'alert_created',
    actionUrl: '/alerts',
    actionLabel: 'Create Alert',
    priority: 6,
    category: 'optimize',
  },
  
  // TEAM CATEGORY
  {
    id: 'invite_team',
    title: 'Invite your team',
    description: 'Add team members to collaborate',
    icon: '👥',
    completionEvent: 'team_member_invited',
    actionUrl: '/settings/team',
    actionLabel: 'Invite Team',
    priority: 7,
    category: 'team',
  },
];

/**
 * Get user's onboarding checklist with completion status
 */
export async function getUserChecklist(userId: string): Promise<OnboardingChecklist> {
  const completedEvents = await getUserCompletedEvents(userId);
  
  const items = CHECKLIST_ITEMS.map(item => ({
    ...item,
    completed: completedEvents.includes(item.completionEvent),
  }));
  
  const completedCount = items.filter(i => i.completed).length;
  
  return {
    items,
    completedCount,
    totalCount: items.length,
    percentComplete: Math.round((completedCount / items.length) * 100),
  };
}
```

### 9.2 Checklist UI Component

```typescript
// components/onboarding/OnboardingChecklist.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { OnboardingChecklist, ChecklistItem } from '@/lib/onboarding/checklist';

interface OnboardingChecklistProps {
  checklist: OnboardingChecklist;
  showExpanded?: boolean;
}

export function OnboardingChecklistWidget({ 
  checklist,
  showExpanded = false 
}: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(showExpanded);
  
  // Auto-collapse when 100% complete
  useEffect(() => {
    if (checklist.percentComplete === 100) {
      setTimeout(() => setIsExpanded(false), 2000);
    }
  }, [checklist.percentComplete]);
  
  // Don't show if fully complete and collapsed
  if (checklist.percentComplete === 100 && !isExpanded) {
    return null;
  }
  
  const incompleteItems = checklist.items.filter(i => !i.completed);
  const nextItem = incompleteItems[0];
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚀</div>
            <div>
              <h3 className="font-semibold">Get Started with TokenTra</h3>
              <p className="text-sm text-gray-500">
                {checklist.completedCount} of {checklist.totalCount} tasks complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-primary">
              {checklist.percentComplete}%
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
        
        <Progress value={checklist.percentComplete} className="mt-3 h-2" />
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-100"
        >
          <div className="p-4 space-y-3">
            {checklist.items.map((item, index) => (
              <ChecklistItemRow key={item.id} item={item} index={index} />
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Quick Action - Collapsed State */}
      {!isExpanded && nextItem && (
        <div className="px-4 pb-4">
          <Link href={nextItem.actionUrl || '#'}>
            <Button size="sm" className="w-full">
              {nextItem.actionLabel || 'Continue Setup'}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function ChecklistItemRow({ item, index }: { item: ChecklistItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-lg ${
        item.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        item.completed ? 'bg-green-500' : 'bg-gray-200'
      }`}>
        {item.completed ? (
          <Check className="h-4 w-4 text-white" />
        ) : (
          <span className="text-sm">{item.icon}</span>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${item.completed ? 'text-green-700 line-through' : ''}`}>
          {item.title}
        </p>
        <p className="text-sm text-gray-500 truncate">{item.description}</p>
      </div>
      
      {/* Action */}
      {!item.completed && item.actionUrl && (
        <Link href={item.actionUrl}>
          <Button variant="ghost" size="sm">
            {item.actionLabel || 'Start'}
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
```

---

## 10. Database Schema

### 10.1 Onboarding Tables

```sql
-- ============================================
-- ONBOARDING DATABASE SCHEMA
-- ============================================

-- User onboarding state and progress
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'not_started';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_skipped_steps TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_metadata JSONB DEFAULT '{}';

-- Onboarding profile (company & user info from questionnaire)
CREATE TABLE onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- User info
  user_role VARCHAR(50),
  
  -- Company info
  company_name VARCHAR(255),
  company_size VARCHAR(50),
  company_website VARCHAR(255),
  industry VARCHAR(100),
  
  -- AI usage
  monthly_ai_spend VARCHAR(50),
  ai_providers TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',
  
  -- Goals
  goals TEXT[] DEFAULT '{}',
  
  -- Computed segments
  user_segment VARCHAR(50),
  recommended_path VARCHAR(50),
  
  -- Status
  profile_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  skipped_steps TEXT[] DEFAULT '{}',
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT onboarding_profiles_user_unique UNIQUE (user_id)
);

CREATE INDEX idx_onboarding_profiles_org ON onboarding_profiles (org_id);
CREATE INDEX idx_onboarding_profiles_segment ON onboarding_profiles (user_segment);

-- Onboarding events (track completion of actions)
CREATE TABLE onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT onboarding_events_unique UNIQUE (user_id, event_name)
);

CREATE INDEX idx_onboarding_events_user ON onboarding_events (user_id, created_at DESC);

-- Product tour completion tracking
CREATE TABLE tour_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tour_id VARCHAR(100) NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  skipped BOOLEAN DEFAULT FALSE,
  steps_viewed INTEGER DEFAULT 0,
  total_steps INTEGER,
  
  CONSTRAINT tour_completions_unique UNIQUE (user_id, tour_id)
);

-- Tooltip dismissals
CREATE TABLE tooltip_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tooltip_id VARCHAR(100) NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT tooltip_dismissals_unique UNIQUE (user_id, tooltip_id)
);

-- Feature unlocks
CREATE TABLE feature_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_trigger VARCHAR(100),  -- What triggered the unlock
  celebrated BOOLEAN DEFAULT FALSE,  -- Whether user saw celebration
  
  CONSTRAINT feature_unlocks_unique UNIQUE (user_id, feature_id)
);

-- Team invitations from onboarding
CREATE TABLE onboarding_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',  -- pending, sent, accepted, expired
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  CONSTRAINT onboarding_invitations_unique UNIQUE (org_id, email)
);

CREATE INDEX idx_onboarding_invitations_email ON onboarding_invitations (email);
```

---

## 11. API Routes

### 11.1 Onboarding API Routes

```typescript
// app/api/onboarding/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeUserSegment, getRecommendedPath } from '@/lib/onboarding/segmentation';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * POST /api/onboarding/profile
 * Save onboarding profile answers
 */
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    
    // Compute segment and recommended path
    const segment = computeUserSegment(data);
    const recommendedPath = getRecommendedPath(segment, data.monthlyAiSpend);
    
    // Upsert profile
    const { error } = await supabase
      .from('onboarding_profiles')
      .upsert({
        user_id: session.user.id,
        org_id: session.user.org_id,
        user_role: data.userRole,
        company_name: data.companyName,
        company_size: data.companySize,
        monthly_ai_spend: data.monthlyAiSpend,
        ai_providers: data.aiProviders,
        use_cases: data.useCases,
        goals: data.goals,
        user_segment: segment,
        recommended_path: recommendedPath,
        profile_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
    
    if (error) throw error;
    
    // Update organization name if provided
    if (data.companyName) {
      await supabase
        .from('organizations')
        .update({ name: data.companyName })
        .eq('id', session.user.org_id);
    }
    
    // Record onboarding event
    await recordOnboardingEvent(session.user.id, 'profile_completed', {
      segment,
      recommendedPath,
    });
    
    // Update user onboarding status
    await supabase
      .from('users')
      .update({
        onboarding_step: 'provider_setup',
        onboarding_metadata: {
          profile_completed_at: new Date().toISOString(),
          segment,
          recommended_path: recommendedPath,
        },
      })
      .eq('id', session.user.id);
    
    // Handle team invites if provided
    if (data.teamInvites?.length > 0) {
      await processTeamInvites(
        session.user.id,
        session.user.org_id,
        data.teamInvites
      );
    }
    
    return NextResponse.json({
      success: true,
      segment,
      recommendedPath,
      nextStep: getNextStepUrl(recommendedPath),
    });
    
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/profile
 * Get current onboarding profile
 */
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data, error } = await supabase
    .from('onboarding_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') {  // Not found is ok
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
  
  return NextResponse.json(data || { exists: false });
}
```

```typescript
// app/api/onboarding/checklist/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserChecklist } from '@/lib/onboarding/checklist';

/**
 * GET /api/onboarding/checklist
 * Get user's onboarding checklist with completion status
 */
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const checklist = await getUserChecklist(session.user.id);
  
  return NextResponse.json(checklist);
}
```

```typescript
// app/api/onboarding/events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkFeatureUnlocks } from '@/lib/onboarding/feature-unlocks';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * POST /api/onboarding/events
 * Record an onboarding event (for checklist completion)
 */
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { eventName, eventData } = await request.json();
  
  try {
    // Record event (upsert to prevent duplicates)
    const { error } = await supabase
      .from('onboarding_events')
      .upsert({
        user_id: session.user.id,
        event_name: eventName,
        event_data: eventData || {},
      }, {
        onConflict: 'user_id,event_name',
      });
    
    if (error) throw error;
    
    // Check if this event unlocks any features
    const unlockedFeatures = await checkFeatureUnlocks(
      session.user.id,
      eventName
    );
    
    return NextResponse.json({
      success: true,
      unlockedFeatures,
    });
    
  } catch (error) {
    console.error('Event recording error:', error);
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    );
  }
}
```

---

## 12. UI Components

### 12.1 Component Structure

```
components/
├── onboarding/
│   ├── OnboardingLayout.tsx          # Layout wrapper for onboarding pages
│   ├── QuestionnaireStep.tsx         # Generic step component
│   ├── CompanyProfileForm.tsx        # Company info questions
│   ├── AIUsageForm.tsx               # AI provider/usage questions
│   ├── GoalsForm.tsx                 # Goals selection
│   ├── TeamInviteForm.tsx            # Team invite step
│   ├── ProviderConnectionWizard.tsx  # Provider setup
│   ├── SDKSetupWizard.tsx            # SDK installation guide
│   ├── OnboardingChecklist.tsx       # Progress checklist widget
│   ├── ProductTour.tsx               # Guided tour overlay
│   ├── FeatureUnlockCelebration.tsx  # Celebration modal
│   ├── ContextualTooltip.tsx         # Helper tooltips
│   └── EmptyState.tsx                # Empty states with CTAs
```

---

## 13. Analytics & Tracking

### 13.1 Onboarding Analytics Events

```typescript
// lib/analytics/onboarding-events.ts

/**
 * Track all onboarding-related events for analytics
 */

export const ONBOARDING_EVENTS = {
  // Signup
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  SIGNUP_METHOD_SELECTED: 'signup_method_selected',
  
  // Profile questionnaire
  QUESTIONNAIRE_STARTED: 'questionnaire_started',
  QUESTIONNAIRE_STEP_COMPLETED: 'questionnaire_step_completed',
  QUESTIONNAIRE_STEP_SKIPPED: 'questionnaire_step_skipped',
  QUESTIONNAIRE_COMPLETED: 'questionnaire_completed',
  QUESTIONNAIRE_ABANDONED: 'questionnaire_abandoned',
  
  // Provider connection
  PROVIDER_CONNECTION_STARTED: 'provider_connection_started',
  PROVIDER_CONNECTION_COMPLETED: 'provider_connection_completed',
  PROVIDER_CONNECTION_FAILED: 'provider_connection_failed',
  PROVIDER_SYNC_COMPLETED: 'provider_sync_completed',
  
  // SDK setup
  SDK_SETUP_STARTED: 'sdk_setup_started',
  SDK_LANGUAGE_SELECTED: 'sdk_language_selected',
  SDK_API_KEY_COPIED: 'sdk_api_key_copied',
  SDK_CODE_COPIED: 'sdk_code_copied',
  SDK_FIRST_REQUEST: 'sdk_first_request',
  SDK_SETUP_COMPLETED: 'sdk_setup_completed',
  SDK_SETUP_SKIPPED: 'sdk_setup_skipped',
  
  // Dashboard
  DASHBOARD_FIRST_VIEW: 'dashboard_first_view',
  DASHBOARD_DATA_LOADED: 'dashboard_data_loaded',
  
  // Tours
  TOUR_STARTED: 'tour_started',
  TOUR_STEP_VIEWED: 'tour_step_viewed',
  TOUR_COMPLETED: 'tour_completed',
  TOUR_SKIPPED: 'tour_skipped',
  
  // Checklist
  CHECKLIST_ITEM_COMPLETED: 'checklist_item_completed',
  CHECKLIST_FULLY_COMPLETED: 'checklist_fully_completed',
  
  // Feature unlocks
  FEATURE_UNLOCKED: 'feature_unlocked',
  FEATURE_UNLOCK_CELEBRATED: 'feature_unlock_celebrated',
  
  // Team
  TEAM_INVITE_SENT: 'team_invite_sent',
  TEAM_INVITE_ACCEPTED: 'team_invite_accepted',
};

/**
 * Track onboarding event
 */
export async function trackOnboardingEvent(
  eventName: string,
  userId: string,
  properties?: Record<string, any>
) {
  // Send to analytics provider (e.g., Mixpanel, Amplitude, PostHog)
  await analytics.track(eventName, {
    user_id: userId,
    timestamp: new Date().toISOString(),
    ...properties,
  });
  
  // Also store in our database for internal analysis
  await recordOnboardingEvent(userId, eventName, properties);
}
```

### 13.2 Onboarding Funnel Analysis

```sql
-- Onboarding funnel analysis queries

-- 1. Overall funnel conversion
WITH funnel AS (
  SELECT
    COUNT(DISTINCT CASE WHEN event_name = 'signup_completed' THEN user_id END) as signups,
    COUNT(DISTINCT CASE WHEN event_name = 'questionnaire_completed' THEN user_id END) as profiles,
    COUNT(DISTINCT CASE WHEN event_name = 'provider_connection_completed' THEN user_id END) as providers,
    COUNT(DISTINCT CASE WHEN event_name = 'dashboard_data_loaded' THEN user_id END) as activated
  FROM onboarding_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  signups,
  profiles,
  ROUND(100.0 * profiles / NULLIF(signups, 0), 1) as profile_rate,
  providers,
  ROUND(100.0 * providers / NULLIF(signups, 0), 1) as provider_rate,
  activated,
  ROUND(100.0 * activated / NULLIF(signups, 0), 1) as activation_rate
FROM funnel;

-- 2. Time to activation by segment
SELECT
  op.user_segment,
  COUNT(*) as users,
  AVG(EXTRACT(EPOCH FROM (
    (SELECT MIN(created_at) FROM onboarding_events oe 
     WHERE oe.user_id = op.user_id AND oe.event_name = 'dashboard_data_loaded')
    - op.created_at
  )) / 60) as avg_minutes_to_activation
FROM onboarding_profiles op
WHERE op.created_at >= NOW() - INTERVAL '30 days'
GROUP BY op.user_segment
ORDER BY avg_minutes_to_activation;

-- 3. Drop-off points
SELECT
  event_name as last_event,
  COUNT(*) as users_dropped
FROM (
  SELECT
    user_id,
    (SELECT event_name FROM onboarding_events oe2 
     WHERE oe2.user_id = oe.user_id 
     ORDER BY created_at DESC LIMIT 1) as event_name
  FROM onboarding_events oe
  WHERE user_id NOT IN (
    SELECT user_id FROM onboarding_events 
    WHERE event_name = 'dashboard_data_loaded'
  )
  GROUP BY user_id
) as last_events
GROUP BY event_name
ORDER BY users_dropped DESC;
```

---

## Summary

This onboarding system provides:

1. **Conversational questionnaire** that captures critical user/company data
2. **Smart segmentation** that personalizes the experience
3. **Provider connection wizard** with step-by-step guidance
4. **SDK setup wizard** for technical users
5. **Guided product tours** that teach features in context
6. **Progress checklist** that motivates completion
7. **Feature unlock system** that rewards engagement
8. **Comprehensive analytics** for funnel optimization

The goal is to get users to their "aha moment" (seeing AI costs) within 10 minutes of signup.

---

*TokenTra Onboarding System v1.0*
*December 2025*
