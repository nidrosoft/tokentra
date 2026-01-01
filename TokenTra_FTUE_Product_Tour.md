# TokenTra First-Time User Experience (FTUE) - Complete Specification

## Overview

This document specifies the complete first-time user experience for TokenTra, including product tours, interactive walkthroughs, contextual help, and progressive feature discovery. The goal is to guide new users to value as quickly as possible while teaching them how to use the platform effectively.

---

## Table of Contents

1. [FTUE Philosophy](#1-ftue-philosophy)
2. [User Journey Map](#2-user-journey-map)
3. [Empty States](#3-empty-states)
4. [Product Tours](#4-product-tours)
5. [Interactive Walkthroughs](#5-interactive-walkthroughs)
6. [Contextual Tooltips](#6-contextual-tooltips)
7. [Feature Discovery](#7-feature-discovery)
8. [Help System](#8-help-system)
9. [SDK Integration Guide](#9-sdk-integration-guide)
10. [Celebration & Rewards](#10-celebration--rewards)
11. [UI Components](#11-ui-components)
12. [State Management](#12-state-management)
13. [Analytics & Tracking](#13-analytics--tracking)

---

## 1. FTUE Philosophy

### 1.1 Core Principles

```
FIRST-TIME USER EXPERIENCE PRINCIPLES
=====================================

1. SHOW, DON'T TELL
   Let users interact and discover, rather than
   reading walls of text. Interactive > passive.

2. VALUE BEFORE EDUCATION
   Get users to "aha moment" first, then teach
   advanced features. Don't front-load learning.

3. RESPECT USER TIME
   Every tour step, tooltip, or modal costs
   attention. Earn it with value.

4. CONTEXTUAL OVER COMPREHENSIVE
   Teach features when users need them, not
   all at once. Just-in-time learning.

5. PROGRESSIVE COMPLEXITY
   Start simple, reveal complexity as users
   demonstrate readiness.

6. ALWAYS ESCAPABLE
   Never trap users in tutorials. Provide
   clear skip/dismiss options.

7. RECOVERABLE
   Users can always restart tours or access
   help when needed.
```

### 1.2 FTUE Success Metrics

| Metric | Target | Definition |
|--------|--------|------------|
| Time to First Value | < 10 min | User sees their cost data |
| Tour Completion Rate | > 60% | Users who finish dashboard tour |
| Day 1 Activation | > 70% | Connect provider + view dashboard |
| Feature Discovery | > 50% | Users who explore 3+ features |
| Help Ticket Rate | < 5% | Users who contact support Day 1 |
| Return Rate D1 | > 60% | Users who come back next day |

---

## 2. User Journey Map

### 2.1 First Session Journey

```
FIRST SESSION USER JOURNEY
==========================

┌─────────────────────────────────────────────────────────────────────────┐
│                         MINUTE 0-2: SIGNUP                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Landing Page] → [Signup] → [Email Verify] → [Questionnaire]           │
│                                                                          │
│  KEY ACTIONS:                                                            │
│  • Choose auth method (Google/GitHub/Email)                              │
│  • Answer 3-4 quick profile questions                                    │
│  • Set company name                                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MINUTE 2-5: PROVIDER CONNECTION                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Provider Selection] → [Auth Flow] → [Connection Success]              │
│                                                                          │
│  KEY ACTIONS:                                                            │
│  • Select primary AI provider                                            │
│  • Complete OAuth or enter API key                                       │
│  • See connection confirmation                                           │
│                                                                          │
│  CELEBRATIONS:                                                           │
│  ✓ "Provider connected!" animation                                      │
│  ✓ Show sync progress indicator                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MINUTE 5-10: FIRST DASHBOARD VIEW                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Sync in Progress] → [Data Ready] → [Dashboard Tour]                   │
│                                                                          │
│  KEY ACTIONS:                                                            │
│  • See sync progress while exploring UI                                  │
│  • View first cost data (AHA MOMENT! 🎉)                                │
│  • Complete optional dashboard tour                                      │
│                                                                          │
│  CELEBRATIONS:                                                           │
│  ✓ "Your data is ready!" notification                                   │
│  ✓ First insight callout                                                │
│  ✓ Potential savings teaser                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MINUTE 10-15: EXPLORATION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Browse Dashboard] → [Check Features] → [Set First Alert]              │
│                                                                          │
│  KEY ACTIONS:                                                            │
│  • Explore cost breakdown charts                                         │
│  • View Usage page                                                       │
│  • Create first budget or alert (optional)                              │
│                                                                          │
│  GUIDANCE:                                                               │
│  • Contextual tooltips on hover                                         │
│  • Suggested next steps                                                  │
│  • Checklist progress updates                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MINUTE 15+: ADVANCED SETUP                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [SDK Setup] → [Team Invites] → [Advanced Config]                       │
│                                                                          │
│  KEY ACTIONS:                                                            │
│  • Install SDK for detailed tracking (if technical)                     │
│  • Invite team members                                                   │
│  • Configure budgets and alerts                                         │
│                                                                          │
│  This happens over next few sessions, not Day 1                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Return Session Journeys

```
RETURN SESSION SCENARIOS
========================

SCENARIO 1: Next Day Return
───────────────────────────
• Show "Welcome back" with key changes
• Highlight new data since last visit
• Remind of incomplete setup tasks
• Show any triggered alerts

SCENARIO 2: After Alert Triggered
─────────────────────────────────
• Deep link to relevant dashboard section
• Show alert context prominently
• Guide to remediation actions
• Offer to adjust alert settings

SCENARIO 3: After Weekly Digest Email
─────────────────────────────────────
• Pre-load relevant time range
• Highlight key metrics from email
• Show optimization recommendations
• Prompt for deeper exploration

SCENARIO 4: Team Member Invited
───────────────────────────────
• Modified onboarding (org already set up)
• Role-appropriate dashboard view
• Quick tour of accessible features
• Introduction to team workflows
```

---

## 3. Empty States

### 3.1 Empty State Strategy

Empty states are critical FTUE moments. They should:
- Explain what will appear here
- Provide clear action to populate
- Feel inviting, not broken

### 3.2 Empty State Designs

```typescript
// components/ftue/EmptyStates.tsx

import { Button } from '@/components/ui/button';
import { Plus, Zap, Users, Bell, FileText } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ title, description, icon, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-6">{description}</p>
      <div className="flex gap-3">
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
        {secondaryAction && (
          <Link href={secondaryAction.href}>
            <Button variant="outline">{secondaryAction.label}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// Specific empty states for each page
export const EMPTY_STATES = {
  dashboard_no_providers: {
    title: "Connect your first AI provider",
    description: "Link OpenAI, Anthropic, or another provider to start seeing your AI costs in real-time.",
    icon: <Zap className="w-8 h-8 text-slate-400" />,
    action: { label: "Connect Provider", href: "/providers" },
    secondaryAction: { label: "Learn More", href: "/docs/getting-started" },
  },
  
  dashboard_syncing: {
    title: "Syncing your data...",
    description: "We're pulling your usage data now. This usually takes 1-2 minutes. Feel free to explore while you wait!",
    icon: <div className="animate-spin">🔄</div>,
    action: { label: "Explore Features", href: "#features" },
  },
  
  usage_no_data: {
    title: "No usage data yet",
    description: "Once you connect a provider and start using AI APIs, your usage will appear here with detailed breakdowns.",
    icon: <FileText className="w-8 h-8 text-slate-400" />,
    action: { label: "Connect Provider", href: "/providers" },
  },
  
  budgets_empty: {
    title: "No budgets set up",
    description: "Create spending limits to avoid surprise bills. Get alerted when you're approaching or exceeding your budget.",
    icon: <Bell className="w-8 h-8 text-slate-400" />,
    action: { label: "Create Budget", href: "/budgets/new" },
    secondaryAction: { label: "Learn About Budgets", href: "/docs/budgets" },
  },
  
  alerts_empty: {
    title: "No alerts configured",
    description: "Set up alerts to get notified about unusual spending, budget thresholds, or anomalies in your AI usage.",
    icon: <Bell className="w-8 h-8 text-slate-400" />,
    action: { label: "Create Alert", href: "/alerts/new" },
  },
  
  team_empty: {
    title: "Invite your team",
    description: "Collaborate with your team on AI cost management. Each member can have customized access and dashboards.",
    icon: <Users className="w-8 h-8 text-slate-400" />,
    action: { label: "Invite Members", href: "/settings/team" },
  },
  
  attribution_no_sdk: {
    title: "No SDK data yet",
    description: "Install the TokenTra SDK to track costs by feature, team, and user. Get detailed attribution for every AI request.",
    icon: <Zap className="w-8 h-8 text-slate-400" />,
    action: { label: "Set Up SDK", href: "/settings/sdk" },
    secondaryAction: { label: "View Docs", href: "/docs/sdk" },
  },
  
  optimization_not_ready: {
    title: "Optimization insights coming soon",
    description: "We need at least 7 days of data to generate meaningful optimization recommendations. Check back soon!",
    icon: <Zap className="w-8 h-8 text-slate-400" />,
    action: { label: "View Dashboard", href: "/dashboard" },
  },
  
  reports_empty: {
    title: "No reports yet",
    description: "Generate detailed cost reports for your team, finance department, or clients. Schedule automatic report delivery.",
    icon: <FileText className="w-8 h-8 text-slate-400" />,
    action: { label: "Create Report", href: "/reports/new" },
  },
};
```

### 3.3 Empty State Visual

```
EMPTY STATE LAYOUT
==================

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                                                                          │
│                          ┌────────────┐                                  │
│                          │            │                                  │
│                          │    🔌      │  ← Contextual Icon               │
│                          │            │                                  │
│                          └────────────┘                                  │
│                                                                          │
│                   Connect your first AI provider                         │
│                                                                          │
│             Link OpenAI, Anthropic, or another provider                  │
│           to start seeing your AI costs in real-time.                   │
│                                                                          │
│               ┌──────────────────┐  ┌─────────────┐                     │
│               │ Connect Provider │  │ Learn More  │                     │
│               └──────────────────┘  └─────────────┘                     │
│                                                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Product Tours

### 4.1 Tour Types

```typescript
// lib/ftue/tours.ts

export type TourType = 
  | 'dashboard_intro'      // First dashboard visit
  | 'usage_intro'          // First usage page visit
  | 'providers_intro'      // First providers page visit
  | 'budgets_intro'        // First budgets page visit
  | 'alerts_intro'         // First alerts page visit
  | 'optimization_intro'   // When optimization unlocks
  | 'sdk_setup'            // SDK setup walkthrough
  | 'team_setup'           // Team setup walkthrough
  | 'new_feature';         // New feature announcement

export interface TourStep {
  id: string;
  target: string;              // CSS selector
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
  showProgress?: boolean;
  showSkip?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  action?: {
    type: 'click' | 'wait' | 'input';
    target?: string;
    waitFor?: string;          // Selector to wait for
    delay?: number;
  };
  beforeShow?: () => void;
  afterHide?: () => void;
}

export interface Tour {
  id: TourType;
  name: string;
  description: string;
  triggerCondition: TourTrigger;
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}
```

### 4.2 Dashboard Introduction Tour

```typescript
// lib/ftue/tours/dashboard-tour.ts

import { Tour } from '../tours';

export const dashboardTour: Tour = {
  id: 'dashboard_intro',
  name: 'Dashboard Introduction',
  description: 'Learn the basics of your AI cost dashboard',
  triggerCondition: { type: 'first_visit', page: '/dashboard' },
  steps: [
    {
      id: 'welcome',
      target: 'body',
      title: 'Welcome to TokenTra! 🎉',
      content: 'This is your AI cost command center. Let me show you around - it only takes a minute.',
      placement: 'center',
      showSkip: true,
      nextButtonText: 'Show me around',
    },
    {
      id: 'total_spend',
      target: '[data-tour="total-spend"]',
      title: 'Total AI Spend',
      content: 'This shows your total AI spending for the selected time period. Click to drill down by provider or model.',
      placement: 'bottom',
      highlightPadding: 8,
    },
    {
      id: 'date_range',
      target: '[data-tour="date-range"]',
      title: 'Change Time Range',
      content: 'View spending for different periods - last 7 days, 30 days, or set a custom range.',
      placement: 'bottom',
    },
    {
      id: 'spend_chart',
      target: '[data-tour="spend-chart"]',
      title: 'Spending Trends',
      content: 'Track how your AI costs change over time. Hover over any point for daily details.',
      placement: 'top',
    },
    {
      id: 'model_breakdown',
      target: '[data-tour="model-breakdown"]',
      title: 'Cost by Model',
      content: 'See which models are driving your costs. GPT-4 is often the biggest contributor - we\'ll help you optimize.',
      placement: 'left',
    },
    {
      id: 'sidebar',
      target: '[data-tour="sidebar-nav"]',
      title: 'Explore More',
      content: 'Use the sidebar to access detailed Usage, Providers, Optimization suggestions, Budgets, and Alerts.',
      placement: 'right',
    },
    {
      id: 'complete',
      target: 'body',
      title: 'You\'re all set! 🚀',
      content: 'That\'s the basics! Explore your dashboard, and click the help button anytime to restart this tour or get support.',
      placement: 'center',
      nextButtonText: 'Start exploring',
    },
  ],
  onComplete: () => {
    // Track completion
    trackEvent('tour_completed', { tour: 'dashboard_intro' });
  },
};
```

### 4.3 SDK Setup Tour

```typescript
// lib/ftue/tours/sdk-setup-tour.ts

import { Tour } from '../tours';

export const sdkSetupTour: Tour = {
  id: 'sdk_setup',
  name: 'SDK Setup Walkthrough',
  description: 'Install the TokenTra SDK for detailed cost tracking',
  triggerCondition: { type: 'manual', buttonId: 'start-sdk-setup' },
  steps: [
    {
      id: 'intro',
      target: 'body',
      title: 'Set Up the TokenTra SDK 🛠️',
      content: 'The SDK lets you track AI costs by feature, team, and user. It takes about 5 minutes to integrate.',
      placement: 'center',
      showSkip: true,
    },
    {
      id: 'language',
      target: '[data-tour="language-select"]',
      title: 'Choose Your Language',
      content: 'Select your primary programming language. We support Node.js, Python, and more.',
      placement: 'bottom',
      action: {
        type: 'wait',
        waitFor: '[data-tour="language-selected"]',
      },
    },
    {
      id: 'install',
      target: '[data-tour="install-command"]',
      title: 'Install the Package',
      content: 'Copy this command and run it in your project. Click the copy button to copy to clipboard.',
      placement: 'bottom',
    },
    {
      id: 'api_key',
      target: '[data-tour="api-key"]',
      title: 'Your API Key',
      content: 'Copy this API key and add it to your environment variables. Keep it secure - it\'s your authentication.',
      placement: 'bottom',
    },
    {
      id: 'code_example',
      target: '[data-tour="code-example"]',
      title: 'Add to Your Code',
      content: 'Wrap your AI client with TokenTra. This is all you need - tracking happens automatically!',
      placement: 'right',
    },
    {
      id: 'verify',
      target: '[data-tour="verify-section"]',
      title: 'Verify Installation',
      content: 'Make an AI request in your app. We\'ll detect it here automatically to confirm everything works.',
      placement: 'top',
    },
  ],
};
```

### 4.4 Tour UI Component

```typescript
// components/ftue/ProductTour.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tour, TourStep } from '@/lib/ftue/tours';

interface ProductTourProps {
  tour: Tour;
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function ProductTour({ tour, isOpen, onComplete, onSkip }: ProductTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  const step = tour.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tour.steps.length - 1;
  
  // Find and highlight target element
  useEffect(() => {
    if (!isOpen || !step) return;
    
    const findTarget = () => {
      if (step.target === 'body') {
        setTargetRect(null);
        return;
      }
      
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll into view
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center',
        });
        
        // Add highlight class
        target.classList.add('tour-highlight');
      }
    };
    
    // Small delay to let page render
    const timer = setTimeout(findTarget, 100);
    
    return () => {
      clearTimeout(timer);
      // Remove highlight from all elements
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [isOpen, step, currentStepIndex]);
  
  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
      tour.onComplete?.();
    } else {
      step.afterHide?.();
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [isLastStep, onComplete, step, tour]);
  
  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      step.afterHide?.();
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep, step]);
  
  const handleSkip = useCallback(() => {
    onSkip();
    tour.onSkip?.();
  }, [onSkip, tour]);
  
  if (!isOpen || !step) return null;
  
  const tooltipPosition = getTooltipPosition(targetRect, step.placement);
  
  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Dark overlay with spotlight cutout */}
        <div className="absolute inset-0 bg-black/60">
          {targetRect && (
            <div
              className="absolute bg-transparent rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-transparent"
              style={{
                left: targetRect.left - (step.highlightPadding || 8),
                top: targetRect.top - (step.highlightPadding || 8),
                width: targetRect.width + (step.highlightPadding || 8) * 2,
                height: targetRect.height + (step.highlightPadding || 8) * 2,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              }}
            />
          )}
        </div>
        
        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="absolute bg-white rounded-xl shadow-2xl p-6 max-w-sm z-10"
          style={tooltipPosition}
        >
          {/* Close button */}
          {step.showSkip && (
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Content */}
          <h3 className="font-semibold text-lg text-slate-900 mb-2 pr-6">
            {step.title}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {step.content}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Progress dots */}
            {step.showProgress !== false && (
              <div className="flex gap-1.5">
                {tour.steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentStepIndex 
                        ? 'bg-primary' 
                        : i < currentStepIndex 
                          ? 'bg-primary/50'
                          : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex gap-2 ml-auto">
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {step.prevButtonText || 'Back'}
                </Button>
              )}
              <Button size="sm" onClick={handleNext}>
                {step.nextButtonText || (isLastStep ? 'Done' : 'Next')}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getTooltipPosition(
  targetRect: DOMRect | null, 
  placement: TourStep['placement']
): React.CSSProperties {
  if (!targetRect || placement === 'center') {
    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }
  
  const padding = 16;
  
  switch (placement) {
    case 'top':
      return {
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.top - padding,
        transform: 'translate(-50%, -100%)',
      };
    case 'bottom':
      return {
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.bottom + padding,
        transform: 'translate(-50%, 0)',
      };
    case 'left':
      return {
        left: targetRect.left - padding,
        top: targetRect.top + targetRect.height / 2,
        transform: 'translate(-100%, -50%)',
      };
    case 'right':
      return {
        left: targetRect.right + padding,
        top: targetRect.top + targetRect.height / 2,
        transform: 'translate(0, -50%)',
      };
    default:
      return {};
  }
}
```

---

## 5. Interactive Walkthroughs

### 5.1 Walkthrough Types

Interactive walkthroughs guide users through completing actual tasks, not just viewing features.

```typescript
// lib/ftue/walkthroughs.ts

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  expectedAction: 'click' | 'input' | 'select' | 'navigate';
  expectedValue?: string;
  hint?: string;
  validation?: (element: HTMLElement) => boolean;
  onComplete?: () => void;
}

export interface Walkthrough {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  steps: WalkthroughStep[];
  reward?: {
    type: 'badge' | 'celebration' | 'feature_unlock';
    value: string;
  };
}

export const WALKTHROUGHS: Record<string, Walkthrough> = {
  create_first_budget: {
    id: 'create_first_budget',
    name: 'Create Your First Budget',
    description: 'Set spending limits to avoid surprise bills',
    estimatedTime: '2 min',
    steps: [
      {
        id: 'navigate',
        title: 'Go to Budgets',
        description: 'Click on Budgets in the sidebar',
        targetSelector: '[data-nav="budgets"]',
        expectedAction: 'click',
      },
      {
        id: 'click_create',
        title: 'Start Creating',
        description: 'Click the "Create Budget" button',
        targetSelector: '[data-action="create-budget"]',
        expectedAction: 'click',
      },
      {
        id: 'enter_name',
        title: 'Name Your Budget',
        description: 'Give your budget a descriptive name',
        targetSelector: '[data-field="budget-name"]',
        expectedAction: 'input',
        hint: 'e.g., "Monthly AI Spend" or "Engineering Team"',
      },
      {
        id: 'set_amount',
        title: 'Set the Limit',
        description: 'Enter your monthly spending limit',
        targetSelector: '[data-field="budget-amount"]',
        expectedAction: 'input',
        hint: 'Start with your current average monthly spend',
      },
      {
        id: 'save',
        title: 'Save Budget',
        description: 'Click Save to create your budget',
        targetSelector: '[data-action="save-budget"]',
        expectedAction: 'click',
      },
    ],
    reward: {
      type: 'celebration',
      value: 'first_budget_created',
    },
  },
  
  create_first_alert: {
    id: 'create_first_alert',
    name: 'Set Up Your First Alert',
    description: 'Get notified about unusual spending',
    estimatedTime: '2 min',
    steps: [
      {
        id: 'navigate',
        title: 'Go to Alerts',
        description: 'Click on Alerts in the sidebar',
        targetSelector: '[data-nav="alerts"]',
        expectedAction: 'click',
      },
      {
        id: 'click_create',
        title: 'Create New Alert',
        description: 'Click the "Create Alert" button',
        targetSelector: '[data-action="create-alert"]',
        expectedAction: 'click',
      },
      {
        id: 'select_type',
        title: 'Choose Alert Type',
        description: 'Select "Spending Threshold" alert',
        targetSelector: '[data-option="spend_threshold"]',
        expectedAction: 'click',
      },
      {
        id: 'set_threshold',
        title: 'Set Threshold',
        description: 'Enter the amount that triggers this alert',
        targetSelector: '[data-field="threshold-amount"]',
        expectedAction: 'input',
      },
      {
        id: 'save',
        title: 'Activate Alert',
        description: 'Click Save to activate your alert',
        targetSelector: '[data-action="save-alert"]',
        expectedAction: 'click',
      },
    ],
    reward: {
      type: 'badge',
      value: 'alert_master',
    },
  },
  
  connect_second_provider: {
    id: 'connect_second_provider',
    name: 'Connect Another Provider',
    description: 'Get a unified view across multiple AI providers',
    estimatedTime: '3 min',
    steps: [
      {
        id: 'navigate',
        title: 'Go to Providers',
        description: 'Click on Providers in the sidebar',
        targetSelector: '[data-nav="providers"]',
        expectedAction: 'click',
      },
      {
        id: 'click_add',
        title: 'Add Provider',
        description: 'Click "Add Provider" to connect another service',
        targetSelector: '[data-action="add-provider"]',
        expectedAction: 'click',
      },
      // ... provider-specific steps
    ],
    reward: {
      type: 'feature_unlock',
      value: 'multi_provider_analytics',
    },
  },
};
```

### 5.2 Walkthrough UI Component

```typescript
// components/ftue/InteractiveWalkthrough.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Walkthrough, WalkthroughStep } from '@/lib/ftue/walkthroughs';

interface InteractiveWalkthroughProps {
  walkthrough: Walkthrough;
  isActive: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

export function InteractiveWalkthrough({
  walkthrough,
  isActive,
  onComplete,
  onDismiss,
}: InteractiveWalkthroughProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  
  const currentStep = walkthrough.steps[currentStepIndex];
  
  // Listen for step completion
  useEffect(() => {
    if (!isActive || !currentStep) return;
    
    const target = document.querySelector(currentStep.targetSelector);
    if (!target) return;
    
    const handleAction = (event: Event) => {
      let completed = false;
      
      switch (currentStep.expectedAction) {
        case 'click':
          completed = true;
          break;
        case 'input':
          const input = target as HTMLInputElement;
          completed = input.value.length > 0;
          break;
        case 'select':
          completed = true;
          break;
      }
      
      if (completed) {
        // Mark step complete
        setCompletedSteps(prev => new Set([...prev, currentStep.id]));
        
        // Move to next step after short delay
        setTimeout(() => {
          if (currentStepIndex < walkthrough.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
          } else {
            onComplete();
          }
        }, 500);
      }
    };
    
    // Add highlight to target
    target.classList.add('walkthrough-target');
    
    // Listen for interactions
    target.addEventListener('click', handleAction);
    target.addEventListener('input', handleAction);
    
    return () => {
      target.classList.remove('walkthrough-target');
      target.removeEventListener('click', handleAction);
      target.removeEventListener('input', handleAction);
    };
  }, [isActive, currentStep, currentStepIndex, walkthrough.steps.length, onComplete]);
  
  if (!isActive) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-40"
    >
      {/* Header */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-medium">WALKTHROUGH</p>
          <h3 className="text-white font-semibold">{walkthrough.name}</h3>
        </div>
        <button onClick={onDismiss} className="text-white/60 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-500">
            Step {currentStepIndex + 1} of {walkthrough.steps.length}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">
            ~{walkthrough.estimatedTime}
          </span>
        </div>
        <div className="flex gap-1">
          {walkthrough.steps.map((step, i) => (
            <div
              key={step.id}
              className={`h-1 flex-1 rounded-full ${
                completedSteps.has(step.id)
                  ? 'bg-green-500'
                  : i === currentStepIndex
                    ? 'bg-primary'
                    : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Current Step */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          {completedSteps.has(currentStep.id) ? (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <Circle className="h-5 w-5 text-primary flex-shrink-0" />
          )}
          <div>
            <h4 className="font-medium text-slate-900">{currentStep.title}</h4>
            <p className="text-sm text-slate-600 mt-1">
              {currentStep.description}
            </p>
          </div>
        </div>
        
        {/* Hint */}
        {currentStep.hint && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{currentStep.hint}</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <Button variant="ghost" size="sm" onClick={onDismiss} className="w-full">
          I'll do this later
        </Button>
      </div>
    </motion.div>
  );
}
```

---

## 6. Contextual Tooltips

### 6.1 Tooltip Registry

```typescript
// lib/ftue/tooltips.ts

export interface ContextualTooltip {
  id: string;
  target: string;           // CSS selector
  title: string;
  content: string;
  trigger: TooltipTrigger;
  dismissBehavior: 'once' | 'always' | 'action';
  actionToTrack?: string;   // Event that dismisses permanently
  priority: number;         // Higher = show first
  maxShows?: number;        // Max times to show
}

export type TooltipTrigger = 
  | { type: 'first_hover' }
  | { type: 'first_visit'; page: string }
  | { type: 'after_action'; action: string }
  | { type: 'time_delay'; seconds: number }
  | { type: 'empty_state'; selector: string };

export const CONTEXTUAL_TOOLTIPS: ContextualTooltip[] = [
  // Dashboard tooltips
  {
    id: 'date_range_tip',
    target: '[data-tour="date-range"]',
    title: 'Change Time Range',
    content: 'Click to view costs for different periods: last 7 days, 30 days, or a custom range.',
    trigger: { type: 'first_hover' },
    dismissBehavior: 'once',
    priority: 10,
  },
  {
    id: 'export_button_tip',
    target: '[data-action="export"]',
    title: 'Export Your Data',
    content: 'Download cost data as CSV for your finance team or spreadsheet analysis.',
    trigger: { type: 'first_hover' },
    dismissBehavior: 'once',
    priority: 5,
  },
  {
    id: 'model_click_tip',
    target: '[data-tour="model-breakdown"]',
    title: 'Click to Filter',
    content: 'Click on any model to filter the dashboard and see only that model\'s costs.',
    trigger: { type: 'first_hover' },
    dismissBehavior: 'action',
    actionToTrack: 'model_filter_applied',
    priority: 8,
  },
  
  // Feature discovery tooltips
  {
    id: 'optimization_ready',
    target: '[data-nav="optimization"]',
    title: '💡 Optimization Insights Ready!',
    content: 'We found 3 ways to reduce your AI costs. Click to see recommendations.',
    trigger: { type: 'after_action', action: 'optimization_available' },
    dismissBehavior: 'action',
    actionToTrack: 'viewed_optimization',
    priority: 20,
  },
  {
    id: 'sdk_suggestion',
    target: '[data-tour="attribution-section"]',
    title: 'Want More Detail?',
    content: 'Install the SDK to see costs broken down by feature, team, and user.',
    trigger: { type: 'time_delay', seconds: 60 },
    dismissBehavior: 'action',
    actionToTrack: 'sdk_connected',
    priority: 15,
    maxShows: 3,
  },
  
  // Empty state helpers
  {
    id: 'no_alerts_tip',
    target: '[data-empty="alerts"]',
    title: 'Protect Your Budget',
    content: 'Set up alerts to get notified when spending is unusual or exceeds thresholds.',
    trigger: { type: 'empty_state', selector: '[data-empty="alerts"]' },
    dismissBehavior: 'action',
    actionToTrack: 'alert_created',
    priority: 12,
  },
];
```

### 6.2 Tooltip Component

```typescript
// components/ftue/ContextualTooltip.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ContextualTooltip } from '@/lib/ftue/tooltips';

interface TooltipPopoverProps {
  tooltip: ContextualTooltip;
  onDismiss: () => void;
}

export function TooltipPopover({ tooltip, onDismiss }: TooltipPopoverProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const target = document.querySelector(tooltip.target);
    if (!target) return;
    
    const updatePosition = () => {
      const rect = target.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [tooltip.target]);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="fixed z-50 bg-slate-900 text-white rounded-lg shadow-xl max-w-xs"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Arrow */}
      <div 
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 
                   border-l-8 border-r-8 border-b-8 
                   border-l-transparent border-r-transparent border-b-slate-900"
      />
      
      {/* Content */}
      <div className="p-4 pr-10">
        <h4 className="font-semibold text-sm mb-1">{tooltip.title}</h4>
        <p className="text-slate-300 text-xs leading-relaxed">{tooltip.content}</p>
      </div>
      
      {/* Close */}
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-slate-400 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
```

---

## 7. Feature Discovery

### 7.1 Feature Unlock System

```typescript
// lib/ftue/feature-discovery.ts

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: FeatureUnlockCondition;
  celebrationMessage: string;
  learnMoreUrl?: string;
}

export type FeatureUnlockCondition = 
  | { type: 'signup' }
  | { type: 'action'; action: string }
  | { type: 'count'; metric: string; threshold: number }
  | { type: 'time'; daysAfterSignup: number }
  | { type: 'plan'; minimumPlan: string };

export const FEATURES: Feature[] = [
  {
    id: 'basic_dashboard',
    name: 'Cost Dashboard',
    description: 'View your AI spending overview',
    icon: '📊',
    unlockCondition: { type: 'signup' },
    celebrationMessage: 'Your dashboard is ready!',
  },
  {
    id: 'provider_insights',
    name: 'Provider Analytics',
    description: 'Deep dive into provider-specific costs',
    icon: '🔌',
    unlockCondition: { type: 'action', action: 'provider_connected' },
    celebrationMessage: 'Provider connected! Data syncing...',
  },
  {
    id: 'cost_attribution',
    name: 'Cost Attribution',
    description: 'Track costs by feature, team, and user',
    icon: '🏷️',
    unlockCondition: { type: 'action', action: 'sdk_connected' },
    celebrationMessage: 'SDK connected! Attribution unlocked.',
  },
  {
    id: 'smart_routing',
    name: 'Smart Model Routing',
    description: 'Automatically route to cost-efficient models',
    icon: '🧠',
    unlockCondition: { type: 'count', metric: 'sdk_requests', threshold: 1000 },
    celebrationMessage: 'Smart routing unlocked! You have enough data.',
  },
  {
    id: 'optimization_insights',
    name: 'Optimization Engine',
    description: 'AI-powered cost reduction recommendations',
    icon: '💡',
    unlockCondition: { type: 'time', daysAfterSignup: 7 },
    celebrationMessage: 'Optimization insights are ready!',
  },
  {
    id: 'advanced_alerts',
    name: 'Advanced Alerting',
    description: 'Anomaly detection and predictive alerts',
    icon: '🚨',
    unlockCondition: { type: 'plan', minimumPlan: 'pro' },
    celebrationMessage: 'Advanced alerting is now available!',
  },
  {
    id: 'team_workspaces',
    name: 'Team Workspaces',
    description: 'Separate dashboards for each team',
    icon: '👥',
    unlockCondition: { type: 'action', action: 'team_member_invited' },
    celebrationMessage: 'Team features unlocked!',
  },
];

/**
 * Check if a feature is unlocked for user
 */
export async function checkFeatureUnlock(
  userId: string,
  feature: Feature
): Promise<boolean> {
  const condition = feature.unlockCondition;
  
  switch (condition.type) {
    case 'signup':
      return true;
    
    case 'action':
      return await hasCompletedAction(userId, condition.action);
    
    case 'count':
      const count = await getMetricCount(userId, condition.metric);
      return count >= condition.threshold;
    
    case 'time':
      const signupDate = await getSignupDate(userId);
      const daysSince = Math.floor(
        (Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSince >= condition.daysAfterSignup;
    
    case 'plan':
      const userPlan = await getUserPlan(userId);
      return isPlanAtLeast(userPlan, condition.minimumPlan);
    
    default:
      return false;
  }
}
```

### 7.2 What's New Announcements

```typescript
// lib/ftue/announcements.ts

export interface Announcement {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'tip';
  icon?: string;
  imageUrl?: string;
  actionLabel?: string;
  actionUrl?: string;
  targetAudience?: string[];  // User segments
  startDate: string;
  endDate?: string;
  dismissible: boolean;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'smart_routing_launch',
    title: 'New: Smart Model Routing',
    description: 'Automatically route requests to the most cost-effective model based on complexity. Save up to 40% on AI costs.',
    type: 'feature',
    icon: '🧠',
    actionLabel: 'Try it now',
    actionUrl: '/settings/routing',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    dismissible: true,
  },
  {
    id: 'weekly_digest_tip',
    title: 'Pro tip: Weekly Digests',
    description: 'Get a summary of your AI spending delivered to your inbox every Monday. Enable in settings.',
    type: 'tip',
    icon: '💡',
    actionLabel: 'Enable now',
    actionUrl: '/settings/notifications',
    startDate: '2025-01-01',
    dismissible: true,
  },
];
```

---

## 8. Help System

### 8.1 Help Center Integration

```typescript
// lib/ftue/help.ts

export interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  url: string;
  keywords: string[];
}

export interface ContextualHelp {
  page: string;
  articles: HelpArticle[];
  quickActions: QuickAction[];
  faq: FAQ[];
}

export interface QuickAction {
  label: string;
  icon: string;
  action: 'tour' | 'article' | 'chat' | 'video';
  target: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export const CONTEXTUAL_HELP: Record<string, ContextualHelp> = {
  dashboard: {
    page: 'dashboard',
    articles: [
      {
        id: 'understanding-dashboard',
        title: 'Understanding Your Dashboard',
        summary: 'Learn how to read and interpret your AI cost dashboard',
        category: 'Getting Started',
        url: '/docs/dashboard',
        keywords: ['dashboard', 'overview', 'metrics', 'charts'],
      },
      {
        id: 'date-ranges',
        title: 'Working with Date Ranges',
        summary: 'Compare costs across different time periods',
        category: 'Dashboard',
        url: '/docs/date-ranges',
        keywords: ['date', 'time', 'compare', 'history'],
      },
    ],
    quickActions: [
      { label: 'Take a tour', icon: '🎯', action: 'tour', target: 'dashboard_intro' },
      { label: 'Watch video', icon: '🎬', action: 'video', target: 'dashboard-overview' },
      { label: 'Chat with us', icon: '💬', action: 'chat', target: 'support' },
    ],
    faq: [
      {
        question: 'Why is my data delayed?',
        answer: 'We sync data from providers every 5 minutes. New usage typically appears within 10 minutes.',
      },
      {
        question: 'How are costs calculated?',
        answer: 'Costs are calculated using official pricing from each provider, updated daily.',
      },
    ],
  },
  
  budgets: {
    page: 'budgets',
    articles: [
      {
        id: 'setting-budgets',
        title: 'Setting Up Budgets',
        summary: 'Create spending limits to control AI costs',
        category: 'Budgets',
        url: '/docs/budgets',
        keywords: ['budget', 'limit', 'spending', 'control'],
      },
    ],
    quickActions: [
      { label: 'Create budget', icon: '➕', action: 'tour', target: 'create_budget_walkthrough' },
      { label: 'Best practices', icon: '📖', action: 'article', target: 'budget-best-practices' },
    ],
    faq: [
      {
        question: 'What happens when I exceed my budget?',
        answer: 'You\'ll receive alerts at configured thresholds. Optional hard limits can block API keys.',
      },
    ],
  },
};
```

### 8.2 Help Widget Component

```typescript
// components/ftue/HelpWidget.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Search, Book, MessageCircle, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CONTEXTUAL_HELP, ContextualHelp } from '@/lib/ftue/help';

interface HelpWidgetProps {
  currentPage: string;
  onStartTour: (tourId: string) => void;
}

export function HelpWidget({ currentPage, onStartTour }: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const help = CONTEXTUAL_HELP[currentPage];
  
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full 
                   shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-30"
        data-tour="help-button"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
      
      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 bg-white rounded-xl shadow-2xl 
                       border border-slate-200 overflow-hidden z-40"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-semibold">Help & Resources</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Quick Actions */}
            {help && (
              <div className="p-4 border-b border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {help.quickActions.map((action) => (
                    <button
                      key={action.target}
                      onClick={() => {
                        if (action.action === 'tour') {
                          onStartTour(action.target);
                          setIsOpen(false);
                        }
                      }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 
                                 hover:bg-slate-100 transition-colors text-left"
                    >
                      <span>{action.icon}</span>
                      <span className="text-sm font-medium text-slate-700">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Related Articles */}
            {help && help.articles.length > 0 && (
              <div className="p-4 border-b border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">
                  Related Articles
                </h4>
                <div className="space-y-2">
                  {help.articles.map((article) => (
                    <a
                      key={article.id}
                      href={article.url}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50"
                    >
                      <Book className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {article.title}
                        </p>
                        <p className="text-xs text-slate-500">{article.summary}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* FAQ */}
            {help && help.faq.length > 0 && (
              <div className="p-4 border-b border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">
                  FAQ
                </h4>
                <div className="space-y-3">
                  {help.faq.map((item, i) => (
                    <details key={i} className="group">
                      <summary className="text-sm font-medium text-slate-700 cursor-pointer">
                        {item.question}
                      </summary>
                      <p className="text-sm text-slate-500 mt-2 pl-4">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}
            
            {/* Footer */}
            <div className="p-4 bg-slate-50">
              <p className="text-xs text-slate-500 text-center">
                Need more help?{' '}
                <a href="/support" className="text-primary hover:underline">
                  Contact support
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## 9. SDK Integration Guide

### 9.1 In-App SDK Setup Experience

```typescript
// components/ftue/SDKSetupGuide.tsx

'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SDKSetupGuideProps {
  apiKey: string;
  onVerified: () => void;
}

export function SDKSetupGuide({ apiKey, onVerified }: SDKSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState<'nodejs' | 'python'>('nodejs');
  const [copied, setCopied] = useState<string | null>(null);
  
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const installCommands = {
    nodejs: 'npm install @tokentra/sdk',
    python: 'pip install tokentra',
  };
  
  const codeExamples = {
    nodejs: `import { TokenTra } from '@tokentra/sdk';
import OpenAI from 'openai';

// Initialize TokenTra
const tokentra = new TokenTra({
  apiKey: process.env.TOKENTRA_API_KEY
});

// Wrap your OpenAI client
const openai = tokentra.wrap(new OpenAI());

// Use normally - tracking happens automatically
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }]
});`,
    python: `from tokentra import TokenTra
from openai import OpenAI

# Initialize TokenTra
tokentra = TokenTra(api_key=os.environ['TOKENTRA_API_KEY'])

# Wrap your OpenAI client
openai = tokentra.wrap(OpenAI())

# Use normally - tracking happens automatically
response = openai.chat.completions.create(
    model='gpt-4',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)`,
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              currentStep > step 
                ? 'bg-green-500 text-white'
                : currentStep === step
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 text-slate-500'
            }`}>
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
            {step < 4 && (
              <div className={`w-16 h-1 mx-2 ${
                currentStep > step ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Step 1: Choose Language */}
      {currentStep === 1 && (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Choose Your Language</h2>
          <p className="text-slate-600 mb-6">
            Select your primary programming language
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => { setLanguage('nodejs'); setCurrentStep(2); }}
              className={`p-6 border-2 rounded-xl hover:border-primary transition-colors ${
                language === 'nodejs' ? 'border-primary bg-primary/5' : 'border-slate-200'
              }`}
            >
              <div className="text-4xl mb-2">⬢</div>
              <div className="font-medium">Node.js</div>
              <div className="text-xs text-slate-500">JavaScript / TypeScript</div>
            </button>
            
            <button
              onClick={() => { setLanguage('python'); setCurrentStep(2); }}
              className={`p-6 border-2 rounded-xl hover:border-primary transition-colors ${
                language === 'python' ? 'border-primary bg-primary/5' : 'border-slate-200'
              }`}
            >
              <div className="text-4xl mb-2">🐍</div>
              <div className="font-medium">Python</div>
              <div className="text-xs text-slate-500">Python 3.8+</div>
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Install */}
      {currentStep === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Install the SDK</h2>
          <p className="text-slate-600 mb-6">
            Run this command in your project
          </p>
          
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-white flex items-center justify-between">
            <code>$ {installCommands[language]}</code>
            <button
              onClick={() => copyToClipboard(installCommands[language], 'install')}
              className="text-slate-400 hover:text-white"
            >
              {copied === 'install' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button onClick={() => setCurrentStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 3: API Key & Code */}
      {currentStep === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Add to Your Code</h2>
          <p className="text-slate-600 mb-6">
            Copy your API key and add the code to your project
          </p>
          
          {/* API Key */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Your API Key
            </label>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 font-mono text-sm flex items-center justify-between">
              <code className="text-amber-800">{apiKey}</code>
              <button
                onClick={() => copyToClipboard(apiKey, 'apikey')}
                className="text-amber-600 hover:text-amber-800"
              >
                {copied === 'apikey' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Save this key securely - you won't be able to see it again
            </p>
          </div>
          
          {/* Code Example */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Example Code
            </label>
            <div className="bg-slate-900 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
                <span className="text-slate-400 text-xs">
                  {language === 'nodejs' ? 'index.ts' : 'main.py'}
                </span>
                <button
                  onClick={() => copyToClipboard(codeExamples[language], 'code')}
                  className="text-slate-400 hover:text-white"
                >
                  {copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <pre className="p-4 text-sm text-white overflow-x-auto">
                <code>{codeExamples[language]}</code>
              </pre>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setCurrentStep(2)}>
              Back
            </Button>
            <Button onClick={() => setCurrentStep(4)}>
              Verify Installation
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 4: Verify */}
      {currentStep === 4 && (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Verify Installation</h2>
          <p className="text-slate-600 mb-6">
            Make an AI request in your app. We'll detect it automatically.
          </p>
          
          <div className="bg-slate-50 rounded-xl p-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full bg-primary animate-ping" />
              </div>
              <p className="text-slate-600">Waiting for your first request...</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-100 rounded-lg text-left">
            <p className="text-sm font-medium text-slate-700 mb-2">Troubleshooting</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Make sure TOKENTRA_API_KEY is set in your environment</li>
              <li>• Verify you're using the wrapped client</li>
              <li>• Check the console for any error messages</li>
            </ul>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={() => setCurrentStep(3)}>
              Back
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Skip Verification
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 10. Celebration & Rewards

### 10.1 Celebration Types

```typescript
// lib/ftue/celebrations.ts

export interface Celebration {
  id: string;
  type: 'confetti' | 'badge' | 'modal' | 'toast';
  trigger: string;
  title: string;
  message: string;
  emoji?: string;
  duration?: number;
  action?: {
    label: string;
    url: string;
  };
}

export const CELEBRATIONS: Celebration[] = [
  {
    id: 'first_provider',
    type: 'confetti',
    trigger: 'provider_connected',
    title: 'Provider Connected! 🎉',
    message: 'Your data is syncing. You\'ll see your costs shortly.',
    duration: 5000,
  },
  {
    id: 'first_data',
    type: 'modal',
    trigger: 'first_data_synced',
    title: 'Your Data is Ready! 🎉',
    message: 'We\'ve synced your AI usage data. Time to explore your spending!',
    emoji: '📊',
    action: {
      label: 'View Dashboard',
      url: '/dashboard',
    },
  },
  {
    id: 'first_budget',
    type: 'toast',
    trigger: 'budget_created',
    title: 'Budget Created! 💰',
    message: 'You\'ll get alerts when spending approaches your limit.',
    duration: 4000,
  },
  {
    id: 'first_alert',
    type: 'toast',
    trigger: 'alert_created',
    title: 'Alert Active! 🔔',
    message: 'You\'ll be notified when this alert triggers.',
    duration: 4000,
  },
  {
    id: 'sdk_connected',
    type: 'confetti',
    trigger: 'sdk_first_request',
    title: 'SDK Connected! 🚀',
    message: 'You\'re now tracking costs with full attribution.',
    duration: 5000,
    action: {
      label: 'View Attribution',
      url: '/usage?view=attribution',
    },
  },
  {
    id: 'team_invite_accepted',
    type: 'toast',
    trigger: 'team_member_joined',
    title: 'Team Member Joined! 👋',
    message: 'Your team is growing!',
    duration: 4000,
  },
  {
    id: 'optimization_savings',
    type: 'modal',
    trigger: 'optimization_implemented',
    title: 'Great Savings! 💸',
    message: 'You\'ve implemented an optimization. Watch your costs go down!',
    emoji: '📉',
  },
];
```

### 10.2 Celebration Components

```typescript
// components/ftue/Confetti.tsx

'use client';

import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  duration?: number;
  onComplete?: () => void;
}

export function Confetti({ duration = 5000, onComplete }: ConfettiProps) {
  const [isActive, setIsActive] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    setWindowSize({ 
      width: window.innerWidth, 
      height: window.innerHeight 
    });
    
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onComplete]);
  
  if (!isActive) return null;
  
  return (
    <ReactConfetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
      colors={['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
    />
  );
}

// components/ftue/CelebrationModal.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Celebration } from '@/lib/ftue/celebrations';

interface CelebrationModalProps {
  celebration: Celebration;
  isOpen: boolean;
  onClose: () => void;
}

export function CelebrationModal({ celebration, isOpen, onClose }: CelebrationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {celebration.emoji && (
              <div className="text-6xl mb-4">{celebration.emoji}</div>
            )}
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {celebration.title}
            </h2>
            <p className="text-slate-600 mb-6">
              {celebration.message}
            </p>
            
            {celebration.action ? (
              <Button onClick={() => window.location.href = celebration.action!.url}>
                {celebration.action.label}
              </Button>
            ) : (
              <Button onClick={onClose}>Got it!</Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 11. State Management

### 11.1 FTUE State Store

```typescript
// lib/ftue/store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FTUEState {
  // Tour state
  activeTour: string | null;
  completedTours: string[];
  skippedTours: string[];
  
  // Tooltip state
  dismissedTooltips: string[];
  tooltipShowCounts: Record<string, number>;
  
  // Walkthrough state
  activeWalkthrough: string | null;
  completedWalkthroughs: string[];
  
  // Feature discovery
  unlockedFeatures: string[];
  celebratedFeatures: string[];
  
  // Actions
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  skipTour: (tourId: string) => void;
  
  dismissTooltip: (tooltipId: string) => void;
  incrementTooltipShow: (tooltipId: string) => void;
  
  startWalkthrough: (walkthroughId: string) => void;
  completeWalkthrough: (walkthroughId: string) => void;
  
  unlockFeature: (featureId: string) => void;
  celebrateFeature: (featureId: string) => void;
  
  reset: () => void;
}

export const useFTUEStore = create<FTUEState>()(
  persist(
    (set) => ({
      // Initial state
      activeTour: null,
      completedTours: [],
      skippedTours: [],
      dismissedTooltips: [],
      tooltipShowCounts: {},
      activeWalkthrough: null,
      completedWalkthroughs: [],
      unlockedFeatures: ['basic_dashboard'],
      celebratedFeatures: [],
      
      // Tour actions
      startTour: (tourId) => set({ activeTour: tourId }),
      completeTour: (tourId) => set((state) => ({
        activeTour: null,
        completedTours: [...state.completedTours, tourId],
      })),
      skipTour: (tourId) => set((state) => ({
        activeTour: null,
        skippedTours: [...state.skippedTours, tourId],
      })),
      
      // Tooltip actions
      dismissTooltip: (tooltipId) => set((state) => ({
        dismissedTooltips: [...state.dismissedTooltips, tooltipId],
      })),
      incrementTooltipShow: (tooltipId) => set((state) => ({
        tooltipShowCounts: {
          ...state.tooltipShowCounts,
          [tooltipId]: (state.tooltipShowCounts[tooltipId] || 0) + 1,
        },
      })),
      
      // Walkthrough actions
      startWalkthrough: (walkthroughId) => set({ activeWalkthrough: walkthroughId }),
      completeWalkthrough: (walkthroughId) => set((state) => ({
        activeWalkthrough: null,
        completedWalkthroughs: [...state.completedWalkthroughs, walkthroughId],
      })),
      
      // Feature actions
      unlockFeature: (featureId) => set((state) => ({
        unlockedFeatures: [...state.unlockedFeatures, featureId],
      })),
      celebrateFeature: (featureId) => set((state) => ({
        celebratedFeatures: [...state.celebratedFeatures, featureId],
      })),
      
      // Reset
      reset: () => set({
        activeTour: null,
        completedTours: [],
        skippedTours: [],
        dismissedTooltips: [],
        tooltipShowCounts: {},
        activeWalkthrough: null,
        completedWalkthroughs: [],
        unlockedFeatures: ['basic_dashboard'],
        celebratedFeatures: [],
      }),
    }),
    {
      name: 'tokentra-ftue',
    }
  )
);
```

---

## 12. Analytics & Tracking

### 12.1 FTUE Events

```typescript
// lib/ftue/analytics.ts

export const FTUE_EVENTS = {
  // Tour events
  TOUR_STARTED: 'ftue_tour_started',
  TOUR_STEP_VIEWED: 'ftue_tour_step_viewed',
  TOUR_COMPLETED: 'ftue_tour_completed',
  TOUR_SKIPPED: 'ftue_tour_skipped',
  
  // Tooltip events
  TOOLTIP_SHOWN: 'ftue_tooltip_shown',
  TOOLTIP_DISMISSED: 'ftue_tooltip_dismissed',
  TOOLTIP_ACTION: 'ftue_tooltip_action',
  
  // Walkthrough events
  WALKTHROUGH_STARTED: 'ftue_walkthrough_started',
  WALKTHROUGH_STEP_COMPLETED: 'ftue_walkthrough_step_completed',
  WALKTHROUGH_COMPLETED: 'ftue_walkthrough_completed',
  WALKTHROUGH_ABANDONED: 'ftue_walkthrough_abandoned',
  
  // Feature discovery
  FEATURE_UNLOCKED: 'ftue_feature_unlocked',
  FEATURE_CELEBRATED: 'ftue_feature_celebrated',
  
  // Help
  HELP_OPENED: 'ftue_help_opened',
  HELP_ARTICLE_VIEWED: 'ftue_help_article_viewed',
  HELP_SEARCH: 'ftue_help_search',
  
  // Empty states
  EMPTY_STATE_VIEWED: 'ftue_empty_state_viewed',
  EMPTY_STATE_ACTION: 'ftue_empty_state_action',
};

export function trackFTUEEvent(
  event: string,
  properties?: Record<string, any>
) {
  // Track with your analytics provider
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track(event, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[FTUE]', event, properties);
  }
}
```

---

## Summary

This FTUE specification provides:

1. **Empty States** - Actionable UI when no data exists
2. **Product Tours** - Step-by-step feature introductions
3. **Interactive Walkthroughs** - Guided task completion
4. **Contextual Tooltips** - Just-in-time hints
5. **Feature Discovery** - Progressive capability unlocking
6. **Help System** - Contextual documentation
7. **SDK Guide** - Interactive integration tutorial
8. **Celebrations** - Milestone rewards and feedback
9. **State Management** - Persistent FTUE progress
10. **Analytics** - Comprehensive event tracking

The goal is to get users to their "aha moment" within 10 minutes while teaching them to become power users over time.

---

*TokenTra First-Time User Experience v1.0*
*December 2025*
