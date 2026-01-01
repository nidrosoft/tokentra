/**
 * TokenTRA Enterprise Model Registry
 * Comprehensive model catalog with December 2025 pricing and capabilities
 */

import type { ModelConfig, Provider, ModelTier, TaskCategory } from './types';

export class ModelRegistry {
  private models: Map<string, ModelConfig> = new Map();
  private providerModels: Map<Provider, string[]> = new Map();
  private tierModels: Map<ModelTier, string[]> = new Map();

  constructor() {
    this.initializeModels();
    this.buildIndexes();
  }

  private initializeModels(): void {
    const modelConfigs: ModelConfig[] = [
      // ========================================================================
      // BUDGET TIER - Cost-effective models for simple tasks
      // ========================================================================
      {
        id: 'gpt-4o-mini',
        provider: 'openai',
        model: 'gpt-4o-mini',
        displayName: 'GPT-4o Mini',
        tier: 'budget',
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.60,
        avgLatencyMs: 500,
        maxContextTokens: 128000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 78, content: 75, analysis: 72, coding: 70,
          reasoning: 65, creative: 73, embedding: 0, multimodal: 70
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'claude-3-5-haiku-20241022',
        provider: 'anthropic',
        model: 'claude-3-5-haiku-20241022',
        displayName: 'Claude 3.5 Haiku',
        tier: 'budget',
        inputCostPer1M: 0.80,
        outputCostPer1M: 4.00,
        cachingInputCostPer1M: 0.08,
        avgLatencyMs: 400,
        maxContextTokens: 200000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 82, content: 80, analysis: 78, coding: 80,
          reasoning: 70, creative: 78, embedding: 0, multimodal: 75
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gemini-2.0-flash',
        provider: 'google',
        model: 'gemini-2.0-flash',
        displayName: 'Gemini 2.0 Flash',
        tier: 'budget',
        inputCostPer1M: 0.10,
        outputCostPer1M: 0.40,
        avgLatencyMs: 350,
        maxContextTokens: 1000000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 76, content: 74, analysis: 75, coding: 72,
          reasoning: 68, creative: 70, embedding: 0, multimodal: 78
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gemini-1.5-flash',
        provider: 'google',
        model: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash',
        tier: 'budget',
        inputCostPer1M: 0.075,
        outputCostPer1M: 0.30,
        avgLatencyMs: 300,
        maxContextTokens: 1000000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 72, content: 70, analysis: 70, coding: 68,
          reasoning: 62, creative: 65, embedding: 0, multimodal: 75
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'deepseek-chat',
        provider: 'deepseek',
        model: 'deepseek-chat',
        displayName: 'DeepSeek V3',
        tier: 'budget',
        inputCostPer1M: 0.27,
        outputCostPer1M: 1.10,
        cachingInputCostPer1M: 0.07,
        avgLatencyMs: 800,
        maxContextTokens: 64000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 85, content: 82, analysis: 84, coding: 90,
          reasoning: 88, creative: 78, embedding: 0, multimodal: 0
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: false
      },
      {
        id: 'mistral-small-latest',
        provider: 'mistral',
        model: 'mistral-small-latest',
        displayName: 'Mistral Small',
        tier: 'budget',
        inputCostPer1M: 0.20,
        outputCostPer1M: 0.60,
        avgLatencyMs: 400,
        maxContextTokens: 32000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 74, content: 72, analysis: 70, coding: 72,
          reasoning: 65, creative: 70, embedding: 0, multimodal: 0
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: false
      },
      {
        id: 'llama-3.3-70b',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        displayName: 'Llama 3.3 70B (Groq)',
        tier: 'budget',
        inputCostPer1M: 0.59,
        outputCostPer1M: 0.79,
        avgLatencyMs: 200,
        maxContextTokens: 128000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 80, content: 78, analysis: 76, coding: 78,
          reasoning: 72, creative: 75, embedding: 0, multimodal: 0
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: false
      },

      // ========================================================================
      // MID TIER - Balanced performance and cost
      // ========================================================================
      {
        id: 'gpt-4o',
        provider: 'openai',
        model: 'gpt-4o',
        displayName: 'GPT-4o',
        tier: 'mid',
        inputCostPer1M: 2.50,
        outputCostPer1M: 10.00,
        avgLatencyMs: 700,
        maxContextTokens: 128000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 90, content: 88, analysis: 87, coding: 85,
          reasoning: 82, creative: 88, embedding: 0, multimodal: 90
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        displayName: 'Claude 3.5 Sonnet',
        tier: 'mid',
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
        cachingInputCostPer1M: 0.30,
        avgLatencyMs: 600,
        maxContextTokens: 200000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 92, content: 90, analysis: 91, coding: 93,
          reasoning: 88, creative: 90, embedding: 0, multimodal: 88
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gemini-1.5-pro',
        provider: 'google',
        model: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        tier: 'mid',
        inputCostPer1M: 1.25,
        outputCostPer1M: 5.00,
        avgLatencyMs: 550,
        maxContextTokens: 2000000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 86, content: 84, analysis: 86, coding: 82,
          reasoning: 80, creative: 82, embedding: 0, multimodal: 90
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gemini-2.0-flash-thinking',
        provider: 'google',
        model: 'gemini-2.0-flash-thinking-exp',
        displayName: 'Gemini 2.0 Flash Thinking',
        tier: 'mid',
        inputCostPer1M: 0.70,
        outputCostPer1M: 2.80,
        avgLatencyMs: 1500,
        maxContextTokens: 1000000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 82, content: 80, analysis: 88, coding: 85,
          reasoning: 90, creative: 78, embedding: 0, multimodal: 80
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: false,
        supportsVision: true
      },
      {
        id: 'mistral-large-latest',
        provider: 'mistral',
        model: 'mistral-large-latest',
        displayName: 'Mistral Large',
        tier: 'mid',
        inputCostPer1M: 2.00,
        outputCostPer1M: 6.00,
        avgLatencyMs: 600,
        maxContextTokens: 128000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 86, content: 84, analysis: 85, coding: 84,
          reasoning: 80, creative: 82, embedding: 0, multimodal: 0
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: false
      },
      {
        id: 'gpt-4-turbo',
        provider: 'openai',
        model: 'gpt-4-turbo',
        displayName: 'GPT-4 Turbo',
        tier: 'mid',
        inputCostPer1M: 10.00,
        outputCostPer1M: 30.00,
        avgLatencyMs: 800,
        maxContextTokens: 128000,
        maxOutputTokens: 4096,
        qualityScores: {
          chat: 88, content: 86, analysis: 85, coding: 84,
          reasoning: 80, creative: 86, embedding: 0, multimodal: 85
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true,
        deprecationDate: '2025-04-30',
        alternatives: ['gpt-4o']
      },

      // ========================================================================
      // PREMIUM TIER - Highest quality for complex tasks
      // ========================================================================
      {
        id: 'claude-3-opus-20240229',
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        displayName: 'Claude 3 Opus',
        tier: 'premium',
        inputCostPer1M: 15.00,
        outputCostPer1M: 75.00,
        cachingInputCostPer1M: 1.50,
        avgLatencyMs: 1500,
        maxContextTokens: 200000,
        maxOutputTokens: 4096,
        qualityScores: {
          chat: 94, content: 93, analysis: 94, coding: 92,
          reasoning: 95, creative: 94, embedding: 0, multimodal: 90
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'o1',
        provider: 'openai',
        model: 'o1',
        displayName: 'OpenAI o1',
        tier: 'premium',
        inputCostPer1M: 15.00,
        outputCostPer1M: 60.00,
        avgLatencyMs: 5000,
        maxContextTokens: 200000,
        maxOutputTokens: 100000,
        qualityScores: {
          chat: 85, content: 80, analysis: 92, coding: 95,
          reasoning: 99, creative: 75, embedding: 0, multimodal: 80
        },
        capabilities: ['analysis', 'coding', 'reasoning'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: false,
        supportsVision: true
      },
      {
        id: 'o1-mini',
        provider: 'openai',
        model: 'o1-mini',
        displayName: 'OpenAI o1-mini',
        tier: 'mid',
        inputCostPer1M: 3.00,
        outputCostPer1M: 12.00,
        avgLatencyMs: 3000,
        maxContextTokens: 128000,
        maxOutputTokens: 65536,
        qualityScores: {
          chat: 78, content: 75, analysis: 85, coding: 90,
          reasoning: 92, creative: 70, embedding: 0, multimodal: 0
        },
        capabilities: ['analysis', 'coding', 'reasoning'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: false,
        supportsVision: false
      },
      {
        id: 'o3-mini',
        provider: 'openai',
        model: 'o3-mini',
        displayName: 'OpenAI o3-mini',
        tier: 'premium',
        inputCostPer1M: 1.10,
        outputCostPer1M: 4.40,
        avgLatencyMs: 2000,
        maxContextTokens: 200000,
        maxOutputTokens: 100000,
        qualityScores: {
          chat: 82, content: 78, analysis: 90, coding: 94,
          reasoning: 97, creative: 72, embedding: 0, multimodal: 0
        },
        capabilities: ['analysis', 'coding', 'reasoning'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: false
      },

      // ========================================================================
      // EMBEDDING MODELS
      // ========================================================================
      {
        id: 'text-embedding-3-small',
        provider: 'openai',
        model: 'text-embedding-3-small',
        displayName: 'Embedding 3 Small',
        tier: 'budget',
        inputCostPer1M: 0.02,
        outputCostPer1M: 0,
        avgLatencyMs: 100,
        maxContextTokens: 8192,
        maxOutputTokens: 0,
        qualityScores: {
          chat: 0, content: 0, analysis: 0, coding: 0,
          reasoning: 0, creative: 0, embedding: 85, multimodal: 0
        },
        capabilities: ['embedding'],
        supportsBatching: true,
        supportsStreaming: false,
        supportsTools: false,
        supportsVision: false
      },
      {
        id: 'text-embedding-3-large',
        provider: 'openai',
        model: 'text-embedding-3-large',
        displayName: 'Embedding 3 Large',
        tier: 'mid',
        inputCostPer1M: 0.13,
        outputCostPer1M: 0,
        avgLatencyMs: 150,
        maxContextTokens: 8192,
        maxOutputTokens: 0,
        qualityScores: {
          chat: 0, content: 0, analysis: 0, coding: 0,
          reasoning: 0, creative: 0, embedding: 95, multimodal: 0
        },
        capabilities: ['embedding'],
        supportsBatching: true,
        supportsStreaming: false,
        supportsTools: false,
        supportsVision: false
      },
      {
        id: 'voyage-3',
        provider: 'anthropic',
        model: 'voyage-3',
        displayName: 'Voyage 3',
        tier: 'mid',
        inputCostPer1M: 0.06,
        outputCostPer1M: 0,
        avgLatencyMs: 120,
        maxContextTokens: 32000,
        maxOutputTokens: 0,
        qualityScores: {
          chat: 0, content: 0, analysis: 0, coding: 0,
          reasoning: 0, creative: 0, embedding: 92, multimodal: 0
        },
        capabilities: ['embedding'],
        supportsBatching: true,
        supportsStreaming: false,
        supportsTools: false,
        supportsVision: false
      },

      // ========================================================================
      // AZURE EQUIVALENTS (for provider arbitrage)
      // ========================================================================
      {
        id: 'gpt-4o-azure',
        provider: 'azure',
        model: 'gpt-4o',
        displayName: 'GPT-4o (Azure)',
        tier: 'mid',
        inputCostPer1M: 2.50,
        outputCostPer1M: 10.00,
        avgLatencyMs: 650,
        maxContextTokens: 128000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 90, content: 88, analysis: 87, coding: 85,
          reasoning: 82, creative: 88, embedding: 0, multimodal: 90
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gpt-4o-mini-azure',
        provider: 'azure',
        model: 'gpt-4o-mini',
        displayName: 'GPT-4o Mini (Azure)',
        tier: 'budget',
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.60,
        avgLatencyMs: 450,
        maxContextTokens: 128000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 78, content: 75, analysis: 72, coding: 70,
          reasoning: 65, creative: 73, embedding: 0, multimodal: 70
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },

      // ========================================================================
      // AWS BEDROCK EQUIVALENTS
      // ========================================================================
      {
        id: 'claude-3-5-sonnet-bedrock',
        provider: 'aws_bedrock',
        model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        displayName: 'Claude 3.5 Sonnet (Bedrock)',
        tier: 'mid',
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
        avgLatencyMs: 650,
        maxContextTokens: 200000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 92, content: 90, analysis: 91, coding: 93,
          reasoning: 88, creative: 90, embedding: 0, multimodal: 88
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'claude-3-haiku-bedrock',
        provider: 'aws_bedrock',
        model: 'anthropic.claude-3-haiku-20240307-v1:0',
        displayName: 'Claude 3 Haiku (Bedrock)',
        tier: 'budget',
        inputCostPer1M: 0.25,
        outputCostPer1M: 1.25,
        avgLatencyMs: 350,
        maxContextTokens: 200000,
        maxOutputTokens: 4096,
        qualityScores: {
          chat: 78, content: 76, analysis: 74, coding: 76,
          reasoning: 68, creative: 74, embedding: 0, multimodal: 72
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },

      // ========================================================================
      // LATEST 2025 MODELS (December 2025) - Matching Provider Dialog
      // ========================================================================
      
      // OpenAI GPT-5.2 Series (Latest December 2025)
      {
        id: 'gpt-5.2',
        provider: 'openai',
        model: 'gpt-5.2',
        displayName: 'GPT-5.2',
        tier: 'premium',
        inputCostPer1M: 2.00,
        outputCostPer1M: 10.00,
        avgLatencyMs: 700,
        maxContextTokens: 256000,
        maxOutputTokens: 32768,
        qualityScores: {
          chat: 99, content: 98, analysis: 99, coding: 98,
          reasoning: 99, creative: 98, embedding: 0, multimodal: 99
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gpt-5.2-thinking',
        provider: 'openai',
        model: 'gpt-5.2-thinking',
        displayName: 'GPT-5.2 Thinking',
        tier: 'premium',
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
        avgLatencyMs: 2000,
        maxContextTokens: 256000,
        maxOutputTokens: 65536,
        qualityScores: {
          chat: 95, content: 94, analysis: 99, coding: 99,
          reasoning: 100, creative: 92, embedding: 0, multimodal: 95
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gpt-5.2-pro',
        provider: 'openai',
        model: 'gpt-5.2-pro',
        displayName: 'GPT-5.2 Pro',
        tier: 'premium',
        inputCostPer1M: 5.00,
        outputCostPer1M: 20.00,
        avgLatencyMs: 1000,
        maxContextTokens: 512000,
        maxOutputTokens: 65536,
        qualityScores: {
          chat: 99, content: 99, analysis: 99, coding: 99,
          reasoning: 99, creative: 99, embedding: 0, multimodal: 99
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gpt-5',
        provider: 'openai',
        model: 'gpt-5',
        displayName: 'GPT-5',
        tier: 'premium',
        inputCostPer1M: 1.25,
        outputCostPer1M: 10.00,
        avgLatencyMs: 800,
        maxContextTokens: 256000,
        maxOutputTokens: 32768,
        qualityScores: {
          chat: 98, content: 97, analysis: 98, coding: 97,
          reasoning: 98, creative: 97, embedding: 0, multimodal: 98
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gpt-5-mini',
        provider: 'openai',
        model: 'gpt-5-mini',
        displayName: 'GPT-5 Mini',
        tier: 'mid',
        inputCostPer1M: 0.25,
        outputCostPer1M: 2.00,
        avgLatencyMs: 400,
        maxContextTokens: 128000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 92, content: 90, analysis: 91, coding: 90,
          reasoning: 88, creative: 90, embedding: 0, multimodal: 90
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gpt-5-nano',
        provider: 'openai',
        model: 'gpt-5-nano',
        displayName: 'GPT-5 Nano',
        tier: 'budget',
        inputCostPer1M: 0.05,
        outputCostPer1M: 0.40,
        avgLatencyMs: 250,
        maxContextTokens: 64000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 85, content: 83, analysis: 82, coding: 80,
          reasoning: 78, creative: 82, embedding: 0, multimodal: 82
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gpt-4.1',
        provider: 'openai',
        model: 'gpt-4.1',
        displayName: 'GPT-4.1',
        tier: 'mid',
        inputCostPer1M: 2.00,
        outputCostPer1M: 8.00,
        avgLatencyMs: 650,
        maxContextTokens: 128000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 93, content: 91, analysis: 92, coding: 91,
          reasoning: 88, creative: 91, embedding: 0, multimodal: 92
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      
      // OpenAI o3/o4 Series
      {
        id: 'o3',
        provider: 'openai',
        model: 'o3',
        displayName: 'OpenAI o3',
        tier: 'premium',
        inputCostPer1M: 3.50,
        outputCostPer1M: 14.00,
        avgLatencyMs: 4000,
        maxContextTokens: 200000,
        maxOutputTokens: 100000,
        qualityScores: {
          chat: 88, content: 85, analysis: 96, coding: 98,
          reasoning: 99, creative: 80, embedding: 0, multimodal: 85
        },
        capabilities: ['analysis', 'coding', 'reasoning'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'o4-mini',
        provider: 'openai',
        model: 'o4-mini',
        displayName: 'OpenAI o4-mini',
        tier: 'mid',
        inputCostPer1M: 2.00,
        outputCostPer1M: 8.00,
        avgLatencyMs: 2500,
        maxContextTokens: 200000,
        maxOutputTokens: 100000,
        qualityScores: {
          chat: 85, content: 82, analysis: 92, coding: 95,
          reasoning: 96, creative: 78, embedding: 0, multimodal: 80
        },
        capabilities: ['analysis', 'coding', 'reasoning'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: false
      },

      // Anthropic Claude 4.5 Series (Latest December 2025 - Matching Provider Dialog)
      {
        id: 'claude-opus-4.5',
        provider: 'anthropic',
        model: 'claude-opus-4-5-20251201',
        displayName: 'Claude Opus 4.5',
        tier: 'premium',
        inputCostPer1M: 15.00,
        outputCostPer1M: 75.00,
        cachingInputCostPer1M: 1.50,
        avgLatencyMs: 1100,
        maxContextTokens: 200000,
        maxOutputTokens: 32000,
        qualityScores: {
          chat: 99, content: 98, analysis: 99, coding: 99,
          reasoning: 99, creative: 98, embedding: 0, multimodal: 98
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'claude-sonnet-4.5',
        provider: 'anthropic',
        model: 'claude-sonnet-4-5-20251201',
        displayName: 'Claude Sonnet 4.5',
        tier: 'mid',
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
        cachingInputCostPer1M: 0.30,
        avgLatencyMs: 500,
        maxContextTokens: 200000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 96, content: 95, analysis: 96, coding: 97,
          reasoning: 95, creative: 95, embedding: 0, multimodal: 94
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'claude-haiku-4',
        provider: 'anthropic',
        model: 'claude-haiku-4-20251201',
        displayName: 'Claude Haiku 4',
        tier: 'budget',
        inputCostPer1M: 0.80,
        outputCostPer1M: 4.00,
        cachingInputCostPer1M: 0.08,
        avgLatencyMs: 350,
        maxContextTokens: 200000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 88, content: 86, analysis: 85, coding: 87,
          reasoning: 82, creative: 84, embedding: 0, multimodal: 82
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'claude-sonnet-4-20250514',
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        displayName: 'Claude Sonnet 4',
        tier: 'mid',
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
        cachingInputCostPer1M: 0.30,
        avgLatencyMs: 550,
        maxContextTokens: 200000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 94, content: 93, analysis: 94, coding: 95,
          reasoning: 92, creative: 93, embedding: 0, multimodal: 92
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'claude-opus-4-20250514',
        provider: 'anthropic',
        model: 'claude-opus-4-20250514',
        displayName: 'Claude Opus 4',
        tier: 'premium',
        inputCostPer1M: 15.00,
        outputCostPer1M: 75.00,
        cachingInputCostPer1M: 1.50,
        avgLatencyMs: 1200,
        maxContextTokens: 200000,
        maxOutputTokens: 32000,
        qualityScores: {
          chat: 97, content: 96, analysis: 97, coding: 98,
          reasoning: 98, creative: 97, embedding: 0, multimodal: 96
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'claude-3.7-sonnet',
        provider: 'anthropic',
        model: 'claude-3-7-sonnet-20250219',
        displayName: 'Claude 3.7 Sonnet',
        tier: 'mid',
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
        cachingInputCostPer1M: 0.30,
        avgLatencyMs: 580,
        maxContextTokens: 200000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 93, content: 92, analysis: 93, coding: 94,
          reasoning: 90, creative: 92, embedding: 0, multimodal: 90
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },

      // Google Gemini 3 & 2.5 Series (Latest - Matching Provider Dialog)
      {
        id: 'gemini-3',
        provider: 'google',
        model: 'gemini-3-pro',
        displayName: 'Gemini 3',
        tier: 'premium',
        inputCostPer1M: 2.00,
        outputCostPer1M: 12.00,
        avgLatencyMs: 600,
        maxContextTokens: 2000000,
        maxOutputTokens: 32768,
        qualityScores: {
          chat: 97, content: 96, analysis: 97, coding: 95,
          reasoning: 96, creative: 94, embedding: 0, multimodal: 98
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gemini-3-flash',
        provider: 'google',
        model: 'gemini-3-flash',
        displayName: 'Gemini 3 Flash',
        tier: 'mid',
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.60,
        avgLatencyMs: 250,
        maxContextTokens: 1000000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 90, content: 88, analysis: 90, coding: 86,
          reasoning: 85, creative: 86, embedding: 0, multimodal: 92
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gemini-2.5-pro',
        provider: 'google',
        model: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        tier: 'mid',
        inputCostPer1M: 1.25,
        outputCostPer1M: 5.00,
        avgLatencyMs: 500,
        maxContextTokens: 2000000,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 92, content: 90, analysis: 92, coding: 90,
          reasoning: 90, creative: 88, embedding: 0, multimodal: 95
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'gemini-2.5-flash',
        provider: 'google',
        model: 'gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash',
        tier: 'budget',
        inputCostPer1M: 0.075,
        outputCostPer1M: 0.30,
        avgLatencyMs: 280,
        maxContextTokens: 1000000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 82, content: 80, analysis: 82, coding: 78,
          reasoning: 76, creative: 78, embedding: 0, multimodal: 85
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },

      // DeepSeek R1 Series
      {
        id: 'deepseek-r1',
        provider: 'deepseek',
        model: 'deepseek-reasoner',
        displayName: 'DeepSeek R1',
        tier: 'mid',
        inputCostPer1M: 0.55,
        outputCostPer1M: 2.19,
        cachingInputCostPer1M: 0.14,
        avgLatencyMs: 1500,
        maxContextTokens: 64000,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 88, content: 85, analysis: 92, coding: 94,
          reasoning: 96, creative: 80, embedding: 0, multimodal: 0
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning'],
        supportsBatching: false,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: false
      },

      // xAI Grok Series
      {
        id: 'grok-3',
        provider: 'xai',
        model: 'grok-3',
        displayName: 'Grok 3',
        tier: 'mid',
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
        avgLatencyMs: 600,
        maxContextTokens: 131072,
        maxOutputTokens: 16384,
        qualityScores: {
          chat: 92, content: 90, analysis: 91, coding: 90,
          reasoning: 88, creative: 91, embedding: 0, multimodal: 88
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'reasoning', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
      {
        id: 'grok-3-mini',
        provider: 'xai',
        model: 'grok-3-mini',
        displayName: 'Grok 3 Mini',
        tier: 'budget',
        inputCostPer1M: 0.30,
        outputCostPer1M: 0.50,
        avgLatencyMs: 300,
        maxContextTokens: 131072,
        maxOutputTokens: 8192,
        qualityScores: {
          chat: 82, content: 80, analysis: 80, coding: 78,
          reasoning: 75, creative: 80, embedding: 0, multimodal: 78
        },
        capabilities: ['chat', 'content', 'analysis', 'coding', 'creative', 'multimodal'],
        supportsBatching: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsVision: true
      },
    ];

    modelConfigs.forEach(config => this.models.set(config.id, config));
  }

  private buildIndexes(): void {
    this.providerModels.clear();
    this.tierModels.clear();

    for (const [id, model] of this.models) {
      // Index by provider
      if (!this.providerModels.has(model.provider)) {
        this.providerModels.set(model.provider, []);
      }
      this.providerModels.get(model.provider)!.push(id);

      // Index by tier
      if (!this.tierModels.has(model.tier)) {
        this.tierModels.set(model.tier, []);
      }
      this.tierModels.get(model.tier)!.push(id);
    }
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  getModel(modelId: string): ModelConfig | undefined {
    // Try exact match first
    if (this.models.has(modelId)) {
      return this.models.get(modelId);
    }
    // Try fuzzy match (model name without version)
    for (const [id, config] of this.models) {
      if (config.model === modelId || config.model.startsWith(modelId)) {
        return config;
      }
    }
    return undefined;
  }

  getModelsByProvider(provider: Provider): ModelConfig[] {
    const ids = this.providerModels.get(provider) || [];
    return ids.map(id => this.models.get(id)!).filter(Boolean);
  }

  getModelsByTier(tier: ModelTier): ModelConfig[] {
    const ids = this.tierModels.get(tier) || [];
    return ids.map(id => this.models.get(id)!).filter(Boolean);
  }

  getModelsByCapability(capability: TaskCategory): ModelConfig[] {
    return Array.from(this.models.values())
      .filter(m => m.capabilities.includes(capability));
  }

  getAllModels(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  // ============================================================================
  // SELECTION METHODS
  // ============================================================================

  getBestModelForTask(taskCategory: TaskCategory, tier: ModelTier): ModelConfig | undefined {
    const candidates = this.getModelsByTier(tier)
      .filter(m => m.capabilities.includes(taskCategory));
    
    if (candidates.length === 0) {
      // Fall back to any model with the capability
      const allCandidates = this.getModelsByCapability(taskCategory);
      if (allCandidates.length === 0) return undefined;
      return allCandidates.sort((a, b) => 
        (b.qualityScores[taskCategory] || 0) - (a.qualityScores[taskCategory] || 0)
      )[0];
    }

    return candidates.sort((a, b) => 
      (b.qualityScores[taskCategory] || 0) - (a.qualityScores[taskCategory] || 0)
    )[0];
  }

  getCheapestModelForTask(
    taskCategory: TaskCategory, 
    minQualityScore: number = 70
  ): ModelConfig | undefined {
    const candidates = Array.from(this.models.values())
      .filter(m => m.capabilities.includes(taskCategory))
      .filter(m => (m.qualityScores[taskCategory] || 0) >= minQualityScore)
      .filter(m => !m.deprecationDate || new Date(m.deprecationDate) > new Date());

    if (candidates.length === 0) return undefined;

    return candidates.sort((a, b) => {
      const costA = a.inputCostPer1M + a.outputCostPer1M;
      const costB = b.inputCostPer1M + b.outputCostPer1M;
      return costA - costB;
    })[0];
  }

  getFastestModelForTask(
    taskCategory: TaskCategory,
    minQualityScore: number = 70
  ): ModelConfig | undefined {
    const candidates = Array.from(this.models.values())
      .filter(m => m.capabilities.includes(taskCategory))
      .filter(m => (m.qualityScores[taskCategory] || 0) >= minQualityScore);

    if (candidates.length === 0) return undefined;

    return candidates.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs)[0];
  }

  getOptimalModel(
    taskCategory: TaskCategory,
    constraints: {
      maxCostPer1M?: number;
      maxLatencyMs?: number;
      minQualityScore?: number;
      preferredProviders?: Provider[];
      excludeProviders?: Provider[];
      requiresVision?: boolean;
      requiresTools?: boolean;
      requiresStreaming?: boolean;
    } = {}
  ): ModelConfig | undefined {
    let candidates = Array.from(this.models.values())
      .filter(m => m.capabilities.includes(taskCategory));

    // Apply constraints
    if (constraints.maxCostPer1M !== undefined) {
      candidates = candidates.filter(m => 
        (m.inputCostPer1M + m.outputCostPer1M) <= constraints.maxCostPer1M!
      );
    }

    if (constraints.maxLatencyMs !== undefined) {
      candidates = candidates.filter(m => m.avgLatencyMs <= constraints.maxLatencyMs!);
    }

    if (constraints.minQualityScore !== undefined) {
      candidates = candidates.filter(m => 
        (m.qualityScores[taskCategory] || 0) >= constraints.minQualityScore!
      );
    }

    if (constraints.preferredProviders?.length) {
      const preferred = candidates.filter(m => 
        constraints.preferredProviders!.includes(m.provider)
      );
      if (preferred.length > 0) candidates = preferred;
    }

    if (constraints.excludeProviders?.length) {
      candidates = candidates.filter(m => 
        !constraints.excludeProviders!.includes(m.provider)
      );
    }

    if (constraints.requiresVision) {
      candidates = candidates.filter(m => m.supportsVision);
    }

    if (constraints.requiresTools) {
      candidates = candidates.filter(m => m.supportsTools);
    }

    if (constraints.requiresStreaming) {
      candidates = candidates.filter(m => m.supportsStreaming);
    }

    if (candidates.length === 0) return undefined;

    // Score and rank candidates
    return candidates.sort((a, b) => {
      const qualityA = a.qualityScores[taskCategory] || 0;
      const qualityB = b.qualityScores[taskCategory] || 0;
      const costA = a.inputCostPer1M + a.outputCostPer1M;
      const costB = b.inputCostPer1M + b.outputCostPer1M;
      
      // Quality-cost efficiency score (higher is better)
      const efficiencyA = qualityA / Math.log(costA + 1);
      const efficiencyB = qualityB / Math.log(costB + 1);
      
      return efficiencyB - efficiencyA;
    })[0];
  }

  // ============================================================================
  // COST CALCULATION
  // ============================================================================

  calculateCost(
    modelId: string, 
    inputTokens: number, 
    outputTokens: number,
    cachedTokens: number = 0
  ): number {
    const model = this.getModel(modelId);
    if (!model) return 0;

    const inputCost = ((inputTokens - cachedTokens) / 1_000_000) * model.inputCostPer1M;
    const cachedCost = model.cachingInputCostPer1M 
      ? (cachedTokens / 1_000_000) * model.cachingInputCostPer1M
      : (cachedTokens / 1_000_000) * model.inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * model.outputCostPer1M;

    return inputCost + cachedCost + outputCost;
  }

  estimateMonthlyCost(
    modelId: string,
    avgInputTokens: number,
    avgOutputTokens: number,
    requestsPerMonth: number
  ): number {
    const costPerRequest = this.calculateCost(modelId, avgInputTokens, avgOutputTokens);
    return costPerRequest * requestsPerMonth;
  }

  compareCosts(
    modelIdA: string,
    modelIdB: string,
    inputTokens: number,
    outputTokens: number
  ): { costA: number; costB: number; savings: number; savingsPercent: number } {
    const costA = this.calculateCost(modelIdA, inputTokens, outputTokens);
    const costB = this.calculateCost(modelIdB, inputTokens, outputTokens);
    const savings = costA - costB;
    const savingsPercent = costA > 0 ? (savings / costA) * 100 : 0;

    return { costA, costB, savings, savingsPercent };
  }

  // ============================================================================
  // EQUIVALENCE & ALTERNATIVES
  // ============================================================================

  getEquivalentModels(modelId: string): ModelConfig[] {
    const model = this.getModel(modelId);
    if (!model) return [];

    // Define equivalence groups
    const equivalenceGroups: Record<string, string[]> = {
      'gpt-4o': ['gpt-4o', 'gpt-4o-azure'],
      'gpt-4o-mini': ['gpt-4o-mini', 'gpt-4o-mini-azure'],
      'claude-3-5-sonnet-20241022': ['claude-3-5-sonnet-20241022', 'claude-3-5-sonnet-bedrock'],
      'claude-3-5-haiku-20241022': ['claude-3-5-haiku-20241022', 'claude-3-haiku-bedrock'],
    };

    // Find the group this model belongs to
    for (const [, group] of Object.entries(equivalenceGroups)) {
      if (group.includes(modelId)) {
        return group
          .map(id => this.models.get(id))
          .filter((m): m is ModelConfig => m !== undefined);
      }
    }

    return [model];
  }

  getSuggestedDowngrade(modelId: string): ModelConfig | undefined {
    const model = this.getModel(modelId);
    if (!model) return undefined;

    const downgradeMap: Record<string, string> = {
      'gpt-4o': 'gpt-4o-mini',
      'gpt-4-turbo': 'gpt-4o-mini',
      'claude-3-5-sonnet-20241022': 'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229': 'claude-3-5-sonnet-20241022',
      'gemini-1.5-pro': 'gemini-1.5-flash',
      'gemini-2.0-flash-thinking': 'gemini-2.0-flash',
      'mistral-large-latest': 'mistral-small-latest',
      'o1': 'o1-mini',
    };

    const downgradeId = downgradeMap[modelId];
    return downgradeId ? this.getModel(downgradeId) : undefined;
  }

  getSuggestedUpgrade(modelId: string): ModelConfig | undefined {
    const model = this.getModel(modelId);
    if (!model) return undefined;

    const upgradeMap: Record<string, string> = {
      'gpt-4o-mini': 'gpt-4o',
      'claude-3-5-haiku-20241022': 'claude-3-5-sonnet-20241022',
      'gemini-1.5-flash': 'gemini-1.5-pro',
      'gemini-2.0-flash': 'gemini-2.0-flash-thinking',
      'mistral-small-latest': 'mistral-large-latest',
      'o1-mini': 'o1',
      'o3-mini': 'o1',
    };

    const upgradeId = upgradeMap[modelId];
    return upgradeId ? this.getModel(upgradeId) : undefined;
  }

  // ============================================================================
  // PROVIDER ARBITRAGE
  // ============================================================================

  findCheapestProvider(modelName: string): ModelConfig | undefined {
    const equivalents = this.getEquivalentModels(modelName);
    if (equivalents.length === 0) return undefined;

    return equivalents.sort((a, b) => {
      const costA = a.inputCostPer1M + a.outputCostPer1M;
      const costB = b.inputCostPer1M + b.outputCostPer1M;
      return costA - costB;
    })[0];
  }

  findFastestProvider(modelName: string): ModelConfig | undefined {
    const equivalents = this.getEquivalentModels(modelName);
    if (equivalents.length === 0) return undefined;

    return equivalents.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs)[0];
  }
}

// Singleton instance
export const modelRegistry = new ModelRegistry();
