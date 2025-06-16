<template>
  <v-app>
    <!-- Diálogo de sesión expirada -->
    <SessionExpireDialog />

    <!-- App Bar -->
    <v-app-bar app dark color="primary" elevation="5" style="z-index:2000">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Sistema Forense</v-toolbar-title>
      <v-spacer />

      <!-- Íconos -->
      <v-btn icon><v-icon>mdi-magnify</v-icon></v-btn>
      <v-btn icon><v-icon>mdi-filter-variant</v-icon></v-btn>

      <!-- Notificaciones -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-badge
              :content="cantidadNotificaciones"
              color="red"
              v-if="cantidadNotificaciones > 0"
              overlap
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell-outline</v-icon>
          </v-btn>
        </template>
        <v-list class="mx-auto" max-width="350" dense>
          <v-list-item
            v-for="notif in notificaciones"
            :key="notif.id"
            @click="irASolicitud(notif.solicitud_id, notif.id)"
            style="cursor: pointer;"
          >
            <v-list-item-content>
              <v-list-item-title>{{ notif.mensaje }}</v-list-item-title>
              <v-list-item-subtitle class="grey--text text--darken-1 text-caption">
                {{ formatFecha(notif.fecha_creacion) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="!notificaciones.length">
            <v-list-item-title>Sin notificaciones nuevas</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Usuario + rol -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn text v-bind="props" class="text-no-wrap">
            <v-icon left>mdi-account-circle</v-icon>
            {{ usuario }}
            <small v-if="rol">({{ rol.toUpperCase() }})</small>
          </v-btn>
        </template>
        <v-list class="mx-auto" max-width="256" dense>
          <v-list-item to="/perfil" link>
            <template #prepend><v-icon>mdi-account</v-icon></template>
            <v-list-item-title>Perfil</v-list-item-title>
          </v-list-item>
          <v-list-item to="/cambiar-contrasenia" link>
            <template #prepend><v-icon>mdi-lock-reset</v-icon></template>
            <v-list-item-title>Cambiar Contraseña</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="logout">
            <template #prepend><v-icon>mdi-logout</v-icon></template>
            <v-list-item-title>Cerrar Sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      temporary
      absolute
      style="top: 64px; z-index:1500"
      width="260"
    >
      <v-list v-model:opened="drawerGroup" nav dense>
        <v-list-item link :to="{ name: 'SolicitudesTable' }" prepend-icon="mdi-table" title="Solicitudes" />
        <v-list-item link :to="{ name: 'NuevaSolicitud' }" prepend-icon="mdi-plus-box" title="Nueva Solicitud" />
        <v-list-item link :to="{ name: 'Dashboard' }" prepend-icon="mdi-chart-box" title="Dashboard" />
        <v-list-item link :to="{ name: 'Reportes' }" prepend-icon="mdi-chart-box-outline" title="Reportes" />

        <!-- Grupo parametrización -->
        <v-list-group value="Parametrizacion">
          <template #activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cog" title="Parametrización" />
          </template>
          <v-list-item link :to="{ name: 'TiposView' }" prepend-icon="mdi-format-list-bulleted" title="Tipos de Solicitud" />
          <v-list-item link :to="{ name: 'DependenciasView' }" prepend-icon="mdi-home-city" title="Dependencias" />
          <v-list-item link :to="{ name: 'UsuariosView' }" prepend-icon="mdi-account-group" title="Usuarios" />
          <v-list-item link :to="{ name: 'IntervinientesView' }" prepend-icon="mdi-account-switch" title="Intervinientes" />
          <v-list-item link :to="{ name: 'MediosView' }" prepend-icon="mdi-folder-multiple-image" title="Medios" />
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <!-- Contenido principal: ahora escuchamos recargar-notificaciones -->
    <v-main>
      <v-container fluid>
        <router-view @recargar-notificaciones="cargarNotificaciones" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter }    from 'vue-router'
import api              from '@/services/api'
import SessionExpireDialog from '@/views/SessionExpireDialog.vue'

const router                  = useRouter()
const drawer                  = ref(false)
const drawerGroup             = ref([])
const usuario                 = ref('Invitado')
const rol                     = ref('')
const notificaciones          = ref([])
const cantidadNotificaciones  = ref(0)

onMounted(() => {
  usuario.value = localStorage.getItem('nombre_usuario') || 'Invitado'
  rol.value     = (localStorage.getItem('rol') || '').toLowerCase()
  cargarNotificaciones()
})

async function cargarNotificaciones() {
  try {
    const { data } = await api.getNotificaciones()
    notificaciones.value        = data
    cantidadNotificaciones.value = data.length
  } catch (err) {
    console.error('Error al cargar notificaciones:', err)
  }
}

async function irASolicitud(solicitudId, notificacionId) {
  try {
    await api.markNotificacionRead(notificacionId)
    notificaciones.value        = notificaciones.value.filter(n => n.id !== notificacionId)
    cantidadNotificaciones.value = notificaciones.value.length
  } catch (e) {
    console.error('Error marcando notificación leída:', e)
  }
  router.push({ name: 'SolicitudDetalle', params: { id: solicitudId } })
}

function logout() {
  localStorage.clear()
  router.push('/login')
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString('es-AR', {
    year:   'numeric',
    month:  '2-digit',
    day:    '2-digit',
    hour:   '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.v-navigation-drawer {
  top: 64px;
}
</style>
