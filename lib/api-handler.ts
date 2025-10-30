/**
 * Robust API Handler with Retry, Timeout, and Error Handling
 *
 * Implements exponential backoff retry logic and timeout handling
 * for all OpenAI API calls to ensure stability during launch.
 */

interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  timeout: number; // milliseconds
}

interface APIResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
  timeout: 30000, // 30 seconds
};

/**
 * Sleep utility for delays between retries
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 */
const getRetryDelay = (attempt: number, baseDelay: number, maxDelay: number): number => {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
  return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Determine if an error is retryable
 */
const isRetryableError = (error: any): boolean => {
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }

  // OpenAI specific errors
  if (error.status) {
    // Rate limit - retry
    if (error.status === 429) return true;

    // Server errors - retry
    if (error.status >= 500) return true;

    // Timeout - retry
    if (error.status === 408) return true;

    // Auth errors - don't retry
    if (error.status === 401 || error.status === 403) return false;

    // Bad request - don't retry
    if (error.status === 400) return false;
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return true;
  }

  // Default to retryable for unknown errors
  return true;
};

/**
 * Extract error code from various error types
 */
const getErrorCode = (error: any): string => {
  if (error.status) return `HTTP_${error.status}`;
  if (error.code) return error.code;
  if (error.name === 'AbortError') return 'TIMEOUT';
  if (error.message?.includes('timeout')) return 'TIMEOUT';
  if (error.message?.includes('JSON')) return 'PARSE_ERROR';
  return 'UNKNOWN_ERROR';
};

/**
 * Execute a function with timeout
 */
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
};

/**
 * Execute an async function with retry logic
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  operation: string = 'API call'
): Promise<APIResult<T>> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
    try {
      console.log(`[APIHandler] ${operation} - Attempt ${attempt + 1}/${finalConfig.maxRetries}`);

      const result = await fn();

      console.log(`[APIHandler] ${operation} - Success on attempt ${attempt + 1}`);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      lastError = error;
      const errorCode = getErrorCode(error);
      const retryable = isRetryableError(error);

      console.error(`[APIHandler] ${operation} - Attempt ${attempt + 1} failed:`, {
        code: errorCode,
        message: error.message,
        retryable,
      });

      // If not retryable, fail immediately
      if (!retryable) {
        return {
          success: false,
          error: {
            code: errorCode,
            message: error.message || 'Request failed',
            retryable: false,
          },
        };
      }

      // If this was the last attempt, fail
      if (attempt === finalConfig.maxRetries - 1) {
        break;
      }

      // Calculate delay and wait before retrying
      const delay = getRetryDelay(attempt, finalConfig.baseDelay, finalConfig.maxDelay);
      console.log(`[APIHandler] ${operation} - Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // All retries exhausted
  const errorCode = getErrorCode(lastError);
  return {
    success: false,
    error: {
      code: errorCode,
      message: lastError?.message || 'Request failed after retries',
      retryable: true,
    },
  };
}

/**
 * Execute an async function with both timeout and retry logic
 */
export async function executeWithRetryAndTimeout<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  operation: string = 'API call'
): Promise<APIResult<T>> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return executeWithRetry(
    () => withTimeout(fn(), finalConfig.timeout, operation),
    finalConfig,
    operation
  );
}

/**
 * Truncate large text inputs to prevent timeouts
 */
export function truncateInput(text: string, maxLength: number = 50000): string {
  if (text.length <= maxLength) return text;

  console.warn(`[APIHandler] Truncating input from ${text.length} to ${maxLength} characters`);
  return text.slice(0, maxLength) + '\n\n[Content truncated for length]';
}

/**
 * Validate and parse JSON response
 */
export function parseJSONResponse<T>(text: string, operation: string): APIResult<T> {
  try {
    const data = JSON.parse(text) as T;
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error(`[APIHandler] ${operation} - JSON parse failed:`, error.message);
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Invalid JSON response from API',
        retryable: false,
      },
    };
  }
}

/**
 * Auto-repair logic for validation failures
 * 
 * When a response fails validation, this function:
 * 1. Extracts validation errors
 * 2. Crafts a repair prompt with explicit instructions
 * 3. Retries the generation once
 * 4. If still fails, returns the original response with error details
 */
export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  errors?: string[];
}

export interface PromptTemplate {
  system: string;
  developer: string;
  user: string;
}

export interface ModelConfig {
  model: string;
  temperature: number;
  timeout: number;
  maxRetries: number;
}

