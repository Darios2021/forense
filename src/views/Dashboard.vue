<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" xl="8">
        <h2 class="mb-6">📊 Dashboard de Solicitudes</h2>

        <!-- KPIs + Eficiencia Semanal -->
        <v-row class="mb-6" justify="center">
          <v-col
            v-for="kpi in kpis"
            :key="kpi.label"
            cols="12"
            sm="3"
          >
            <v-card class="pa-4" outlined>
              <div class="d-flex justify-space-between align-center">
                <span>{{ kpi.label }}</span>
                <span class="text-h4 font-weight-bold">{{ kpi.value }}</span>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6">
            <v-card class="pa-4" outlined>
              <span class="mb-2">Eficiencia Semanal</span>
              <div class="eff-wrapper">
                <v-progress-linear
                  :value="effInfo.porcentaje"
                  :color="effInfo.color"
                  height="24"
                  rounded
                />
                <span class="eff-label">{{ effInfo.porcentaje }}%</span>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Gráficas -->
        <v-row class="mb-6" justify="center">
          <v-col cols="12" md="6">
            <v-card height="400px" class="pa-12">
              <h3 class="text-h6 mb-4">Solicitudes por Medio</h3>
              <Bar v-if="mediaData.labels.length" :data="mediaData" :options="chartOptions" />
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card height="400px" class="pa-12">
              <h3 class="text-h6 mb-4">Top 5 Técnicos</h3>
              <Bar v-if="techData.labels.length" :data="techData" :options="chartOptions" />
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-6" justify="center">
          <v-col cols="12" md="6">
            <v-card height="400px" class="pa-12">
              <h3 class="text-h6 mb-4">Top 5 Intervinientes</h3>
              <Bar v-if="interData.labels.length" :data="interData" :options="chartOptions" />
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card height="400px" class="pa-12 chart-card">
              <h3 class="text-h6 mb-4">Distribución por Estado</h3>
              <Pie v-if="pieData.labels.length" :data="pieData" :options="pieOptions" />
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabla solo tus solicitudes -->
        <v-card outlined>
    <v-data-table
      :headers="tableHeaders"
      :items="items"
      dense
      class="elevation-1"
    >
      <!-- Columna Estado -->
      <template #item.estado="{ item }">
        <v-chip :color="colorEstado(item.estado)" dark small>
          {{ item.estado }}
        </v-chip>
      </template>

      
      <!-- Columna Acciones -->
      <template #item.acciones="{ item }">
        <v-btn icon size="small" color="primary" @click="ver(item)" class="me-2">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn icon size="small" color="warning" @click="editar(item)" class="me-2">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="small" color="error" @click="borrar(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter }     from 'vue-router'
import api                from '@/services/api'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  BarElement, ArcElement,
  CategoryScale, LinearScale, PointElement
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Pie }     from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ChartDataLabels
)

const router = useRouter()

// Reactivos para KPIs y charts
const kpis      = ref([
  { label: 'Total Solicitudes',   value: 0 },
  { label: 'Solicitudes Propias', value: 0 }
])
const techData  = ref({ labels: [], datasets: [] })
const interData = ref({ labels: [], datasets: [] })
const mediaData = ref({ labels: [], datasets: [] })
const pieData   = ref({ labels: [], datasets: [] })
const items     = ref([])

// Eficiencia Semanal
const effInfo = ref({ porcentaje: 0, color: '' })

// Opciones de gráficos
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 10, bottom: 30 } },
  scales: {
    x: { ticks: { padding: 10, maxRotation: 45, minRotation: 45 } },
    y: { beginAtZero: true, ticks: { padding: 5 } }
  },
  plugins: {
    legend: { position: 'top' },
    datalabels: {
      color: '#ffffff',
      font: { weight: 'bold', size: 12 },
      anchor: 'end',
      align: 'start',
      formatter: v => v
    }
  }
}
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
    datalabels: {
      color: '#fff',
      formatter: v => v,
      anchor: 'center',
      align: 'center',
      font: { weight: 'bold' }
    }
  }
}

