// TanStack Query configuration
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
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
    validateToken: (token: string) => [...queryKeys.auth.all, 'validate-token', token] as const,
  },

  // Groups queries
  groups: {
    all: ['groups'] as const,
    lists: () => [...queryKeys.groups.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.groups.lists(), query] as const,
    options: () => [...queryKeys.groups.all, 'options'] as const,
    stats: (metric: 'groups-count' | 'learners-count' | 'tutors-count') =>
      [...queryKeys.groups.all, 'stats', metric] as const,
    tutors: () => [...queryKeys.groups.all, 'tutors'] as const,
    details: () => [...queryKeys.groups.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
  },

  // Sessions queries
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.sessions.lists(), query] as const,
    today: (userId: string) => [...queryKeys.sessions.lists(), 'today', userId] as const,
    details: () => [...queryKeys.sessions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
  },

  // Students queries
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.students.lists(), query] as const,
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
  },

  // Users queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.users.lists(), query] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Learners queries
  learners: {
    all: ['learners'] as const,
    lists: () => [...queryKeys.learners.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.learners.lists(), query] as const,
    details: () => [...queryKeys.learners.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.learners.details(), id] as const,
  },

  // Attendance queries
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...queryKeys.attendance.all, 'list'] as const,
    list: (sessionId: string) => [...queryKeys.attendance.lists(), sessionId] as const,
  },

  // Reports queries
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.reports.lists(), query] as const,
  },

  // Payments queries
  payments: {
    all: ['payments'] as const,
    learnerLists: () => [...queryKeys.payments.all, 'learner-list'] as const,
    learnerList: (query?: unknown) => [...queryKeys.payments.learnerLists(), query] as const,
    learnerDetails: () => [...queryKeys.payments.all, 'learner-detail'] as const,
    learnerDetail: (id: string) => [...queryKeys.payments.learnerDetails(), id] as const,
    tutorLists: () => [...queryKeys.payments.all, 'tutor-list'] as const,
    tutorList: (query?: unknown) => [...queryKeys.payments.tutorLists(), query] as const,
    tutorDetails: () => [...queryKeys.payments.all, 'tutor-detail'] as const,
    tutorDetail: (id: string) => [...queryKeys.payments.tutorDetails(), id] as const,
    tutorLatestAllowedDate: (tutorId: string) =>
      [...queryKeys.payments.all, 'tutor-latest-date', tutorId] as const,
    tutorPreview: (payload?: unknown) =>
      [...queryKeys.payments.all, 'tutor-preview', payload] as const,
  },

  // Transaction labels queries
  transactionLabels: {
    all: ['transaction-labels'] as const,
    lists: () => [...queryKeys.transactionLabels.all, 'list'] as const,
    list: (search?: string) => [...queryKeys.transactionLabels.lists(), search ?? ''] as const,
  },

  // Transactions queries
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (query?: unknown) => [...queryKeys.transactions.lists(), query] as const,
  },

  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    stats: (userId: string, role: string) =>
      [...queryKeys.dashboard.all, 'stats', userId, role] as const,
  },

  // Profile queries
  profile: {
    all: ['profile'] as const,
    me: () => [...queryKeys.profile.all, 'me'] as const,
  },
} as const;
