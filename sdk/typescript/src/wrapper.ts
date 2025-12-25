import type { TrackingContext, ProviderType } from "./types";
import { TokentraClient } from "./client";

interface WrapperOptions {
  context?: TrackingContext;
}

/**
 * Wrap OpenAI client to automatically track usage
 */
export function wrapOpenAI<T extends object>(
  client: T,
  tokentraClient: TokentraClient,
  options?: WrapperOptions
): T {
  const chatCompletions = (client as any).chat?.completions;
  if (chatCompletions?.create) {
    const originalCreate = chatCompletions.create.bind(chatCompletions);
    chatCompletions.create = async (...args: unknown[]) => {
      const startTime = Date.now();
      const result = await originalCreate(...args);
      const duration = Date.now() - startTime;

      if (result?.usage) {
        tokentraClient.track(
          {
            provider: "openai",
            model: result.model || "unknown",
            inputTokens: result.usage.prompt_tokens || 0,
            outputTokens: result.usage.completion_tokens || 0,
            cachedTokens: result.usage.prompt_tokens_details?.cached_tokens || 0,
            latencyMs: duration,
            requestId: result.id,
          },
          options?.context
        );
      }

      return result;
    };
  }

  const completions = (client as any).completions;
  if (completions?.create) {
    const originalCreate = completions.create.bind(completions);
    completions.create = async (...args: unknown[]) => {
      const startTime = Date.now();
      const result = await originalCreate(...args);
      const duration = Date.now() - startTime;

      if (result?.usage) {
        tokentraClient.track(
          {
            provider: "openai",
            model: result.model || "unknown",
            inputTokens: result.usage.prompt_tokens || 0,
            outputTokens: result.usage.completion_tokens || 0,
            latencyMs: duration,
            requestId: result.id,
          },
          options?.context
        );
      }

      return result;
    };
  }

  const embeddings = (client as any).embeddings;
  if (embeddings?.create) {
    const originalCreate = embeddings.create.bind(embeddings);
    embeddings.create = async (...args: unknown[]) => {
      const startTime = Date.now();
      const result = await originalCreate(...args);
      const duration = Date.now() - startTime;

      if (result?.usage) {
        tokentraClient.track(
          {
            provider: "openai",
            model: result.model || "unknown",
            inputTokens: result.usage.prompt_tokens || 0,
            outputTokens: 0,
            latencyMs: duration,
            metadata: { type: "embedding" },
          },
          options?.context
        );
      }

      return result;
    };
  }

  return client;
}

/**
 * Wrap Anthropic client to automatically track usage
 */
export function wrapAnthropic<T extends object>(
  client: T,
  tokentraClient: TokentraClient,
  options?: WrapperOptions
): T {
  const messages = (client as any).messages;
  if (messages?.create) {
    const originalCreate = messages.create.bind(messages);
    messages.create = async (...args: unknown[]) => {
      const startTime = Date.now();
      const result = await originalCreate(...args);
      const duration = Date.now() - startTime;

      if (result?.usage) {
        tokentraClient.track(
          {
            provider: "anthropic",
            model: result.model || "unknown",
            inputTokens: result.usage.input_tokens || 0,
            outputTokens: result.usage.output_tokens || 0,
            cachedTokens: result.usage.cache_read_input_tokens || 0,
            latencyMs: duration,
            requestId: result.id,
          },
          options?.context
        );
      }

      return result;
    };
  }

  return client;
}

/**
 * Wrap Google Generative AI client to automatically track usage
 */
export function wrapGoogle<T extends object>(
  client: T,
  tokentraClient: TokentraClient,
  options?: WrapperOptions
): T {
  const getGenerativeModel = (client as any).getGenerativeModel;
  if (getGenerativeModel) {
    (client as any).getGenerativeModel = (...modelArgs: unknown[]) => {
      const model = getGenerativeModel.apply(client, modelArgs);

      if (model?.generateContent) {
        const originalGenerate = model.generateContent.bind(model);
        model.generateContent = async (...args: unknown[]) => {
          const startTime = Date.now();
          const result = await originalGenerate(...args);
          const duration = Date.now() - startTime;

          const response = result?.response;
          const usageMetadata = response?.usageMetadata;

          if (usageMetadata) {
            tokentraClient.track(
              {
                provider: "google",
                model: (modelArgs[0] as any)?.model || "gemini",
                inputTokens: usageMetadata.promptTokenCount || 0,
                outputTokens: usageMetadata.candidatesTokenCount || 0,
                latencyMs: duration,
              },
              options?.context
            );
          }

          return result;
        };
      }

      return model;
    };
  }

  return client;
}

