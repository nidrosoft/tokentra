# @tokentra/sdk

TypeScript SDK for TokenTRA - AI Cost Management Platform

Track AI costs across OpenAI, Anthropic, Google, Azure, and AWS Bedrock with automatic instrumentation.

## Installation

```bash
npm install @tokentra/sdk
# or
yarn add @tokentra/sdk
# or
pnpm add @tokentra/sdk
```

## Quick Start

```typescript
import { TokentraClient } from "@tokentra/sdk";

const tokentra = new TokentraClient({
  apiKey: "tk_live_your_api_key",
  debug: true, // Enable debug logging
});

// Track usage manually
await tokentra.track({
  provider: "openai",
  model: "gpt-4o",
  inputTokens: 1000,
  outputTokens: 500,
  teamId: "engineering",
  projectId: "chatbot",
});

// Graceful shutdown (flushes pending events)
await tokentra.shutdown();
```

## Automatic Instrumentation

### OpenAI

```typescript
import OpenAI from "openai";
import { TokentraClient, wrapOpenAI } from "@tokentra/sdk";

const tokentra = new TokentraClient({ apiKey: "tk_live_xxx" });
const openai = wrapOpenAI(new OpenAI(), tokentra, {
  context: { teamId: "engineering", projectId: "chatbot" },
});

// Usage is automatically tracked
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Anthropic

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { TokentraClient, wrapAnthropic } from "@tokentra/sdk";

const tokentra = new TokentraClient({ apiKey: "tk_live_xxx" });
const anthropic = wrapAnthropic(new Anthropic(), tokentra);

const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Google Generative AI

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TokentraClient, wrapGoogle } from "@tokentra/sdk";

const tokentra = new TokentraClient({ apiKey: "tk_live_xxx" });
const genAI = wrapGoogle(new GoogleGenerativeAI(apiKey), tokentra);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const result = await model.generateContent("Hello!");
```

### Azure OpenAI

```typescript
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { TokentraClient, wrapAzureOpenAI } from "@tokentra/sdk";

const tokentra = new TokentraClient({ apiKey: "tk_live_xxx" });
const client = wrapAzureOpenAI(
  new OpenAIClient(endpoint, new AzureKeyCredential(key)),
  tokentra
);

const result = await client.getChatCompletions("gpt-4", messages);
```

### AWS Bedrock

```typescript
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { TokentraClient, wrapBedrock } from "@tokentra/sdk";

const tokentra = new TokentraClient({ apiKey: "tk_live_xxx" });
const bedrock = wrapBedrock(new BedrockRuntimeClient({ region: "us-east-1" }), tokentra);

const result = await bedrock.converse({
  modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
  messages: [{ role: "user", content: [{ text: "Hello!" }] }],
});
```

### Custom Providers

```typescript
import { TokentraClient, wrapCustom } from "@tokentra/sdk";

const tokentra = new TokentraClient({ apiKey: "tk_live_xxx" });
const customClient = wrapCustom(
  myCustomClient,
  tokentra,
  {
    provider: "my-provider",
    extractUsage: (result) => ({
      model: result.model,
      inputTokens: result.usage.input,
      outputTokens: result.usage.output,
    }),
    methods: ["generate", "complete"],
  }
);
```

## Context & Attribution

Set default context for all events:

```typescript
tokentra.setContext({
  teamId: "engineering",
  projectId: "chatbot",
  featureTag: "customer-support",
  userId: "user_123",
});

// All subsequent tracks will include this context
await tokentra.track({ provider: "openai", model: "gpt-4o", inputTokens: 100, outputTokens: 50 });

// Clear context when done
tokentra.clearContext();
```

## Configuration

```typescript
const client = new TokentraClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.tokentra.ai", // Optional: custom API endpoint
  timeout: 30000, // Optional: request timeout in ms
  batchSize: 100, // Optional: events per batch
  flushInterval: 5000, // Optional: auto-flush interval in ms
});
```

## API Reference

### `track(event: TrackingEvent): Promise<void>`

Track a single AI usage event.

### `flush(): Promise<BatchResult>`

Manually flush all queued events.

### `shutdown(): Promise<void>`

Stop the auto-flush timer and flush remaining events.

## License

MIT
