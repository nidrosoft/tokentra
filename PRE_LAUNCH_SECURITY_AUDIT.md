# TokenTra Pre-Launch Security & Code Quality Audit Report

**Generated:** January 2, 2026  
**Codebase Size:** 87,411 lines of TypeScript/TSX  
**Status:** 🔴 NOT READY FOR PRODUCTION

---

## Executive Summary

This audit identified **critical security vulnerabilities** and **code quality issues** that must be addressed before going live. The most severe issues are:

1. **10 API routes use hardcoded DEMO_ORG_ID** - bypasses authentication
2. **25 database tables missing RLS policies** - data exposure risk
3. **11 mock data files** still in production code
4. **126 console.log statements** in API routes - information leakage

---

## 🔴 CRITICAL SECURITY ISSUES (Must Fix Before Launch)

### 1. Hardcoded Demo Organization ID in API Routes
**Severity:** CRITICAL  
**Impact:** Any unauthenticated user can access data using the demo org ID

**Affected Files (10):**
- `src/app/api/v1/alerts/route.ts`
- `src/app/api/v1/alerts/evaluate/route.ts`
- `src/app/api/v1/alerts/events/route.ts`
- `src/app/api/v1/dashboard/route.ts`
- `src/app/api/v1/notifications/route.ts`
- `src/app/api/v1/notifications/preferences/route.ts`
- `src/app/api/v1/notifications/unread-count/route.ts`
- `src/app/api/v1/settings/api-keys/route.ts`
- `src/app/api/v1/settings/integrations/route.ts`
- `src/app/api/v1/settings/organization/route.ts`
- `src/app/api/v1/settings/user/route.ts`

**Fix Required:** Remove `DEMO_ORG_ID` constant and require proper authentication via session.

---

### 2. Database Row Level Security (RLS) Issues
**Severity:** CRITICAL  
**Source:** Supabase Security Advisor

#### Tables with RLS DISABLED (7 tables - DATA EXPOSED):
| Table | Risk |
|-------|------|
| `report_templates` | Public read/write |
| `generated_reports` | Public read/write |
| `email_digest_preferences` | Public read/write |
| `chargeback_configurations` | Public read/write |
| `chargeback_records` | Public read/write |
| `organization_members` | Public read/write |
| `model_pricing` | Public read/write |

#### Tables with RLS ENABLED but NO POLICIES (3 tables):
| Table | Issue |
|-------|-------|
| `alert_actions` | RLS enabled, no policies = no access |
| `triggered_alerts` | RLS enabled, no policies = no access |
| `usage_baselines` | RLS enabled, no policies = no access |

#### Views with SECURITY DEFINER (4 views - bypasses RLS):
- `cost_center_hierarchy`
- `budget_summary`
- `project_summary`
- `team_summary`

**Fix Required:** Create proper RLS policies for all tables.

---

### 3. Functions with Mutable Search Path
**Severity:** HIGH  
**Impact:** Potential SQL injection via search path manipulation

**Affected Functions (8):**
- `get_unread_notification_count`
- `mark_notifications_read`
- `increment_rule_match_count`
- `update_updated_at_column`
- `update_provider_connection_timestamp`
- `get_connection_health_status`
- `get_provider_sync_summary`
- `get_current_budget_period`
- `update_budget_spend`

**Fix Required:** Set explicit `search_path` on all functions.

---

### 4. Missing Authentication on API Routes
**Severity:** HIGH  
**Impact:** Most API routes don't verify user session

**Current State:**
- Only 4 API routes use `getServerSession`
- Most routes accept `organization_id` from query params without verification
- Middleware allows `/dashboard` as public path (line 6 in middleware.ts)

**Fix Required:** 
1. Remove `/dashboard` from public paths
2. Add session verification to all protected API routes
3. Verify user belongs to requested organization

---

## 🟠 HIGH PRIORITY ISSUES

### 5. Mock Data Files in Production (11 files, 72KB)
**Severity:** HIGH  
**Impact:** Exposes test data structure, potential data leakage

**Files to Remove:**
```
src/data/mock-alerts.ts
src/data/mock-budgets.ts
src/data/mock-cost-centers.ts
src/data/mock-costs.ts
src/data/mock-projects.ts
src/data/mock-providers.ts
src/data/mock-recommendations.ts
src/data/mock-reports.ts
src/data/mock-teams.ts
src/data/mock-usage.ts
src/data/mock-users.ts
src/data/index.ts
```

**Currently Used By:**
- `src/components/dashboard/optimization/optimization-overview.tsx`

---

### 6. Console Logging in API Routes
**Severity:** MEDIUM  
**Impact:** Information leakage, performance impact

