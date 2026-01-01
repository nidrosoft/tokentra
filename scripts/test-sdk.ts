/**
 * SDK Integration Test Script
 * Run with: npx tsx --env-file=.env.local scripts/test-sdk.ts
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Test results tracking
const results: { name: string; passed: boolean; error?: string }[] = [];

function log(message: string) {
  console.log(`\x1b[36m[TEST]\x1b[0m ${message}`);
}

function pass(name: string) {
  console.log(`\x1b[32m✓ PASS:\x1b[0m ${name}`);
  results.push({ name, passed: true });
}

function fail(name: string, error: string) {
  console.log(`\x1b[31m✗ FAIL:\x1b[0m ${name}`);
  console.log(`  Error: ${error}`);
  results.push({ name, passed: false, error });
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

async function createTestApiKey(): Promise<{ key: string; id: string; orgId: string }> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const testOrgId = "b1c2d3e4-f5a6-7890-bcde-f12345678901";
  const testKey = `tt_test_${crypto.randomBytes(16).toString("hex")}`;
  const keyHash = hashKey(testKey);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      organization_id: testOrgId,
      name: "SDK Test Key - " + new Date().toISOString(),
      key_prefix: testKey.substring(0, 12),
      key_hash: keyHash,
      scopes: ["usage:write", "usage:read"],
      created_by: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create API key: ${error.message}`);

  return { key: testKey, id: data.id, orgId: testOrgId };
}

async function deleteTestApiKey(keyId: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  await supabase.from("api_keys").delete().eq("id", keyId);
}

// ============================================================================
// TEST CASES
// ============================================================================

async function testApiKeyValidation(apiKey: string) {
  log("Testing API Key Validation...");

  try {
    const { getApiKeyValidationService } = await import("../src/lib/sdk/api-key-validation-service");
    const validator = getApiKeyValidationService();

    // Test valid key
    const result = await validator.validateKey(apiKey);
    if (!result.valid) throw new Error("Valid key rejected");
    if (!result.apiKey?.orgId) throw new Error("Missing orgId");

    pass("API Key Validation - Valid Key");

    // Test invalid key
    const invalidResult = await validator.validateKey("tt_test_invalid_key_12345");
    if (invalidResult.valid) throw new Error("Invalid key accepted");

    pass("API Key Validation - Invalid Key Rejected");

    // Test rate limiting
    const rateLimit = validator.checkRateLimit(result.apiKey.id, {
      perMinute: 1000,
      perDay: 100000,
    });
    if (!rateLimit.allowed) throw new Error("Rate limit unexpectedly exceeded");

    pass("API Key Validation - Rate Limiting");
  } catch (error) {
    fail("API Key Validation", (error as Error).message);
  }
}

async function testTelemetryValidation() {
  log("Testing Telemetry Validation...");

  try {
    const { TelemetryEventValidator } = await import("../src/lib/sdk/telemetry-validator");

    // Test valid event
    const validEvent = {
      provider: "openai",
      model: "gpt-4o",
      input_tokens: 100,
      output_tokens: 50,
      latency_ms: 500,
    };

    const result = TelemetryEventValidator.validate(validEvent);
    if (!result.valid) throw new Error("Valid event rejected: " + JSON.stringify(result.errors));

    pass("Telemetry Validation - Valid Event");

    // Test invalid event
    const invalidEvent = {
      provider: "invalid_provider",
      model: "gpt-4o",
      input_tokens: -100,
      output_tokens: 50,
    };

    const invalidResult = TelemetryEventValidator.validate(invalidEvent);
    if (invalidResult.valid) throw new Error("Invalid event accepted");

    pass("Telemetry Validation - Invalid Event Rejected");

    // Test batch validation
    const batch = [
      { provider: "openai", model: "gpt-4o", input_tokens: 100, output_tokens: 50 },
      { provider: "anthropic", model: "claude-3-sonnet", input_tokens: 200, output_tokens: 100 },
      { provider: "invalid", model: "test", input_tokens: -1, output_tokens: 0 },
    ];

    const batchResult = TelemetryEventValidator.validateBatch(batch);
    if (batchResult.valid.length !== 2) throw new Error("Batch validation count wrong");
    if (batchResult.invalid.length !== 1) throw new Error("Invalid count wrong");

    pass("Telemetry Validation - Batch Processing");
  } catch (error) {
    fail("Telemetry Validation", (error as Error).message);
  }
}

async function testAttributionResolver(orgId: string) {
  log("Testing Attribution Resolver...");

  try {
    const { getAttributionResolver } = await import("../src/lib/sdk/attribution-resolver");
    const resolver = getAttributionResolver();

    // Test with UUID (should pass through)
    const result = await resolver.resolve(orgId, {
      team: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      feature: "test-feature",
    });

    if (result.team_id !== "a1b2c3d4-e5f6-7890-abcd-ef1234567890") {
      throw new Error("UUID not passed through");
    }
    if (result.feature !== "test-feature") {
      throw new Error("Feature not preserved");
    }

    pass("Attribution Resolver - UUID Pass-through");

    // Test default environment
    const emptyResult = await resolver.resolve(orgId, {});
    if (emptyResult.environment !== "production") {
      throw new Error("Default environment not set");
    }

    pass("Attribution Resolver - Default Values");
  } catch (error) {
    fail("Attribution Resolver", (error as Error).message);
  }
}

async function testIngestApi(apiKey: string) {
  log("Testing Ingest API...");

  try {
    // Test valid batch
    const response = await fetch(`${BASE_URL}/api/v1/sdk/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
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

    if (response.status !== 200) throw new Error(`Status ${response.status}: ${JSON.stringify(data)}`);
    if (!data.success) throw new Error("Success flag not set");
    if (data.processed !== 1) throw new Error("Processed count wrong");

    pass("Ingest API - Valid Batch");

    // Test rate limit headers
    const rateLimitHeader = response.headers.get("X-RateLimit-Remaining-Minute");
    if (!rateLimitHeader) throw new Error("Rate limit headers missing");

    pass("Ingest API - Rate Limit Headers");

    // Test without auth
    const noAuthResponse = await fetch(`${BASE_URL}/api/v1/sdk/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [{ provider: "openai", model: "gpt-4o", input_tokens: 100, output_tokens: 50 }],
      }),
    });

    if (noAuthResponse.status !== 401) throw new Error("Should reject without auth");

    pass("Ingest API - Auth Required");

    // Test empty batch
    const emptyResponse = await fetch(`${BASE_URL}/api/v1/sdk/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ events: [] }),
    });

    if (emptyResponse.status !== 400) throw new Error("Should reject empty batch");

    pass("Ingest API - Empty Batch Rejected");
  } catch (error) {
    fail("Ingest API", (error as Error).message);
  }
}

async function testConfigApi(apiKey: string) {
  log("Testing Config API...");

  try {
    const response = await fetch(`${BASE_URL}/api/v1/sdk/config`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await response.json();

    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    if (!data.features) throw new Error("Missing features");
    if (!data.rateLimits) throw new Error("Missing rateLimits");

    pass("Config API - Returns Configuration");
  } catch (error) {
    fail("Config API", (error as Error).message);
  }
}

async function testOptimizationConfigApi(apiKey: string) {
  log("Testing Optimization Config API...");

  try {
    const response = await fetch(`${BASE_URL}/api/v1/sdk/optimization/config`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await response.json();

    if (response.status !== 200) throw new Error(`Status ${response.status}`);
    if (data.enabled === undefined) throw new Error("Missing enabled flag");
    if (data.routingRules === undefined) throw new Error("Missing routingRules");
    if (!Array.isArray(data.routingRules)) throw new Error("routingRules not array");

    pass("Optimization Config API - Returns Configuration");
  } catch (error) {
    fail("Optimization Config API", (error as Error).message);
  }
}

async function testOptimizationClient() {
  log("Testing Optimization Client...");

  try {
    const { OptimizationClient } = await import("../sdk/typescript/src/optimization/OptimizationClient");

    const client = new OptimizationClient("tt_test_key", BASE_URL);

    // Test task detection (without server, should return no routing)
    const decision = await client.getRoutingDecision({
      model: "gpt-4o",
      provider: "openai",
      messages: [{ role: "user", content: "Hello, how are you?" }],
    });

    if (decision.originalModel !== "gpt-4o") throw new Error("Original model not preserved");
    if (decision.shouldRoute !== false) throw new Error("Should not route without config");

    pass("Optimization Client - Default Behavior");

    // Test cache clearing
    client.clearCache();

    pass("Optimization Client - Cache Management");
  } catch (error) {
    fail("Optimization Client", (error as Error).message);
  }
}

async function testEventProcessor() {
  log("Testing Event Processor...");

  try {
    const { getSDKEventProcessor } = await import("../src/lib/sdk/sdk-event-processor");
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
    await processor.processEvents(events);

    pass("Event Processor - Processes Events");
  } catch (error) {
    fail("Event Processor", (error as Error).message);
  }
}

async function testDatabaseTables() {
  log("Testing Database Tables...");

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Check routing_rules table
    const { error: routingError } = await supabase.from("routing_rules").select("id").limit(1);
    if (routingError) throw new Error(`routing_rules: ${routingError.message}`);

    pass("Database - routing_rules table exists");

    // Check semantic_cache table
    const { error: cacheError } = await supabase.from("semantic_cache").select("id").limit(1);
    if (cacheError) throw new Error(`semantic_cache: ${cacheError.message}`);

    pass("Database - semantic_cache table exists");

    // Check optimization_metrics table
    const { error: metricsError } = await supabase.from("optimization_metrics").select("id").limit(1);
    if (metricsError) throw new Error(`optimization_metrics: ${metricsError.message}`);

    pass("Database - optimization_metrics table exists");

    // Check sdk_usage_records table
    const { error: usageError } = await supabase.from("sdk_usage_records").select("id").limit(1);
    if (usageError) throw new Error(`sdk_usage_records: ${usageError.message}`);

    pass("Database - sdk_usage_records table exists");
  } catch (error) {
    fail("Database Tables", (error as Error).message);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("\n\x1b[1m========================================\x1b[0m");
  console.log("\x1b[1m   TokenTra SDK Integration Tests\x1b[0m");
  console.log("\x1b[1m========================================\x1b[0m\n");

  let testApiKey: { key: string; id: string; orgId: string } | null = null;

  try {
    // Create test API key
    log("Creating test API key...");
    testApiKey = await createTestApiKey();
    log(`Test API key created: ${testApiKey.key.substring(0, 15)}...`);

    // Run tests
    await testDatabaseTables();
    await testApiKeyValidation(testApiKey.key);
    await testTelemetryValidation();
    await testAttributionResolver(testApiKey.orgId);
    await testIngestApi(testApiKey.key);
    await testConfigApi(testApiKey.key);
    await testOptimizationConfigApi(testApiKey.key);
    await testOptimizationClient();
    await testEventProcessor();
  } catch (error) {
    console.error("\x1b[31mTest setup failed:\x1b[0m", error);
  } finally {
    // Cleanup
    if (testApiKey) {
      log("Cleaning up test API key...");
      await deleteTestApiKey(testApiKey.id);
    }
  }

  // Summary
  console.log("\n\x1b[1m========================================\x1b[0m");
  console.log("\x1b[1m   Test Results Summary\x1b[0m");
  console.log("\x1b[1m========================================\x1b[0m\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);
  console.log(`Total:  ${results.length}`);

  if (failed > 0) {
    console.log("\n\x1b[31mFailed Tests:\x1b[0m");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log("\n\x1b[32m✓ All tests passed!\x1b[0m\n");
    process.exit(0);
  }
}

main();
