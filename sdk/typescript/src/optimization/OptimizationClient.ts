/**
 * SDK Optimization Client
 * Fetches optimization config and applies routing decisions
 */

export interface OptimizationConfig {
  enabled: boolean;
  enableRouting: boolean;
  enableCaching: boolean;
  routingRules: RoutingRule[];
  modelMappings: ModelMapping[];
  cacheSimilarityThreshold: number;
}

export interface RoutingRule {
  id: string;
  name: string;
  priority: number;
  conditions: RoutingCondition[];
  targetModel: string;
  targetProvider: string;
  fallbackModel?: string;
}

export interface RoutingCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: unknown;
}

export interface ModelMapping {
  sourceModel: string;
  targetModel: string;
  targetProvider: string;
  taskTypes?: string[];
  maxComplexity?: number;
  savingsPercent: number;
}

export interface RoutingDecision {
  shouldRoute: boolean;
  originalModel: string;
  targetModel: string;
  targetProvider: string;
  ruleId?: string;
  ruleName?: string;
  reason: string;
  estimatedSavingsPercent: number;
}

export interface RequestContext {
  model: string;
  provider: string;
  messages: Array<{ role: string; content: string }>;
  feature?: string;
  team?: string;
  inputTokens?: number;
}

// Task type detection keywords
const TASK_KEYWORDS: Record<string, string[]> = {
  greeting: ["hello", "hi", "hey", "good morning"],
  faq: ["what is", "how do i", "can you explain", "tell me about"],
  summarization: ["summarize", "summary", "tldr", "key points"],
  translation: ["translate", "in spanish", "in french", "to english"],
  code_generation: ["write code", "create function", "implement", "code for"],
  debugging: ["debug", "fix this", "error", "bug", "not working"],
  math: ["calculate", "solve", "equation", "formula", "compute"],
  sentiment: ["sentiment", "feeling", "emotion", "tone"],
  classification: ["classify", "categorize", "label", "tag"],
};

// Simple task to tier mapping
const TASK_TIER: Record<string, "budget" | "mid" | "premium"> = {
  greeting: "budget",
  faq: "budget",
  sentiment: "budget",
  classification: "budget",
  summarization: "mid",
  translation: "mid",
  code_generation: "mid",
  debugging: "premium",
  math: "premium",
};

