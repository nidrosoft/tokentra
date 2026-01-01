/**
 * TokenTraCore - Core engine for SDK telemetry
 * Handles batching, circuit breaker, retry, and telemetry transmission
 */

import { EventEmitter } from "events";
import {
  TokentraConfig,
  TrackingEvent,
  TelemetryPayload,
  SDKStats,
  TokentraError,
} from "../types";

const SDK_VERSION = "2.0.0";
const SDK_LANGUAGE = "typescript";

interface CircuitBreakerState {
  state: "closed" | "open" | "half-open";
  failures: number;
  lastFailure: number;
  successesSinceHalfOpen: number;
}

export class TokenTraCore extends EventEmitter {
  private config: Required<TokentraConfig>;
  private queue: TelemetryPayload[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private circuitBreaker: CircuitBreakerState;
  private stats: SDKStats;
  private isShuttingDown = false;

  constructor(config: TokentraConfig) {
    super();
    
    // Validate API key
    if (!config.apiKey) {
      throw new TokentraError(
        "INVALID_API_KEY",
        "TokenTra API key is required"
      );
    }

    // Merge with defaults
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || "https://api.tokentra.com",
      timeout: config.timeout || 30000,
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 5000,
      maxQueueSize: config.maxQueueSize || 1000,
      debug: config.debug || false,
      onError: config.onError || (() => {}),
      defaults: config.defaults || {},
      resilience: {
        maxRetries: config.resilience?.maxRetries ?? 3,
        retryDelayMs: config.resilience?.retryDelayMs ?? 1000,
        circuitBreakerThreshold: config.resilience?.circuitBreakerThreshold ?? 5,
        circuitBreakerResetMs: config.resilience?.circuitBreakerResetMs ?? 30000,
      },
      privacy: {
        mode: config.privacy?.mode || "metrics_only",
        redactPatterns: config.privacy?.redactPatterns || [],
      },
    };

    // Initialize circuit breaker
    this.circuitBreaker = {
      state: "closed",
      failures: 0,
      lastFailure: 0,
      successesSinceHalfOpen: 0,
    };

    // Initialize stats
    this.stats = {
      requestsTracked: 0,
      telemetrySent: 0,
      telemetryFailed: 0,
      telemetryBuffered: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      circuitBreakerState: "closed",
    };

    // Start flush timer
    this.startFlushTimer();

    this.log("TokenTraCore initialized");
  }

  /**
   * Queue a telemetry event for sending
   */
  queueEvent(event: TrackingEvent): void {
    if (this.isShuttingDown) {
      this.log("SDK is shutting down, dropping event");
      return;
    }

    const payload = this.eventToPayload(event);

    // Check queue size
    if (this.queue.length >= this.config.maxQueueSize) {
      this.log("Queue full, dropping oldest event");
      this.queue.shift();
    }

    this.queue.push(payload);
    this.stats.requestsTracked++;
    this.stats.telemetryBuffered = this.queue.length;

    this.emit("event_queued", payload);

    // Flush if batch size reached
    if (this.queue.length >= this.config.batchSize) {
      this.flush().catch((err) => this.handleError(err));
    }
  }

  /**
   * Flush all queued events
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    // Check circuit breaker
    if (!this.canSend()) {
      this.log("Circuit breaker open, buffering events");
      return;
    }

    const batch = this.queue.splice(0, this.config.batchSize);
    this.stats.telemetryBuffered = this.queue.length;

    try {
      await this.sendBatchWithRetry(batch);
      this.onSendSuccess();
      this.stats.telemetrySent += batch.length;
      this.emit("telemetry_sent", { count: batch.length });
    } catch (error) {
      this.onSendFailure();
      this.stats.telemetryFailed += batch.length;
      // Put events back in queue for retry
      this.queue.unshift(...batch);
      this.stats.telemetryBuffered = this.queue.length;
      this.emit("telemetry_failed", { count: batch.length, error });
      throw error;
    }
  }

  /**
   * Send batch with retry logic
   */
  private async sendBatchWithRetry(batch: TelemetryPayload[]): Promise<void> {
    const maxRetries = this.config.resilience.maxRetries ?? 3;
    const retryDelayMs = this.config.resilience.retryDelayMs ?? 1000;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.sendBatch(batch);
        return;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on non-retryable errors
        if (error instanceof TokentraError && !error.retryable) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay = retryDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
          this.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Send batch to backend
   */
  private async sendBatch(batch: TelemetryPayload[]): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/sdk/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          "X-SDK-Version": SDK_VERSION,
          "X-SDK-Language": SDK_LANGUAGE,
        },
        body: JSON.stringify({ events: batch }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const error = new TokentraError(
          errorBody.error?.code || "TELEMETRY_FAILED",
          errorBody.error?.message || `HTTP ${response.status}`,
          undefined,
          response.status >= 500 || response.status === 429
        );
        throw error;
      }

      this.log(`Sent ${batch.length} events successfully`);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if ((error as Error).name === "AbortError") {
        throw new TokentraError("TIMEOUT", "Request timed out", error as Error, true);
      }
      
