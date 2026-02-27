// Generic API query hook with unified error handling
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { UnifiedApiResponse } from '@halaqa/shared';
import type { ApiError } from '@/lib/errors/normalize-error';

/**
 * Generic hook for API queries with unified response/error handling
 * Provides type-safe queries following the unified response pattern
 *
 * @example
 * const validateTokenQuery = useApiQuery({
 *   queryKey: ['validate-token', token],
 *   queryFn: () => authApi.validateToken(token),
 *   enabled: !!token
 * });
 */
export function useApiQuery<TResponse>(
  options: Omit<UseQueryOptions<UnifiedApiResponse<TResponse>, ApiError>, 'initialData'> & {
    initialData?: () => undefined;
  }
) {
  return useQuery<UnifiedApiResponse<TResponse>, ApiError>({
    ...options,
  });
}
