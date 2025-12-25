# CostLens AI - Enterprise Architecture Document

## Product Overview

**CostLens AI** is a unified AI cost intelligence platform - "Datadog for AI costs" - providing complete visibility and control over AI spending across all major providers (OpenAI, Anthropic, Google, Azure, AWS).

### Core Value Propositions
1. **Unified Dashboard** - Single pane of glass for all AI spending
2. **Cost Attribution** - Know exactly who's spending what (team/project/feature)
3. **Optimization Engine** - AI-powered recommendations to reduce spend
4. **Budget Controls** - Prevent bill shock with alerts and hard limits
5. **Smart Model Routing** - Automatically route to cost-efficient models

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: shadcn/ui + Radix UI primitives
- **Charts**: Recharts + D3.js for advanced visualizations
- **State Management**: Zustand + TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table (for data-heavy views)
- **Real-time**: Socket.io client / Server-Sent Events

### Backend (API Routes)
- **Runtime**: Next.js API Routes (Edge + Node.js)
- **Validation**: Zod schemas
- **Auth**: NextAuth.js v5 / Clerk
- **Rate Limiting**: Upstash Redis
- **Background Jobs**: Inngest / Trigger.dev
- **Caching**: Redis (Upstash)

### Infrastructure (Future)
- **Database**: PostgreSQL (Supabase/Neon) + TimescaleDB
- **Queue**: Redis Queue / BullMQ
- **Object Storage**: AWS S3 / Cloudflare R2
- **Monitoring**: Sentry, LogRocket

---

## Project Architecture

