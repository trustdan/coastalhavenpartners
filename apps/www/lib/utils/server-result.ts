/**
 * Typed result pattern for server actions.
 *
 * This replaces throwing errors or returning empty arrays on failures,
 * which makes real issues (RLS, auth, network) look like "no data found".
 *
 * Usage:
 * ```typescript
 * const result = await loadMoreFirms(params)
 * if (result.success) {
 *   // Use result.data
 * } else {
 *   // Handle result.error based on result.errorKind
 * }
 * ```
 */

/**
 * The kind of failure that occurred.
 */
export type FailureKind =
  | 'auth'        // User not authenticated (401)
  | 'permission'  // Permission denied / RLS violation (403)
  | 'not_found'   // Resource not found (404)
  | 'network'     // Network request failed
  | 'server'      // Server error (500+)
  | 'validation'  // Invalid input data
  | 'unknown'     // Unexpected error

/**
 * Successful result with data.
 */
export interface SuccessResult<T> {
  success: true
  data: T
}

/**
 * Failed result with error information.
 */
export interface FailureResult {
  success: false
  errorKind: FailureKind
  error: string
  /** Optional technical details for logging */
  details?: unknown
}

/**
 * Union type for server action results.
 */
export type ServerResult<T> = SuccessResult<T> | FailureResult

/**
 * Create a success result.
 */
export function success<T>(data: T): SuccessResult<T> {
  return { success: true, data }
}

/**
 * Create a failure result.
 */
export function failure(
  errorKind: FailureKind,
  error: string,
  details?: unknown
): FailureResult {
  return { success: false, errorKind, error, details }
}

/**
 * Determine FailureKind from a Supabase/Postgres error.
 */
export function getFailureKindFromError(error: unknown): FailureKind {
  const errorStr = String(error).toLowerCase()
  const errorCode = (error as { code?: string })?.code?.toLowerCase() ?? ''

  // Auth errors
  if (
    errorStr.includes('jwt') ||
    errorStr.includes('token') ||
    errorStr.includes('unauthorized') ||
    errorStr.includes('401') ||
    errorStr.includes('not authenticated') ||
    errorCode === 'pgrst301'
  ) {
    return 'auth'
  }

  // Permission errors (RLS)
  if (
    errorStr.includes('permission') ||
    errorStr.includes('forbidden') ||
    errorStr.includes('403') ||
    errorStr.includes('rls') ||
    errorStr.includes('policy') ||
    errorCode === '42501'
  ) {
    return 'permission'
  }

  // Not found
  if (
    errorStr.includes('not found') ||
    errorStr.includes('404') ||
    errorCode === 'pgrst116'
  ) {
    return 'not_found'
  }

  // Server errors
  if (
    errorStr.includes('500') ||
    errorStr.includes('502') ||
    errorStr.includes('503') ||
    errorStr.includes('internal server')
  ) {
    return 'server'
  }

  // Network errors
  if (
    errorStr.includes('socket') ||
    errorStr.includes('timeout') ||
    errorStr.includes('connection') ||
    errorStr.includes('network') ||
    errorStr.includes('dns') ||
    errorStr.includes('econnrefused') ||
    errorStr.includes('fetch failed')
  ) {
    return 'network'
  }

  return 'unknown'
}

/**
 * Wrap an async operation in Result pattern.
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  errorMessage = 'An error occurred'
): Promise<ServerResult<T>> {
  try {
    const data = await operation()
    return success(data)
  } catch (error) {
    const kind = getFailureKindFromError(error)
    console.error(`[ServerResult] ${errorMessage}:`, error)
    return failure(kind, errorMessage, error)
  }
}

/**
 * Type guard to check if result is successful.
 */
export function isSuccess<T>(result: ServerResult<T>): result is SuccessResult<T> {
  return result.success === true
}

/**
 * Type guard to check if result is a failure.
 */
export function isFailure<T>(result: ServerResult<T>): result is FailureResult {
  return result.success === false
}

/**
 * Helper to get human-readable error message for UI.
 */
export function getErrorMessage(result: FailureResult): string {
  switch (result.errorKind) {
    case 'auth':
      return 'Please sign in to continue'
    case 'permission':
      return 'You don\'t have permission to access this'
    case 'not_found':
      return 'The requested item was not found'
    case 'network':
      return 'Network error. Please check your connection'
    case 'server':
      return 'Server error. Please try again later'
    case 'validation':
      return result.error || 'Invalid input'
    default:
      return result.error || 'An unexpected error occurred'
  }
}
