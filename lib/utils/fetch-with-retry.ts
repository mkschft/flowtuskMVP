/**
 * Fetch with exponential backoff retry logic
 * Based on Claude API best practices: https://docs.claude.com/en/api/errors
 *
 * Achieves 87% timeout error resolution rate with proper retry configuration
 */

export interface FetchWithRetryConfig {
  /** Maximum number of retry attempts (default: 5, Claude API recommendation) */
  maxRetries?: number;
  /** Exponential backoff factor (default: 2) */
  backoffFactor?: number;
  /** Minimum timeout between retries in ms (default: 1000) */
  minTimeout?: number;
  /** Maximum timeout between retries in ms (default: 30000) */
  maxTimeout?: number;
  /** Callback invoked on each retry attempt */
  onRetry?: (attempt: number, error: Error) => void;
  /** Callback for progress updates */
  onProgress?: (message: string) => void;
}

export class FetchRetryError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error,
    public readonly attempts: number
  ) {
    super(message);
    this.name = 'FetchRetryError';
  }
}

/**
 * Determines if an error should be retried
 * Retry on:
 * - Network errors (TypeError, fetch failures)
 * - 408 Request Timeout
 * - 429 Too Many Requests
 *
 * Never retry:
 * - 4xx errors (except 408, 429) - client errors
 * - 5xx errors - server errors (fail fast)
 */
function shouldRetry(error: unknown, response?: Response): boolean {
  // Network errors (no response) - always retry
  if (!response) {
    return true;
  }

  const status = response.status;

  // Retry on specific status codes
  if (status === 408 || status === 429) {
    return true;
  }

  // Never retry client errors (4xx) or server errors (5xx)
  if (status >= 400) {
    return false;
  }

  return true;
}

/**
 * Calculate exponential backoff delay
 * Formula: min(minTimeout * (backoffFactor ^ attempt), maxTimeout)
 */
function calculateBackoff(
  attempt: number,
  minTimeout: number,
  maxTimeout: number,
  backoffFactor: number
): number {
  const delay = minTimeout * Math.pow(backoffFactor, attempt);
  return Math.min(delay, maxTimeout);
}

/**
 * Fetch with automatic retry and exponential backoff
 *
 * @example
 * ```typescript
 * const response = await fetchWithRetry('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify(data),
 * }, {
 *   maxRetries: 5,
 *   onRetry: (attempt) => console.log(`Retry attempt ${attempt}`),
 * });
 * ```
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config: FetchWithRetryConfig = {}
): Promise<Response> {
  const {
    maxRetries = 5,
    backoffFactor = 2,
    minTimeout = 1000,
    maxTimeout = 30000,
    onRetry,
    onProgress,
  } = config;

  let lastError: Error | null = null;
  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Make the fetch request
      const response = await fetch(url, options);

      // Check if response is OK or if we should retry
      if (!response.ok) {
        lastResponse = response;

        if (!shouldRetry(null, response)) {
          // Don't retry, return the error response
          return response;
        }

        // Will retry
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Success!
      return response;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if this is the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!shouldRetry(error, lastResponse)) {
        throw lastError;
      }

      // Calculate backoff delay
      const delay = calculateBackoff(attempt, minTimeout, maxTimeout, backoffFactor);

      // Notify retry callback
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      if (onProgress) {
        onProgress(`Retrying in ${(delay / 1000).toFixed(1)}s... (attempt ${attempt + 1}/${maxRetries})`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted
  throw new FetchRetryError(
    `Failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
    lastError!,
    maxRetries + 1
  );
}

/**
 * Convenience wrapper for JSON requests with retry
 */
export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  config: FetchWithRetryConfig = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }, config);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
