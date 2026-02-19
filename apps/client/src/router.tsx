import { createBrowserRouter } from 'react-router-dom';
import { LoginView } from '@/modules/auth';
import { GroupsView, GroupDetailsView } from '@/modules/groups';
import { AttendanceView } from '@/modules/attendance';
import { UsersView } from '@/modules/users';
import { LearnersView } from '@/modules/learners';
import { ProtectedLayout } from '@/components/ProtectedLayout';
import { ProfileView } from './modules/profile/views/ProfileView';
import { HistoryView } from './modules/history/views/HistoryView';

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
        path: 'attendance/:sessionId',
        element: <AttendanceView />
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
        path: 'profile', // ← Add profile route
        element: <ProfileView />
      },
      {
        path: 'history',
        element: <HistoryView />
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
