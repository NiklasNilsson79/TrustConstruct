import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from './authStore';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