```
costlens-ai/
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   └── images/
│       └── providers/
│           ├── openai.svg
│           ├── anthropic.svg
│           ├── azure.svg
│           ├── google.svg
│           └── aws.svg
│
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page (marketing)
│   │   ├── loading.tsx               # Global loading state
│   │   ├── error.tsx                 # Global error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   ├── globals.css               # Global styles
│   │   │
│   │   ├── (marketing)/              # Marketing pages group
│   │   │   ├── layout.tsx
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── features/
│   │   │   │   └── page.tsx
│   │   │   ├── docs/
│   │   │   │   └── page.tsx
│   │   │   └── blog/
│   │   │       ├── page.tsx
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (auth)/                   # Auth pages group
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── verify-email/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/              # Protected dashboard group
│   │   │   ├── layout.tsx            # Dashboard shell with sidebar
│   │   │   │
│   │   │   ├── overview/             # Main dashboard
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   │
│   │   │   ├── costs/                # Cost analysis module
│   │   │   │   ├── page.tsx          # Cost overview
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── by-provider/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── by-model/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── by-team/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── by-project/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── by-feature/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── usage/                # Usage analytics
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tokens/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── requests/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── trends/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── providers/            # Provider connections
│   │   │   │   ├── page.tsx          # All providers list
│   │   │   │   ├── connect/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [providerId]/
│   │   │   │       ├── page.tsx      # Provider detail
│   │   │   │       └── settings/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── optimization/         # Optimization engine
│   │   │   │   ├── page.tsx          # Recommendations list
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── recommendations/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── model-routing/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── caching/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── savings/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── budgets/              # Budget management
│   │   │   │   ├── page.tsx          # All budgets
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [budgetId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── alerts/               # Alerting system
│   │   │   │   ├── page.tsx          # Alert rules
│   │   │   │   ├── history/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── create/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── reports/              # Reporting & exports
│   │   │   │   ├── page.tsx
│   │   │   │   ├── chargeback/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── scheduled/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── export/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── teams/                # Team management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [teamId]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── members/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── settings/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── projects/             # Project management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── settings/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── cost-centers/         # Cost center management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [costCenterId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── api-keys/             # API key management
│   │   │   │   ├── page.tsx
│   │   │   │   └── [keyId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── settings/             # Organization settings
│   │   │       ├── page.tsx          # General settings
│   │   │       ├── organization/
│   │   │       │   └── page.tsx
│   │   │       ├── billing/
│   │   │       │   └── page.tsx
│   │   │       ├── integrations/
│   │   │       │   └── page.tsx
│   │   │       ├── notifications/
│   │   │       │   └── page.tsx
│   │   │       ├── security/
│   │   │       │   └── page.tsx
│   │   │       └── api/
│   │   │           └── page.tsx
│   │   │
│   │   └── api/                      # API Routes
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       │
│   │       ├── v1/                   # Versioned API
│   │       │   ├── health/
│   │       │   │   └── route.ts
│   │       │   │
│   │       │   ├── organizations/
│   │       │   │   ├── route.ts
│   │       │   │   └── [orgId]/
│   │       │   │       ├── route.ts
│   │       │   │       └── members/
│   │       │   │           └── route.ts
│   │       │   │
│   │       │   ├── providers/
│   │       │   │   ├── route.ts
│   │       │   │   ├── [providerId]/
│   │       │   │   │   ├── route.ts
│   │       │   │   │   ├── connect/
│   │       │   │   │   │   └── route.ts
│   │       │   │   │   ├── disconnect/
│   │       │   │   │   │   └── route.ts
│   │       │   │   │   ├── sync/
│   │       │   │   │   │   └── route.ts
│   │       │   │   │   └── usage/
│   │       │   │   │       └── route.ts
│   │       │   │   └── oauth/
│   │       │   │       └── callback/
│   │       │   │           └── route.ts
│   │       │   │
│   │       │   ├── costs/
│   │       │   │   ├── route.ts           # GET costs with filters
│   │       │   │   ├── aggregate/
│   │       │   │   │   └── route.ts       # Aggregated cost data
│   │       │   │   ├── breakdown/
│   │       │   │   │   └── route.ts       # Cost breakdowns
│   │       │   │   ├── trends/
│   │       │   │   │   └── route.ts       # Historical trends
│   │       │   │   └── forecast/
│   │       │   │       └── route.ts       # Cost forecasting
│   │       │   │
│   │       │   ├── usage/
│   │       │   │   ├── route.ts
│   │       │   │   ├── tokens/
│   │       │   │   │   └── route.ts
│   │       │   │   ├── requests/
│   │       │   │   │   └── route.ts
│   │       │   │   └── models/
│   │       │   │       └── route.ts
│   │       │   │
│   │       │   ├── optimization/
│   │       │   │   ├── route.ts           # Get recommendations
│   │       │   │   ├── recommendations/
│   │       │   │   │   ├── route.ts
│   │       │   │   │   └── [id]/
│   │       │   │   │       ├── route.ts
│   │       │   │   │       ├── apply/
│   │       │   │   │       │   └── route.ts
│   │       │   │   │       └── dismiss/
│   │       │   │   │           └── route.ts
│   │       │   │   ├── analyze/
│   │       │   │   │   └── route.ts       # Trigger analysis
│   │       │   │   └── savings/
│   │       │   │       └── route.ts       # Savings calculator
│   │       │   │
│   │       │   ├── budgets/
│   │       │   │   ├── route.ts
│   │       │   │   └── [budgetId]/
│   │       │   │       ├── route.ts
│   │       │   │       └── status/
│   │       │   │           └── route.ts
│   │       │   │
│   │       │   ├── alerts/
│   │       │   │   ├── route.ts
│   │       │   │   ├── [alertId]/
│   │       │   │   │   ├── route.ts
│   │       │   │   │   ├── enable/
│   │       │   │   │   │   └── route.ts
│   │       │   │   │   └── disable/
│   │       │   │   │       └── route.ts
│   │       │   │   └── history/
│   │       │   │       └── route.ts
│   │       │   │
│   │       │   ├── teams/
│   │       │   │   ├── route.ts
│   │       │   │   └── [teamId]/
│   │       │   │       ├── route.ts
│   │       │   │       ├── members/
│   │       │   │       │   └── route.ts
│   │       │   │       └── costs/
│   │       │   │           └── route.ts
│   │       │   │
│   │       │   ├── projects/
│   │       │   │   ├── route.ts
│   │       │   │   └── [projectId]/
│   │       │   │       ├── route.ts
│   │       │   │       └── costs/
│   │       │   │           └── route.ts
│   │       │   │
│   │       │   ├── cost-centers/
│   │       │   │   ├── route.ts
│   │       │   │   └── [costCenterId]/
│   │       │   │       ├── route.ts
│   │       │   │       └── allocations/
│   │       │   │           └── route.ts
│   │       │   │
│   │       │   ├── reports/
│   │       │   │   ├── route.ts
│   │       │   │   ├── generate/
│   │       │   │   │   └── route.ts
│   │       │   │   ├── export/
│   │       │   │   │   └── route.ts
│   │       │   │   └── scheduled/
│   │       │   │       └── route.ts
│   │       │   │
│   │       │   ├── api-keys/
│   │       │   │   ├── route.ts
│   │       │   │   └── [keyId]/
│   │       │   │       ├── route.ts
│   │       │   │       └── rotate/
│   │       │   │           └── route.ts
│   │       │   │
│   │       │   └── webhooks/
│   │       │       ├── route.ts
│   │       │       ├── stripe/
│   │       │       │   └── route.ts
│   │       │       ├── slack/
│   │       │       │   └── route.ts
│   │       │       └── pagerduty/
│   │       │           └── route.ts
│   │       │
│   │       └── sdk/                  # SDK ingestion endpoints
│   │           ├── v1/
│   │           │   ├── track/
│   │           │   │   └── route.ts  # Track usage events
│   │           │   └── batch/
│   │           │       └── route.ts  # Batch event ingestion
│   │           └── health/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                       
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── command.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── date-range-picker.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-nav.tsx
│   │   │   ├── sidebar-item.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   ├── page-header.tsx
│   │   │   ├── user-menu.tsx
│   │   │   ├── org-switcher.tsx
│   │   │   ├── search-command.tsx
│   │   │   ├── notifications-dropdown.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── overview/
│   │   │   │   ├── stats-cards.tsx
│   │   │   │   ├── spend-chart.tsx
│   │   │   │   ├── provider-breakdown.tsx
│   │   │   │   ├── top-consumers.tsx
│   │   │   │   ├── recent-alerts.tsx
│   │   │   │   ├── savings-summary.tsx
│   │   │   │   └── quick-actions.tsx
│   │   │   │
│   │   │   ├── costs/
│   │   │   │   ├── cost-table.tsx
│   │   │   │   ├── cost-chart.tsx
│   │   │   │   ├── cost-breakdown-card.tsx
│   │   │   │   ├── cost-comparison.tsx
│   │   │   │   ├── cost-filters.tsx
│   │   │   │   ├── cost-trend.tsx
│   │   │   │   └── cost-heatmap.tsx
│   │   │   │
│   │   │   ├── usage/
│   │   │   │   ├── usage-chart.tsx
│   │   │   │   ├── token-usage.tsx
│   │   │   │   ├── request-volume.tsx
│   │   │   │   ├── model-distribution.tsx
│   │   │   │   └── usage-table.tsx
│   │   │   │
│   │   │   ├── providers/
│   │   │   │   ├── provider-card.tsx
│   │   │   │   ├── provider-list.tsx
│   │   │   │   ├── provider-status.tsx
│   │   │   │   ├── connect-provider-dialog.tsx
│   │   │   │   ├── openai-connect.tsx
│   │   │   │   ├── anthropic-connect.tsx
│   │   │   │   ├── azure-connect.tsx
│   │   │   │   ├── google-connect.tsx
│   │   │   │   └── aws-connect.tsx
│   │   │   │
│   │   │   ├── optimization/
│   │   │   │   ├── recommendation-card.tsx
│   │   │   │   ├── recommendation-list.tsx
│   │   │   │   ├── savings-chart.tsx
│   │   │   │   ├── model-routing-config.tsx
│   │   │   │   ├── caching-stats.tsx
│   │   │   │   ├── prompt-analysis.tsx
│   │   │   │   └── optimization-score.tsx
│   │   │   │
│   │   │   ├── budgets/
│   │   │   │   ├── budget-card.tsx
│   │   │   │   ├── budget-list.tsx
│   │   │   │   ├── budget-progress.tsx
│   │   │   │   ├── budget-form.tsx
│   │   │   │   └── budget-forecast.tsx
│   │   │   │
│   │   │   ├── alerts/
│   │   │   │   ├── alert-card.tsx
│   │   │   │   ├── alert-list.tsx
│   │   │   │   ├── alert-form.tsx
│   │   │   │   ├── alert-history.tsx
│   │   │   │   └── alert-channels.tsx
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── report-builder.tsx
│   │   │   │   ├── report-preview.tsx
│   │   │   │   ├── chargeback-table.tsx
│   │   │   │   ├── export-dialog.tsx
│   │   │   │   └── scheduled-reports.tsx
│   │   │   │
│   │   │   ├── teams/
│   │   │   │   ├── team-card.tsx
│   │   │   │   ├── team-list.tsx
│   │   │   │   ├── team-form.tsx
│   │   │   │   ├── team-members.tsx
│   │   │   │   └── team-spend.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── general-settings.tsx
│   │   │       ├── billing-settings.tsx
│   │   │       ├── notification-settings.tsx
│   │   │       ├── integration-list.tsx
│   │   │       ├── api-key-list.tsx
│   │   │       └── security-settings.tsx
│   │   │
│   │   ├── charts/                   # Reusable chart components
│   │   │   ├── area-chart.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   ├── line-chart.tsx
│   │   │   ├── pie-chart.tsx
│   │   │   ├── donut-chart.tsx
│   │   │   ├── stacked-bar-chart.tsx
│   │   │   ├── sparkline.tsx
│   │   │   ├── heatmap.tsx
│   │   │   ├── treemap.tsx
│   │   │   └── chart-tooltip.tsx
│   │   │
│   │   ├── forms/                    # Form components
│   │   │   ├── form-field.tsx
│   │   │   ├── form-section.tsx
│   │   │   ├── multi-select.tsx
│   │   │   ├── tag-input.tsx
│   │   │   ├── currency-input.tsx
│   │   │   └── threshold-input.tsx
│   │   │
│   │   ├── data-display/             # Data display components
│   │   │   ├── data-table.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── metric-card.tsx
│   │   │   ├── trend-indicator.tsx
│   │   │   ├── percentage-change.tsx
│   │   │   ├── currency-display.tsx
│   │   │   ├── token-count.tsx
│   │   │   ├── empty-state.tsx
│   │   │   └── loading-state.tsx
│   │   │
│   │   ├── feedback/                 # Feedback components
│   │   │   ├── toast-provider.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── skeleton-loader.tsx
│   │   │   └── confirmation-dialog.tsx
│   │   │
│   │   └── marketing/                # Marketing site components
│   │       ├── hero.tsx
│   │       ├── features-grid.tsx
│   │       ├── pricing-table.tsx
│   │       ├── testimonials.tsx
│   │       ├── cta-section.tsx
│   │       └── footer.tsx
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── utils.ts                  # General utilities (cn, etc.)
│   │   ├── constants.ts              # App constants
│   │   ├── config.ts                 # Configuration
│   │   │
│   │   ├── api/                      # API utilities
│   │   │   ├── client.ts             # API client wrapper
│   │   │   ├── error-handler.ts      # API error handling
│   │   │   ├── rate-limiter.ts       # Rate limiting logic
│   │   │   └── response.ts           # Standardized responses
│   │   │
│   │   ├── auth/                     # Authentication utilities
│   │   │   ├── config.ts             # Auth configuration
│   │   │   ├── session.ts            # Session helpers
│   │   │   └── permissions.ts        # Permission helpers
│   │   │
│   │   ├── providers/                # AI Provider integrations
│   │   │   ├── types.ts              # Provider types
│   │   │   ├── base.ts               # Base provider class
│   │   │   ├── openai.ts             # OpenAI integration
│   │   │   ├── anthropic.ts          # Anthropic integration
│   │   │   ├── azure.ts              # Azure OpenAI integration
│   │   │   ├── google.ts             # Google Vertex integration
│   │   │   ├── aws.ts                # AWS Bedrock integration
│   │   │   └── index.ts              # Provider factory
│   │   │
│   │   ├── calculations/             # Cost calculations
│   │   │   ├── pricing.ts            # Pricing calculations
│   │   │   ├── tokens.ts             # Token calculations
│   │   │   ├── aggregations.ts       # Data aggregations
│   │   │   ├── forecasting.ts        # Cost forecasting
│   │   │   └── savings.ts            # Savings calculations
│   │   │
│   │   ├── optimization/             # Optimization logic
│   │   │   ├── analyzer.ts           # Cost analyzer
│   │   │   ├── recommendations.ts    # Recommendation engine
│   │   │   ├── model-selector.ts     # Model selection logic
│   │   │   └── caching.ts            # Caching analysis
│   │   │
│   │   ├── formatters/               # Formatting utilities
│   │   │   ├── currency.ts           # Currency formatting
│   │   │   ├── numbers.ts            # Number formatting
│   │   │   ├── dates.ts              # Date formatting
│   │   │   └── tokens.ts             # Token formatting
│   │   │
│   │   └── validators/               # Validation schemas
│   │       ├── auth.ts
│   │       ├── provider.ts
│   │       ├── budget.ts
│   │       ├── alert.ts
│   │       ├── team.ts
│   │       └── project.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-organization.ts
│   │   ├── use-providers.ts
│   │   ├── use-costs.ts
│   │   ├── use-usage.ts
│   │   ├── use-budgets.ts
│   │   ├── use-alerts.ts
│   │   ├── use-teams.ts
│   │   ├── use-projects.ts
│   │   ├── use-recommendations.ts
│   │   ├── use-reports.ts
│   │   ├── use-date-range.ts
│   │   ├── use-filters.ts
│   │   ├── use-realtime.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-debounce.ts
│   │   ├── use-media-query.ts
│   │   └── use-clipboard.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── organization-store.ts
│   │   ├── ui-store.ts
│   │   ├── filter-store.ts
│   │   ├── notification-store.ts
│   │   └── preferences-store.ts
│   │
│   ├── services/                     # Business logic services
│   │   ├── auth-service.ts
│   │   ├── provider-service.ts
│   │   ├── cost-service.ts
│   │   ├── usage-service.ts
│   │   ├── budget-service.ts
│   │   ├── alert-service.ts
│   │   ├── team-service.ts
│   │   ├── project-service.ts
│   │   ├── optimization-service.ts
│   │   ├── report-service.ts
│   │   └── notification-service.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── index.ts                  # Re-exports
│   │   ├── auth.ts
│   │   ├── organization.ts
│   │   ├── provider.ts
│   │   ├── cost.ts
│   │   ├── usage.ts
│   │   ├── budget.ts
│   │   ├── alert.ts
│   │   ├── team.ts
│   │   ├── project.ts
│   │   ├── recommendation.ts
│   │   ├── report.ts
│   │   ├── api.ts
│   │   └── ui.ts
│   │
│   ├── data/                         # Mock data (development)
│   │   ├── providers.ts
│   │   ├── costs.ts
│   │   ├── usage.ts
│   │   ├── budgets.ts
│   │   ├── alerts.ts
│   │   ├── teams.ts
│   │   ├── projects.ts
│   │   ├── recommendations.ts
│   │   └── users.ts
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── sdk/                              # CostLens SDK (separate package)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── wrapper.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── README.md
│
└── docs/                             # Documentation
    ├── api-reference.md
    ├── sdk-guide.md
    ├── provider-setup.md
    └── best-practices.md
```

