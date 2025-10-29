/**
 * Error Mapper - User-Friendly Error Messages
 *
 * Maps technical error codes to friendly, actionable messages
 * for end users during API failures.
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  actionable: string;
  retryable: boolean;
}

/**
 * Map error code to user-friendly message
 */
export function mapErrorToUserMessage(
  errorCode: string,
  context: string = 'operation'
): UserFriendlyError {
  switch (errorCode) {
    // Authentication errors
    case 'HTTP_401':
    case 'HTTP_403':
      return {
        title: 'Authentication Error',
        message: 'There was a problem with our API credentials.',
        actionable: 'Please contact support if this persists.',
        retryable: false,
      };

    // Rate limiting
    case 'HTTP_429':
      return {
        title: 'Too Many Requests',
        message: 'We\'re experiencing high demand right now.',
        actionable: 'Please wait a moment and try again.',
        retryable: true,
      };

    // Timeout errors
    case 'TIMEOUT':
    case 'HTTP_408':
    case 'ETIMEDOUT':
      return {
        title: 'Request Timed Out',
        message: `The ${context} took longer than expected.`,
        actionable: 'This usually resolves quickly. Click "Try Again" to retry.',
        retryable: true,
      };

    // Server errors
    case 'HTTP_500':
    case 'HTTP_502':
    case 'HTTP_503':
    case 'HTTP_504':
      return {
        title: 'Service Temporarily Unavailable',
        message: 'Our AI service is experiencing technical difficulties.',
        actionable: 'Please try again in a few moments.',
        retryable: true,
      };

    // Network errors
    case 'ECONNRESET':
    case 'ENOTFOUND':
    case 'ENETUNREACH':
      return {
        title: 'Connection Error',
        message: 'Unable to reach our servers.',
        actionable: 'Please check your internet connection and try again.',
        retryable: true,
      };

    // Parse errors
    case 'PARSE_ERROR':
      return {
        title: 'Response Format Error',
        message: 'We received an unexpected response format.',
        actionable: 'Please try again. If this persists, contact support.',
        retryable: true,
      };

    // Validation errors
    case 'VALIDATION_ERROR':
      return {
        title: 'Invalid Response',
        message: 'The generated content didn\'t meet quality standards.',
        actionable: 'Click "Try Again" to regenerate.',
        retryable: true,
      };

    // Bad request
    case 'HTTP_400':
      return {
        title: 'Invalid Request',
        message: 'The request contained invalid data.',
        actionable: 'Please check your input and try again.',
        retryable: false,
      };

    // Default/unknown error
    case 'UNKNOWN_ERROR':
    default:
      return {
        title: 'Unexpected Error',
        message: `Something went wrong with the ${context}.`,
        actionable: 'Please try again. If the problem persists, contact support.',
        retryable: true,
      };
  }
}

/**
 * Get a short error message for inline display
 */
export function getShortErrorMessage(errorCode: string): string {
  const error = mapErrorToUserMessage(errorCode);
  return error.message;
}

/**
 * Get full error details for error UI
 */
export function getFullErrorDetails(
  errorCode: string,
  context: string = 'operation'
): UserFriendlyError {
  return mapErrorToUserMessage(errorCode, context);
}

/**
 * Check if an error should show a retry button
 */
export function shouldShowRetry(errorCode: string): boolean {
  const error = mapErrorToUserMessage(errorCode);
  return error.retryable;
}

/**
 * Get suggested wait time before retry (in milliseconds)
 */
export function getRetryWaitTime(errorCode: string, attemptNumber: number = 1): number {
  switch (errorCode) {
    case 'HTTP_429': // Rate limit
      return Math.min(5000 * attemptNumber, 20000); // 5s, 10s, 15s, max 20s

    case 'TIMEOUT':
    case 'HTTP_408':
      return 2000; // 2 seconds for timeouts

    case 'HTTP_500':
    case 'HTTP_502':
    case 'HTTP_503':
      return 3000; // 3 seconds for server errors

    default:
      return 1000; // 1 second default
  }
}

/**
 * Format error for logging (safe to include in console/logs)
 */
export function formatErrorForLogging(
  errorCode: string,
  errorMessage: string,
  context: string
): string {
  return `[${context}] Error ${errorCode}: ${errorMessage}`;
}

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(
  errorCode: string,
  context: string = 'operation',
  statusCode: number = 500
) {
  const userError = mapErrorToUserMessage(errorCode, context);

  return {
    status: statusCode,
    body: {
      error: userError.message,
      title: userError.title,
      actionable: userError.actionable,
      retryable: userError.retryable,
      code: errorCode,
    },
  };
}

/**
 * Error context helpers for different operations
 */
export const ErrorContext = {
  ICP_GENERATION: 'ICP generation',
  VALUE_PROP_GENERATION: 'value proposition generation',
  EMAIL_GENERATION: 'email generation',
  EMAIL_SEQUENCE_GENERATION: 'email sequence generation',
  LINKEDIN_GENERATION: 'LinkedIn content generation',
  CHAT_REFINEMENT: 'chat refinement',
  WEBSITE_ANALYSIS: 'website analysis',
};

export default {
  mapErrorToUserMessage,
  getShortErrorMessage,
  getFullErrorDetails,
  shouldShowRetry,
  getRetryWaitTime,
  formatErrorForLogging,
  createErrorResponse,
  ErrorContext,
};
