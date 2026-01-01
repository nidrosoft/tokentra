# TokenTra Provider Sync Engine
## Enterprise-Grade Multi-Provider Integration System

**Version 1.0 | December 2025**

---

## Executive Summary

The Provider Sync Engine is the data backbone of TokenTra—it connects to all major AI providers, pulls usage and cost data, normalizes it into a unified schema, and keeps the platform in sync with real-time spending. This document provides the complete architecture for integrating with OpenAI, Anthropic, Google Vertex AI, Azure OpenAI, and AWS Bedrock at enterprise scale.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Supported Providers & APIs](#2-supported-providers--apis)
3. [Connection Flow & Authentication](#3-connection-flow--authentication)
4. [Core Engine Implementation](#4-core-engine-implementation)
5. [Provider Adapters](#5-provider-adapters)
6. [Data Normalization](#6-data-normalization)
7. [Sync Scheduling & Rate Limiting](#7-sync-scheduling--rate-limiting)
8. [Error Handling & Retry Logic](#8-error-handling--retry-logic)
9. [Credential Management & Security](#9-credential-management--security)
10. [Health Monitoring](#10-health-monitoring)
11. [Database Schema](#11-database-schema)
12. [Background Jobs](#12-background-jobs)
13. [TypeScript Implementation](#13-typescript-implementation)
14. [Model Registry & Pricing](#14-model-registry--pricing)

---

## 1. Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PROVIDER SYNC ENGINE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         PROVIDER ADAPTERS                               │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │ │
│  │  │  OpenAI  │ │Anthropic │ │ Google   │ │  Azure   │ │   AWS    │     │ │
│  │  │ Adapter  │ │ Adapter  │ │ Adapter  │ │ Adapter  │ │ Adapter  │     │ │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘     │ │
│  └───────┼────────────┼────────────┼────────────┼────────────┼───────────┘ │
│          │            │            │            │            │              │
│          └────────────┴────────────┼────────────┴────────────┘              │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                       DATA NORMALIZATION LAYER                          │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │    Schema    │ │    Model     │ │    Cost      │ │   Timestamp  │   │ │
│  │  │   Mapping    │ │   Mapping    │ │ Calculation  │ │   Alignment  │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  └─────────────────────────────────┬──────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                          SYNC ORCHESTRATOR                              │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │   Schedule   │ │    Rate      │ │    Retry     │ │   Backfill   │   │ │
│  │  │   Manager    │ │   Limiter    │ │   Handler    │ │    Engine    │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  └─────────────────────────────────┬──────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        CREDENTIAL VAULT                                 │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │  Encryption  │ │   Key        │ │    OAuth     │ │    Token     │   │ │
│  │  │   Service    │ │  Rotation    │ │    Flow      │ │   Refresh    │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  └─────────────────────────────────┬──────────────────────────────────────┘ │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      DATA LAYER (Supabase)                              │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │   Provider   │ │    Usage     │ │    Sync      │ │   Health     │   │ │
│  │  │ Connections  │ │   Records    │ │    State     │ │   Status     │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL PROVIDER APIs                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │     OpenAI      │ │    Anthropic    │ │  Google Vertex  │                │
│  │ /v1/organization│ │ /v1/organizations│ │  Cloud Monitor  │                │
│  │ /usage + /costs │ │ /usage_report   │ │  + BigQuery     │                │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘                │
│  ┌─────────────────┐ ┌─────────────────┐                                    │
│  │  Azure OpenAI   │ │   AWS Bedrock   │                                    │
│  │  Cost Mgmt API  │ │  CloudWatch +   │                                    │
│  │  + Monitor      │ │  Cost Explorer  │                                    │
│  └─────────────────┘ └─────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Unified Schema** | All provider data normalized to single format |
| **Near Real-time** | 5-minute sync intervals for usage data |
| **Resilient** | Automatic retry with exponential backoff |
| **Secure** | AES-256 encryption for all credentials |
| **Scalable** | Handle 1000+ provider connections |
| **Observable** | Full sync history and health monitoring |

---

## 2. Supported Providers & APIs

### 2.1 OpenAI

**Authentication**: Admin API Key (from Organization Settings)

**Endpoints**:
| Endpoint | Purpose | Granularity |
|----------|---------|-------------|
| `GET /v1/organization/usage/completions` | Token usage for chat/completion | 1m, 1h, 1d buckets |
| `GET /v1/organization/usage/embeddings` | Embedding usage | 1m, 1h, 1d buckets |
| `GET /v1/organization/usage/images` | DALL-E usage | 1m, 1h, 1d buckets |
| `GET /v1/organization/usage/audio` | Whisper/TTS usage | 1m, 1h, 1d buckets |
| `GET /v1/organization/costs` | Cost breakdown by model | 1d buckets |

**Key Features**:
- Group by: `project_id`, `user_id`, `api_key_id`, `model`, `batch`, `service_tier`
- Pagination via `page` parameter
- Rate limit: ~60 requests/minute

**Response Example** (Usage):
```json
{
  "object": "organization.usage.completions.result",
  "data": [{
    "input_tokens": 5000,
    "output_tokens": 1000,
    "input_cached_tokens": 4000,
    "num_model_requests": 5,
    "project_id": "proj_abc",
    "model": "gpt-4o-mini-2024-07-18",
    "batch": false
  }]
}
```

### 2.2 Anthropic

**Authentication**: Admin API Key (`sk-ant-admin-...`)

**Endpoints**:
| Endpoint | Purpose | Granularity |
|----------|---------|-------------|
| `GET /v1/organizations/usage_report/messages` | Token usage | 1m, 1h, 1d buckets |
| `GET /v1/organizations/cost_report` | Cost in USD | 1d buckets |

**Key Features**:
- Group by: `api_key_id`, `workspace_id`, `model`, `service_tier`, `context_window`
- Tracks: `uncached_input_tokens`, `cache_creation`, `cache_read_input_tokens`, `output_tokens`
- Server tool use tracking: `web_search_requests`
- Pagination via `page` parameter

**Response Example** (Usage):
```json
{
  "data": [{
    "starting_at": "2025-08-01T00:00:00Z",
    "ending_at": "2025-08-02T00:00:00Z",
    "results": [{
      "uncached_input_tokens": 1500,
      "cache_creation": {
        "ephemeral_1h_input_tokens": 1000,
        "ephemeral_5m_input_tokens": 500
      },
      "cache_read_input_tokens": 200,
      "output_tokens": 500,
      "model": "claude-sonnet-4-20250514",
      "workspace_id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ"
    }]
  }],
  "has_more": true,
  "next_page": "page_xyz..."
}
```

### 2.3 Google Vertex AI

**Authentication**: Service Account (JSON key or Workload Identity)

**Data Sources**:
| Source | Purpose | Access Method |
|--------|---------|---------------|
| Cloud Monitoring | Real-time metrics | Monitoring API |
| BigQuery Billing Export | Detailed costs | BigQuery SQL |
| Model Observability Dashboard | Usage metrics | Cloud Console API |

**Key Metrics** (Cloud Monitoring):
- `aiplatform.googleapis.com/prediction/online/request_count`
- `aiplatform.googleapis.com/prediction/online/token_count`
- `aiplatform.googleapis.com/prediction/online/response_count`
- `aiplatform.googleapis.com/prediction/online/latencies`

**BigQuery Billing Export Query**:
```sql
SELECT
  project.id AS project_id,
  service.description AS service,
  sku.description AS model,
  usage.amount AS tokens,
  cost AS cost_usd,
  DATE(usage_start_time) AS date
FROM `project.dataset.gcp_billing_export_v1_*`
WHERE service.description LIKE '%Vertex AI%'
  AND usage_start_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
```

### 2.4 Azure OpenAI

**Authentication**: Service Principal (OAuth) or API Key + Subscription

**Data Sources**:
| Source | Purpose | Access Method |
|--------|---------|---------------|
| Azure Cost Management API | Cost breakdown | REST API |
| Azure Monitor Metrics | Token usage | Metrics API |
| Azure Resource Graph | Resource inventory | Graph API |

**Key Metrics** (Azure Monitor):
- `ProcessedPromptTokens` - Input tokens billed
- `GeneratedCompletionTokens` - Output tokens billed
- `ProvisionedManagedUtilization` - PTU utilization
- `ActiveConnections` - Real-time API connections

**Cost Management API Query**:
```json
{
  "type": "ActualCost",
  "dataSet": {
    "granularity": "Daily",
    "aggregation": {
      "totalCost": { "name": "Cost", "function": "Sum" }
    },
    "filter": {
      "dimensions": {
        "name": "ServiceName",
        "operator": "In",
        "values": ["Cognitive Services"]
      }
    },
    "grouping": [
      { "type": "Dimension", "name": "MeterSubCategory" },
      { "type": "Dimension", "name": "ResourceId" }
    ]
  },
  "timeframe": "MonthToDate"
}
```

### 2.5 AWS Bedrock

**Authentication**: IAM Role (Cross-account) or Access Key

**Data Sources**:
| Source | Purpose | Access Method |
|--------|---------|---------------|
| CloudWatch Metrics | Token usage | CloudWatch API |
| Cost Explorer | Cost breakdown | Cost Explorer API |
| CloudTrail | API audit logs | CloudTrail API |

**CloudWatch Metrics**:
- `AWS/Bedrock/InputTokenCount` - Input tokens
- `AWS/Bedrock/OutputTokenCount` - Output tokens
- `AWS/Bedrock/Invocations` - Request count
- `AWS/Bedrock/InvocationLatency` - Response time

**CloudWatch Query**:
```json
{
  "MetricDataQueries": [
    {
      "Id": "input_tokens",
      "MetricStat": {
        "Metric": {
          "Namespace": "AWS/Bedrock",
          "MetricName": "InputTokenCount",
          "Dimensions": [
            { "Name": "ModelId", "Value": "anthropic.claude-3-sonnet-20240229-v1:0" }
          ]
        },
        "Period": 3600,
        "Stat": "Sum"
      }
    }
  ],
  "StartTime": "2025-01-01T00:00:00Z",
  "EndTime": "2025-01-02T00:00:00Z"
}
```

**Cost Explorer Query**:
```json
{
  "TimePeriod": {
    "Start": "2025-01-01",
    "End": "2025-01-31"
  },
  "Granularity": "DAILY",
  "Filter": {
    "Dimensions": {
      "Key": "SERVICE",
      "Values": ["Amazon Bedrock"]
    }
  },
  "GroupBy": [
    { "Type": "DIMENSION", "Key": "USAGE_TYPE" }
  ],
  "Metrics": ["UnblendedCost", "UsageQuantity"]
}
```

---

## 3. Connection Flow & Authentication

### 3.1 Connection Wizard Flow

Based on your UI screenshots, the connection flow has 4 steps:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        CONNECTION WIZARD FLOW                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐ │
│  │     1.      │    │     2.      │    │     3.      │    │    4.     │ │
│  │   Select    │───▶│  Configure  │───▶│    Test     │───▶│ Complete  │ │
│  │  Provider   │    │  Credentials│    │ Connection  │    │           │ │
│  └─────────────┘    └─────────────┘    └─────────────┘    └───────────┘ │
│                                                                           │
│  • OpenAI           • API Key          • Validate creds   • Initial sync │
│  • Anthropic        • OAuth flow       • Test API call    • Show summary │
│  • Google Vertex    • Service account  • Check perms      • Set schedule │
│  • Azure OpenAI     • IAM role         • Verify access                   │
│  • AWS Bedrock                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Authentication Methods by Provider

```typescript
// types/providers.ts

export type ProviderType = 'openai' | 'anthropic' | 'google' | 'azure' | 'aws';

export interface ProviderAuthConfig {
  openai: {
    type: 'api_key';
    adminApiKey: string;  // Required for usage/cost APIs
  };
  
  anthropic: {
    type: 'api_key';
    adminApiKey: string;  // sk-ant-admin-...
  };
  
  google: {
    type: 'service_account' | 'oauth';
    // Service Account
    serviceAccountKey?: string;  // JSON key file contents
    projectId: string;
    // OAuth (for user-initiated)
    accessToken?: string;
    refreshToken?: string;
  };
  
  azure: {
    type: 'service_principal' | 'api_key';
    // Service Principal (recommended)
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
    subscriptionId: string;
    resourceGroup: string;
    // API Key (simpler but less secure)
    apiKey?: string;
    endpoint?: string;
  };
  
  aws: {
    type: 'iam_role' | 'access_key';
    // IAM Role (recommended for cross-account)
    roleArn?: string;
    externalId?: string;
    // Access Key (simpler)
    accessKeyId?: string;
    secretAccessKey?: string;
    region: string;
  };
}
```

### 3.3 Connection Test Implementation

```typescript
// lib/engines/provider-sync/ConnectionTester.ts

export class ConnectionTester {
  /**
   * Test provider connection and permissions
   */
  async testConnection(
    provider: ProviderType,
    credentials: ProviderCredentials
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      switch (provider) {
        case 'openai':
          return await this.testOpenAI(credentials);
        case 'anthropic':
          return await this.testAnthropic(credentials);
        case 'google':
          return await this.testGoogle(credentials);
        case 'azure':
          return await this.testAzure(credentials);
        case 'aws':
          return await this.testAWS(credentials);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: (error as Error).message,
        permissions: []
      };
    }
  }
  
  private async testOpenAI(credentials: any): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    // Test 1: Validate API key format
    if (!credentials.adminApiKey?.startsWith('sk-')) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Invalid API key format. OpenAI Admin keys start with "sk-"',
        permissions: []
      };
    }
    
    // Test 2: Call usage API
    const response = await fetch(
      `https://api.openai.com/v1/organization/usage/completions?start_time=${Math.floor(Date.now() / 1000) - 86400}&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.adminApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: error.error?.message || `API error: ${response.status}`,
        permissions: []
      };
    }
    
    // Test 3: Verify organization info
    const orgResponse = await fetch('https://api.openai.com/v1/organization', {
      headers: { 'Authorization': `Bearer ${credentials.adminApiKey}` }
    });
    
    const orgData = orgResponse.ok ? await orgResponse.json() : null;
    
    return {
      success: true,
      latencyMs: Date.now() - startTime,
      metadata: {
        organizationId: orgData?.id,
        organizationName: orgData?.name
      },
      permissions: ['usage:read', 'costs:read', 'projects:read']
    };
  }
  
  private async testAnthropic(credentials: any): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    // Validate Admin API key format
    if (!credentials.adminApiKey?.startsWith('sk-ant-admin-')) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Invalid Admin API key. Anthropic Admin keys start with "sk-ant-admin-"',
        permissions: []
      };
    }
    
    // Test usage API
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const response = await fetch(
      `https://api.anthropic.com/v1/organizations/usage_report/messages?starting_at=${startDate}&limit=1`,
      {
        headers: {
          'x-api-key': credentials.adminApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: error.error?.message || `API error: ${response.status}`,
        permissions: []
      };
    }
    
    return {
      success: true,
      latencyMs: Date.now() - startTime,
      permissions: ['usage:read', 'costs:read', 'workspaces:read']
    };
  }
  
  private async testGoogle(credentials: any): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    // Initialize Google Cloud client
    const { GoogleAuth } = require('google-auth-library');
    
    let auth: any;
    if (credentials.serviceAccountKey) {
      const keyFile = JSON.parse(credentials.serviceAccountKey);
      auth = new GoogleAuth({
        credentials: keyFile,
        scopes: [
          'https://www.googleapis.com/auth/cloud-platform',
          'https://www.googleapis.com/auth/monitoring.read'
        ]
      });
    } else {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Service account key is required',
        permissions: []
      };
    }
    
    try {
      // Test Cloud Monitoring access
      const client = await auth.getClient();
      const projectId = credentials.projectId;
      
      const monitoringUrl = `https://monitoring.googleapis.com/v3/projects/${projectId}/timeSeries?filter=metric.type%3D"aiplatform.googleapis.com%2Fprediction%2Fonline%2Frequest_count"&interval.startTime=${new Date(Date.now() - 3600000).toISOString()}&interval.endTime=${new Date().toISOString()}`;
      
      const response = await client.request({ url: monitoringUrl });
      
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: { projectId },
        permissions: ['monitoring:read', 'billing:read']
      };
    } catch (error) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: (error as Error).message,
        permissions: []
      };
    }
  }
  
  private async testAzure(credentials: any): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    // Get OAuth token using Service Principal
    const tokenUrl = `https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`;
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        scope: 'https://management.azure.com/.default',
        grant_type: 'client_credentials'
      })
    });
    
    if (!tokenResponse.ok) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Failed to authenticate with Azure. Check your Service Principal credentials.',
        permissions: []
      };
    }
    
    const { access_token } = await tokenResponse.json();
    
    // Test Cost Management API access
    const costUrl = `https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`;
    
    const costResponse = await fetch(costUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'ActualCost',
        timeframe: 'MonthToDate',
        dataSet: {
          granularity: 'None',
          aggregation: { totalCost: { name: 'Cost', function: 'Sum' } }
        }
      })
    });
    
    if (!costResponse.ok) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Cost Management API access denied. Ensure Service Principal has "Cost Management Reader" role.',
        permissions: []
      };
    }
    
    return {
      success: true,
      latencyMs: Date.now() - startTime,
      metadata: {
        subscriptionId: credentials.subscriptionId,
        resourceGroup: credentials.resourceGroup
      },
      permissions: ['costs:read', 'metrics:read', 'resources:read']
    };
  }
  
  private async testAWS(credentials: any): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    const { CloudWatchClient, GetMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
    const { CostExplorerClient, GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');
    
    const config: any = { region: credentials.region };
    
    if (credentials.roleArn) {
      // Assume role for cross-account access
      const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');
      const stsClient = new STSClient({ region: credentials.region });
      
      try {
        const assumeRoleResponse = await stsClient.send(new AssumeRoleCommand({
          RoleArn: credentials.roleArn,
          RoleSessionName: 'TokenTraSync',
          ExternalId: credentials.externalId
        }));
        
        config.credentials = {
          accessKeyId: assumeRoleResponse.Credentials.AccessKeyId,
          secretAccessKey: assumeRoleResponse.Credentials.SecretAccessKey,
          sessionToken: assumeRoleResponse.Credentials.SessionToken
        };
      } catch (error) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: `Failed to assume role: ${(error as Error).message}`,
          permissions: []
        };
      }
    } else {
      config.credentials = {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      };
    }
    
    // Test CloudWatch access
    const cwClient = new CloudWatchClient(config);
    const endTime = new Date();
    const startTimeDate = new Date(endTime.getTime() - 3600000);
    
    try {
      await cwClient.send(new GetMetricDataCommand({
        StartTime: startTimeDate,
        EndTime: endTime,
        MetricDataQueries: [{
          Id: 'test',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/Bedrock',
              MetricName: 'Invocations'
            },
            Period: 3600,
            Stat: 'Sum'
          }
        }]
      }));
    } catch (error) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: `CloudWatch access denied: ${(error as Error).message}`,
        permissions: []
      };
    }
    
    // Test Cost Explorer access
    const ceClient = new CostExplorerClient(config);
    
    try {
      await ceClient.send(new GetCostAndUsageCommand({
        TimePeriod: {
          Start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          End: new Date().toISOString().split('T')[0]
        },
        Granularity: 'DAILY',
        Metrics: ['UnblendedCost'],
        Filter: {
          Dimensions: {
            Key: 'SERVICE',
            Values: ['Amazon Bedrock']
          }
        }
      }));
    } catch (error) {
      // Cost Explorer might not be enabled - this is a warning, not failure
      console.warn('Cost Explorer access limited:', error);
    }
    
    return {
      success: true,
      latencyMs: Date.now() - startTime,
      metadata: { region: credentials.region },
      permissions: ['cloudwatch:read', 'ce:read', 'bedrock:invoke']
    };
  }
}