---

## Sidebar Navigation Structure

```typescript
// src/lib/constants/navigation.ts

import {
  LayoutDashboard,
  DollarSign,
  BarChart3,
  Plug,
  Lightbulb,
  PiggyBank,
  Bell,
  FileText,
  Users,
  FolderKanban,
  Building2,
  Key,
  Settings,
  HelpCircle,
} from "lucide-react";

export const sidebarNavigation = [
  {
    title: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Cost Analysis",
    icon: DollarSign,
    items: [
      { title: "Overview", href: "/costs" },
      { title: "By Provider", href: "/costs/by-provider" },
      { title: "By Model", href: "/costs/by-model" },
      { title: "By Team", href: "/costs/by-team" },
      { title: "By Project", href: "/costs/by-project" },
      { title: "By Feature", href: "/costs/by-feature" },
    ],
  },
  {
    title: "Usage",
    icon: BarChart3,
    items: [
      { title: "Overview", href: "/usage" },
      { title: "Tokens", href: "/usage/tokens" },
      { title: "Requests", href: "/usage/requests" },
      { title: "Trends", href: "/usage/trends" },
    ],
  },
  {
    title: "Providers",
    href: "/providers",
    icon: Plug,
    badge: "5", // Connected providers count
  },
  {
    title: "Optimization",
    icon: Lightbulb,
    items: [
      { title: "Recommendations", href: "/optimization" },
      { title: "Model Routing", href: "/optimization/model-routing" },
      { title: "Caching", href: "/optimization/caching" },
      { title: "Savings", href: "/optimization/savings" },
    ],
  },
  {
    title: "Budgets",
    href: "/budgets",
    icon: PiggyBank,
  },
  {
    title: "Alerts",
    icon: Bell,
    items: [
      { title: "Rules", href: "/alerts" },
      { title: "History", href: "/alerts/history" },
    ],
  },
  {
    title: "Reports",
    icon: FileText,
    items: [
      { title: "Overview", href: "/reports" },
      { title: "Chargeback", href: "/reports/chargeback" },
      { title: "Scheduled", href: "/reports/scheduled" },
      { title: "Export", href: "/reports/export" },
    ],
  },
  
  // Divider
  { type: "divider" },
  
  // Organization Section
  {
    title: "Organization",
    type: "section",
    items: [
      {
        title: "Teams",
        href: "/teams",
        icon: Users,
      },
      {
        title: "Projects",
        href: "/projects",
        icon: FolderKanban,
      },
      {
        title: "Cost Centers",
        href: "/cost-centers",
        icon: Building2,
      },
      {
        title: "API Keys",
        href: "/api-keys",
        icon: Key,
      },
    ],
  },
  
  // Divider
  { type: "divider" },
  
  // Footer Section
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Docs",
    href: "/docs",
    icon: HelpCircle,
    external: true,
  },
];
```

