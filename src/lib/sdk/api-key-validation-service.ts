/**
 * API Key Validation Service
 * Validates SDK API keys with caching and rate limiting
 */

import crypto from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface ValidatedApiKey {
  id: string;
  orgId: string;
  userId?: string;
  scopes: string[];
  rateLimits: {
    perMinute: number;
    perDay: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
  apiKey?: ValidatedApiKey;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: {
    minute: number;
    day: number;
  };
  resetAt: {
    minute: Date;
    day: Date;
  };
}

// In-memory cache for API key validation (simple implementation)
// In production, use Redis for distributed caching
const validationCache = new Map<string, { key: ValidatedApiKey; expiresAt: number }>();
const rateLimitCache = new Map<string, { minute: number; day: number; minuteReset: number; dayReset: number }>();

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const DEFAULT_RATE_LIMIT_PER_MINUTE = 1000;
const DEFAULT_RATE_LIMIT_PER_DAY = 100000;

export class ApiKeyValidationService {
  private supabase: SupabaseClient | null = null;

  private getSupabase(): SupabaseClient {
    if (!this.supabase) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!url || !key) {
        console.error("[API Key Validation] Missing Supabase credentials:", { url: !!url, key: !!key });
        throw new Error("Supabase credentials not configured");
      }
      
      this.supabase = createClient(url, key);
    }
    return this.supabase;
  }

  /**
   * Hash an API key using SHA-256
   */
  private hashKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex");
  }

  /**
   * Validate API key format
   */
  private isValidFormat(key: string): boolean {
    // Accept both tt_ prefix (enterprise) and tk_ prefix (current)
    return /^(tt|tk)_(live|test)_[a-zA-Z0-9_-]{10,}$/.test(key);
  }

  /**
   * Get cached validation result
   */
  private getCachedValidation(keyHash: string): ValidatedApiKey | null {
    const cached = validationCache.get(keyHash);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.key;
    }
    if (cached) {
      validationCache.delete(keyHash);
    }
    return null;
  }

  /**
   * Cache validation result
   */
  private cacheValidation(keyHash: string, key: ValidatedApiKey): void {
    validationCache.set(keyHash, {
      key,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  /**
   * Validate an API key
   */
  async validateKey(
    key: string,
    requiredScopes: string[] = []
  ): Promise<ValidationResult> {
    // 1. Basic format validation
    if (!key || key.length < 10) {
      return {
        valid: false,
        error: {
          code: "INVALID_KEY_FORMAT",
          message: "API key format is invalid",
          statusCode: 401,
        },
      };
    }

    // 2. Compute hash
    const keyHash = this.hashKey(key);

    // 3. Check cache first
    const cached = this.getCachedValidation(keyHash);
    if (cached) {
      // Verify scopes
      if (requiredScopes.length > 0) {
        const hasScopes = requiredScopes.every(
          (scope) => cached.scopes.includes(scope) || cached.scopes.includes("admin")
        );
        if (!hasScopes) {
          return {
            valid: false,
            error: {
              code: "INSUFFICIENT_SCOPE",
              message: `API key missing required scopes: ${requiredScopes.join(", ")}`,
              statusCode: 403,
            },
          };
        }
      }
      return { valid: true, apiKey: cached };
    }

    // 4. Look up in database
    const { data: apiKey, error } = await this.getSupabase()
      .from("api_keys")
      .select("id, organization_id, scopes, expires_at, revoked_at")
      .eq("key_hash", keyHash)
      .single();

    if (error || !apiKey) {
      return {
        valid: false,
        error: {
          code: "INVALID_KEY",
          message: "API key not found",
          statusCode: 401,
        },
      };
    }

    // 5. Check if revoked
    if (apiKey.revoked_at) {
      return {
        valid: false,
        error: {
          code: "KEY_REVOKED",
          message: "API key has been revoked",
          statusCode: 401,
        },
      };
    }

    // 6. Check if expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return {
        valid: false,
        error: {
          code: "KEY_EXPIRED",
          message: "API key has expired",
          statusCode: 401,
        },
      };
    }

    // 7. Check scopes
    const scopes = apiKey.scopes || ["usage:write", "usage:read"];
    if (requiredScopes.length > 0) {
      const hasScopes = requiredScopes.every(
        (scope) => scopes.includes(scope) || scopes.includes("admin")
      );
      if (!hasScopes) {
        return {
          valid: false,
          error: {
            code: "INSUFFICIENT_SCOPE",
            message: `API key missing required scopes: ${requiredScopes.join(", ")}`,
            statusCode: 403,
          },
        };
      }
    }

    // 8. Build validated key object
    const validatedKey: ValidatedApiKey = {
      id: apiKey.id,
      orgId: apiKey.organization_id,
      userId: undefined,
      scopes,
      rateLimits: {
        perMinute: DEFAULT_RATE_LIMIT_PER_MINUTE,
        perDay: DEFAULT_RATE_LIMIT_PER_DAY,
      },
    };

    // 9. Cache the validated key
    this.cacheValidation(keyHash, validatedKey);

    // 10. Update usage stats (async, non-blocking)
    this.updateUsageStats(apiKey.id).catch((err) => {
      console.error("Failed to update API key usage stats:", err);
    });

    return { valid: true, apiKey: validatedKey };
  }

  /**
   * Check rate limits
   */
  checkRateLimit(keyId: string, limits: { perMinute: number; perDay: number }): RateLimitResult {
    const now = Date.now();
    const minuteWindow = Math.floor(now / 60000);
    const dayWindow = Math.floor(now / 86400000);
    const cacheKey = keyId;

    let state = rateLimitCache.get(cacheKey);

    // Reset counters if windows have changed
    if (!state || state.minuteReset !== minuteWindow) {
      state = {
        minute: 0,
        day: state?.dayReset === dayWindow ? state.day : 0,
        minuteReset: minuteWindow,
        dayReset: dayWindow,
      };
    }

    if (state.dayReset !== dayWindow) {
      state.day = 0;
      state.dayReset = dayWindow;
    }

    // Check limits
    const minuteRemaining = Math.max(0, limits.perMinute - state.minute);
    const dayRemaining = Math.max(0, limits.perDay - state.day);

    if (state.minute >= limits.perMinute || state.day >= limits.perDay) {
      return {
        allowed: false,
        remaining: { minute: minuteRemaining, day: dayRemaining },
        resetAt: {
          minute: new Date((minuteWindow + 1) * 60000),
          day: new Date((dayWindow + 1) * 86400000),
        },
      };
    }

    // Increment counters
    state.minute++;
    state.day++;
    rateLimitCache.set(cacheKey, state);

    return {
      allowed: true,
      remaining: {
        minute: Math.max(0, limits.perMinute - state.minute),
        day: Math.max(0, limits.perDay - state.day),
      },
      resetAt: {
        minute: new Date((minuteWindow + 1) * 60000),
        day: new Date((dayWindow + 1) * 86400000),
      },
    };
  }

  /**
   * Update usage statistics
   */
  private async updateUsageStats(keyId: string): Promise<void> {
    await this.getSupabase()
      .from("api_keys")
      .update({
        last_used_at: new Date().toISOString(),
      })
      .eq("id", keyId);
  }

  /**
   * Invalidate cached key (call when key is revoked)
   */
  invalidateKey(keyHash: string): void {
    validationCache.delete(keyHash);
  }
}

// Singleton instance
let instance: ApiKeyValidationService | null = null;

export function getApiKeyValidationService(): ApiKeyValidationService {
  // Always create a new instance to ensure env vars are loaded
  // In production, use a proper singleton with lazy initialization
  return new ApiKeyValidationService();
}
