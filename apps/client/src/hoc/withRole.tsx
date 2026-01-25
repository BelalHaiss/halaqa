import { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../App';

interface WithRoleProps {
  user: User;
}

export function withRole<P extends WithRoleProps>(
  Component: ComponentType<P>,
  allowedRoles: Array<'admin' | 'moderator' | 'tutor'>
) {
  return function ProtectedComponent(props: P) {
    const { user } = props;

    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }

    return <Component {...props} />;
  };
}
