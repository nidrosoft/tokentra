# Best Practices

## Cost Attribution

### Use Project and Team Tags

Always tag your API calls with project and team identifiers:

```typescript
client.track({
  provider: "openai",
  model: "gpt-4o",
  inputTokens: 1500,
  outputTokens: 500,
  metadata: {
    projectId: "customer-chatbot",
    teamId: "engineering",
    feature: "support-tickets",
  },
});
```

### Consistent Naming

Use consistent naming conventions across your organization:

- **Projects**: `{team}-{product}-{feature}`
- **Teams**: Match your organizational structure
- **Features**: Descriptive, lowercase, hyphenated

## Cost Optimization

### 1. Right-size Your Models

Not every task needs GPT-4. Consider:

| Task | Recommended Model |
|------|-------------------|
| Simple classification | GPT-3.5 Turbo |
| Complex reasoning | GPT-4o |
| Code generation | GPT-4o or Claude 3.5 |
| Embeddings | text-embedding-3-small |

### 2. Optimize Prompts

- Remove unnecessary context
- Use system prompts efficiently
- Cache common prompt prefixes

### 3. Implement Caching

Cache responses for:
- Frequently asked questions
- Static content generation
- Repeated embeddings

### 4. Set Budget Alerts

Configure alerts at multiple thresholds:
- 50% - Early warning
- 75% - Review usage
- 90% - Take action
- 100% - Hard limit (if supported)

## Monitoring

### Daily Reviews

- Check the dashboard for anomalies
- Review top consumers
- Monitor cost trends

### Weekly Reports

- Enable automated weekly reports
- Review team allocations
- Identify optimization opportunities

### Monthly Analysis

- Compare month-over-month trends
- Review budget performance
- Plan capacity for next month

## Security

### API Key Management

- Rotate keys regularly
- Use separate keys per environment
- Never commit keys to version control

### Access Control

- Use role-based access control
- Limit admin access
- Audit access logs regularly

## Integration Patterns

### Middleware Pattern

```typescript
// Express middleware
app.use(async (req, res, next) => {
  req.tokentra = new TokenTRAClient({
    apiKey: process.env.TOKENTRA_API_KEY,
    metadata: {
      requestId: req.id,
      userId: req.user?.id,
    },
  });
  next();
});
```

### Singleton Pattern

```typescript
// lib/tokentra.ts
let client: TokenTRAClient | null = null;

export function getTokenTRAClient() {
  if (!client) {
    client = new TokenTRAClient({
      apiKey: process.env.TOKENTRA_API_KEY,
    });
  }
  return client;
}
```

## Troubleshooting

### Missing Events

1. Check that `flush()` is called before shutdown
2. Verify API key permissions
3. Check network connectivity

### Incorrect Costs

1. Verify model names match exactly
2. Check for custom pricing configurations
3. Contact support for pricing updates
