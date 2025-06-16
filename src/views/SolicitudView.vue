<template>
  <v-container fluid>
    <v-card ref="caseCard" elevation="2" class="mx-auto" max-width="800">
      <!-- Header -->
      <v-card-title class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between">
        <div class="d-flex flex-column">
          <div class="d-flex align-center">
            <h2 class="mb-0 mr-2">CASO #{{ solicitud.id }}</h2>
            <!-- Estado -->
            <v-chip
              :color="colorEstado"
              dark
              small
              class="mr-2"
            >
              {{ solicitud.estado }}
            </v-chip>
            <!-- Prioridad -->
            <v-chip
              :color="prioridadColor"
              dark
              small
            >
              {{ solicitud.prioridad_nombre || '—' }}
            </v-chip>
          </div>
          <small class="text--secondary">
            <strong>(N° {{ solicitud.numero_solicitud || '—' }}) — Creado:</strong>
            {{ solicitud.fecha_creacion }}
          </small>
        </div>
        <div class="mt-2 mt-md-0">
          <v-btn icon color="secondary" class="mr-2" @click="exportarPdf">
            <v-icon>mdi-printer</v-icon>
          </v-btn>
          <v-btn icon color="primary" @click="editarSolicitud">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <!-- Información del Caso -->
        <v-sheet elevation="1" rounded="lg" class="pa-4 mb-4">
          <h5 class="text-subtitle-1 font-weight-bold mb-4">Información del Caso</h5>
          <v-row dense>
            <v-col cols="12" sm="6">
              <strong>Creado por:</strong><br />{{ solicitud.creador }}
            </v-col>
            <v-col cols="12" sm="6">
              <strong>Perito Asignado:</strong><br />{{ solicitud.asignado || '—' }}
            </v-col>
            <v-col cols="12" sm="6">
              <strong>Dependencia:</strong><br />{{ solicitud.dependencia || '—' }}
            </v-col>
            <v-col cols="12" sm="6">
              <strong>Tipo de Solicitud:</strong><br />{{ solicitud.tipo || '—' }}
            </v-col>
            <v-col cols="12" sm="6">
              <strong>Organismo Judicial:</strong><br />{{ solicitud.interviniente || '—' }}
            </v-col>
            <v-col cols="12" sm="6">
              <strong>Acceso a evidencia:</strong><br />
              <span v-if="solicitud.enlace_axon">
                <a :href="solicitud.enlace_axon" target="_blank">{{ solicitud.enlace_axon }}</a>
                <v-icon small class="ml-1">mdi-open-in-new</v-icon>
              </span>
              <span v-else>—</span>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div>
            <strong class="font-weight-bold">Evidencia Solicitada</strong><br />
            <template v-if="mediosNombres.length">
              <v-chip
                v-for="(m, i) in mediosNombres"
                :key="i"
                small
                outlined
                class="ma-1"
              >
                {{ m }}
              </v-chip>
            </template>
            <span v-else>—</span>
          </div>
        </v-sheet>

        <!-- Comentarios -->
        <v-sheet elevation="1" rounded="lg" class="pa-4">
          <h5 class="text-subtitle-1 font-weight-bold mb-4">
            Comentarios ({{ comentarios.length }})
          </h5>
          <v-timeline dense>
            <v-timeline-item
              v-for="(c, i) in comentarios"
              :key="i"
              small
            >
              <template #icon>
                <v-avatar size="32">
                  <v-img :src="`https://i.pravatar.cc/64?u=${encodeURIComponent(c.usuario)}`" />
                </v-avatar>
              </template>
              <v-card class="pa-2 elevation-1 mb-2">
                <div class="font-weight-medium">{{ c.usuario }}</div>
                <div>{{ c.texto }}</div>
                <small class="grey--text">{{ c.fecha }} {{ c.hora }}</small>
              </v-card>
            </v-timeline-item>
            <div v-if="!comentarios.length" class="text-center grey--text mt-4">
              No hay comentarios.
            </div>
          </v-timeline>
        </v-sheet>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import api from '@/services/api'
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.js'

export default {
  name: 'SolicitudView',
  data() {
    return {
      solicitud: {
        id: null,
        numero_solicitud: '',
        fecha_creacion: '',
        estado: '',
        prioridad_nombre: '',
        prioridad_color: '',
        creador: '',
        asignado: '',
        dependencia: '',
        tipo: '',
        interviniente: '',
        enlace_axon: '',
        medios: []
      },
      mediosOptions: [],
      comentarios: []
    }
  },
  computed: {
    colorEstado() {
      switch (this.solicitud.estado) {
        case 'PENDIENTE': return 'red'
        case 'EN CURSO':  return 'yellow darken-2'
        case 'FINALIZADO':return 'green'
        default:          return 'grey'
      }
    },
    prioridadColor() {
      return this.solicitud.prioridad_color || 'grey'
    },
    mediosNombres() {
      return this.solicitud.medios
        .map(id => this.mediosOptions.find(x => x.id === id)?.nombre)
        .filter(Boolean)
    }
  },
  async mounted() {
    await this.fetchSolicitud()
    await this.fetchMediosCatalog()
    await this.fetchComentarios()
  },
  methods: {
    async fetchSolicitud() {
      const { data } = await api.get(`/solicitudes/${this.$route.params.id}`)
      this.solicitud = {
        ...data,
        fecha_creacion: new Date(data.fecha_creacion)
          .toLocaleString('es-AR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          }),
        medios: Array.isArray(data.medios) ? data.medios : [],
        prioridad_nombre: data.prioridad_nombre,
        prioridad_color: data.prioridad_color
      }
    },
    async fetchMediosCatalog() {
      const { data } = await api.get('/medios')
      this.mediosOptions = data
    },
    async fetchComentarios() {
      const { data } = await api.get(`/comentarios/${this.$route.params.id}`)
      this.comentarios = data.map(c => ({
        usuario: c.usuario,
        texto:   c.comentario,
        fecha:   new Date(c.fecha_creacion).toLocaleDateString('es-AR'),
        hora:    new Date(c.fecha_creacion)
                   .toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      }))
    },
    editarSolicitud() {
      this.$router.push({ name: 'SolicitudDetalle', params: { id: this.solicitud.id } })
    },
    exportarPdf() {
      const el = this.$refs.caseCard?.$el || this.$refs.caseCard
      if (!el) return console.error('ref caseCard no encontrado')
      html2pdf()
        .set({ margin:0.5, filename:`Caso_${this.solicitud.id}.pdf`, image:{type:'jpeg',quality:0.98}, html2canvas:{scale:2}, jsPDF:{unit:'in',format:'letter',orientation:'portrait'} })
        .from(el)
        .toPdf()
        .output('dataurlnewwindow')
    }
  }
}
</script>

<style scoped>
.v-card-title h2 { margin: 0; display: flex; align-items: center; }
.v-card-title small { margin-left: 8px; }
</style>