---

## Core Type Definitions

```typescript
// src/types/index.ts

// ============= Organization =============
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "starter" | "pro" | "business" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  defaultCurrency: string;
  timezone: string;
  fiscalYearStart: number; // Month (1-12)
  alertEmailEnabled: boolean;
  weeklyDigestEnabled: boolean;
}

// ============= User =============
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: "owner" | "admin" | "member" | "viewer";
  organizationId: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// ============= Provider =============
export type ProviderType = "openai" | "anthropic" | "azure" | "google" | "aws";

export interface Provider {
  id: string;
  type: ProviderType;
  name: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSyncAt?: Date;
  credentials: ProviderCredentials;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderCredentials {
  type: "api_key" | "oauth" | "service_account" | "iam_role";
  // Encrypted credentials stored separately
}

export interface ProviderConfig {
  type: ProviderType;
  name: string;
  logo: string;
  color: string;
  authType: "api_key" | "oauth" | "service_account" | "iam_role";
  models: ModelConfig[];
}

export interface ModelConfig {
  id: string;
  name: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  contextWindow: number;
  capabilities: string[];
}

// ============= Cost =============
export interface CostRecord {
  id: string;
  organizationId: string;
  providerId: string;
  provider: ProviderType;
  model: string;
  timestamp: Date;
  tokensInput: number;
  tokensOutput: number;
  tokensCached?: number;
  cost: number;
  currency: string;
  
  // Attribution
  teamId?: string;
  projectId?: string;
  costCenterId?: string;
  featureTag?: string;
  userId?: string;
  
  // Metadata
  metadata?: Record<string, unknown>;
}

export interface CostSummary {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  byProvider: ProviderCostBreakdown[];
  byModel: ModelCostBreakdown[];
  byTeam?: TeamCostBreakdown[];
  byProject?: ProjectCostBreakdown[];
  trend: TrendData;
}

export interface ProviderCostBreakdown {
  provider: ProviderType;
  providerName: string;
  cost: number;
  tokens: number;
  requests: number;
  percentage: number;
}

export interface ModelCostBreakdown {
  model: string;
  provider: ProviderType;
  cost: number;
  tokens: number;
  requests: number;
  percentage: number;
}

export interface TrendData {
  direction: "up" | "down" | "stable";
  percentage: number;
  comparedTo: string;
}

// ============= Usage =============
export interface UsageRecord {
  id: string;
  organizationId: string;
  providerId: string;
  provider: ProviderType;
  model: string;
  timestamp: Date;
  tokensInput: number;
  tokensOutput: number;
  tokensCached?: number;
  latencyMs?: number;
  requestCount: number;
  
  // Attribution
  teamId?: string;
  projectId?: string;
  featureTag?: string;
}

export interface UsageSummary {
  totalTokens: number;
  totalRequests: number;
  avgLatencyMs: number;
  byModel: ModelUsageBreakdown[];
  hourlyDistribution: HourlyUsage[];
}

// ============= Budget =============
export interface Budget {
  id: string;
  organizationId: string;
  name: string;
  amount: number;
  currency: string;
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  
  // Scope
  scope: BudgetScope;
  
  // Thresholds
  alertThresholds: number[]; // e.g., [50, 80, 100]
  hardLimit: boolean; // Stop requests when exceeded
  
  // Status
  currentSpend: number;
  percentUsed: number;
  forecastedSpend: number;
  status: "ok" | "warning" | "critical" | "exceeded";
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetScope {
  type: "organization" | "team" | "project" | "cost_center" | "provider" | "model";
  id?: string; // Optional: specific team/project/etc. ID
}

// ============= Alert =============
export interface Alert {
  id: string;
  organizationId: string;
  name: string;
  type: AlertType;
  condition: AlertCondition;
  channels: AlertChannel[];
  enabled: boolean;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AlertType = 
  | "spend_threshold"
  | "spend_anomaly"
  | "budget_threshold"
  | "forecast_exceeded"
  | "provider_error"
  | "usage_spike";

export interface AlertCondition {
  metric: string;
  operator: "gt" | "gte" | "lt" | "lte" | "eq";
  value: number;
  timeWindow?: string; // e.g., "1h", "24h", "7d"
  scope?: BudgetScope;
}

export interface AlertChannel {
  type: "email" | "slack" | "pagerduty" | "webhook";
  config: Record<string, string>;
}

export interface AlertEvent {
  id: string;
  alertId: string;
  organizationId: string;
  triggeredAt: Date;
  condition: AlertCondition;
  actualValue: number;
  status: "sent" | "failed" | "acknowledged";
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// ============= Team =============
export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  members: TeamMember[];
  apiKeyPatterns: string[]; // For auto-attribution
  monthlyBudget?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: string;
  role: "lead" | "member";
  joinedAt: Date;
}

// ============= Project =============
export interface Project {
  id: string;
  organizationId: string;
  teamId?: string;
  name: string;
  description?: string;
  tags: string[];
  apiKeyPatterns: string[];
  monthlyBudget?: number;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

// ============= Cost Center =============
export interface CostCenter {
  id: string;
  organizationId: string;
  name: string;
  code: string; // e.g., "DEPT-001"
  description?: string;
  allocationRules: AllocationRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AllocationRule {
  type: "team" | "project" | "api_key_pattern" | "model" | "provider";
  value: string;
  percentage: number;
}

// ============= Recommendation =============
export interface Recommendation {
  id: string;
  organizationId: string;
  type: RecommendationType;
  title: string;
  description: string;
  impact: RecommendationImpact;
  status: "pending" | "applied" | "dismissed" | "expired";
  details: RecommendationDetails;
  createdAt: Date;
  expiresAt: Date;
}

export type RecommendationType = 
  | "model_downgrade"
  | "prompt_optimization"
  | "caching_opportunity"
  | "provider_switch"
  | "token_reduction"
  | "batching_opportunity";

export interface RecommendationImpact {
  estimatedMonthlySavings: number;
  savingsPercentage: number;
  confidence: "high" | "medium" | "low";
  affectedRequests: number;
}

export interface RecommendationDetails {
  currentState: Record<string, unknown>;
  suggestedState: Record<string, unknown>;
  affectedModels?: string[];
  affectedFeatures?: string[];
  implementationSteps?: string[];
}

// ============= API Response Types =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: Required<Pick<ApiMeta, "page" | "limit" | "total" | "hasMore">>;
}

// ============= Filter Types =============
export interface DateRange {
  from: Date;
  to: Date;
  preset?: "today" | "yesterday" | "last7d" | "last30d" | "last90d" | "thisMonth" | "lastMonth" | "custom";
}

export interface CostFilters {
  dateRange: DateRange;
  providers?: ProviderType[];
  models?: string[];
  teams?: string[];
  projects?: string[];
  costCenters?: string[];
  features?: string[];
  granularity?: "hour" | "day" | "week" | "month";
}
```

