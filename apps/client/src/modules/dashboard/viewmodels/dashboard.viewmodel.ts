import { User } from '@halaqa/shared';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { dashboardService, DashboardStats } from '../services/dashboard.service';

const resolveSuccessData = <T>(
  response: { success: boolean; data?: T; error?: string; message?: string },
  fallbackMessage: string
): T => {
  if (!response.success || response.data === undefined) {
    throw new Error(response.error || response.message || fallbackMessage);
  }

  return response.data;
};

export const useDashboardViewModel = (user: User) => {
  const statsQuery = useApiQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats(user.id, user.role),
    queryFn: async () => {
      const stats = resolveSuccessData(
        await dashboardService.getStats(user.id, user.role),
        'فشل تحميل الإحصائيات'
      );

      return {
        success: true,
        data: stats,
      };
    },
  });

  return {
    stats: statsQuery.data?.data ?? null,
    isLoading: statsQuery.isPending,
    isRefreshing: statsQuery.isFetching,
    error: statsQuery.error?.message ?? null,
    refreshStats: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.stats(user.id, user.role),
      }),
  };
};