/**
 * Wrap Azure OpenAI client to automatically track usage
 */
export function wrapAzureOpenAI<T extends object>(
  client: T,
  tokentraClient: TokentraClient,
  options?: WrapperOptions
): T {
  const getChatCompletions = (client as any).getChatCompletions;
  if (getChatCompletions) {
    (client as any).getChatCompletions = async (...args: unknown[]) => {
      const startTime = Date.now();
      const result = await getChatCompletions.apply(client, args);
      const duration = Date.now() - startTime;

      if (result?.usage) {
        tokentraClient.track(
          {
            provider: "azure",
            model: args[0] as string || "unknown",
            inputTokens: result.usage.promptTokens || 0,
            outputTokens: result.usage.completionTokens || 0,
            latencyMs: duration,
            requestId: result.id,
          },
          options?.context
        );
      }

      return result;
    };
  }

  const getCompletions = (client as any).getCompletions;
  if (getCompletions) {
    (client as any).getCompletions = async (...args: unknown[]) => {
      const startTime = Date.now();
      const result = await getCompletions.apply(client, args);
      const duration = Date.now() - startTime;

      if (result?.usage) {
        tokentraClient.track(
          {
            provider: "azure",
            model: args[0] as string || "unknown",
            inputTokens: result.usage.promptTokens || 0,
            outputTokens: result.usage.completionTokens || 0,
            latencyMs: duration,
            requestId: result.id,
          },
          options?.context
        );
      }

      return result;
    };
  }

  return client;
}

/**
 * Wrap AWS Bedrock client to automatically track usage
 */
export function wrapBedrock<T extends object>(
  client: T,
  tokentraClient: TokentraClient,
  options?: WrapperOptions
): T {
  const invokeModel = (client as any).invokeModel;
  if (invokeModel) {
    (client as any).invokeModel = async (...args: unknown[]) => {
      const startTime = Date.now();
      const result = await invokeModel.apply(client, args);
      const duration = Date.now() - startTime;

      const input = args[0] as any;
      const modelId = input?.modelId || "unknown";

      // Parse response body for usage
      if (result?.body) {
        try {
          const bodyStr = new TextDecoder().decode(result.body);
          const body = JSON.parse(bodyStr);

          if (body.usage) {
            tokentraClient.track(
              {
                provider: "aws",
                model: modelId,
                inputTokens: body.usage.input_tokens || body.usage.inputTokens || 0,
                outputTokens: body.usage.output_tokens || body.usage.outputTokens || 0,
                latencyMs: duration,
              },
              options?.context
            );
          }
        } catch {
          // Ignore parsing errors
        }
      }

      return result;
    };
  }

  const converse = (client as any).converse;
  if (converse) {
    (client as any).converse = async (...args: unknown[]) => {
      const startTime = Date.now();
      const result = await converse.apply(client, args);
      const duration = Date.now() - startTime;

      const input = args[0] as any;
      const modelId = input?.modelId || "unknown";

      if (result?.usage) {
        tokentraClient.track(
          {
            provider: "aws",
            model: modelId,
            inputTokens: result.usage.inputTokens || 0,
            outputTokens: result.usage.outputTokens || 0,
            latencyMs: duration,
          },
          options?.context
        );
      }

      return result;
    };
  }

  return client;
}

/**
 * Generic wrapper for custom providers
 */
export function wrapCustom<T extends object>(
  client: T,
  tokentraClient: TokentraClient,
  config: {
    provider: string;
    extractUsage: (result: any) => { inputTokens: number; outputTokens: number; model: string };
    methods?: string[];
  },
  options?: WrapperOptions
): T {
  const methods = config.methods || ["create", "generate", "invoke", "call"];

  const wrapMethod = (obj: any, methodName: string) => {
    if (typeof obj[methodName] === "function") {
      const original = obj[methodName].bind(obj);
      obj[methodName] = async (...args: unknown[]) => {
        const startTime = Date.now();
        const result = await original(...args);
        const duration = Date.now() - startTime;

        try {
          const usage = config.extractUsage(result);
          tokentraClient.track(
            {
              provider: config.provider,
              model: usage.model,
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              latencyMs: duration,
            },
            options?.context
          );
        } catch {
          // Ignore extraction errors
        }

        return result;
      };
    }
  };

  for (const method of methods) {
    wrapMethod(client, method);
  }

  return client;
}
