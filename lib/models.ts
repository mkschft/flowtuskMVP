/**
 * Model Configuration & Routing
 * 
 * Optimizes model selection, temperatures, and timeouts for each stage
 * of the content generation pipeline.
 */

// ============================================================================
// Model Selection
// ============================================================================

export const MODELS = {
  // GPT-4o: Best reasoning for fact extraction
  ANALYZE: 'gpt-4o',
  
  // GPT-4o-mini: Cost-effective for structured generation
  GENERATE: 'gpt-4o-mini',
} as const;

// ============================================================================
// Temperature Settings
// ============================================================================

export const TEMPERATURES = {
  // Low temperature for factual extraction (deterministic)
  EXTRACT: 0.3,
  
  // Moderate temperature for creative content generation
  GENERATE: 0.7,
  
  // Slightly higher for email sequences (more variety needed)
  SEQUENCE: 0.75,
} as const;

// ============================================================================
// Timeout Settings (milliseconds)
// ============================================================================

export const TIMEOUTS = {
  // Longer timeout for complex fact extraction
  ANALYZE: 45000, // 45 seconds
  
  // Standard timeout for generation
  GENERATE: 30000, // 30 seconds
  
  // Longer timeout for email sequences (multiple emails)
  SEQUENCE: 40000, // 40 seconds
  
  // Shorter timeout for simple operations
  QUICK: 20000, // 20 seconds
} as const;

// ============================================================================
// Retry Configuration
// ============================================================================

export const RETRY_CONFIG = {
  // Standard retry attempts
  DEFAULT: 3,
  
  // Fewer retries for expensive operations
  EXPENSIVE: 2,
  
  // More retries for critical operations
  CRITICAL: 4,
} as const;

// ============================================================================
// Model Configurations by Stage
// ============================================================================

export interface ModelConfig {
  model: string;
  temperature: number;
  timeout: number;
  maxRetries: number;
}

export const MODEL_CONFIGS = {
  /**
   * Website Analysis: Extract structured facts
   * - Uses GPT-4o for best reasoning
   * - Low temperature for factual accuracy
   * - Longer timeout for complex analysis
   */
  ANALYZE: {
    model: MODELS.ANALYZE,
    temperature: TEMPERATURES.EXTRACT,
    timeout: TIMEOUTS.ANALYZE,
    maxRetries: RETRY_CONFIG.EXPENSIVE,
  } satisfies ModelConfig,

  /**
   * ICP Generation: Create customer profiles
   * - Uses GPT-4o-mini for cost efficiency
   * - Moderate temperature for balanced creativity
   * - Standard timeout
   */
  GENERATE_ICP: {
    model: MODELS.GENERATE,
    temperature: TEMPERATURES.GENERATE,
    timeout: TIMEOUTS.GENERATE,
    maxRetries: RETRY_CONFIG.DEFAULT,
  } satisfies ModelConfig,

  /**
   * Value Proposition: Generate copy variations
   * - Uses GPT-4o-mini for cost efficiency
   * - Moderate temperature for creative variations
   * - Standard timeout
   */
  GENERATE_VALUE_PROP: {
    model: MODELS.GENERATE,
    temperature: TEMPERATURES.GENERATE,
    timeout: TIMEOUTS.GENERATE,
    maxRetries: RETRY_CONFIG.DEFAULT,
  } satisfies ModelConfig,

  /**
   * One-Time Email: Generate single email
   * - Uses GPT-4o-mini for cost efficiency
   * - Moderate temperature for engaging copy
   * - Standard timeout
   */
  GENERATE_EMAIL: {
    model: MODELS.GENERATE,
    temperature: TEMPERATURES.GENERATE,
    timeout: TIMEOUTS.GENERATE,
    maxRetries: RETRY_CONFIG.DEFAULT,
  } satisfies ModelConfig,

  /**
   * Email Sequence: Generate multiple emails
   * - Uses GPT-4o-mini for cost efficiency
   * - Slightly higher temperature for variety
   * - Longer timeout for multiple emails
   */
  GENERATE_SEQUENCE: {
    model: MODELS.GENERATE,
    temperature: TEMPERATURES.SEQUENCE,
    timeout: TIMEOUTS.SEQUENCE,
    maxRetries: RETRY_CONFIG.DEFAULT,
  } satisfies ModelConfig,

  /**
   * LinkedIn Outreach: Generate LinkedIn content
   * - Uses GPT-4o-mini for cost efficiency
   * - Moderate temperature for professional tone
   * - Standard timeout
   */
  GENERATE_LINKEDIN: {
    model: MODELS.GENERATE,
    temperature: TEMPERATURES.GENERATE,
    timeout: TIMEOUTS.GENERATE,
    maxRetries: RETRY_CONFIG.DEFAULT,
  } satisfies ModelConfig,
} as const;

