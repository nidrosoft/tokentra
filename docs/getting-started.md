# Getting Started with TokenTRA

This guide will help you set up TokenTRA and start tracking your AI costs.

## Prerequisites

- Node.js 18+ or Bun
- A TokenTRA account
- API keys from your AI providers (OpenAI, Anthropic, etc.)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Copy the environment file:

```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Start the development server:

```bash
bun dev
```

## Connecting Your First Provider

1. Navigate to **Providers** in the dashboard
2. Click **Connect Provider**
3. Select your provider (e.g., OpenAI)
4. Enter your API key
5. Click **Connect**

TokenTRA will automatically start syncing your usage data.

## Setting Up Cost Attribution

To attribute costs to teams and projects:

1. Go to **Teams** and create your team structure
2. Go to **Projects** and create projects
3. Configure API key patterns to automatically route costs

## Next Steps

- [Configure Budgets](./budgets.md)
- [Set Up Alerts](./alerts.md)
- [Integrate the SDK](./sdk.md)
