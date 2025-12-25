# TokenTRA SDK Guide

## Overview

The TokenTRA SDK provides easy integration for tracking AI usage across your applications.

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
import { TokenTRAClient } from "@tokentra/sdk";

const client = new TokenTRAClient({
  apiKey: process.env.TOKENTRA_API_KEY,
  projectId: "your-project-id",
});

// Track a single event
client.track({
  provider: "openai",
  model: "gpt-4o",
  inputTokens: 1500,
  outputTokens: 500,
  latencyMs: 1200,
});

// Flush pending events
await client.flush();
```

## Wrapping AI Clients

### OpenAI

```typescript
import OpenAI from "openai";
import { TokenTRAClient, wrapOpenAI } from "@tokentra/sdk";

const tokentra = new TokenTRAClient({ apiKey: "..." });
const openai = wrapOpenAI(new OpenAI(), tokentra);

// Use openai as normal - usage is automatically tracked
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
```

### Anthropic

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { TokenTRAClient, wrapAnthropic } from "@tokentra/sdk";

const tokentra = new TokenTRAClient({ apiKey: "..." });
const anthropic = wrapAnthropic(new Anthropic(), tokentra);

// Use anthropic as normal - usage is automatically tracked
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  messages: [{ role: "user", content: "Hello!" }],
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | required | Your TokenTRA API key |
| `projectId` | string | optional | Project ID for attribution |
| `teamId` | string | optional | Team ID for attribution |
| `batchSize` | number | 100 | Events to batch before sending |
| `flushInterval` | number | 5000 | Auto-flush interval in ms |
| `endpoint` | string | production | Custom API endpoint |

## Best Practices

1. **Initialize once**: Create a single client instance and reuse it
2. **Flush on shutdown**: Call `flush()` before your application exits
3. **Use metadata**: Add custom metadata for better cost attribution
4. **Set project/team IDs**: Enable accurate cost allocation
