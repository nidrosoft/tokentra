# API Reference

TokenTRA provides a RESTful API for programmatic access to all features.

## Base URL

```
https://api.tokentra.ai/v1
```

## Authentication

All API requests require authentication using an API key:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.tokentra.ai/v1/costs
```

## Endpoints

### Costs

#### GET /costs
Retrieve cost records.

**Query Parameters:**
- `from` (required): Start date (ISO 8601)
- `to` (required): End date (ISO 8601)
- `providers[]`: Filter by providers
- `models[]`: Filter by models
- `teams[]`: Filter by teams
- `projects[]`: Filter by projects

#### GET /costs/aggregate
Get aggregated cost summary.

#### GET /costs/trends
Get cost trends over time.

### Usage

#### GET /usage
Retrieve usage records.

#### GET /usage/tokens
Get token usage breakdown.

### Providers

#### GET /providers
List connected providers.

#### POST /providers
Connect a new provider.

#### POST /providers/:id/sync
Trigger a manual sync.

### Budgets

#### GET /budgets
List all budgets.

#### POST /budgets
Create a new budget.

#### GET /budgets/:id/status
Get budget status and progress.

### Alerts

#### GET /alerts
List alert rules.

#### POST /alerts
Create a new alert.

#### GET /alerts/history
Get triggered alert history.

### Optimization

#### GET /optimization/recommendations
Get optimization recommendations.

#### POST /optimization/recommendations/:id/apply
Apply a recommendation.

## Rate Limits

- 100 requests per minute for standard endpoints
- 1000 requests per minute for SDK tracking endpoints

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
