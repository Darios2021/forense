<template>
  <v-container class="mx-auto" style="max-width: 1700px; min-height: 80vh;">
    <v-card flat>
      <!-- Título -->
      <v-card-title class="align-center">
        <span class="text-h6">Reportes</span>
      </v-card-title>
      <v-card-text>
        <!-- Filtros -->
        <v-row align="center" dense>
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="desde"
              label="Desde"
              type="datetime-local"
              dense
              outlined
            />
          </v-col>
          <v-col cols="12" sm="5" md="4">
            <v-text-field
              v-model="hasta"
              label="Hasta"
              type="datetime-local"
              dense
              outlined
            />
          </v-col>
          <v-col cols="12" sm="2" md="4" class="d-flex">
            <v-btn
              color="primary"
              class="ma-1"
              @click="fetchReportes"
              :loading="loading"
            >
              Filtrar
            </v-btn>
            <v-btn
              color="secondary"
              class="ma-1"
              :disabled="!reportes.length || loading"
              @click="exportCSV"
            >
              Exportar CSV
            </v-btn>
          </v-col>
        </v-row>

        <!-- Alerta de error -->
        <v-alert v-if="error" type="error" dense text>
          {{ error }}
        </v-alert>

        <!-- Tabla resultados -->
        <div class="table-responsive">
          <v-data-table
            :headers="headers"
            :items="reportes"
            :loading="loading"
            loading-text="Cargando reportes..."
            class="elevation-1 bordered-table"
            density="compact"
          >
            <template #item.fecha_creacion="{ item }">
              {{ formatFecha(item.fecha_creacion) }}
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

// helper: parsear "YYYY-MM-DDTHH:mm" como hora local
function parseLocalDateTime(value) {
  const [date, time] = value.split('T')
  const [y, m, d]    = date.split('-').map(Number)
  const [h, min]     = time.split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}

// Variables reactivas
const desde    = ref('')
const hasta    = ref('')
const reportes = ref([])
const loading  = ref(false)
const error    = ref('')

// Columnas de la tabla (igual que SolicitudesTable)
const headers = [
  { title: 'N° Solicitud',    value: 'numero_solicitud' },
  { title: 'Creación',        value: 'fecha_creacion'    },
  { title: 'Creado por',      value: 'creador'           },
  { title: 'Asignado a',      value: 'asignado'          },
  { title: 'Dependencia',     value: 'dependencia'       },
  { title: 'Interviniente',   value: 'interviniente'     },
  { title: 'Estado',          value: 'estado', align: 'center' },
  { title: 'Prioridad',       value: 'prioridad_nombre', align: 'center' },
]

// Obtener y filtrar reportes usando el mismo endpoint de solicitudes
async function fetchReportes() {
  if (!desde.value || !hasta.value) return

  loading.value = true
  error.value   = ''

  try {
    // 1) traigo todo
    const { data } = await api.getSolicitudes()

    // 2) parseo límites como local
    const d0 = parseLocalDateTime(desde.value).getTime()
    const h0 = parseLocalDateTime(hasta.value).getTime()

    // 3) filtro por fecha_creacion
    reportes.value = data.filter(item => {
      const ms = new Date(item.fecha_creacion).getTime()
      return ms >= d0 && ms <= h0
    })
  } catch (e) {
    console.error('Error cargando reportes:', e)
    reportes.value = []
    error.value    = 'Error al cargar reportes'
  } finally {
    loading.value = false
  }
}

// Formatear fecha/hora al estilo SolicitudesTable
function formatFecha(d) {
  return d
    ? new Date(d).toLocaleString('es-AR', {
        year:   'numeric',
        month:  '2-digit',
        day:    '2-digit',
        hour:   '2-digit',
        minute: '2-digit'
      })
    : ''
}

// Exportar CSV
function exportCSV() {
  const rows = [
    headers.map(h => h.title),
    ...reportes.value.map(r => [
      r.numero_solicitud,
      formatFecha(r.fecha_creacion),
      r.creador,
      r.asignado,
      r.dependencia,
      r.interviniente,
      r.estado,
      r.prioridad_nombre
    ])
  ]
  const csv  = rows.map(r => r.join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href     = URL.createObjectURL(blob)
  link.download = `reportes_${desde.value}_${hasta.value}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
</script>

<style scoped>
.bordered-table {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}
.table-responsive {
  overflow-x: auto;
}
</style>