export async function callWithAutoRepair<T>(
  promptFn: () => PromptTemplate,
  validateFn: (data: unknown) => ValidationResult<T>,
  modelConfig: ModelConfig,
  openai: any, // OpenAI instance
  operation: string = 'Generation'
): Promise<APIResult<T & { validationErrors?: string[] }>> {
  console.log(`🔧 [Auto-Repair] ${operation} - Initial attempt`);

  // First attempt
  const { system, developer, user } = promptFn();
  
  const firstAttempt = await executeWithRetryAndTimeout(
    async () => {
      return await openai.chat.completions.create({
        model: modelConfig.model,
        messages: [
          { role: "system", content: system },
          { role: "developer" as any, content: developer },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: modelConfig.temperature,
      });
    },
    { timeout: modelConfig.timeout, maxRetries: modelConfig.maxRetries },
    operation
  );

  if (!firstAttempt.success || !firstAttempt.data) {
    console.error(`❌ [Auto-Repair] ${operation} - API call failed`);
    return {
      success: false,
      error: firstAttempt.error,
    };
  }

  // Parse and validate first attempt
  const firstResponse = firstAttempt.data;
  const firstContent = firstResponse.choices[0]?.message?.content;
  
  if (!firstContent) {
    return {
      success: false,
      error: {
        code: 'EMPTY_RESPONSE',
        message: 'Empty response from API',
        retryable: false,
      },
    };
  }

  let firstData: unknown;
  try {
    firstData = JSON.parse(firstContent);
  } catch (parseError) {
    console.error(`❌ [Auto-Repair] ${operation} - JSON parse failed`);
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Invalid JSON response',
        retryable: false,
      },
    };
  }

  const validation = validateFn(firstData);

  // If validation passes, return immediately
  if (validation.ok && validation.data) {
    console.log(`✅ [Auto-Repair] ${operation} - Validation passed on first attempt`);
    return {
      success: true,
      data: validation.data,
    };
  }

  // Validation failed - attempt auto-repair
  console.warn(`⚠️ [Auto-Repair] ${operation} - Validation failed, attempting repair`, {
    errors: validation.errors?.slice(0, 3), // Show first 3 errors
  });

  const repairPrompt = {
    system,
    developer: developer + `\n\nIMPORTANT: The previous response had validation errors. Fix these specific issues:\n${validation.errors?.slice(0, 5).map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\nReturn STRICTLY valid JSON matching the schema. No commentary, no markdown.`,
    user,
  };

  const repairAttempt = await executeWithRetryAndTimeout(
    async () => {
      return await openai.chat.completions.create({
        model: modelConfig.model,
        messages: [
          { role: "system", content: repairPrompt.system },
          { role: "developer" as any, content: repairPrompt.developer },
          { role: "user", content: repairPrompt.user },
        ],
        response_format: { type: "json_object" },
        temperature: Math.max(modelConfig.temperature - 0.1, 0.2), // Slightly lower temp for repair
      });
    },
    { timeout: modelConfig.timeout, maxRetries: 2 }, // Fewer retries for repair
    `${operation} (repair)`
  );

  if (!repairAttempt.success || !repairAttempt.data) {
    console.error(`❌ [Auto-Repair] ${operation} - Repair attempt failed`);
    // Return original data with validation errors
    return {
      success: true, // Still return as success but with errors
      data: { ...(firstData as T), validationErrors: validation.errors },
    };
  }

  const repairResponse = repairAttempt.data;
  const repairContent = repairResponse.choices[0]?.message?.content;

  if (!repairContent) {
    return {
      success: true,
      data: { ...(firstData as T), validationErrors: validation.errors },
    };
  }

  let repairData: unknown;
  try {
    repairData = JSON.parse(repairContent);
  } catch (parseError) {
    console.error(`❌ [Auto-Repair] ${operation} - Repair JSON parse failed`);
    return {
      success: true,
      data: { ...(firstData as T), validationErrors: validation.errors },
    };
  }

  const repairValidation = validateFn(repairData);

  if (repairValidation.ok && repairValidation.data) {
    console.log(`✅ [Auto-Repair] ${operation} - Validation passed after repair`);
    return {
      success: true,
      data: repairValidation.data,
    };
  }

  // Even repair failed - return repaired data with errors
  console.warn(`⚠️ [Auto-Repair] ${operation} - Repair still has errors, returning best attempt`);
  return {
    success: true,
    data: { ...(repairData as T), validationErrors: repairValidation.errors },
  };
}

/**
 * APIHandler - Main export with all utilities
 */
export const APIHandler = {
  executeWithRetry,
  executeWithRetryAndTimeout,
  truncateInput,
  parseJSONResponse,
  isRetryableError,
  getErrorCode,
  callWithAutoRepair,
};

export default APIHandler;
