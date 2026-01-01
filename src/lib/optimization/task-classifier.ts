/**
 * TokenTRA Enterprise Task Classification Engine
 * Intelligent task detection for optimal model routing
 */

import type { 
  TaskType, 
  TaskCategory, 
  TaskClassification, 
  ModelTier,
  QualityRequirement,
  TaskFeatures 
} from './types';

// ============================================================================
// TASK CATEGORY MAPPINGS
// ============================================================================

const TASK_CATEGORY_MAP: Record<TaskType, TaskCategory> = {
  // Chat
  greeting: 'chat', faq: 'chat', clarification: 'chat', chitchat: 'chat',
  instruction_following: 'chat', roleplay: 'chat', customer_support: 'chat', 
  information_lookup: 'chat',
  // Content
  summarization: 'content', expansion: 'content', translation: 'content', 
  rewriting: 'content', paraphrasing: 'content', formatting: 'content', 
  proofreading: 'content', content_generation: 'content',
  // Analysis
  sentiment: 'analysis', classification: 'analysis', entity_extraction: 'analysis', 
  comparison: 'analysis', data_extraction: 'analysis', pattern_recognition: 'analysis', 
  anomaly_detection: 'analysis', clustering: 'analysis',
  // Coding
  code_generation: 'coding', code_review: 'coding', debugging: 'coding', 
  code_explanation: 'coding', refactoring: 'coding', test_generation: 'coding', 
  documentation: 'coding', code_completion: 'coding',
  // Reasoning
  math: 'reasoning', logic: 'reasoning', planning: 'reasoning', 
  decision_support: 'reasoning', problem_solving: 'reasoning', 
  causal_reasoning: 'reasoning', hypothesis_generation: 'reasoning',
  // Creative
  copywriting: 'creative', story_generation: 'creative', brainstorming: 'creative', 
  ideation: 'creative', poetry: 'creative', dialogue_writing: 'creative', 
  marketing_copy: 'creative', creative_editing: 'creative',
};

// ============================================================================
// TASK TIER MAPPINGS (Default model tier for each task type)
// ============================================================================

const TASK_TIER_MAP: Record<TaskType, ModelTier> = {
  // Simple → Budget tier
  greeting: 'budget', 
  faq: 'budget', 
  chitchat: 'budget', 
  clarification: 'budget',
  formatting: 'budget', 
  proofreading: 'budget', 
  sentiment: 'budget', 
  classification: 'budget',
  entity_extraction: 'budget', 
  data_extraction: 'budget', 
  code_completion: 'budget',
  information_lookup: 'budget',
  paraphrasing: 'budget',
  
  // Medium complexity → Mid tier
  instruction_following: 'mid', 
  customer_support: 'mid', 
  summarization: 'mid', 
  translation: 'mid', 
  rewriting: 'mid',
  comparison: 'mid', 
  pattern_recognition: 'mid', 
  code_explanation: 'mid', 
  documentation: 'mid',
  copywriting: 'mid', 
  marketing_copy: 'mid', 
  content_generation: 'mid', 
  expansion: 'mid',
  roleplay: 'mid', 
  code_generation: 'mid', 
  code_review: 'mid', 
  debugging: 'mid',
  refactoring: 'mid', 
  test_generation: 'mid', 
  brainstorming: 'mid', 
  ideation: 'mid',
  dialogue_writing: 'mid', 
  creative_editing: 'mid', 
  clustering: 'mid', 
  anomaly_detection: 'mid',
  
  // Complex → Premium tier
  math: 'premium', 
  logic: 'premium', 
  planning: 'premium', 
  decision_support: 'premium',
  problem_solving: 'premium', 
  causal_reasoning: 'premium', 
  hypothesis_generation: 'premium',
  story_generation: 'premium', 
  poetry: 'premium',
};

// ============================================================================
// KEYWORD DETECTION PATTERNS
// ============================================================================

