// TanStack Query configuration
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutes
    },
    mutations: {
      retry: false
    }
  }
});

/**
 * Centralized query keys for consistent cache management
 * Usage:
 * - In queries: queryKey: queryKeys.groups.list()
 * - In invalidations: invalidateQueries({ queryKey: queryKeys.groups.all })
 */
export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    validateToken: (token: string) =>
      [...queryKeys.auth.all, 'validate-token', token] as const
  },

  // Groups queries
  groups: {
    all: ['groups'] as const,
    lists: () => [...queryKeys.groups.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.groups.lists(), query] as const,
    details: () => [...queryKeys.groups.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const
  },

  // Sessions queries
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.sessions.lists(), query] as const,
    details: () => [...queryKeys.sessions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const
  },

  // Students queries
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.students.lists(), query] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const
  },

  // Users queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.users.lists(), query] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const
  },

  // Attendance queries
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...queryKeys.attendance.all, 'list'] as const,
    list: (sessionId: string) =>
      [...queryKeys.attendance.lists(), sessionId] as const
  },

  // Reports queries
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.reports.lists(), query] as const
  }
} as const;
