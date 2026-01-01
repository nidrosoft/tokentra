# TokenTRA Backend Architecture & AI Strategy

> **Document Version:** 1.0  
> **Last Updated:** December 28, 2025  
> **Target Audience:** Engineering Team, Technical Leadership

---

## Executive Summary

TokenTRA is an enterprise AI cost intelligence platform designed for startups spending $50K-$500K+/month on AI tokens. This document outlines the complete backend architecture, AI/LLM strategy, and implementation roadmap for building a production-grade system.

**Key Design Principles:**
1. **Data-First** - Robust ingestion and analytics before AI features
2. **Model-Agnostic** - Support all major providers, route intelligently
3. **Cost-Conscious** - Practice what we preach (optimize our own AI usage)
4. **Enterprise-Ready** - SOC2, RBAC, audit logs from day one

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Data Plane - Collection & Storage](#2-data-plane---collection--storage)
3. [Intelligence Plane - AI/LLM Strategy](#3-intelligence-plane---aillm-strategy)
4. [Control Plane - Policies & Governance](#4-control-plane---policies--governance)
5. [LLM Model Selection Strategy](#5-llm-model-selection-strategy)
6. [Smart Routing Engine](#6-smart-routing-engine)
7. [Multi-Agent Consensus System](#7-multi-agent-consensus-system)
8. [Optimization Recommendation Engine](#8-optimization-recommendation-engine)
9. [Supabase Implementation](#9-supabase-implementation)
10. [API Architecture](#10-api-architecture)
11. [Security & Compliance](#11-security--compliance)
12. [Implementation Roadmap](#12-implementation-roadmap)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TOKENTRA PLATFORM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         CONTROL PLANE                                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │    │
│  │  │ Policies │  │ Budgets  │  │  RBAC    │  │ Audit & Compliance│    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       INTELLIGENCE PLANE                             │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │   Anomaly    │  │ Optimization │  │    Smart Routing         │  │    │
│  │  │  Detection   │  │   Engine     │  │      Engine              │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │  Multi-Agent │  │   Cost       │  │    Natural Language      │  │    │
│  │  │  Consensus   │  │  Forecasting │  │      Assistant           │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          DATA PLANE                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │   Ingestion  │  │   Storage    │  │    Analytics Engine      │  │    │
│  │  │   Pipeline   │  │   Layer      │  │    (Aggregations)        │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL INTEGRATIONS                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  OpenAI  │  │ Anthropic│  │  Google  │  │   AWS    │  │  Azure   │      │
│  │   API    │  │   API    │  │  Gemini  │  │ Bedrock  │  │ OpenAI   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Plane - Collection & Storage

### 2.1 Data Ingestion Methods

TokenTRA collects usage data through multiple channels:

#### A. SDK Integration (Primary Method)
```typescript
// Customer integrates our SDK wrapper
import { TokenTRA } from '@tokentra/sdk';

const tokentra = new TokenTRA({
  apiKey: 'tt_live_xxx',
  projectId: 'proj_xxx',
});

// Wrap their OpenAI client
const openai = tokentra.wrap(new OpenAI({ apiKey: 'sk-xxx' }));

// All calls are automatically tracked
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }],
  // TokenTRA metadata
  metadata: {
    feature: 'chat-assistant',
    userId: 'user_123',
    teamId: 'team_456',
  },
});
```

#### B. Provider API Sync (Secondary Method)
- Direct integration with provider billing APIs
- Syncs usage data every 15 minutes
- Reconciles with SDK-tracked data

#### C. Log Ingestion (Enterprise Method)
- Parse application logs for LLM calls
- Support for OpenTelemetry traces
- Custom log format adapters

### 2.2 Core Data Schema (Supabase/PostgreSQL)

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams within organizations
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  api_key_patterns TEXT[], -- Patterns to match API keys to teams
  monthly_budget DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  name TEXT NOT NULL,
  tags TEXT[],
  monthly_budget DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider connections
CREATE TABLE provider_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'azure', 'aws'
  credentials JSONB NOT NULL, -- Encrypted API keys/OAuth tokens
  status TEXT DEFAULT 'pending', -- 'pending', 'connected', 'error'
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage records (main analytics table)
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  project_id UUID REFERENCES projects(id),
  
  -- Request details
  request_id TEXT UNIQUE, -- Idempotency key
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  endpoint TEXT, -- 'chat.completions', 'embeddings', etc.
  
  -- Token counts
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cached_tokens INTEGER DEFAULT 0,
  
  -- Cost (calculated)
  cost DECIMAL(12,6) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Performance
  latency_ms INTEGER,
  status TEXT, -- 'success', 'error', 'timeout'
  error_code TEXT,
  
  -- Attribution
  user_id TEXT, -- Customer's user ID
  feature TEXT, -- Feature tag
  api_key_id TEXT, -- Which API key was used
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hypertable for time-series optimization (TimescaleDB)
SELECT create_hypertable('usage_records', 'timestamp', 
  chunk_time_interval => INTERVAL '1 day');

-- Indexes for common queries
CREATE INDEX idx_usage_org_time ON usage_records (organization_id, timestamp DESC);
CREATE INDEX idx_usage_team_time ON usage_records (team_id, timestamp DESC);
CREATE INDEX idx_usage_model ON usage_records (model, timestamp DESC);
CREATE INDEX idx_usage_feature ON usage_records (feature, timestamp DESC);

-- Pre-aggregated daily summaries (materialized view)
CREATE MATERIALIZED VIEW daily_usage_summary AS
SELECT 
  organization_id,
  team_id,
  project_id,
  provider,
  model,
  feature,
  DATE_TRUNC('day', timestamp) AS date,
  COUNT(*) AS request_count,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(cached_tokens) AS total_cached_tokens,
  SUM(cost) AS total_cost,
  AVG(latency_ms) AS avg_latency,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency,
  COUNT(*) FILTER (WHERE status = 'success') AS success_count,
  COUNT(*) FILTER (WHERE status = 'error') AS error_count
FROM usage_records
GROUP BY 1, 2, 3, 4, 5, 6, 7;

-- Refresh daily
CREATE INDEX idx_daily_summary ON daily_usage_summary (organization_id, date DESC);

-- Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  scope_type TEXT NOT NULL, -- 'organization', 'team', 'project', 'model'
  scope_id UUID,
  alert_thresholds INTEGER[] DEFAULT '{50, 75, 90, 100}',
  hard_limit BOOLEAN DEFAULT FALSE,
  current_spend DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'ok', -- 'ok', 'warning', 'exceeded'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'budget', 'anomaly', 'threshold', 'error_rate'
  condition JSONB NOT NULL,
  channels TEXT[] NOT NULL, -- ['email', 'slack', 'pagerduty']
  enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert events (history)
CREATE TABLE alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
  message TEXT NOT NULL,
  context JSONB,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimization recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'model_switch', 'prompt_optimization', 'caching', 'batching'
  priority TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact JSONB NOT NULL, -- { estimated_savings: 1500, confidence: 0.85 }
  evidence JSONB NOT NULL, -- Supporting data
  action JSONB, -- Automated action if applicable
  status TEXT DEFAULT 'pending', -- 'pending', 'applied', 'dismissed', 'expired'
  applied_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model pricing (reference table)
CREATE TABLE model_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_price_per_1m DECIMAL(10,6) NOT NULL, -- Price per 1M input tokens
  output_price_per_1m DECIMAL(10,6) NOT NULL, -- Price per 1M output tokens
  cached_price_per_1m DECIMAL(10,6), -- Price for cached tokens
  context_window INTEGER,
  capabilities TEXT[], -- ['chat', 'vision', 'function_calling', 'json_mode']
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  UNIQUE(provider, model, effective_from)
);
```

### 2.3 Real-Time Processing Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SDK/API   │───▶│   Supabase  │───▶│   Edge      │───▶│  PostgreSQL │
│   Request   │    │   Realtime  │    │  Functions  │    │  + Timescale│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │  Budget Check   │
                                    │  Anomaly Check  │
                                    │  Alert Trigger  │
                                    └─────────────────┘
```

---

## 3. Intelligence Plane - AI/LLM Strategy

### 3.1 Overview

The Intelligence Plane is where AI adds value to TokenTRA. We use LLMs strategically for tasks where they excel, while relying on traditional algorithms for deterministic operations.

**Core Principle:** Use the cheapest model that meets quality requirements for each task.

### 3.2 AI-Powered Features

| Feature | AI Role | Model Tier | Frequency |
|---------|---------|------------|-----------|
| Anomaly Explanation | Explain why costs spiked | Workhorse | On-demand |
| Optimization Recommendations | Generate actionable suggestions | Workhorse | Daily batch |
| Natural Language Queries | "Why did costs double?" | Workhorse | On-demand |
| Smart Routing Decisions | Classify task complexity | Cheap/Utility | Per-request |
| Report Narratives | Generate executive summaries | Workhorse | Weekly |
| Root Cause Analysis | Deep-dive into issues | Premium | Rare/escalated |

### 3.3 Non-AI Features (Traditional Algorithms)

| Feature | Approach |
|---------|----------|
| Cost Aggregation | SQL aggregations |
| Budget Tracking | Real-time counters |
| Threshold Alerts | Rule-based triggers |
| Trend Detection | Time-series analysis (Prophet, ARIMA) |
| Anomaly Detection | Statistical methods (Z-score, IQR, Isolation Forest) |
| Forecasting | ML models (XGBoost, Prophet) |

---

## 4. Control Plane - Policies & Governance

### 4.1 Budget Enforcement

```typescript
interface BudgetPolicy {
  id: string;
  scope: {
    type: 'organization' | 'team' | 'project' | 'model' | 'user';
    id: string;
  };
  limits: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
  actions: {
    onWarning: ('notify' | 'log')[];
    onExceeded: ('notify' | 'throttle' | 'block')[];
  };
  thresholds: number[]; // [50, 75, 90, 100]
}
```

### 4.2 Access Control (RBAC)

```typescript
type Role = 'owner' | 'admin' | 'member' | 'viewer' | 'billing';

const permissions: Record<Role, string[]> = {
  owner: ['*'], // Full access
  admin: [
    'read:*', 'write:teams', 'write:projects', 'write:budgets',
    'write:alerts', 'read:billing', 'write:api-keys'
  ],
  member: [
    'read:costs', 'read:usage', 'read:recommendations',
    'read:teams', 'read:projects'
  ],
  viewer: ['read:costs', 'read:usage'],
  billing: ['read:*', 'write:billing'],
};
```

---

## 5. LLM Model Selection Strategy

### 5.1 Current Model Landscape (December 2025)

Based on the latest research, here are the recommended models for TokenTRA:

#### Tier 1: Premium Reasoning (Use Sparingly)
| Model | Provider | Best For | Cost |
|-------|----------|----------|------|
| **GPT-4.1** | OpenAI | Complex analysis, code generation | $$$ |
| **Claude 3.5 Opus** | Anthropic | Long-context reasoning, safety-critical | $$$ |
| **Gemini 2.0 Ultra** | Google | Multimodal, GCP integration | $$$ |

#### Tier 2: Workhorse (Default Choice)
| Model | Provider | Best For | Cost |
|-------|----------|----------|------|
| **GPT-4.1-mini** | OpenAI | General tasks, good balance | $$ |
| **Claude 3.5 Sonnet** | Anthropic | Analysis, explanations | $$ |
| **Gemini 2.0 Pro** | Google | Balanced performance | $$ |

#### Tier 3: Cheap/Utility (High Volume)
| Model | Provider | Best For | Cost |
|-------|----------|----------|------|
| **GPT-4.1-nano** | OpenAI | Classification, routing | $ |
| **Claude 3.5 Haiku** | Anthropic | Fast, cheap tasks | $ |
| **Gemini 2.0 Flash** | Google | Speed-critical | $ |

#### Tier 4: Self-Hosted (Maximum Control)
| Model | Source | Best For | Cost |
|-------|--------|----------|------|
| **Llama 3.2 70B** | Meta | On-prem, privacy | Infra only |
| **Mistral Large 2** | Mistral | European compliance | Infra only |
| **Qwen 2.5 72B** | Alibaba | Multilingual | Infra only |

### 5.2 TokenTRA's Model Usage

```typescript
const MODEL_STRATEGY = {
  // Customer-facing assistant in dashboard
  'dashboard-assistant': {
    primary: 'claude-3.5-sonnet',
    fallback: 'gpt-4.1-mini',
    escalation: 'gpt-4.1', // For complex queries
  },
  
  // Routing decisions (per customer request)
  'smart-routing': {
    primary: 'claude-3.5-haiku', // Cheap and fast
    fallback: 'gpt-4.1-nano',
  },
  
  // Optimization recommendations (daily batch)
  'optimization-engine': {
    primary: 'gpt-4.1-mini',
    consensus: ['claude-3.5-sonnet', 'gpt-4.1-mini'], // Multi-agent
    synthesis: 'gpt-4.1', // Final synthesis for high-value
  },
  
  // Anomaly explanations
  'anomaly-explainer': {
    primary: 'claude-3.5-sonnet',
    fallback: 'gpt-4.1-mini',
  },
  
  // Report generation
  'report-generator': {
    primary: 'gpt-4.1-mini',
    premium: 'gpt-4.1', // Executive reports
  },
  
  // Bulk classification (log analysis)
  'bulk-classification': {
    primary: 'llama-3.2-8b', // Self-hosted
    fallback: 'claude-3.5-haiku',
  },
};
```

---

## 6. Smart Routing Engine

### 6.1 Overview

The Smart Routing Engine helps TokenTRA customers automatically route their LLM requests to the most cost-effective model that meets their quality requirements.

### 6.2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMART ROUTING ENGINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Request    │───▶│   Classifier │───▶│   Router     │       │
│  │   Intake     │    │   (LLM)      │    │   Logic      │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                             │                    │               │
│                             ▼                    ▼               │
│                    ┌──────────────┐    ┌──────────────┐         │
│                    │   Task Type  │    │   Model      │         │
│                    │   + Priority │    │   Selection  │         │
│                    └──────────────┘    └──────────────┘         │
│                                                  │               │
│                                                  ▼               │
│                                         ┌──────────────┐        │
│                                         │   Execute    │        │
│                                         │   + Track    │        │
│                                         └──────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Classification Prompt

```typescript
const ROUTING_CLASSIFIER_PROMPT = `
You are a task classifier for an AI routing system. Analyze the incoming request and classify it.

## Task Types
- SIMPLE: Basic Q&A, classification, extraction, formatting
- MODERATE: Summarization, translation, simple analysis
- COMPLEX: Multi-step reasoning, code generation, creative writing
- CRITICAL: High-stakes decisions, legal/medical, requires accuracy

## Output Format (JSON)
{
  "task_type": "SIMPLE" | "MODERATE" | "COMPLEX" | "CRITICAL",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation",
  "suggested_model_tier": "utility" | "workhorse" | "premium",
  "requires_tools": boolean,
  "estimated_tokens": { "input": number, "output": number }
}

## Request to Classify
{{request}}
`;
```

### 6.4 Routing Logic

```typescript
interface RoutingDecision {
  selectedModel: string;
  selectedProvider: string;
  reason: string;
  estimatedCost: number;
  fallbackModel?: string;
}

async function routeRequest(
  request: LLMRequest,
  customerConfig: CustomerRoutingConfig
): Promise<RoutingDecision> {
  // Step 1: Quick heuristic check
  const heuristicResult = applyHeuristics(request, customerConfig);
  if (heuristicResult.confident) {
    return heuristicResult.decision;
  }
  
  // Step 2: LLM classification (only if needed)
  const classification = await classifyTask(request);
  
  // Step 3: Apply customer constraints
  const eligibleModels = filterByConstraints(
    classification.suggested_model_tier,
    customerConfig.constraints
  );
  
  // Step 4: Select optimal model
  const selectedModel = selectOptimalModel(
    eligibleModels,
    classification,
    customerConfig.preferences
  );
  
  // Step 5: Calculate cost estimate
  const estimatedCost = calculateCost(
    selectedModel,
    classification.estimated_tokens
  );
  
  return {
    selectedModel: selectedModel.id,
    selectedProvider: selectedModel.provider,
    reason: `Task classified as ${classification.task_type} with ${classification.confidence} confidence`,
    estimatedCost,
    fallbackModel: selectFallback(selectedModel, eligibleModels),
  };
}
```

### 6.5 Heuristic Rules (Fast Path)

```typescript
const ROUTING_HEURISTICS = [
  // Rule 1: Short prompts → cheap models
  {
    condition: (req) => req.prompt.length < 100 && !req.systemPrompt,
    action: () => ({ tier: 'utility', confident: true }),
  },
  
  // Rule 2: Code generation → premium
  {
    condition: (req) => req.metadata?.feature === 'code-generation',
    action: () => ({ tier: 'premium', confident: true }),
  },
  
  // Rule 3: Classification tasks → utility
  {
    condition: (req) => req.metadata?.taskType === 'classification',
    action: () => ({ tier: 'utility', confident: true }),
  },
  
  // Rule 4: Customer marked as critical → premium
  {
    condition: (req) => req.metadata?.priority === 'critical',
    action: () => ({ tier: 'premium', confident: true }),
  },
  
  // Rule 5: Embeddings → always use embedding model
  {
    condition: (req) => req.endpoint === 'embeddings',
    action: () => ({ model: 'text-embedding-3-small', confident: true }),
  },
];
```

---

## 7. Multi-Agent Consensus System

### 7.1 Overview

For high-stakes decisions (optimization recommendations, anomaly analysis), we use a multi-agent system where multiple LLMs debate and reach consensus.

**Inspiration:** Projects like "ChatArena" and "LLM Debate" where multiple models argue to reduce bias and improve accuracy.

### 7.2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  MULTI-AGENT CONSENSUS SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     ORCHESTRATOR                         │    │
│  │  (Manages agent interactions, tracks rounds, consensus)  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │   ANALYST     │  │   SKEPTIC     │  │   ADVOCATE    │       │
│  │   (GPT-4.1)   │  │   (Claude)    │  │   (Gemini)    │       │
│  │               │  │               │  │               │       │
│  │ Proposes      │  │ Challenges    │  │ Defends user  │       │
│  │ optimizations │  │ assumptions   │  │ perspective   │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│              │               │               │                  │
│              └───────────────┼───────────────┘                  │
│                              ▼                                   │
│                    ┌───────────────┐                            │
│                    │   SYNTHESIZER │                            │
│                    │   (GPT-4.1)   │                            │
│                    │               │                            │
│                    │ Combines best │                            │
│                    │ arguments     │                            │
│                    └───────────────┘                            │
│                              │                                   │
│                              ▼                                   │
│                    ┌───────────────┐                            │
│                    │    FINAL      │                            │
│                    │ RECOMMENDATION│                            │
│                    └───────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Implementation

```typescript
interface Agent {
  id: string;
  role: 'analyst' | 'skeptic' | 'advocate' | 'synthesizer';
  model: string;
  systemPrompt: string;
}

interface ConsensusRound {
  roundNumber: number;
  responses: Map<string, AgentResponse>;
  consensusScore: number; // 0-1, how much agents agree
}

class MultiAgentConsensus {
  private agents: Agent[];
  private maxRounds: number = 3;
  private consensusThreshold: number = 0.8;
  
  constructor() {
    this.agents = [
      {
        id: 'analyst',
        role: 'analyst',
        model: 'gpt-4.1-mini',
        systemPrompt: `You are a Cost Optimization Analyst. Your role is to:
          - Analyze usage patterns and identify inefficiencies
          - Propose specific, actionable recommendations
          - Quantify potential savings with confidence intervals
          - Consider implementation complexity and risks`,
      },
      {
        id: 'skeptic',
        role: 'skeptic',
        model: 'claude-3.5-sonnet',
        systemPrompt: `You are a Critical Reviewer. Your role is to:
          - Challenge assumptions in proposed recommendations
          - Identify potential risks and edge cases
          - Question the accuracy of savings estimates
          - Ensure recommendations won't harm user experience`,
      },
      {
        id: 'advocate',
        role: 'advocate',
        model: 'gpt-4.1-mini',
        systemPrompt: `You are a User Advocate. Your role is to:
          - Represent the customer's perspective
          - Ensure recommendations are practical to implement
          - Consider organizational constraints and priorities
          - Advocate for solutions that balance cost and quality`,
      },
      {
        id: 'synthesizer',
        role: 'synthesizer',
        model: 'gpt-4.1',
        systemPrompt: `You are a Decision Synthesizer. Your role is to:
          - Review all agent perspectives and arguments
          - Identify points of agreement and disagreement
          - Synthesize a final recommendation that addresses concerns
          - Provide a confidence score and key caveats`,
      },
    ];
  }
  
  async runConsensus(context: AnalysisContext): Promise<ConsensusResult> {
    const rounds: ConsensusRound[] = [];
    let currentContext = context;
    
    for (let round = 1; round <= this.maxRounds; round++) {
      // Get responses from analyst, skeptic, and advocate
      const responses = await this.runDebateRound(currentContext, rounds);
      
      // Calculate consensus score
      const consensusScore = this.calculateConsensus(responses);
      
      rounds.push({
        roundNumber: round,
        responses,
        consensusScore,
      });
      
      // Check if consensus reached
      if (consensusScore >= this.consensusThreshold) {
        break;
      }
      
      // Update context with debate history for next round
      currentContext = this.updateContext(currentContext, responses);
    }
    
    // Final synthesis
    const finalRecommendation = await this.synthesize(context, rounds);
    
    return {
      recommendation: finalRecommendation,
      rounds,
      totalTokensUsed: this.calculateTokens(rounds),
      totalCost: this.calculateCost(rounds),
    };
  }
  
  private async runDebateRound(
    context: AnalysisContext,
    previousRounds: ConsensusRound[]
  ): Promise<Map<string, AgentResponse>> {
    const debateAgents = this.agents.filter(a => a.role !== 'synthesizer');
    
    // Run agents in parallel
    const responses = await Promise.all(
      debateAgents.map(agent => this.getAgentResponse(agent, context, previousRounds))
    );
    
    return new Map(responses.map((r, i) => [debateAgents[i].id, r]));
  }
  
  private calculateConsensus(responses: Map<string, AgentResponse>): number {
    // Extract key recommendations from each agent
    const recommendations = Array.from(responses.values())
      .map(r => r.keyPoints);
    
    // Calculate overlap/agreement score
    // This could use embedding similarity or structured comparison
    return this.computeAgreementScore(recommendations);
  }
}
```

### 7.4 When to Use Multi-Agent

```typescript
const MULTI_AGENT_TRIGGERS = {
  // High-value recommendations (>$1000/month savings)
  highValueRecommendation: (savings: number) => savings > 1000,
  
  // Conflicting signals in data
  conflictingData: (signals: Signal[]) => 
    signals.some(s => s.direction === 'up') && 
    signals.some(s => s.direction === 'down'),
  
  // Customer is enterprise tier
  enterpriseCustomer: (org: Organization) => org.plan === 'enterprise',
  
  // Recommendation affects critical systems
  criticalSystem: (scope: Scope) => scope.tags?.includes('production'),
  
  // Low confidence from single model
  lowConfidence: (confidence: number) => confidence < 0.7,
};
```

---

## 8. Optimization Recommendation Engine

### 8.1 Recommendation Types

```typescript
type RecommendationType = 
  | 'model_downgrade'      // Switch to cheaper model
  | 'model_upgrade'        // Switch to better model (quality issues)
  | 'prompt_optimization'  // Reduce prompt length
  | 'caching_opportunity'  // Enable semantic caching
  | 'batching_opportunity' // Batch similar requests
  | 'retry_optimization'   // Reduce retry waste
  | 'unused_capacity'      // Remove unused API keys/quotas
  | 'rate_limit_tuning'    // Optimize rate limits
  | 'error_reduction'      // Fix high error rates
  | 'latency_optimization' // Reduce latency (region, model)
  ;
```

### 8.2 Detection Rules

```typescript
const OPTIMIZATION_RULES: OptimizationRule[] = [
  // Rule 1: Model Downgrade Opportunity
  {
    id: 'model-downgrade-simple-tasks',
    name: 'Simple tasks using premium models',
    detect: async (data: UsageData) => {
      // Find requests using GPT-4 with short prompts and outputs
      const candidates = data.records.filter(r => 
        r.model.includes('gpt-4') &&
        r.input_tokens < 500 &&
        r.output_tokens < 200 &&
        r.metadata?.task_type !== 'complex'
      );
      
      if (candidates.length > 100) {
        const potentialSavings = calculateSavings(candidates, 'gpt-4.1-mini');
        return {
          found: true,
          type: 'model_downgrade',
          priority: potentialSavings > 500 ? 'high' : 'medium',
          evidence: {
            requestCount: candidates.length,
            currentCost: sum(candidates.map(c => c.cost)),
            projectedCost: potentialSavings.newCost,
            savings: potentialSavings.savings,
          },
        };
      }
      return { found: false };
    },
    generateRecommendation: (evidence) => ({
      title: 'Switch simple tasks from GPT-4 to GPT-4.1-mini',
      description: `We detected ${evidence.requestCount} requests that appear to be simple tasks (short prompts, short outputs) currently using GPT-4. These could likely be handled by GPT-4.1-mini at 10x lower cost.`,
      impact: {
        estimatedMonthlySavings: evidence.savings,
        confidence: 0.85,
        implementationEffort: 'low',
      },
      action: {
        type: 'model_switch',
        from: 'gpt-4',
        to: 'gpt-4.1-mini',
        scope: 'simple_tasks',
      },
    }),
  },
  
  // Rule 2: Caching Opportunity
  {
    id: 'semantic-caching',
    name: 'Repeated similar prompts',
    detect: async (data: UsageData) => {
      // Find prompts with high semantic similarity
      const promptGroups = await clusterPrompts(data.records);
      const duplicateGroups = promptGroups.filter(g => g.count > 10);
      
      if (duplicateGroups.length > 0) {
        const wastedCost = sum(duplicateGroups.map(g => 
          g.cost * (g.count - 1) // All but first are "wasted"
        ));
        
        return {
          found: true,
          type: 'caching_opportunity',
          priority: wastedCost > 200 ? 'high' : 'medium',
          evidence: {
            duplicateGroups: duplicateGroups.length,
            totalDuplicates: sum(duplicateGroups.map(g => g.count)),
            wastedCost,
          },
        };
      }
      return { found: false };
    },
  },
  
  // Rule 3: High Error Rate
  {
    id: 'high-error-rate',
    name: 'Excessive API errors',
    detect: async (data: UsageData) => {
      const errorRate = data.records.filter(r => r.status === 'error').length / data.records.length;
      
      if (errorRate > 0.05) { // >5% error rate
        const errorCost = sum(data.records.filter(r => r.status === 'error').map(r => r.cost));
        
        return {
          found: true,
          type: 'error_reduction',
          priority: 'high',
          evidence: {
            errorRate: errorRate * 100,
            errorCount: data.records.filter(r => r.status === 'error').length,
            wastedCost: errorCost,
            topErrors: groupBy(data.records.filter(r => r.status === 'error'), 'error_code'),
          },
        };
      }
      return { found: false };
    },
  },
  
  // Rule 4: Prompt Length Optimization
  {
    id: 'prompt-optimization',
    name: 'Excessively long prompts',
    detect: async (data: UsageData) => {
      // Find requests with very long system prompts
      const longPrompts = data.records.filter(r => r.input_tokens > 2000);
      
      if (longPrompts.length > 50) {
        // Estimate savings from 30% prompt reduction
        const currentCost = sum(longPrompts.map(r => r.cost));
        const potentialSavings = currentCost * 0.3;
        
        return {
          found: true,
          type: 'prompt_optimization',
          priority: potentialSavings > 300 ? 'high' : 'medium',
          evidence: {
            longPromptCount: longPrompts.length,
            avgInputTokens: avg(longPrompts.map(r => r.input_tokens)),
            potentialSavings,
          },
        };
      }
      return { found: false };
    },
  },
];
```

### 8.3 Recommendation Generation Pipeline

```typescript
async function generateRecommendations(
  organizationId: string
): Promise<Recommendation[]> {
  // Step 1: Fetch usage data
  const data = await fetchUsageData(organizationId, { days: 30 });
  
  // Step 2: Run all detection rules
  const detections = await Promise.all(
    OPTIMIZATION_RULES.map(rule => rule.detect(data))
  );
  
  // Step 3: Filter to found issues
  const issues = detections.filter(d => d.found);
  
  // Step 4: Generate recommendations
  const recommendations = issues.map((issue, i) => 
    OPTIMIZATION_RULES[i].generateRecommendation(issue.evidence)
  );
  
  // Step 5: For high-value recommendations, run multi-agent consensus
  const highValueRecs = recommendations.filter(r => 
    r.impact.estimatedMonthlySavings > 1000
  );
  
  if (highValueRecs.length > 0) {
    const consensus = new MultiAgentConsensus();
    for (const rec of highValueRecs) {
      const result = await consensus.runConsensus({
        recommendation: rec,
        usageData: data,
        organizationContext: await getOrgContext(organizationId),
      });
      
      // Update recommendation with consensus insights
      rec.description = result.recommendation.description;
      rec.impact.confidence = result.recommendation.confidence;
      rec.caveats = result.recommendation.caveats;
    }
  }
  
  // Step 6: Prioritize and return
  return recommendations.sort((a, b) => 
    b.impact.estimatedMonthlySavings - a.impact.estimatedMonthlySavings
  );
}
```

---

## 9. Supabase Implementation

### 9.1 Why Supabase?

- **PostgreSQL** - Battle-tested, supports TimescaleDB for time-series
- **Real-time** - Built-in subscriptions for live dashboards
- **Auth** - Row-level security, SSO support
- **Edge Functions** - Serverless compute for processing
- **Storage** - For report exports, backups
- **Vector** - pgvector for semantic search/caching

### 9.2 Key Supabase Features Used

```typescript
// Real-time subscriptions for live cost updates
const subscription = supabase
  .channel('usage-updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'usage_records',
      filter: `organization_id=eq.${orgId}`,
    },
    (payload) => {
      // Update dashboard in real-time
      updateDashboard(payload.new);
    }
  )
  .subscribe();

// Row-level security for multi-tenancy
-- Users can only see their organization's data
CREATE POLICY "Users can view own org data" ON usage_records
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

// Edge function for ingestion
// supabase/functions/ingest-usage/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { records } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Validate and enrich records
  const enrichedRecords = records.map(enrichRecord);
  
  // Batch insert
  const { error } = await supabase
    .from('usage_records')
    .insert(enrichedRecords);
  
  if (error) throw error;
  
  // Trigger budget checks
  await checkBudgets(enrichedRecords);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### 9.3 Database Optimization

```sql
-- Partitioning for large tables
CREATE TABLE usage_records_partitioned (
  LIKE usage_records INCLUDING ALL
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE usage_records_2025_01 PARTITION OF usage_records_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Continuous aggregates (TimescaleDB)
CREATE MATERIALIZED VIEW hourly_costs
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 hour', timestamp) AS hour,
  organization_id,
  provider,
  model,
  SUM(cost) AS total_cost,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  COUNT(*) AS request_count
FROM usage_records
GROUP BY 1, 2, 3, 4;

-- Refresh policy
SELECT add_continuous_aggregate_policy('hourly_costs',
  start_offset => INTERVAL '3 hours',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');
```

---

## 10. API Architecture

### 10.1 Public API (for customers)

```typescript
// SDK Ingestion Endpoint
POST /api/sdk/v1/track
{
  "events": [
    {
      "request_id": "req_abc123",
      "provider": "openai",
      "model": "gpt-4",
      "input_tokens": 150,
      "output_tokens": 50,
      "latency_ms": 1200,
      "status": "success",
      "metadata": {
        "feature": "chat",
        "user_id": "user_123"
      },
      "timestamp": "2025-12-28T10:30:00Z"
    }
  ]
}

// Query Costs
GET /api/v1/costs?start_date=2025-12-01&end_date=2025-12-28&group_by=model
{
  "data": [
    {
      "model": "gpt-4",
      "total_cost": 1523.45,
      "total_requests": 45000,
      "total_input_tokens": 5000000,
      "total_output_tokens": 2000000
    }
  ],
  "meta": {
    "start_date": "2025-12-01",
    "end_date": "2025-12-28",
    "currency": "USD"
  }
}

// Get Recommendations
GET /api/v1/optimization/recommendations
{
  "data": [
    {
      "id": "rec_xyz",
      "type": "model_downgrade",
      "priority": "high",
      "title": "Switch simple tasks to GPT-4.1-mini",
      "description": "...",
      "impact": {
        "estimated_monthly_savings": 1250,
        "confidence": 0.85
      },
      "status": "pending",
      "created_at": "2025-12-28T08:00:00Z"
    }
  ]
}

// Apply Recommendation
POST /api/v1/optimization/recommendations/{id}/apply
{
  "success": true,
  "applied_at": "2025-12-28T10:45:00Z"
}
```

### 10.2 Internal API (for dashboard)

```typescript
// Dashboard Overview
GET /api/internal/dashboard/overview
{
  "summary": {
    "total_spend_mtd": 45230.50,
    "spend_change_percent": 12.5,
    "total_requests_mtd": 1250000,
    "active_providers": 4,
    "pending_recommendations": 5,
    "active_alerts": 2
  },
  "spend_by_day": [...],
  "spend_by_provider": [...],
  "top_consumers": [...]
}

// Natural Language Query
POST /api/internal/assistant/query
{
  "query": "Why did our costs increase last week?"
}
// Response
{
  "answer": "Your costs increased by 23% last week primarily due to...",
  "sources": [...],
  "suggested_actions": [...]
}
```

---

## 11. Security & Compliance

### 11.1 Data Security

```typescript
// Encryption at rest (Supabase handles this)
// Encryption in transit (TLS 1.3)

// API Key encryption
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes

function encryptApiKey(apiKey: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptApiKey(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const decipher = createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### 11.2 Audit Logging

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic audit trigger
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up Supabase project with schema
- [ ] Implement authentication (NextAuth + Supabase)
- [ ] Build SDK for usage tracking
- [ ] Create basic ingestion pipeline
- [ ] Connect to OpenAI usage API
- [ ] Build core dashboard with real data

### Phase 2: Analytics (Weeks 5-8)
- [ ] Implement cost aggregation views
- [ ] Build time-series charts
- [ ] Add filtering and drill-down
- [ ] Create team/project attribution
- [ ] Implement budget tracking
- [ ] Add basic alerting

### Phase 3: Intelligence (Weeks 9-12)
- [ ] Implement anomaly detection (statistical)
- [ ] Build optimization rule engine
- [ ] Add LLM-powered explanations
- [ ] Create recommendation system
- [ ] Implement natural language assistant
- [ ] Add report generation

### Phase 4: Advanced (Weeks 13-16)
- [ ] Build smart routing engine
- [ ] Implement multi-agent consensus
- [ ] Add semantic caching detection
- [ ] Create automated actions
- [ ] Build enterprise features (SSO, RBAC)
- [ ] Add more provider integrations

---

## Appendix A: Model Pricing Reference (December 2025)

| Provider | Model | Input ($/1M) | Output ($/1M) | Context |
|----------|-------|--------------|---------------|---------|
| OpenAI | GPT-4.1 | $10.00 | $30.00 | 128K |
| OpenAI | GPT-4.1-mini | $0.40 | $1.60 | 128K |
| OpenAI | GPT-4.1-nano | $0.10 | $0.40 | 32K |
| Anthropic | Claude 3.5 Opus | $15.00 | $75.00 | 200K |
| Anthropic | Claude 3.5 Sonnet | $3.00 | $15.00 | 200K |
| Anthropic | Claude 3.5 Haiku | $0.25 | $1.25 | 200K |
| Google | Gemini 2.0 Ultra | $12.50 | $37.50 | 1M |
| Google | Gemini 2.0 Pro | $1.25 | $5.00 | 1M |
| Google | Gemini 2.0 Flash | $0.075 | $0.30 | 1M |

*Note: Prices are approximate and subject to change. Always verify with provider.*

---

## Appendix B: Glossary

- **Token**: Basic unit of text processing (roughly 4 characters or 0.75 words)
- **Input Tokens**: Tokens in the prompt/request
- **Output Tokens**: Tokens in the model's response
- **Cached Tokens**: Tokens served from cache (cheaper)
- **Context Window**: Maximum tokens a model can process
- **Latency**: Time from request to first response byte
- **TTFT**: Time to First Token
- **TPS**: Tokens Per Second (generation speed)

---

## Appendix C: References

1. [OpenAI API Documentation](https://platform.openai.com/docs)
2. [Anthropic API Documentation](https://docs.anthropic.com)
3. [Google AI Documentation](https://ai.google.dev/docs)
4. [Supabase Documentation](https://supabase.com/docs)
5. [TimescaleDB Documentation](https://docs.timescale.com)

---

*This document is a living specification and will be updated as the platform evolves.*