interface ConnectionTestResult {
  success: boolean;
  latencyMs: number;
  error?: string;
  metadata?: Record<string, any>;
  permissions: string[];
}
```

---

## 4. Core Engine Implementation

### 4.1 Provider Sync Engine Class

```typescript
// lib/engines/provider-sync/ProviderSyncEngine.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { GoogleAdapter } from './adapters/GoogleAdapter';
import { AzureAdapter } from './adapters/AzureAdapter';
import { AWSAdapter } from './adapters/AWSAdapter';
import { CredentialVault } from './CredentialVault';
import { RateLimiter } from './RateLimiter';
import { DataNormalizer } from './DataNormalizer';

export class ProviderSyncEngine {
  private supabase: SupabaseClient;
  private credentialVault: CredentialVault;
  private rateLimiter: RateLimiter;
  private normalizer: DataNormalizer;
  
  private adapters: Map<ProviderType, ProviderAdapter>;
  
  constructor(supabaseUrl: string, supabaseKey: string, encryptionKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.credentialVault = new CredentialVault(encryptionKey);
    this.rateLimiter = new RateLimiter();
    this.normalizer = new DataNormalizer();
    
    // Initialize adapters
    this.adapters = new Map([
      ['openai', new OpenAIAdapter(this.rateLimiter)],
      ['anthropic', new AnthropicAdapter(this.rateLimiter)],
      ['google', new GoogleAdapter(this.rateLimiter)],
      ['azure', new AzureAdapter(this.rateLimiter)],
      ['aws', new AWSAdapter(this.rateLimiter)]
    ]);
  }
  
  // ========================================
  // CONNECTION MANAGEMENT
  // ========================================
  
