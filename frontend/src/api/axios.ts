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

console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
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
      originalRequest._retry = true;
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
          const refreshResult = await refreshAccessToken();
          processQueue(null);
          return api(originalRequest);
        } catch (refreshError) {
          await logout();
          clearUserStorage();
          if (window.location.pathname !== '/login') {
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
