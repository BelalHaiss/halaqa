import { createBrowserRouter } from 'react-router-dom';
import { LoginView } from '@/modules/auth';
import { GroupsView, GroupDetailsView } from '@/modules/groups';
import {
  TodaySessionsView,
  SessionDetailsView,
  SessionHistoryView
} from '@/modules/session';
import { UsersView, UserProfileView } from '@/modules/users';
import { LearnersView } from '@/modules/learners';
import { ProtectedLayout } from '@/components/ProtectedLayout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginView />
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <GroupsView />
      },
      {
        path: 'groups',
        element: <GroupsView />
      },
      {
        path: 'groups/:id',
        element: <GroupDetailsView />
      },
      {
        path: 'sessions',
        element: <TodaySessionsView />
      },
      {
        path: 'sessions/history',
        element: <SessionHistoryView />
      },
      {
        path: 'sessions/:id',
        element: <SessionDetailsView />
      },
      {
        path: 'users',
        element: <UsersView />
      },
      {
        path: 'learners',
        element: <LearnersView />
      },
      {
        path: 'profile',
        element: <UserProfileView />
      }
    ]
  },
  {
    path: '*',
    lazy: async () => {
      const { Navigate } = await import('react-router-dom');
      return { Component: () => <Navigate to='/' replace /> };
    }
  }
]);
