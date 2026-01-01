/**
 * Model Pricing Update System
 * 
 * This module provides utilities for keeping the model_pricing table up to date.
 * It can fetch the latest models from various sources and update the database.
 * 
 * Sources used:
 * - LMSys Chatbot Arena Leaderboard (https://lmarena.ai)
 * - Artificial Analysis (https://artificialanalysis.ai)
 * - Vellum AI Leaderboard (https://vellum.ai/llm-leaderboard)
 * - LLMBase.ai (https://llmbase.ai/leaderboard)
 * - Official provider APIs and documentation
 * 
 * This should be run as a scheduled job (daily or weekly) to ensure
 * TokenTRA always has the latest model information.
 */

export interface ModelPricing {
  provider: string;
  model: string;
  display_name: string;
  input_price_per_1m: number;
  output_price_per_1m: number;
  cached_price_per_1m?: number;
  context_window?: number;
  capabilities: string[];
  is_active: boolean;
  effective_from: Date;
}

/**
 * Known model pricing sources that can be scraped/queried
 */
export const MODEL_SOURCES = {
  // Official API documentation pages
  OPENAI: 'https://openai.com/api/pricing/',
  ANTHROPIC: 'https://www.anthropic.com/pricing',
  GOOGLE: 'https://ai.google.dev/pricing',
  XAI: 'https://x.ai/api',
  DEEPSEEK: 'https://api-docs.deepseek.com/quick_start/pricing',
  MISTRAL: 'https://mistral.ai/pricing',
  COHERE: 'https://cohere.com/pricing',
  
  // Leaderboards and aggregators
  LMSYS_ARENA: 'https://lmarena.ai/leaderboard/text',
  ARTIFICIAL_ANALYSIS: 'https://artificialanalysis.ai/models',
  VELLUM: 'https://vellum.ai/llm-leaderboard',
  LLMBASE: 'https://llmbase.ai/leaderboard/intelligent/',
  LLM_STATS: 'https://llm-stats.com',
  
  // Price comparison sites
  PRICE_PER_TOKEN: 'https://pricepertoken.com',
  INTUITION_LABS: 'https://intuitionlabs.ai/articles/llm-api-pricing-comparison-2025',
} as const;

/**
 * Provider configurations with their API endpoints for model discovery
 */
export const PROVIDER_CONFIGS = {
  openai: {
    name: 'OpenAI',
    modelsEndpoint: 'https://api.openai.com/v1/models',
    pricingPage: 'https://openai.com/api/pricing/',
    prefixes: ['gpt-', 'o1', 'o3', 'o4', 'text-embedding', 'dall-e', 'whisper', 'tts'],
  },
  anthropic: {
    name: 'Anthropic',
    modelsEndpoint: 'https://api.anthropic.com/v1/models',
    pricingPage: 'https://www.anthropic.com/pricing',
    prefixes: ['claude-'],
  },
  google: {
    name: 'Google',
    modelsEndpoint: 'https://generativelanguage.googleapis.com/v1/models',
    pricingPage: 'https://ai.google.dev/pricing',
    prefixes: ['gemini-', 'text-embedding', 'imagen'],
  },
  xai: {
    name: 'xAI',
    modelsEndpoint: 'https://api.x.ai/v1/models',
    pricingPage: 'https://x.ai/api',
    prefixes: ['grok-'],
  },
  deepseek: {
    name: 'DeepSeek',
    modelsEndpoint: 'https://api.deepseek.com/v1/models',
    pricingPage: 'https://api-docs.deepseek.com/quick_start/pricing',
    prefixes: ['deepseek-'],
  },
  mistral: {
    name: 'Mistral',
    modelsEndpoint: 'https://api.mistral.ai/v1/models',
    pricingPage: 'https://mistral.ai/pricing',
    prefixes: ['mistral-', 'codestral', 'pixtral', 'ministral', 'open-'],
  },
  cohere: {
    name: 'Cohere',
    modelsEndpoint: 'https://api.cohere.ai/v1/models',
    pricingPage: 'https://cohere.com/pricing',
    prefixes: ['command-', 'embed-', 'rerank-'],
  },
} as const;

/**
 * Capabilities that can be detected from model names/descriptions
 */
export const CAPABILITY_PATTERNS = {
  vision: ['vision', 'image', 'multimodal', 'visual', '-v-'],
  reasoning: ['reasoning', 'thinking', 'o1', 'o3', 'r1', 'qwq'],
  function_calling: ['function', 'tool', 'instruct'],
  code_generation: ['code', 'coder', 'codestral'],
  embeddings: ['embed', 'embedding'],
  image_generation: ['dall-e', 'imagen', 'stable-diffusion', 'flux', 'sdxl'],
  audio: ['whisper', 'tts', 'audio'],
  video: ['video'],
  search: ['sonar', 'search'],
  agents: ['agent', 'computer_use'],
} as const;

