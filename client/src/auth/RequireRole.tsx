import { Navigate } from 'react-router-dom';
import { getUser } from './authStore';
import type { UserRole } from './authTypes';

export function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const user = getUser<{ role?: UserRole }>();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
