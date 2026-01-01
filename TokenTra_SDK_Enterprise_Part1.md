# TokenTra SDK Specification

## Complete Enterprise SDK for AI Cost Intelligence & Usage Tracking

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## Executive Summary

The TokenTra SDK is the foundational layer that enables real-time AI usage tracking, cost attribution, and intelligent optimization across all AI providers. It acts as a transparent wrapper around existing AI client libraries, capturing usage metrics without impacting performance or requiring customers to change their AI provider credentials.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [SDK Design Principles](#2-sdk-design-principles)
3. [Installation & Quick Start](#3-installation--quick-start)
4. [Authentication & API Keys](#4-authentication--api-keys)
5. [Provider Wrappers](#5-provider-wrappers)
6. [Usage Data Collection](#6-usage-data-collection)
7. [Attribution System](#7-attribution-system)
8. [Smart Routing Engine](#8-smart-routing-engine)
9. [Semantic Caching](#9-semantic-caching)
10. [Error Handling & Resilience](#10-error-handling--resilience)
11. [Privacy & Security](#11-privacy--security)
12. [Rate Limiting](#12-rate-limiting)
13. [Batch Processing](#13-batch-processing)
14. [Configuration Reference](#14-configuration-reference)
15. [Backend Ingestion API](#15-backend-ingestion-api)
16. [Database Schema](#16-database-schema)
17. [TypeScript Types](#17-typescript-types)
18. [Node.js SDK Implementation](#18-nodejs-sdk-implementation)
19. [Python SDK Implementation](#19-python-sdk-implementation)
20. [Integration with TokenTra Systems](#20-integration-with-tokentra-systems)
21. [Testing Guide](#21-testing-guide)
22. [Troubleshooting](#22-troubleshooting)

---

## 1. Architecture Overview

### 1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          TOKENTRA SDK ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   CUSTOMER'S APPLICATION                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                          │   │
│   │     const tokentra = new TokenTra({ apiKey: 'tt_live_xxx' });            │   │
│   │     const openai = tokentra.wrap(new OpenAI());                          │   │
│   │                                                                          │   │
│   │     await openai.chat.completions.create({...}, {                        │   │
│   │       tokentra: { feature: 'chat', team: 'product' }                     │   │
│   │     });                                                                  │   │
│   │                                                                          │   │
│   └──────────────────────────────┬──────────────────────────────────────────┘   │
│                                  │                                               │
│   ┌──────────────────────────────▼──────────────────────────────────────────┐   │
│   │                       TOKENTRA SDK LAYER                                 │   │
│   │                                                                          │   │
│   │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│   │   │                    SDK CORE ENGINE                               │   │   │
│   │   │                                                                  │   │   │
│   │   │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │   │
│   │   │  │   Auth    │  │  Request  │  │ Response  │  │ Telemetry │    │   │   │
│   │   │  │  Manager  │  │Interceptor│  │ Processor │  │ Collector │    │   │   │
│   │   │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │   │
│   │   │                                                                  │   │   │
│   │   │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │   │
│   │   │  │  Smart    │  │ Semantic  │  │   Batch   │  │   Error   │    │   │   │
│   │   │  │  Router   │  │   Cache   │  │  Manager  │  │  Handler  │    │   │   │
│   │   │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │   │
│   │   └─────────────────────────────────────────────────────────────────┘   │   │
│   │                                                                          │   │
│   │   ┌─────────────────────────────────────────────────────────────────┐   │   │
│   │   │                   PROVIDER WRAPPERS                              │   │   │
│   │   │                                                                  │   │   │
│   │   │  ┌────────┐ ┌──────────┐ ┌────────┐ ┌───────┐ ┌───────┐        │   │   │
│   │   │  │ OpenAI │ │Anthropic │ │ Google │ │ Azure │ │  AWS  │        │   │   │
│   │   │  │Wrapper │ │ Wrapper  │ │Wrapper │ │Wrapper│ │Wrapper│        │   │   │
│   │   │  └────────┘ └──────────┘ └────────┘ └───────┘ └───────┘        │   │   │
│   │   └─────────────────────────────────────────────────────────────────┘   │   │
│   └──────────────────────────────┬──────────────────────────────────────────┘   │
│                                  │                                               │
│          ┌───────────────────────┼───────────────────────┐                      │
│          │                       │                       │                      │
│          ▼                       ▼                       ▼                      │
│   ┌────────────┐          ┌────────────┐          ┌────────────┐                │
│   │     AI     │          │  TokenTra  │          │   Local    │                │
│   │  Provider  │          │  Backend   │          │   Cache    │                │
│   │   APIs     │          │  (Async)   │          │ (Optional) │                │
│   └────────────┘          └────────────┘          └────────────┘                │
│                                  │                                               │
│                                  ▼                                               │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                      TOKENTRA BACKEND                                    │   │
│   │                                                                          │   │
│   │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐               │   │
│   │  │   Usage   │ │   Cost    │ │ Alerting  │ │  Budget   │               │   │
│   │  │  System   │ │ Analysis  │ │  Engine   │ │  Manager  │               │   │
│   │  └───────────┘ └───────────┘ └───────────┘ └───────────┘               │   │
│   │                                                                          │   │
│   │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐               │   │
│   │  │  Reports  │ │Optimization│ │Notification│ │ Dashboard │               │   │
│   │  │  System   │ │  Engine   │ │  System   │ │    API    │               │   │
│   │  └───────────┘ └───────────┘ └───────────┘ └───────────┘               │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SDK DATA FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   1. REQUEST PHASE                                                               │
│   ─────────────────                                                              │
│                                                                                  │
│   Customer Code                                                                  │
│        │                                                                         │
│        │  openai.chat.completions.create({...}, { tokentra: {...} })            │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  SDK Intercepts Request                                                  │   │
│   │                                                                          │   │
│   │  1. Generate unique request_id                                           │   │
│   │  2. Capture start timestamp                                              │   │
│   │  3. Extract model, messages, parameters                                  │   │
│   │  4. Capture attribution tags (feature, team, user)                       │   │
│   │  5. Check smart routing rules (if enabled)                               │   │
│   │  6. Check semantic cache (if enabled)                                    │   │
│   │                                                                          │   │
│   │  If cache HIT:                                                           │   │
│   │     → Return cached response immediately                                 │   │
│   │     → Log cache hit asynchronously                                       │   │
│   │                                                                          │   │
│   │  If cache MISS or routing needed:                                        │   │
│   │     → Potentially modify model (smart routing)                           │   │
│   │     → Forward to AI provider                                             │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  AI Provider (OpenAI, Anthropic, etc.)                                   │   │
│   │                                                                          │   │
│   │  - Uses CUSTOMER'S API key (SDK never sees it in clear text)             │   │
│   │  - Request goes directly to provider                                     │   │
│   │  - No proxy, no additional latency                                       │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        ▼                                                                         │
│   2. RESPONSE PHASE                                                              │
│   ──────────────────                                                             │
│        │                                                                         │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  SDK Processes Response                                                  │   │
│   │                                                                          │   │
│   │  1. Capture end timestamp                                                │   │
│   │  2. Calculate latency                                                    │   │
│   │  3. Extract token usage from response                                    │   │
│   │     - input_tokens                                                       │   │
│   │     - output_tokens                                                      │   │
│   │     - cached_tokens (if applicable)                                      │   │
│   │  4. Calculate estimated cost (using pricing tables)                      │   │
│   │  5. Determine success/error status                                       │   │
│   │  6. Update semantic cache (if enabled)                                   │   │
│   │                                                                          │   │
│   │  7. RETURN RESPONSE TO CUSTOMER IMMEDIATELY                              │   │
│   │     ↓                                                                    │   │
│   │     (Customer code continues without waiting)                            │   │
│   │                                                                          │   │
│   │  8. ASYNC: Send telemetry to TokenTra backend                            │   │
│   │     → POST /api/v1/sdk/ingest                                            │   │
│   │     → Non-blocking, fire-and-forget                                      │   │
│   │     → Batched for efficiency                                             │   │
│   │     → Retried on failure                                                 │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        │  (Async)                                                                │
│        ▼                                                                         │
│   3. BACKEND PROCESSING                                                          │
│   ─────────────────────                                                          │
│        │                                                                         │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  TokenTra Backend                                                        │   │
│   │                                                                          │   │
│   │  POST /api/v1/sdk/ingest                                                 │   │
│   │                                                                          │   │
│   │  1. Validate API key                                                     │   │
│   │  2. Check rate limits                                                    │   │
│   │  3. Parse and validate telemetry payload                                 │   │
│   │  4. Enrich with org/team/project metadata                                │   │
│   │  5. Insert into usage_records (time-series)                              │   │
│   │  6. Update real-time aggregations                                        │   │
│   │  7. Check alert thresholds                                               │   │
│   │  8. Check budget limits                                                  │   │
│   │  9. Trigger notifications if needed                                      │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Characteristics

| Characteristic | Description |
|----------------|-------------|
| **Zero Latency Impact** | Telemetry sent asynchronously after response returns |
| **No Proxy** | Requests go directly to AI providers, not through TokenTra servers |
| **Transparent Wrapping** | Works with existing code, minimal changes required |
| **Failsafe** | If TokenTra is down, AI calls still work normally |
| **Privacy First** | Prompt/response content NOT logged by default |
| **Provider Agnostic** | Single SDK wraps OpenAI, Anthropic, Google, Azure, AWS |
| **Multi-Language** | Node.js (TypeScript) and Python SDKs |

---

## 2. SDK Design Principles

### 2.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Zero Trust, Zero Friction** | Customer's AI API keys are NEVER transmitted to TokenTra. Only metadata and usage metrics are sent. |
| **Non-Blocking Telemetry** | Response returned to customer BEFORE telemetry is sent. Telemetry sent in background thread/async task. |
| **Graceful Degradation** | If TokenTra backend is unreachable, AI calls continue to work normally. Telemetry is buffered locally. |
| **Minimal Surface Area** | 3 lines of code to integrate. No changes to existing AI call patterns. Optional attribution tags. |
| **Privacy by Default** | Prompt content NOT captured by default. Response content NOT captured by default. Only opt-in with explicit configuration. |
| **Type Safety** | Full TypeScript support with strict types. Autocomplete for all configuration options. |

### 2.2 What the SDK Does and Does Not Do

| SDK DOES | SDK DOES NOT |
|----------|--------------|
| Track token usage (input, output, cached) | Store or transmit customer's AI API keys |
| Calculate estimated costs | Modify prompt content |
| Capture attribution metadata | Add latency to AI responses |
| Enable smart routing (optional) | Require code architecture changes |
| Enable semantic caching (optional) | Break if TokenTra is down |
| Send telemetry asynchronously | Log prompt/response by default |
| Validate TokenTra API keys | Access customer's data outside SDK |
| Handle rate limiting | Require admin privileges |

---

## 3. Installation & Quick Start

### 3.1 Node.js Installation

```bash
# npm
npm install @tokentra/sdk

# yarn
yarn add @tokentra/sdk

# pnpm
pnpm add @tokentra/sdk
```

### 3.2 Python Installation

```bash
# pip
pip install tokentra

# poetry
poetry add tokentra
```

### 3.3 Quick Start (Node.js)

```typescript
// 1. Import TokenTra and your AI client
import { TokenTra } from '@tokentra/sdk';
import OpenAI from 'openai';

// 2. Initialize TokenTra with your API key
const tokentra = new TokenTra({
  apiKey: process.env.TOKENTRA_API_KEY  // 'tt_live_xxx...'
});

// 3. Wrap your existing AI client
const openai = tokentra.wrap(new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}));

// 4. Use as normal - tracking happens automatically
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello, world!' }]
});

// That's it! Usage data appears in your TokenTra dashboard.
```

### 3.4 Quick Start with Attribution

```typescript
import { TokenTra } from '@tokentra/sdk';
import OpenAI from 'openai';

const tokentra = new TokenTra({
  apiKey: process.env.TOKENTRA_API_KEY
});

const openai = tokentra.wrap(new OpenAI());

// Add attribution tags to track by feature/team/user
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Summarize this document...' }]
}, {
  tokentra: {
    feature: 'document-summarizer',
    team: 'product',
    project: 'enterprise-suite',
    userId: 'user_12345',
    environment: 'production',
    metadata: {
      documentType: 'pdf',
      pageCount: 15
    }
  }
});
```

### 3.5 Quick Start (Python)

```python
# 1. Import TokenTra and your AI client
from tokentra import TokenTra
from openai import OpenAI
import os

# 2. Initialize TokenTra with your API key
tokentra = TokenTra(api_key=os.environ["TOKENTRA_API_KEY"])

# 3. Wrap your existing AI client
openai = tokentra.wrap(OpenAI(api_key=os.environ["OPENAI_API_KEY"]))

# 4. Use as normal - tracking happens automatically
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello, world!"}]
)

# With attribution
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}],
    tokentra={
        "feature": "chat",
        "team": "product",
        "user_id": "user_123"
    }
)
```

---

## 4. Authentication & API Keys

### 4.1 API Key Structure

```
API KEY FORMAT
──────────────

tt_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
│  │    │
│  │    └── Random cryptographic string (32 chars, base64url)
│  │
│  └── Environment indicator
│      • live = Production
│      • test = Testing/Sandbox
│
└── Prefix identifier (TokenTra)


KEY STORAGE
───────────

• Full key shown ONLY at creation time
• Database stores: SHA-256 hash of full key
• Dashboard shows: Prefix only (tt_live_a1b2...)
• Customer must save full key securely
```

### 4.2 Key Lifecycle Management

```
1. CREATION
───────────
User Action: Creates key in TokenTra Settings

Backend:
• Generate cryptographically random string (32 bytes, base64url)
• Create full key: tt_live_ + random_string
• Compute SHA-256 hash of full key
• Store hash, prefix, metadata in api_keys table
• Return full key to user ONCE
• Log creation in audit log

───────────────────────────────────────────────────────────────────────────

2. USAGE
────────
SDK: Includes key in Authorization header

Backend:
• Validate key (see validation flow above)
• Update last_used_at timestamp
• Increment usage_count
• Record IP address in last_used_ip
• Check and decrement rate limits

───────────────────────────────────────────────────────────────────────────

3. ROTATION
───────────
Best Practice: Rotate keys periodically (every 90 days)

Process:
1. Create new key with same scopes
2. Update application with new key
3. Deploy application
4. Monitor both keys for usage
5. Once old key unused, revoke it

───────────────────────────────────────────────────────────────────────────

4. REVOCATION
─────────────
User Action: Revokes key in TokenTra Settings

Backend:
• Set revoked = true
• Set revoked_at = NOW()
• Set revoked_by = user_id
• Set revoke_reason (optional)
• Log revocation in audit log
• Invalidate any cached key validation

Effect:
• All subsequent requests with this key → 401 Unauthorized
• Existing in-flight requests may complete
• Key cannot be un-revoked (must create new key)
```

### 4.3 API Key Types & Scopes

| Key Type | Scopes | Use Case |
|----------|--------|----------|
| **Full Access** | `read`, `write`, `admin` | Server-side SDK, full tracking |
| **Write Only** | `write` | SDK ingestion only, no read access |
| **Read Only** | `read` | Dashboard queries, reporting |
| **Restricted** | `usage:write` | Limited to usage ingestion |

### 4.4 Backend Key Validation Service

```typescript
// lib/services/ApiKeyValidationService.ts

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';

interface ValidatedApiKey {
  id: string;
  orgId: string;
  userId?: string;
  scopes: string[];
  rateLimits: {
    perMinute: number;
    perDay: number;
  };
}

interface ValidationResult {
  valid: boolean;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
  apiKey?: ValidatedApiKey;
}

export class ApiKeyValidationService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  private redis = new Redis(process.env.REDIS_URL!);
  
  // Cache TTL: 60 seconds (balance between security and performance)
  private readonly CACHE_TTL = 60;
  
  /**
   * Validate an API key
   */
  async validateKey(
    key: string,
    requiredScopes: string[] = [],
    clientIp?: string
  ): Promise<ValidationResult> {
    // 1. Basic format validation
    if (!this.isValidFormat(key)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_KEY_FORMAT',
          message: 'API key format is invalid',
          statusCode: 401
        }
      };
    }
    
    // 2. Compute hash
    const keyHash = this.hashKey(key);
    
    // 3. Check cache first
    const cached = await this.getCachedValidation(keyHash);
    if (cached) {
      // Still need to check rate limits even for cached keys
      const rateLimitResult = await this.checkRateLimits(cached, keyHash);
      if (!rateLimitResult.allowed) {
        return {
          valid: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Retry after ${rateLimitResult.retryAfter} seconds`,
            statusCode: 429
          }
        };
      }
      return { valid: true, apiKey: cached };
    }
    
    // 4. Look up in database
    const { data: apiKey, error } = await this.supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .single();
    
    if (error || !apiKey) {
      return {
        valid: false,
        error: {
          code: 'INVALID_KEY',
          message: 'API key not found',
          statusCode: 401
        }
      };
    }
    
    // 5. Check if revoked
    if (apiKey.revoked) {
      return {
        valid: false,
        error: {
          code: 'KEY_REVOKED',
          message: 'API key has been revoked',
          statusCode: 401
        }
      };
    }
    
    // 6. Check if expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return {
        valid: false,
        error: {
          code: 'KEY_EXPIRED',
          message: 'API key has expired',
          statusCode: 401
        }
      };
    }
    
    // 7. Check IP restrictions
    if (apiKey.allowed_ips && apiKey.allowed_ips.length > 0 && clientIp) {
      if (!this.isIpAllowed(clientIp, apiKey.allowed_ips)) {
        return {
          valid: false,
          error: {
            code: 'IP_NOT_ALLOWED',
            message: 'Request from unauthorized IP address',
            statusCode: 403
          }
        };
      }
    }
    
    // 8. Check scopes
    if (requiredScopes.length > 0) {
      const hasScopes = requiredScopes.every(scope => 
        apiKey.scopes.includes(scope) || apiKey.scopes.includes('admin')
      );
      if (!hasScopes) {
        return {
          valid: false,
          error: {
            code: 'INSUFFICIENT_SCOPE',
            message: `API key missing required scopes: ${requiredScopes.join(', ')}`,
            statusCode: 403
          }
        };
      }
    }
    
    // 9. Build validated key object
    const validatedKey: ValidatedApiKey = {
      id: apiKey.id,
      orgId: apiKey.org_id,
      userId: apiKey.user_id,
      scopes: apiKey.scopes,
      rateLimits: {
        perMinute: apiKey.rate_limit_per_minute,
        perDay: apiKey.rate_limit_per_day
      }
    };
    
    // 10. Check rate limits
    const rateLimitResult = await this.checkRateLimits(validatedKey, keyHash);
    if (!rateLimitResult.allowed) {
      return {
        valid: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Retry after ${rateLimitResult.retryAfter} seconds`,
          statusCode: 429
        }
      };
    }
    
    // 11. Cache the validated key
    await this.cacheValidation(keyHash, validatedKey);
    
    // 12. Update usage stats (async, non-blocking)
    this.updateUsageStats(apiKey.id, clientIp).catch(err => {
      console.error('Failed to update API key usage stats:', err);
    });
    
    return { valid: true, apiKey: validatedKey };
  }
  
  /**
   * Hash an API key using SHA-256
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
  
  /**
   * Validate key format
   */
  private isValidFormat(key: string): boolean {
    return /^tt_(live|test)_[a-zA-Z0-9_-]{32,}$/.test(key);
  }
  
  /**
   * Check if IP is in allowlist
   */
  private isIpAllowed(clientIp: string, allowedIps: string[]): boolean {
    for (const allowed of allowedIps) {
      if (allowed.includes('/')) {
        // CIDR range
        if (this.isIpInCidr(clientIp, allowed)) {
          return true;
        }
      } else {
        // Exact match
        if (clientIp === allowed) {
          return true;
        }
      }
    }
    return false;
  }
  
  /**
   * Check if IP is in CIDR range
   */
  private isIpInCidr(ip: string, cidr: string): boolean {
    const [range, bits] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);
    const ipNum = this.ipToNumber(ip);
    const rangeNum = this.ipToNumber(range);
    return (ipNum & mask) === (rangeNum & mask);
  }
  
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  }
  
  /**
   * Get cached validation result
   */
  private async getCachedValidation(keyHash: string): Promise<ValidatedApiKey | null> {
    const cached = await this.redis.get(`apikey:validation:${keyHash}`);
    return cached ? JSON.parse(cached) : null;
  }
  
  /**
   * Cache validation result
   */
  private async cacheValidation(keyHash: string, key: ValidatedApiKey): Promise<void> {
    await this.redis.setex(
      `apikey:validation:${keyHash}`,
      this.CACHE_TTL,
      JSON.stringify(key)
    );
  }
  
  /**
   * Check rate limits using Redis
   */
  private async checkRateLimits(
    key: ValidatedApiKey,
    keyHash: string
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Math.floor(Date.now() / 1000);
    const minuteKey = `ratelimit:${keyHash}:minute:${Math.floor(now / 60)}`;
    const dayKey = `ratelimit:${keyHash}:day:${Math.floor(now / 86400)}`;
    
    // Increment counters
    const [minuteCount, dayCount] = await Promise.all([
      this.redis.incr(minuteKey),
      this.redis.incr(dayKey)
    ]);
    
    // Set expiry if new keys
    if (minuteCount === 1) {
      await this.redis.expire(minuteKey, 60);
    }
    if (dayCount === 1) {
      await this.redis.expire(dayKey, 86400);
    }
    
    // Check limits
    if (minuteCount > key.rateLimits.perMinute) {
      const retryAfter = 60 - (now % 60);
      return { allowed: false, retryAfter };
    }
    
    if (dayCount > key.rateLimits.perDay) {
      const retryAfter = 86400 - (now % 86400);
      return { allowed: false, retryAfter };
    }
    
    return { allowed: true };
  }
  
  /**
   * Update usage statistics (async)
   */
  private async updateUsageStats(keyId: string, clientIp?: string): Promise<void> {
    await this.supabase.rpc('increment_api_key_usage', { 
      key_id: keyId,
      ip_address: clientIp 
    });
  }
  
  /**
   * Invalidate cached key (call when key is revoked)
   */
  async invalidateKey(keyHash: string): Promise<void> {
    await this.redis.del(`apikey:validation:${keyHash}`);
  }
}
```

---

## 5. Provider Wrappers

### 5.1 Wrapper Architecture

The SDK uses a proxy pattern to wrap existing AI client libraries without modifying their behavior or requiring code changes.

```
BASE WRAPPER CLASS
──────────────────
• Intercepts method calls to AI client
• Captures pre-request metadata
• Forwards request to original client
• Captures post-response metrics
• Sends telemetry asynchronously

              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼

┌─────────┐ ┌─────────┐ ┌─────────┐
│ OpenAI  │ │Anthropic│ │ Google  │
│ Wrapper │ │ Wrapper │ │ Wrapper │
│         │ │         │ │         │
│• chat   │ │• messages│ │• generate│
│• embed  │ │• complete│ │• stream │
│• images │ │         │ │         │
└─────────┘ └─────────┘ └─────────┘
```

### 5.2 OpenAI Wrapper Implementation

```typescript
// sdk/wrappers/OpenAIWrapper.ts

import type OpenAI from 'openai';
import { TokenTraCore } from '../core/TokenTraCore';
import { TelemetryEvent, TokenTraOptions } from '../types';

type OpenAIClient = InstanceType<typeof OpenAI>;

export class OpenAIWrapper {
  private client: OpenAIClient;
  private core: TokenTraCore;
  
  constructor(client: OpenAIClient, core: TokenTraCore) {
    this.client = client;
    this.core = core;
    
    // Return a proxy that intercepts all method calls
    return this.createProxy();
  }
  
  private createProxy(): OpenAIClient {
    const self = this;
    
    return new Proxy(this.client, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        
        // Handle nested objects (chat.completions, etc.)
        if (typeof value === 'object' && value !== null) {
          return self.wrapNestedObject(value, String(prop));
        }
        
        return value;
      }
    });
  }
  
  private wrapNestedObject(obj: any, path: string): any {
    const self = this;
    
    return new Proxy(obj, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        
        // Wrap methods that make API calls
        if (typeof value === 'function') {
          const methodPath = `${path}.${String(prop)}`;
          
          // Known methods that need wrapping
          if (self.shouldWrapMethod(methodPath)) {
            return self.wrapMethod(value.bind(target), methodPath);
          }
        }
        
        // Handle deeper nesting
        if (typeof value === 'object' && value !== null) {
          return self.wrapNestedObject(value, `${path}.${String(prop)}`);
        }
        
        return value;
      }
    });
  }
  
  private shouldWrapMethod(path: string): boolean {
    const wrappedMethods = [
      'chat.completions.create',
      'completions.create',
      'embeddings.create',
      'images.generate',
      'images.edit',
      'audio.transcriptions.create',
      'audio.translations.create',
      'audio.speech.create',
      'moderations.create'
    ];
    return wrappedMethods.includes(path);
  }
  
  private wrapMethod(
    method: Function,
    methodPath: string
  ): (...args: any[]) => Promise<any> {
    const self = this;
    
    return async function(...args: any[]): Promise<any> {
      // Extract TokenTra options from last argument
      const lastArg = args[args.length - 1];
      let tokentraOptions: TokenTraOptions | undefined;
      let cleanArgs = args;
      
      if (lastArg && typeof lastArg === 'object' && 'tokentra' in lastArg) {
        tokentraOptions = lastArg.tokentra;
        // Remove tokentra options from args passed to OpenAI
        cleanArgs = args.slice(0, -1);
        if (Object.keys(lastArg).length > 1) {
          // There are other properties, keep them
          const { tokentra, ...rest } = lastArg;
          cleanArgs = [...args.slice(0, -1), rest];
        }
      }
      
      // Generate request ID and capture start time
      const requestId = self.core.generateRequestId();
      const startTime = Date.now();
      
      // Extract request details
      const requestParams = cleanArgs[0] || {};
      const model = requestParams.model || 'unknown';
      const isStreaming = requestParams.stream === true;
      
      // Pre-request telemetry
      const preRequestData = {
        requestId,
        provider: 'openai',
        model,
        methodPath,
        isStreaming,
        timestamp: new Date().toISOString(),
        attribution: tokentraOptions
      };
      
      try {
        // Check semantic cache (if enabled)
        if (self.core.config.caching?.enabled && !isStreaming) {
          const cached = await self.core.checkCache(requestParams);
          if (cached) {
            // Return cached response
            self.core.sendTelemetry({
              ...preRequestData,
              status: 'cache_hit',
              latencyMs: Date.now() - startTime,
              cached: true,
              usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
            });
            return cached;
          }
        }
        
        // Check smart routing (if enabled)
        let finalModel = model;
        if (self.core.config.smartRouting?.enabled) {
          finalModel = await self.core.determineOptimalModel(requestParams);
          if (finalModel !== model) {
            requestParams.model = finalModel;
          }
        }
        
        // Make the actual API call
        const response = await method.apply(null, cleanArgs);
        
        // Calculate latency
        const latencyMs = Date.now() - startTime;
        
        // Extract usage from response
        const usage = self.extractUsage(response, methodPath);
        
        // Calculate cost
        const cost = self.core.calculateCost(finalModel, usage);
        
        // Build telemetry event
        const telemetryEvent: TelemetryEvent = {
          requestId,
          provider: 'openai',
          model: finalModel,
          originalModel: model !== finalModel ? model : undefined,
          methodPath,
          status: 'success',
          timestamp: new Date().toISOString(),
          latencyMs,
          usage: {
            inputTokens: usage.prompt_tokens || 0,
            outputTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0,
            cachedTokens: usage.cached_tokens || 0
          },
          cost: {
            inputCost: cost.inputCost,
            outputCost: cost.outputCost,
            totalCost: cost.totalCost,
            currency: 'USD'
          },
          attribution: tokentraOptions,
          isStreaming
        };
        
        // Send telemetry asynchronously (non-blocking)
        self.core.sendTelemetry(telemetryEvent);
        
        // Update cache (if enabled)
        if (self.core.config.caching?.enabled && !isStreaming) {
          self.core.updateCache(requestParams, response);
        }
        
        return response;
        
      } catch (error) {
        // Capture error telemetry
        const latencyMs = Date.now() - startTime;
        
        self.core.sendTelemetry({
          requestId,
          provider: 'openai',
          model,
          methodPath,
          status: 'error',
          timestamp: new Date().toISOString(),
          latencyMs,
          error: {
            type: (error as Error).name,
            message: (error as Error).message,
            code: (error as any).code
          },
          attribution: tokentraOptions,
          isStreaming,
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
        });
        
        // Re-throw the error so customer's code handles it normally
        throw error;
      }
    };
  }
  
  private extractUsage(response: any, methodPath: string): any {
    // Different endpoints return usage differently
    if (response.usage) {
      return response.usage;
    }
    
    // For embeddings, estimate from input
    if (methodPath.includes('embeddings')) {
      return {
        prompt_tokens: response.data?.[0]?.embedding?.length || 0,
        total_tokens: response.data?.[0]?.embedding?.length || 0
      };
    }
    
    // For images, no token usage
    if (methodPath.includes('images')) {
      return { images: response.data?.length || 1 };
    }
    
    return {};
  }
}
```

### 5.3 Anthropic Wrapper Implementation

```typescript
// sdk/wrappers/AnthropicWrapper.ts

import type Anthropic from '@anthropic-ai/sdk';
import { TokenTraCore } from '../core/TokenTraCore';
import { TelemetryEvent, TokenTraOptions } from '../types';

type AnthropicClient = InstanceType<typeof Anthropic>;

export class AnthropicWrapper {
  private client: AnthropicClient;
  private core: TokenTraCore;
  
  constructor(client: AnthropicClient, core: TokenTraCore) {
    this.client = client;
    this.core = core;
    
    return this.createProxy();
  }
  
  private createProxy(): AnthropicClient {
    const self = this;
    
    return new Proxy(this.client, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        
        if (prop === 'messages') {
          return self.wrapMessages(value);
        }
        
        if (prop === 'completions') {
          return self.wrapCompletions(value);
        }
        
        return value;
      }
    });
  }
  
  private wrapMessages(messages: any): any {
    const self = this;
    
    return new Proxy(messages, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        
        if (prop === 'create') {
          return self.wrapMethod(value.bind(target), 'messages.create');
        }
        
        if (prop === 'stream') {
          return self.wrapStreamMethod(value.bind(target), 'messages.stream');
        }
        
        return value;
      }
    });
  }
  
  private wrapCompletions(completions: any): any {
    const self = this;
    
    return new Proxy(completions, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        
        if (prop === 'create') {
          return self.wrapMethod(value.bind(target), 'completions.create');
        }
        
        return value;
      }
    });
  }
  
  private wrapMethod(
    method: Function,
    methodPath: string
  ): (...args: any[]) => Promise<any> {
    const self = this;
    
    return async function(...args: any[]): Promise<any> {
      // Extract TokenTra options
      const lastArg = args[args.length - 1];
      let tokentraOptions: TokenTraOptions | undefined;
      let cleanArgs = args;
      
      if (lastArg && typeof lastArg === 'object' && 'tokentra' in lastArg) {
        tokentraOptions = lastArg.tokentra;
        const { tokentra, ...rest } = lastArg;
        cleanArgs = Object.keys(rest).length > 0 
          ? [...args.slice(0, -1), rest] 
          : args.slice(0, -1);
      }
      
      const requestId = self.core.generateRequestId();
      const startTime = Date.now();
      const requestParams = cleanArgs[0] || {};
      const model = requestParams.model || 'unknown';
      const isStreaming = requestParams.stream === true;
      
      try {
        // Check cache
        if (self.core.config.caching?.enabled && !isStreaming) {
          const cached = await self.core.checkCache(requestParams);
          if (cached) {
            self.core.sendTelemetry({
              requestId,
              provider: 'anthropic',
              model,
              methodPath,
              status: 'cache_hit',
              timestamp: new Date().toISOString(),
              latencyMs: Date.now() - startTime,
              cached: true,
              attribution: tokentraOptions,
              isStreaming,
              usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
            });
            return cached;
          }
        }
        
        // Smart routing
        let finalModel = model;
        if (self.core.config.smartRouting?.enabled) {
          finalModel = await self.core.determineOptimalModel(
            requestParams, 
            'anthropic'
          );
          if (finalModel !== model) {
            requestParams.model = finalModel;
          }
        }
        
        // Make API call
        const response = await method.apply(null, cleanArgs);
        const latencyMs = Date.now() - startTime;
        
        // Extract usage (Anthropic returns usage in response)
        const usage = response.usage || {};
        const cost = self.core.calculateCost(finalModel, {
          prompt_tokens: usage.input_tokens,
          completion_tokens: usage.output_tokens,
          cached_tokens: usage.cache_read_input_tokens || 0
        }, 'anthropic');
        
        // Send telemetry
        self.core.sendTelemetry({
          requestId,
          provider: 'anthropic',
          model: finalModel,
          originalModel: model !== finalModel ? model : undefined,
          methodPath,
          status: 'success',
          timestamp: new Date().toISOString(),
          latencyMs,
          usage: {
            inputTokens: usage.input_tokens || 0,
            outputTokens: usage.output_tokens || 0,
            totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
            cachedTokens: usage.cache_read_input_tokens || 0,
            cacheCreationTokens: usage.cache_creation_input_tokens || 0
          },
          cost: {
            inputCost: cost.inputCost,
            outputCost: cost.outputCost,
            totalCost: cost.totalCost,
            currency: 'USD'
          },
          attribution: tokentraOptions,
          isStreaming
        });
        
        // Update cache
        if (self.core.config.caching?.enabled && !isStreaming) {
          self.core.updateCache(requestParams, response);
        }
        
        return response;
        
      } catch (error) {
        self.core.sendTelemetry({
          requestId,
          provider: 'anthropic',
          model,
          methodPath,
          status: 'error',
          timestamp: new Date().toISOString(),
          latencyMs: Date.now() - startTime,
          error: {
            type: (error as Error).name,
            message: (error as Error).message,
            code: (error as any).status
          },
          attribution: tokentraOptions,
          isStreaming,
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
        });
        
        throw error;
      }
    };
  }
  
  private wrapStreamMethod(
    method: Function,
    methodPath: string
  ): (...args: any[]) => any {
    const self = this;
    
    return function(...args: any[]): any {
      // Extract TokenTra options
      const lastArg = args[args.length - 1];
      let tokentraOptions: TokenTraOptions | undefined;
      let cleanArgs = args;
      
      if (lastArg && typeof lastArg === 'object' && 'tokentra' in lastArg) {
        tokentraOptions = lastArg.tokentra;
        const { tokentra, ...rest } = lastArg;
        cleanArgs = Object.keys(rest).length > 0 
          ? [...args.slice(0, -1), rest] 
          : args.slice(0, -1);
      }
      
      const requestId = self.core.generateRequestId();
      const startTime = Date.now();
      const requestParams = cleanArgs[0] || {};
      const model = requestParams.model || 'unknown';
      
      // Get the stream
      const stream = method.apply(null, cleanArgs);
      
      // Wrap the stream to capture final message
      return self.wrapStream(stream, {
        requestId,
        model,
        methodPath,
        startTime,
        tokentraOptions
      });
    };
  }
  
  private wrapStream(stream: any, context: any): any {
    const self = this;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    
    // Anthropic streams have an async iterator
    const originalIterator = stream[Symbol.asyncIterator].bind(stream);
    
    stream[Symbol.asyncIterator] = async function* () {
      const iterator = originalIterator();
      
      try {
        for await (const event of iterator) {
          // Capture usage from final message
          if (event.type === 'message_delta' && event.usage) {
            totalOutputTokens = event.usage.output_tokens || totalOutputTokens;
          }
          if (event.type === 'message_start' && event.message?.usage) {
            totalInputTokens = event.message.usage.input_tokens || 0;
          }
          
          yield event;
        }
        
        // Stream completed successfully
        const latencyMs = Date.now() - context.startTime;
        const cost = self.core.calculateCost(context.model, {
          prompt_tokens: totalInputTokens,
          completion_tokens: totalOutputTokens
        }, 'anthropic');
        
        self.core.sendTelemetry({
          requestId: context.requestId,
          provider: 'anthropic',
          model: context.model,
          methodPath: context.methodPath,
          status: 'success',
          timestamp: new Date().toISOString(),
          latencyMs,
          usage: {
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens
          },
          cost: {
            inputCost: cost.inputCost,
            outputCost: cost.outputCost,
            totalCost: cost.totalCost,
            currency: 'USD'
          },
          attribution: context.tokentraOptions,
          isStreaming: true
        });
        
      } catch (error) {
        self.core.sendTelemetry({
          requestId: context.requestId,
          provider: 'anthropic',
          model: context.model,
          methodPath: context.methodPath,
          status: 'error',
          timestamp: new Date().toISOString(),
          latencyMs: Date.now() - context.startTime,
          error: {
            type: (error as Error).name,
            message: (error as Error).message
          },
          attribution: context.tokentraOptions,
          isStreaming: true,
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
        });
        
        throw error;
      }
    };
    
    return stream;
  }
}
```

### 5.4 Provider Detection

```typescript
// sdk/wrappers/ProviderDetector.ts

import { TokenTraCore } from '../core/TokenTraCore';
import { OpenAIWrapper } from './OpenAIWrapper';
import { AnthropicWrapper } from './AnthropicWrapper';

export class ProviderDetector {
  /**
   * Detect provider from client instance and return appropriate wrapper
   */
  static wrap<T>(client: T, core: TokenTraCore): T {
    const provider = this.detectProvider(client);
    
    switch (provider) {
      case 'openai':
        return new OpenAIWrapper(client as any, core) as unknown as T;
        
      case 'anthropic':
        return new AnthropicWrapper(client as any, core) as unknown as T;
        
      case 'google':
        // return new GoogleWrapper(client as any, core) as unknown as T;
        throw new Error('Google wrapper coming soon');
        
      case 'azure':
        // Azure uses OpenAI-compatible API
        return new OpenAIWrapper(client as any, core) as unknown as T;
        
      case 'aws':
        // return new AWSWrapper(client as any, core) as unknown as T;
        throw new Error('AWS Bedrock wrapper coming soon');
        
      default:
        throw new Error(
          `Unsupported AI client. TokenTra supports: OpenAI, Anthropic, ` +
          `Google Vertex, Azure OpenAI, AWS Bedrock`
        );
    }
  }
  
  /**
   * Detect which provider a client belongs to
   */
  private static detectProvider(client: any): string {
    // OpenAI SDK
    if (client.chat?.completions?.create || client._client?.chat) {
      // Check if it's Azure OpenAI
      if (client._options?.baseURL?.includes('azure')) {
        return 'azure';
      }
      return 'openai';
    }
    
    // Anthropic SDK
    if (client.messages?.create || client._client?.messages) {
      return 'anthropic';
    }
    
    // Google Vertex AI / Generative AI
    if (client.generateContent || client.getGenerativeModel) {
      return 'google';
    }
    
    // AWS Bedrock
    if (client.invokeModel || client.config?.region) {
      return 'aws';
    }
    
    // Check constructor name as fallback
    const constructorName = client.constructor?.name;
    if (constructorName) {
      if (constructorName.includes('OpenAI')) return 'openai';
      if (constructorName.includes('Anthropic')) return 'anthropic';
      if (constructorName.includes('Bedrock')) return 'aws';
      if (constructorName.includes('Vertex') || 
          constructorName.includes('Google')) return 'google';
    }
    
    return 'unknown';
  }
}
```

---

## 6. Usage Data Collection

### 6.1 Data Collected by Default

| Data Point | Always Collected | Description |
|------------|------------------|-------------|
| `requestId` | ✅ | Unique identifier for the request |
| `timestamp` | ✅ | When the request was made |
| `provider` | ✅ | AI provider (openai, anthropic, etc.) |
| `model` | ✅ | Model used (gpt-4, claude-3-sonnet, etc.) |
| `inputTokens` | ✅ | Tokens sent to the model |
| `outputTokens` | ✅ | Tokens generated by the model |
| `cachedTokens` | ✅ | Tokens served from provider cache |
| `latencyMs` | ✅ | Response time in milliseconds |
| `status` | ✅ | success, error, cache_hit |
| `estimatedCost` | ✅ | Calculated cost in USD |
| `isStreaming` | ✅ | Whether streaming was used |
| `methodPath` | ✅ | API endpoint called |

### 6.2 Data NOT Collected by Default

| Data Point | Default | Opt-In | Description |
|------------|---------|--------|-------------|
| `promptContent` | ❌ | Optional | The actual prompt text |
| `responseContent` | ❌ | Optional | The actual response text |
| `systemPrompt` | ❌ | Optional | System prompt if provided |
| `imageData` | ❌ | Never | Image content (never collected) |
| `audioData` | ❌ | Never | Audio content (never collected) |

### 6.3 Attribution Data (Optional)

| Data Point | Required | Description |
|------------|----------|-------------|
| `feature` | No | Product feature making the call |
| `team` | No | Team responsible |
| `project` | No | Project identifier |
| `costCenter` | No | Cost center for billing |
| `userId` | No | End user identifier |
| `environment` | No | prod, staging, dev |
| `metadata` | No | Custom key-value pairs |

---

## 7. Attribution System

### 7.1 Attribution Hierarchy

```
ATTRIBUTION HIERARCHY
─────────────────────

Attribution tags allow costs to be allocated to different parts of the organization

┌─────────────────────────────────────────────────────────────────────────┐
│                         ORGANIZATION                                     │
│                     (TokenTra Account)                                   │
│                                                                          │
│    ┌─────────────────────────────────────────────────────────────────┐  │
│    │                        TEAM                                      │  │
│    │                   (e.g., "product")                              │  │
│    │                                                                  │  │
│    │    ┌────────────────────────────────────────────────────────┐   │  │
│    │    │                     PROJECT                             │   │  │
│    │    │               (e.g., "enterprise-suite")                │   │  │
│    │    │                                                         │   │  │
│    │    │    ┌───────────────────────────────────────────────┐   │   │  │
│    │    │    │                   FEATURE                      │   │   │  │
│    │    │    │            (e.g., "document-summarizer")       │   │   │  │
│    │    │    │                                                │   │   │  │
│    │    │    │    ┌──────────────────────────────────────┐   │   │   │  │
│    │    │    │    │              USER                     │   │   │   │  │
│    │    │    │    │       (e.g., "user_12345")            │   │   │   │  │
│    │    │    │    │                                       │   │   │   │  │
│    │    │    │    │   Each AI call can be attributed at  │   │   │   │  │
│    │    │    │    │   any level of this hierarchy        │   │   │   │  │
│    │    │    │    └──────────────────────────────────────┘   │   │   │  │
│    │    │    └───────────────────────────────────────────────┘   │   │  │
│    │    └────────────────────────────────────────────────────────┘   │  │
│    └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Setting Default Attribution

```typescript
// Set defaults that apply to all requests
const tokentra = new TokenTra({
  apiKey: process.env.TOKENTRA_API_KEY,
  defaults: {
    team: 'platform',
    project: 'main-app',
    environment: process.env.NODE_ENV
  }
});

// Override defaults per request
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...]
}, {
  tokentra: {
    feature: 'chat',        // Add feature
    team: 'product',        // Override default team
    userId: 'user_123'      // Add user
  }
});
```

---

## 8. Smart Routing Engine

### 8.1 Overview

Smart Routing automatically routes requests to the most cost-effective model while maintaining quality requirements.

```
SMART ROUTING FLOW
──────────────────

Customer requests: model='gpt-4'
              │
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      COMPLEXITY ANALYZER                                 │
│                                                                          │
│   Analyzes request to determine complexity:                              │
│                                                                          │
│   • Token count (short vs long)                                         │
│   • Presence of code/math                                               │
│   • Conversation history length                                         │
│   • Specific keywords (analyze, compare, synthesize)                    │
│   • System prompt complexity                                            │
│                                                                          │
│   Output: complexity_score (0.0 - 1.0)                                  │
│                                                                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         ROUTING DECISION                                 │
│                                                                          │
│   IF complexity_score < threshold (default: 0.3):                       │
│       → Route to cheaper model (gpt-4o-mini)                            │
│       → Flag as smart_routed: true                                      │
│                                                                          │
│   ELSE:                                                                  │
│       → Use requested model (gpt-4)                                     │
│       → No routing applied                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

ROUTING RULES (Configurable):

┌─────────────────────────────────────────────────────────────────────────┐
│  Requested Model     │  Routing Option      │  Savings                  │
│  ────────────────────┼──────────────────────┼─────────────────────────  │
│  gpt-4               │  gpt-4o-mini         │  ~95% cheaper             │
│  gpt-4-turbo         │  gpt-4o-mini         │  ~93% cheaper             │
│  gpt-4o              │  gpt-4o-mini         │  ~90% cheaper             │
│  claude-3-opus       │  claude-3-haiku      │  ~95% cheaper             │
│  claude-3-sonnet     │  claude-3-haiku      │  ~80% cheaper             │
│  gemini-1.5-pro      │  gemini-1.5-flash    │  ~85% cheaper             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Configuration

```typescript
const tokentra = new TokenTra({
  apiKey: process.env.TOKENTRA_API_KEY,
  
  smartRouting: {
    enabled: true,
    
    // Complexity threshold (0.0 - 1.0)
    // Lower = more aggressive routing to cheaper models
    threshold: 0.3,
    
    // Model routing rules
    routes: {
      'gpt-4': 'gpt-4o-mini',
      'gpt-4-turbo': 'gpt-4o-mini',
      'gpt-4o': 'gpt-4o-mini',
      'claude-3-opus-20240229': 'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022': 'claude-3-haiku-20240307'
    },
    
    // Never route these (always use requested model)
    exclude: [
      'code-review',       // Feature names
      'security-analysis'
    ],
    
    // Quality safeguards
    safeguards: {
      // Don't route if conversation > 10 messages
      maxConversationLength: 10,
      // Don't route if input > 4000 tokens
      maxInputTokens: 4000,
      // Don't route if system prompt > 500 tokens
      maxSystemPromptTokens: 500
    },
    
    // A/B testing (optional)
    abTest: {
      enabled: true,
      // Route 10% of traffic for testing
      percentage: 10
    }
  }
});
```

---

## 9. Semantic Caching

### 9.1 Overview

Semantic caching stores responses for similar prompts to avoid redundant API calls.

```
SEMANTIC CACHING FLOW
─────────────────────

Incoming Request
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      GENERATE SEMANTIC KEY                               │
│                                                                          │
│   1. Extract content from request                                        │
│      - Model                                                             │
│      - Messages (excluding timestamps, IDs)                              │
│      - Key parameters (temperature, max_tokens)                          │
│                                                                          │
│   2. Normalize content                                                   │
│      - Lowercase                                                         │
│      - Remove extra whitespace                                           │
│      - Sort parameters                                                   │
│                                                                          │
│   3. Generate hash                                                       │
│      - SHA-256 of normalized content                                     │
│      - Prefix with org_id for isolation                                  │
│                                                                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CACHE LOOKUP                                     │
│                                                                          │
│   Check Redis for semantic_key                                           │
│                                                                          │
│   IF FOUND:                                                              │
│       → Check TTL (time-to-live)                                         │
│       → Validate response structure                                      │
│       → Return cached response                                           │
│       → Log cache_hit telemetry                                          │
│                                                                          │
│   IF NOT FOUND:                                                          │
│       → Continue to AI provider                                          │
│       → Store response in cache                                          │
│       → Set TTL based on config                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

CACHE STORAGE OPTIONS:

┌─────────────────────────────────────────────────────────────────────────┐
│  Option 1: Local (In-Memory)                                            │
│  • Fastest, but not shared across instances                             │
│  • Good for single-server deployments                                   │
│                                                                          │
│  Option 2: Redis                                                        │
│  • Shared across all app instances                                      │
│  • Configurable TTL and eviction                                        │
│  • Recommended for production                                           │
│                                                                          │
│  Option 3: TokenTra Cloud Cache                                         │
│  • Managed by TokenTra                                                  │
│  • Shared across your organization                                      │
│  • Analytics and hit rate tracking                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Configuration

```typescript
const tokentra = new TokenTra({
  apiKey: process.env.TOKENTRA_API_KEY,
  
  caching: {
    enabled: true,
    
    // Cache backend
    backend: 'redis',  // 'memory' | 'redis' | 'tokentra'
    
    // Redis configuration (if backend: 'redis')
    redis: {
      url: process.env.REDIS_URL,
      prefix: 'tokentra:cache:'
    },
    
    // Time-to-live (in seconds)
    ttl: 3600,  // 1 hour
    
    // Maximum cache size (for memory backend)
    maxSize: 1000,
    
    // Only cache these methods
    methods: [
      'chat.completions.create',
      'completions.create',
      'embeddings.create'
    ],
    
    // Don't cache if temperature > 0 (non-deterministic)
    skipIfTemperatureAbove: 0,
    
    // Don't cache streaming responses
    skipStreaming: true
  }
});
```

---

## 10. Error Handling & Resilience

### 10.1 Error Types

```typescript
// sdk/errors/TokenTraError.ts

export class TokenTraError extends Error {
  constructor(
    public code: TokenTraErrorCode,
    message: string,
    public cause?: Error,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'TokenTraError';
  }
}

export type TokenTraErrorCode =
  // Authentication errors
  | 'INVALID_API_KEY'
  | 'KEY_EXPIRED'
  | 'KEY_REVOKED'
  | 'INSUFFICIENT_SCOPE'
  | 'IP_NOT_ALLOWED'
  
  // Rate limiting
  | 'RATE_LIMIT_EXCEEDED'
  
  // Configuration errors
  | 'INVALID_CONFIG'
  | 'UNSUPPORTED_PROVIDER'
  
  // Network errors
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  
  // Internal errors
  | 'INTERNAL_ERROR'
  | 'TELEMETRY_FAILED';
```

### 10.2 Graceful Degradation

```typescript
// sdk/core/TokenTraCore.ts (partial)

/**
 * Send telemetry with graceful degradation
 * NEVER blocks or throws - AI calls must always work
 */
async sendTelemetry(event: TelemetryEvent): Promise<void> {
  // Fire and forget - don't await in the main flow
  this.sendTelemetryAsync(event).catch(error => {
    // Log error but don't propagate
    this.logger.warn('Telemetry send failed, buffering', { 
      error: error.message 
    });
    
    // Buffer for retry
    this.resilience.bufferEvent(event);
    
    // Schedule retry
    this.scheduleBufferFlush();
  });
}
```

---

## 11. Privacy & Security

### 11.1 Privacy Modes

```
PRIVACY MODES
─────────────

MODE 1: METRICS ONLY (Default)
────────────────────────────────

What's collected:
✓ Token counts (input, output, cached)
✓ Model used
✓ Cost calculations
✓ Latency
✓ Attribution tags
✓ Success/error status

What's NOT collected:
✗ Prompt content
✗ Response content
✗ System prompts

Use case: Cost tracking without content exposure

───────────────────────────────────────────────────────────────────────────

MODE 2: HASHED CONTENT
──────────────────────

What's collected:
✓ Everything in Mode 1
✓ Hash of prompt (for deduplication detection)
✓ Hash of response (for caching)

What's NOT collected:
✗ Actual prompt text
✗ Actual response text

Use case: Caching and optimization without reading content

───────────────────────────────────────────────────────────────────────────

MODE 3: FULL LOGGING (Opt-in)
─────────────────────────────

What's collected:
✓ Everything in Mode 2
✓ Full prompt content (encrypted)
✓ Full response content (encrypted)
✓ System prompts (encrypted)

Requirements:
• Explicit opt-in in configuration
• Pro plan or higher
• Content encrypted with customer's key

Use case: Prompt optimization, debugging, compliance

───────────────────────────────────────────────────────────────────────────

MODE 4: SELF-HOSTED
───────────────────

• Customer runs TokenTra on their infrastructure
• No data leaves their network
• Full control over retention and access
• Enterprise plan only

Use case: Banks, healthcare, government, high-security
```

### 11.2 Privacy Configuration

```typescript
const tokentra = new TokenTra({
  apiKey: process.env.TOKENTRA_API_KEY,
  
  privacy: {
    // Privacy mode
    mode: 'metrics_only',  // 'metrics_only' | 'hashed' | 'full_logging'
    
    // For 'full_logging' mode: encryption key (customer-managed)
    encryptionKey: process.env.TOKENTRA_ENCRYPTION_KEY,
    
    // Redact sensitive patterns
    redact: {
      enabled: true,
      patterns: [
        // Email addresses
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        // Credit card numbers
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
        // SSN
        /\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g,
        // API keys
        /\b(sk|pk|api)[_-][a-zA-Z0-9]{20,}\b/gi
      ],
      replacement: '[REDACTED]'
    },
    
    // Never log content from these features
    excludeFeatures: ['support-chat', 'medical-assistant'],
    
    // Never log requests containing these keywords in system prompt
    excludeKeywords: ['confidential', 'pii', 'hipaa']
  }
});
```

---

## 12. Rate Limiting

### 12.1 SDK-Side Rate Limiting

```typescript
// sdk/core/RateLimiter.ts

export interface RateLimitConfig {
  // SDK-side limits (self-imposed)
  maxRequestsPerSecond: number;
  maxRequestsPerMinute: number;
  
  // Behavior when limit reached
  behavior: 'throw' | 'queue' | 'drop';
  
  // Queue settings (if behavior: 'queue')
  queueMaxSize: number;
  queueTimeoutMs: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private secondWindow: number[] = [];
  private minuteWindow: number[] = [];
  private queue: Array<{
    resolve: (value: void) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  
  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Process queue periodically
    setInterval(() => this.processQueue(), 100);
  }
  
  /**
   * Check rate limit and either proceed, queue, or throw
   */
  async checkLimit(): Promise<void> {
    const now = Date.now();
    
    // Clean old entries
    this.secondWindow = this.secondWindow.filter(t => now - t < 1000);
    this.minuteWindow = this.minuteWindow.filter(t => now - t < 60000);
    
    // Check limits
    const withinSecondLimit = 
      this.secondWindow.length < this.config.maxRequestsPerSecond;
    const withinMinuteLimit = 
      this.minuteWindow.length < this.config.maxRequestsPerMinute;
    
    if (withinSecondLimit && withinMinuteLimit) {
      // Proceed
      this.secondWindow.push(now);
      this.minuteWindow.push(now);
      return;
    }
    
    // Limit exceeded
    switch (this.config.behavior) {
      case 'throw':
        throw new TokenTraError(
          'RATE_LIMIT_EXCEEDED',
          'SDK rate limit exceeded. Try again later.',
          undefined,
          true
        );
        
      case 'queue':
        return this.enqueue();
        
      case 'drop':
        // Silently drop (for telemetry)
        return;
    }
  }
  
  private enqueue(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.config.queueMaxSize) {
        reject(new TokenTraError(
          'RATE_LIMIT_EXCEEDED',
          'Rate limit queue full',
          undefined,
          false
        ));
        return;
      }
      
      this.queue.push({
        resolve,
        reject,
        timestamp: Date.now()
      });
    });
  }
  
  private processQueue(): void {
    const now = Date.now();
    
    // Remove timed-out entries
    this.queue = this.queue.filter(entry => {
      if (now - entry.timestamp > this.config.queueTimeoutMs) {
        entry.reject(new TokenTraError(
          'TIMEOUT',
          'Rate limit queue timeout',
          undefined,
          true
        ));
        return false;
      }
      return true;
    });
    
    // Process queue if we have capacity
    while (this.queue.length > 0) {
      this.secondWindow = this.secondWindow.filter(t => now - t < 1000);
      this.minuteWindow = this.minuteWindow.filter(t => now - t < 60000);
      
      if (
        this.secondWindow.length < this.config.maxRequestsPerSecond &&
        this.minuteWindow.length < this.config.maxRequestsPerMinute
      ) {
        const entry = this.queue.shift()!;
        this.secondWindow.push(now);
        this.minuteWindow.push(now);
        entry.resolve();
      } else {
        break;
      }
    }
  }
}
```

---

## 13. Batch Processing

### 13.1 Telemetry Batching

```typescript
// sdk/core/TelemetryBatcher.ts

export interface BatchConfig {
  maxBatchSize: number;
  flushIntervalMs: number;
  maxRetries: number;
}

export class TelemetryBatcher {
  private config: BatchConfig;
  private batch: TelemetryEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;
  
  constructor(
    config: BatchConfig,
    private sendFn: (events: TelemetryEvent[]) => Promise<void>
  ) {
    this.config = config;
  }
  
  /**
   * Add event to batch
   */
  add(event: TelemetryEvent): void {
    this.batch.push(event);
    
    if (this.batch.length >= this.config.maxBatchSize) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(
        () => this.flush(),
        this.config.flushIntervalMs
      );
    }
  }
  
  /**
   * Force flush all pending events
   */
  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    
    if (this.batch.length === 0 || this.isFlushing) {
      return;
    }
    
    this.isFlushing = true;
    
    const eventsToSend = [...this.batch];
    this.batch = [];
    
    try {
      await this.sendFn(eventsToSend);
    } catch (error) {
      // Re-add to batch for retry
      this.batch.unshift(...eventsToSend);
    } finally {
      this.isFlushing = false;
    }
  }
  
  /**
   * Shutdown - flush remaining events
   */
  async shutdown(): Promise<void> {
    await this.flush();
  }
}
```

---

## 14. Configuration Reference

### 14.1 Complete Configuration Options

```typescript
// sdk/types/Config.ts

export interface TokenTraConfig {
  // Required
  apiKey: string;
  
  // API settings
  apiUrl?: string;           // Default: 'https://api.tokentra.com'
  timeout?: number;          // Default: 30000ms
  
  // Default attribution
  defaults?: {
    team?: string;
    project?: string;
    costCenter?: string;
    environment?: string;
    metadata?: Record<string, any>;
  };
  
  // Auto-detection
  autoDetection?: {
    enabled?: boolean;
    teamPatterns?: Record<string, string>;
    environmentVar?: string;
    featureFromCallStack?: boolean;
  };
  
  // Telemetry
  telemetry?: {
    enabled?: boolean;         // Default: true
    batchSize?: number;        // Default: 10
    flushIntervalMs?: number;  // Default: 5000
    maxRetries?: number;       // Default: 3
  };
  
  // Smart routing
  smartRouting?: {
    enabled?: boolean;         // Default: false
    threshold?: number;        // Default: 0.3
    routes?: Record<string, string>;
    exclude?: string[];
    safeguards?: {
      maxConversationLength?: number;
      maxInputTokens?: number;
      maxSystemPromptTokens?: number;
    };
    abTest?: {
      enabled?: boolean;
      percentage?: number;
    };
  };
  
  // Semantic caching
  caching?: {
    enabled?: boolean;         // Default: false
    backend?: 'memory' | 'redis' | 'tokentra';
    ttl?: number;              // Default: 3600
    maxSize?: number;          // Default: 1000
    redis?: {
      url: string;
      prefix?: string;
    };
    methods?: string[];
    skipIfTemperatureAbove?: number;
    skipStreaming?: boolean;
  };
  
  // Privacy
  privacy?: {
    mode?: 'metrics_only' | 'hashed' | 'full_logging';
    encryptionKey?: string;
    redact?: {
      enabled?: boolean;
      patterns?: RegExp[];
      replacement?: string;
    };
    excludeFeatures?: string[];
    excludeKeywords?: string[];
  };
  
  // Rate limiting
  rateLimit?: {
    maxRequestsPerSecond?: number;  // Default: 100
    maxRequestsPerMinute?: number;  // Default: 1000
    behavior?: 'throw' | 'queue' | 'drop';
    queueMaxSize?: number;
    queueTimeoutMs?: number;
  };
  
  // Resilience
  resilience?: {
    retry?: {
      maxAttempts?: number;
      initialDelayMs?: number;
      maxDelayMs?: number;
      backoffMultiplier?: number;
    };
    circuitBreaker?: {
      enabled?: boolean;
      failureThreshold?: number;
      recoveryTimeMs?: number;
      successThreshold?: number;
    };
    buffer?: {
      enabled?: boolean;
      maxSize?: number;
    };
  };
  
  // Logging
  logging?: {
    level?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
    logger?: Logger;
  };
  
  // Hooks
  hooks?: {
    beforeRequest?: (request: any) => any | Promise<any>;
    afterResponse?: (response: any) => any | Promise<any>;
    onError?: (error: Error) => void;
  };
}
```

### 14.2 Default Configuration

```typescript
export const DEFAULT_CONFIG: Partial<TokenTraConfig> = {
  apiUrl: 'https://api.tokentra.com',
  timeout: 30000,
  
  telemetry: {
    enabled: true,
    batchSize: 10,
    flushIntervalMs: 5000,
    maxRetries: 3
  },
  
  smartRouting: {
    enabled: false,
    threshold: 0.3
  },
  
  caching: {
    enabled: false,
    backend: 'memory',
    ttl: 3600,
    maxSize: 1000,
    skipIfTemperatureAbove: 0,
    skipStreaming: true
  },
  
  privacy: {
    mode: 'metrics_only'
  },
  
  rateLimit: {
    maxRequestsPerSecond: 100,
    maxRequestsPerMinute: 1000,
    behavior: 'throw'
  },
  
  resilience: {
    retry: {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2
    },
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      recoveryTimeMs: 30000,
      successThreshold: 3
    },
    buffer: {
      enabled: true,
      maxSize: 1000
    }
  },
  
  logging: {
    level: 'warn'
  }
};
```

---

## 15. Backend Ingestion API

### 15.1 API Specification

```typescript
// app/api/v1/sdk/ingest/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyValidationService } from '@/lib/services/ApiKeyValidationService';
import { UsageIngestionService } from '@/lib/services/UsageIngestionService';
import { AlertingService } from '@/lib/services/AlertingService';
import { BudgetService } from '@/lib/services/BudgetService';

const apiKeyService = new ApiKeyValidationService();
const ingestionService = new UsageIngestionService();
const alertingService = new AlertingService();
const budgetService = new BudgetService();

/**
 * POST /api/v1/sdk/ingest
 * 
 * Ingest telemetry events from SDK
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: 'INVALID_AUTH', message: 'Missing authorization header' } },
        { status: 401 }
      );
    }
    
    const apiKey = authHeader.substring(7);
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const validation = await apiKeyService.validateKey(
      apiKey, 
      ['write'], 
      clientIp
    );
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error!.statusCode }
      );
    }
    
    const { orgId } = validation.apiKey!;
    
    // 2. Parse request body
    const body = await request.json();
    const { events } = body;
    
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_PAYLOAD', message: 'Events array required' } },
        { status: 400 }
      );
    }
    
    // 3. Validate and enrich events
    const validatedEvents = [];
    const errors = [];
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const validationResult = validateTelemetryEvent(event);
      
      if (!validationResult.valid) {
        errors.push({ index: i, error: validationResult.error });
        continue;
      }
      
      // Enrich with org context
      validatedEvents.push({
        ...event,
        orgId,
        receivedAt: new Date().toISOString()
      });
    }
    
    if (validatedEvents.length === 0) {
      return NextResponse.json(
        { 
          error: { 
            code: 'ALL_EVENTS_INVALID', 
            message: 'No valid events', 
            details: errors 
          } 
        },
        { status: 400 }
      );
    }
    
    // 4. Ingest events
    const ingestionResult = await ingestionService.ingest(validatedEvents);
    
    // 5. Check alerts (async)
    alertingService.checkAlertsForEvents(orgId, validatedEvents).catch(err => {
      console.error('Alert check failed:', err);
    });
    
    // 6. Check budgets (async)
    budgetService.checkBudgetsForEvents(orgId, validatedEvents).catch(err => {
      console.error('Budget check failed:', err);
    });
    
    // 7. Return response
    return NextResponse.json({
      success: true,
      ingested: validatedEvents.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Ingestion error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

function validateTelemetryEvent(event: any): { valid: boolean; error?: string } {
  // Required fields
  if (!event.requestId) return { valid: false, error: 'requestId required' };
  if (!event.provider) return { valid: false, error: 'provider required' };
  if (!event.model) return { valid: false, error: 'model required' };
  if (!event.timestamp) return { valid: false, error: 'timestamp required' };
  if (event.latencyMs === undefined) {
    return { valid: false, error: 'latencyMs required' };
  }
  if (!event.status) return { valid: false, error: 'status required' };
  if (!event.usage) return { valid: false, error: 'usage required' };
  
  // Validate provider
  const validProviders = ['openai', 'anthropic', 'google', 'azure', 'aws'];
  if (!validProviders.includes(event.provider)) {
    return { valid: false, error: `Invalid provider: ${event.provider}` };
  }
  
  // Validate status
  const validStatuses = ['success', 'error', 'cache_hit'];
  if (!validStatuses.includes(event.status)) {
    return { valid: false, error: `Invalid status: ${event.status}` };
  }
  
  // Validate usage
  if (typeof event.usage.inputTokens !== 'number' || 
      event.usage.inputTokens < 0) {
    return { 
      valid: false, 
      error: 'usage.inputTokens must be a non-negative number' 
    };
  }
  if (typeof event.usage.outputTokens !== 'number' || 
      event.usage.outputTokens < 0) {
    return { 
      valid: false, 
      error: 'usage.outputTokens must be a non-negative number' 
    };
  }
  
  return { valid: true };
}
```

---

## 16. Database Schema

### 16.1 SDK Usage Records Table

```sql
-- ============================================
-- SDK USAGE RECORDS TABLE
-- ============================================
-- Stores raw usage records from SDK ingestion
-- Separate from provider-synced data

CREATE TABLE sdk_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  
  -- Provider & Model
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  original_model TEXT,  -- If smart routing changed it
  
  -- Timing
  timestamp TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Token Usage
  input_tokens BIGINT NOT NULL DEFAULT 0,
  output_tokens BIGINT NOT NULL DEFAULT 0,
  total_tokens BIGINT GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  cached_tokens BIGINT DEFAULT 0,
  cache_creation_tokens BIGINT DEFAULT 0,
  
  -- Cost
  input_cost DECIMAL(12, 8) DEFAULT 0,
  output_cost DECIMAL(12, 8) DEFAULT 0,
  total_cost DECIMAL(12, 8) DEFAULT 0,
  
  -- Performance
  latency_ms INTEGER NOT NULL,
  status TEXT NOT NULL,
  
  -- Attribution
  feature TEXT,
  team TEXT,
  project TEXT,
  cost_center TEXT,
  user_id TEXT,
  environment TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Flags
  is_streaming BOOLEAN DEFAULT FALSE,
  is_cached BOOLEAN DEFAULT FALSE,
  is_smart_routed BOOLEAN DEFAULT FALSE,
  
  -- Error Info
  error_type TEXT,
  error_message TEXT,
  
  -- Indexes for common queries
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioning by time
CREATE TABLE sdk_usage_records_y2025m01 PARTITION OF sdk_usage_records
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Indexes
CREATE INDEX idx_sdk_usage_org_time 
  ON sdk_usage_records(org_id, timestamp DESC);
CREATE INDEX idx_sdk_usage_model 
  ON sdk_usage_records(org_id, model, timestamp DESC);
CREATE INDEX idx_sdk_usage_feature 
  ON sdk_usage_records(org_id, feature, timestamp DESC);
CREATE INDEX idx_sdk_usage_team 
  ON sdk_usage_records(org_id, team, timestamp DESC);
CREATE INDEX idx_sdk_usage_user 
  ON sdk_usage_records(org_id, user_id, timestamp DESC);
CREATE INDEX idx_sdk_usage_status 
  ON sdk_usage_records(org_id, status, timestamp DESC);

-- Row Level Security
ALTER TABLE sdk_usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read SDK usage" ON sdk_usage_records
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- ============================================
-- SDK API KEYS EXTENSIONS
-- ============================================
-- Add SDK-specific fields to api_keys table

ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS
  sdk_version TEXT;  -- Track which SDK version is being used

ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS
  last_sdk_event_at TIMESTAMPTZ;  -- When last SDK event was received

ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS
  sdk_config JSONB DEFAULT '{}';  -- Cached SDK config for validation
```

---

## 17. TypeScript Types

### 17.1 Core Types

```typescript
// sdk/types/index.ts

export interface TokenTraOptions {
  feature?: string;
  team?: string;
  project?: string;
  costCenter?: string;
  userId?: string;
  environment?: string;
  metadata?: Record<string, any>;
}

export interface TelemetryEvent {
  requestId: string;
  orgId?: string;
  sdkVersion?: string;
  
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'aws';
  model: string;
  originalModel?: string;
  methodPath: string;
  
  timestamp: string;
  receivedAt?: string;
  latencyMs: number;
  
  status: 'success' | 'error' | 'cache_hit';
  error?: {
    type: string;
    message: string;
    code?: string | number;
  };
  
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedTokens?: number;
    cacheCreationTokens?: number;
  };
  
  cost?: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
    currency: 'USD';
  };
  
  attribution?: TokenTraOptions;
  
  isStreaming: boolean;
  cached?: boolean;
  smartRouted?: boolean;
  
  content?: {
    promptHash?: string;
    prompt?: string;
    response?: string;
  };
}
```

### 17.2 Pricing Table

```typescript
export interface PricingTable {
  [provider: string]: {
    [model: string]: {
      inputPer1k: number;
      outputPer1k: number;
      cachePer1k?: number;
    };
  };
}

export const PRICING: PricingTable = {
  openai: {
    'gpt-4': { inputPer1k: 0.03, outputPer1k: 0.06 },
    'gpt-4-turbo': { inputPer1k: 0.01, outputPer1k: 0.03 },
    'gpt-4o': { inputPer1k: 0.005, outputPer1k: 0.015 },
    'gpt-4o-mini': { inputPer1k: 0.00015, outputPer1k: 0.0006 },
    'gpt-3.5-turbo': { inputPer1k: 0.0005, outputPer1k: 0.0015 },
    'o1': { inputPer1k: 0.015, outputPer1k: 0.06 },
    'o1-mini': { inputPer1k: 0.003, outputPer1k: 0.012 }
  },
  anthropic: {
    'claude-3-opus-20240229': { 
      inputPer1k: 0.015, outputPer1k: 0.075, cachePer1k: 0.00375 
    },
    'claude-3-5-sonnet-20241022': { 
      inputPer1k: 0.003, outputPer1k: 0.015, cachePer1k: 0.0003 
    },
    'claude-3-5-haiku-20241022': { 
      inputPer1k: 0.001, outputPer1k: 0.005, cachePer1k: 0.0001 
    },
    'claude-3-sonnet-20240229': { 
      inputPer1k: 0.003, outputPer1k: 0.015 
    },
    'claude-3-haiku-20240307': { 
      inputPer1k: 0.00025, outputPer1k: 0.00125, cachePer1k: 0.00003 
    }
  },
  google: {
    'gemini-1.5-pro': { inputPer1k: 0.00125, outputPer1k: 0.005 },
    'gemini-1.5-flash': { inputPer1k: 0.000075, outputPer1k: 0.0003 },
    'gemini-1.0-pro': { inputPer1k: 0.0005, outputPer1k: 0.0015 }
  },
  azure: {
    // Same as OpenAI pricing
    'gpt-4': { inputPer1k: 0.03, outputPer1k: 0.06 },
    'gpt-4o': { inputPer1k: 0.005, outputPer1k: 0.015 },
    'gpt-4o-mini': { inputPer1k: 0.00015, outputPer1k: 0.0006 }
  },
  aws: {
    'anthropic.claude-3-opus': { inputPer1k: 0.015, outputPer1k: 0.075 },
    'anthropic.claude-3-sonnet': { inputPer1k: 0.003, outputPer1k: 0.015 },
    'anthropic.claude-3-haiku': { inputPer1k: 0.00025, outputPer1k: 0.00125 },
    'amazon.titan-text-express': { inputPer1k: 0.0002, outputPer1k: 0.0006 },
    'meta.llama3-70b': { inputPer1k: 0.00265, outputPer1k: 0.0035 }
  }
};
```

---

## 18. Node.js SDK Implementation

### 18.1 Main Entry Point

```typescript
// sdk/index.ts

import { TokenTraConfig, DEFAULT_CONFIG } from './types/Config';
import { TokenTraCore } from './core/TokenTraCore';
import { ProviderDetector } from './wrappers/ProviderDetector';
import { SDKEventEmitter, SDKEvent } from './events/EventEmitter';

export const SDK_VERSION = '1.0.0';

export class TokenTra {
  private core: TokenTraCore;
  private events: SDKEventEmitter;
  
  constructor(config: TokenTraConfig) {
    // Validate API key
    if (!config.apiKey) {
      throw new Error('TokenTra API key is required');
    }
    
    if (!config.apiKey.match(/^tt_(live|test)_[a-zA-Z0-9_-]{32,}$/)) {
      throw new Error(
        'Invalid TokenTra API key format. Expected: tt_live_xxx or tt_test_xxx'
      );
    }
    
    // Merge with defaults
    const fullConfig = this.mergeConfig(config);
    
    // Initialize core
    this.core = new TokenTraCore(fullConfig);
    this.events = new SDKEventEmitter();
    
    // Connect event emitter
    this.core.setEventEmitter(this.events);
    
    // Log initialization
    if (fullConfig.logging?.level !== 'silent') {
      console.log(`[TokenTra] Initialized SDK v${SDK_VERSION}`);
    }
  }
  
  /**
   * Wrap an AI client for tracking
   */
  wrap<T>(client: T): T {
    return ProviderDetector.wrap(client, this.core);
  }
  
  /**
   * Subscribe to SDK events
   */
  on(
    eventType: SDKEvent['type'], 
    callback: (event: SDKEvent) => void
  ): () => void {
    return this.events.on(eventType, callback);
  }
  
  /**
   * Flush pending telemetry
   */
  async flush(): Promise<void> {
    await this.core.flush();
  }
  
  /**
   * Shutdown SDK gracefully
   */
  async shutdown(): Promise<void> {
    await this.core.shutdown();
  }
  
  /**
   * Get SDK statistics
   */
  getStats(): {
    requestsTracked: number;
    telemetrySent: number;
    telemetryBuffered: number;
    cacheHits: number;
    cacheMisses: number;
    smartRoutes: number;
  } {
    return this.core.getStats();
  }
  
  /**
   * Update configuration at runtime
   */
  updateConfig(updates: Partial<TokenTraConfig>): void {
    this.core.updateConfig(updates);
  }
  
  private mergeConfig(config: TokenTraConfig): TokenTraConfig {
    return {
      ...DEFAULT_CONFIG,
      ...config,
      telemetry: { ...DEFAULT_CONFIG.telemetry, ...config.telemetry },
      smartRouting: { ...DEFAULT_CONFIG.smartRouting, ...config.smartRouting },
      caching: { ...DEFAULT_CONFIG.caching, ...config.caching },
      privacy: { ...DEFAULT_CONFIG.privacy, ...config.privacy },
      rateLimit: { ...DEFAULT_CONFIG.rateLimit, ...config.rateLimit },
      resilience: { 
        ...DEFAULT_CONFIG.resilience, 
        ...config.resilience,
        retry: { 
          ...DEFAULT_CONFIG.resilience?.retry, 
          ...config.resilience?.retry 
        },
        circuitBreaker: { 
          ...DEFAULT_CONFIG.resilience?.circuitBreaker, 
          ...config.resilience?.circuitBreaker 
        },
        buffer: { 
          ...DEFAULT_CONFIG.resilience?.buffer, 
          ...config.resilience?.buffer 
        }
      },
      logging: { ...DEFAULT_CONFIG.logging, ...config.logging }
    };
  }
}

// Named exports
export { TokenTraConfig } from './types/Config';
export { TokenTraOptions, TelemetryEvent } from './types';
export { TokenTraError, TokenTraErrorCode } from './errors/TokenTraError';

// Default export
export default TokenTra;
```

### 18.2 Package.json

```json
{
  "name": "@tokentra/sdk",
  "version": "1.0.0",
  "description": "TokenTra SDK for AI cost intelligence and usage tracking",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "ai", "llm", "cost", "tracking", "openai", 
    "anthropic", "finops", "optimization"
  ],
  "author": "TokenTra",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/tokentra/sdk-node"
  },
  "engines": {
    "node": ">=18"
  },
  "peerDependencies": {
    "openai": ">=4.0.0",
    "@anthropic-ai/sdk": ">=0.10.0"
  },
  "peerDependenciesMeta": {
    "openai": { "optional": true },
    "@anthropic-ai/sdk": { "optional": true }
  },
  "dependencies": {
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/uuid": "^9.0.7",
    "eslint": "^8.55.0",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3",
    "vitest": "^1.0.4"
  }
}
```

---

## 19. Python SDK Implementation

### 19.1 Main Module

```python
# tokentra/__init__.py

from .client import TokenTra
from .types import TokenTraConfig, TelemetryEvent, TokenTraOptions
from .errors import TokenTraError

__version__ = "1.0.0"
__all__ = [
    "TokenTra",
    "TokenTraConfig", 
    "TelemetryEvent",
    "TokenTraOptions",
    "TokenTraError"
]
```

### 19.2 Client Implementation

```python
# tokentra/client.py

import re
import uuid
import time
import threading
import queue
import logging
from typing import Any, Optional, Dict, Callable, TypeVar

T = TypeVar('T')
logger = logging.getLogger("tokentra")


class TokenTra:
    """
    TokenTra SDK for AI cost intelligence and usage tracking.
    
    Usage:
        tokentra = TokenTra(api_key="tt_live_xxx")
        openai = tokentra.wrap(OpenAI())
        
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[...],
            tokentra={"feature": "chat", "team": "product"}
        )
    """
    
    def __init__(self, api_key: str, **kwargs):
        """
        Initialize TokenTra SDK.
        
        Args:
            api_key: Your TokenTra API key (tt_live_xxx or tt_test_xxx)
            **kwargs: Additional configuration options
        """
        from .errors import TokenTraError
        
        # Validate API key
        if not api_key:
            raise TokenTraError("INVALID_API_KEY", "TokenTra API key is required")
        
        if not re.match(r'^tt_(live|test)_[a-zA-Z0-9_-]{32,}$', api_key):
            raise TokenTraError(
                "INVALID_API_KEY",
                "Invalid API key format. Expected: tt_live_xxx or tt_test_xxx"
            )
        
        self.api_key = api_key
        self.api_url = kwargs.get("api_url", "https://api.tokentra.com")
        self.timeout = kwargs.get("timeout", 30000)
        self.defaults = kwargs.get("defaults", {})
        
        # Initialize telemetry queue and worker
        self._telemetry_queue = queue.Queue()
        self._shutdown = threading.Event()
        self._worker = threading.Thread(
            target=self._telemetry_worker, 
            daemon=True
        )
        self._worker.start()
        
        # Statistics
        self._stats = {
            "requests_tracked": 0,
            "telemetry_sent": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "smart_routes": 0
        }
        
        logger.info(f"TokenTra SDK v{__version__} initialized")
    
    def wrap(self, client: T) -> T:
        """
        Wrap an AI client for tracking.
        
        Args:
            client: AI client instance (OpenAI, Anthropic, etc.)
            
        Returns:
            Wrapped client with tracking enabled
        """
        from .wrappers import OpenAIWrapper, AnthropicWrapper
        from .errors import TokenTraError
        
        client_type = type(client).__name__
        
        if "OpenAI" in client_type:
            return OpenAIWrapper(client, self)
        elif "Anthropic" in client_type:
            return AnthropicWrapper(client, self)
        else:
            raise TokenTraError(
                "UNSUPPORTED_PROVIDER",
                f"Unsupported client: {client_type}. "
                "Supported: OpenAI, Anthropic, Google, Azure, AWS"
            )
    
    def send_telemetry(self, event):
        """Queue telemetry event for sending."""
        self._stats["requests_tracked"] += 1
        self._telemetry_queue.put(event)
    
    def flush(self):
        """Flush pending telemetry."""
        self._telemetry_queue.join()
    
    def shutdown(self):
        """Shutdown SDK gracefully."""
        self._shutdown.set()
        self.flush()
        self._worker.join(timeout=5)
    
    def get_stats(self) -> Dict[str, int]:
        """Get SDK statistics."""
        return dict(self._stats)
    
    def generate_request_id(self) -> str:
        """Generate unique request ID."""
        return str(uuid.uuid4())
    
    def calculate_cost(
        self,
        model: str,
        usage: Dict[str, int],
        provider: str = "openai"
    ) -> Dict[str, float]:
        """Calculate cost for usage."""
        from .pricing import PRICING
        
        pricing = PRICING.get(provider, {}).get(model)
        if not pricing:
            return {"input_cost": 0, "output_cost": 0, "total_cost": 0}
        
        input_tokens = usage.get("prompt_tokens", 0)
        output_tokens = usage.get("completion_tokens", 0)
        cached_tokens = usage.get("cached_tokens", 0)
        
        regular_input = input_tokens - cached_tokens
        input_cost = (regular_input / 1000) * pricing["input_per_1k"]
        cached_cost = (cached_tokens / 1000) * pricing.get(
            "cache_per_1k", 
            pricing["input_per_1k"] * 0.1
        )
        output_cost = (output_tokens / 1000) * pricing["output_per_1k"]
        
        return {
            "input_cost": input_cost + cached_cost,
            "output_cost": output_cost,
            "total_cost": input_cost + cached_cost + output_cost
        }
    
    def _telemetry_worker(self):
        """Background worker for sending telemetry."""
        import requests
        
        batch = []
        last_flush = time.time()
        batch_size = 10
        flush_interval = 5  # seconds
        
        while not self._shutdown.is_set():
            try:
                event = self._telemetry_queue.get(timeout=0.1)
                batch.append(event)
                self._telemetry_queue.task_done()
            except queue.Empty:
                pass
            
            should_flush = (
                len(batch) >= batch_size or
                (batch and time.time() - last_flush >= flush_interval)
            )
            
            if should_flush and batch:
                self._send_batch(batch)
                batch = []
                last_flush = time.time()
        
        # Final flush
        if batch:
            self._send_batch(batch)
    
    def _send_batch(self, events: list):
        """Send telemetry batch to backend."""
        import requests
        
        try:
            response = requests.post(
                f"{self.api_url}/api/v1/sdk/ingest",
                json={"events": [e.to_dict() for e in events]},
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "X-SDK-Version": __version__
                },
                timeout=self.timeout / 1000
            )
            response.raise_for_status()
            self._stats["telemetry_sent"] += len(events)
        except Exception as e:
            logger.warning(f"Telemetry send failed: {e}")
```

### 19.3 pyproject.toml

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "tokentra"
version = "1.0.0"
description = "TokenTra SDK for AI cost intelligence and usage tracking"
readme = "README.md"
license = "MIT"
requires-python = ">=3.8"
authors = [
    { name = "TokenTra", email = "sdk@tokentra.com" }
]
keywords = [
    "ai", "llm", "cost", "tracking", "openai", 
    "anthropic", "finops", "optimization"
]
dependencies = [
    "requests>=2.28.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.0.0",
    "mypy>=1.0.0",
    "ruff>=0.1.0"
]
openai = ["openai>=1.0.0"]
anthropic = ["anthropic>=0.10.0"]
all = ["openai>=1.0.0", "anthropic>=0.10.0"]

[project.urls]
Homepage = "https://tokentra.com"
Documentation = "https://docs.tokentra.com/sdk/python"
Repository = "https://github.com/tokentra/sdk-python"

[tool.hatch.build.targets.wheel]
packages = ["tokentra"]
```

---

## 20. Integration with TokenTra Systems

### 20.1 System Integration Map

```
SDK INTEGRATION WITH TOKENTRA SYSTEMS
─────────────────────────────────────

SDK → Ingestion API → Backend Systems

┌─────────────────────────────────────────────────────────────────────────┐
│                          USAGE SYSTEM                                    │
│                                                                          │
│   SDK events are stored in:                                              │
│   • sdk_usage_records table (raw events)                                │
│   • usage_records table (aggregated, merged with provider sync)         │
│                                                                          │
│   SDK attribution maps to:                                               │
│   • team → team_id (lookup from teams table)                            │
│   • project → project_id (lookup from projects table)                   │
│   • cost_center → cost_center_id                                        │
│   • feature → feature column                                            │
│   • user_id → user_ids array                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          COST ANALYSIS SYSTEM                            │
│                                                                          │
│   SDK cost data feeds into:                                              │
│   • Real-time cost tracking                                             │
│   • Cost attribution by dimension                                       │
│   • Unit economics calculations                                         │
│                                                                          │
│   SDK provides:                                                          │
│   • Pre-calculated costs (input_cost, output_cost, total_cost)          │
│   • Token breakdown for verification                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          ALERTING ENGINE                                 │
│                                                                          │
│   SDK events trigger alert checks:                                      │
│   • Spend threshold alerts                                              │
│   • Usage spike detection                                               │
│   • Anomaly detection                                                   │
│   • Error rate alerts                                                   │
│                                                                          │
│   Attribution enables granular alerts:                                  │
│   • Per-feature alerts                                                  │
│   • Per-team alerts                                                     │
│   • Per-user alerts                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          BUDGET SYSTEM                                   │
│                                                                          │
│   SDK costs checked against:                                            │
│   • Team budgets                                                        │
│   • Project budgets                                                     │
│   • Cost center budgets                                                 │
│   • Feature budgets                                                     │
│                                                                          │
│   Enables:                                                               │
│   • Real-time budget tracking                                           │
│   • Budget threshold notifications                                      │
│   • Forecast accuracy improvement                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          OPTIMIZATION ENGINE                             │
│                                                                          │
│   SDK data enables:                                                     │
│   • Model usage patterns (which models for which tasks)                 │
│   • Token efficiency analysis                                           │
│   • Caching opportunity detection                                       │
│   • Smart routing effectiveness                                         │
│                                                                          │
│   SDK provides:                                                          │
│   • Original model vs routed model                                      │
│   • Cache hit/miss data                                                 │
│   • Prompt hashes for similarity detection                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          SETTINGS SYSTEM                                 │
│                                                                          │
│   API Key Management:                                                   │
│   • SDK uses API keys from settings                                     │
│   • Keys validated against api_keys table                               │
│   • Key scopes determine allowed operations                             │
│   • Key revocation immediately blocks SDK                               │
│                                                                          │
│   Configuration:                                                         │
│   • Privacy mode settings                                               │
│   • Data retention policies                                             │
│   • Feature flags for SDK features                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 21. Testing Guide

### 21.1 Unit Tests

```typescript
// sdk/__tests__/TokenTra.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TokenTra } from '../index';
import OpenAI from 'openai';

// Mock fetch
global.fetch = vi.fn();

describe('TokenTra SDK', () => {
  let tokentra: TokenTra;
  
  beforeEach(() => {
    vi.clearAllMocks();
    tokentra = new TokenTra({
      apiKey: 'tt_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
    });
  });
  
  afterEach(async () => {
    await tokentra.shutdown();
  });
  
  describe('initialization', () => {
    it('should initialize with valid API key', () => {
      expect(tokentra).toBeDefined();
    });
    
    it('should reject invalid API key format', () => {
      expect(() => new TokenTra({ apiKey: 'invalid' })).toThrow();
    });
    
    it('should reject missing API key', () => {
      expect(() => new TokenTra({ apiKey: '' })).toThrow();
    });
  });
  
  describe('wrap()', () => {
    it('should wrap OpenAI client', () => {
      const openai = new OpenAI({ apiKey: 'sk-test' });
      const wrapped = tokentra.wrap(openai);
      
      expect(wrapped).toBeDefined();
      expect(wrapped.chat).toBeDefined();
      expect(wrapped.chat.completions).toBeDefined();
    });
    
    it('should throw for unsupported clients', () => {
      expect(() => tokentra.wrap({} as any)).toThrow('Unsupported');
    });
  });
});
```

---

## 22. Troubleshooting

### 22.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `INVALID_API_KEY` | Wrong key format | Ensure key starts with `tt_live_` or `tt_test_` |
| `KEY_REVOKED` | Key was revoked | Generate new key in Settings |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Reduce request rate or upgrade plan |
| `NETWORK_ERROR` | Can't reach TokenTra API | Check firewall, proxy settings |
| No data in dashboard | Telemetry not sent | Check `tokentra.flush()` called |
| High latency | Sync telemetry | Ensure async mode enabled |
| Missing attribution | Tags not passed | Check `tokentra` option in request |

### 22.2 Debug Mode

```typescript
const tokentra = new TokenTra({
  apiKey: process.env.TOKENTRA_API_KEY,
  logging: {
    level: 'debug'  // 'debug' | 'info' | 'warn' | 'error' | 'silent'
  }
});

// Listen for all events
tokentra.on('request_start', (e) => console.log('Start:', e));
tokentra.on('request_complete', (e) => console.log('Complete:', e));
tokentra.on('telemetry_sent', (e) => console.log('Sent:', e));
tokentra.on('telemetry_failed', (e) => console.error('Failed:', e));
```

### 22.3 Health Check

```typescript
// Check SDK health
const stats = tokentra.getStats();
console.log('Requests tracked:', stats.requestsTracked);
console.log('Telemetry sent:', stats.telemetrySent);
console.log('Buffered:', stats.telemetryBuffered);

// If buffered > sent, there may be connectivity issues
if (stats.telemetryBuffered > stats.telemetrySent * 0.1) {
  console.warn('High buffer - check connectivity to TokenTra API');
}
```

---

## 23. Complete File Structure

```
sdk/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                    # Main entry point
│   ├── types/
│   │   ├── index.ts                # Type exports
│   │   ├── Config.ts               # Configuration types
│   │   └── TelemetryEvent.ts       # Event types
│   ├── core/
│   │   ├── TokenTraCore.ts         # Core engine
│   │   ├── TelemetryBatcher.ts     # Batch processing
│   │   ├── Resilience.ts           # Retry/circuit breaker
│   │   ├── RateLimiter.ts          # Rate limiting
│   │   └── AttributionResolver.ts  # Attribution handling
│   ├── wrappers/
│   │   ├── ProviderDetector.ts     # Auto-detect provider
│   │   ├── OpenAIWrapper.ts        # OpenAI wrapper
│   │   ├── AnthropicWrapper.ts     # Anthropic wrapper
│   │   ├── GoogleWrapper.ts        # Google wrapper
│   │   ├── AzureWrapper.ts         # Azure wrapper
│   │   └── AWSWrapper.ts           # AWS wrapper
│   ├── cache/
│   │   └── SemanticCache.ts        # Caching implementation
│   ├── routing/
│   │   └── ComplexityAnalyzer.ts   # Smart routing
│   ├── security/
│   │   └── ContentProcessor.ts     # Privacy handling
│   ├── events/
│   │   └── EventEmitter.ts         # Event system
│   ├── errors/
│   │   └── TokenTraError.ts        # Error types
│   └── pricing/
│       └── index.ts                # Pricing tables
├── __tests__/
│   ├── TokenTra.test.ts            # Unit tests
│   ├── integration.test.ts         # Integration tests
│   └── mocks/                      # Test mocks
└── dist/                           # Build output
```

---

*End of TokenTra SDK Specification*
