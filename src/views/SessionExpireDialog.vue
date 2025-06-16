<template>
  <v-dialog v-model="visible" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">Sesión expirada</v-card-title>
      <v-card-text>
        Tu sesión expiró.
        ¿Querés renovarla
        <div class="mt-4">Cierra sesión en {{ countdown }} s si no hacés nada.</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn text @click="logout">Cerrar sesión</v-btn>
        <v-btn color="primary" @click="renew">Renovar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const visible  = ref(false)
const countdown = ref(10)
let timer = null

// Monitorea cuando el store activa el diálogo
watch(() => auth.showSessionExpired, (newVal) => {
  if (newVal) {
    visible.value = true
    countdown.value = 10
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        logout()
      }
    }, 1000)
  } else {
    visible.value = false
  }
})

onUnmounted(() => {
  clearInterval(timer)
})

function renew() {
  clearInterval(timer)
  auth.renewSession()
}

function logout() {
  clearInterval(timer)
  auth.logout()
}
</script>