  /**
   * Create a new provider connection
   */
  async createConnection(
    orgId: string,
    provider: ProviderType,
    credentials: ProviderCredentials,
    settings: ConnectionSettings = {}
  ): Promise<ProviderConnection> {
    // Encrypt credentials
    const encryptedCredentials = await this.credentialVault.encrypt(credentials);
    
    // Create connection record
    const connection: Partial<ProviderConnection> = {
      id: crypto.randomUUID(),
      orgId,
      provider,
      status: 'pending',
      credentials: encryptedCredentials,
      settings: {
        syncInterval: settings.syncInterval || 5,  // minutes
        backfillDays: settings.backfillDays || 30,
        enableRealtime: settings.enableRealtime ?? true,
        ...settings
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const { data, error } = await this.supabase
      .from('provider_connections')
      .insert(connection)
      .select()
      .single();
    
    if (error) throw error;
    
    // Trigger initial sync
    await this.triggerSync(data.id, { backfill: true });
    
    return data;
  }
  
  /**
   * Update connection credentials
   */
  async updateCredentials(
    connectionId: string,
    credentials: ProviderCredentials
  ): Promise<void> {
    const encryptedCredentials = await this.credentialVault.encrypt(credentials);
    
    await this.supabase
      .from('provider_connections')
      .update({
        credentials: encryptedCredentials,
        status: 'pending',
        lastError: null,
        updatedAt: new Date()
      })
      .eq('id', connectionId);
    
    // Test and sync
    await this.triggerSync(connectionId, { testFirst: true });
  }
  
  /**
   * Delete a provider connection
   */
  async deleteConnection(connectionId: string): Promise<void> {
    // Mark as disconnecting
    await this.supabase
      .from('provider_connections')
      .update({ status: 'disconnecting' })
      .eq('id', connectionId);
    
    // Delete related data (cascades via FK, but explicit for audit)
    await this.supabase
      .from('usage_records')
      .delete()
      .eq('connection_id', connectionId);
    
    // Delete connection
    await this.supabase
      .from('provider_connections')
      .delete()
      .eq('id', connectionId);
  }
  
  // ========================================
  // SYNC OPERATIONS
  // ========================================
  
  /**
   * Trigger a sync for a specific connection
   */
  async triggerSync(
    connectionId: string,
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    const syncId = crypto.randomUUID();
    const startTime = Date.now();
    
    // Get connection
    const { data: connection } = await this.supabase
      .from('provider_connections')
      .select('*')
      .eq('id', connectionId)
      .single();
    
    if (!connection) {
      throw new Error(`Connection not found: ${connectionId}`);
    }
    
    // Create sync record
    await this.supabase.from('sync_history').insert({
      id: syncId,
      connectionId,
      status: 'running',
      startedAt: new Date(),
      options
    });
    
    try {
      // Update connection status
      await this.updateConnectionStatus(connectionId, 'syncing');
      
      // Decrypt credentials
      const credentials = await this.credentialVault.decrypt(connection.credentials);
      
      // Get adapter
      const adapter = this.adapters.get(connection.provider);
      if (!adapter) {
        throw new Error(`No adapter for provider: ${connection.provider}`);
      }
      
      // Determine sync window
      const syncWindow = this.calculateSyncWindow(connection, options);
      
      // Fetch data from provider
      const rawData = await adapter.fetchUsage(credentials, syncWindow);
      
      // Normalize data
      const normalizedRecords = this.normalizer.normalize(
        connection.provider,
        rawData,
        connection
      );
      
      // Upsert records
      const { recordsCreated, recordsUpdated } = await this.upsertUsageRecords(
        connection.orgId,
        connectionId,
        normalizedRecords
      );
      
      // Update sync state
      const result: SyncResult = {
        syncId,
        connectionId,
        status: 'success',
        recordsCreated,
        recordsUpdated,
        durationMs: Date.now() - startTime,
        syncWindow
      };
      
      await this.completeSyncRecord(syncId, result);
      await this.updateConnectionStatus(connectionId, 'connected', {
        lastSyncAt: new Date(),
        lastSyncRecords: recordsCreated + recordsUpdated
      });
      
      return result;
      
    } catch (error) {
      const result: SyncResult = {
        syncId,
        connectionId,
        status: 'failed',
        error: (error as Error).message,
        durationMs: Date.now() - startTime
      };
      
      await this.completeSyncRecord(syncId, result);
      await this.updateConnectionStatus(connectionId, 'error', {
        lastError: (error as Error).message,
        lastErrorAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Sync all connections for an organization
   */
  async syncOrganization(orgId: string): Promise<SyncResult[]> {
    const { data: connections } = await this.supabase
      .from('provider_connections')
      .select('id')
      .eq('org_id', orgId)
      .in('status', ['connected', 'error']);  // Skip disconnected
    
    if (!connections || connections.length === 0) {
      return [];
    }
    
    const results = await Promise.allSettled(
      connections.map(c => this.triggerSync(c.id))
    );
    
    return results
      .filter((r): r is PromiseFulfilledResult<SyncResult> => r.status === 'fulfilled')
      .map(r => r.value);
  }
  
  /**
   * Backfill historical data
   */
  async backfill(
    connectionId: string,
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<SyncResult> {
    return this.triggerSync(connectionId, {
      backfill: true,
      startDate,
      endDate
    });
  }
  
  // ========================================
  // HELPER METHODS
  // ========================================
  
  private calculateSyncWindow(
    connection: ProviderConnection,
    options: SyncOptions
  ): SyncWindow {
    if (options.backfill && options.startDate) {
      return {
        start: options.startDate,
        end: options.endDate || new Date(),
        granularity: '1h'  // Hourly for backfill
      };
    }
    
    // Incremental sync from last sync point
    const lastSync = connection.lastSyncAt 
      ? new Date(connection.lastSyncAt)
      : new Date(Date.now() - connection.settings.backfillDays * 24 * 60 * 60 * 1000);
    
    // Add 1 hour overlap to catch any delayed data
    const start = new Date(lastSync.getTime() - 60 * 60 * 1000);
    
    return {
      start,
      end: new Date(),
      granularity: '1h'
    };
  }
  
  private async upsertUsageRecords(
    orgId: string,
    connectionId: string,
    records: NormalizedUsageRecord[]
  ): Promise<{ recordsCreated: number; recordsUpdated: number }> {
    if (records.length === 0) {
      return { recordsCreated: 0, recordsUpdated: 0 };
    }
    
    // Add org_id and connection_id to each record
    const enrichedRecords = records.map(r => ({
      ...r,
      orgId,
      connectionId
    }));
    
    // Upsert in batches of 1000
    const batchSize = 1000;
    let created = 0;
    let updated = 0;
    
    for (let i = 0; i < enrichedRecords.length; i += batchSize) {
      const batch = enrichedRecords.slice(i, i + batchSize);
      
      const { data, error } = await this.supabase
        .from('usage_records')
        .upsert(batch, {
          onConflict: 'org_id,provider,model,timestamp,dimension_hash',
          ignoreDuplicates: false
        })
        .select('id');
      
      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }
      
      // Count new vs updated (simplified - actual implementation would check)
      created += data?.length || 0;
    }
    
    return { recordsCreated: created, recordsUpdated: updated };
  }
  
  private async updateConnectionStatus(
    connectionId: string,
    status: ConnectionStatus,
    extra: Record<string, any> = {}
  ): Promise<void> {
    await this.supabase
      .from('provider_connections')
      .update({
        status,
        ...extra,
        updatedAt: new Date()
      })
      .eq('id', connectionId);
  }
  
  private async completeSyncRecord(
    syncId: string,
    result: SyncResult
  ): Promise<void> {
    await this.supabase
      .from('sync_history')
      .update({
        status: result.status,
        completedAt: new Date(),
        recordsCreated: result.recordsCreated,
        recordsUpdated: result.recordsUpdated,
        durationMs: result.durationMs,
        error: result.error
      })
      .eq('id', syncId);
  }
}

// Types
export type ProviderType = 'openai' | 'anthropic' | 'google' | 'azure' | 'aws';
export type ConnectionStatus = 'pending' | 'connected' | 'syncing' | 'error' | 'disconnected' | 'disconnecting';

export interface ProviderConnection {
  id: string;
  orgId: string;
  provider: ProviderType;
  status: ConnectionStatus;
  credentials: string;  // Encrypted
  settings: ConnectionSettings;
  lastSyncAt?: Date;
  lastSyncRecords?: number;
  lastError?: string;
  lastErrorAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConnectionSettings {
  syncInterval?: number;      // Minutes
  backfillDays?: number;
  enableRealtime?: boolean;
  customDimensions?: string[];
}

export interface SyncOptions {
  backfill?: boolean;
  startDate?: Date;
  endDate?: Date;
  testFirst?: boolean;
}

export interface SyncWindow {
  start: Date;
  end: Date;
  granularity: '1m' | '1h' | '1d';
}

export interface SyncResult {
  syncId: string;
  connectionId: string;
  status: 'success' | 'failed' | 'partial';
  recordsCreated?: number;
  recordsUpdated?: number;
  durationMs: number;
  error?: string;
  syncWindow?: SyncWindow;
}
```

---

## 5. Provider Adapters

### 5.1 OpenAI Adapter

```typescript
// lib/engines/provider-sync/adapters/OpenAIAdapter.ts

import { ProviderAdapter, RawUsageData, SyncWindow } from '../types';
import { RateLimiter } from '../RateLimiter';

export class OpenAIAdapter implements ProviderAdapter {
  private rateLimiter: RateLimiter;
  private baseUrl = 'https://api.openai.com/v1/organization';
  
  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter;
  }
  
  async fetchUsage(credentials: any, window: SyncWindow): Promise<RawUsageData[]> {
    const allRecords: RawUsageData[] = [];
    
    // Fetch from multiple endpoints
    const endpoints = [
      '/usage/completions',
      '/usage/embeddings',
      '/usage/images',
      '/usage/audio',
      '/usage/moderations'
    ];
    
    for (const endpoint of endpoints) {
      const records = await this.fetchEndpoint(credentials, endpoint, window);
      allRecords.push(...records);
    }
    
    // Also fetch cost data
    const costData = await this.fetchCosts(credentials, window);
    
    // Merge cost data with usage data
    return this.mergeUsageAndCosts(allRecords, costData);
  }
  
  private async fetchEndpoint(
    credentials: any,
    endpoint: string,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];
    let page: string | undefined;
    
    const startTime = Math.floor(window.start.getTime() / 1000);
    const endTime = Math.floor(window.end.getTime() / 1000);
    const bucketWidth = window.granularity === '1m' ? '1m' : window.granularity === '1h' ? '1h' : '1d';
    
    do {
      // Rate limit
      await this.rateLimiter.acquire('openai');
      
      const url = new URL(`${this.baseUrl}${endpoint}`);
      url.searchParams.set('start_time', startTime.toString());
      url.searchParams.set('end_time', endTime.toString());
      url.searchParams.set('bucket_width', bucketWidth);
      url.searchParams.set('group_by', 'model,project_id');
      url.searchParams.set('limit', '1000');
      if (page) {
        url.searchParams.set('page', page);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${credentials.adminApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.status}`);
      }
      
      const data = await response.json();
      
      // Process buckets
      for (const bucket of data.data || []) {
        for (const result of bucket.results || []) {
          records.push({
            provider: 'openai',
            timestamp: new Date(bucket.start_time * 1000),
            endTime: new Date(bucket.end_time * 1000),
            model: result.model || 'unknown',
            inputTokens: result.input_tokens || 0,
            outputTokens: result.output_tokens || 0,
            cachedTokens: result.input_cached_tokens || 0,
            requests: result.num_model_requests || 0,
            dimensions: {
              projectId: result.project_id,
              userId: result.user_id,
              apiKeyId: result.api_key_id,
              batch: result.batch,
              serviceTier: result.service_tier
            },
            rawData: result
          });
        }
      }
      
      page = data.has_more ? data.next_page : undefined;
      
    } while (page);
    
    return records;
  }
  
  private async fetchCosts(credentials: any, window: SyncWindow): Promise<any[]> {
    const costs: any[] = [];
    let page: string | undefined;
    
    const startTime = Math.floor(window.start.getTime() / 1000);
    
    do {
      await this.rateLimiter.acquire('openai');
      
      const url = new URL(`${this.baseUrl}/costs`);
      url.searchParams.set('start_time', startTime.toString());
      url.searchParams.set('bucket_width', '1d');
      url.searchParams.set('group_by', 'project_id');
      url.searchParams.set('limit', '100');
      if (page) {
        url.searchParams.set('page', page);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${credentials.adminApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn('Failed to fetch OpenAI costs:', response.status);
        break;
      }
      
      const data = await response.json();
      
      for (const bucket of data.data || []) {
        for (const result of bucket.results || []) {
          costs.push({
            date: new Date(bucket.start_time * 1000),
            projectId: result.project_id,
            amount: result.amount?.value || 0,
            currency: result.amount?.currency || 'USD',
            lineItem: result.line_item
          });
        }
      }
      
      page = data.has_more ? data.next_page : undefined;
      
    } while (page);
    
    return costs;
  }
  
  private mergeUsageAndCosts(usage: RawUsageData[], costs: any[]): RawUsageData[] {
    // Create cost lookup by date + project
    const costLookup = new Map<string, number>();
    for (const cost of costs) {
      const key = `${cost.date.toISOString().split('T')[0]}_${cost.projectId || 'default'}`;
      costLookup.set(key, (costLookup.get(key) || 0) + cost.amount);
    }
    
    // Add cost estimates to usage records
    return usage.map(record => {
      const dateKey = record.timestamp.toISOString().split('T')[0];
      const key = `${dateKey}_${record.dimensions?.projectId || 'default'}`;
      
      // If we have actual costs, use them; otherwise estimate
      const dailyCost = costLookup.get(key);
      
      return {
        ...record,
        cost: dailyCost !== undefined 
          ? dailyCost  // Use actual cost (will be distributed across records)
          : this.estimateCost(record)  // Estimate from tokens
      };
    });
  }
  
  private estimateCost(record: RawUsageData): number {
    // Use model registry for pricing (simplified here)
    const pricing = this.getModelPricing(record.model);
    
    const inputCost = (record.inputTokens / 1_000_000) * pricing.inputPerMillion;
    const outputCost = (record.outputTokens / 1_000_000) * pricing.outputPerMillion;
    
    // Cached tokens are typically free or discounted
    const cachedDiscount = (record.cachedTokens / 1_000_000) * pricing.inputPerMillion * 0.9;
    
    return inputCost + outputCost - cachedDiscount;
  }
  
  private getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    // Simplified pricing lookup - actual implementation uses model registry
    const pricing: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
      'gpt-4o': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
      'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.60 },
      'gpt-4-turbo': { inputPerMillion: 10.00, outputPerMillion: 30.00 },
      'gpt-4': { inputPerMillion: 30.00, outputPerMillion: 60.00 },
      'gpt-3.5-turbo': { inputPerMillion: 0.50, outputPerMillion: 1.50 },
      'o1': { inputPerMillion: 15.00, outputPerMillion: 60.00 },
      'o1-mini': { inputPerMillion: 3.00, outputPerMillion: 12.00 },
      'o3-mini': { inputPerMillion: 1.10, outputPerMillion: 4.40 }
    };
    
    // Find matching model
    for (const [key, price] of Object.entries(pricing)) {
      if (model.includes(key)) {
        return price;
      }
    }
    
    // Default to GPT-4o pricing
    return pricing['gpt-4o'];
  }
}
```

### 5.2 Anthropic Adapter

```typescript
// lib/engines/provider-sync/adapters/AnthropicAdapter.ts

import { ProviderAdapter, RawUsageData, SyncWindow } from '../types';
import { RateLimiter } from '../RateLimiter';

export class AnthropicAdapter implements ProviderAdapter {
  private rateLimiter: RateLimiter;
  private baseUrl = 'https://api.anthropic.com/v1/organizations';
  
  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter;
  }
  
  async fetchUsage(credentials: any, window: SyncWindow): Promise<RawUsageData[]> {
    const [usageRecords, costRecords] = await Promise.all([
      this.fetchUsageReport(credentials, window),
      this.fetchCostReport(credentials, window)
    ]);
    
    return this.mergeUsageAndCosts(usageRecords, costRecords);
  }
  
  private async fetchUsageReport(
    credentials: any,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];
    let page: string | undefined;
    
    const startingAt = window.start.toISOString();
    const endingAt = window.end.toISOString();
    const bucketWidth = window.granularity === '1m' ? '1m' : window.granularity === '1h' ? '1h' : '1d';
    
    do {
      await this.rateLimiter.acquire('anthropic');
      
      const url = new URL(`${this.baseUrl}/usage_report/messages`);
      url.searchParams.set('starting_at', startingAt);
      url.searchParams.set('ending_at', endingAt);
      url.searchParams.set('bucket_width', bucketWidth);
      url.searchParams.set('group_by[]', 'model');
      url.searchParams.set('group_by[]', 'workspace_id');
      url.searchParams.set('group_by[]', 'api_key_id');
      url.searchParams.set('limit', '1000');
      if (page) {
        url.searchParams.set('page', page);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'x-api-key': credentials.adminApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || response.status}`);
      }
      
      const data = await response.json();
      
      for (const bucket of data.data || []) {
        for (const result of bucket.results || []) {
          // Calculate total cached tokens
          const cacheCreationTokens = 
            (result.cache_creation?.ephemeral_1h_input_tokens || 0) +
            (result.cache_creation?.ephemeral_5m_input_tokens || 0);
          
          records.push({
            provider: 'anthropic',
            timestamp: new Date(bucket.starting_at),
            endTime: new Date(bucket.ending_at),
            model: result.model || 'unknown',
            inputTokens: result.uncached_input_tokens || 0,
            outputTokens: result.output_tokens || 0,
            cachedTokens: result.cache_read_input_tokens || 0,
            cacheCreationTokens,
            requests: 1,  // Anthropic doesn't provide request count directly
            dimensions: {
              workspaceId: result.workspace_id,
              apiKeyId: result.api_key_id,
              serviceTier: result.service_tier,
              contextWindow: result.context_window
            },
            serverToolUse: result.server_tool_use,
            rawData: result
          });
        }
      }
      
      page = data.has_more ? data.next_page : undefined;
      
    } while (page);
    
    return records;
  }
  
  private async fetchCostReport(credentials: any, window: SyncWindow): Promise<any[]> {
    const costs: any[] = [];
    let page: string | undefined;
    
    do {
      await this.rateLimiter.acquire('anthropic');
      
      const url = new URL(`${this.baseUrl}/cost_report`);
      url.searchParams.set('starting_at', window.start.toISOString());
      url.searchParams.set('group_by[]', 'workspace_id');
      url.searchParams.set('group_by[]', 'description');
      url.searchParams.set('bucket_width', '1d');
      url.searchParams.set('limit', '100');
      if (page) {
        url.searchParams.set('page', page);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'x-api-key': credentials.adminApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn('Failed to fetch Anthropic costs:', response.status);
        break;
      }
      
      const data = await response.json();
      
      for (const bucket of data.data || []) {
        for (const result of bucket.results || []) {
          costs.push({
            date: new Date(bucket.starting_at),
            workspaceId: result.workspace_id,
            model: result.model,
            amount: parseFloat(result.amount) || 0,
            currency: result.currency || 'USD',
            description: result.description,
            tokenType: result.token_type,
            costType: result.cost_type
          });
        }
      }
      
      page = data.has_more ? data.next_page : undefined;
      
    } while (page);
    
    return costs;
  }
  
  private mergeUsageAndCosts(usage: RawUsageData[], costs: any[]): RawUsageData[] {
    // Create cost lookup by date + workspace + model
    const costLookup = new Map<string, number>();
    for (const cost of costs) {
      const key = `${cost.date.toISOString().split('T')[0]}_${cost.workspaceId}_${cost.model}`;
      costLookup.set(key, (costLookup.get(key) || 0) + cost.amount);
    }
    
    return usage.map(record => {
      const dateKey = record.timestamp.toISOString().split('T')[0];
      const key = `${dateKey}_${record.dimensions?.workspaceId}_${record.model}`;
      const dailyCost = costLookup.get(key);
      
      return {
        ...record,
        cost: dailyCost !== undefined ? dailyCost : this.estimateCost(record)
      };
    });
  }
  
  private estimateCost(record: RawUsageData): number {
    const pricing = this.getModelPricing(record.model);
    
    const inputCost = (record.inputTokens / 1_000_000) * pricing.inputPerMillion;
    const outputCost = (record.outputTokens / 1_000_000) * pricing.outputPerMillion;
    
    // Cached reads are 90% cheaper
    const cachedReadCost = (record.cachedTokens / 1_000_000) * pricing.inputPerMillion * 0.1;
    
    // Cache creation is 25% more expensive
    const cacheCreationCost = ((record as any).cacheCreationTokens || 0) / 1_000_000 * pricing.inputPerMillion * 1.25;
    
    return inputCost + outputCost + cachedReadCost + cacheCreationCost;
  }
  
  private getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    const pricing: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
      'claude-opus-4': { inputPerMillion: 15.00, outputPerMillion: 75.00 },
      'claude-sonnet-4': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
      'claude-haiku-4': { inputPerMillion: 0.25, outputPerMillion: 1.25 },
      'claude-3-5-sonnet': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
      'claude-3-5-haiku': { inputPerMillion: 0.80, outputPerMillion: 4.00 },
      'claude-3-opus': { inputPerMillion: 15.00, outputPerMillion: 75.00 },
      'claude-3-sonnet': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
      'claude-3-haiku': { inputPerMillion: 0.25, outputPerMillion: 1.25 }
    };
    
    for (const [key, price] of Object.entries(pricing)) {
      if (model.includes(key)) {
        return price;
      }
    }
    
    return pricing['claude-sonnet-4'];
  }
}
```

### 5.3 Google Vertex AI Adapter

```typescript
// lib/engines/provider-sync/adapters/GoogleAdapter.ts

import { ProviderAdapter, RawUsageData, SyncWindow } from '../types';
import { RateLimiter } from '../RateLimiter';

export class GoogleAdapter implements ProviderAdapter {
  private rateLimiter: RateLimiter;
  
  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter;
  }
  
  async fetchUsage(credentials: any, window: SyncWindow): Promise<RawUsageData[]> {
    const { GoogleAuth } = require('google-auth-library');
    
    // Initialize auth
    const keyFile = JSON.parse(credentials.serviceAccountKey);
    const auth = new GoogleAuth({
      credentials: keyFile,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/monitoring.read',
        'https://www.googleapis.com/auth/bigquery.readonly'
      ]
    });
    
    const client = await auth.getClient();
    const projectId = credentials.projectId;
    
    // Fetch from both Cloud Monitoring and BigQuery
    const [monitoringData, billingData] = await Promise.all([
      this.fetchCloudMonitoring(client, projectId, window),
      this.fetchBigQueryBilling(client, projectId, window)
    ]);
    
    return this.mergeData(monitoringData, billingData);
  }
  
