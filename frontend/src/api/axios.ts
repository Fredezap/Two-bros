import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
  withCredentials: true,
})

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL),

// No agregar Authorization, solo cookies

api.interceptors.response.use(
  res => res,
  err => {
    // Normalize errors
    return Promise.reject(err)
  }
)

export default api