**Count:** 126 console.log/error/warn statements in API routes

**Fix Required:** Replace with proper logging service or remove.

---

### 7. TODO/FIXME Comments (103 instances)
**Severity:** MEDIUM  
**Impact:** Incomplete features, technical debt

**Top Files:**
- `src/lib/optimization/task-classifier.ts` (9)
- `src/services/alert-service.ts` (9)
- `src/services/team-service.ts` (9)
- `src/services/budget-service.ts` (7)

---

### 8. Rate Limiting Uses In-Memory Store
**Severity:** MEDIUM  
**Impact:** Rate limits reset on server restart, not shared across instances

**Location:** `src/lib/api/rate-limiter.ts`

**Current:** In-memory Map  
**Required:** Redis/Upstash for production (code is commented out)

---

## 🟡 MEDIUM PRIORITY ISSUES

### 9. Input Validation Coverage
**Severity:** MEDIUM

**Good:** SDK routes use Zod validation (62 matches)
**Bad:** Most other API routes lack input validation

**Routes with Zod:**
- `src/app/api/sdk/v1/track/route.ts` ✅
- `src/app/api/sdk/v1/batch/route.ts` ✅
- `src/app/api/v1/sdk/ingest/route.ts` ✅

**Routes without validation:**
- Most CRUD routes for alerts, budgets, teams, projects

---

### 10. TypeScript Test Files Missing Types
**Severity:** LOW  
**Impact:** Test files fail type-check

**Files:**
- `sdk/typescript/src/__tests__/optimization.test.ts`
- `src/lib/optimization/__tests__/enterprise-engine.test.ts`
- `src/lib/sdk/__tests__/sdk-integration.test.ts`

**Fix:** Install `@types/jest` or `vitest` types

---

## ✅ SECURITY POSITIVES

### What's Working Well:

1. **Credential Encryption** - AES-256-GCM encryption for provider credentials (`credential-vault.ts`)
2. **API Key Hashing** - SHA-256 hashing for API keys
3. **SDK Authentication** - Proper API key validation with caching
4. **No XSS Vulnerabilities** - No `dangerouslySetInnerHTML` usage found
5. **No Hardcoded Secrets** - All secrets use environment variables
6. **Onboarding Flow** - Complete 3-step onboarding (Company Profile → Provider Setup → Complete)
7. **Email via Edge Function** - Resend API key secured in Supabase

---

## 📋 RECOMMENDED FIX ORDER

### Phase 1: Critical Security (Before Any Users)
1. [ ] Remove all `DEMO_ORG_ID` references from API routes
2. [ ] Enable RLS on all 7 exposed tables
3. [ ] Create RLS policies for tables with RLS enabled but no policies
4. [ ] Remove `/dashboard` from public paths in middleware
5. [ ] Add session verification to all protected API routes

### Phase 2: High Priority (Before Public Launch)
6. [ ] Delete all mock data files (`src/data/mock-*.ts`)
7. [ ] Update `optimization-overview.tsx` to use real data
8. [ ] Remove or replace console.log statements with proper logging
9. [ ] Set `search_path` on all database functions
10. [ ] Switch rate limiter to Redis/Upstash

### Phase 3: Code Quality (Before Scale)
11. [ ] Add Zod validation to all API routes
12. [ ] Fix TypeScript test file types
13. [ ] Address TODO/FIXME comments
14. [ ] Remove SECURITY DEFINER from views or add proper checks

---

## Environment Variables Required for Production

```env
# Already configured
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Need to add to Vercel
PROVIDER_ENCRYPTION_KEY=     # For credential encryption
NEXTAUTH_SECRET=             # For session encryption
NEXTAUTH_URL=                # Production URL

# Optional but recommended
UPSTASH_REDIS_REST_URL=      # For rate limiting
UPSTASH_REDIS_REST_TOKEN=    # For rate limiting
```

---

## Summary Statistics

| Category | Count | Status |
|----------|-------|--------|
| Critical Security Issues | 4 | 🔴 |
| High Priority Issues | 4 | 🟠 |
| Medium Priority Issues | 2 | 🟡 |
| Tables Missing RLS | 7 | 🔴 |
| Tables with Empty RLS | 3 | 🟠 |
| Mock Data Files | 11 | 🟠 |
| Console.log in APIs | 126 | 🟡 |
| TODO Comments | 103 | 🟡 |
| API Routes with DEMO_ORG_ID | 10 | 🔴 |

---

**Recommendation:** Do NOT go live until Phase 1 critical security issues are resolved. The current state allows unauthenticated access to organization data through the demo org ID bypass.