const TASK_KEYWORDS: Record<string, string[]> = {
  // Chat tasks
  greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings', 'whats up', "what's up"],
  faq: ['what is', 'how do i', 'can you explain', 'tell me about', 'what are', 'define', 'describe', 'what does', 'how does'],
  clarification: ['what do you mean', 'can you clarify', 'i dont understand', "i don't understand", 'please explain', 'elaborate'],
  chitchat: ['how are you', 'nice to meet', 'thank you', 'thanks', 'bye', 'goodbye', 'see you'],
  customer_support: ['help me', 'support', 'issue with', 'problem with', 'not working', 'broken', 'fix my', 'resolve'],
  information_lookup: ['find', 'search', 'look up', 'what time', 'where is', 'when did', 'who is'],
  
  // Content tasks
  summarization: ['summarize', 'summary', 'tldr', 'tl;dr', 'key points', 'main ideas', 'brief overview', 'condense', 'shorten'],
  expansion: ['expand', 'elaborate on', 'more detail', 'flesh out', 'develop further', 'extend'],
  translation: ['translate', 'translation', 'in spanish', 'in french', 'to english', 'in german', 'in chinese', 'in japanese', 'to portuguese', 'to spanish', 'to french', 'to german'],
  rewriting: ['rewrite', 'rephrase', 'reword', 'say differently', 'another way'],
  paraphrasing: ['paraphrase', 'put in other words', 'say in your own words'],
  formatting: ['format', 'structure', 'organize', 'layout', 'arrange', 'bullet points', 'numbered list'],
  proofreading: ['proofread', 'check grammar', 'spelling', 'typos', 'correct errors', 'edit for'],
  content_generation: ['write', 'create', 'generate', 'compose', 'draft', 'produce'],
  
  // Analysis tasks
  sentiment: ['sentiment', 'feeling', 'emotion', 'positive or negative', 'tone', 'mood', 'attitude'],
  classification: ['classify', 'categorize', 'which category', 'label', 'tag', 'group', 'sort into'],
  entity_extraction: ['extract', 'find all', 'identify', 'list the', 'pull out', 'get all', 'names mentioned'],
  comparison: ['compare', 'difference between', 'versus', 'vs', 'contrast', 'similarities'],
  data_extraction: ['extract data', 'parse', 'get the values', 'pull numbers', 'find the data'],
  pattern_recognition: ['pattern', 'trend', 'recurring', 'common theme', 'identify patterns'],
  anomaly_detection: ['anomaly', 'outlier', 'unusual', 'abnormal', 'detect anomalies'],
  clustering: ['cluster', 'group similar', 'segment', 'partition'],
  
  // Coding tasks
  code_generation: ['write code', 'create function', 'implement', 'build a', 'code for', 'program that', 'script to', 'create a class'],
  code_review: ['review this code', 'code review', 'check this code', 'audit', 'find bugs', 'code quality'],
  debugging: ['debug', 'fix this', 'error', 'bug', 'not working', 'issue with', 'exception', 'traceback', 'stack trace'],
  code_explanation: ['explain this code', 'what does this code', 'how does this work', 'walk through'],
  refactoring: ['refactor', 'improve this code', 'optimize', 'clean up', 'restructure'],
  test_generation: ['write tests', 'unit test', 'test cases', 'create tests', 'testing'],
  documentation: ['document', 'docstring', 'jsdoc', 'readme', 'api docs', 'comments'],
  code_completion: ['complete this', 'finish this code', 'fill in', 'continue'],
  
  // Reasoning tasks
  math: ['calculate', 'solve', 'equation', 'formula', 'compute', 'mathematical', 'algebra', 'calculus', 'integral', 'derivative', 'probability', 'statistics'],
  logic: ['logical', 'deduce', 'infer', 'if then', 'therefore', 'proof', 'syllogism', 'valid argument'],
  planning: ['plan', 'strategy', 'roadmap', 'steps to', 'how to achieve', 'action plan', 'schedule'],
  decision_support: ['should i', 'which option', 'best choice', 'recommend', 'advise', 'pros and cons', 'trade-offs'],
  problem_solving: ['solve this problem', 'figure out', 'find a solution', 'resolve', 'work out'],
  causal_reasoning: ['why did', 'cause', 'effect', 'because', 'reason for', 'led to', 'resulted in'],
  hypothesis_generation: ['hypothesis', 'theory', 'possible explanation', 'what if', 'suppose'],
  
  // Creative tasks
  copywriting: ['write copy', 'ad copy', 'slogan', 'tagline', 'headline', 'call to action'],
  story_generation: ['write a story', 'tell a story', 'narrative', 'fiction', 'tale', 'once upon'],
  brainstorming: ['brainstorm', 'ideas for', 'suggest ideas', 'come up with', 'creative ideas', 'think of', 'brainstorming'],
  ideation: ['ideate', 'concept', 'innovative', 'new ideas', 'possibilities'],
  poetry: ['poem', 'poetry', 'verse', 'rhyme', 'haiku', 'sonnet', 'limerick'],
  dialogue_writing: ['dialogue', 'conversation', 'script', 'lines for'],
  marketing_copy: ['marketing', 'promotional', 'advertisement', 'campaign', 'brand'],
  creative_editing: ['make it more creative', 'add flair', 'spice up', 'make interesting'],
};

