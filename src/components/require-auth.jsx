import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { PageSpinner } from '@/components/page-spinner';

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
