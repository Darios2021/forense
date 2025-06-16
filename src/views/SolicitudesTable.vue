<template>
  <v-container class="mx-auto" style="max-width: 1700px; min-height: 80vh;">
    <v-card flat>
      <!-- ­­­­­­­­­Título + buscador -->
      <v-card-title class="align-center">
        <span class="text-h6">Solicitudes</span>
        <v-spacer />
        <v-text-field
          v-model="search"
          label="Buscar Solicitud"
          append-inner-icon="mdi-magnify"
          hide-details
          density="compact"
          variant="outlined"
          class="ml-0"
          style="width: 450px;"
        />
      </v-card-title>

      <!-- filtros -->
      <v-card-text>
        <v-row dense align="center" class="mt-3">
          <v-col cols="auto">
            <v-autocomplete
              v-model="selectedEstado"
              :items="estados"
              label="Estado"
              clearable
              hide-details
              variant="outlined"
              class="filter-select"
              style="width: 150px; height: 36px;"
              item-height="36"
              density="compact"
            />
          </v-col>
          <v-col cols="auto">
            <v-autocomplete
              v-model="selectedUsuario"
              :items="usuarios"
              label="Creado por"
              clearable
              hide-details
              variant="outlined"
              class="filter-select"
              style="width: 150px; height: 36px;"
              item-height="36"
              density="compact"
            />
          </v-col>
          <v-col cols="auto">
            <v-autocomplete
              v-model="selectedDependencia"
              :items="dependencias"
              label="Dependencia"
              clearable
              hide-details
              variant="outlined"
              class="filter-select"
              style="width: 150px; height: 36px;"
              item-height="36"
              density="compact"
            />
          </v-col>
          <v-col cols="auto">
            <v-autocomplete
              v-model="selectedInterviniente"
              :items="intervinientes"
              label="Interviniente"
              clearable
              hide-details
              variant="outlined"
              class="filter-select"
              style="width: 150px; height: 36px;"
              item-height="36"
              density="compact"
            />
          </v-col>
          <!-- 🔥 nuevo filtro Prioridad -->
          <v-col cols="auto">
            <v-autocomplete
              v-model="selectedPrioridad"
              :items="prioridades"
              label="Prioridad"
              clearable
              hide-details
              variant="outlined"
              class="filter-select"
              style="width: 150px; height: 36px;"
              item-height="36"
              density="compact"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- tabla -->
      <div class="table-responsive">
        <v-data-table
          :headers="headers"
          :items="filtered"
          :search="search"
          :items-per-page="15"
          :loading="loading"
          loading-text="Cargando solicitudes..."
          class="elevation-1 bordered-table"
          density="compact"
        >
          <!-- columnas personalizadas -->
          <template #item.numero_solicitud="{ item }">
            {{ item.numero_solicitud || '—' }}
          </template>

          <template #item.fecha_creacion="{ item }">
            {{ formatFecha(item.fecha_creacion) }}
          </template>

          <template #item.creador="{ item }">
            {{ item.creador || '—' }}
          </template>

          <template #item.asignado="{ item }">
            {{ item.asignado || '—' }}
          </template>

          <template #item.estado="{ item }">
            <v-chip small :color="estadoColor(item.estado)" dark>
              {{ item.estado }}
            </v-chip>
          </template>

          <template #item.prioridad_nombre="{ item }">
            <v-chip small :color="item.prioridad_color || 'grey'" dark>
              {{ item.prioridad_nombre || '—' }}
            </v-chip>
          </template>

          <template #item.acciones="{ item }">
            <v-btn icon size="x-small" color="primary" @click="ver(item)" class="me-2">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn icon size="x-small" color="warning" @click="editar(item)" class="me-2">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="x-small" color="error" @click="borrar(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router  = useRouter()
const search  = ref('')
const loading = ref(false)
const solicitudes = ref([])

// filtros
const estados               = ['PENDIENTE', 'EN CURSO', 'FINALIZADO']
const selectedEstado        = ref(null)
const selectedUsuario       = ref(null)
const selectedDependencia   = ref(null)
const selectedInterviniente = ref(null)
const selectedPrioridad     = ref(null)      // ⭐ nuevo filtro

