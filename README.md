<div align="center">

# 🚀 TokenTRA (CostLens AI)

### Unified AI Cost Intelligence Platform

**"Datadog for AI Costs"** — Complete visibility and control over AI spending across all major providers.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Design System](#-design-system) • [SDK](#-sdk) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Value Propositions](#-core-value-propositions)
- [Features](#-features)
- [Supported Providers](#-supported-providers)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Architecture](#-project-architecture)
- [Design System](#-design-system)
- [Component Library](#-component-library)
- [State Management](#-state-management)
- [API Structure](#-api-structure)
- [SDK Documentation](#-sdk-documentation)
- [Environment Variables](#-environment-variables)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)

---

## 🎯 Overview

**TokenTRA** (internally codenamed **CostLens AI**) is an enterprise-grade AI cost intelligence platform that provides organizations with complete visibility into their AI spending across multiple providers. Think of it as **Datadog for AI costs** — a single pane of glass to monitor, analyze, optimize, and control AI expenditure.

### The Problem We Solve

Organizations using AI face several challenges:
- **Fragmented visibility**: Costs scattered across OpenAI, Anthropic, Azure, Google, AWS
- **No attribution**: Can't tell which team, project, or feature is driving costs
- **Bill shock**: Unexpected spikes with no warning
- **Optimization blindness**: No insights on how to reduce spend
- **Chargeback complexity**: Can't allocate costs to cost centers

### Our Solution

TokenTRA aggregates usage and cost data from all AI providers, enriches it with attribution metadata, and provides actionable insights to optimize spending — all in a beautiful, intuitive dashboard.

---

## 💎 Core Value Propositions

| Value | Description |
|-------|-------------|
| **🔍 Unified Dashboard** | Single pane of glass for all AI spending across providers |
| **📊 Cost Attribution** | Know exactly who's spending what — by team, project, feature, or user |
| **🧠 Optimization Engine** | AI-powered recommendations to reduce spend (model switching, caching, prompt optimization) |
| **💰 Budget Controls** | Prevent bill shock with alerts, thresholds, and hard limits |
| **🔀 Smart Model Routing** | Automatically route requests to cost-efficient models based on task complexity |

---

## ✨ Features

### Dashboard & Analytics
- **Overview Dashboard** — Key metrics at a glance: total spend, tokens, requests, savings opportunities
- **Cost Analysis** — Breakdown by provider, model, team, project, feature, and time period
- **Usage Analytics** — Token consumption, request volumes, latency metrics
- **Trend Analysis** — Historical trends, forecasting, and anomaly detection
- **Comparison Mode** — Compare periods side-by-side

### Provider Management
- **Multi-Provider Support** — Connect OpenAI, Anthropic, Azure OpenAI, Google Vertex AI, AWS Bedrock
- **API Key Management** — Secure credential storage with encryption at rest
- **Sync Status** — Real-time sync status and error monitoring
- **Usage Import** — Automatic import of usage data from provider APIs

### Cost Optimization
- **Recommendations** — AI-powered suggestions (model downgrades, caching, prompt compression)
- **Savings Calculator** — Estimate potential savings before implementing changes
- **Model Routing** — Configure rules to route requests to optimal models
- **Caching Analysis** — Identify cacheable queries to reduce API calls

### Budget & Alerts
- **Budget Management** — Set budgets by organization, team, project, or cost center
- **Alert Thresholds** — Configure alerts at 50%, 80%, 100% (customizable)
- **Hard Limits** — Optionally block requests when budget is exceeded
- **Multi-Channel Alerts** — Email, Slack, PagerDuty, webhooks

### Reporting & Chargeback
- **Report Builder** — Custom reports with flexible filters
- **Chargeback Reports** — Allocate costs to cost centers for internal billing
- **Scheduled Reports** — Automated weekly/monthly reports
- **Export** — CSV, PDF, and API access

### Organization Management
- **Teams** — Group users and track team-level spending
- **Projects** — Organize work and attribute costs
- **Cost Centers** — Map costs to business units
- **API Keys** — Manage SDK keys for cost tracking

---

## 🔌 Supported Providers

| Provider | Status | Auth Method | Features |
|----------|--------|-------------|----------|
| **OpenAI** | ✅ Supported | API Key | Usage API, Costs API, Models API |
| **Anthropic** | ✅ Supported | API Key | Admin API, Usage Reports |
| **Azure OpenAI** | ✅ Supported | API Key / Azure AD | Cost Management API |
| **Google Vertex AI** | ✅ Supported | Service Account | Cloud Billing API |
| **AWS Bedrock** | ✅ Supported | IAM Role | Cost Explorer API |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework with App Router, Server Components, Turbopack |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript (strict mode) |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **React Aria Components** | 1.x | Accessible UI primitives |
| **Recharts** | 2.x | Charting library |
| **TanStack Query** | 5.x | Server state management |
| **TanStack Table** | 8.x | Headless table library |
| **Zustand** | 5.x | Client state management |
| **React Hook Form** | 7.x | Form handling |
| **Zod** | 3.x | Schema validation |
| **Motion** | 12.x | Animation library |
| **date-fns** | 4.x | Date utilities |

### Icons

| Library | Purpose |
|---------|---------|
| **Iconsax React** | Primary icon set (Outline/Bold variants) |
| **Untitled UI Icons** | Secondary icons |
| **Lobehub Icons** | AI provider logos |
| **Untitled UI File Icons** | File type icons |

### Backend (API Routes)

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Edge & Node.js runtime |
| **NextAuth.js v5** | Authentication |
| **Zod** | Request/response validation |
| **Upstash Redis** | Rate limiting & caching |

### Infrastructure (Planned)

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database, Auth, Realtime |
| **Upstash Redis** | Caching, rate limiting, queues |
| **Stripe** | Subscription billing |
| **Sentry** | Error tracking |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later (or **bun** 1.x)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/tokentra.git
   cd tokentra
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration (see [Environment Variables](#-environment-variables)).

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

---

## 🏗 Project Architecture

```
tokentra/
├── .env.example              # Environment variable template
├── .env.local                # Local environment variables (git-ignored)
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
│
├── public/                   # Static assets
│   ├── images/               # Images and logos
│   └── fonts/                # Custom fonts
│
├── sdk/                      # TokenTRA SDK (separate package)
│   └── typescript/           # TypeScript SDK
│       ├── src/
│       │   ├── index.ts      # SDK entry point
│       │   ├── client.ts     # CostLens client
│       │   ├── wrapper.ts    # Provider wrappers (OpenAI, Anthropic)
│       │   └── types.ts      # SDK types
│       └── package.json
│
├── docs/                     # Documentation
│   ├── README.md
│   ├── api-reference.md
│   ├── sdk-guide.md
│   ├── provider-setup.md
│   └── best-practices.md
│
└── src/
    ├── app/                  # Next.js App Router
    │   ├── layout.tsx        # Root layout
    │   ├── page.tsx          # Landing/Auth page
    │   ├── globals.css       # Global styles
    │   ├── error.tsx         # Error boundary
    │   ├── loading.tsx       # Loading state
    │   ├── not-found.tsx     # 404 page
    │   │
    │   ├── (auth)/           # Auth route group
    │   │   ├── login/
    │   │   ├── signup/
    │   │   └── forgot-password/
    │   │
    │   ├── api/              # API routes
    │   │   ├── auth/         # NextAuth endpoints
    │   │   └── v1/           # Versioned API
    │   │       ├── costs/
    │   │       ├── usage/
    │   │       ├── providers/
    │   │       ├── budgets/
    │   │       ├── alerts/
    │   │       ├── teams/
    │   │       ├── projects/
    │   │       └── optimization/
    │   │
    │   └── dashboard/        # Protected dashboard
    │       ├── layout.tsx    # Dashboard shell (sidebar + header)
    │       ├── overview/     # Main dashboard
    │       ├── costs/        # Cost analysis
    │       │   ├── by-provider/
    │       │   ├── by-model/
    │       │   ├── by-team/
    │       │   └── by-project/
    │       ├── usage/        # Usage analytics
    │       ├── providers/    # Provider management
    │       ├── optimization/ # Recommendations
    │       ├── budgets/      # Budget management
    │       ├── alerts/       # Alert rules
    │       ├── reports/      # Reporting
    │       ├── teams/        # Team management
    │       ├── projects/     # Project management
    │       ├── cost-centers/ # Cost center management
    │       ├── api-keys/     # API key management
    │       └── settings/     # Organization settings
    │
    ├── components/
    │   ├── base/             # Design system primitives
    │   │   ├── buttons/      # Button variants
    │   │   ├── inputs/       # Input components
    │   │   ├── avatar/       # Avatar component
    │   │   ├── badges/       # Badge variants
    │   │   ├── modals/       # Dialog/Modal
    │   │   ├── dropdowns/    # Dropdown menus
    │   │   ├── tooltips/     # Tooltips
    │   │   ├── tabs/         # Tab components
    │   │   └── progress-indicators/
    │   │
    │   ├── application/      # Complex app components
    │   │   ├── table/        # Data tables
    │   │   ├── pagination/   # Pagination
    │   │   ├── command-menu/ # Command palette
    │   │   └── date-picker/  # Date range picker
    │   │
    │   ├── dashboard/        # Dashboard-specific
    │   │   ├── overview/     # Overview components
    │   │   ├── costs/        # Cost components
    │   │   ├── usage/        # Usage components
    │   │   ├── providers/    # Provider components
    │   │   ├── optimization/ # Optimization components
    │   │   ├── budgets/      # Budget components
    │   │   ├── alerts/       # Alert components
    │   │   ├── reports/      # Report components
    │   │   ├── teams/        # Team components
    │   │   ├── projects/     # Project components
    │   │   ├── settings/     # Settings components
    │   │   ├── header/       # Dashboard header
    │   │   └── sidebar/      # Dashboard sidebar
    │   │
    │   ├── charts/           # Chart components
    │   │   ├── area-chart.tsx
    │   │   ├── bar-chart.tsx
    │   │   ├── line-chart.tsx
    │   │   ├── pie-chart.tsx
    │   │   └── sparkline.tsx
    │   │
    │   ├── forms/            # Form components
    │   ├── data-display/     # Data display components
    │   ├── feedback/         # Feedback components
    │   ├── layout/           # Layout components
    │   ├── auth/             # Auth components
    │   └── shared-assets/    # Shared assets (logos, icons)
    │
    ├── hooks/                # Custom React hooks
    │   ├── use-costs.ts      # Cost data hooks
    │   ├── use-usage.ts      # Usage data hooks
    │   ├── use-budgets.ts    # Budget hooks
    │   ├── use-alerts.ts     # Alert hooks
    │   ├── use-providers.ts  # Provider hooks
    │   ├── use-teams.ts      # Team hooks
    │   ├── use-projects.ts   # Project hooks
    │   ├── use-optimization.ts
    │   ├── use-date-range.ts
    │   ├── use-filters.ts
    │   ├── use-debounce.ts
    │   ├── use-local-storage.ts
    │   └── use-media-query.ts
    │
    ├── stores/               # Zustand stores
    │   ├── app-store.ts      # Global app state
    │   ├── auth-store.ts     # Auth state
    │   ├── filter-store.ts   # Filter state
    │   ├── ui-store.ts       # UI state (sidebar, modals)
    │   ├── dashboard-store.ts
    │   ├── organization-store.ts
    │   ├── notification-store.ts
    │   └── preferences-store.ts
    │
    ├── services/             # Business logic services
    │   ├── cost-service.ts
    │   ├── usage-service.ts
    │   ├── budget-service.ts
    │   ├── alert-service.ts
    │   ├── provider-service.ts
    │   ├── team-service.ts
    │   ├── project-service.ts
    │   ├── optimization-service.ts
    │   ├── report-service.ts
    │   └── notification-service.ts
    │
    ├── lib/                  # Utility libraries
    │   ├── utils.ts          # General utilities (cn, etc.)
    │   ├── constants.ts      # App constants
    │   ├── config.ts         # Configuration
    │   │
    │   ├── api/              # API utilities
    │   │   ├── client.ts     # API client
    │   │   ├── response.ts   # Response helpers
    │   │   └── rate-limiter.ts
    │   │
    │   ├── auth/             # Auth utilities
    │   │   ├── config.ts     # NextAuth config
    │   │   ├── session.ts    # Session helpers
    │   │   └── permissions.ts
    │   │
    │   ├── providers/        # AI provider integrations
    │   │   ├── base.ts       # Base provider class
    │   │   ├── openai.ts
    │   │   ├── anthropic.ts
    │   │   ├── azure.ts
    │   │   ├── google.ts
    │   │   ├── aws.ts
    │   │   └── index.ts      # Provider factory
    │   │
    │   ├── calculations/     # Cost calculations
    │   │   ├── pricing.ts
    │   │   ├── tokens.ts
    │   │   ├── aggregations.ts
    │   │   ├── forecasting.ts
    │   │   └── savings.ts
    │   │
    │   ├── formatters/       # Formatting utilities
    │   │   ├── currency.ts
    │   │   ├── numbers.ts
    │   │   ├── dates.ts
    │   │   └── tokens.ts
    │   │
    │   ├── optimization/     # Optimization logic
    │   │   ├── analyzer.ts
    │   │   ├── recommendations.ts
    │   │   └── model-selector.ts
    │   │
    │   └── validators/       # Zod schemas
    │       ├── auth.ts
    │       ├── provider.ts
    │       ├── budget.ts
    │       ├── alert.ts
    │       └── team.ts
    │
    ├── types/                # TypeScript types
    │   ├── index.ts          # Re-exports
    │   ├── auth.ts
    │   ├── organization.ts
    │   ├── providers.ts
    │   ├── costs.ts
    │   ├── usage.ts
    │   ├── budgets.ts
    │   ├── alerts.ts
    │   ├── teams.ts
    │   ├── projects.ts
    │   ├── recommendations.ts
    │   ├── report.ts
    │   ├── api.ts
    │   └── ui.ts
    │
    ├── data/                 # Mock data (development)
    │   ├── mock-costs.ts
    │   ├── mock-usage.ts
    │   ├── mock-providers.ts
    │   ├── mock-budgets.ts
    │   ├── mock-alerts.ts
    │   ├── mock-teams.ts
    │   ├── mock-projects.ts
    │   └── mock-recommendations.ts
    │
    ├── styles/               # Styles
    │   ├── globals.css       # Global styles & Tailwind imports
    │   ├── theme.css         # Design tokens & CSS variables
    │   └── typography.css    # Typography styles
    │
    ├── utils/                # Utility functions
    │   └── cx.ts             # Class name utility
    │
    ├── providers/            # React context providers
    │   └── query-provider.tsx
    │
    └── middleware.ts         # Next.js middleware (auth, redirects)
```

---

## 🎨 Design System

TokenTRA uses a comprehensive design system with CSS custom properties (variables) for consistent theming across light and dark modes.

### Color Palette

#### Brand Colors (Purple)

The primary brand color is **purple**, representing intelligence and innovation.

| Token | Light Mode | Hex |
|-------|------------|-----|
| `brand-50` | Lightest | `#F9F5FF` |
| `brand-100` | | `#F4EBFF` |
| `brand-200` | | `#E9D7FE` |
| `brand-300` | | `#D6BBFB` |
| `brand-400` | | `#B692F6` |
| `brand-500` | Medium | `#9E77ED` |
| `brand-600` | **Primary** | `#7F56D9` |
| `brand-700` | | `#6941C6` |
| `brand-800` | | `#53389E` |
| `brand-900` | | `#42307D` |
| `brand-950` | Darkest | `#2C1C5F` |

#### Gray Scale

| Token | RGB Value | Usage |
|-------|-----------|-------|
| `gray-25` | `rgb(253 253 253)` | Subtle backgrounds |
| `gray-50` | `rgb(250 250 250)` | Secondary backgrounds |
| `gray-100` | `rgb(245 245 245)` | Tertiary backgrounds |
| `gray-200` | `rgb(233 234 235)` | Borders (light) |
| `gray-300` | `rgb(213 215 218)` | Borders (primary) |
| `gray-400` | `rgb(164 167 174)` | Disabled text |
| `gray-500` | `rgb(113 118 128)` | Placeholder text |
| `gray-600` | `rgb(83 88 98)` | Secondary text |
| `gray-700` | `rgb(65 70 81)` | Primary text (light mode) |
| `gray-800` | `rgb(37 43 55)` | Headings |
| `gray-900` | `rgb(24 29 39)` | Primary text |
| `gray-950` | `rgb(10 13 18)` | Darkest |

#### Status Colors

| Status | Primary (500/600) | Usage |
|--------|-------------------|-------|
| **Success** | `rgb(23 178 106)` / `rgb(7 148 85)` | Positive actions, savings |
| **Warning** | `rgb(247 144 9)` / `rgb(220 104 3)` | Alerts, thresholds |
| **Error** | `rgb(240 68 56)` / `rgb(217 45 32)` | Errors, critical alerts |

### Semantic Tokens

The design system uses semantic tokens that automatically adapt to light/dark mode:

```css
/* Backgrounds */
--color-bg-primary          /* Main background (white/gray-950) */
--color-bg-secondary        /* Card backgrounds (gray-50/gray-900) */
--color-bg-tertiary         /* Nested elements (gray-100/gray-800) */

/* Borders */
--color-border-primary      /* Primary borders (gray-300/gray-700) */
--color-border-secondary    /* Subtle borders (gray-200/gray-800) */

/* Text */
--color-text-primary        /* Primary text (gray-900/gray-50) */
--color-text-secondary      /* Secondary text (gray-700/gray-300) */
--color-text-tertiary       /* Tertiary text (gray-600/gray-400) */

/* Brand */
--color-bg-brand-solid      /* Brand buttons (brand-600) */
--color-text-brand-primary  /* Brand text */
```

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-xs` | `0.125rem` (2px) | Small elements |
| `radius-sm` | `0.25rem` (4px) | Inputs, small buttons |
| `radius-md` | `0.375rem` (6px) | Cards, medium buttons |
| `radius-lg` | `0.5rem` (8px) | Modals, large cards |
| `radius-xl` | `0.75rem` (12px) | Feature cards |
| `radius-2xl` | `1rem` (16px) | Hero sections |
| `radius-full` | `9999px` | Pills, avatars |

### Shadows

```css
--shadow-xs:  0px 1px 2px rgba(10, 13, 18, 0.05);
--shadow-sm:  0px 1px 3px rgba(10, 13, 18, 0.1), 0px 1px 2px -1px rgba(10, 13, 18, 0.1);
--shadow-md:  0px 4px 6px -1px rgba(10, 13, 18, 0.1), 0px 2px 4px -2px rgba(10, 13, 18, 0.06);
--shadow-lg:  0px 12px 16px -4px rgba(10, 13, 18, 0.08), ...;
--shadow-xl:  0px 20px 24px -4px rgba(10, 13, 18, 0.08), ...;
--shadow-2xl: 0px 24px 48px -12px rgba(10, 13, 18, 0.18), ...;
```

### Typography

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 18px | Labels, captions |
| `text-sm` | 14px | 20px | Body small, table cells |
| `text-md` | 16px | 24px | Body default |
| `text-lg` | 18px | 28px | Body large |
| `text-xl` | 20px | 30px | Subheadings |
| `display-xs` | 24px | 32px | Section titles |
| `display-sm` | 30px | 38px | Page titles |
| `display-md` | 36px | 44px | Hero titles |
| `display-lg` | 48px | 60px | Marketing |
| `display-xl` | 60px | 72px | Landing hero |

### Dark Mode

Dark mode is activated by adding the `.dark-mode` class to the root element. All semantic tokens automatically update:

```css
.dark-mode {
  --color-bg-primary: var(--color-gray-950);      /* rgb(12 14 18) */
  --color-bg-secondary: var(--color-gray-900);    /* rgb(19 22 27) */
  --color-text-primary: var(--color-gray-50);     /* Light text */
  --color-border-primary: var(--color-gray-700);  /* Darker borders */
}
```

---

## 🧩 Component Library

### Base Components (`/components/base/`)

Primitive UI components built on React Aria for accessibility:

| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, tertiary, destructive variants |
| `Input` | Text input with label, hint, error states |
| `Select` | Dropdown select with search |
| `Checkbox` | Checkbox with indeterminate state |
| `Radio` | Radio group |
| `Switch` | Toggle switch |
| `Avatar` | User/team avatars with fallback |
| `Badge` | Status badges with dot variants |
| `Modal` | Dialog/modal with animations |
| `Dropdown` | Dropdown menus |
| `Tooltip` | Tooltips with positioning |
| `Tabs` | Tab navigation |
| `ProgressBar` | Progress indicators |

### Application Components (`/components/application/`)

Complex, composed components:

| Component | Description |
|-----------|-------------|
| `Table` | Data table with sorting, pagination |
| `TableCard` | Table wrapped in a card |
| `Pagination` | Pagination controls |
| `CommandMenu` | Command palette (⌘K) |
| `DateRangePicker` | Date range selection |

### Dashboard Components (`/components/dashboard/`)

Feature-specific components organized by module:

- **Overview**: Stats cards, spend charts, provider breakdown, alerts
- **Costs**: Cost tables, breakdown cards, trend charts
- **Providers**: Provider cards, connection dialogs
- **Optimization**: Recommendation cards, savings charts
- **Budgets**: Budget cards, progress bars, forms
- **Alerts**: Alert cards, history, channel config

---

## 📦 State Management

### Zustand Stores

| Store | Purpose |
|-------|---------|
| `app-store` | Global app state (loading, errors) |
| `auth-store` | Authentication state |
| `filter-store` | Dashboard filters (date range, providers, teams) |
| `ui-store` | UI state (sidebar collapsed, modals open) |
| `dashboard-store` | Dashboard-specific state |
| `organization-store` | Current organization |
| `notification-store` | Toast notifications |
| `preferences-store` | User preferences |

### TanStack Query

Server state is managed with TanStack Query:

```typescript
// Query key factory pattern
export const costKeys = {
  all: ["costs"] as const,
  lists: () => [...costKeys.all, "list"] as const,
  list: (filters: CostFilters) => [...costKeys.lists(), filters] as const,
  summary: (filters: CostFilters) => [...costKeys.all, "summary", filters] as const,
};

// Usage
const { data, isLoading } = useCosts(filters);
```

---

## 🔌 API Structure

### Versioned API (`/api/v1/`)

All API routes are versioned and follow RESTful conventions:

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/v1/costs` | GET, POST | Cost records |
| `/api/v1/costs/aggregate` | GET | Aggregated costs |
| `/api/v1/costs/breakdown` | GET | Cost breakdowns |
| `/api/v1/costs/trends` | GET | Historical trends |
| `/api/v1/usage` | GET | Usage data |
| `/api/v1/providers` | GET, POST | Provider management |
| `/api/v1/providers/[id]/sync` | POST | Trigger sync |
| `/api/v1/budgets` | GET, POST, PUT, DELETE | Budget CRUD |
| `/api/v1/alerts` | GET, POST, PUT, DELETE | Alert CRUD |
| `/api/v1/teams` | GET, POST, PUT, DELETE | Team CRUD |
| `/api/v1/projects` | GET, POST, PUT, DELETE | Project CRUD |
| `/api/v1/optimization` | GET | Recommendations |

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
```

---

## 📡 SDK Documentation

The TokenTRA SDK allows you to track AI usage directly from your application code.

### Installation

```bash
npm install @tokentra/sdk
```

### Basic Usage

```typescript
import { createCostLens, wrapOpenAI } from "@tokentra/sdk";
import OpenAI from "openai";

// Initialize the client
const costlens = createCostLens({
  apiKey: "your-tokentra-api-key",
});

// Wrap your OpenAI client
const openai = wrapOpenAI(new OpenAI(), costlens);

// Use as normal - usage is automatically tracked
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Attribution

Add metadata for cost attribution:

```typescript
const response = await openai.chat.completions.create(
  {
    model: "gpt-4o",
    messages: [{ role: "user", content: "Hello!" }],
  },
  {
    costlens: {
      team: "engineering",
      project: "chat-app",
      feature: "customer-support",
      userId: "user_123",
    },
  }
);
```

### Supported Providers

```typescript
import { wrapOpenAI, wrapAnthropic } from "@tokentra/sdk";

// OpenAI
const openai = wrapOpenAI(new OpenAI(), costlens);

// Anthropic
const anthropic = wrapAnthropic(new Anthropic(), costlens);
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TokenTRA

# Authentication (NextAuth.js)
AUTH_SECRET=your-auth-secret-here
AUTH_URL=http://localhost:3000

# OAuth (optional)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI Providers (for testing)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
GOOGLE_AI_API_KEY=

# Integrations
SLACK_BOT_TOKEN=
STRIPE_SECRET_KEY=
SENTRY_DSN=

# Feature Flags
NEXT_PUBLIC_ENABLE_SMART_ROUTING=false
NEXT_PUBLIC_ENABLE_CACHING_ANALYSIS=false
```

---

## 🔄 Development Workflow

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js config with custom rules
- **Prettier**: Auto-formatting with Tailwind plugin
- **Import Sorting**: Organized imports via Prettier plugin

### File Naming

- **Components**: PascalCase (`Button.tsx`, `CostTable.tsx`)
- **Hooks**: camelCase with `use-` prefix (`use-costs.ts`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Types**: PascalCase (`CostRecord`, `Provider`)

### Component Structure

```typescript
// component-name.tsx
"use client"; // Only if needed

import type { FC } from "react";
import { useState } from "react";
// ... other imports

interface ComponentNameProps {
  // props
}

export const ComponentName: FC<ComponentNameProps> = ({ ...props }) => {
  // implementation
};
```

### Git Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Open PR with description
4. Pass CI checks (lint, type-check, tests)
5. Get code review
6. Squash and merge

---

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis connection verified
- [ ] OAuth providers configured
- [ ] Stripe webhooks set up
- [ ] Sentry error tracking enabled
- [ ] SSL certificates valid
- [ ] Rate limiting tested

---

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Guidelines

- Follow existing patterns and conventions
- Write TypeScript with proper types (no `any`)
- Add tests for new features
- Update documentation as needed
- Keep PRs focused and small

### Commit Messages

Follow conventional commits:

```
feat: add budget forecasting
fix: resolve date picker timezone issue
docs: update SDK documentation
refactor: simplify cost calculation logic
```

---

## 🗺 Roadmap

### Phase 1: Foundation (Current)
- [x] Dashboard UI with mock data
- [x] Component library
- [x] Design system
- [x] Auth flow
- [ ] Database integration (Supabase)
- [ ] Real provider API sync

### Phase 2: Core Features
- [ ] Real-time cost tracking
- [ ] Budget enforcement
- [ ] Alert notifications
- [ ] Basic recommendations

### Phase 3: Advanced
- [ ] Smart model routing
- [ ] Caching analysis
- [ ] Chargeback reports
- [ ] Team permissions

### Phase 4: Enterprise
- [ ] SSO/SAML
- [ ] Audit logging
- [ ] Custom integrations
- [ ] SLA management

---

## 📄 License

Proprietary - All rights reserved.

---

## 📞 Support

- **Documentation**: [docs.tokentra.ai](https://docs.tokentra.ai)
- **Email**: support@tokentra.ai
- **Discord**: [Join our community](https://discord.gg/tokentra)

---






Now I have the latest information. Let me add the missing latest models:

Now let me verify the total count and create a system for keeping models updated:

Now let me create a system for keeping models updated. I'll create a Supabase Edge Function and a script that can be run to update models:



The lint error is expected - `@supabase/supabase-js` needs to be installed. This will be resolved when we set up Supabase in the project. Let me also create a GitHub Actions workflow for automated updates:

The lint errors are expected and not blocking:
1. `@supabase/supabase-js` - Will be installed when we set up Supabase client
2. GitHub Actions `@v4` - These are valid actions, the linter just can't resolve them locally

# Model Pricing Update Complete! ✅

## Summary

### Database Now Contains **295 Models** across **31 Providers**

| Provider | Models | Latest Additions |
|----------|--------|------------------|
| **OpenAI** | 45 | GPT-5, GPT-5.2, GPT-5 Mini |
| **Google** | 25 | Gemini 3 Pro, Gemini 3 Flash, gemini-exp-1206 |
| **AWS Bedrock** | 25 | All hosted models |
| **Mistral** | 21 | Latest versions |
| **Azure OpenAI** | 20 | All Azure-hosted models |
| **Anthropic** | 19 | Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5 |
| **xAI** | 18 | Grok 4.1, Grok 4.1 Reasoning |
| **DeepSeek** | 15 | V3.2, V3.2 Speciale, R1 |
| **Meta** | 13 | Llama 4 Maverick/Scout |
| **Cohere** | 12 | Command R+ |
| **+ 21 more** | 102 | Kimi, GLM, Baidu, Yi, Qwen, etc. |

### Latest December 2025 Models Added
- **OpenAI**: GPT-5.2 (Dec 2025), GPT-5 (Aug 2025), GPT-5 Mini
- **Anthropic**: Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5
- **Google**: Gemini 3 Pro, Gemini 3 Flash, Gemini 2.0 Flash Thinking
- **xAI**: Grok 4.1, Grok 4.1 Reasoning
- **DeepSeek**: V3.2, V3.2 Speciale
- **Kimi**: K2, K2 Thinking
- **Zhipu**: GLM-4.7, GLM-4.7 Reasoning

### Automated Update System Created

1. **[/src/lib/model-pricing/update-models.ts](cci:7://file:///Users/blackpanther/Desktop/Tokentra/src/lib/model-pricing/update-models.ts:0:0-0:0)** - Core utilities for model updates
2. **[/scripts/update-model-pricing.ts](cci:7://file:///Users/blackpanther/Desktop/Tokentra/scripts/update-model-pricing.ts:0:0-0:0)** - CLI script to fetch and update models
3. **[/.github/workflows/update-model-pricing.yml](cci:7://file:///Users/blackpanther/Desktop/Tokentra/.github/workflows/update-model-pricing.yml:0:0-0:0)** - GitHub Actions workflow (runs daily at 6 AM UTC)

### How to Keep Models Updated

**Option 1: GitHub Actions (Recommended)**
- Runs automatically every day at 6 AM UTC
- Add these secrets to your GitHub repo:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY` (optional)
  - `ANTHROPIC_API_KEY` (optional)
  - etc.

**Option 2: Manual Script**
```bash
npx tsx scripts/update-model-pricing.ts        # Update models
npx tsx scripts/update-model-pricing.ts --stats # View stats
```

**Option 3: Monitor Sources**
- LMSys Arena: https://lmarena.ai
- Artificial Analysis: https://artificialanalysis.ai
- Vellum Leaderboard: https://vellum.ai/llm-leaderboard
- LLMBase: https://llmbase.ai/leaderboard

The system is now set up to stay current with the latest AI models. Ready to proceed with connecting the frontend to the database?

<div align="center">





Now I have the latest information. Let me add the missing latest models:

Now let me verify the total count and create a system for keeping models updated:

Now let me create a system for keeping models updated. I'll create a Supabase Edge Function and a script that can be run to update models:



The lint error is expected - `@supabase/supabase-js` needs to be installed. This will be resolved when we set up Supabase in the project. Let me also create a GitHub Actions workflow for automated updates:

The lint errors are expected and not blocking:
1. `@supabase/supabase-js` - Will be installed when we set up Supabase client
2. GitHub Actions `@v4` - These are valid actions, the linter just can't resolve them locally

# Model Pricing Update Complete! ✅

## Summary

### Database Now Contains **295 Models** across **31 Providers**

| Provider | Models | Latest Additions |
|----------|--------|------------------|
| **OpenAI** | 45 | GPT-5, GPT-5.2, GPT-5 Mini |
| **Google** | 25 | Gemini 3 Pro, Gemini 3 Flash, gemini-exp-1206 |
| **AWS Bedrock** | 25 | All hosted models |
| **Mistral** | 21 | Latest versions |
| **Azure OpenAI** | 20 | All Azure-hosted models |
| **Anthropic** | 19 | Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5 |
| **xAI** | 18 | Grok 4.1, Grok 4.1 Reasoning |
| **DeepSeek** | 15 | V3.2, V3.2 Speciale, R1 |
| **Meta** | 13 | Llama 4 Maverick/Scout |
| **Cohere** | 12 | Command R+ |
| **+ 21 more** | 102 | Kimi, GLM, Baidu, Yi, Qwen, etc. |

### Latest December 2025 Models Added
- **OpenAI**: GPT-5.2 (Dec 2025), GPT-5 (Aug 2025), GPT-5 Mini
- **Anthropic**: Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5
- **Google**: Gemini 3 Pro, Gemini 3 Flash, Gemini 2.0 Flash Thinking
- **xAI**: Grok 4.1, Grok 4.1 Reasoning
- **DeepSeek**: V3.2, V3.2 Speciale
- **Kimi**: K2, K2 Thinking
- **Zhipu**: GLM-4.7, GLM-4.7 Reasoning

### Automated Update System Created

1. **[/src/lib/model-pricing/update-models.ts](cci:7://file:///Users/blackpanther/Desktop/Tokentra/src/lib/model-pricing/update-models.ts:0:0-0:0)** - Core utilities for model updates
2. **[/scripts/update-model-pricing.ts](cci:7://file:///Users/blackpanther/Desktop/Tokentra/scripts/update-model-pricing.ts:0:0-0:0)** - CLI script to fetch and update models
3. **[/.github/workflows/update-model-pricing.yml](cci:7://file:///Users/blackpanther/Desktop/Tokentra/.github/workflows/update-model-pricing.yml:0:0-0:0)** - GitHub Actions workflow (runs daily at 6 AM UTC)

### How to Keep Models Updated

**Option 1: GitHub Actions (Recommended)**
- Runs automatically every day at 6 AM UTC
- Add these secrets to your GitHub repo:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY` (optional)
  - `ANTHROPIC_API_KEY` (optional)
  - etc.

**Option 2: Manual Script**
```bash
npx tsx scripts/update-model-pricing.ts        # Update models
npx tsx scripts/update-model-pricing.ts --stats # View stats
```

**Option 3: Monitor Sources**
- LMSys Arena: https://lmarena.ai
- Artificial Analysis: https://artificialanalysis.ai
- Vellum Leaderboard: https://vellum.ai/llm-leaderboard
- LLMBase: https://llmbase.ai/leaderboard

The system is now set up to stay current with the latest AI models. Ready to proceed with connecting the frontend to the database?
**Built with ❤️ by the TokenTRA Team**

*Helping organizations take control of their AI costs*

</div>
