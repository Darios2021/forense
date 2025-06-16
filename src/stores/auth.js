// src/stores/auth.js
import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken:  localStorage.getItem('accessToken')  || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    showSessionExpired: false,
    pendingRequests: []  // Cola de { resolve, reject, config }
  }),
  actions: {
    triggerSessionExpired() {
      this.showSessionExpired = true
    },
    addPendingRequest(request) {
      this.pendingRequests.push(request)
    },
    async renewSession() {
      try {
        const { data } = await api.post('/auth/refresh', {
          refreshToken: this.refreshToken
        })
        // Actualizar token y ocultar diálogo
        this.accessToken = data.accessToken
        localStorage.setItem('accessToken', data.accessToken)
        this.showSessionExpired = false

        // Reintentar todas las peticiones pendientes
        this.pendingRequests.forEach(({ resolve, config }) => {
          config.headers.Authorization = `Bearer ${data.accessToken}`
          resolve(api(config))
        })
      } catch (error) {
        // Si falla el refresh, cerrar sesión
        this.logout()
      } finally {
        // Limpiar la cola
        this.pendingRequests = []
      }
    },
    logout() {
      // Limpiar estado y localStorage
      this.accessToken = ''
      this.refreshToken = ''
      localStorage.clear()
      this.showSessionExpired = false

      // Rechazar todas las peticiones pendientes
      this.pendingRequests.forEach(({ reject }) =>
        reject(new Error('Sesión cerrada'))
      )
      this.pendingRequests = []

      // Redirigir al login
      router.push('/login')
    }
  }
})