---

## API Route Patterns

```typescript
// src/app/api/v1/costs/route.ts - Example API Route

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { CostService } from "@/services/cost-service";
import { apiResponse, apiError } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limiter";

// Request validation schema
const getCostsSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  providers: z.array(z.string()).optional(),
  models: z.array(z.string()).optional(),
  teams: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  granularity: z.enum(["hour", "day", "week", "month"]).default("day"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return apiError("RATE_LIMITED", "Too many requests", 429);
    }

    // 2. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    // 3. Parse and validate query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validation = getCostsSchema.safeParse(searchParams);
    
    if (!validation.success) {
      return apiError("VALIDATION_ERROR", "Invalid parameters", 400, {
        details: validation.error.flatten(),
      });
    }

    const filters = validation.data;

    // 4. Fetch data
    const costService = new CostService();
    const result = await costService.getCosts({
      organizationId: session.user.organizationId,
      ...filters,
    });

    // 5. Return response
    return apiResponse(result.data, {
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      hasMore: result.hasMore,
    });

  } catch (error) {
    console.error("Error fetching costs:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch costs", 500);
  }
}

// POST - Create cost record (from SDK)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const body = await request.json();
    // ... validation and processing

    return apiResponse({ id: "cost_xxx" }, undefined, 201);
  } catch (error) {
    console.error("Error creating cost record:", error);
    return apiError("INTERNAL_ERROR", "Failed to create cost record", 500);
  }
}
```

```typescript
// src/lib/api/response.ts - Standardized API responses

import { NextResponse } from "next/server";
import type { ApiResponse, ApiMeta, ApiError } from "@/types";

export function apiResponse<T>(
  data: T,
  meta?: ApiMeta,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}
```

---

## React Query Hooks Pattern

```typescript
// src/hooks/use-costs.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CostService } from "@/services/cost-service";
import type { CostFilters, CostSummary, CostRecord } from "@/types";

const costService = new CostService();

// Query keys factory
export const costKeys = {
  all: ["costs"] as const,
  lists: () => [...costKeys.all, "list"] as const,
  list: (filters: CostFilters) => [...costKeys.lists(), filters] as const,
  summaries: () => [...costKeys.all, "summary"] as const,
  summary: (filters: CostFilters) => [...costKeys.summaries(), filters] as const,
  details: () => [...costKeys.all, "detail"] as const,
  detail: (id: string) => [...costKeys.details(), id] as const,
};

// Get costs list
export function useCosts(filters: CostFilters) {
  return useQuery({
    queryKey: costKeys.list(filters),
    queryFn: () => costService.getCosts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Get cost summary
export function useCostSummary(filters: CostFilters) {
  return useQuery({
    queryKey: costKeys.summary(filters),
    queryFn: () => costService.getCostSummary(filters),
    staleTime: 1000 * 60 * 5,
  });
}

// Get cost breakdown by dimension
export function useCostBreakdown(
  filters: CostFilters,
  dimension: "provider" | "model" | "team" | "project"
) {
  return useQuery({
    queryKey: [...costKeys.list(filters), "breakdown", dimension],
    queryFn: () => costService.getCostBreakdown(filters, dimension),
    staleTime: 1000 * 60 * 5,
  });
}

// Get cost trends
export function useCostTrends(filters: CostFilters) {
  return useQuery({
    queryKey: [...costKeys.list(filters), "trends"],
    queryFn: () => costService.getCostTrends(filters),
    staleTime: 1000 * 60 * 5,
  });
}

// Get cost forecast
export function useCostForecast(filters: CostFilters) {
  return useQuery({
    queryKey: [...costKeys.list(filters), "forecast"],
    queryFn: () => costService.getCostForecast(filters),
    staleTime: 1000 * 60 * 15, // 15 minutes (more expensive calculation)
  });
}
```

---

## Zustand Store Pattern

```typescript
// src/stores/filter-store.ts

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { DateRange, ProviderType } from "@/types";
import { startOfMonth, endOfMonth, subDays } from "date-fns";

interface FilterState {
  // Date Range
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  
  // Provider Filters
  selectedProviders: ProviderType[];
  setSelectedProviders: (providers: ProviderType[]) => void;
  toggleProvider: (provider: ProviderType) => void;
  
  // Model Filters
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  
  // Team/Project Filters
  selectedTeams: string[];
  setSelectedTeams: (teams: string[]) => void;
  selectedProjects: string[];
  setSelectedProjects: (projects: string[]) => void;
  
  // Granularity
  granularity: "hour" | "day" | "week" | "month";
  setGranularity: (granularity: "hour" | "day" | "week" | "month") => void;
  
  // Compare Mode
  compareMode: boolean;
  compareDateRange: DateRange | null;
  setCompareMode: (enabled: boolean) => void;
  setCompareDateRange: (range: DateRange | null) => void;
  
  // Reset
  resetFilters: () => void;
}

const defaultDateRange: DateRange = {
  from: subDays(new Date(), 30),
  to: new Date(),
  preset: "last30d",
};

export const useFilterStore = create<FilterState>()(
  devtools(
    persist(
      (set) => ({
        // Date Range
        dateRange: defaultDateRange,
        setDateRange: (range) => set({ dateRange: range }),
        
        // Providers
        selectedProviders: [],
        setSelectedProviders: (providers) => set({ selectedProviders: providers }),
        toggleProvider: (provider) =>
          set((state) => ({
            selectedProviders: state.selectedProviders.includes(provider)
              ? state.selectedProviders.filter((p) => p !== provider)
              : [...state.selectedProviders, provider],
          })),
        
        // Models
        selectedModels: [],
        setSelectedModels: (models) => set({ selectedModels: models }),
        
        // Teams
        selectedTeams: [],
        setSelectedTeams: (teams) => set({ selectedTeams: teams }),
        
        // Projects
        selectedProjects: [],
        setSelectedProjects: (projects) => set({ selectedProjects: projects }),
        
        // Granularity
        granularity: "day",
        setGranularity: (granularity) => set({ granularity }),
        
        // Compare Mode
        compareMode: false,
        compareDateRange: null,
        setCompareMode: (enabled) => set({ compareMode: enabled }),
        setCompareDateRange: (range) => set({ compareDateRange: range }),
        
        // Reset
        resetFilters: () =>
          set({
            dateRange: defaultDateRange,
            selectedProviders: [],
            selectedModels: [],
            selectedTeams: [],
            selectedProjects: [],
            granularity: "day",
            compareMode: false,
            compareDateRange: null,
          }),
      }),
      {
        name: "costlens-filters",
        partialize: (state) => ({
          granularity: state.granularity,
          // Don't persist date range to avoid stale data
        }),
      }
    ),
    { name: "FilterStore" }
  )
);
```

