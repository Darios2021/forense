// src/services/api.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Si existe la variable de entorno la usamos, 
// sino forzamos la URL de tu backend en CapRover:
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://forense-backend.cingulado.org',
})

// Inyectar token en cada request
api.interceptors.request.use(config => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

// Manejar 403 → mostrar diálogo y encolar petición
api.interceptors.response.use(
  response => response,
  error => {
    const { config, response } = error
    if (response?.status === 403 && !config._retry) {
      config._retry = true
      const auth = useAuthStore()
      auth.triggerSessionExpired()
      return new Promise((resolve, reject) => {
        auth.addPendingRequest({ resolve, reject, config })
      })
    }
    return Promise.reject(error)
  }
)

// — Dashboard —
api.getDashboard       = () => api.get('/api/dashboard')
api.getMisSolicitudes  = () => api.get('/api/dashboard/mis-solicitudes')
api.getStats           = () => api.get('/api/stats')

// — Solicitudes —
api.getSolicitudes     = () => api.get('/api/solicitudes')
api.getTecnicos        = () => api.get('/api/tecnicos')

// — Notificaciones —
api.getNotificaciones      = () => api.get('/api/notificaciones')
api.markNotificacionRead   = id => api.patch(`/api/notificaciones/${id}`)

// — Autenticación —
api.login = creds => api.post('/api/auth/login', creds)

export default api
