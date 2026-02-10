import { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@halaqa/shared';
import { useApp } from '@/contexts/AppContext';

export function withRole<P extends object>(
  Component: ComponentType<P>,
  allowedRoles: Array<UserRole>
) {
  return function ProtectedComponent(props: P) {
    const { user } = useApp();

    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to='/' replace />;
    }

    return <Component {...props} />;
  };
}
