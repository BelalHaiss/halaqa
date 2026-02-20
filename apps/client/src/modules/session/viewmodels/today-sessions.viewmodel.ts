import { SessionSummaryDTO, User } from '@halaqa/shared';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryKeys } from '@/lib/query-client';
import { sessionService } from '../services/session.service';

export const useTodaySessionsViewModel = (currentUser: User) => {
  const todaySessionsQuery = useApiQuery<SessionSummaryDTO[]>({
    queryKey: [...queryKeys.sessions.lists(), 'today', currentUser.id] as const,
    queryFn: async () => sessionService.getTodaySessions()
  });

  return {
    sessions: todaySessionsQuery.data?.data ?? [],
    isLoading: todaySessionsQuery.isPending,
    error: todaySessionsQuery.error?.message ?? null
  };
};