// ============================================================================
// CODE INDICATORS
// ============================================================================

const CODE_INDICATORS = [
  'function', 'class', 'import', 'export', 'const', 'let', 'var', 
  'def ', 'return', '```', 'async', 'await', 'api', 'json',
  'interface', 'type ', 'enum', 'struct', 'public', 'private',
  'static', 'void', 'int ', 'string', 'boolean', 'array',
  'for (', 'for(', 'while (', 'while(', 'if (', 'if(',
  'try {', 'catch', 'throw', 'new ', 'this.', 'self.',
  '= ()', '=>', '->', '::',
  '.py', '.js', '.ts', '.java', '.cpp', '.go', '.rs',
  'npm', 'pip', 'yarn', 'cargo', 'maven', 'gradle',
  'react', 'vue', 'angular', 'express', 'django', 'flask',
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE',
  'git ', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
];

// ============================================================================
// MATH INDICATORS
// ============================================================================

const MATH_INDICATORS = [
  'calculate', 'compute', 'solve', 'equation', 'formula',
  'integral', 'derivative', 'probability', 'statistics',
  'sum', 'product', 'average', 'mean', 'median', 'mode',
  'variance', 'standard deviation', 'correlation',
  'matrix', 'vector', 'tensor', 'eigenvalue',
  'polynomial', 'quadratic', 'linear', 'exponential',
  'logarithm', 'trigonometry', 'sine', 'cosine', 'tangent',
  '+', '-', '*', '/', '=', '<', '>', '≤', '≥', '≠',
  '∑', '∏', '∫', '∂', '√', 'π', 'θ', 'λ', 'μ', 'σ',
  'x^2', 'x²', 'x³', 'n!', 'log', 'ln', 'exp',
];

// ============================================================================
// DOMAIN INDICATORS
// ============================================================================

