interface ModelCapabilities {
  reasoning: number;
  coding: number;
  creative: number;
  speed: number;
  cost: number;
}

const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  "gpt-4o": { reasoning: 9, coding: 9, creative: 8, speed: 7, cost: 7 },
  "gpt-4o-mini": { reasoning: 7, coding: 7, creative: 6, speed: 9, cost: 9 },
  "o1": { reasoning: 10, coding: 10, creative: 7, speed: 3, cost: 5 },
  "o1-mini": { reasoning: 9, coding: 9, creative: 6, speed: 5, cost: 7 },
  "claude-3-5-sonnet": { reasoning: 9, coding: 9, creative: 9, speed: 7, cost: 7 },
  "claude-3-5-haiku": { reasoning: 7, coding: 7, creative: 6, speed: 9, cost: 9 },
  "claude-3-opus": { reasoning: 10, coding: 9, creative: 9, speed: 5, cost: 3 },
  "gemini-1.5-pro": { reasoning: 9, coding: 8, creative: 8, speed: 7, cost: 8 },
  "gemini-1.5-flash": { reasoning: 7, coding: 6, creative: 6, speed: 10, cost: 10 },
};

export interface TaskRequirements {
  reasoning?: number;
  coding?: number;
  creative?: number;
  speed?: number;
  costSensitivity?: number;
}

export function selectOptimalModel(
  requirements: TaskRequirements,
  availableModels: string[] = Object.keys(MODEL_CAPABILITIES)
): string | null {
  let bestModel: string | null = null;
  let bestScore = -Infinity;
  
  for (const model of availableModels) {
    const caps = MODEL_CAPABILITIES[model];
    if (!caps) continue;
    
    let score = 0;
    let weights = 0;
    
    if (requirements.reasoning !== undefined) {
      score += caps.reasoning * requirements.reasoning;
      weights += requirements.reasoning;
    }
    if (requirements.coding !== undefined) {
      score += caps.coding * requirements.coding;
      weights += requirements.coding;
    }
    if (requirements.creative !== undefined) {
      score += caps.creative * requirements.creative;
      weights += requirements.creative;
    }
    if (requirements.speed !== undefined) {
      score += caps.speed * requirements.speed;
      weights += requirements.speed;
    }
    if (requirements.costSensitivity !== undefined) {
      score += caps.cost * requirements.costSensitivity;
      weights += requirements.costSensitivity;
    }
    
    const normalizedScore = weights > 0 ? score / weights : 0;
    
    if (normalizedScore > bestScore) {
      bestScore = normalizedScore;
      bestModel = model;
    }
  }
  
  return bestModel;
}
