// Generic API mutation hook with unified error handling
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { UnifiedApiResponse } from '@halaqa/shared';
import type { ApiError } from '@/lib/errors/normalize-error';

export type { ApiError } from '@/lib/errors/normalize-error';

/**
 * Generic hook for API mutations with unified response/error handling
 * Provides type-safe mutations following the unified response pattern
 *
 * @example
 * const loginMutation = useApiMutation({
 *   mutationFn: (data: LoginDto) => authApi.login(data),
 *   onSuccess: (response) => {
 *     // response.data contains typed AuthResponseDto
 *   }
 * });
 */
export function useApiMutation<TRequest, TResponse>(
  options: Omit<
    UseMutationOptions<UnifiedApiResponse<TResponse>, ApiError, TRequest>,
    'mutationKey'
  >
) {
  return useMutation<UnifiedApiResponse<TResponse>, ApiError, TRequest>({
    ...options,
  });
}
