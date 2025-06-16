<template>
  <v-container class="mx-auto" style="max-width: 900px;">
    <v-card class="pa-6" elevation="3">
      <!-- Título + Ver + Actualizar -->
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Detalles del Caso Nº{{ solicitud.id }}</span>
        <div>
          <v-btn small text color="primary" @click="verSolicitud">
            <v-icon left>mdi-eye</v-icon> Ver
          </v-btn>
          <v-btn
            small
            color="success"
            class="ml-2"
            :disabled="!valid"
            type="submit"
            @click="actualizarSolicitud"
          >
            <v-icon left>mdi-check</v-icon> Actualizar caso
          </v-btn>
        </div>
      </v-card-title>

      <v-form
        ref="form"
        v-model="valid"
        @submit.prevent="actualizarSolicitud"
        :validate-on-input="true"
      >
        <v-row>
          <!-- N° de Solicitud -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="solicitud.numero_solicitud"
              label="N° de Solicitud"
              :rules="requiredRule"
              required
            />
          </v-col>

          <!-- Fecha de Creación -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="solicitud.fecha_creacion"
              label="Fecha de Creación"
              readonly
              variant="outlined"
              :rules="requiredRule"
            />
          </v-col>

          <!-- Prioridad -->
          <v-col cols="12" sm="6">
            <v-select
              v-model="solicitud.prioridad_id"
              :items="prioridades"
              item-title="nombre"
              item-value="id"
              label="Prioridad"
              clearable
              :rules="requiredRule"
              required
            />
          </v-col>

          <!-- Asignar a Técnico -->
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="solicitud.asignacion_id"
              :items="tecnicos"
              item-title="nombre"
              item-value="id"
              label="Asignar a Técnico"
              clearable
              :rules="requiredRule"
              required
            />
          </v-col>

          <!-- Dependencia -->
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="solicitud.dependencia_id"
              :items="dependencias"
              item-title="nombre"
              item-value="id"
              label="Dependencia"
              clearable
              :rules="requiredRule"
              required
            />
          </v-col>

          <!-- Tipo de Solicitud -->
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="solicitud.tipo_solicitud_id"
              :items="tipos"
              item-title="nombre"
              item-value="id"
              label="Tipo de Solicitud"
              clearable
              :rules="requiredRule"
              required
            />
          </v-col>

          <!-- Interviniente -->
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="solicitud.interviniente_id"
              :items="intervinientes"
              item-title="nombre"
              item-value="id"
              label="Interviniente"
              clearable
              :rules="requiredRule"
              required
            />
          </v-col>

          <!-- Enlace AXON -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="solicitud.enlace_axon"
              label="Enlace AXON"
              :rules="[...requiredRule, urlRule]"
              clearable
              required
            >
              <template #append-inner>
                <v-btn icon small @click="pasteFromClipboard">
                  <v-icon>mdi-content-paste</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>

          <!-- Estado -->
          <v-col cols="12" sm="6">
            <v-select
              v-model="solicitud.estado"
              :items="estados"
              label="Estado"
              clearable
              :rules="requiredRule"
              required
            />
          </v-col>

          <!-- Medios múltiples -->
          <v-col cols="12">
            <v-select
              v-model="solicitud.medios"
              :items="mediosOptions"
              item-title="nombre"
              item-value="id"
              label="Medios disponibles"
              multiple
              chips
              clearable
              :rules="arrayRule"
              required
            />
          </v-col>
        </v-row>
      </v-form>

      <!-- Timeline de Novedades / Comentarios -->
      <v-divider class="my-6" />
      <v-card class="pa-4">
        <v-card-title class="text-h5">🗒️ Novedades sobre la Solicitud</v-card-title>
        <v-timeline dense>
          <v-timeline-item
            v-for="(c, i) in comentarios"
            :key="i"
            size="large"
          >
            <template #icon>
              <v-avatar size="40">
                <v-img
                  :src="`https://i.pravatar.cc/64?u=${encodeURIComponent(c.usuario)}`"
                  alt="avatar"
                />
              </v-avatar>
            </template>
            <template #opposite>
              {{ c.fecha }} - {{ c.hora }}
            </template>
            <v-card class="elevation-1 pa-2">
              <div class="font-weight-medium">{{ c.usuario }}</div>
              <div>{{ c.texto }}</div>
            </v-card>
          </v-timeline-item>
          <div v-if="!comentarios.length" class="text-center grey--text">
            No hay comentarios.
          </div>
        </v-timeline>

        <!-- Agregar nuevo comentario -->
        <v-card-actions class="px-0 pt-0">
          <v-form @submit.prevent="agregarComentario" class="w-100">
            <v-textarea
              v-model="nuevoComentario"
              placeholder="Escribir un comentario..."
              auto-grow
              variant="outlined"
              rounded="lg"
              rows="1"
              hide-details
              append-inner-icon="mdi-send"
              @click:append-inner="agregarComentario"
              @keyup.enter="agregarComentario"
            />
          </v-form>
        </v-card-actions>
      </v-card>
    </v-card>
  </v-container>
