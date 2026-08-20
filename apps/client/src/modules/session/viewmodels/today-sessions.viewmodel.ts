import { SessionSummaryDTO, User } from '@halaqa/shared';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryKeys } from '@/lib/query-client';
import { sessionService } from '../services/session.service';

export const useTodaySessionsViewModel = (currentUser: User) => {
  const todaySessionsQuery = useApiQuery<SessionSummaryDTO[]>({
    queryKey: queryKeys.sessions.today(currentUser.id),
    queryFn: async () => sessionService.getTodaySessions(),
  });

  const missedSessionsQuery = useApiQuery<SessionSummaryDTO[]>({
    queryKey: queryKeys.sessions.missed(currentUser.id),
    queryFn: async () => sessionService.getMissedSessions(),
  });

  return {
    sessions: todaySessionsQuery.data?.data ?? [],
    isLoading: todaySessionsQuery.isPending,
    error: todaySessionsQuery.error?.message ?? null,
    missedSessions: missedSessionsQuery.data?.data ?? [],
    isMissedLoading: missedSessionsQuery.isPending,
    missedError: missedSessionsQuery.error?.message ?? null,
  };
};
