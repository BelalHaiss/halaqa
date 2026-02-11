// Generic API mutation hook with unified error handling
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { ApiSuccessResponse } from '@ionsite/shared';

// Error type returned from axios interceptor
export interface ApiError {
  message: string;
  statusCode?: number;
  fields?: { field: string; message: string }[];
}

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
    UseMutationOptions<ApiSuccessResponse<TResponse>, ApiError, TRequest>,
    'mutationKey'
  >
) {
  return useMutation<ApiSuccessResponse<TResponse>, ApiError, TRequest>({
    ...options
  });
}
