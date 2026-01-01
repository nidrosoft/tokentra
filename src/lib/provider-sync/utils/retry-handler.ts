/**
 * Retry Handler - Exponential Backoff with Jitter
 * 
 * Handles retries for failed API calls with intelligent backoff
 * and error classification.
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};

// Error codes that should trigger a retry
const RETRYABLE_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
]);

// HTTP status codes that should trigger a retry
const RETRYABLE_STATUS_CODES = new Set([
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
]);

// Error messages that indicate retryable conditions
const RETRYABLE_MESSAGES = [
  'rate limit',
  'too many requests',
  'temporarily unavailable',
  'service unavailable',
  'internal server error',
  'timeout',
  'connection reset',
  'socket hang up',
  'network error',
];

export class RetryHandler {
  private options: Required<Omit<RetryOptions, 'onRetry'>> & { onRetry?: RetryOptions['onRetry'] };

  constructor(options: RetryOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  /**
   * Execute an operation with automatic retry on failure
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (!this.isRetryable(error)) {
          throw error;
        }

        // Don't retry if we've exhausted attempts
        if (attempt >= this.options.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt, error);

        // Notify callback if provided
        if (this.options.onRetry) {
          this.options.onRetry(attempt + 1, lastError, delay);
        }

        console.log(
          `[RetryHandler] ${context} failed (attempt ${attempt + 1}/${this.options.maxRetries}), ` +
          `retrying in ${delay}ms: ${lastError.message}`
        );

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Check if an error is retryable
   */
  isRetryable(error: unknown): boolean {
    if (!error) return false;

    const err = error as Record<string, unknown>;

    // Check error code (network errors)
    if (typeof err.code === 'string' && RETRYABLE_ERROR_CODES.has(err.code)) {
      return true;
    }

    // Check HTTP status code
    const status = err.status || err.statusCode;
    if (typeof status === 'number' && RETRYABLE_STATUS_CODES.has(status)) {
      return true;
    }

    // Check error message
    const message = (err.message || '').toString().toLowerCase();
    if (RETRYABLE_MESSAGES.some((m) => message.includes(m))) {
      return true;
    }

    // Check for response status in nested objects
    const response = err.response as Record<string, unknown> | undefined;
    if (response && typeof response.status === 'number') {
      if (RETRYABLE_STATUS_CODES.has(response.status)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate delay for next retry attempt
   */
  private calculateDelay(attempt: number, error: unknown): number {
    // Check for Retry-After header
    const err = error as Record<string, unknown>;
    const headers = (err.headers || (err.response as Record<string, unknown>)?.headers) as Record<string, string> | undefined;
    
    if (headers?.['retry-after']) {
      const retryAfter = parseInt(headers['retry-after'], 10);
      if (!isNaN(retryAfter)) {
        // Retry-After can be in seconds
        return Math.min(retryAfter * 1000, this.options.maxDelayMs);
      }
    }

    // Exponential backoff: baseDelay * 2^attempt
    const exponentialDelay = this.options.baseDelayMs * Math.pow(2, attempt);

    // Add jitter (random 0-1000ms) to prevent thundering herd
    const jitter = Math.random() * 1000;

    return Math.min(exponentialDelay + jitter, this.options.maxDelayMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let retryHandlerInstance: RetryHandler | null = null;

export function getRetryHandler(): RetryHandler {
  if (!retryHandlerInstance) {
    retryHandlerInstance = new RetryHandler();
  }
  return retryHandlerInstance;
}

/**
 * Convenience function to wrap an operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  context?: string,
  options?: RetryOptions
): Promise<T> {
  const handler = options ? new RetryHandler(options) : getRetryHandler();
  return handler.withRetry(operation, context);
}
