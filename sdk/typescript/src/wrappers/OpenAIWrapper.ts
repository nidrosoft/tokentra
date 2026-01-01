/**
 * OpenAI Wrapper
 * Transparent proxy wrapper for OpenAI client
 */

import { TokenTraCore } from "../core/TokenTraCore";
import { TokentraOptions, TrackingEvent } from "../types";

type OpenAIClient = {
  chat: {
    completions: {
      create: (...args: unknown[]) => Promise<unknown>;
    };
  };
  completions?: {
    create: (...args: unknown[]) => Promise<unknown>;
  };
  embeddings?: {
    create: (...args: unknown[]) => Promise<unknown>;
  };
  images?: {
    generate: (...args: unknown[]) => Promise<unknown>;
  };
  audio?: {
    transcriptions: {
      create: (...args: unknown[]) => Promise<unknown>;
    };
    speech: {
      create: (...args: unknown[]) => Promise<unknown>;
    };
  };
};

const WRAPPED_METHODS = [
  "chat.completions.create",
  "completions.create",
  "embeddings.create",
  "images.generate",
  "audio.transcriptions.create",
  "audio.speech.create",
];

export class OpenAIWrapper {
  private client: OpenAIClient;
  private core: TokenTraCore;

  constructor(client: OpenAIClient, core: TokenTraCore) {
    this.client = client;
    this.core = core;
    return this.createProxy() as unknown as OpenAIWrapper;
  }

  private createProxy(): OpenAIClient {
    const self = this;

    return new Proxy(this.client, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (typeof value === "object" && value !== null) {
          return self.wrapNestedObject(value, String(prop));
        }

        return value;
      },
    });
  }

  private wrapNestedObject(obj: unknown, path: string): unknown {
    const self = this;

    return new Proxy(obj as object, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (typeof value === "function") {
          const methodPath = `${path}.${String(prop)}`;

          if (self.shouldWrapMethod(methodPath)) {
            return self.wrapMethod(value.bind(target), methodPath);
          }
        }

        if (typeof value === "object" && value !== null) {
          return self.wrapNestedObject(value, `${path}.${String(prop)}`);
        }

        return value;
      },
    });
  }

  private shouldWrapMethod(path: string): boolean {
    return WRAPPED_METHODS.includes(path);
  }

  private wrapMethod(
    method: (...args: unknown[]) => Promise<unknown>,
    methodPath: string
  ): (...args: unknown[]) => Promise<unknown> {
    const self = this;

    return async function (...args: unknown[]): Promise<unknown> {
      // Extract TokenTra options from last argument
      const lastArg = args[args.length - 1] as Record<string, unknown> | undefined;
      let tokentraOptions: TokentraOptions | undefined;
      let cleanArgs = args;

      if (lastArg && typeof lastArg === "object" && "tokentra" in lastArg) {
        tokentraOptions = lastArg.tokentra as TokentraOptions;
        const { tokentra, ...rest } = lastArg;
        cleanArgs =
          Object.keys(rest).length > 0
            ? [...args.slice(0, -1), rest]
            : args.slice(0, -1);
      }

      const requestId = self.core.generateRequestId();
      const startTime = Date.now();

      const requestParams = (cleanArgs[0] || {}) as Record<string, unknown>;
      const model = (requestParams.model as string) || "unknown";
      const isStreaming = requestParams.stream === true;

      try {
        const response = await method.apply(null, cleanArgs);
        const latencyMs = Date.now() - startTime;

        const usage = self.extractUsage(response, methodPath);

        const event: TrackingEvent = {
          requestId,
          provider: "openai",
          model,
          methodPath,
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          cachedTokens: usage.cached_tokens || 0,
          latencyMs,
          isStreaming,
          timestamp: new Date(),
          ...tokentraOptions,
        };

        self.core.queueEvent(event);

        return response;
      } catch (error) {
        const latencyMs = Date.now() - startTime;

        const event: TrackingEvent = {
          requestId,
          provider: "openai",
          model,
          methodPath,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs,
          isStreaming,
          isError: true,
          errorCode: (error as Error).name,
          errorMessage: (error as Error).message,
          timestamp: new Date(),
          ...tokentraOptions,
        };

        self.core.queueEvent(event);

        throw error;
      }
    };
  }

  private extractUsage(
    response: unknown,
    methodPath: string
  ): { prompt_tokens?: number; completion_tokens?: number; cached_tokens?: number } {
    const resp = response as Record<string, unknown>;

    if (resp.usage) {
      const usage = resp.usage as Record<string, unknown>;
      return {
        prompt_tokens: usage.prompt_tokens as number,
        completion_tokens: usage.completion_tokens as number,
        cached_tokens: (usage.prompt_tokens_details as Record<string, number>)?.cached_tokens,
      };
    }

    if (methodPath.includes("embeddings")) {
      const data = resp.data as Array<{ embedding?: number[] }>;
      return {
        prompt_tokens: data?.[0]?.embedding?.length || 0,
        completion_tokens: 0,
      };
    }

    if (methodPath.includes("images")) {
      return { prompt_tokens: 0, completion_tokens: 0 };
    }

    return {};
  }
}

export function wrapOpenAI<T>(client: T, core: TokenTraCore): T {
  return new OpenAIWrapper(client as unknown as OpenAIClient, core) as unknown as T;
}