      if (error instanceof TokentraError) {
        throw error;
      }
      
      throw new TokentraError(
        "NETWORK_ERROR",
        (error as Error).message,
        error as Error,
        true
      );
    }
  }

  /**
   * Check if circuit breaker allows sending
   */
  private canSend(): boolean {
    const circuitBreakerResetMs = this.config.resilience.circuitBreakerResetMs ?? 30000;
    const now = Date.now();

    switch (this.circuitBreaker.state) {
      case "closed":
        return true;

      case "open":
        if (now - this.circuitBreaker.lastFailure >= circuitBreakerResetMs) {
          this.circuitBreaker.state = "half-open";
          this.circuitBreaker.successesSinceHalfOpen = 0;
          this.stats.circuitBreakerState = "half-open";
          this.log("Circuit breaker: open -> half-open");
          return true;
        }
        return false;

      case "half-open":
        return true;

      default:
        return true;
    }
  }

  /**
   * Handle successful send
   */
  private onSendSuccess(): void {
    if (this.circuitBreaker.state === "half-open") {
      this.circuitBreaker.successesSinceHalfOpen++;
      if (this.circuitBreaker.successesSinceHalfOpen >= 3) {
        this.circuitBreaker.state = "closed";
        this.circuitBreaker.failures = 0;
        this.stats.circuitBreakerState = "closed";
        this.log("Circuit breaker: half-open -> closed");
      }
    } else if (this.circuitBreaker.state === "closed") {
      this.circuitBreaker.failures = 0;
    }
  }

  /**
   * Handle send failure
   */
  private onSendFailure(): void {
    const circuitBreakerThreshold = this.config.resilience.circuitBreakerThreshold ?? 5;
    
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();
    this.stats.errors++;

    if (this.circuitBreaker.state === "half-open") {
      this.circuitBreaker.state = "open";
      this.stats.circuitBreakerState = "open";
      this.log("Circuit breaker: half-open -> open");
    } else if (
      this.circuitBreaker.state === "closed" &&
      this.circuitBreaker.failures >= circuitBreakerThreshold
    ) {
      this.circuitBreaker.state = "open";
      this.stats.circuitBreakerState = "open";
      this.log("Circuit breaker: closed -> open");
    }
  }

  /**
   * Convert TrackingEvent to TelemetryPayload
   */
  private eventToPayload(event: TrackingEvent): TelemetryPayload {
    const defaults = this.config.defaults;
    
    return {
      request_id: event.requestId || crypto.randomUUID(),
      timestamp: (event.timestamp || new Date()).toISOString(),
      provider: event.provider,
      model: event.model,
      input_tokens: event.inputTokens,
      output_tokens: event.outputTokens,
      cached_tokens: event.cachedTokens,
      input_cost: event.inputCost,
      output_cost: event.outputCost,
      total_cost: event.cost,
      latency_ms: event.latencyMs || 0,
      time_to_first_token_ms: event.timeToFirstTokenMs,
      feature: event.feature || defaults.feature,
      team: event.team || defaults.team,
      project: event.project || defaults.project,
      cost_center: event.costCenter || defaults.costCenter,
      user_id: event.userId,
      environment: event.environment || defaults.environment || "production",
      metadata: event.metadata,
      method_path: event.methodPath,
      is_streaming: event.isStreaming,
      is_error: event.isError,
      error_code: event.errorCode,
      error_type: event.errorType,
      error_message: event.errorMessage,
      was_cached: event.wasCached,
      cache_hit_type: event.cacheHitType,
      original_model: event.originalModel,
      routed_by_rule: event.routedByRule,
      prompt_hash: event.promptHash,
      sdk_version: SDK_VERSION,
      sdk_language: SDK_LANGUAGE,
    };
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) return;
    
    this.flushTimer = setInterval(() => {
      this.flush().catch((err) => this.handleError(err));
    }, this.config.flushInterval);
  }

  /**
   * Stop the flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.log(`Error: ${error.message}`);
    this.config.onError(error);
    this.emit("error", error);
  }

  /**
   * Log debug messages
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[TokenTra] ${message}`);
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get SDK statistics
   */
  getStats(): SDKStats {
    return { ...this.stats };
  }

  /**
   * Get current configuration
   */
  getConfig(): TokentraConfig {
    return { ...this.config };
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(updates: Partial<TokentraConfig>): void {
    Object.assign(this.config, updates);
    
    // Restart flush timer if interval changed
    if (updates.flushInterval) {
      this.stopFlushTimer();
      this.startFlushTimer();
    }
  }

  /**
   * Shutdown the SDK gracefully
   */
  async shutdown(): Promise<void> {
    this.log("Shutting down...");
    this.isShuttingDown = true;
    this.stopFlushTimer();

    // Final flush
    try {
      while (this.queue.length > 0) {
        await this.flush();
      }
    } catch (error) {
      this.log(`Final flush failed: ${(error as Error).message}`);
    }

    this.log("Shutdown complete");
    this.emit("shutdown");
  }

  /**
   * Generate a unique request ID
   */
  generateRequestId(): string {
    return crypto.randomUUID();
  }
}