const DOMAIN_INDICATORS: Record<string, string[]> = {
  medical: [
    'diagnosis', 'treatment', 'symptoms', 'patient', 'clinical',
    'medication', 'dosage', 'prescription', 'disease', 'condition',
    'therapy', 'surgery', 'prognosis', 'medical history', 'vital signs',
    'blood pressure', 'heart rate', 'lab results', 'imaging', 'biopsy',
  ],
  legal: [
    'contract', 'liability', 'jurisdiction', 'plaintiff', 'defendant',
    'lawsuit', 'litigation', 'statute', 'regulation', 'compliance',
    'attorney', 'counsel', 'court', 'judge', 'verdict', 'settlement',
    'intellectual property', 'trademark', 'patent', 'copyright',
  ],
  financial: [
    'portfolio', 'equity', 'derivative', 'hedge', 'valuation',
    'investment', 'stock', 'bond', 'mutual fund', 'etf',
    'dividend', 'yield', 'roi', 'irr', 'npv', 'dcf',
    'balance sheet', 'income statement', 'cash flow', 'audit',
    'tax', 'depreciation', 'amortization', 'capital gains',
  ],
  technical: [
    'api', 'database', 'algorithm', 'latency', 'throughput',
    'scalability', 'microservices', 'container', 'orchestration',
    'ci/cd', 'devops', 'infrastructure', 'cloud', 'serverless',
    'encryption', 'authentication', 'authorization', 'security',
  ],
  scientific: [
    'hypothesis', 'experiment', 'methodology', 'data analysis',
    'peer review', 'publication', 'citation', 'research',
    'control group', 'variable', 'correlation', 'causation',
    'statistical significance', 'p-value', 'confidence interval',
  ],
};

// ============================================================================
// MULTI-STEP INDICATORS
// ============================================================================

const MULTI_STEP_INDICATORS = [
  'first', 'then', 'after that', 'finally', 'next',
  'step 1', 'step 2', 'step 3', 'step one', 'step two',
  '1)', '2)', '3)', '1.', '2.', '3.',
  'begin by', 'start with', 'followed by', 'lastly',
  'initially', 'subsequently', 'ultimately', 'in conclusion',
];

// ============================================================================
// TASK CLASSIFIER CLASS
// ============================================================================

export class TaskClassifier {
  private keywordCache: Map<string, { type: TaskType; matches: number }> = new Map();

  /**
   * Classify a prompt to determine task type and optimal model tier
   */
  async classify(prompt: string, systemPrompt?: string): Promise<TaskClassification> {
    const startTime = performance.now();
    
    // Combine prompts for analysis
    const combinedText = systemPrompt 
      ? `${systemPrompt}\n${prompt}`.toLowerCase() 
      : prompt.toLowerCase();
    
    // Extract features
    const features = this.extractFeatures(prompt, systemPrompt);
    
    // Detect task type
    const { taskType, confidence } = this.detectTaskType(combinedText, features);
    const taskCategory = TASK_CATEGORY_MAP[taskType];
    
    // Calculate complexity
    const complexityScore = this.calculateComplexity(prompt, systemPrompt, taskType, features);
    
    // Determine quality requirement
    const qualityRequirement = this.determineQualityRequirement(taskType, complexityScore, features);
    
    // Determine suggested tier (may override default based on complexity)
    const suggestedTier = this.determineTier(taskType, complexityScore, qualityRequirement);
    
    // Calculate reasoning depth
    const reasoningDepthRequired = this.estimateReasoningDepth(taskType, complexityScore, features);
    
    // Estimate domain specificity
    const domainSpecificity = this.estimateDomainSpecificity(combinedText);
    
    const classificationTime = performance.now() - startTime;
    
    return {
      taskType,
      taskCategory,
      confidence,
      complexityScore,
      reasoningDepthRequired,
      domainSpecificity,
      qualityRequirement,
      suggestedTier,
      explanation: this.generateExplanation(taskType, confidence, complexityScore, suggestedTier, classificationTime),
      features,
    };
  }

  /**
   * Extract features from the prompt
   */
  private extractFeatures(prompt: string, systemPrompt?: string): TaskFeatures {
    const combinedText = systemPrompt ? `${systemPrompt}\n${prompt}` : prompt;
    const lowerText = combinedText.toLowerCase();
    
    return {
      hasCodeIndicators: this.hasCodeIndicators(lowerText),
      hasMathIndicators: this.hasMathIndicators(lowerText),
      hasMultiStepIndicators: this.hasMultiStepIndicators(lowerText),
      estimatedTokens: this.estimateTokens(combinedText),
      languageDetected: this.detectLanguage(combinedText),
      domainDetected: this.detectDomain(lowerText),
      sentimentIndicators: this.detectSentimentIndicators(lowerText),
    };
  }