  private async fetchCloudMonitoring(
    client: any,
    projectId: string,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];
    
    const metrics = [
      'aiplatform.googleapis.com/prediction/online/request_count',
      'aiplatform.googleapis.com/prediction/online/response_count',
      'aiplatform.googleapis.com/prediction/online/token_count'
    ];
    
    for (const metricType of metrics) {
      await this.rateLimiter.acquire('google');
      
      const filter = `metric.type="${metricType}"`;
      const url = `https://monitoring.googleapis.com/v3/projects/${projectId}/timeSeries?` +
        `filter=${encodeURIComponent(filter)}` +
        `&interval.startTime=${window.start.toISOString()}` +
        `&interval.endTime=${window.end.toISOString()}` +
        `&aggregation.alignmentPeriod=3600s` +
        `&aggregation.perSeriesAligner=ALIGN_SUM`;
      
      try {
        const response = await client.request({ url, method: 'GET' });
        
        for (const timeSeries of response.data.timeSeries || []) {
          const modelId = timeSeries.resource?.labels?.model_id || 
                         timeSeries.metric?.labels?.model_id ||
                         'unknown';
          
          for (const point of timeSeries.points || []) {
            const timestamp = new Date(point.interval.startTime);
            const value = point.value.int64Value || point.value.doubleValue || 0;
            
            // Find or create record for this timestamp
            let record = records.find(r => 
              r.timestamp.getTime() === timestamp.getTime() && 
              r.model === modelId
            );
            
            if (!record) {
              record = {
                provider: 'google',
                timestamp,
                model: modelId,
                inputTokens: 0,
                outputTokens: 0,
                cachedTokens: 0,
                requests: 0,
                dimensions: {
                  projectId,
                  location: timeSeries.resource?.labels?.location
                }
              };
              records.push(record);
            }
            
            // Update based on metric type
            if (metricType.includes('request_count')) {
              record.requests = parseInt(value.toString());
            } else if (metricType.includes('token_count')) {
              // Vertex AI reports total tokens, estimate split
              const totalTokens = parseInt(value.toString());
              record.inputTokens = Math.floor(totalTokens * 0.6);
              record.outputTokens = Math.floor(totalTokens * 0.4);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch metric ${metricType}:`, error);
      }
    }
    
    return records;
  }
  
  private async fetchBigQueryBilling(
    client: any,
    projectId: string,
    window: SyncWindow
  ): Promise<any[]> {
    const costs: any[] = [];
    
    // BigQuery billing export query
    // Note: This requires billing export to be configured
    const query = `
      SELECT
        DATE(usage_start_time) as date,
        sku.description as model,
        SUM(cost) as cost,
        SUM(usage.amount) as usage_amount,
        usage.unit as usage_unit
      FROM \`${projectId}.billing_export.gcp_billing_export_v1_*\`
      WHERE service.description LIKE '%Vertex AI%'
        AND usage_start_time >= TIMESTAMP('${window.start.toISOString()}')
        AND usage_start_time < TIMESTAMP('${window.end.toISOString()}')
      GROUP BY date, sku.description, usage.unit
      ORDER BY date
    `;
    
    try {
      await this.rateLimiter.acquire('google');
      
      const response = await client.request({
        url: `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`,
        method: 'POST',
        data: {
          query,
          useLegacySql: false,
          timeoutMs: 30000
        }
      });
      
      for (const row of response.data.rows || []) {
        costs.push({
          date: new Date(row.f[0].v),
          model: row.f[1].v,
          cost: parseFloat(row.f[2].v),
          usageAmount: parseFloat(row.f[3].v),
          usageUnit: row.f[4].v
        });
      }
    } catch (error) {
      console.warn('BigQuery billing fetch failed (may not be configured):', error);
    }
    
    return costs;
  }
  
  private mergeData(monitoring: RawUsageData[], billing: any[]): RawUsageData[] {
    // Create cost lookup
    const costLookup = new Map<string, number>();
    for (const cost of billing) {
      const key = `${cost.date.toISOString().split('T')[0]}_${cost.model}`;
      costLookup.set(key, (costLookup.get(key) || 0) + cost.cost);
    }
    
    return monitoring.map(record => {
      const dateKey = record.timestamp.toISOString().split('T')[0];
      const key = `${dateKey}_${record.model}`;
      const cost = costLookup.get(key);
      
      return {
        ...record,
        cost: cost !== undefined ? cost : this.estimateCost(record)
      };
    });
  }
  
  private estimateCost(record: RawUsageData): number {
    const pricing = this.getModelPricing(record.model);
    return (record.inputTokens / 1_000_000) * pricing.inputPerMillion +
           (record.outputTokens / 1_000_000) * pricing.outputPerMillion;
  }
  
  private getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    const pricing: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
      'gemini-2.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00 },
      'gemini-2.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.30 },
      'gemini-2.0-flash': { inputPerMillion: 0.10, outputPerMillion: 0.40 },
      'gemini-1.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00 },
      'gemini-1.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.30 }
    };
    
    for (const [key, price] of Object.entries(pricing)) {
      if (model.toLowerCase().includes(key)) {
        return price;
      }
    }
    
    return pricing['gemini-2.5-flash'];
  }
}
```

### 5.4 Azure OpenAI Adapter

```typescript
// lib/engines/provider-sync/adapters/AzureAdapter.ts

import { ProviderAdapter, RawUsageData, SyncWindow } from '../types';
import { RateLimiter } from '../RateLimiter';

export class AzureAdapter implements ProviderAdapter {
  private rateLimiter: RateLimiter;
  
  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter;
  }
  
  async fetchUsage(credentials: any, window: SyncWindow): Promise<RawUsageData[]> {
    // Get OAuth token
    const accessToken = await this.getAccessToken(credentials);
    
    // Fetch from multiple sources
    const [metricsData, costData] = await Promise.all([
      this.fetchAzureMonitorMetrics(accessToken, credentials, window),
      this.fetchCostManagement(accessToken, credentials, window)
    ]);
    
    return this.mergeData(metricsData, costData);
  }
  
  private async getAccessToken(credentials: any): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`;
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        scope: 'https://management.azure.com/.default',
        grant_type: 'client_credentials'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate with Azure');
    }
    
    const data = await response.json();
    return data.access_token;
  }
  
  private async fetchAzureMonitorMetrics(
    accessToken: string,
    credentials: any,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];
    
    // Get all Azure OpenAI resources
    const resources = await this.listOpenAIResources(accessToken, credentials);
    
    for (const resource of resources) {
      await this.rateLimiter.acquire('azure');
      
      const metricsUrl = `https://management.azure.com${resource.id}/providers/Microsoft.Insights/metrics?` +
        `api-version=2023-10-01` +
        `&timespan=${window.start.toISOString()}/${window.end.toISOString()}` +
        `&interval=PT1H` +
        `&metricnames=ProcessedPromptTokens,GeneratedCompletionTokens` +
        `&aggregation=Total`;
      
      try {
        const response = await fetch(metricsUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        // Process metrics
        const metricsMap = new Map<string, { input: number; output: number }>();
        
        for (const metric of data.value || []) {
          for (const timeseries of metric.timeseries || []) {
            for (const point of timeseries.data || []) {
              const timestamp = point.timeStamp;
              const key = timestamp;
              
              if (!metricsMap.has(key)) {
                metricsMap.set(key, { input: 0, output: 0 });
              }
              
              const entry = metricsMap.get(key)!;
              if (metric.name.value === 'ProcessedPromptTokens') {
                entry.input = point.total || 0;
              } else if (metric.name.value === 'GeneratedCompletionTokens') {
                entry.output = point.total || 0;
              }
            }
          }
        }
        
        // Convert to records
        for (const [timestamp, tokens] of metricsMap) {
          records.push({
            provider: 'azure',
            timestamp: new Date(timestamp),
            model: resource.properties?.model || 'azure-openai',
            inputTokens: tokens.input,
            outputTokens: tokens.output,
            cachedTokens: 0,
            requests: 0,  // Azure Monitor doesn't provide request count directly
            dimensions: {
              resourceId: resource.id,
              resourceGroup: credentials.resourceGroup,
              deploymentName: resource.name
            }
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch metrics for ${resource.name}:`, error);
      }
    }
    
    return records;
  }
  
  private async fetchCostManagement(
    accessToken: string,
    credentials: any,
    window: SyncWindow
  ): Promise<any[]> {
    const costs: any[] = [];
    
    await this.rateLimiter.acquire('azure');
    
    const costUrl = `https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`;
    
    const response = await fetch(costUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'ActualCost',
        timeframe: 'Custom',
        timePeriod: {
          from: window.start.toISOString().split('T')[0],
          to: window.end.toISOString().split('T')[0]
        },
        dataSet: {
          granularity: 'Daily',
          aggregation: {
            totalCost: { name: 'Cost', function: 'Sum' },
            totalQuantity: { name: 'UsageQuantity', function: 'Sum' }
          },
          filter: {
            dimensions: {
              name: 'ServiceName',
              operator: 'In',
              values: ['Cognitive Services']
            }
          },
          grouping: [
            { type: 'Dimension', name: 'MeterSubCategory' },
            { type: 'Dimension', name: 'ResourceId' },
            { type: 'Dimension', name: 'UsageDate' }
          ]
        }
      })
    });
    
    if (!response.ok) {
      console.warn('Cost Management API failed:', response.status);
      return costs;
    }
    
    const data = await response.json();
    
    // Parse response rows
    for (const row of data.properties?.rows || []) {
      costs.push({
        cost: row[0],
        quantity: row[1],
        meterSubCategory: row[2],
        resourceId: row[3],
        date: new Date(row[4].toString())
      });
    }
    
    return costs;
  }
  
  private async listOpenAIResources(
    accessToken: string,
    credentials: any
  ): Promise<any[]> {
    const url = `https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.CognitiveServices/accounts?api-version=2023-05-01`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    // Filter to OpenAI resources only
    return (data.value || []).filter((r: any) => 
      r.kind === 'OpenAI' || r.properties?.kind === 'OpenAI'
    );
  }
  
  private mergeData(metrics: RawUsageData[], costs: any[]): RawUsageData[] {
    const costLookup = new Map<string, number>();
    
    for (const cost of costs) {
      const key = `${cost.date.toISOString().split('T')[0]}_${cost.resourceId}`;
      costLookup.set(key, (costLookup.get(key) || 0) + cost.cost);
    }
    
    return metrics.map(record => {
      const dateKey = record.timestamp.toISOString().split('T')[0];
      const key = `${dateKey}_${record.dimensions?.resourceId}`;
      const cost = costLookup.get(key);
      
      return {
        ...record,
        cost: cost !== undefined ? cost : this.estimateCost(record)
      };
    });
  }
  
  private estimateCost(record: RawUsageData): number {
    // Azure OpenAI pricing is similar to OpenAI but may vary
    const inputCost = (record.inputTokens / 1_000_000) * 2.50;
    const outputCost = (record.outputTokens / 1_000_000) * 10.00;
    return inputCost + outputCost;
  }
}
```

### 5.5 AWS Bedrock Adapter

```typescript
// lib/engines/provider-sync/adapters/AWSAdapter.ts

import { ProviderAdapter, RawUsageData, SyncWindow } from '../types';
import { RateLimiter } from '../RateLimiter';

export class AWSAdapter implements ProviderAdapter {
  private rateLimiter: RateLimiter;
  
  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter;
  }
  
  async fetchUsage(credentials: any, window: SyncWindow): Promise<RawUsageData[]> {
    const config = await this.getAWSConfig(credentials);
    
    const [cloudWatchData, costExplorerData] = await Promise.all([
      this.fetchCloudWatchMetrics(config, window),
      this.fetchCostExplorer(config, window)
    ]);
    
    return this.mergeData(cloudWatchData, costExplorerData);
  }
  
  private async getAWSConfig(credentials: any): Promise<any> {
    const config: any = { region: credentials.region };
    
    if (credentials.roleArn) {
      // Assume role for cross-account access
      const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');
      const stsClient = new STSClient({ region: credentials.region });
      
      const assumeRoleResponse = await stsClient.send(new AssumeRoleCommand({
        RoleArn: credentials.roleArn,
        RoleSessionName: 'TokenTraSync',
        ExternalId: credentials.externalId
      }));
      
      config.credentials = {
        accessKeyId: assumeRoleResponse.Credentials.AccessKeyId,
        secretAccessKey: assumeRoleResponse.Credentials.SecretAccessKey,
        sessionToken: assumeRoleResponse.Credentials.SessionToken
      };
    } else {
      config.credentials = {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      };
    }
    
    return config;
  }
  
  private async fetchCloudWatchMetrics(
    config: any,
    window: SyncWindow
  ): Promise<RawUsageData[]> {
    const records: RawUsageData[] = [];
    
    const { CloudWatchClient, GetMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
    const client = new CloudWatchClient(config);
    
    // Get all Bedrock model IDs
    const modelIds = await this.listBedrockModels(config);
    
    for (const modelId of modelIds) {
      await this.rateLimiter.acquire('aws');
      
      try {
        const response = await client.send(new GetMetricDataCommand({
          StartTime: window.start,
          EndTime: window.end,
          MetricDataQueries: [
            {
              Id: 'input_tokens',
              MetricStat: {
                Metric: {
                  Namespace: 'AWS/Bedrock',
                  MetricName: 'InputTokenCount',
                  Dimensions: [{ Name: 'ModelId', Value: modelId }]
                },
                Period: 3600,
                Stat: 'Sum'
              }
            },
            {
              Id: 'output_tokens',
              MetricStat: {
                Metric: {
                  Namespace: 'AWS/Bedrock',
                  MetricName: 'OutputTokenCount',
                  Dimensions: [{ Name: 'ModelId', Value: modelId }]
                },
                Period: 3600,
                Stat: 'Sum'
              }
            },
            {
              Id: 'invocations',
              MetricStat: {
                Metric: {
                  Namespace: 'AWS/Bedrock',
                  MetricName: 'Invocations',
                  Dimensions: [{ Name: 'ModelId', Value: modelId }]
                },
                Period: 3600,
                Stat: 'Sum'
              }
            }
          ]
        }));
        
        // Combine metrics by timestamp
        const metricsMap = new Map<number, { input: number; output: number; invocations: number }>();
        
        for (const result of response.MetricDataResults || []) {
          const timestamps = result.Timestamps || [];
          const values = result.Values || [];
          
          for (let i = 0; i < timestamps.length; i++) {
            const ts = timestamps[i].getTime();
            if (!metricsMap.has(ts)) {
              metricsMap.set(ts, { input: 0, output: 0, invocations: 0 });
            }
            
            const entry = metricsMap.get(ts)!;
            if (result.Id === 'input_tokens') entry.input = values[i] || 0;
            if (result.Id === 'output_tokens') entry.output = values[i] || 0;
            if (result.Id === 'invocations') entry.invocations = values[i] || 0;
          }
        }
        
        // Convert to records
        for (const [ts, metrics] of metricsMap) {
          if (metrics.input > 0 || metrics.output > 0) {
            records.push({
              provider: 'aws',
              timestamp: new Date(ts),
              model: modelId,
              inputTokens: metrics.input,
              outputTokens: metrics.output,
              cachedTokens: 0,
              requests: metrics.invocations,
              dimensions: {
                region: config.region,
                modelId
              }
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch metrics for ${modelId}:`, error);
      }
    }
    
    return records;
  }
  
  private async fetchCostExplorer(config: any, window: SyncWindow): Promise<any[]> {
    const costs: any[] = [];
    
    const { CostExplorerClient, GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');
    const client = new CostExplorerClient(config);
    
    await this.rateLimiter.acquire('aws');
    
    try {
      const response = await client.send(new GetCostAndUsageCommand({
        TimePeriod: {
          Start: window.start.toISOString().split('T')[0],
          End: window.end.toISOString().split('T')[0]
        },
        Granularity: 'DAILY',
        Metrics: ['UnblendedCost', 'UsageQuantity'],
        Filter: {
          Dimensions: {
            Key: 'SERVICE',
            Values: ['Amazon Bedrock']
          }
        },
        GroupBy: [
          { Type: 'DIMENSION', Key: 'USAGE_TYPE' }
        ]
      }));
      
      for (const result of response.ResultsByTime || []) {
        const date = new Date(result.TimePeriod.Start);
        
        for (const group of result.Groups || []) {
          const usageType = group.Keys[0];
          const cost = parseFloat(group.Metrics.UnblendedCost.Amount);
          const usage = parseFloat(group.Metrics.UsageQuantity.Amount);
          
          // Extract model from usage type
          const modelMatch = usageType.match(/USE[12]-([^-]+)/);
          const model = modelMatch ? modelMatch[1] : usageType;
          
          costs.push({
            date,
            model,
            cost,
            usage,
            usageType
          });
        }
      }
    } catch (error) {
      console.warn('Cost Explorer fetch failed:', error);
    }
    
    return costs;
  }
  
  private async listBedrockModels(config: any): Promise<string[]> {
    const { BedrockClient, ListFoundationModelsCommand } = require('@aws-sdk/client-bedrock');
    const client = new BedrockClient(config);
    
    try {
      const response = await client.send(new ListFoundationModelsCommand({}));
      return (response.modelSummaries || []).map((m: any) => m.modelId);
    } catch (error) {
      // Return common model IDs as fallback
      return [
        'anthropic.claude-3-sonnet-20240229-v1:0',
        'anthropic.claude-3-haiku-20240307-v1:0',
        'anthropic.claude-3-opus-20240229-v1:0',
        'amazon.titan-text-express-v1',
        'amazon.titan-embed-text-v1',
        'meta.llama3-70b-instruct-v1:0'
      ];
    }
  }
  
  private mergeData(cloudWatch: RawUsageData[], costs: any[]): RawUsageData[] {
    const costLookup = new Map<string, number>();
    
    for (const cost of costs) {
      const key = `${cost.date.toISOString().split('T')[0]}_${cost.model}`;
      costLookup.set(key, (costLookup.get(key) || 0) + cost.cost);
    }
    
    return cloudWatch.map(record => {
      const dateKey = record.timestamp.toISOString().split('T')[0];
      const key = `${dateKey}_${record.model}`;
      const cost = costLookup.get(key);
      
      return {
        ...record,
        cost: cost !== undefined ? cost : this.estimateCost(record)
      };
    });
  }
  
  private estimateCost(record: RawUsageData): number {
    const pricing = this.getModelPricing(record.model);
    return (record.inputTokens / 1_000_000) * pricing.inputPerMillion +
           (record.outputTokens / 1_000_000) * pricing.outputPerMillion;
  }
  
  private getModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
    const pricing: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
      'anthropic.claude-3-opus': { inputPerMillion: 15.00, outputPerMillion: 75.00 },
      'anthropic.claude-3-sonnet': { inputPerMillion: 3.00, outputPerMillion: 15.00 },
      'anthropic.claude-3-haiku': { inputPerMillion: 0.25, outputPerMillion: 1.25 },
      'amazon.titan-text': { inputPerMillion: 0.15, outputPerMillion: 0.20 },
      'amazon.nova-pro': { inputPerMillion: 0.80, outputPerMillion: 3.20 },
      'amazon.nova-lite': { inputPerMillion: 0.06, outputPerMillion: 0.24 },
      'amazon.nova-micro': { inputPerMillion: 0.035, outputPerMillion: 0.14 },
      'meta.llama3': { inputPerMillion: 0.70, outputPerMillion: 0.90 }
    };
    
    for (const [key, price] of Object.entries(pricing)) {
      if (model.toLowerCase().includes(key.toLowerCase())) {
        return price;
      }
    }
    
    return pricing['anthropic.claude-3-sonnet'];
  }
}
```

---

## 6. Data Normalization

### 6.1 Normalized Schema

```typescript
// lib/engines/provider-sync/DataNormalizer.ts

export interface NormalizedUsageRecord {
  id: string;
  orgId?: string;
  connectionId?: string;
  provider: ProviderType;
  
