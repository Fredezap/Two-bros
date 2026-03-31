import axios from 'axios'
import { refreshAccessToken, logout } from '../services/api/auth';

let isRefreshing = false;
let failedQueue: any[] = [];

// Elimina el usuario persistido en localStorage (zustand persist)
function clearUserStorage() {
  try {
    localStorage.removeItem('user-storage');
  } catch {}
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
  withCredentials: true,
})

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    // Si es 401 y no es el endpoint de refresh ni login
    if (err.response && err.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh') && !originalRequest.url.includes('/login')) {
      console.warn('[AXIOS] 401 detectado, intentando refresh...', originalRequest.url);
      originalRequest._retry = true;
      console.log('[AXIOS] document.cookie:', document.cookie);
        if (typeof document !== 'undefined') {
          // Siempre intentar refrescar, aunque la cookie sea httpOnly y no visible desde JS
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({resolve, reject});
          })
            .then(() => api(originalRequest))
            .catch(err => Promise.reject(err));
        }
        isRefreshing = true;
        try {
          console.log('[AXIOS] Llamando refreshAccessToken()');
          // DEBUG: Mostrar cookies antes de llamar al backend
          console.log('[AXIOS] Cookies antes de refresh:', document.cookie);
          const refreshResult = await refreshAccessToken();
          console.log('[AXIOS] Refresh exitoso, reintentando request original', refreshResult);
          processQueue(null);
          return api(originalRequest);
        } catch (refreshError) {
          console.error('[AXIOS] Error al refrescar token:', refreshError);
          // processQueue(refreshError, null);
          // await logout();
          // clearUserStorage();
          if (window.location.pathname !== '/login') {
            console.warn('[AXIOS] Redirigiendo a /login');
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api
