/**
 * Provider Wrappers Index
 * Exports all provider wrappers and detection logic
 */

import { TokenTraCore } from "../core/TokenTraCore";
import { wrapOpenAI } from "./OpenAIWrapper";
import { wrapAnthropic } from "./AnthropicWrapper";

export { wrapOpenAI } from "./OpenAIWrapper";
export { wrapAnthropic } from "./AnthropicWrapper";

/**
 * Detect provider from client instance
 */
function detectProvider(client: unknown): string {
  const clientObj = client as Record<string, unknown>;
  
  // OpenAI SDK
  if (clientObj.chat && typeof clientObj.chat === "object") {
    const chat = clientObj.chat as Record<string, unknown>;
    if (chat.completions) {
      // Check if it's Azure OpenAI
      const options = clientObj._options as Record<string, string> | undefined;
      if (options?.baseURL?.includes("azure")) {
        return "azure";
      }
      return "openai";
    }
  }

  // Anthropic SDK
  if (clientObj.messages && typeof clientObj.messages === "object") {
    return "anthropic";
  }

  // Google Vertex AI / Generative AI
  if (typeof clientObj.generateContent === "function" || 
      typeof clientObj.getGenerativeModel === "function") {
    return "google";
  }

  // AWS Bedrock
  if (typeof clientObj.invokeModel === "function") {
    return "aws";
  }

  // Check constructor name as fallback
  const constructorName = (client as { constructor?: { name?: string } })?.constructor?.name;
  if (constructorName) {
    if (constructorName.includes("OpenAI")) return "openai";
    if (constructorName.includes("Anthropic")) return "anthropic";
    if (constructorName.includes("Bedrock")) return "aws";
    if (constructorName.includes("Vertex") || constructorName.includes("Google")) return "google";
  }

  return "unknown";
}

/**
 * Wrap any supported AI client
 */
export function wrapClient<T>(client: T, core: TokenTraCore): T {
  const provider = detectProvider(client);

  switch (provider) {
    case "openai":
    case "azure":
      return wrapOpenAI(client, core);

    case "anthropic":
      return wrapAnthropic(client, core);

    case "google":
      console.warn("[TokenTra] Google wrapper not yet implemented, returning unwrapped client");
      return client;

    case "aws":
      console.warn("[TokenTra] AWS Bedrock wrapper not yet implemented, returning unwrapped client");
      return client;

    default:
      throw new Error(
        `Unsupported AI client. TokenTra supports: OpenAI, Anthropic, Google Vertex, Azure OpenAI, AWS Bedrock`
      );
  }
}