</template>

<script>
import api from '@/services/api'
import { useRouter } from 'vue-router'

export default {
  name: 'SolicitudDetalle',
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      valid: false,
      requiredRule: [v => !!v || 'Este campo es obligatorio'],
      arrayRule: [v => (v && v.length > 0) || 'Este campo es obligatorio'],
      solicitud: {
        id: null,
        numero_solicitud: '',
        prioridad_id: null,
        asignacion_id: null,
        dependencia_id: null,
        tipo_solicitud_id: null,
        interviniente_id: null,
        fecha_creacion: '',
        enlace_axon: '',
        estado: 'PENDIENTE',
        medios: []
      },
      estados: ['PENDIENTE', 'EN CURSO', 'FINALIZADO'],
      prioridades: [],
      tecnicos: [],
      dependencias: [],
      tipos: [],
      intervinientes: [],
      mediosOptions: [],
      comentarios: [],
      nuevoComentario: ''
    }
  },
  methods: {
    urlRule(v) {
      return !v || /^https:\/\/.+/.test(v)
        ? true
        : 'La URL debe comenzar con https://'
    },
    async pasteFromClipboard() {
      this.solicitud.enlace_axon = await navigator.clipboard.readText()
    },
    verSolicitud() {
      this.router.push({ name: 'SolicitudView', params: { id: this.solicitud.id } })
    },
    async cargarListas() {
      const [t, d, ty, i, m, pr] = await Promise.all([
        api.getTecnicos(),
        api.get('/dependencias'),
        api.get('/listas/tipos'),
        api.get('/listas/intervinientes'),
        api.get('/medios'),
        api.get('/prioridades')
      ])
      this.tecnicos = t.data
      this.dependencias = d.data
      this.tipos = ty.data
      this.intervinientes = i.data
      this.mediosOptions = m.data
      this.prioridades = pr.data
    },
    async obtenerSolicitud() {
      const { data } = await api.get(`/solicitudes/${this.$route.params.id}`)
      this.solicitud = {
        ...data,
        prioridad_id: data.prioridad_id,
        fecha_creacion: new Date(data.fecha_creacion).toLocaleString('es-AR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }),
        medios: Array.isArray(data.medios) ? data.medios : []
      }
    },
    async actualizarSolicitud() {
      if (!this.$refs.form.validate()) return
      await api.put(`/solicitudes/${this.solicitud.id}`, {
        prioridad_id: this.solicitud.prioridad_id,
        asignacion_id: this.solicitud.asignacion_id,
        dependencia_id: this.solicitud.dependencia_id,
        tipo_solicitud_id: this.solicitud.tipo_solicitud_id,
        interviniente_id: this.solicitud.interviniente_id,
        enlace_axon: this.solicitud.enlace_axon,
        estado: this.solicitud.estado,
        medios: this.solicitud.medios
      })
      this.$toast.success('✅ Caso actualizado')
      await this.obtenerSolicitud()
      await this.cargarComentarios()
    },
    async cargarComentarios() {
      const { data } = await api.get(`/comentarios/${this.solicitud.id}`)
      this.comentarios = data.map(c => ({
        usuario: c.usuario,
        texto: c.comentario,
        fecha: new Date(c.fecha_creacion).toLocaleDateString('es-AR'),
        hora: new Date(c.fecha_creacion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      }))
    },
    async agregarComentario() {
      if (!this.nuevoComentario.trim()) return
      await api.post(`/comentarios/${this.solicitud.id}`, {
        comentario: this.nuevoComentario.trim()
      })
      this.nuevoComentario = ''
      await this.cargarComentarios()
    }
  },
  async mounted() {
    await this.cargarListas()
    await this.obtenerSolicitud()
    await this.cargarComentarios()
  }
}
</script>

<style scoped>
.contenedor-tabla {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}
.tarjeta-tabla {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.v-data-table {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