// ============================================================================
// Cost Estimation
// ============================================================================

/**
 * Pricing per 1K tokens (as of Oct 2024)
 */
const PRICING = {
  'gpt-4o': {
    input: 0.0025,
    output: 0.010,
  },
  'gpt-4o-mini': {
    input: 0.00015,
    output: 0.0006,
  },
} as const;

/**
 * Estimate cost for a generation stage
 */
export function estimateCost(
  model: keyof typeof PRICING,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model];
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Typical token counts for each stage
 */
export const TYPICAL_TOKENS = {
  ANALYZE: { input: 5000, output: 2000 },
  GENERATE_ICP: { input: 3000, output: 1000 },
  GENERATE_VALUE_PROP: { input: 2000, output: 1000 },
  GENERATE_EMAIL: { input: 1500, output: 500 },
  GENERATE_SEQUENCE: { input: 2000, output: 2000 },
  GENERATE_LINKEDIN: { input: 1500, output: 800 },
} as const;

/**
 * Estimate full flow cost
 */
export function estimateFullFlowCost(withCache: boolean = false): {
  firstRun: number;
  subsequentRuns: number;
  savingsPercent: number;
} {
  const analyzeCost = estimateCost(
    MODELS.ANALYZE,
    TYPICAL_TOKENS.ANALYZE.input,
    TYPICAL_TOKENS.ANALYZE.output
  );

  const icpCost = estimateCost(
    MODELS.GENERATE,
    TYPICAL_TOKENS.GENERATE_ICP.input,
    TYPICAL_TOKENS.GENERATE_ICP.output
  );

  const valuePropCost = estimateCost(
    MODELS.GENERATE,
    TYPICAL_TOKENS.GENERATE_VALUE_PROP.input,
    TYPICAL_TOKENS.GENERATE_VALUE_PROP.output
  );

  const emailCost = estimateCost(
    MODELS.GENERATE,
    TYPICAL_TOKENS.GENERATE_EMAIL.input,
    TYPICAL_TOKENS.GENERATE_EMAIL.output
  );

  const firstRun = analyzeCost + icpCost + valuePropCost + emailCost;
  const subsequentRuns = withCache ? (icpCost + valuePropCost + emailCost) : firstRun;
  const savingsPercent = withCache ? ((firstRun - subsequentRuns) / firstRun) * 100 : 0;

  return {
    firstRun: Math.round(firstRun * 1000) / 1000,
    subsequentRuns: Math.round(subsequentRuns * 1000) / 1000,
    savingsPercent: Math.round(savingsPercent),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get model config for a specific stage
 */
export function getModelConfig(stage: keyof typeof MODEL_CONFIGS): ModelConfig {
  return MODEL_CONFIGS[stage];
}

/**
 * Log model config (for debugging)
 */
export function logModelConfig(stage: keyof typeof MODEL_CONFIGS): void {
  const config = MODEL_CONFIGS[stage];
  console.log(`📊 [Model Config: ${stage}]`, {
    model: config.model,
    temperature: config.temperature,
    timeout: `${config.timeout}ms`,
    maxRetries: config.maxRetries,
  });
}

// ============================================================================
// Export All
// ============================================================================

export default {
  MODELS,
  TEMPERATURES,
  TIMEOUTS,
  RETRY_CONFIG,
  MODEL_CONFIGS,
  getModelConfig,
  estimateCost,
  estimateFullFlowCost,
  logModelConfig,
};