  /**
   * Detect the task type from the prompt
   */
  private detectTaskType(
    text: string, 
    features: TaskFeatures
  ): { taskType: TaskType; confidence: number } {
    // Check cache first
    const cacheKey = text.substring(0, 200);
    if (this.keywordCache.has(cacheKey)) {
      const cached = this.keywordCache.get(cacheKey)!;
      return { taskType: cached.type, confidence: Math.min(0.5 + (cached.matches * 0.15), 0.95) };
    }

    let detectedType: TaskType = 'instruction_following';
    let maxMatches = 0;
    let confidence = 0.5;

    // Keyword-based detection
    for (const [taskType, keywords] of Object.entries(TASK_KEYWORDS)) {
      const matches = keywords.filter(kw => text.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedType = taskType as TaskType;
        confidence = Math.min(0.5 + (matches * 0.15), 0.95);
      }
    }

    // Override with code detection (higher priority)
    if (features.hasCodeIndicators) {
      if (text.includes('error') || text.includes('bug') || text.includes('fix') || text.includes('not working')) {
        detectedType = 'debugging';
        confidence = 0.85;
      } else if (text.includes('review') || text.includes('check') || text.includes('audit')) {
        detectedType = 'code_review';
        confidence = 0.85;
      } else if (text.includes('write') || text.includes('create') || text.includes('implement') || text.includes('build')) {
        detectedType = 'code_generation';
        confidence = 0.85;
      } else if (text.includes('explain') || text.includes('what does') || text.includes('how does')) {
        detectedType = 'code_explanation';
        confidence = 0.80;
      } else if (text.includes('refactor') || text.includes('improve') || text.includes('optimize')) {
        detectedType = 'refactoring';
        confidence = 0.85;
      } else if (text.includes('test') || text.includes('unit test') || text.includes('spec')) {
        detectedType = 'test_generation';
        confidence = 0.85;
      } else if (text.includes('document') || text.includes('docstring') || text.includes('readme')) {
        detectedType = 'documentation';
        confidence = 0.80;
      } else if (text.includes('complete') || text.includes('finish') || text.includes('continue')) {
        detectedType = 'code_completion';
        confidence = 0.75;
      } else {
        detectedType = 'code_generation';
        confidence = 0.70;
      }
    }

    // Override with math detection (higher priority)
    if (features.hasMathIndicators && !features.hasCodeIndicators) {
      const mathKeywordCount = MATH_INDICATORS.filter(ind => text.includes(ind)).length;
      if (mathKeywordCount >= 2) {
        detectedType = 'math';
        confidence = Math.min(0.7 + (mathKeywordCount * 0.05), 0.95);
      }
    }

    // Cache the result
    if (this.keywordCache.size > 10000) {
      // Clear oldest entries
      const keysToDelete = Array.from(this.keywordCache.keys()).slice(0, 5000);
      keysToDelete.forEach(k => this.keywordCache.delete(k));
    }
    this.keywordCache.set(cacheKey, { type: detectedType, matches: maxMatches });

    return { taskType: detectedType, confidence };
  }

  /**
   * Calculate complexity score (0-1)
   */
  private calculateComplexity(
    prompt: string, 
    systemPrompt: string | undefined, 
    taskType: TaskType,
    features: TaskFeatures
  ): number {
    let complexity = 0.3; // Base complexity

    // Token count impact
    const totalTokens = features.estimatedTokens;
    if (totalTokens > 500) complexity += 0.1;
    if (totalTokens > 1000) complexity += 0.1;
    if (totalTokens > 2000) complexity += 0.1;
    if (totalTokens > 4000) complexity += 0.1;

    // Task type impact
    const complexTasks: TaskType[] = [
      'math', 'logic', 'planning', 'code_generation', 'debugging', 
      'hypothesis_generation', 'causal_reasoning', 'problem_solving',
      'story_generation', 'refactoring'
    ];
    if (complexTasks.includes(taskType)) complexity += 0.2;

    // Multi-step impact
    if (features.hasMultiStepIndicators) complexity += 0.1;

    // Code complexity
    if (features.hasCodeIndicators) {
      const codeIndicatorCount = CODE_INDICATORS.filter(ind => 
        prompt.toLowerCase().includes(ind)
      ).length;
      complexity += Math.min(codeIndicatorCount * 0.02, 0.15);
    }

    // Domain specificity impact
    if (features.domainDetected) complexity += 0.1;

    // System prompt complexity
    if (systemPrompt && systemPrompt.length > 500) complexity += 0.05;
    if (systemPrompt && systemPrompt.length > 1000) complexity += 0.05;

    return Math.min(complexity, 1.0);
  }

