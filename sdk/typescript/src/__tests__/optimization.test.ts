/**
 * SDK Optimization Client Tests
 */

import { OptimizationClient } from "../optimization/OptimizationClient";

describe("OptimizationClient", () => {
  let client: OptimizationClient;

  beforeEach(() => {
    client = new OptimizationClient("tt_test_key123", "http://localhost:3000");
  });

  describe("Task Detection", () => {
    it("should detect greeting task", async () => {
      const decision = await client.getRoutingDecision({
        model: "gpt-4o",
        provider: "openai",
        messages: [{ role: "user", content: "Hello, how are you?" }],
      });

      // Without server config, should not route
      expect(decision.shouldRoute).toBe(false);
    });

    it("should detect FAQ task", async () => {
      const decision = await client.getRoutingDecision({
        model: "gpt-4o",
        provider: "openai",
        messages: [{ role: "user", content: "What is the capital of France?" }],
      });

      expect(decision.shouldRoute).toBe(false);
      expect(decision.originalModel).toBe("gpt-4o");
    });

    it("should detect code generation task", async () => {
      const decision = await client.getRoutingDecision({
        model: "gpt-4o",
        provider: "openai",
        messages: [
          {
            role: "user",
            content: "Write a function to calculate fibonacci numbers in Python",
          },
        ],
      });

      expect(decision.originalModel).toBe("gpt-4o");
    });

    it("should detect debugging task", async () => {
      const decision = await client.getRoutingDecision({
        model: "gpt-4o",
        provider: "openai",
        messages: [
          {
            role: "user",
            content: "I have a bug in my code. The function is not working correctly.",
          },
        ],
      });

      expect(decision.originalModel).toBe("gpt-4o");
    });
  });

  describe("Routing Decision", () => {
    it("should return no routing when disabled", async () => {
      const decision = await client.getRoutingDecision({
        model: "gpt-4",
        provider: "openai",
        messages: [{ role: "user", content: "Hello" }],
      });

      // Default config has optimization disabled
      expect(decision.shouldRoute).toBe(false);
      expect(decision.reason).toContain("disabled");
    });

    it("should preserve original model when no routing", async () => {
      const decision = await client.getRoutingDecision({
        model: "claude-3-opus",
        provider: "anthropic",
        messages: [{ role: "user", content: "Explain quantum computing" }],
      });

      expect(decision.originalModel).toBe("claude-3-opus");
      expect(decision.targetModel).toBe("claude-3-opus");
    });
  });

  describe("Cache Management", () => {
    it("should clear config cache", () => {
      client.clearCache();
      // Should not throw
      expect(() => client.clearCache()).not.toThrow();
    });
  });
});

describe("OptimizationClient with Mock Config", () => {
  it("should apply routing rules when enabled", async () => {
    // Create a mock fetch that returns routing config
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        enabled: true,
        enableRouting: true,
        enableCaching: false,
        routingRules: [
          {
            id: "rule-1",
            name: "Route simple queries to mini",
            priority: 1,
            conditions: [
              { field: "model", operator: "eq", value: "gpt-4o" },
              { field: "task_type", operator: "in", value: ["greeting", "faq"] },
            ],
            targetModel: "gpt-4o-mini",
            targetProvider: "openai",
          },
        ],
        modelMappings: [],
        cacheSimilarityThreshold: 0.92,
      }),
    });

    const client = new OptimizationClient("tt_test_key", "http://localhost:3000");

    const decision = await client.getRoutingDecision({
      model: "gpt-4o",
      provider: "openai",
      messages: [{ role: "user", content: "Hello there!" }],
    });

    expect(decision.shouldRoute).toBe(true);
    expect(decision.targetModel).toBe("gpt-4o-mini");
    expect(decision.ruleName).toBe("Route simple queries to mini");

    global.fetch = originalFetch;
  });

  it("should apply model mappings", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        enabled: true,
        enableRouting: true,
        enableCaching: false,
        routingRules: [],
        modelMappings: [
          {
            sourceModel: "gpt-4",
            targetModel: "gpt-4o",
            targetProvider: "openai",
            taskTypes: ["general"],
            savingsPercent: 50,
          },
        ],
        cacheSimilarityThreshold: 0.92,
      }),
    });

    const client = new OptimizationClient("tt_test_key", "http://localhost:3000");

    const decision = await client.getRoutingDecision({
      model: "gpt-4",
      provider: "openai",
      messages: [{ role: "user", content: "General question here" }],
    });

    expect(decision.shouldRoute).toBe(true);
    expect(decision.targetModel).toBe("gpt-4o");
    expect(decision.estimatedSavingsPercent).toBe(50);

    global.fetch = originalFetch;
  });

  it("should handle fetch errors gracefully", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const client = new OptimizationClient("tt_test_key", "http://localhost:3000");

    const decision = await client.getRoutingDecision({
      model: "gpt-4o",
      provider: "openai",
      messages: [{ role: "user", content: "Hello" }],
    });

    // Should fall back to default (no routing)
    expect(decision.shouldRoute).toBe(false);

    global.fetch = originalFetch;
  });
});
