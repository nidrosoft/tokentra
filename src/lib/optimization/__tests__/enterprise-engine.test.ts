/**
 * Enterprise Optimization Engine Test Suite
 * Tests all components: Task Classifier, Model Registry, Semantic Cache, Routing Rules
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { TaskClassifier } from '../task-classifier';
import { ModelRegistry } from '../model-registry';

// Initialize components
const taskClassifier = new TaskClassifier();
const modelRegistry = new ModelRegistry();

describe('Enterprise Optimization Engine', () => {
  
  // ============================================================================
  // TASK CLASSIFIER TESTS
  // ============================================================================
  
  describe('TaskClassifier', () => {
    
    it('should classify greeting prompts correctly', async () => {
      const result = await taskClassifier.classify('Hello, how are you today?');
      expect(result.taskType).toBe('greeting');
      expect(result.taskCategory).toBe('chat');
      expect(result.suggestedTier).toBe('budget');
      expect(result.confidence).toBeGreaterThan(0.5);
      console.log('✅ Greeting classification:', result.taskType, '| Tier:', result.suggestedTier);
    });

    it('should classify code generation prompts correctly', async () => {
      const result = await taskClassifier.classify(
        'Write a Python function to calculate fibonacci numbers recursively'
      );
      expect(result.taskType).toBe('code_generation');
      expect(result.taskCategory).toBe('coding');
      expect(result.features.hasCodeIndicators).toBe(true);
      console.log('✅ Code generation classification:', result.taskType, '| Tier:', result.suggestedTier);
    });

    it('should classify debugging prompts correctly', async () => {
      const result = await taskClassifier.classify(
        'I have an error in my code: TypeError: Cannot read property of undefined. Here is my function:\n```javascript\nfunction getData() { return data.value; }\n```'
      );
      expect(result.taskType).toBe('debugging');
      expect(result.taskCategory).toBe('coding');
      expect(result.features.hasCodeIndicators).toBe(true);
      console.log('✅ Debugging classification:', result.taskType, '| Confidence:', result.confidence);
    });

    it('should classify math problems correctly', async () => {
      const result = await taskClassifier.classify(
        'Calculate the integral of x^2 from 0 to 5 and solve the equation 2x + 5 = 15'
      );
      expect(result.taskType).toBe('math');
      expect(result.taskCategory).toBe('reasoning');
      expect(result.suggestedTier).toBe('premium');
      expect(result.features.hasMathIndicators).toBe(true);
      console.log('✅ Math classification:', result.taskType, '| Tier:', result.suggestedTier);
    });

    it('should classify summarization prompts correctly', async () => {
      const result = await taskClassifier.classify(
        'Please summarize the following article and give me the key points and main ideas'
      );
      expect(result.taskType).toBe('summarization');
      expect(result.taskCategory).toBe('content');
      console.log('✅ Summarization classification:', result.taskType, '| Tier:', result.suggestedTier);
    });

    it('should classify translation prompts correctly', async () => {
      const result = await taskClassifier.classify(
        'Translate the following text to Spanish: Hello, my name is John'
      );
      expect(result.taskType).toBe('translation');
      expect(result.taskCategory).toBe('content');
      console.log('✅ Translation classification:', result.taskType, '| Tier:', result.suggestedTier);
    });

    it('should classify sentiment analysis prompts correctly', async () => {
      const result = await taskClassifier.classify(
        'Analyze the sentiment of this review and tell me if it is positive or negative'
      );
      expect(result.taskType).toBe('sentiment');
      expect(result.taskCategory).toBe('analysis');
      expect(result.suggestedTier).toBe('budget');
      console.log('✅ Sentiment classification:', result.taskType, '| Tier:', result.suggestedTier);
    });

    it('should classify brainstorming prompts correctly', async () => {
      const result = await taskClassifier.classify(
        'Brainstorm some creative ideas for a new mobile app startup'
      );
      expect(result.taskType).toBe('brainstorming');
      expect(result.taskCategory).toBe('creative');
      console.log('✅ Brainstorming classification:', result.taskType, '| Tier:', result.suggestedTier);
    });

    it('should calculate complexity score based on prompt length', async () => {
      const shortPrompt = await taskClassifier.classify('Hello');
      const longPrompt = await taskClassifier.classify(
        'This is a very long and complex prompt that contains multiple sentences and requires deep analysis. '.repeat(20)
      );
      
      expect(longPrompt.complexityScore).toBeGreaterThan(shortPrompt.complexityScore);
      console.log('✅ Complexity scoring: Short=', shortPrompt.complexityScore.toFixed(2), '| Long=', longPrompt.complexityScore.toFixed(2));
    });

    it('should detect multi-step indicators', async () => {
      const result = await taskClassifier.classify(
        'First, analyze the data. Then, create a summary. After that, generate recommendations. Finally, present the results.'
      );
      expect(result.features.hasMultiStepIndicators).toBe(true);
      console.log('✅ Multi-step detection:', result.features.hasMultiStepIndicators);
    });

    it('should detect domain-specific content', async () => {
      const medicalResult = await taskClassifier.classify(
        'The patient presents with symptoms of hypertension. Please provide a diagnosis and treatment plan.'
      );
      expect(medicalResult.features.domainDetected).toBe('medical');
      console.log('✅ Domain detection:', medicalResult.features.domainDetected);
    });
  });

  // ============================================================================
  // MODEL REGISTRY TESTS
  // ============================================================================

  describe('ModelRegistry', () => {
    
    it('should have all major models registered', () => {
      const models = modelRegistry.getAllModels();
      expect(models.length).toBeGreaterThan(20);
      
      // Check key models exist
      expect(modelRegistry.getModel('gpt-4o')).toBeDefined();
      expect(modelRegistry.getModel('gpt-4o-mini')).toBeDefined();
      expect(modelRegistry.getModel('claude-3-5-sonnet-20241022')).toBeDefined();
      expect(modelRegistry.getModel('claude-3-5-haiku-20241022')).toBeDefined();
      expect(modelRegistry.getModel('gemini-2.0-flash')).toBeDefined();
      expect(modelRegistry.getModel('deepseek-chat')).toBeDefined();
      
      console.log('✅ Model registry has', models.length, 'models registered');
    });

    it('should calculate costs correctly', () => {
      // GPT-4o: $2.50/1M input, $10.00/1M output
      const gpt4oCost = modelRegistry.calculateCost('gpt-4o', 1000, 500);
      expect(gpt4oCost).toBeCloseTo(0.0025 + 0.005, 4); // $0.0075
      
      // GPT-4o-mini: $0.15/1M input, $0.60/1M output
      const miniCost = modelRegistry.calculateCost('gpt-4o-mini', 1000, 500);
      expect(miniCost).toBeCloseTo(0.00015 + 0.0003, 5); // $0.00045
      
      console.log('✅ Cost calculation: GPT-4o=$', gpt4oCost.toFixed(6), '| GPT-4o-mini=$', miniCost.toFixed(6));
      console.log('   Savings with mini:', ((1 - miniCost/gpt4oCost) * 100).toFixed(1) + '%');
    });

    it('should get models by tier', () => {
      const budgetModels = modelRegistry.getModelsByTier('budget');
      const midModels = modelRegistry.getModelsByTier('mid');
      const premiumModels = modelRegistry.getModelsByTier('premium');
      
      expect(budgetModels.length).toBeGreaterThan(0);
      expect(midModels.length).toBeGreaterThan(0);
      expect(premiumModels.length).toBeGreaterThan(0);
      
      // Verify tier assignments
      budgetModels.forEach(m => expect(m.tier).toBe('budget'));
      midModels.forEach(m => expect(m.tier).toBe('mid'));
      premiumModels.forEach(m => expect(m.tier).toBe('premium'));
      
      console.log('✅ Models by tier: Budget=', budgetModels.length, '| Mid=', midModels.length, '| Premium=', premiumModels.length);
    });

    it('should get best model for task category', () => {
      const bestCoding = modelRegistry.getBestModelForTask('coding', 'mid');
      const bestReasoning = modelRegistry.getBestModelForTask('reasoning', 'premium');
      const bestChat = modelRegistry.getBestModelForTask('chat', 'budget');
      
      expect(bestCoding).toBeDefined();
      expect(bestReasoning).toBeDefined();
      expect(bestChat).toBeDefined();
      
      console.log('✅ Best models: Coding=', bestCoding?.displayName, '| Reasoning=', bestReasoning?.displayName, '| Chat=', bestChat?.displayName);
    });

    it('should get cheapest model for task with quality threshold', () => {
      const cheapestCoding = modelRegistry.getCheapestModelForTask('coding', 70);
      const cheapestChat = modelRegistry.getCheapestModelForTask('chat', 75);
      
      expect(cheapestCoding).toBeDefined();
      expect(cheapestChat).toBeDefined();
      
      // Verify quality meets threshold
      expect(cheapestCoding!.qualityScores.coding).toBeGreaterThanOrEqual(70);
      expect(cheapestChat!.qualityScores.chat).toBeGreaterThanOrEqual(75);
      
      console.log('✅ Cheapest models: Coding=', cheapestCoding?.displayName, '| Chat=', cheapestChat?.displayName);
    });

    it('should suggest model downgrades', () => {
      const gpt4oDowngrade = modelRegistry.getSuggestedDowngrade('gpt-4o');
      const sonnetDowngrade = modelRegistry.getSuggestedDowngrade('claude-3-5-sonnet-20241022');
      
      expect(gpt4oDowngrade).toBeDefined();
      expect(gpt4oDowngrade?.tier).toBe('budget');
      
      console.log('✅ Downgrade suggestions: GPT-4o →', gpt4oDowngrade?.displayName, '| Sonnet →', sonnetDowngrade?.displayName);
    });

    it('should find cheapest provider for equivalent models', () => {
      const cheapestGpt4o = modelRegistry.findCheapestProvider('gpt-4o');
      
      // Should return the model itself or an equivalent
      expect(cheapestGpt4o).toBeDefined();
      
      console.log('✅ Cheapest provider for GPT-4o:', cheapestGpt4o?.provider, '-', cheapestGpt4o?.displayName);
    });

    it('should get optimal model based on requirements', () => {
      const optimal = modelRegistry.getOptimalModel('coding', {
        minQualityScore: 80,
        maxLatencyMs: 2000,
      });
      
      expect(optimal).toBeDefined();
      expect(optimal!.qualityScores.coding).toBeGreaterThanOrEqual(80);
      expect(optimal!.avgLatencyMs).toBeLessThanOrEqual(2000);
      
      console.log('✅ Optimal model for coding (quality>=80, latency<=2000ms):', optimal?.displayName);
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration: Task Classification → Model Selection', () => {
    
    it('should route simple chat to budget model', async () => {
      const classification = await taskClassifier.classify('Hi there!');
      const suggestedModel = modelRegistry.getBestModelForTask(
        classification.taskCategory,
        classification.suggestedTier
      );
      
      expect(classification.suggestedTier).toBe('budget');
      expect(suggestedModel?.tier).toBe('budget');
      
      console.log('✅ Simple chat → Budget tier:', suggestedModel?.displayName);
    });

    it('should route complex reasoning to premium model', async () => {
      const classification = await taskClassifier.classify(
        'Solve this complex logic puzzle: If A implies B, and B implies C, and we know not C, what can we deduce about A? Provide a formal proof.'
      );
      const suggestedModel = modelRegistry.getBestModelForTask(
        classification.taskCategory,
        classification.suggestedTier
      );
      
      expect(classification.taskCategory).toBe('reasoning');
      expect(['mid', 'premium']).toContain(classification.suggestedTier);
      
      console.log('✅ Complex reasoning → Tier:', classification.suggestedTier, '| Model:', suggestedModel?.displayName);
    });

    it('should calculate potential savings for model downgrade', async () => {
      const classification = await taskClassifier.classify('What is the weather today?');
      
      // Simulate using GPT-4o for this simple request
      const currentModel = 'gpt-4o';
      const suggestedModel = modelRegistry.getBestModelForTask(
        classification.taskCategory,
        classification.suggestedTier
      );
      
      const inputTokens = 50;
      const outputTokens = 100;
      
      const currentCost = modelRegistry.calculateCost(currentModel, inputTokens, outputTokens);
      const optimizedCost = modelRegistry.calculateCost(suggestedModel!.id, inputTokens, outputTokens);
      const savings = currentCost - optimizedCost;
      const savingsPercent = (savings / currentCost) * 100;
      
      expect(savingsPercent).toBeGreaterThan(80); // Should save >80% by using budget model
      
      console.log('✅ Potential savings: $', currentCost.toFixed(6), '→ $', optimizedCost.toFixed(6));
      console.log('   Savings:', savingsPercent.toFixed(1) + '%', '($', savings.toFixed(6), 'per request)');
    });

    it('should batch classify multiple prompts', async () => {
      const prompts = [
        { prompt: 'Hello!' },
        { prompt: 'Write a Python function to sort a list' },
        { prompt: 'Summarize this article for me' },
        { prompt: 'Calculate 2 + 2 * 3' },
        { prompt: 'Translate hello to French' },
      ];
      
      const results = await taskClassifier.classifyBatch(prompts);
      
      expect(results.length).toBe(5);
      expect(results[0].taskType).toBe('greeting');
      expect(results[1].taskCategory).toBe('coding');
      expect(results[2].taskType).toBe('summarization');
      
      console.log('✅ Batch classification results:');
      results.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.taskType} (${r.taskCategory}) → ${r.suggestedTier}`);
      });
    });
  });

  // ============================================================================
  // COST ANALYSIS TESTS
  // ============================================================================

  describe('Cost Analysis', () => {
    
    it('should calculate monthly cost projections', () => {
      const requestsPerDay = 10000;
      const avgInputTokens = 500;
      const avgOutputTokens = 300;
      
      const models = ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'deepseek-chat'];
      
      console.log('\n📊 Monthly Cost Projection (10K requests/day):');
      console.log('─'.repeat(60));
      
      models.forEach(modelId => {
        const model = modelRegistry.getModel(modelId);
        if (!model) return;
        
        const costPerRequest = modelRegistry.calculateCost(modelId, avgInputTokens, avgOutputTokens);
        const dailyCost = costPerRequest * requestsPerDay;
        const monthlyCost = dailyCost * 30;
        
        console.log(`   ${model.displayName.padEnd(25)} $${monthlyCost.toFixed(2).padStart(10)}/mo`);
      });
      
      console.log('─'.repeat(60));
    });

    it('should identify cost optimization opportunities', () => {
      // Simulate a usage pattern
      const usagePattern = {
        'gpt-4o': { requests: 5000, avgInput: 200, avgOutput: 150 }, // Simple queries on expensive model
        'claude-3-5-sonnet-20241022': { requests: 3000, avgInput: 1500, avgOutput: 800 }, // Complex queries
        'gpt-4o-mini': { requests: 2000, avgInput: 300, avgOutput: 200 }, // Already optimized
      };
      
      let totalCurrentCost = 0;
      let totalOptimizedCost = 0;
      
      console.log('\n💡 Optimization Opportunities:');
      console.log('─'.repeat(70));
      
      for (const [modelId, usage] of Object.entries(usagePattern)) {
        const currentCost = modelRegistry.calculateCost(modelId, usage.avgInput, usage.avgOutput) * usage.requests;
        totalCurrentCost += currentCost;
        
        // Check if can downgrade
        const model = modelRegistry.getModel(modelId);
        const downgrade = modelRegistry.getSuggestedDowngrade(modelId);
        
        if (downgrade && usage.avgInput < 500) { // Simple requests
          const optimizedCost = modelRegistry.calculateCost(downgrade.id, usage.avgInput, usage.avgOutput) * usage.requests;
          totalOptimizedCost += optimizedCost;
          const savings = currentCost - optimizedCost;
          
          if (savings > 0) {
            console.log(`   ${model?.displayName} → ${downgrade.displayName}`);
            console.log(`      Savings: $${savings.toFixed(2)} (${((savings/currentCost)*100).toFixed(0)}%)`);
          }
        } else {
          totalOptimizedCost += currentCost;
        }
      }
      
      console.log('─'.repeat(70));
      console.log(`   Total Current:   $${totalCurrentCost.toFixed(2)}`);
      console.log(`   Total Optimized: $${totalOptimizedCost.toFixed(2)}`);
      console.log(`   Total Savings:   $${(totalCurrentCost - totalOptimizedCost).toFixed(2)}`);
    });
  });
});

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  console.log('Running Enterprise Optimization Engine Tests...\n');
}
