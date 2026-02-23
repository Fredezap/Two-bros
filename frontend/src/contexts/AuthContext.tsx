import { createContext, useContext, useState, useEffect } from 'react';
import { useUserStore } from '../stores/useUserStore';
import * as authApi from '../services/api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const { setUser: setUserStore, clearUser } = useUserStore();
  const [token, setToken] = useState(null); // No usar localStorage
  const [loading, setLoading] = useState(true);

  // Sincronizar usuario persistente al iniciar
  useEffect(() => {
    const storedUser = useUserStore.getState().user;
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
      return;
    }
    // Solo intentar obtener el perfil si hay cookie/token
    if (typeof document !== 'undefined' && document.cookie && document.cookie.includes('token')) {
      authApi.getProfile()
        .then(res => {
          setUser(res.data);
          setUserStore(res.data);
        })
        .catch(() => {
          setUser(null);
          clearUser();
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      clearUser();
      setLoading(false);
    }
  }, []);

  const login = async (data) => {
    const res = await authApi.login(data);
    console.log('LOGIN RESPONSE FRONTEND:', res.data);
    setUser(res.data.user || null);
    setUserStore(res.data.user || null);
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setToken(null);
    clearUser();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