---

## Provider Integration Architecture

```typescript
// src/lib/providers/base.ts

import type { ProviderType, CostRecord, UsageRecord } from "@/types";

export interface ProviderCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  serviceAccountKey?: string;
  iamRole?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  lastSyncedAt: Date;
}

export abstract class BaseProvider {
  abstract type: ProviderType;
  abstract name: string;
  
  protected credentials: ProviderCredentials;
  
  constructor(credentials: ProviderCredentials) {
    this.credentials = credentials;
  }
  
  // Test connection
  abstract testConnection(): Promise<boolean>;
  
  // Sync usage data
  abstract syncUsage(
    from: Date,
    to: Date
  ): Promise<UsageRecord[]>;
  
  // Sync cost data
  abstract syncCosts(
    from: Date,
    to: Date
  ): Promise<CostRecord[]>;
  
  // Get available models
  abstract getModels(): Promise<string[]>;
  
  // Get current rate limits
  abstract getRateLimits(): Promise<{
    requestsPerMinute: number;
    tokensPerMinute: number;
    currentUsage: number;
  }>;
}
```

```typescript
// src/lib/providers/openai.ts

import { BaseProvider, type SyncResult } from "./base";
import type { ProviderType, CostRecord, UsageRecord } from "@/types";

export class OpenAIProvider extends BaseProvider {
  type: ProviderType = "openai";
  name = "OpenAI";
  
  private baseUrl = "https://api.openai.com/v1";
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.credentials.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  async syncUsage(from: Date, to: Date): Promise<UsageRecord[]> {
    // OpenAI Organization Usage API
    const response = await fetch(
      `${this.baseUrl}/organization/usage?` +
      new URLSearchParams({
        start_time: Math.floor(from.getTime() / 1000).toString(),
        end_time: Math.floor(to.getTime() / 1000).toString(),
        bucket_width: "1d",
        group_by: ["model", "project_id"],
      }),
      {
        headers: {
          Authorization: `Bearer ${this.credentials.apiKey}`,
          "OpenAI-Organization": this.credentials.organizationId,
        },
      }
    );
    
    const data = await response.json();
    return this.transformUsageData(data);
  }
  
  async syncCosts(from: Date, to: Date): Promise<CostRecord[]> {
    // OpenAI Costs API
    const response = await fetch(
      `${this.baseUrl}/organization/costs?` +
      new URLSearchParams({
        start_time: Math.floor(from.getTime() / 1000).toString(),
        end_time: Math.floor(to.getTime() / 1000).toString(),
        bucket_width: "1d",
        group_by: ["model", "project_id"],
      }),
      {
        headers: {
          Authorization: `Bearer ${this.credentials.apiKey}`,
          "OpenAI-Organization": this.credentials.organizationId,
        },
      }
    );
    
    const data = await response.json();
    return this.transformCostData(data);
  }
  
  async getModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${this.credentials.apiKey}`,
      },
    });
    
    const data = await response.json();
    return data.data
      .filter((m: any) => m.id.includes("gpt") || m.id.includes("o1"))
      .map((m: any) => m.id);
  }
  
  async getRateLimits() {
    // Rate limit info from headers
    return {
      requestsPerMinute: 10000,
      tokensPerMinute: 2000000,
      currentUsage: 0, // Would need to track
    };
  }
  
  private transformUsageData(data: any): UsageRecord[] {
    // Transform OpenAI format to internal format
    return data.data.map((item: any) => ({
      id: `openai_${item.aggregation_timestamp}_${item.model}`,
      provider: "openai" as ProviderType,
      model: item.model,
      timestamp: new Date(item.aggregation_timestamp * 1000),
      tokensInput: item.input_tokens,
      tokensOutput: item.output_tokens,
      tokensCached: item.input_cached_tokens,
      requestCount: item.num_requests,
    }));
  }
  
  private transformCostData(data: any): CostRecord[] {
    return data.data.map((item: any) => ({
      id: `openai_cost_${item.aggregation_timestamp}_${item.model}`,
      provider: "openai" as ProviderType,
      model: item.model,
      timestamp: new Date(item.aggregation_timestamp * 1000),
      tokensInput: item.input_tokens,
      tokensOutput: item.output_tokens,
      cost: parseFloat(item.amount_value),
      currency: item.amount_currency || "USD",
    }));
  }
}
```

```typescript
// src/lib/providers/anthropic.ts

import { BaseProvider } from "./base";
import type { ProviderType, CostRecord, UsageRecord } from "@/types";

export class AnthropicProvider extends BaseProvider {
  type: ProviderType = "anthropic";
  name = "Anthropic";
  
  private baseUrl = "https://api.anthropic.com/v1";
  
  async testConnection(): Promise<boolean> {
    try {
      // Anthropic doesn't have a models endpoint, try a minimal request
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "x-api-key": this.credentials.apiKey!,
          "anthropic-version": "2024-01-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      return response.ok || response.status === 400; // 400 = rate limit or similar
    } catch {
      return false;
    }
  }
  
  async syncUsage(from: Date, to: Date): Promise<UsageRecord[]> {
    // Anthropic Admin API for usage
    const response = await fetch(
      `${this.baseUrl}/organizations/usage_report/messages?` +
      new URLSearchParams({
        start_date: from.toISOString().split("T")[0],
        end_date: to.toISOString().split("T")[0],
        granularity: "day",
        group_by: "model,workspace",
      }),
      {
        headers: {
          "x-api-key": this.credentials.apiKey!, // Admin key
          "anthropic-version": "2024-10-22",
        },
      }
    );
    
    const data = await response.json();
    return this.transformUsageData(data);
  }
  
