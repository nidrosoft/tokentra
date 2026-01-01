# TokenTRA Optimization Engine Architecture

## Overview

The Optimization Engine is the core intelligence layer of TokenTRA. It analyzes usage patterns, generates actionable recommendations, and enforces optimization rules in real-time.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     OPTIMIZATION ENGINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │  ANALYSIS       │    │  RECOMMENDATION │    │  EXECUTION   │ │
│  │  ENGINE         │───▶│  GENERATOR      │───▶│  ENGINE      │ │
│  │  (Scheduled)    │    │  (AI-Powered)   │    │  (Real-time) │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│         │                       │                      │         │
│         ▼                       ▼                      ▼         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    SUPABASE DATABASE                         ││
│  │  ┌──────────┐ ┌───────────────┐ ┌─────────────┐             ││
│  │  │ usage_   │ │recommendations│ │routing_rules│             ││
│  │  │ records  │ │               │ │             │             ││
│  │  └──────────┘ └───────────────┘ └─────────────┘             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TOKENTRA SDK                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Pre-Request Hook: Check routing_rules, apply optimizations ││
│  │  Post-Request Hook: Track usage, update analytics           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 1. Analysis Engine (Scheduled Job)

Runs every hour via Supabase Edge Function or external cron.

### Pattern Detection Algorithms

#### A. Model Downgrade Detection
```typescript
// Detect requests that could use cheaper models
- Analyze prompt complexity (token count, structure)
- Check response quality requirements
- Compare cost vs capability trade-offs
- Flag requests where simpler model would suffice
```

#### B. Caching Opportunity Detection
```typescript
// Detect repeated or similar queries
- Hash prompts and detect duplicates
- Use semantic similarity for near-duplicates
- Calculate cache hit rate potential
- Estimate savings from caching
```

#### C. Batching Opportunity Detection
```typescript
// Detect requests that could be batched
- Analyze request timing patterns
- Identify sequential similar requests
- Calculate batching efficiency gains
```

#### D. Error Pattern Detection
```typescript
// Detect wasteful error patterns
- Track retry rates by model/endpoint
- Identify timeout patterns
- Calculate cost of failed requests
```

#### E. Usage Spike Detection
```typescript
// Detect anomalous usage
- Compare to historical baselines
- Identify sudden cost increases
- Alert on budget threshold breaches
```

### Implementation

```typescript
// Runs every hour
async function runAnalysisEngine(organizationId: string) {
  const usage = await getRecentUsage(organizationId, 7); // Last 7 days
  
  const patterns = await Promise.all([
    detectModelDowngradeOpportunities(usage),
    detectCachingOpportunities(usage),
    detectBatchingOpportunities(usage),
    detectErrorPatterns(usage),
    detectUsageSpikes(usage),
  ]);
  
  const recommendations = generateRecommendations(patterns);
  await saveRecommendations(organizationId, recommendations);
}
```

## 2. Recommendation Generator (AI-Powered)

Uses Claude/GPT to generate intelligent, context-aware recommendations.

### When to Use AI

1. **Complex Pattern Explanation**: Explain why a pattern was detected
2. **Custom Recommendations**: Generate tailored advice based on usage
3. **Impact Prediction**: Estimate savings with higher accuracy
4. **Natural Language**: Generate human-readable descriptions

### AI Prompt Template

```typescript
const prompt = `
You are an AI cost optimization expert for TokenTRA.

Analyze this usage data and generate optimization recommendations:

Usage Summary:
- Total Spend: $${totalSpend}
- Top Models: ${topModels.join(', ')}
- Request Patterns: ${patterns}

Detected Opportunities:
${detectedPatterns.map(p => `- ${p.type}: ${p.description}`).join('\n')}

Generate 3-5 actionable recommendations with:
1. Clear title
2. Detailed description
3. Estimated monthly savings
4. Implementation steps
5. Risk assessment

Format as JSON array.
`;
```

### Fallback to Rule-Based

If AI is unavailable or for simple cases, use rule-based generation:

```typescript
const RULE_TEMPLATES = {
  model_downgrade: {
    title: "Switch from {currentModel} to {suggestedModel}",
    description: "Analysis shows {percentage}% of your {currentModel} requests are simple queries that could be handled by {suggestedModel} at {savingsPercent}% lower cost.",
  },
  caching_opportunity: {
    title: "Enable semantic caching for repeated queries",
    description: "We detected {duplicateRate}% of your queries are semantically similar. Enabling caching could reduce costs by ${estimatedSavings}/month.",
  },
  // ... more templates
};
```

## 3. Execution Engine (Real-time)

When user clicks "Apply", create actionable routing rules.

### Routing Rules Table

