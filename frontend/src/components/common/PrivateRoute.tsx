
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../stores/routes';

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) {
      console.warn('[PrivateRoute] Usuario no autenticado, redirigiendo a HOME');
      window.location.replace(ROUTES.HOME);
    }
  }, [user, loading]);
  if (loading) return null;
  if (!user) {
    console.warn('[PrivateRoute] Render: usuario no autenticado, no se muestra children');
    return null;
  }
  return children;
}