// listas dinámicas
const usuarios = computed(() =>
  [...new Set(solicitudes.value.map(s => s.creador).filter(Boolean))]
)
const dependencias = computed(() =>
  [...new Set(solicitudes.value.map(s => s.dependencia).filter(Boolean))]
)
const intervinientes = computed(() =>
  [...new Set(solicitudes.value.map(s => s.interviniente).filter(Boolean))]
)
const prioridades = computed(() =>
  [...new Set(solicitudes.value.map(s => s.prioridad_nombre).filter(Boolean))]
)

// headers
const headers = [
  { title: 'N° Solicitud',   value: 'numero_solicitud' },
  { title: 'Fecha Creación', value: 'fecha_creacion' },
  { title: 'Creado por',     value: 'creador' },
  { title: 'Asignado a',     value: 'asignado' },
  { title: 'Dependencia',    value: 'dependencia' },
  { title: 'Interviniente',  value: 'interviniente' },
  { title: 'Estado',         value: 'estado', align: 'center' },
  { title: 'Prioridad',      value: 'prioridad_nombre', align: 'center' },
  { title: 'Acciones',       value: 'acciones', sortable: false, align: 'end' }
]

/* === filtros + búsqueda === */
const filtered = computed(() => {
  let lista = solicitudes.value

  if (selectedEstado.value)
    lista = lista.filter(s => s.estado === selectedEstado.value)
  if (selectedUsuario.value)
    lista = lista.filter(s => s.creador === selectedUsuario.value)
  if (selectedDependencia.value)
    lista = lista.filter(s => s.dependencia === selectedDependencia.value)
  if (selectedInterviniente.value)
    lista = lista.filter(s => s.interviniente === selectedInterviniente.value)
  if (selectedPrioridad.value)
    lista = lista.filter(s => s.prioridad_nombre === selectedPrioridad.value)

  const q = search.value.toLowerCase().trim()
  if (q) {
    lista = lista.filter(s =>
      Object.values(s).some(v => String(v).toLowerCase().includes(q))
    )
  }

  return lista
})

/* === utilidades === */
const formatFecha = d =>
  d
    ? new Date(d).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''

const estadoColor = e => {
  if (e === 'PENDIENTE')  return 'red'
  if (e === 'EN CURSO')   return 'yellow'
  if (e === 'FINALIZADO') return 'green'
  return 'grey'
}

/* === peticiones === */
async function fetchSolicitudes() {
  loading.value = true
  try {
    const { data } = await api.getSolicitudes()
    solicitudes.value = data
  } catch (e) {
    console.error('Error cargando solicitudes:', e)
  } finally {
    loading.value = false
  }
}

/* === acciones CRUD === */
function ver(item)    { router.push(`/solicitudes/ver/${item.id}`) }
function editar(item) { router.push(`/solicitud/${item.id}`) }
function borrar(item) {
  if (confirm('¿Eliminar esta solicitud?')) {
    api.delete(`/solicitudes/${item.id}`)
      .then(fetchSolicitudes)
      .catch(err => console.error('Error borrando:', err))
  }
}

onMounted(fetchSolicitudes)
</script>

<style scoped>
.bordered-table {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}
.bordered-table .v-data-table__wrapper {
  border-top: 1px solid #ccc;
}
.bordered-table .v-data-table__tr {
  border-bottom: 1px solid #eee;
}
.table-responsive {
  overflow-x: auto;
}
:deep(.bordered-table table) {
  table-layout: auto;
  width: auto;
}
:deep(.bordered-table th),
:deep(.bordered-table td) {
  white-space: nowrap;
}
/* 7-Estado, 8-Prioridad, 9-Acciones */
:deep(.bordered-table th:nth-child(7)),
:deep(.bordered-table td:nth-child(7)) { min-width: 200px; }
:deep(.bordered-table th:nth-child(8)),
:deep(.bordered-table td:nth-child(8)) { min-width: 150px; }
:deep(.bordered-table th:nth-child(9)),
:deep(.bordered-table td:nth-child(9)) { min-width: 180px; }
</style>
