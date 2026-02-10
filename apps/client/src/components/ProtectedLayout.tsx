import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/Layout';

export function ProtectedLayout() {
  const { user, logout } = useApp();

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return (
    <Layout user={user} onLogout={logout}>
      <Outlet />
    </Layout>
  );
}
