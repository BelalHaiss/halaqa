import { useState, useEffect } from 'react';
import { Session } from '@halaqa/shared';
import { sessionService } from '../services/session.service';

export const useSessionsViewModel = (groupId: string) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      if (!groupId) return;

      setIsLoading(true);
      setError(null);

      const response = await sessionService.getSessionsByGroupId(groupId);

      if (response.success && response.data) {
        // Sort sessions by date descending (newest first)
        const sortedSessions = response.data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setSessions(sortedSessions);
      } else {
        setError(response.error || 'فشل في جلب الجلسات');
      }

      setIsLoading(false);
    };

    fetchSessions();
  }, [groupId]);

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      session.date.includes(query) ||
      session.time.includes(query) ||
      session.notes?.toLowerCase().includes(query) ||
      session.status.includes(query)
    );
  });

  // Get only past sessions (done or canceled)
  const pastSessions = filteredSessions.filter(
    (session) => session.status === 'COMPLETED' || session.status === 'CANCELED'
  );

  return {
    sessions: pastSessions,
    allSessions: filteredSessions,
    isLoading,
    error,
    searchQuery,
    setSearchQuery
  };
};
