/**
 * SDK Services Index
 * Exports all SDK-related services
 */

export {
  ApiKeyValidationService,
  getApiKeyValidationService,
  type ValidatedApiKey,
  type ValidationResult,
  type RateLimitResult,
} from "./api-key-validation-service";

export {
  AttributionResolver,
  getAttributionResolver,
  type AttributionInput,
  type ResolvedAttribution,
} from "./attribution-resolver";

export {
  TelemetryEventValidator,
  type TelemetryEvent,
  type ValidationResult as TelemetryValidationResult,
  type BatchValidationResult,
} from "./telemetry-validator";

export {
  SDKEventProcessor,
  getSDKEventProcessor,
} from "./sdk-event-processor";
