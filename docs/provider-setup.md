# Provider Setup Guide

## Overview

TokenTRA integrates with major AI providers to automatically sync usage and cost data.

## Supported Providers

- **OpenAI** - GPT-4, GPT-3.5, Embeddings, DALL-E
- **Anthropic** - Claude 3.5, Claude 3
- **Google** - Gemini 1.5 Pro, Gemini 1.5 Flash
- **Azure OpenAI** - All Azure-hosted OpenAI models
- **AWS Bedrock** - Claude, Titan, and other Bedrock models

## OpenAI Setup

1. Navigate to **Providers** → **Connect Provider**
2. Select **OpenAI**
3. Enter your OpenAI API key
4. (Optional) Enter your Organization ID
5. Click **Connect**

### Required Permissions

Your API key needs access to the Usage API:
- `usage.read` - Read usage data

## Anthropic Setup

1. Navigate to **Providers** → **Connect Provider**
2. Select **Anthropic**
3. Enter your Anthropic API key
4. Click **Connect**

### Required Permissions

- API key with usage access

## Azure OpenAI Setup

1. Navigate to **Providers** → **Connect Provider**
2. Select **Azure OpenAI**
3. Enter your Azure credentials:
   - API Key
   - Endpoint URL
   - Deployment ID
4. Click **Connect**

## Google Vertex AI Setup

1. Navigate to **Providers** → **Connect Provider**
2. Select **Google Vertex AI**
3. Enter your Google Cloud credentials:
   - Project ID
   - Location
   - Service Account JSON
4. Click **Connect**

## AWS Bedrock Setup

1. Navigate to **Providers** → **Connect Provider**
2. Select **AWS Bedrock**
3. Enter your AWS credentials:
   - Access Key ID
   - Secret Access Key
   - Region
4. Click **Connect**

## Sync Frequency

- **Real-time**: SDK events are tracked immediately
- **Hourly**: Provider usage data is synced every hour
- **Manual**: Trigger a sync anytime from the provider settings

## Troubleshooting

### Connection Failed

- Verify your API key is correct
- Check that your key has the required permissions
- Ensure your account is in good standing

### Missing Usage Data

- Usage data may take up to 24 hours to appear
- Check that the date range includes recent activity
- Verify the provider sync status