export class OptimizationClient {
  private config: OptimizationConfig | null = null;
  private configFetchedAt: number = 0;
  private configTTL = 5 * 60 * 1000; // 5 minutes
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch optimization config from server
   */
  async fetchConfig(): Promise<OptimizationConfig> {
    // Return cached config if still valid
    if (this.config && Date.now() - this.configFetchedAt < this.configTTL) {
      return this.config;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/sdk/optimization/config`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        // Return default config on error
        return this.getDefaultConfig();
      }

      const data = await response.json();
      this.config = data;
      this.configFetchedAt = Date.now();
      return this.config!;
    } catch {
      return this.getDefaultConfig();
    }
  }

  /**
   * Get routing decision for a request
   */
  async getRoutingDecision(context: RequestContext): Promise<RoutingDecision> {
    const config = await this.fetchConfig();

    if (!config.enabled || !config.enableRouting) {
      return this.noRouting(context.model, "Optimization disabled");
    }

    // Detect task type from message content
    const userMessage = context.messages.find((m) => m.role === "user")?.content || "";
    const taskType = this.detectTaskType(userMessage);
    const complexity = this.estimateComplexity(userMessage);

    // Check routing rules first
    for (const rule of config.routingRules.sort((a, b) => a.priority - b.priority)) {
      if (this.matchesRule(rule, context, taskType, complexity)) {
        return {
          shouldRoute: true,
          originalModel: context.model,
          targetModel: rule.targetModel,
          targetProvider: rule.targetProvider,
          ruleId: rule.id,
          ruleName: rule.name,
          reason: `Matched routing rule: ${rule.name}`,
          estimatedSavingsPercent: this.estimateSavings(context.model, rule.targetModel),
        };
      }
    }

    // Check model mappings (smart routing)
    for (const mapping of config.modelMappings) {
      if (this.matchesMapping(mapping, context.model, taskType, complexity)) {
        return {
          shouldRoute: true,
          originalModel: context.model,
          targetModel: mapping.targetModel,
          targetProvider: mapping.targetProvider,
          reason: `Smart routing: ${taskType} task can use ${mapping.targetModel}`,
          estimatedSavingsPercent: mapping.savingsPercent,
        };
      }
    }

    return this.noRouting(context.model, "No routing rule matched");
  }

  /**
   * Detect task type from message
   */
  private detectTaskType(message: string): string {
    const lowerMessage = message.toLowerCase();

    for (const [taskType, keywords] of Object.entries(TASK_KEYWORDS)) {
      if (keywords.some((kw) => lowerMessage.includes(kw))) {
        return taskType;
      }
    }

    // Check for code indicators
    if (this.hasCodeIndicators(lowerMessage)) {
      return "code_generation";
    }

    return "general";
  }

  /**
   * Check for code indicators
   */
  private hasCodeIndicators(text: string): boolean {
    const indicators = ["function", "class", "import", "const", "let", "def ", "```"];
    return indicators.some((ind) => text.includes(ind));
  }

  /**
   * Estimate task complexity (0-1)
   */
  private estimateComplexity(message: string): number {
    let complexity = 0.3;

    // Token count factor
    const tokens = Math.ceil(message.length / 4);
    if (tokens > 500) complexity += 0.1;
    if (tokens > 1000) complexity += 0.1;
    if (tokens > 2000) complexity += 0.1;

    // Multi-step indicators
    const multiStep = ["first", "then", "after that", "finally", "step 1"];
    complexity += multiStep.filter((ind) => message.toLowerCase().includes(ind)).length * 0.05;

    return Math.min(complexity, 1.0);
  }

  /**
   * Check if request matches a routing rule
   */
  private matchesRule(
    rule: RoutingRule,
    context: RequestContext,
    taskType: string,
    complexity: number
  ): boolean {
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(condition, context, taskType, complexity)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: RoutingCondition,
    context: RequestContext,
    taskType: string,
    complexity: number
  ): boolean {
    const fieldValues: Record<string, unknown> = {
      model: context.model,
      provider: context.provider,
      task_type: taskType,
      complexity: complexity,
      feature: context.feature,
      team: context.team,
      input_tokens: context.inputTokens,
    };

    const value = fieldValues[condition.field];
    if (value === undefined) return false;

    switch (condition.operator) {
      case "eq":
        return value === condition.value;
      case "neq":
        return value !== condition.value;
      case "gt":
        return typeof value === "number" && value > (condition.value as number);
      case "gte":
        return typeof value === "number" && value >= (condition.value as number);
      case "lt":
        return typeof value === "number" && value < (condition.value as number);
      case "lte":
        return typeof value === "number" && value <= (condition.value as number);
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(value);
      case "contains":
        return typeof value === "string" && value.includes(condition.value as string);
      default:
        return false;
    }
  }

  /**
   * Check if request matches a model mapping
   */
  private matchesMapping(
    mapping: ModelMapping,
    model: string,
    taskType: string,
    complexity: number
  ): boolean {
    if (mapping.sourceModel !== model) return false;

    if (mapping.taskTypes && !mapping.taskTypes.includes(taskType)) {
      return false;
    }

    if (mapping.maxComplexity !== undefined && complexity > mapping.maxComplexity) {
      return false;
    }

    return true;
  }

  /**
   * Estimate savings percentage
   */
  private estimateSavings(originalModel: string, targetModel: string): number {
    // Rough pricing ratios
    const pricing: Record<string, number> = {
      "gpt-4": 30,
      "gpt-4-turbo": 10,
      "gpt-4o": 2.5,
      "gpt-4o-mini": 0.15,
      "claude-3-opus": 15,
      "claude-3-sonnet": 3,
      "claude-3-haiku": 0.25,
      "gemini-1.5-pro": 1.25,
      "gemini-2.0-flash": 0.1,
    };

    const originalPrice = pricing[originalModel] || 1;
    const targetPrice = pricing[targetModel] || 1;

    if (targetPrice >= originalPrice) return 0;
    return Math.round(((originalPrice - targetPrice) / originalPrice) * 100);
  }

  /**
   * Return no routing decision
   */
  private noRouting(model: string, reason: string): RoutingDecision {
    return {
      shouldRoute: false,
      originalModel: model,
      targetModel: model,
      targetProvider: "",
      reason,
      estimatedSavingsPercent: 0,
    };
  }

  /**
   * Get default config when server unavailable
   */
  private getDefaultConfig(): OptimizationConfig {
    return {
      enabled: false,
      enableRouting: false,
      enableCaching: false,
      routingRules: [],
      modelMappings: [],
      cacheSimilarityThreshold: 0.92,
    };
  }

  /**
   * Clear cached config
   */
  clearCache(): void {
    this.config = null;
    this.configFetchedAt = 0;
  }
}
