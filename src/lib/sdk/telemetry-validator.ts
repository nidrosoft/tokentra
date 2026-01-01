/**
 * Telemetry Event Validator
 * Validates and normalizes SDK telemetry events
 */

import { z } from "zod";

// Valid providers
const VALID_PROVIDERS = [
  "openai", "anthropic", "google", "azure", "aws",
  "xai", "deepseek", "mistral", "cohere", "groq"
] as const;

// Telemetry event schema
const telemetryEventSchema = z.object({
  // Required fields
  request_id: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
  provider: z.enum(VALID_PROVIDERS),
  model: z.string().min(1).max(100),
  
  // Token counts
  input_tokens: z.number().int().min(0),
  output_tokens: z.number().int().min(0),
  cached_tokens: z.number().int().min(0).optional().default(0),
  
  // Costs (optional - will be calculated if not provided)
  input_cost: z.number().min(0).optional(),
  output_cost: z.number().min(0).optional(),
  cached_cost: z.number().min(0).optional(),
  total_cost: z.number().min(0).optional(),
  
  // Performance
  latency_ms: z.number().int().min(0).optional().default(0),
  time_to_first_token_ms: z.number().int().min(0).optional(),
  
  // Attribution
  feature: z.string().max(100).optional(),
  team: z.string().max(100).optional(),
  project: z.string().max(100).optional(),
  cost_center: z.string().max(100).optional(),
  user_id: z.string().max(100).optional(),
  environment: z.enum(["production", "staging", "development", "test"]).optional(),
  metadata: z.record(z.unknown()).optional(),
  
  // Caching and routing
  was_cached: z.boolean().optional().default(false),
  cache_hit_type: z.enum(["exact", "semantic", "none"]).optional(),
  original_model: z.string().max(100).optional(),
  routed_by_rule: z.string().max(100).optional(),
  
  // Error tracking
  is_error: z.boolean().optional().default(false),
  error_code: z.string().max(100).optional(),
  error_type: z.enum(["rate_limit", "auth", "timeout", "server", "client", "unknown"]).optional(),
  error_message: z.string().max(1000).optional(),
  
  // Content hashes
  prompt_hash: z.string().max(64).optional(),
  
  // SDK metadata
  sdk_version: z.string().max(20).optional().default("1.0.0"),
  sdk_language: z.enum(["typescript", "javascript", "python", "go", "java", "ruby"]).optional().default("typescript"),
  
  // Streaming
  is_streaming: z.boolean().optional().default(false),
  method_path: z.string().max(100).optional(),
});

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;

export interface ValidationResult {
  valid: boolean;
  event?: TelemetryEvent;
  errors?: string[];
}

export interface BatchValidationResult {
  valid: ValidationResult[];
  invalid: Array<{ index: number; errors: string[] }>;
}

export class TelemetryEventValidator {
  /**
   * Validate a single telemetry event
   */
  static validate(event: unknown): ValidationResult {
    try {
      const parsed = telemetryEventSchema.parse(event);
      return { valid: true, event: parsed };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        };
      }
      return {
        valid: false,
        errors: ["Unknown validation error"],
      };
    }
  }

  /**
   * Validate a batch of telemetry events
   */
  static validateBatch(events: unknown[]): BatchValidationResult {
    const valid: ValidationResult[] = [];
    const invalid: Array<{ index: number; errors: string[] }> = [];

    events.forEach((event, index) => {
      const result = this.validate(event);
      if (result.valid) {
        valid.push(result);
      } else {
        invalid.push({ index, errors: result.errors || [] });
      }
    });

    return { valid, invalid };
  }

  /**
   * Normalize event data for database insertion
   */
  static normalize(event: TelemetryEvent): Record<string, unknown> {
    return {
      request_id: event.request_id || crypto.randomUUID(),
      timestamp: event.timestamp || new Date().toISOString(),
      provider: event.provider,
      model: event.model,
      method_path: event.method_path,
      input_tokens: event.input_tokens,
      output_tokens: event.output_tokens,
      cached_tokens: event.cached_tokens || 0,
      input_cost: event.input_cost || 0,
      output_cost: event.output_cost || 0,
      cached_cost: event.cached_cost || 0,
      latency_ms: event.latency_ms || 0,
      time_to_first_token_ms: event.time_to_first_token_ms,
      feature: event.feature,
      environment: event.environment || "production",
      metadata: event.metadata || {},
      was_cached: event.was_cached || false,
      cache_hit_type: event.cache_hit_type,
      original_model: event.original_model,
      routed_by_rule: event.routed_by_rule,
      is_error: event.is_error || false,
      error_code: event.error_code,
      error_type: event.error_type,
      error_message: event.error_message,
      prompt_hash: event.prompt_hash,
      sdk_version: event.sdk_version || "1.0.0",
      sdk_language: event.sdk_language || "typescript",
      is_streaming: event.is_streaming || false,
    };
  }
}