/**
 * Detect capabilities from model name
 */
export function detectCapabilities(modelName: string, displayName: string): string[] {
  const capabilities: string[] = ['chat']; // Default capability
  const searchText = `${modelName} ${displayName}`.toLowerCase();
  
  for (const [capability, patterns] of Object.entries(CAPABILITY_PATTERNS)) {
    if (patterns.some(pattern => searchText.includes(pattern.toLowerCase()))) {
      capabilities.push(capability);
    }
  }
  
  return [...new Set(capabilities)];
}

/**
 * Generate a display name from a model ID
 */
export function generateDisplayName(modelId: string, provider: string): string {
  // Remove provider prefix if present
  let name = modelId;
  
  // Common transformations
  name = name
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\./g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Add provider name if not already present
  const providerName = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS]?.name;
  if (providerName && !name.toLowerCase().includes(providerName.toLowerCase())) {
    // Don't add provider name, keep it clean
  }
  
  return name;
}

/**
 * SQL to create a function for upserting model pricing
 */
export const UPSERT_MODEL_PRICING_SQL = `
CREATE OR REPLACE FUNCTION upsert_model_pricing(
  p_provider TEXT,
  p_model TEXT,
  p_display_name TEXT,
  p_input_price DECIMAL,
  p_output_price DECIMAL,
  p_cached_price DECIMAL DEFAULT NULL,
  p_context_window INTEGER DEFAULT NULL,
  p_capabilities TEXT[] DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Try to update existing record
  UPDATE model_pricing
  SET 
    display_name = p_display_name,
    input_price_per_1m = p_input_price,
    output_price_per_1m = p_output_price,
    cached_price_per_1m = COALESCE(p_cached_price, cached_price_per_1m),
    context_window = COALESCE(p_context_window, context_window),
    capabilities = p_capabilities,
    is_active = TRUE
  WHERE provider = p_provider AND model = p_model
  RETURNING id INTO v_id;
  
  -- If no update, insert new record
  IF v_id IS NULL THEN
    INSERT INTO model_pricing (
      provider, model, display_name, 
      input_price_per_1m, output_price_per_1m, cached_price_per_1m,
      context_window, capabilities, is_active
    ) VALUES (
      p_provider, p_model, p_display_name,
      p_input_price, p_output_price, p_cached_price,
      p_context_window, p_capabilities, TRUE
    )
    RETURNING id INTO v_id;
  END IF;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;
`;

/**
 * SQL to mark old models as inactive
 */
export const MARK_INACTIVE_SQL = `
-- Mark models as inactive if they haven't been updated in 90 days
UPDATE model_pricing
SET is_active = FALSE
WHERE effective_from < NOW() - INTERVAL '90 days'
  AND is_active = TRUE;
`;

/**
 * Recommended update schedule
 */
export const UPDATE_SCHEDULE = {
  // Check for new models daily
  NEW_MODELS_CHECK: '0 6 * * *', // 6 AM daily
  
  // Full pricing refresh weekly
  PRICING_REFRESH: '0 0 * * 0', // Midnight Sunday
  
  // Leaderboard sync (for rankings/benchmarks)
  LEADERBOARD_SYNC: '0 12 * * 1,4', // Noon Monday and Thursday
} as const;

/**
 * Instructions for setting up automated updates
 */
export const SETUP_INSTRUCTIONS = `
# Model Pricing Auto-Update Setup

## Option 1: Supabase Edge Function (Recommended)
1. Create an Edge Function that runs on a schedule
2. Use the Supabase Cron extension to trigger it daily
3. The function should:
   - Fetch latest models from provider APIs
   - Compare with existing models in database
   - Upsert new/updated models
   - Mark deprecated models as inactive

## Option 2: External Cron Job
1. Set up a cron job on your server or use a service like:
   - GitHub Actions (scheduled workflow)
   - Vercel Cron Jobs
   - AWS Lambda with EventBridge
   - Railway Cron
2. Run a script that calls the Supabase API to update models

## Option 3: Manual Updates
1. Subscribe to provider newsletters/blogs for announcements
2. Monitor LMSys Arena and Artificial Analysis leaderboards
3. Run the update script manually when new models are released

## Data Sources to Monitor
- OpenAI Blog: https://openai.com/blog
- Anthropic News: https://www.anthropic.com/news
- Google AI Blog: https://blog.google/technology/ai/
- xAI Announcements: https://x.ai/news
- LMSys Arena: https://lmarena.ai
- Artificial Analysis: https://artificialanalysis.ai
- Hugging Face: https://huggingface.co/models

## Webhook Integration
Consider setting up webhooks or RSS feeds for:
- Provider announcement pages
- GitHub releases for open-source models
- Hugging Face model uploads
`;
