import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { AzureProvider } from "./azure";
import { GoogleProvider } from "./google";
import { AWSProvider } from "./aws";
import { BaseProvider } from "./base";
import type { ProviderType, ProviderCredentials } from "./types";

export function createProvider(
  type: ProviderType,
  credentials: ProviderCredentials
): BaseProvider {
  switch (type) {
    case "openai":
      return new OpenAIProvider(credentials);
    case "anthropic":
      return new AnthropicProvider(credentials);
    case "azure":
      return new AzureProvider(credentials);
    case "google":
      return new GoogleProvider(credentials);
    case "aws":
      return new AWSProvider(credentials);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

export { OpenAIProvider, AnthropicProvider, AzureProvider, GoogleProvider, AWSProvider };
export { BaseProvider };
export type { ProviderType, ProviderCredentials };