  async syncCosts(from: Date, to: Date): Promise<CostRecord[]> {
    const response = await fetch(
      `${this.baseUrl}/organizations/cost_report?` +
      new URLSearchParams({
        start_date: from.toISOString().split("T")[0],
        end_date: to.toISOString().split("T")[0],
        granularity: "day",
        group_by: "model,workspace",
      }),
      {
        headers: {
          "x-api-key": this.credentials.apiKey!,
          "anthropic-version": "2024-10-22",
        },
      }
    );
    
    const data = await response.json();
    return this.transformCostData(data);
  }
  
  async getModels(): Promise<string[]> {
    return [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ];
  }
  
  async getRateLimits() {
    return {
      requestsPerMinute: 4000,
      tokensPerMinute: 400000,
      currentUsage: 0,
    };
  }
  
  private transformUsageData(data: any): UsageRecord[] {
    return data.data.map((item: any) => ({
      id: `anthropic_${item.date}_${item.model}`,
      provider: "anthropic" as ProviderType,
      model: item.model,
      timestamp: new Date(item.date),
      tokensInput: item.input_tokens,
      tokensOutput: item.output_tokens,
      tokensCached: item.cache_read_input_tokens,
      requestCount: item.request_count,
    }));
  }
  
  private transformCostData(data: any): CostRecord[] {
    return data.data.map((item: any) => ({
      id: `anthropic_cost_${item.date}_${item.model}`,
      provider: "anthropic" as ProviderType,
      model: item.model,
      timestamp: new Date(item.date),
      tokensInput: item.input_tokens,
      tokensOutput: item.output_tokens,
      cost: item.cost_usd,
      currency: "USD",
    }));
  }
}
```

```typescript
// src/lib/providers/index.ts

import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { AzureProvider } from "./azure";
import { GoogleProvider } from "./google";
import { AWSProvider } from "./aws";
import type { BaseProvider, ProviderCredentials } from "./base";
import type { ProviderType } from "@/types";

