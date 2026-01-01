/**
 * TokenTra SDK - Main Class
 * Enterprise-grade AI cost tracking and usage monitoring with smart routing
 */

import { EventEmitter } from "events";
import { TokenTraCore } from "./core/TokenTraCore";
import { wrapClient, wrapOpenAI, wrapAnthropic } from "./wrappers";
import { OptimizationClient, type RoutingDecision } from "./optimization";
import {
  TokentraConfig,
  TrackingEvent,
  TrackingContext,
  SDKStats,
  TokentraError,
} from "./types";

export const SDK_VERSION = "2.0.0";

/**
 * TokenTra SDK
 *
 * @example
 * ```typescript
 * import { TokenTra } from '@tokentra/sdk';
 * import OpenAI from 'openai';
 *
 * const tokentra = new TokenTra({
 *   apiKey: process.env.TOKENTRA_API_KEY
 * });
 *
 * const openai = tokentra.wrap(new OpenAI());
 *
 * const response = await openai.chat.completions.create({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * }, {
 *   tokentra: { feature: 'chat', team: 'product' }
 * });
 * ```
 */
export class TokenTra extends EventEmitter {
  private core: TokenTraCore;
  private optimizer: OptimizationClient;
  private defaultContext: TrackingContext = {};
  private optimizationEnabled: boolean;

  constructor(config: TokentraConfig) {
    super();

    // Validate required config
    if (!config.apiKey) {
      throw new TokentraError(
        "INVALID_API_KEY",
        "TokenTra API key is required. Get one at https://tokentra.com/settings/api-keys"
      );
    }

    // Initialize core engine
    this.core = new TokenTraCore(config);

    // Initialize optimization client
    const baseUrl = config.baseUrl || "https://api.tokentra.com";
    this.optimizer = new OptimizationClient(config.apiKey, baseUrl);
    this.optimizationEnabled = config.optimization?.enabled !== false;

    // Forward core events
    this.core.on("event_queued", (e) => this.emit("event_queued", e));
    this.core.on("telemetry_sent", (e) => this.emit("telemetry_sent", e));
    this.core.on("telemetry_failed", (e) => this.emit("telemetry_failed", e));
    this.core.on("error", (e) => this.emit("error", e));
    this.core.on("shutdown", () => this.emit("shutdown"));
  }

  /**
   * Wrap an AI client for automatic tracking
   *
   * @param client - AI provider client (OpenAI, Anthropic, etc.)
   * @returns Wrapped client with identical API
   */
  wrap<T>(client: T): T {
    return wrapClient(client, this.core);
  }

  /**
   * Wrap an OpenAI client specifically
   */
  wrapOpenAI<T>(client: T): T {
    return wrapOpenAI(client, this.core);
  }

  /**
   * Wrap an Anthropic client specifically
   */
  wrapAnthropic<T>(client: T): T {
    return wrapAnthropic(client, this.core);
  }

  /**
   * Set default context for all events
   */
  setContext(context: TrackingContext): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }

  /**
   * Clear default context
   */
  clearContext(): void {
    this.defaultContext = {};
  }

  /**
   * Manually track a request (for custom integrations)
   */
  track(event: TrackingEvent): void {
    const enrichedEvent: TrackingEvent = {
      ...this.defaultContext,
      ...event,
      metadata: {
        ...this.defaultContext.metadata,
        ...event.metadata,
      },
    };

    this.core.queueEvent(enrichedEvent);
  }

  /**
   * Flush pending telemetry immediately
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
  getStats(): SDKStats {
    return this.core.getStats();
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(updates: Partial<TokentraConfig>): void {
    this.core.updateConfig(updates);
  }

  /**
   * Get current configuration
   */
  getConfig(): TokentraConfig {
    return this.core.getConfig();
  }

  /**
   * Get routing decision for a request (for advanced use cases)
   */
  async getRoutingDecision(
    model: string,
    provider: string,
    messages: Array<{ role: string; content: string }>,
    options?: { feature?: string; team?: string }
  ): Promise<RoutingDecision> {
    if (!this.optimizationEnabled) {
      return {
        shouldRoute: false,
        originalModel: model,
        targetModel: model,
        targetProvider: provider,
        reason: "Optimization disabled",
        estimatedSavingsPercent: 0,
      };
    }

    return this.optimizer.getRoutingDecision({
      model,
      provider,
      messages,
      feature: options?.feature,
      team: options?.team,
    });
  }

  /**
   * Get the optimization client (for advanced use cases)
   */
  getOptimizer(): OptimizationClient {
    return this.optimizer;
  }

  /**
   * Check if optimization is enabled
   */
  isOptimizationEnabled(): boolean {
    return this.optimizationEnabled;
  }

  /**
   * Enable or disable optimization at runtime
   */
  setOptimizationEnabled(enabled: boolean): void {
    this.optimizationEnabled = enabled;
  }
}

export default TokenTra;
