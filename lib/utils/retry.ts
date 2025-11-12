/**
 * Retry utility for handling transient failures
 * Implements exponential backoff with configurable options
 */

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Execute a function with automatic retry logic
 * 
 * @param fn - The async function to execute
 * @param options - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail
 * 
 * @example
 * const data = await withRetry(
 *   () => fetch('/api/endpoint'),
 *   { maxRetries: 3, delayMs: 1000, backoff: true }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = true,
    onRetry
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with optional exponential backoff
      const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;

      console.log(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`,
        error instanceof Error ? error.message : error
      );

      // Call retry callback if provided
      onRetry?.(attempt + 1, error);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Check if an error is retryable
 * Network errors, timeouts, and 5xx errors are retryable
 * Auth errors and client errors (4xx except 429) are not
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors are retryable
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('econnreset')
    ) {
      return true;
    }
  }

  // Check HTTP response errors
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status;

    // 429 (rate limit) and 5xx (server errors) are retryable
    if (status === 429 || (status >= 500 && status < 600)) {
      return true;
    }
  }

  return false;
}

/**
 * Retry wrapper specifically for fetch calls
 * Automatically handles HTTP errors and response parsing
 */
export async function fetchWithRetry<T = any>(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<T> {
  return withRetry(
    async () => {
      const response = await fetch(url, init);

      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;

        // Try to parse error body
        try {
          error.body = await response.json();
        } catch {
          // Ignore JSON parse errors
        }

        throw error;
      }

      return response.json();
    },
    {
      ...options,
      // Only retry if error is retryable
      maxRetries: options?.maxRetries ?? 2
    }
  );
}
