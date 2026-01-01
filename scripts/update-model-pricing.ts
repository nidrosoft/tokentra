#!/usr/bin/env npx tsx
/**
 * Model Pricing Update Script
 * 
 * This script fetches the latest AI model information from various sources
 * and updates the model_pricing table in Supabase.
 * 
 * Usage:
 *   npx tsx scripts/update-model-pricing.ts
 * 
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for admin access
 * 
 * Recommended: Run this script daily via cron or GitHub Actions
 */

import { createClient } from '@supabase/supabase-js';

// Types
interface ModelPricing {
  provider: string;
  model: string;
  display_name: string;
  input_price_per_1m: number;
  output_price_per_1m: number;
  cached_price_per_1m?: number | null;
  context_window?: number | null;
  capabilities: string[];
  is_active: boolean;
}

interface ProviderModelInfo {
  id: string;
  created?: number;
  owned_by?: string;
}

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Provider API configurations
const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    modelsUrl: 'https://api.openai.com/v1/models',
    apiKeyEnv: 'OPENAI_API_KEY',
  },
  anthropic: {
    name: 'Anthropic',
    modelsUrl: 'https://api.anthropic.com/v1/models',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
  },
  google: {
    name: 'Google',
    modelsUrl: 'https://generativelanguage.googleapis.com/v1/models',
    apiKeyEnv: 'GOOGLE_API_KEY',
  },
  mistral: {
    name: 'Mistral',
    modelsUrl: 'https://api.mistral.ai/v1/models',
    apiKeyEnv: 'MISTRAL_API_KEY',
  },
  cohere: {
    name: 'Cohere',
    modelsUrl: 'https://api.cohere.ai/v1/models',
    apiKeyEnv: 'COHERE_API_KEY',
  },
} as const;

// Default pricing for new models (conservative estimates)
const DEFAULT_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI
  'gpt-5': { input: 5.00, output: 20.00 },
  'gpt-4': { input: 2.50, output: 10.00 },
  'gpt-3.5': { input: 0.50, output: 1.50 },
  'o1': { input: 15.00, output: 60.00 },
  'o3': { input: 10.00, output: 40.00 },
  'o4': { input: 1.10, output: 4.40 },
  // Anthropic
  'claude-opus': { input: 15.00, output: 75.00 },
  'claude-sonnet': { input: 3.00, output: 15.00 },
  'claude-haiku': { input: 0.80, output: 4.00 },
  // Google
  'gemini-3': { input: 2.00, output: 12.00 },
  'gemini-2.5': { input: 1.25, output: 10.00 },
  'gemini-2.0': { input: 0.10, output: 0.40 },
  'gemini-1.5': { input: 0.075, output: 0.30 },
  // Mistral
  'mistral-large': { input: 2.00, output: 6.00 },
  'mistral-medium': { input: 0.40, output: 2.00 },
  'mistral-small': { input: 0.10, output: 0.30 },
  // Default fallback
  'default': { input: 1.00, output: 3.00 },
};

/**
 * Detect capabilities from model name
 */
function detectCapabilities(modelId: string): string[] {
  const capabilities: string[] = ['chat'];
  const id = modelId.toLowerCase();
  
  if (id.includes('vision') || id.includes('image') || id.includes('-v-')) {
    capabilities.push('vision');
  }
  if (id.includes('embed')) {
    return ['embeddings'];
  }
  if (id.includes('dall-e') || id.includes('imagen') || id.includes('stable')) {
    return ['image_generation'];
  }
  if (id.includes('whisper') || id.includes('tts')) {
    return ['audio'];
  }
  if (id.includes('o1') || id.includes('o3') || id.includes('reasoning') || id.includes('thinking')) {
    capabilities.push('reasoning');
  }
  if (id.includes('instruct') || id.includes('turbo') || !id.includes('base')) {
    capabilities.push('function_calling');
  }
  if (id.includes('code') || id.includes('coder')) {
    capabilities.push('code_generation');
  }
  
  return capabilities;
}

/**
 * Get pricing estimate for a model
 */
function getPricing(modelId: string): { input: number; output: number } {
  const id = modelId.toLowerCase();
  
  for (const [pattern, pricing] of Object.entries(DEFAULT_PRICING)) {
    if (id.includes(pattern)) {
      return pricing;
    }
  }
  
  return DEFAULT_PRICING['default'];
}

/**
 * Generate display name from model ID
 */
function generateDisplayName(modelId: string): string {
  return modelId
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/(\d+)([a-z])/gi, '$1 $2')
    .trim();
}

/**
 * Fetch models from a provider API
 */
