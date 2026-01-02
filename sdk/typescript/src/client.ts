import type {
  TokentraConfig,
  TrackingEvent,
  TrackingContext,
  BatchResult,
  TrackResult,
  ApiResponse,
  HealthResponse,
} from "./types";

type RequiredConfig = Required<Omit<TokentraConfig, "onError">> & Pick<TokentraConfig, "onError">;

export class TokentraClient {
  private config: RequiredConfig;
  private queue: TrackingEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private defaultContext: TrackingContext = {};

  constructor(config: TokentraConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || "https://api.tokentra.ai",
      timeout: config.timeout || 30000,
      batchSize: config.batchSize || 100,
      flushInterval: config.flushInterval || 5000,
      maxQueueSize: config.maxQueueSize || 1000,
      debug: config.debug || false,
      onError: config.onError,
      defaults: config.defaults || {},
      resilience: config.resilience || {
        maxRetries: 3,
        retryDelayMs: 1000,
        circuitBreakerThreshold: 5,
        circuitBreakerResetMs: 30000,
      },
      privacy: config.privacy || {
        mode: "metrics_only",
        redactPatterns: [],
      },
      optimization: config.optimization || {
        enabled: false,
        enableRouting: false,
        enableCaching: false,
      },
    };

    this.startFlushTimer();
    this.log("TokentraClient initialized");
  }

  /**
   * Set default context that will be applied to all events
   */
  setContext(context: TrackingContext): void {
    this.defaultContext = { ...this.defaultContext, ...context };
    this.log("Context updated", this.defaultContext);
  }

  /**
   * Clear the default context
   */
  clearContext(): void {
    this.defaultContext = {};
    this.log("Context cleared");
  }

  /**
   * Track a single AI usage event
   */
  async track(event: TrackingEvent, context?: TrackingContext): Promise<void> {
    const enrichedEvent: TrackingEvent = {
      ...this.defaultContext,
      ...event,
      ...context,
      timestamp: event.timestamp || new Date(),
      metadata: {
        ...this.defaultContext.metadata,
        ...event.metadata,
        ...context?.metadata,
      },
    };

    this.queue.push(enrichedEvent);
    this.log("Event queued", { provider: event.provider, model: event.model, queueSize: this.queue.length });

    if (this.queue.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Track a single event immediately (bypasses batching)
   */
  async trackImmediate(event: TrackingEvent, context?: TrackingContext): Promise<TrackResult> {
    const enrichedEvent: TrackingEvent = {
      ...this.defaultContext,
      ...event,
      ...context,
      timestamp: event.timestamp || new Date(),
      metadata: {
        ...this.defaultContext.metadata,
        ...event.metadata,
        ...context?.metadata,
      },
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/sdk/v1/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ event: enrichedEvent }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      const result: ApiResponse<TrackResult> = await response.json();

      if (!result.success) {
        this.handleError(new Error(result.error?.message || "Track failed"));
        return { success: false, error: result.error?.message };
      }

      return result.data || { success: true };
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error("Unknown error"));
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Flush all queued events to the server
   */
  async flush(): Promise<BatchResult> {
    if (this.queue.length === 0) {
      return { success: true, processed: 0, failed: 0 };
    }

    const events = [...this.queue];
    this.queue = [];

    this.log(`Flushing ${events.length} events`);

    try {
      const response = await fetch(`${this.config.baseUrl}/sdk/v1/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ events }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      const result: ApiResponse<BatchResult> = await response.json();

      if (!result.success) {
        this.queue.unshift(...events);
        this.handleError(new Error(result.error?.message || "Batch failed"));
        return {
          success: false,
          processed: 0,
          failed: events.length,
          errors: [result.error?.message || "Unknown error"],
        };
      }

      this.log(`Flush complete: ${events.length} events processed`);
      return result.data || { success: true, processed: events.length, failed: 0 };
    } catch (error) {
      this.queue.unshift(...events);
      this.handleError(error instanceof Error ? error : new Error("Unknown error"));
      return {
        success: false,
        processed: 0,
        failed: events.length,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Check the health of the Tokentra API
   */
  async health(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/sdk/health`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      return await response.json();
    } catch (error) {
      return {
        status: "unhealthy",
        version: "unknown",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get the current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Gracefully shutdown the client
   */
  async shutdown(): Promise<void> {
    this.log("Shutting down...");
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
    this.log("Shutdown complete");
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch((error) => this.handleError(error));
    }, this.config.flushInterval);
  }

  private handleError(error: Error): void {
    this.log("Error:", error.message);
    if (this.config.onError) {
      this.config.onError(error);
    }
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log("[Tokentra]", ...args);
    }
  }
}
