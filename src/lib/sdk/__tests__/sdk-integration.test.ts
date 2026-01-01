/**
 * SDK Integration Tests
 * Tests the complete SDK flow: API key validation, telemetry ingestion, optimization
 */

import crypto from "crypto";

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};

// Helper to create SHA-256 hash
function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// Helper to generate test API key
function generateTestApiKey(): string {
  const random = crypto.randomBytes(16).toString("hex");
  return `tt_test_${random}`;
}

describe("SDK Integration Tests", () => {
  let testApiKey: string;
  let testApiKeyId: string;
  let testOrgId: string;

  beforeAll(async () => {
    // Use demo org for testing
    testOrgId = "b1c2d3e4-f5a6-7890-bcde-f12345678901";
    
    // Generate a test API key
    testApiKey = generateTestApiKey();
    const keyHash = hashKey(testApiKey);

    // Create test API key in database
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);

    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        organization_id: testOrgId,
        name: "SDK Integration Test Key",
        key_prefix: testApiKey.substring(0, 12),
        key_hash: keyHash,
        scopes: ["usage:write", "usage:read"],
        created_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create test API key:", error);
      throw error;
    }

    testApiKeyId = data.id;
    console.log(`Created test API key: ${testApiKey.substring(0, 15)}...`);
  });

  afterAll(async () => {
    // Clean up test API key
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);

    await supabase.from("api_keys").delete().eq("id", testApiKeyId);
    console.log("Cleaned up test API key");
  });

  describe("API Key Validation", () => {
    it("should validate a valid API key", async () => {
      const { getApiKeyValidationService } = await import("../api-key-validation-service");
      const validator = getApiKeyValidationService();

      const result = await validator.validateKey(testApiKey);

      expect(result.valid).toBe(true);
      expect(result.apiKey).toBeDefined();
      expect(result.apiKey?.orgId).toBe(testOrgId);
    });

    it("should reject an invalid API key", async () => {
      const { getApiKeyValidationService } = await import("../api-key-validation-service");
      const validator = getApiKeyValidationService();

      const result = await validator.validateKey("tt_test_invalid_key_12345");

      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe("INVALID_KEY");
    });

    it("should check rate limits", async () => {
      const { getApiKeyValidationService } = await import("../api-key-validation-service");
      const validator = getApiKeyValidationService();

      const validation = await validator.validateKey(testApiKey);
      expect(validation.valid).toBe(true);

      const rateLimit = validator.checkRateLimit(validation.apiKey!.id, {
        perMinute: 1000,
        perDay: 100000,
      });

      expect(rateLimit.allowed).toBe(true);
      expect(rateLimit.remaining.minute).toBeLessThanOrEqual(1000);
    });
  });

  describe("Telemetry Validation", () => {
    it("should validate a valid telemetry event", async () => {
      const { TelemetryEventValidator } = await import("../telemetry-validator");

      const event = {
        provider: "openai",
        model: "gpt-4o",
        input_tokens: 100,
        output_tokens: 50,
        latency_ms: 500,
        feature: "test-feature",
      };

      const result = TelemetryEventValidator.validate(event);

      expect(result.valid).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.event?.provider).toBe("openai");
    });

    it("should reject invalid telemetry events", async () => {
      const { TelemetryEventValidator } = await import("../telemetry-validator");

      const event = {
        provider: "invalid_provider",
        model: "gpt-4o",
        input_tokens: -100, // Invalid negative tokens
        output_tokens: 50,
      };

      const result = TelemetryEventValidator.validate(event);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it("should validate batch of events", async () => {
      const { TelemetryEventValidator } = await import("../telemetry-validator");

      const events = [
        { provider: "openai", model: "gpt-4o", input_tokens: 100, output_tokens: 50 },
        { provider: "anthropic", model: "claude-3-sonnet", input_tokens: 200, output_tokens: 100 },
        { provider: "invalid", model: "test", input_tokens: -1, output_tokens: 0 }, // Invalid
      ];

      const result = TelemetryEventValidator.validateBatch(events);

      expect(result.valid.length).toBe(2);
      expect(result.invalid.length).toBe(1);
      expect(result.invalid[0].index).toBe(2);
    });
  });

  describe("Attribution Resolver", () => {
    it("should resolve team name to ID", async () => {
      const { getAttributionResolver } = await import("../attribution-resolver");
      const resolver = getAttributionResolver();

      // Test with a UUID (should pass through)
      const result = await resolver.resolve(testOrgId, {
        team: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        feature: "test-feature",
      });

      expect(result.team_id).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
      expect(result.feature).toBe("test-feature");
    });

    it("should handle missing attribution gracefully", async () => {
      const { getAttributionResolver } = await import("../attribution-resolver");
      const resolver = getAttributionResolver();

      const result = await resolver.resolve(testOrgId, {});

      expect(result.environment).toBe("production");
      expect(result.team_id).toBeUndefined();
    });
  });

  describe("SDK Ingest API", () => {
    it("should accept valid telemetry batch", async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/v1/sdk/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testApiKey}`,
        },
        body: JSON.stringify({
          events: [
            {
              provider: "openai",
              model: "gpt-4o-mini",
              input_tokens: 150,
              output_tokens: 75,
              latency_ms: 450,
              feature: "sdk-test",
              environment: "test",
            },
          ],
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.processed).toBe(1);
    });

    it("should reject requests without auth", async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/v1/sdk/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: [{ provider: "openai", model: "gpt-4o", input_tokens: 100, output_tokens: 50 }],
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should reject empty batch", async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/v1/sdk/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testApiKey}`,
        },
        body: JSON.stringify({ events: [] }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("EMPTY_BATCH");
    });

    it("should return rate limit headers", async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/v1/sdk/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testApiKey}`,
        },
        body: JSON.stringify({
          events: [{ provider: "openai", model: "gpt-4o", input_tokens: 100, output_tokens: 50 }],
        }),
      });

      expect(response.headers.get("X-RateLimit-Remaining-Minute")).toBeDefined();
      expect(response.headers.get("X-RateLimit-Remaining-Day")).toBeDefined();
    });
  });

  describe("SDK Config API", () => {
    it("should return SDK configuration", async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/v1/sdk/config`, {
        headers: {
          Authorization: `Bearer ${testApiKey}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.features).toBeDefined();
      expect(data.rateLimits).toBeDefined();
      expect(data.telemetry).toBeDefined();
    });
  });

  describe("Optimization Config API", () => {
    it("should return optimization configuration", async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/v1/sdk/optimization/config`, {
        headers: {
          Authorization: `Bearer ${testApiKey}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enabled).toBeDefined();
      expect(data.enableRouting).toBeDefined();
      expect(data.routingRules).toBeDefined();
      expect(Array.isArray(data.routingRules)).toBe(true);
    });
  });
});

describe("SDK Event Processor", () => {
  it("should process events without errors", async () => {
    const { getSDKEventProcessor } = await import("../sdk-event-processor");
    const processor = getSDKEventProcessor();

    const events = [
      {
        org_id: "b1c2d3e4-f5a6-7890-bcde-f12345678901",
        request_id: crypto.randomUUID(),
        provider: "openai",
        model: "gpt-4o",
        input_tokens: 100,
        output_tokens: 50,
        input_cost: 0.00025,
        output_cost: 0.0005,
        is_error: false,
        timestamp: new Date().toISOString(),
      },
    ];

    // Should not throw
    await expect(processor.processEvents(events)).resolves.not.toThrow();
  });
});