async function fetchProviderModels(
  provider: keyof typeof PROVIDERS
): Promise<ProviderModelInfo[]> {
  const config = PROVIDERS[provider];
  const apiKey = process.env[config.apiKeyEnv];
  
  if (!apiKey) {
    console.log(`⚠️  Skipping ${config.name}: No API key (${config.apiKeyEnv})`);
    return [];
  }
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Different auth headers for different providers
    if (provider === 'openai') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (provider === 'google') {
      // Google uses query param
    } else if (provider === 'mistral') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'cohere') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    let url = config.modelsUrl;
    if (provider === 'google') {
      url += `?key=${apiKey}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`❌ ${config.name} API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    // Different response formats
    if (provider === 'google') {
      return data.models || [];
    }
    
    return data.data || [];
  } catch (error) {
    console.error(`❌ Error fetching ${config.name} models:`, error);
    return [];
  }
}

/**
 * Get existing models from database
 */
async function getExistingModels(): Promise<Map<string, ModelPricing>> {
  const { data, error } = await supabase
    .from('model_pricing')
    .select('*');
  
  if (error) {
    console.error('Error fetching existing models:', error);
    return new Map();
  }
  
  const map = new Map<string, ModelPricing>();
  for (const model of data || []) {
    map.set(`${model.provider}:${model.model}`, model);
  }
  
  return map;
}

/**
 * Upsert a model to the database
 */
async function upsertModel(model: ModelPricing): Promise<boolean> {
  const { error } = await supabase
    .from('model_pricing')
    .upsert(
      {
        provider: model.provider,
        model: model.model,
        display_name: model.display_name,
        input_price_per_1m: model.input_price_per_1m,
        output_price_per_1m: model.output_price_per_1m,
        cached_price_per_1m: model.cached_price_per_1m,
        context_window: model.context_window,
        capabilities: model.capabilities,
        is_active: model.is_active,
        effective_from: new Date().toISOString(),
      },
      {
        onConflict: 'provider,model,effective_from',
      }
    );
  
  if (error) {
    console.error(`Error upserting ${model.provider}/${model.model}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Main update function
 */
async function updateModels(): Promise<void> {
  console.log('🚀 Starting model pricing update...\n');
  
  const existingModels = await getExistingModels();
  console.log(`📊 Found ${existingModels.size} existing models in database\n`);
  
  let newModels = 0;
  let updatedModels = 0;
  
  for (const [provider, config] of Object.entries(PROVIDERS)) {
    console.log(`\n📡 Fetching models from ${config.name}...`);
    
    const models = await fetchProviderModels(provider as keyof typeof PROVIDERS);
    console.log(`   Found ${models.length} models`);
    
    for (const model of models) {
      const modelId = model.id;
      const key = `${provider}:${modelId}`;
      
      // Skip if already exists and is recent
      if (existingModels.has(key)) {
        continue;
      }
      
      const pricing = getPricing(modelId);
      const capabilities = detectCapabilities(modelId);
      
      const newModel: ModelPricing = {
        provider,
        model: modelId,
        display_name: generateDisplayName(modelId),
        input_price_per_1m: pricing.input,
        output_price_per_1m: pricing.output,
        cached_price_per_1m: pricing.input * 0.5,
        context_window: null,
        capabilities,
        is_active: true,
      };
      
      const success = await upsertModel(newModel);
      if (success) {
        console.log(`   ✅ Added: ${modelId}`);
        newModels++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📈 Update complete!`);
  console.log(`   New models added: ${newModels}`);
  console.log(`   Models updated: ${updatedModels}`);
  console.log(`   Total models: ${existingModels.size + newModels}`);
}

/**
 * Print current model counts
 */
async function printStats(): Promise<void> {
  const { data, error } = await supabase
    .from('model_pricing')
    .select('provider')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching stats:', error);
    return;
  }
  
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.provider] = (counts[row.provider] || 0) + 1;
  }
  
  console.log('\n📊 Current Model Counts by Provider:');
  console.log('='.repeat(40));
  
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  for (const [provider, count] of sorted) {
    console.log(`   ${provider.padEnd(15)} ${count}`);
  }
  
  console.log('='.repeat(40));
  console.log(`   ${'TOTAL'.padEnd(15)} ${data?.length || 0}`);
}

// Run the update
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--stats')) {
    await printStats();
  } else if (args.includes('--help')) {
    console.log(`
Model Pricing Update Script

Usage:
  npx tsx scripts/update-model-pricing.ts [options]

Options:
  --stats    Print current model counts by provider
  --help     Show this help message

Environment Variables:
  SUPABASE_URL              Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY Service role key for admin access
  OPENAI_API_KEY            OpenAI API key (optional)
  ANTHROPIC_API_KEY         Anthropic API key (optional)
  GOOGLE_API_KEY            Google AI API key (optional)
  MISTRAL_API_KEY           Mistral API key (optional)
  COHERE_API_KEY            Cohere API key (optional)

Note: API keys are optional. If not provided, models from that
provider will be skipped during the update.
    `);
  } else {
    await updateModels();
    await printStats();
  }
}

main().catch(console.error);
