/**
 * Anthropic Wrapper
 * Transparent proxy wrapper for Anthropic client
 */

import { TokenTraCore } from "../core/TokenTraCore";
import { TokentraOptions, TrackingEvent } from "../types";

type AnthropicClient = {
  messages: {
    create: (...args: unknown[]) => Promise<unknown>;
    stream?: (...args: unknown[]) => unknown;
  };
  completions?: {
    create: (...args: unknown[]) => Promise<unknown>;
  };
};

export class AnthropicWrapper {
  private client: AnthropicClient;
  private core: TokenTraCore;

  constructor(client: AnthropicClient, core: TokenTraCore) {
    this.client = client;
    this.core = core;
    return this.createProxy() as unknown as AnthropicWrapper;
  }

  private createProxy(): AnthropicClient {
    const self = this;

    return new Proxy(this.client, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (prop === "messages") {
          return self.wrapMessages(value);
        }

        if (prop === "completions") {
          return self.wrapCompletions(value);
        }

        return value;
      },
    });
  }

  private wrapMessages(messages: unknown): unknown {
    const self = this;

    return new Proxy(messages as object, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (prop === "create" && typeof value === "function") {
          return self.wrapMethod(value.bind(target), "messages.create");
        }

        if (prop === "stream" && typeof value === "function") {
          return self.wrapStreamMethod(value.bind(target), "messages.stream");
        }

        return value;
      },
    });
  }

  private wrapCompletions(completions: unknown): unknown {
    const self = this;

    return new Proxy(completions as object, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (prop === "create" && typeof value === "function") {
          return self.wrapMethod(value.bind(target), "completions.create");
        }

        return value;
      },
    });
  }

  private wrapMethod(
    method: (...args: unknown[]) => Promise<unknown>,
    methodPath: string
  ): (...args: unknown[]) => Promise<unknown> {
    const self = this;

    return async function (...args: unknown[]): Promise<unknown> {
      // Extract TokenTra options
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

        const usage = self.extractUsage(response);

        const event: TrackingEvent = {
          requestId,
          provider: "anthropic",
          model,
          methodPath,
          inputTokens: usage.input_tokens || 0,
          outputTokens: usage.output_tokens || 0,
          cachedTokens: usage.cache_read_input_tokens || 0,
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
          provider: "anthropic",
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

  private wrapStreamMethod(
    method: (...args: unknown[]) => unknown,
    methodPath: string
  ): (...args: unknown[]) => unknown {
    const self = this;

    return function (...args: unknown[]): unknown {
      // Extract TokenTra options
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

      const stream = method.apply(null, cleanArgs);

      return self.wrapStream(stream, {
        requestId,
        model,
        methodPath,
        startTime,
        tokentraOptions,
      });
    };
  }

  private wrapStream(
    stream: unknown,
    context: {
      requestId: string;
      model: string;
      methodPath: string;
      startTime: number;
      tokentraOptions?: TokentraOptions;
    }
  ): unknown {
    const self = this;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    const streamObj = stream as { [Symbol.asyncIterator]: () => AsyncIterator<unknown> };
    const originalIterator = streamObj[Symbol.asyncIterator].bind(streamObj);

    streamObj[Symbol.asyncIterator] = async function* () {
      const iterator = originalIterator();

      try {
        let result = await iterator.next();
        while (!result.done) {
          const event = result.value as Record<string, unknown>;

          if (event.type === "message_delta" && event.usage) {
            const usage = event.usage as Record<string, number>;
            totalOutputTokens = usage.output_tokens || totalOutputTokens;
          }
          if (event.type === "message_start") {
            const message = event.message as Record<string, unknown>;
            const usage = message?.usage as Record<string, number>;
            if (usage) {
              totalInputTokens = usage.input_tokens || 0;
            }
          }

          yield event;
          result = await iterator.next();
        }

        const latencyMs = Date.now() - context.startTime;

        const trackEvent: TrackingEvent = {
          requestId: context.requestId,
          provider: "anthropic",
          model: context.model,
          methodPath: context.methodPath,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          latencyMs,
          isStreaming: true,
          timestamp: new Date(),
          ...context.tokentraOptions,
        };

        self.core.queueEvent(trackEvent);
      } catch (error) {
        const latencyMs = Date.now() - context.startTime;

        const trackEvent: TrackingEvent = {
          requestId: context.requestId,
          provider: "anthropic",
          model: context.model,
          methodPath: context.methodPath,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs,
          isStreaming: true,
          isError: true,
          errorCode: (error as Error).name,
          errorMessage: (error as Error).message,
          timestamp: new Date(),
          ...context.tokentraOptions,
        };

        self.core.queueEvent(trackEvent);

        throw error;
      }
    };

    return stream;
  }

  private extractUsage(response: unknown): {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
  } {
    const resp = response as Record<string, unknown>;

    if (resp.usage) {
      const usage = resp.usage as Record<string, number>;
      return {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_read_input_tokens: usage.cache_read_input_tokens,
      };
    }

    return {};
  }
}

export function wrapAnthropic<T>(client: T, core: TokenTraCore): T {
  return new AnthropicWrapper(client as unknown as AnthropicClient, core) as unknown as T;
}
