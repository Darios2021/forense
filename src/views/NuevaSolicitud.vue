<template>
  <v-container class="mx-auto" style="max-width: 900px;">
    <v-card class="pa-6" elevation="3">
      <v-card-title class="text-h6">Creación de caso</v-card-title>
      <v-divider class="mb-4"></v-divider>

      <v-form
        ref="form"
        v-model="valid"
        @submit.prevent="enviarSolicitud"
        :validate-on-input="true"
      >
        <v-row dense>
          <!-- Fecha de Creación -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="fechaCreacion"
              label="Fecha de Creación"
              readonly
              variant="outlined"
              :rules="requiredRule"
              @focus="showGuide('fecha_creacion')"
            />
          </v-col>

          <!-- N° de Solicitud -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.numero_solicitud"
              variant="outlined"
              label="N° de Solicitud"
              :rules="requiredRule"
              @focus="showGuide('numero_solicitud')"
            />
          </v-col>

          <!-- Dependencia -->
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="form.dependencia_id"
              variant="outlined"
              :items="dependencias"
              item-title="nombre"
              item-value="id"
              label="Dependencia Interviniente"
              clearable
              :rules="requiredRule"
              @focus="showGuide('dependencia_id')"
            />
          </v-col>

          <!-- Tipo de Solicitud -->
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="form.tipo_solicitud_id"
              variant="outlined"
              :items="tipos"
              item-title="nombre"
              item-value="id"
              label="Tipo de Solicitud"
              clearable
              :rules="requiredRule"
              @focus="showGuide('tipo_solicitud_id')"
            />
          </v-col>

          <!-- Interviniente -->
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="form.interviniente_id"
              variant="outlined"
              :items="intervinientes"
              item-title="nombre"
              item-value="id"
              label="Interviniente"
              clearable
              :rules="requiredRule"
              @focus="showGuide('interviniente_id')"
            />
          </v-col>

          <!-- Asignar Perito -->
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="form.asignacion_id"
              variant="outlined"
              :items="tecnicos"
              item-title="nombre"
              item-value="id"
              label="Asignar Perito"
              clearable
              :rules="requiredRule"
              @focus="showGuide('asignacion_id')"
            />
          </v-col>

          <!-- Enlace AXON -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.enlace_axon"
              variant="outlined"
              label="Enlace AXON"
              :rules="[...requiredRule, urlRule]"
              clearable
              @focus="showGuide('enlace_axon')"
            >
              <template #append-inner>
                <v-btn icon size="small" @click="pasteFromClipboard">
                  <v-icon>mdi-content-paste</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>

          <!-- Medios -->
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="form.medios"
              :items="mediosOptions"
              item-title="nombre"
              item-value="id"
              label="Medios"
              variant="outlined"
              multiple
              clearable
              :rules="arrayRule"
              @focus="showGuide('medios')"
            />
          </v-col>

          <!-- Prioridad -->
          <v-col cols="12" md="6">
            <v-select
              v-model="form.prioridad_id"
              :items="prioridades"
              item-title="nombre"
              item-value="id"
              label="Prioridad"
              variant="outlined"
              dense
              clearable
              :rules="requiredRule"
              @focus="showGuide('prioridad_id')"
            />
          </v-col>

          <!-- Botón Registrar -->
          <v-col cols="12" class="text-right mt-4">
            <v-btn
              :disabled="!valid"
              color="success"
              type="submit"
              elevation="2"
            >
              Registrar
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <!-- Non-blocking Guidance Snackbar -->
      <v-snackbar
        v-model="guideSnackbar"
        :timeout="6000"
        top
        right
        multi-line
      >
        {{ guideText }}
        <template #action>
          <v-btn text @click="guideSnackbar = false">Cerrar</v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'NuevaSolicitud',
  data() {
    return {
      valid: false,
      fechaCreacion: '',
      form: {
        numero_solicitud:  '',
        dependencia_id:    null,
        tipo_solicitud_id: null,
        interviniente_id:  null,
        asignacion_id:     null,
        enlace_axon:       '',
        medios:            [],
        prioridad_id:      null
      },
      dependencias:   [],
      tipos:          [],
      intervinientes: [],
      tecnicos:       [],
      mediosOptions:  [],
      prioridades:    [],
      requiredRule:   [v => !!v || 'Este campo es obligatorio'],
      arrayRule:      [v => (v && v.length > 0) || 'Este campo es obligatorio'],
      guideSnackbar:  false,
      guideText:      ''
    }
  },
  methods: {
    urlRule(v) {
      return !v || /^https:\/\/.+/.test(v)
        ? true
        : 'La URL debe comenzar con https://'
    },
    showGuide(field) {
      const texts = {
        numero_solicitud: 'Verifica el número de solicitud que posee el oficio o solicitud',
        dependencia_id:   'Es la dependencia o comisaría que interviene en el caso',
        tipo_solicitud_id:'Si es legajo, Oficio, Sumario o Expediente',
        interviniente_id: 'Selecciona el interviniente responsable del caso',
        asignacion_id:    'Asigna el perito que trabajará efectivamente el caso',
        enlace_axon:      'El enlace será el vínculo de la evidencia que accederán el MPF',
        medios:           'Tipo de evidencia solicitada en el oficio o legajo',
        prioridad_id:     'Si tienes información de si tiene prioridad, defínela; si no, déjala MEDIA',
        fecha_creacion:   'La fecha y hora actual de creación de la solicitud'
      }
      this.guideText = texts[field] || ''
      this.guideSnackbar = true
    },
    async pasteFromClipboard() {
      try {
        this.form.enlace_axon = await navigator.clipboard.readText()
        this.$refs.form.validate()
      } catch {
        console.error('Error al leer portapapeles')
      }
    },
    async cargarListas() {
      try {
        const [rDep, rTip, rInt, rMed, rTec, rPri] = await Promise.all([
          api.get('/dependencias'),
          api.get('/listas/tipos'),
          api.get('/listas/intervinientes'),
          api.get('/medios'),
          api.get('/tecnicos'),
          api.get('/prioridades')
        ])
        this.dependencias   = rDep.data
        this.tipos          = rTip.data
        this.intervinientes = rInt.data
        this.mediosOptions  = rMed.data
        this.tecnicos       = rTec.data
        this.prioridades    = rPri.data
        const media = this.prioridades.find(p => p.nombre === 'MEDIA')
        this.form.prioridad_id = media ? media.id : null
      } catch (err) {
        console.error('❌ Error cargando catálogos:', err)
        this.$toast.error('No se pudieron cargar los desplegables')
      }
    },
    async enviarSolicitud() {
      if (!this.$refs.form.validate()) return

      try {
        const payload = { ...this.form }
        const { data } = await api.post('/solicitudes', payload)
        this.$toast.success(`✅ Solicitud creada (ID: ${data.id})`)
        setTimeout(() => {
          const router = this.$router || this.$root.$router || this.$.appContext.config.globalProperties.$router
          if (router) router.push({ name: 'SolicitudView', params: { id: data.id } })
        }, 300)
      } catch (err) {
        console.error('❌ Error al crear solicitud:', err)
        this.$toast.error(err.response?.data?.error || err.message)
      }
    }
  },
  created() {
    this.fechaCreacion = new Date().toLocaleString('es-AR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
    this.cargarListas()
  }
}
</script>

<style scoped>
/* estilos adicionales si los necesitás */
</style>
