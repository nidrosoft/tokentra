/**
 * Provider Adapters Index
 * 
 * Re-exports all provider adapters and provides a factory function.
 * Supports 10 major AI providers.
 */

import type { ProviderType, ProviderAdapter } from '../types';
import { OpenAIAdapter } from './openai-adapter';
import { AnthropicAdapter } from './anthropic-adapter';
import { GoogleAdapter } from './google-adapter';
import { AzureAdapter } from './azure-adapter';
import { AWSAdapter } from './aws-adapter';
import { XAIAdapter } from './xai-adapter';
import { DeepSeekAdapter } from './deepseek-adapter';
import { MistralAdapter } from './mistral-adapter';
import { CohereAdapter } from './cohere-adapter';
import { GroqAdapter } from './groq-adapter';

export { BaseProviderAdapter } from './base-adapter';
export { OpenAIAdapter } from './openai-adapter';
export { AnthropicAdapter } from './anthropic-adapter';
export { GoogleAdapter } from './google-adapter';
export { AzureAdapter } from './azure-adapter';
export { AWSAdapter } from './aws-adapter';
export { XAIAdapter } from './xai-adapter';
export { DeepSeekAdapter } from './deepseek-adapter';
export { MistralAdapter } from './mistral-adapter';
export { CohereAdapter } from './cohere-adapter';
export { GroqAdapter } from './groq-adapter';

/**
 * Create a provider adapter instance
 */
export function createAdapter(provider: ProviderType): ProviderAdapter {
  switch (provider) {
    case 'openai':
      return new OpenAIAdapter();
    case 'anthropic':
      return new AnthropicAdapter();
    case 'google':
      return new GoogleAdapter();
    case 'azure':
      return new AzureAdapter();
    case 'aws':
      return new AWSAdapter();
    case 'xai':
      return new XAIAdapter();
    case 'deepseek':
      return new DeepSeekAdapter();
    case 'mistral':
      return new MistralAdapter();
    case 'cohere':
      return new CohereAdapter();
    case 'groq':
      return new GroqAdapter();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Get all available adapters
 */
export function getAllAdapters(): Map<ProviderType, ProviderAdapter> {
  return new Map<ProviderType, ProviderAdapter>([
    ['openai', new OpenAIAdapter()],
    ['anthropic', new AnthropicAdapter()],
    ['google', new GoogleAdapter()],
    ['azure', new AzureAdapter()],
    ['aws', new AWSAdapter()],
    ['xai', new XAIAdapter()],
    ['deepseek', new DeepSeekAdapter()],
    ['mistral', new MistralAdapter()],
    ['cohere', new CohereAdapter()],
    ['groq', new GroqAdapter()],
  ]);
}