  /**
   * Determine quality requirement
   */
  private determineQualityRequirement(
    taskType: TaskType, 
    complexity: number,
    features: TaskFeatures
  ): QualityRequirement {
    const criticalTasks: TaskType[] = [
      'math', 'logic', 'code_generation', 'debugging', 'decision_support',
      'code_review', 'hypothesis_generation', 'causal_reasoning'
    ];
    const highQualityTasks: TaskType[] = [
      'translation', 'summarization', 'planning', 'refactoring',
      'test_generation', 'problem_solving', 'story_generation'
    ];
    const lowQualityTasks: TaskType[] = [
      'greeting', 'chitchat', 'formatting', 'clarification'
    ];

    // Domain-specific always requires higher quality
    if (features.domainDetected === 'medical' || features.domainDetected === 'legal') {
      return 'critical';
    }

    if (criticalTasks.includes(taskType) || complexity > 0.9) return 'critical';
    if (highQualityTasks.includes(taskType) || complexity > 0.7) return 'high';
    if (lowQualityTasks.includes(taskType) && complexity < 0.4) return 'low';
    return 'medium';
  }

  /**
   * Determine suggested model tier
   */
  private determineTier(
    taskType: TaskType, 
    complexity: number,
    qualityRequirement: QualityRequirement
  ): ModelTier {
    let baseTier = TASK_TIER_MAP[taskType] || 'mid';

    // Upgrade tier based on complexity
    if (complexity > 0.8 && baseTier === 'budget') {
      baseTier = 'mid';
    }
    if (complexity > 0.9 && baseTier !== 'premium') {
      baseTier = 'premium';
    }

    // Upgrade tier based on quality requirement
    if (qualityRequirement === 'critical' && baseTier !== 'premium') {
      baseTier = 'premium';
    }
    if (qualityRequirement === 'high' && baseTier === 'budget') {
      baseTier = 'mid';
    }

    return baseTier;
  }

  /**
   * Estimate reasoning depth required (1-10)
   */
  private estimateReasoningDepth(
    taskType: TaskType, 
    complexity: number,
    features: TaskFeatures
  ): number {
    const baseDepth: Partial<Record<TaskType, number>> = {
      greeting: 1, faq: 2, chitchat: 2, clarification: 2,
      formatting: 2, proofreading: 3, sentiment: 3, classification: 3,
      summarization: 4, translation: 4, entity_extraction: 3,
      code_completion: 4, code_explanation: 5, documentation: 4,
      content_generation: 5, rewriting: 4, comparison: 5,
      code_generation: 6, code_review: 6, debugging: 7, refactoring: 6,
      test_generation: 6, brainstorming: 5, ideation: 5,
      planning: 7, decision_support: 7, problem_solving: 7,
      math: 8, logic: 8, causal_reasoning: 8, hypothesis_generation: 8,
      story_generation: 6, poetry: 6,
    };

    const base = baseDepth[taskType] || 5;
    const complexityBonus = Math.round(complexity * 2);
    const multiStepBonus = features.hasMultiStepIndicators ? 1 : 0;

    return Math.min(base + complexityBonus + multiStepBonus, 10);
  }

