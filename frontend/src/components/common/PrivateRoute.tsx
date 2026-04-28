
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../stores/routes';

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) {
      window.location.replace(ROUTES.HOME);
    }
  }, [user, loading]);
  if (loading) return null;
  if (!user) {
    return null;
  }
  return children;
}