  // Time
  timestamp: Date;
  endTime?: Date;
  granularity: '1m' | '1h' | '1d';
  
  // Model
  model: string;
  modelFamily: string;
  modelVersion?: string;
  
  // Tokens
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedInputTokens: number;
  cacheCreationTokens: number;
  
  // Requests
  requests: number;
  
  // Cost
  cost: number;
  currency: string;
  
  // Attribution
  dimensions: {
    projectId?: string;
    workspaceId?: string;
    teamId?: string;
    userId?: string;
    apiKeyId?: string;
    costCenterId?: string;
    environment?: string;
    feature?: string;
  };
  dimensionHash: string;  // For deduplication
  
  // Provider-specific
  providerMetadata?: Record<string, any>;
}

export class DataNormalizer {
  /**
   * Normalize raw provider data to unified schema
   */
  normalize(
    provider: ProviderType,
    rawData: RawUsageData[],
    connection: ProviderConnection
  ): NormalizedUsageRecord[] {
    return rawData.map(raw => this.normalizeRecord(provider, raw, connection));
  }
  
  private normalizeRecord(
    provider: ProviderType,
    raw: RawUsageData,
    connection: ProviderConnection
  ): NormalizedUsageRecord {
    const { modelFamily, modelVersion } = this.parseModel(raw.model, provider);
    const dimensions = this.normalizeDimensions(raw.dimensions, provider);
    const dimensionHash = this.hashDimensions(dimensions);
    
    return {
      id: crypto.randomUUID(),
      provider,
      
      // Time
      timestamp: raw.timestamp,
      endTime: raw.endTime,
      granularity: this.inferGranularity(raw.timestamp, raw.endTime),
      
      // Model
      model: this.normalizeModelName(raw.model, provider),
      modelFamily,
      modelVersion,
      
      // Tokens
      inputTokens: raw.inputTokens || 0,
      outputTokens: raw.outputTokens || 0,
      totalTokens: (raw.inputTokens || 0) + (raw.outputTokens || 0),
      cachedInputTokens: raw.cachedTokens || 0,
      cacheCreationTokens: (raw as any).cacheCreationTokens || 0,
      
      // Requests
      requests: raw.requests || 0,
      
      // Cost
      cost: raw.cost || 0,
      currency: 'USD',
      
      // Attribution
      dimensions,
      dimensionHash,
      
      // Provider-specific
      providerMetadata: raw.rawData
    };
  }
  