  /**
   * Estimate domain specificity (1-10)
   */
  private estimateDomainSpecificity(text: string): number {
    let maxSpecificity = 1;

    for (const [domain, terms] of Object.entries(DOMAIN_INDICATORS)) {
      const matches = terms.filter(t => text.includes(t)).length;
      if (matches > 0) {
        const specificity = Math.min(1 + (matches * 2), 10);
        maxSpecificity = Math.max(maxSpecificity, specificity);
      }
    }

    return maxSpecificity;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private hasCodeIndicators(text: string): boolean {
    return CODE_INDICATORS.some(ind => text.includes(ind.toLowerCase()));
  }

  private hasMathIndicators(text: string): boolean {
    const matches = MATH_INDICATORS.filter(ind => text.includes(ind.toLowerCase())).length;
    return matches >= 2;
  }

  private hasMultiStepIndicators(text: string): boolean {
    return MULTI_STEP_INDICATORS.some(ind => text.includes(ind.toLowerCase()));
  }

  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  private detectLanguage(text: string): string | undefined {
    // Simple language detection based on common words
    const languagePatterns: Record<string, string[]> = {
      spanish: ['el', 'la', 'de', 'que', 'en', 'es', 'por', 'con', 'para'],
      french: ['le', 'la', 'de', 'et', 'est', 'en', 'que', 'pour', 'avec'],
      german: ['der', 'die', 'und', 'ist', 'von', 'mit', 'für', 'auf', 'das'],
      chinese: ['的', '是', '在', '有', '和', '了', '我', '他', '这'],
      japanese: ['の', 'は', 'を', 'に', 'が', 'と', 'で', 'た', 'です'],
    };

    const lowerText = text.toLowerCase();
    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      const matches = patterns.filter(p => lowerText.includes(p)).length;
      if (matches >= 3) return lang;
    }

    return 'english';
  }

  private detectDomain(text: string): string | undefined {
    for (const [domain, terms] of Object.entries(DOMAIN_INDICATORS)) {
      const matches = terms.filter(t => text.includes(t)).length;
      if (matches >= 3) return domain;
    }
    return undefined;
  }

  private detectSentimentIndicators(text: string): string[] {
    const indicators: string[] = [];
    
    const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best'];
    const negativeWords = ['terrible', 'awful', 'horrible', 'worst', 'hate', 'bad', 'poor'];
    const urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];

    if (positiveWords.some(w => text.includes(w))) indicators.push('positive');
    if (negativeWords.some(w => text.includes(w))) indicators.push('negative');
    if (urgentWords.some(w => text.includes(w))) indicators.push('urgent');

    return indicators;
  }

  private generateExplanation(
    taskType: TaskType,
    confidence: number,
    complexity: number,
    tier: ModelTier,
    timeMs: number
  ): string {
    const confidencePercent = (confidence * 100).toFixed(0);
    const complexityPercent = (complexity * 100).toFixed(0);
    
    return `Detected "${taskType}" task with ${confidencePercent}% confidence. ` +
      `Complexity: ${complexityPercent}%. ` +
      `Recommended tier: ${tier}. ` +
      `Classification time: ${timeMs.toFixed(1)}ms.`;
  }

  /**
   * Batch classify multiple prompts
   */
  async classifyBatch(
    prompts: Array<{ prompt: string; systemPrompt?: string }>
  ): Promise<TaskClassification[]> {
    return Promise.all(
      prompts.map(({ prompt, systemPrompt }) => this.classify(prompt, systemPrompt))
    );
  }

  /**
   * Get task category for a task type
   */
  getTaskCategory(taskType: TaskType): TaskCategory {
    return TASK_CATEGORY_MAP[taskType];
  }

  /**
   * Get default tier for a task type
   */
  getDefaultTier(taskType: TaskType): ModelTier {
    return TASK_TIER_MAP[taskType];
  }

  /**
   * Clear the keyword cache
   */
  clearCache(): void {
    this.keywordCache.clear();
  }
}

// Singleton instance
export const taskClassifier = new TaskClassifier();
