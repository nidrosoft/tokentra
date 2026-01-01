// Main SDK Class (v2)
export { TokenTra, SDK_VERSION } from "./TokenTra";
export { default } from "./TokenTra";

// Legacy Client (v1 - deprecated)
export { TokentraClient } from "./client";

// Core Engine
export { TokenTraCore } from "./core/TokenTraCore";

// Wrappers
export { wrapOpenAI, wrapAnthropic, wrapClient } from "./wrappers";

// Optimization
export {
  OptimizationClient,
  type OptimizationConfig,
  type RoutingRule,
  type RoutingCondition,
  type ModelMapping,
  type RoutingDecision,
  type RequestContext,
} from "./optimization";

// Legacy wrappers (for backwards compatibility)
export {
  wrapOpenAI as wrapOpenAILegacy,
  wrapAnthropic as wrapAnthropicLegacy,
  wrapGoogle,
  wrapAzureOpenAI,
  wrapBedrock,
  wrapCustom,
} from "./wrapper";

// Types
export type {
  TokentraConfig,
  TrackingEvent,
  TrackingContext,
  TokentraOptions,
  BatchResult,
  TrackResult,
  ApiResponse,
  HealthResponse,
  ProviderType,
  SDKStats,
  TelemetryPayload,
  OpenAIUsage,
  AnthropicUsage,
  GoogleUsage,
  AzureUsage,
  BedrockUsage,
} from "./types";

// Error types
export { TokentraError, type TokentraErrorCode } from "./types";
