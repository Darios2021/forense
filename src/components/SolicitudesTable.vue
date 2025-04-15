<template>
    <v-container>
      <v-card>
        <v-card-title>📋 Solicitudes registradas</v-card-title>
        <v-data-table
          :headers="headers"
          :items="solicitudes"
          :loading="loading"
          class="elevation-1"
          loading-text="Cargando solicitudes..."
        >
          <template v-slot:item.fecha_ingreso="{ item }">
            {{ formatFecha(item.fecha_ingreso) }}
          </template>
          <template v-slot:item.acciones="{ item }">
            <v-btn size="small" color="primary" @click="verMedios(item)">
              Ver medios
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
      
      <!-- MODAL DE MEDIOS -->
      <v-dialog v-model="modal" max-width="500">
        <v-card>
          <v-card-title class="text-h6">
            Medios de solicitud #{{ solicitudSeleccionada?.id }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" v-for="(valor, clave) in medios" :key="clave">
                <strong>{{ formatCampo(clave) }}:</strong>
                <span v-if="valor === 1" style="color: green">✅</span>
                <span v-else style="color: red">❌</span>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="modal = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  export default {
    name: 'SolicitudesTable',
    data() {
      return {
        loading: false,
        solicitudes: [],
        medios: {},
        modal: false,
        solicitudSeleccionada: null,
        headers: [
          { text: 'ID', value: 'id' },
          { text: 'N° Solicitud', value: 'numero_solicitud' },
          { text: 'Técnico', value: 'tecnico' },
          { text: 'Dependencia', value: 'dependencia' },
          { text: 'Tipo', value: 'tipo' },
          { text: 'Interviene', value: 'interviniente' },
          { text: 'Ingreso', value: 'fecha_ingreso' },
          { text: 'Acciones', value: 'acciones', sortable: false }
        ],
      }
    },
    methods: {
      async fetchSolicitudes() {
        this.loading = true
        try {
          const res = await fetch('http://localhost:3001/api/solicitudes')
          const data = await res.json()
          this.solicitudes = data
        } catch (error) {
          console.error('Error cargando solicitudes:', error)
        } finally {
          this.loading = false
        }
      },
      formatFecha(fecha) {
        return fecha ? new Date(fecha).toLocaleDateString('es-AR') : ''
      },
      formatCampo(campo) {
        const map = {
          video: 'Video',
          milestone: 'Milestone',
          carta: 'Carta',
          audio: 'Audio',
          briefcam: 'BriefCam',
          info_civil: 'Info. Civil',
          lpr: 'LPR',
          inst_cam: 'Inst. Cam'
        }
        return map[campo] || campo
      },
      async verMedios(solicitud) {
        this.solicitudSeleccionada = solicitud
        try {
          const res = await fetch(`http://localhost:3001/api/medios/${solicitud.id}`)
          this.medios = await res.json()
          this.modal = true
        } catch (error) {
          console.error('Error al cargar medios:', error)
          this.medios = {}
          this.modal = false
        }
      }
    },
    mounted() {
      this.fetchSolicitudes()
    }
  }
  </script>
  