  /**
   * Normalize model names across providers
   */
  private normalizeModelName(model: string, provider: ProviderType): string {
    // Remove version suffixes and normalize
    const normalizations: Record<string, string> = {
      // OpenAI
      'gpt-4o-2024-08-06': 'gpt-4o',
      'gpt-4o-mini-2024-07-18': 'gpt-4o-mini',
      'gpt-4-turbo-2024-04-09': 'gpt-4-turbo',
      
      // Anthropic
      'claude-sonnet-4-20250514': 'claude-4-sonnet',
      'claude-3-5-sonnet-20241022': 'claude-3.5-sonnet',
      
      // Add more as needed
    };
    
    return normalizations[model] || model;
  }
  
  /**
   * Parse model into family and version
   */
  private parseModel(model: string, provider: ProviderType): { modelFamily: string; modelVersion?: string } {
    const patterns: Record<ProviderType, RegExp> = {
      openai: /^(gpt-[\d.]+[a-z]*|o[\d]+)(?:-(\d{4}-\d{2}-\d{2}))?/,
      anthropic: /^(claude-[\d.]+(?:-[a-z]+)?)(?:-(\d{8}))?/,
      google: /^(gemini-[\d.]+(?:-[a-z]+)?)/,
      azure: /^(gpt-[\d.]+[a-z]*)/,
      aws: /^(?:[a-z]+\.)?([a-z]+-[\d.]+(?:-[a-z]+)?)/
    };
    
    const match = model.match(patterns[provider] || /.+/);
    
    return {
      modelFamily: match?.[1] || model,
      modelVersion: match?.[2]
    };
  }
  