```sql
CREATE TABLE routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL, -- 'model_route', 'cache', 'batch', 'rate_limit'
  priority INTEGER DEFAULT 0,
  conditions JSONB NOT NULL, -- When to apply this rule
  actions JSONB NOT NULL,    -- What to do
  enabled BOOLEAN DEFAULT true,
  created_from_recommendation_id UUID REFERENCES recommendations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Rule Types

#### Model Routing Rule
```json
{
  "rule_type": "model_route",
  "conditions": {
    "original_model": "gpt-4o",
    "prompt_tokens_lt": 500,
    "complexity_score_lt": 0.5
  },
  "actions": {
    "route_to_model": "gpt-4o-mini",
    "fallback_on_error": true
  }
}
```

#### Caching Rule
```json
{
  "rule_type": "cache",
  "conditions": {
    "models": ["gpt-4o", "gpt-4o-mini"],
    "similarity_threshold": 0.95
  },
  "actions": {
    "cache_ttl_seconds": 3600,
    "cache_scope": "organization"
  }
}
```

#### Rate Limiting Rule
```json
{
  "rule_type": "rate_limit",
  "conditions": {
    "team_id": "engineering",
    "time_window": "1h"
  },
  "actions": {
    "max_requests": 1000,
    "max_cost": 100.00,
    "action_on_exceed": "queue" // or "reject", "alert"
  }
}
```

## 4. SDK Integration

The SDK must check routing rules before making API calls.

### SDK Flow

```typescript
class TokenTraClient {
  async chat(params: ChatParams): Promise<ChatResponse> {
    // 1. Check routing rules
    const rules = await this.getActiveRules();
    const applicableRules = this.findApplicableRules(rules, params);
    
    // 2. Apply optimizations
    let optimizedParams = params;
    for (const rule of applicableRules) {
      optimizedParams = await this.applyRule(rule, optimizedParams);
    }
    
    // 3. Check cache (if caching rule active)
    const cached = await this.checkCache(optimizedParams);
    if (cached) {
      await this.trackUsage({ ...params, cached: true, cost: 0 });
      return cached;
    }
    
    // 4. Make API call with optimized params
    const response = await this.callProvider(optimizedParams);
    
    // 5. Cache response if applicable
    await this.cacheResponse(optimizedParams, response);
    
    // 6. Track usage
    await this.trackUsage({
      original: params,
      optimized: optimizedParams,
      response,
    });
    
    return response;
  }
}
```

## 5. Apply Button Flow

When user clicks "Apply" on a recommendation:

```typescript
async function applyRecommendation(recommendationId: string) {
  const rec = await getRecommendation(recommendationId);
  
  // 1. Create routing rule based on recommendation type
  const rule = createRuleFromRecommendation(rec);
  await saveRoutingRule(rule);
  
  // 2. Update recommendation status
  await updateRecommendation(recommendationId, {
    status: 'applied',
    applied_at: new Date(),
    routing_rule_id: rule.id,
  });
  
  // 3. Log the action
  await logOptimizationAction({
    recommendation_id: recommendationId,
    rule_id: rule.id,
    action_type: rec.type,
    estimated_savings: rec.impact.estimatedMonthlySavings,
  });
  
  // 4. Notify SDK to refresh rules (via webhook or polling)
  await notifyRuleChange(rec.organization_id);
}
```

## 6. Scheduled Jobs

### Hourly Analysis Job
```typescript
// Supabase Edge Function or external cron
// Runs for all active organizations
async function hourlyAnalysis() {
  const orgs = await getActiveOrganizations();
  
  for (const org of orgs) {
    await runAnalysisEngine(org.id);
  }
}
```

### Daily Summary Job
```typescript
// Generate daily optimization reports
async function dailySummary() {
  const orgs = await getActiveOrganizations();
  
  for (const org of orgs) {
    const summary = await generateDailySummary(org.id);
    await sendSummaryEmail(org, summary);
  }
}
```

## 7. Metrics & Monitoring

Track optimization effectiveness:

```sql
-- Optimization metrics view
CREATE VIEW optimization_metrics AS
SELECT
  organization_id,
  COUNT(*) FILTER (WHERE status = 'applied') as applied_count,
  SUM(actual_savings) as total_actual_savings,
  SUM(estimated_savings) as total_estimated_savings,
  AVG(actual_savings / NULLIF(estimated_savings, 0)) as accuracy_ratio
FROM optimization_actions
GROUP BY organization_id;
```

## Implementation Priority

1. **Phase 1**: Create `routing_rules` table, wire Apply button
2. **Phase 2**: Build analysis engine with rule-based detection
3. **Phase 3**: Add AI-powered recommendation generation
4. **Phase 4**: SDK integration for rule enforcement
5. **Phase 5**: Scheduled jobs and monitoring

## Technology Choices

| Component | Technology | Reason |
|-----------|------------|--------|
| Analysis Engine | Supabase Edge Function | Serverless, scheduled |
| AI Recommendations | Claude API | Best reasoning, cost-effective |
| Rule Storage | Supabase (PostgreSQL) | JSONB for flexible rules |
| Caching | Redis or Supabase | Low latency lookups |
| SDK | TypeScript | Type safety, wide adoption |

## Security Considerations

1. **Rule Validation**: Validate all rules before saving
2. **Rate Limiting**: Prevent rule abuse
3. **Audit Logging**: Track all rule changes
4. **Rollback**: Ability to quickly disable rules
5. **Sandboxing**: Test rules before production
