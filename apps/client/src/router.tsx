import { Navigate, createBrowserRouter } from 'react-router-dom';
import { LoginView } from '@/modules/auth';
import { GroupsView, GroupDetailsView } from '@/modules/groups';
import { TodaySessionsView, SessionDetailsView, SessionHistoryView } from '@/modules/session';
import { UsersView, UserProfileView } from '@/modules/users';
import { LearnersView } from '@/modules/learners';
import { PaymentsView } from '@/modules/payments';
import { GroupReportView } from '@/modules/reports';
import { RouteErrorElement } from '@/modules/observability';
import { ProtectedLayout } from '@/components/ProtectedLayout';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginView />,
    errorElement: <RouteErrorElement />,
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        index: true,
        element: <GroupsView />,
      },
      {
        path: 'groups',
        element: <GroupsView />,
      },
      {
        path: 'groups/:id',
        element: <GroupDetailsView />,
      },
      {
        path: 'sessions',
        element: <TodaySessionsView />,
      },
      {
        path: 'sessions/history',
        element: <SessionHistoryView />,
      },
      {
        path: 'sessions/:id',
        element: <SessionDetailsView />,
      },
      {
        path: 'users',
        element: <UsersView />,
      },
      {
        path: 'learners',
        element: <LearnersView />,
      },
      {
        path: 'payments',
        element: <PaymentsView />,
      },
      {
        path: 'reports',
        element: <GroupReportView />,
      },
      {
        path: 'profile',
        element: <UserProfileView />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/' replace />,
  },
]);