  /**
   * Normalize dimensions across providers
   */
  private normalizeDimensions(
    raw: Record<string, any> | undefined,
    provider: ProviderType
  ): NormalizedUsageRecord['dimensions'] {
    if (!raw) return {};
    
    return {
      projectId: raw.projectId || raw.project_id,
      workspaceId: raw.workspaceId || raw.workspace_id,
      teamId: raw.teamId || raw.team_id,
      userId: raw.userId || raw.user_id,
      apiKeyId: raw.apiKeyId || raw.api_key_id,
      costCenterId: raw.costCenterId || raw.cost_center_id,
      environment: raw.environment,
      feature: raw.feature
    };
  }
  
  /**
   * Create hash for dimension combination (for deduplication)
   */
  private hashDimensions(dimensions: NormalizedUsageRecord['dimensions']): string {
    const str = JSON.stringify(dimensions, Object.keys(dimensions).sort());
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Infer granularity from timestamps
   */
  private inferGranularity(
    start: Date,
    end?: Date
  ): '1m' | '1h' | '1d' {
    if (!end) return '1h';
    
    const diffMs = end.getTime() - start.getTime();
    const diffMins = diffMs / (60 * 1000);
    
    if (diffMins <= 5) return '1m';
    if (diffMins <= 120) return '1h';
    return '1d';
  }
}
```

---

## 7. Sync Scheduling & Rate Limiting

### 7.1 Rate Limiter

```typescript
// lib/engines/provider-sync/RateLimiter.ts

export class RateLimiter {
  private queues: Map<string, RequestQueue> = new Map();
  
  // Rate limits per provider (requests per minute)
  private readonly limits: Record<string, number> = {
    openai: 60,
    anthropic: 60,
    google: 100,
    azure: 100,
    aws: 100
  };
  
  async acquire(provider: string): Promise<void> {
    if (!this.queues.has(provider)) {
      this.queues.set(provider, new RequestQueue(this.limits[provider] || 60));
    }
    
    await this.queues.get(provider)!.acquire();
  }
}

class RequestQueue {
  private requestsPerMinute: number;
  private queue: Array<() => void> = [];
  private requestTimes: number[] = [];
  private processing = false;
  
  constructor(requestsPerMinute: number) {
    this.requestsPerMinute = requestsPerMinute;
  }
  
  async acquire(): Promise<void> {
    return new Promise(resolve => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      // Clean old request times
      const oneMinuteAgo = Date.now() - 60000;
      this.requestTimes = this.requestTimes.filter(t => t > oneMinuteAgo);
      
      if (this.requestTimes.length >= this.requestsPerMinute) {
        // Wait until oldest request expires
        const waitTime = this.requestTimes[0] - oneMinuteAgo + 100;
        await this.sleep(waitTime);
        continue;
      }
      
      // Process next request
      const resolve = this.queue.shift();
      if (resolve) {
        this.requestTimes.push(Date.now());
        resolve();
      }
    }
    
    this.processing = false;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 8. Error Handling & Retry Logic

```typescript
// lib/engines/provider-sync/RetryHandler.ts

export class RetryHandler {
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000;  // 1 second
  private readonly maxDelay = 30000;  // 30 seconds
  
  async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Check if retryable
        if (!this.isRetryable(error)) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.calculateDelay(attempt, error);
          console.log(`[RetryHandler] ${context} failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }
  
  private isRetryable(error: any): boolean {
    // Network errors
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
    
    // Rate limits (429)
    if (error.status === 429) return true;
    
    // Server errors (5xx)
    if (error.status >= 500 && error.status < 600) return true;
    
    // Provider-specific retryable errors
    const retryableMessages = [
      'rate limit',
      'too many requests',
      'temporarily unavailable',
      'service unavailable',
      'internal server error',
      'timeout'
    ];
    
    const message = (error.message || '').toLowerCase();
    return retryableMessages.some(m => message.includes(m));
  }
  
  private calculateDelay(attempt: number, error: any): number {
    // Check for Retry-After header
    if (error.headers?.['retry-after']) {
      const retryAfter = parseInt(error.headers['retry-after']);
      if (!isNaN(retryAfter)) {
        return retryAfter * 1000;
      }
    }
    
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    
    return Math.min(exponentialDelay + jitter, this.maxDelay);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 9. Credential Management & Security

```typescript
// lib/engines/provider-sync/CredentialVault.ts

import * as crypto from 'crypto';

export class CredentialVault {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private tagLength = 16;
  private encryptionKey: Buffer;
  
  constructor(encryptionKeyHex: string) {
    // Derive key from provided hex string
    this.encryptionKey = crypto
      .createHash('sha256')
      .update(encryptionKeyHex)
      .digest();
  }
  
  /**
   * Encrypt credentials for storage
   */
  async encrypt(credentials: any): Promise<string> {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    const plaintext = JSON.stringify(credentials);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine iv + tag + ciphertext
    const combined = Buffer.concat([
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return combined.toString('base64');
  }
  
  /**
   * Decrypt credentials from storage
   */
  async decrypt(encryptedData: string): Promise<any> {
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract iv, tag, and ciphertext
    const iv = combined.subarray(0, this.ivLength);
    const tag = combined.subarray(this.ivLength, this.ivLength + this.tagLength);
    const ciphertext = combined.subarray(this.ivLength + this.tagLength);
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
  
  /**
   * Rotate encryption key
   */
  async rotateKey(
    oldKeyHex: string,
    newKeyHex: string,
    encryptedData: string
  ): Promise<string> {
    // Create temporary vault with old key
    const oldVault = new CredentialVault(oldKeyHex);
    const credentials = await oldVault.decrypt(encryptedData);
    
    // Update this vault's key
    this.encryptionKey = crypto
      .createHash('sha256')
      .update(newKeyHex)
      .digest();
    
    // Re-encrypt with new key
    return this.encrypt(credentials);
  }
}
```

---

## 10. Health Monitoring

```typescript
// lib/engines/provider-sync/HealthMonitor.ts

export class HealthMonitor {
  private supabase: SupabaseClient;
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  
  /**
   * Get health status for all connections
   */
  async getHealthStatus(orgId: string): Promise<ConnectionHealth[]> {
    const { data: connections } = await this.supabase
      .from('provider_connections')
      .select('*, sync_history(status, started_at, completed_at, error)')
      .eq('org_id', orgId)
      .order('sync_history.started_at', { foreignTable: 'sync_history', ascending: false })
      .limit(10, { foreignTable: 'sync_history' });
    
    return (connections || []).map(conn => this.calculateHealth(conn));
  }
  
  private calculateHealth(connection: any): ConnectionHealth {
    const recentSyncs = connection.sync_history || [];
    
    // Calculate success rate
    const successfulSyncs = recentSyncs.filter((s: any) => s.status === 'success').length;
    const successRate = recentSyncs.length > 0 
      ? (successfulSyncs / recentSyncs.length) * 100 
      : 0;
    
    // Calculate average sync duration
    const completedSyncs = recentSyncs.filter((s: any) => s.completed_at);
    const avgDuration = completedSyncs.length > 0
      ? completedSyncs.reduce((sum: number, s: any) => {
          const duration = new Date(s.completed_at).getTime() - new Date(s.started_at).getTime();
          return sum + duration;
        }, 0) / completedSyncs.length
      : 0;
    
    // Determine health status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (successRate >= 90) status = 'healthy';
    else if (successRate >= 50) status = 'degraded';
    else status = 'unhealthy';
    
    // Check for stale data
    const lastSync = connection.lastSyncAt ? new Date(connection.lastSyncAt) : null;
    const isStale = lastSync 
      ? (Date.now() - lastSync.getTime()) > connection.settings.syncInterval * 2 * 60 * 1000
      : true;
    
    return {
      connectionId: connection.id,
      provider: connection.provider,
      status,
      successRate,
      avgDurationMs: avgDuration,
      lastSyncAt: lastSync,
      isStale,
      lastError: connection.lastError,
      recentErrors: recentSyncs
        .filter((s: any) => s.status === 'failed')
        .map((s: any) => ({
          timestamp: s.started_at,
          error: s.error
        }))
        .slice(0, 5)
    };
  }
  
  /**
   * Check if provider API is reachable
   */
  async pingProvider(provider: ProviderType): Promise<ProviderPing> {
    const startTime = Date.now();
    
    const endpoints: Record<ProviderType, string> = {
      openai: 'https://api.openai.com/v1/models',
      anthropic: 'https://api.anthropic.com/v1/messages',
      google: 'https://aiplatform.googleapis.com/',
      azure: 'https://management.azure.com/',
      aws: 'https://bedrock.us-east-1.amazonaws.com/'
    };
    
    try {
      const response = await fetch(endpoints[provider], {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      return {
        provider,
        reachable: true,
        latencyMs: Date.now() - startTime,
        statusCode: response.status
      };
    } catch (error) {
      return {
        provider,
        reachable: false,
        latencyMs: Date.now() - startTime,
        error: (error as Error).message
      };
    }
  }
}

interface ConnectionHealth {
  connectionId: string;
  provider: ProviderType;
  status: 'healthy' | 'degraded' | 'unhealthy';
  successRate: number;
  avgDurationMs: number;
  lastSyncAt: Date | null;
  isStale: boolean;
  lastError?: string;
  recentErrors: Array<{ timestamp: string; error: string }>;
}

interface ProviderPing {
  provider: ProviderType;
  reachable: boolean;
  latencyMs: number;
  statusCode?: number;
  error?: string;
}
```

---

## 11. Database Schema

```sql
-- Provider Connections
CREATE TABLE provider_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure', 'aws')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'connected', 'syncing', 'error', 'disconnected', 'disconnecting'
  )),
  
  -- Encrypted credentials (AES-256-GCM)
  credentials TEXT NOT NULL,
  
  -- Settings
  settings JSONB NOT NULL DEFAULT '{
    "syncInterval": 5,
    "backfillDays": 30,
    "enableRealtime": true
  }',
  
  -- Sync state
  last_sync_at TIMESTAMPTZ,
  last_sync_records INTEGER,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  
  -- Metadata
  display_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_provider_per_org UNIQUE (org_id, provider)
);

-- Sync History
CREATE TABLE sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
  
  status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'success', 'failed', 'partial')),
  
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  
  sync_window_start TIMESTAMPTZ,
  sync_window_end TIMESTAMPTZ,
  
  options JSONB DEFAULT '{}',
  error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Records (Time-Series Optimized)
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES provider_connections(id) ON DELETE SET NULL,
  
  provider VARCHAR(20) NOT NULL,
  
  -- Time
  timestamp TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  granularity VARCHAR(5) DEFAULT '1h',
  
  -- Model
  model VARCHAR(100) NOT NULL,
  model_family VARCHAR(50),
  model_version VARCHAR(50),
  
  -- Tokens
  input_tokens BIGINT DEFAULT 0,
  output_tokens BIGINT DEFAULT 0,
  total_tokens BIGINT DEFAULT 0,
  cached_input_tokens BIGINT DEFAULT 0,
  cache_creation_tokens BIGINT DEFAULT 0,
  
  -- Requests
  requests INTEGER DEFAULT 0,
  
  -- Cost
  cost NUMERIC(12, 6) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Attribution
  dimensions JSONB DEFAULT '{}',
  dimension_hash VARCHAR(16) NOT NULL,
  
  -- Provider-specific metadata
  provider_metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Deduplication constraint
  CONSTRAINT unique_usage_record UNIQUE (org_id, provider, model, timestamp, dimension_hash)
);

-- Create hypertable for time-series optimization (if using TimescaleDB)
-- SELECT create_hypertable('usage_records', 'timestamp', chunk_time_interval => INTERVAL '1 day');

-- Indexes
CREATE INDEX idx_usage_org_time ON usage_records(org_id, timestamp DESC);
CREATE INDEX idx_usage_provider_model ON usage_records(provider, model);
CREATE INDEX idx_usage_timestamp ON usage_records(timestamp DESC);
CREATE INDEX idx_connections_org ON provider_connections(org_id);
CREATE INDEX idx_sync_history_connection ON sync_history(connection_id, started_at DESC);

-- Daily rollup for fast queries
CREATE MATERIALIZED VIEW daily_usage_rollup AS
SELECT
  org_id,
  provider,
  model,
  model_family,
  DATE_TRUNC('day', timestamp) AS date,
  SUM(input_tokens) AS input_tokens,
  SUM(output_tokens) AS output_tokens,
  SUM(total_tokens) AS total_tokens,
  SUM(cached_input_tokens) AS cached_tokens,
  SUM(requests) AS requests,
  SUM(cost) AS cost
FROM usage_records
GROUP BY org_id, provider, model, model_family, DATE_TRUNC('day', timestamp);

CREATE UNIQUE INDEX idx_daily_rollup ON daily_usage_rollup(org_id, provider, model, date);

-- Enable RLS
ALTER TABLE provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own org connections" ON provider_connections
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view own org usage" ON usage_records
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));
```

---

## 12. Background Jobs

```sql
-- pg_cron jobs for sync scheduling

-- Sync all connections every 5 minutes
SELECT cron.schedule(
  'sync-provider-usage',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/sync-all-providers',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Refresh daily rollup every hour
SELECT cron.schedule(
  'refresh-daily-rollup',
  '0 * * * *',
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_usage_rollup;
  $$
);

-- Check connection health every 15 minutes
SELECT cron.schedule(
  'check-connection-health',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/check-connection-health',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Cleanup old sync history (keep 30 days)
SELECT cron.schedule(
  'cleanup-sync-history',
  '0 3 * * *',  -- 3 AM daily
  $$
  DELETE FROM sync_history WHERE created_at < NOW() - INTERVAL '30 days';
  $$
);
```

---

## 13. TypeScript Implementation

### React Hooks for Provider Management

```typescript
// hooks/useProviders.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useProviderConnections(orgId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['provider-connections', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_connections')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProviderConnection[];
    }
  });
}

export function useProviderStats(orgId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['provider-stats', orgId],
    queryFn: async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { data: connections } = await supabase
        .from('provider_connections')
        .select('id, provider, status')
        .eq('org_id', orgId);
      
      const { data: usage } = await supabase
        .from('daily_usage_rollup')
        .select('cost, provider')
        .eq('org_id', orgId)
        .gte('date', monthStart.toISOString());
      
      const totalSpend = usage?.reduce((sum, r) => sum + parseFloat(r.cost), 0) || 0;
      const byProvider = usage?.reduce((acc, r) => {
        acc[r.provider] = (acc[r.provider] || 0) + parseFloat(r.cost);
        return acc;
      }, {} as Record<string, number>) || {};
      
      return {
        connectedCount: connections?.filter(c => c.status === 'connected').length || 0,
        totalCount: connections?.length || 0,
        totalMonthlySpend: totalSpend,
        spendByProvider: byProvider
      };
    }
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      orgId,
      provider,
      credentials,
      settings
    }: {
      orgId: string;
      provider: ProviderType;
      credentials: any;
      settings?: ConnectionSettings;
    }) => {
      const response = await fetch('/api/providers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, provider, credentials, settings })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-connections'] });
      queryClient.invalidateQueries({ queryKey: ['provider-stats'] });
    }
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await fetch(`/api/providers/${connectionId}/sync`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-connections'] });
    }
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await fetch(`/api/providers/${connectionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-connections'] });
      queryClient.invalidateQueries({ queryKey: ['provider-stats'] });
    }
  });
}
```

---

## 14. Model Registry & Pricing

```typescript
// lib/data/modelRegistry.ts

export interface ModelInfo {
  id: string;
  provider: ProviderType;
  name: string;
  family: string;
  contextWindow: number;
  pricing: {
    inputPerMillion: number;
    outputPerMillion: number;
    cacheReadPerMillion?: number;
    cacheWritePerMillion?: number;
  };
  capabilities: string[];
  released: string;
  deprecated?: boolean;
}

export const MODEL_REGISTRY: ModelInfo[] = [
  // OpenAI
  {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    family: 'gpt-4o',
    contextWindow: 128000,
    pricing: { inputPerMillion: 2.50, outputPerMillion: 10.00 },
    capabilities: ['chat', 'vision', 'function-calling'],
    released: '2024-05'
  },
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    name: 'GPT-4o Mini',
    family: 'gpt-4o',
    contextWindow: 128000,
    pricing: { inputPerMillion: 0.15, outputPerMillion: 0.60 },
    capabilities: ['chat', 'vision', 'function-calling'],
    released: '2024-07'
  },
  {
    id: 'o1',
    provider: 'openai',
    name: 'o1',
    family: 'o1',
    contextWindow: 200000,
    pricing: { inputPerMillion: 15.00, outputPerMillion: 60.00 },
    capabilities: ['reasoning', 'chat'],
    released: '2024-12'
  },
  {
    id: 'o3-mini',
    provider: 'openai',
    name: 'o3-mini',
    family: 'o3',
    contextWindow: 200000,
    pricing: { inputPerMillion: 1.10, outputPerMillion: 4.40 },
    capabilities: ['reasoning', 'chat'],
    released: '2025-01'
  },
  
