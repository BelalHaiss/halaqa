import { Session } from '@halaqa/shared';
import { useState } from 'react';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { queryClient, queryKeys } from '@/lib/query-client';
import { sessionService } from '../services/session.service';

export const useSessionsViewModel = (groupId: string) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sessionsQuery = useApiQuery<Session[]>({
    queryKey: queryKeys.sessions.list({ groupId }),
    enabled: Boolean(groupId),
    queryFn: async () => {
      const response = await sessionService.getSessionsByGroupId(groupId);
      const sessions = response.data;

      const sortedSessions = [...sessions].sort((a, b) =>
        b.startedAt.localeCompare(a.startedAt)
      );

      return {
        success: true,
        data: sortedSessions
      };
    }
  });

  const sessions = sessionsQuery.data?.data ?? [];

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery) {
      return true;
    }

    const query = searchQuery.toLowerCase();
    return (
      session.startedAt.toLowerCase().includes(query) ||
      session.notes?.toLowerCase().includes(query) ||
      session.status.toLowerCase().includes(query)
    );
  });

  const pastSessions = filteredSessions.filter(
    (session) =>
      session.status === 'COMPLETED' ||
      session.status === 'CANCELED' ||
      session.status === 'MISSED'
  );

  return {
    sessions: pastSessions,
    allSessions: filteredSessions,
    isLoading: sessionsQuery.isPending,
    isRefreshing: sessionsQuery.isFetching,
    error: sessionsQuery.error?.message ?? null,
    searchQuery,
    setSearchQuery,
    refreshSessions: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.list({ groupId })
      })
  };
};
