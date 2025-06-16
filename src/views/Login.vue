<template>
  <div>
    <!-- Logo -->
    <v-img
      class="mx-auto my-6"
      max-width="100"
      src="@/assets/icon_login.png"
      alt="Logo"
    />

    <!-- Card principal -->
    <v-card
      class="mx-auto pa-12 pb-8"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <div class="text-h6 text-center mb-6">Informática Forense</div>

      <v-form ref="form">
        <!-- Usuario -->
        <v-text-field
          v-model="usuario"
          label="Usuario"
          variant="outlined"
          type="email"
          required
        />

        <!-- Contraseña + toggle -->
        <v-text-field
          v-model="password"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          variant="outlined"
          required
        />

        <!-- Mensaje de error -->
        <v-alert
          v-if="error"
          type="error"
          class="my-4"
          dense
          text
        >
          {{ error }}
        </v-alert>

        <!-- Botón Ingresar -->
        <v-btn
          class="mb-8"
          color="primary"
          size="large"
          variant="tonal"
          block
          :loading="loading"
          @click="submitLogin"
        >
          Ingresar
        </v-btn>
      </v-form>
    </v-card>

    <!-- Footer con logos -->
    <v-footer padless class="mt-6" height="80">
      <v-container class="d-flex justify-center align-center">
        <v-img
          src="@/assets/poli.png"
          alt="Logo Policía"
          contain
          max-height="60"
          class="mr-8"
        />
        <v-img
          src="@/assets/logo2.png"
          alt="Logo 2"
          contain
          max-height="60"
        />
      </v-container>
    </v-footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router       = useRouter()
const auth         = useAuthStore()

const usuario      = ref('')
const password     = ref('')
const showPassword = ref(false)
const loading      = ref(false)
const error        = ref('')

/**
 * Decodifica un JWT sin librerías.
 * @param {string} token 
 * @returns {object} payload JSON
 */
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json      = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return {}
  }
}

async function submitLogin() {
  error.value = ''
  if (!usuario.value || !password.value) {
    error.value = 'Completar usuario y contraseña'
    return
  }

  loading.value = true
  try {
    // 1) Login: obtener tokens
    const { data: loginData } = await api.post('/auth/login', {
      usuario: usuario.value,
      password: password.value
    })
    const { accessToken, refreshToken } = loginData

    // 2) Guardar tokens
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    auth.accessToken  = accessToken
    auth.refreshToken = refreshToken

    // 3) Decodificar el JWT para extraer nombre y rol
    const payload = decodeJWT(accessToken)
    const nombre  = payload.nombre   || usuario.value
    const rol     = payload.rol      || 'user'

    localStorage.setItem('nombre_usuario', nombre)
    localStorage.setItem('rol', rol.toLowerCase())

    // 4) Redirigir
    router.push('/dashboard')

  } catch (e) {
    console.error('❌ Login error', e)
    error.value = 'Usuario o contraseña incorrectos'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-footer {
  bottom: 0;
}
</style>