export function createProvider(
  type: ProviderType,
  credentials: ProviderCredentials
): BaseProvider {
  switch (type) {
    case "openai":
      return new OpenAIProvider(credentials);
    case "anthropic":
      return new AnthropicProvider(credentials);
    case "azure":
      return new AzureProvider(credentials);
    case "google":
      return new GoogleProvider(credentials);
    case "aws":
      return new AWSProvider(credentials);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

export { OpenAIProvider, AnthropicProvider, AzureProvider, GoogleProvider, AWSProvider };
export type { BaseProvider, ProviderCredentials };
```

---

## SDK Architecture

```typescript
// sdk/src/index.ts

import { CostLensClient } from "./client";
import { wrapOpenAI, wrapAnthropic } from "./wrapper";
import type { CostLensConfig, TrackingOptions } from "./types";

export { CostLensClient, wrapOpenAI, wrapAnthropic };
export type { CostLensConfig, TrackingOptions };

// Convenience function for quick setup
export function createCostLens(config: CostLensConfig): CostLensClient {
  return new CostLensClient(config);
}

export default createCostLens;
```

```typescript
// sdk/src/client.ts

import type { CostLensConfig, TrackingEvent, TrackingOptions } from "./types";

export class CostLensClient {
  private config: CostLensConfig;
  private queue: TrackingEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  constructor(config: CostLensConfig) {
    this.config = {
      endpoint: config.endpoint || "https://api.costlens.ai/sdk/v1",
      batchSize: config.batchSize || 100,
      flushIntervalMs: config.flushIntervalMs || 5000,
      ...config,
    };
    
    this.startFlushInterval();
  }
  
  // Track a single event
  async track(event: TrackingEvent, options?: TrackingOptions): Promise<void> {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      metadata: {
        ...event.metadata,
        ...options?.metadata,
        team: options?.team,
        project: options?.project,
        feature: options?.feature,
        userId: options?.userId,
      },
    };
    
    this.queue.push(enrichedEvent);
    
    if (this.queue.length >= this.config.batchSize!) {
      await this.flush();
    }
  }
  
  // Flush queued events
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    
    const events = [...this.queue];
    this.queue = [];
    
    try {
      await fetch(`${this.config.endpoint}/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CostLens-API-Key": this.config.apiKey,
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      // Put events back in queue on failure
      this.queue = [...events, ...this.queue];
      console.error("CostLens: Failed to send events", error);
    }
  }
  
  // Shutdown gracefully
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }
  
  private startFlushInterval(): void {
    this.flushInterval = setInterval(
      () => this.flush(),
      this.config.flushIntervalMs
    );
  }
}
```

```typescript
// sdk/src/wrapper.ts

import type { CostLensClient } from "./client";
import type { TrackingOptions } from "./types";

// Wrap OpenAI client
export function wrapOpenAI(
  openai: any,
  costlens: CostLensClient
): any {
  const originalCreate = openai.chat.completions.create.bind(
    openai.chat.completions
  );
  
  openai.chat.completions.create = async (
    params: any,
    options?: { costlens?: TrackingOptions }
  ) => {
    const startTime = Date.now();
    const response = await originalCreate(params);
    const duration = Date.now() - startTime;
    
    // Track the request
    costlens.track({
      provider: "openai",
      model: params.model,
      tokensInput: response.usage?.prompt_tokens || 0,
      tokensOutput: response.usage?.completion_tokens || 0,
      tokensCached: response.usage?.prompt_tokens_details?.cached_tokens || 0,
      latencyMs: duration,
      requestId: response.id,
    }, options?.costlens);
    
    return response;
  };
  
  return openai;
}

// Wrap Anthropic client
export function wrapAnthropic(
  anthropic: any,
  costlens: CostLensClient
): any {
  const originalCreate = anthropic.messages.create.bind(anthropic.messages);
  
  anthropic.messages.create = async (
    params: any,
    options?: { costlens?: TrackingOptions }
  ) => {
    const startTime = Date.now();
    const response = await originalCreate(params);
    const duration = Date.now() - startTime;
    
    costlens.track({
      provider: "anthropic",
      model: params.model,
      tokensInput: response.usage?.input_tokens || 0,
      tokensOutput: response.usage?.output_tokens || 0,
      tokensCached: response.usage?.cache_read_input_tokens || 0,
      latencyMs: duration,
      requestId: response.id,
    }, options?.costlens);
    
    return response;
  };
  
  return anthropic;
}
```

```typescript
// sdk/src/types.ts

export interface CostLensConfig {
  apiKey: string;
  endpoint?: string;
  batchSize?: number;
  flushIntervalMs?: number;
  debug?: boolean;
}

export interface TrackingEvent {
  provider: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  tokensCached?: number;
  latencyMs?: number;
  requestId?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface TrackingOptions {
  team?: string;
  project?: string;
  feature?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}
```

---

## Mock Data Structure

```typescript
// src/data/costs.ts

import type { CostRecord, CostSummary, ProviderType } from "@/types";
import { subDays, format } from "date-fns";

// Generate mock cost records
export function generateMockCosts(days: number = 30): CostRecord[] {
  const records: CostRecord[] = [];
  const providers: ProviderType[] = ["openai", "anthropic", "azure", "google"];
  const models = {
    openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1"],
    anthropic: ["claude-3-5-sonnet", "claude-3-5-haiku", "claude-3-opus"],
    azure: ["gpt-4", "gpt-35-turbo"],
    google: ["gemini-1.5-pro", "gemini-1.5-flash"],
  };
  const teams = ["product", "research", "platform", "sales"];
  const projects = ["chat-app", "search-api", "analytics", "docs-assistant"];
  
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i);
    
    providers.forEach((provider) => {
      models[provider].forEach((model) => {
        // Multiple records per day per model
        const recordCount = Math.floor(Math.random() * 5) + 1;
        
        for (let j = 0; j < recordCount; j++) {
          records.push({
            id: `cost_${provider}_${model}_${i}_${j}`,
            organizationId: "org_demo",
            providerId: `prov_${provider}`,
            provider,
            model,
            timestamp: new Date(date.setHours(Math.floor(Math.random() * 24))),
            tokensInput: Math.floor(Math.random() * 100000) + 1000,
            tokensOutput: Math.floor(Math.random() * 50000) + 500,
            tokensCached: Math.floor(Math.random() * 10000),
            cost: parseFloat((Math.random() * 100 + 1).toFixed(2)),
            currency: "USD",
            teamId: teams[Math.floor(Math.random() * teams.length)],
            projectId: projects[Math.floor(Math.random() * projects.length)],
          });
        }
      });
    });
  }
  
  return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate mock summary
export function generateMockSummary(): CostSummary {
  return {
    totalCost: 45678.90,
    totalTokens: 125000000,
    totalRequests: 450000,
    byProvider: [
      { provider: "openai", providerName: "OpenAI", cost: 25000, tokens: 70000000, requests: 250000, percentage: 54.7 },
      { provider: "anthropic", providerName: "Anthropic", cost: 12000, tokens: 35000000, requests: 120000, percentage: 26.3 },
      { provider: "azure", providerName: "Azure OpenAI", cost: 5500, tokens: 12000000, requests: 50000, percentage: 12.0 },
      { provider: "google", providerName: "Google Vertex", cost: 3178.90, tokens: 8000000, requests: 30000, percentage: 7.0 },
    ],
    byModel: [
      { model: "gpt-4o", provider: "openai", cost: 18000, tokens: 50000000, requests: 180000, percentage: 39.4 },
      { model: "claude-3-5-sonnet", provider: "anthropic", cost: 10000, tokens: 30000000, requests: 100000, percentage: 21.9 },
      { model: "gpt-4o-mini", provider: "openai", cost: 5000, tokens: 15000000, requests: 50000, percentage: 10.9 },
      { model: "gpt-4-turbo", provider: "openai", cost: 2000, tokens: 5000000, requests: 20000, percentage: 4.4 },
    ],
    trend: {
      direction: "up",
      percentage: 12.5,
      comparedTo: "last month",
    },
  };
}

// Generate time series data for charts
export function generateMockTimeSeries(
  days: number = 30,
  granularity: "hour" | "day" = "day"
): { date: string; cost: number; tokens: number; requests: number }[] {
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, granularity === "hour" ? "yyyy-MM-dd HH:00" : "yyyy-MM-dd"),
      cost: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
      tokens: Math.floor(Math.random() * 5000000 + 1000000),
      requests: Math.floor(Math.random() * 20000 + 5000),
    });
  }
  
  return data;
}
```

---

## Environment Configuration

```env
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CostLens AI

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (if using)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Database (when ready)
DATABASE_URL=postgresql://user:password@localhost:5432/costlens

# Redis
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Provider API Keys (for testing)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AZURE_OPENAI_KEY=
AZURE_OPENAI_ENDPOINT=
GOOGLE_APPLICATION_CREDENTIALS=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# Stripe (billing)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Slack Integration
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=

# PagerDuty Integration
PAGERDUTY_API_KEY=

# Sentry (error tracking)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

---

## Package Dependencies

```json
{
  "name": "costlens-ai",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    
    "next-auth": "^5.0.0-beta",
    "@auth/prisma-adapter": "^2.0.0",
    
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.10.0",
    "zustand": "^4.5.0",
    
    "zod": "^3.23.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-slot": "^1.0.2",
    
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    
    "recharts": "^2.12.0",
    "d3": "^7.8.5",
    
    "date-fns": "^3.3.0",
    "date-fns-tz": "^2.0.0",
    
    "lucide-react": "^0.350.0",
    
    "@upstash/redis": "^1.28.0",
    "@upstash/ratelimit": "^1.0.0",
    
    "sonner": "^1.4.0",
    "cmdk": "^0.2.1",
    "nuqs": "^1.17.0",
    
    "nanoid": "^5.0.0",
    "crypto-js": "^4.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.11.0",
    "@types/d3": "^7.4.3",
    
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    
    "prettier": "^3.2.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    
    "vitest": "^1.3.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@testing-library/react": "^14.2.0",
    "@playwright/test": "^1.42.0"
  }
}
```

---

## Key Design Patterns

### 1. Server Components First
- Use Server Components by default
- Client Components only for interactivity
- Streaming with Suspense for loading states

### 2. Optimistic UI Updates
- Use React Query's optimistic updates
- Immediate feedback for user actions
- Rollback on error

### 3. Real-time Data
- Server-Sent Events for cost updates
- WebSocket for alerts
- Polling fallback

### 4. Error Boundaries
- Granular error boundaries per section
- Graceful degradation
- Retry mechanisms

### 5. Caching Strategy
- React Query for API data (5-15 min stale time)
- Redis for server-side caching
- ISR for marketing pages

### 6. Security
- API key encryption at rest
- Rate limiting per organization
- Audit logging for sensitive actions
- RBAC for team permissions

---

## Performance Optimization

### 1. Code Splitting
- Route-based splitting (automatic)
- Component lazy loading
- Dynamic imports for heavy charts

### 2. Data Fetching
- Parallel data fetching
- Prefetching on hover
- Infinite scroll for large lists

### 3. Bundle Size
- Tree shaking enabled
- Analyze bundle with @next/bundle-analyzer
- External heavy dependencies (d3, recharts)

### 4. Images & Assets
- Next.js Image optimization
- SVG sprites for icons
- CDN for static assets

---

## Deployment Checklist

1. [ ] Environment variables configured
2. [ ] Database migrations run
3. [ ] Redis connection verified
4. [ ] OAuth providers configured
5. [ ] Stripe webhooks set up
6. [ ] Sentry error tracking enabled
7. [ ] Analytics configured
8. [ ] SSL certificates valid
9. [ ] Rate limiting tested
10. [ ] E2E tests passing

---

*This architecture is designed to scale from MVP to enterprise, supporting the 18-month roadmap outlined in the PRD with targets of $1M MRR and $100M/month AI spend under management.*
