import { createBrowserRouter } from 'react-router-dom';
import { LoginView } from '@/modules/auth';
import { DashboardView } from '@/modules/dashboard';
import { GroupsView, GroupDetailsView } from '@/modules/groups';
import { SessionsView } from '@/modules/sessions';
import { AttendanceView } from '@/modules/attendance';
import { UsersView } from '@/modules/users';
import { ProtectedLayout } from '@/components/ProtectedLayout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginView onLoginSuccess={() => window.location.reload()} />
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <DashboardView />
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
        element: <SessionsView />
      },
      {
        path: 'attendance/:sessionId',
        element: <AttendanceView />
      },
      {
        path: 'users',
        element: <UsersView />
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