// Configuración de la tabla
const tableHeaders = [
{ title: 'N° Solicitud',   value: 'numero_solicitud' },
  { title: 'Fecha Creación', value: 'fecha_creacion' },
  { title: 'Creado por',     value: 'creador' },
  { title: 'Asignado a',     value: 'asignado' },
  { title: 'Dependencia',    value: 'dependencia' },
  { title: 'Interviniente',  value: 'interviniente' },
  { title: 'Prioridad',      value: 'prioridad_nombre', align: 'center' },
  { title: 'Estado',         value: 'estado',            align: 'center' },
  { title: 'Acciones',       value: 'acciones', sortable: false, align: 'end' }
]

const colorEstado = e => {
  if (e === 'PENDIENTE')  return 'red lighten-2'
  if (e === 'EN CURSO')   return 'yellow darken-2'
  if (e === 'FINALIZADO') return 'green darken-1'
  return 'grey'
}

// Funciones de acción
function ver(item) {
  router.push(`/solicitudes/ver/${item.id}`)
}
function editar(item) {
  router.push(`/solicitud/${item.id}`)
}
function borrar(item) {
  if (confirm('¿Eliminar esta solicitud?')) {
    api.delete(`/solicitudes/${item.id}`)
       .then(loadMyTable)
       .catch(err => console.error('Error borrando:', err))
  }
}

// Carga datos de Dashboard (KPIs y charts)
async function loadDashboard() {
  const { data: dash } = await api.getDashboard()
  kpis.value[0].value = dash.total
  kpis.value[1].value = dash.propias

  techData.value = {
    labels: dash.tech.labels,
    datasets: [{
      label: 'Solicitudes',
      data: dash.tech.datasets[0].data,
      backgroundColor: ['#4a67d6','#f8cb00','#e91e63','#00bcd4','#ff5722'],
      borderColor:     ['#3f51b5','#f1c40f','#c2185b','#0097a7','#e64a19'],
      borderWidth: 2
    }]
  }
}

// Carga datos de stats (pie, interv., medios)
async function loadStats() {
  const { data: stats } = await api.getStats()
  pieData.value = {
    labels: stats.porEstados.map(e => e.estado),
    datasets: [{
      label: 'Solicitudes',
      data: stats.porEstados.map(e => e.cantidad),
      backgroundColor: ['#FF6384','#FDB45C','#4BC0C0','#AAAAAA'],
      hoverOffset: 6
    }]
  }

  const topInter = [...stats.porInterviniente]
    .sort((a,b) => b.cantidad - a.cantidad)
    .slice(0,5)
  interData.value = {
    labels: topInter.map(i => i.interviniente),
    datasets: [{
      label: 'Solicitudes',
      data: topInter.map(i => i.cantidad),
      backgroundColor: ['#3f51b5','#9c27b0','#03a9f4','#8bc34a','#ff9800'],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  }

  const topMed = [...stats.porMedios]
    .sort((a,b) => b.cantidad - a.cantidad)
    .slice(0,5)
  mediaData.value = {
    labels: topMed.map(m => m.medio),
    datasets: [{
      label: 'Solicitudes',
      data: topMed.map(m => m.cantidad),
      backgroundColor: ['#4a67d6','#e91e63','#00bcd4','#8bc34a','#f8cb00'],
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  }

  // Calcular eficiencia semanal
  const totalPropias = kpis.value[1].value
  const hoy = new Date()
  const inicioAnio = new Date(hoy.getFullYear(),0,1)
  const semanas = Math.max(1, Math.ceil((hoy-inicioAnio)/(1000*60*60*24*7)))
  const ratio = Math.round(totalPropias / semanas) / 30
  const pct = Math.min(100, Math.round(ratio * 100))
  let color = 'red darken-2'
  if (ratio > 1)         color = 'green darken-2'
  else if (ratio >= .66) color = 'blue darken-2'
  else if (ratio >= .33) color = 'amber darken-2'
  effInfo.value = { porcentaje: pct, color }
}

// Carga solo mis solicitudes pendientes/en curso
async function loadMyTable() {
  const { data } = await api.getMisSolicitudes()
  items.value = data
}

onMounted(async () => {
  await loadDashboard()
  await loadStats()
  await loadMyTable()
})
</script>


<style scoped>
.eff-wrapper { position: relative; }
.eff-label {
  position: absolute;
  top: 0;
  right: 12px;
  height: 24px;
  line-height: 24px;
  font-weight: 600;
  color: rgba(0,0,0,0.8);
  pointer-events: none;
}
</style>