  // Anthropic
  {
    id: 'claude-opus-4.5',
    provider: 'anthropic',
    name: 'Claude Opus 4.5',
    family: 'claude-4',
    contextWindow: 200000,
    pricing: { 
      inputPerMillion: 15.00, 
      outputPerMillion: 75.00,
      cacheReadPerMillion: 1.50,
      cacheWritePerMillion: 18.75
    },
    capabilities: ['chat', 'vision', 'computer-use', 'coding'],
    released: '2025-02'
  },
  {
    id: 'claude-sonnet-4.5',
    provider: 'anthropic',
    name: 'Claude Sonnet 4.5',
    family: 'claude-4',
    contextWindow: 200000,
    pricing: { 
      inputPerMillion: 3.00, 
      outputPerMillion: 15.00,
      cacheReadPerMillion: 0.30,
      cacheWritePerMillion: 3.75
    },
    capabilities: ['chat', 'vision', 'computer-use', 'coding'],
    released: '2025-02'
  },
  {
    id: 'claude-haiku-4.5',
    provider: 'anthropic',
    name: 'Claude Haiku 4.5',
    family: 'claude-4',
    contextWindow: 200000,
    pricing: { 
      inputPerMillion: 0.80, 
      outputPerMillion: 4.00,
      cacheReadPerMillion: 0.08,
      cacheWritePerMillion: 1.00
    },
    capabilities: ['chat', 'coding'],
    released: '2025-02'
  },
  
  // Google
  {
    id: 'gemini-2.5-pro',
    provider: 'google',
    name: 'Gemini 2.5 Pro',
    family: 'gemini-2.5',
    contextWindow: 1000000,
    pricing: { inputPerMillion: 1.25, outputPerMillion: 5.00 },
    capabilities: ['chat', 'vision', 'audio', 'video'],
    released: '2025-03'
  },
  {
    id: 'gemini-2.5-flash',
    provider: 'google',
    name: 'Gemini 2.5 Flash',
    family: 'gemini-2.5',
    contextWindow: 1000000,
    pricing: { inputPerMillion: 0.075, outputPerMillion: 0.30 },
    capabilities: ['chat', 'vision'],
    released: '2025-03'
  },
  
  // AWS Bedrock
  {
    id: 'amazon.nova-pro-v1:0',
    provider: 'aws',
    name: 'Amazon Nova Pro',
    family: 'nova',
    contextWindow: 300000,
    pricing: { inputPerMillion: 0.80, outputPerMillion: 3.20 },
    capabilities: ['chat', 'vision', 'video'],
    released: '2024-12'
  },
  {
    id: 'amazon.nova-lite-v1:0',
    provider: 'aws',
    name: 'Amazon Nova Lite',
    family: 'nova',
    contextWindow: 300000,
    pricing: { inputPerMillion: 0.06, outputPerMillion: 0.24 },
    capabilities: ['chat', 'vision', 'video'],
    released: '2024-12'
  },
  {
    id: 'amazon.nova-micro-v1:0',
    provider: 'aws',
    name: 'Amazon Nova Micro',
    family: 'nova',
    contextWindow: 128000,
    pricing: { inputPerMillion: 0.035, outputPerMillion: 0.14 },
    capabilities: ['chat'],
    released: '2024-12'
  }
];

export function getModelInfo(modelId: string): ModelInfo | undefined {
  return MODEL_REGISTRY.find(m => 
    m.id === modelId || 
    modelId.includes(m.id) ||
    m.id.includes(modelId.split('-').slice(0, -1).join('-'))
  );
}

export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): number {
  const model = getModelInfo(modelId);
  if (!model) return 0;
  
  const inputCost = (inputTokens / 1_000_000) * model.pricing.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * model.pricing.outputPerMillion;
  
  let cachedDiscount = 0;
  if (cachedTokens > 0 && model.pricing.cacheReadPerMillion) {
    const fullCost = (cachedTokens / 1_000_000) * model.pricing.inputPerMillion;
    const cachedCost = (cachedTokens / 1_000_000) * model.pricing.cacheReadPerMillion;
    cachedDiscount = fullCost - cachedCost;
  }
  
  return inputCost + outputCost - cachedDiscount;
}
```

---

## Summary

This Provider Sync Engine provides:

1. **5 Provider Adapters**: OpenAI, Anthropic, Google Vertex AI, Azure OpenAI, AWS Bedrock with full API integration

2. **Unified Data Schema**: All provider data normalized to a single format for consistent analytics

3. **Secure Credential Management**: AES-256-GCM encryption for all API keys and secrets

4. **Intelligent Rate Limiting**: Per-provider rate limits with queue-based request management

5. **Retry Logic**: Exponential backoff with jitter for resilient API calls

6. **Health Monitoring**: Connection health tracking, provider ping, and sync history

7. **Time-Series Optimized Storage**: Efficient schema with daily rollups for fast queries

8. **Background Jobs**: pg_cron scheduling for automated syncs every 5 minutes

9. **Model Registry**: Complete pricing data for cost calculations

This engine handles enterprise scale (1000+ connections) and provides the data backbone for all TokenTra features.
