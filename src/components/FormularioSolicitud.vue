<template>
    <v-card class="pa-5 mb-5">
      <v-card-title>➕ Nueva Solicitud</v-card-title>
      <v-form @submit.prevent="enviarFormulario">
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="form.tecnico_id"
              :items="tecnicos"
              item-title="nombre"
              item-value="id"
              label="Técnico"
              required
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="form.dependencia_id"
              :items="dependencias"
              item-title="nombre"
              item-value="id"
              label="Dependencia"
              required
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="form.tipo_solicitud_id"
              :items="tipos"
              item-title="nombre"
              item-value="id"
              label="Tipo de Solicitud"
              required
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="form.interviniente_id"
              :items="intervinientes"
              item-title="nombre"
              item-value="id"
              label="Interviniente"
              required
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.numero_solicitud"
              label="N° de Solicitud"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.fecha_ingreso"
              label="Fecha de Ingreso"
              type="date"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.fecha_informe"
              label="Fecha de Informe"
              type="date"
            ></v-text-field>
          </v-col>
  
          <!-- Checkboxes para Medios -->
          <v-col cols="12">
            <v-divider class="my-4" />
            <v-card-subtitle class="pb-0">Medios disponibles</v-card-subtitle>
            <v-row>
              <v-col cols="6" sm="4" v-for="(label, key) in mediosLabels" :key="key">
                <v-checkbox v-model="form.medios[key]" :label="label" />
              </v-col>
            </v-row>
          </v-col>
  
          <v-col cols="12">
            <v-btn color="primary" type="submit">Guardar</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const form = ref({
    tecnico_id: null,
    dependencia_id: null,
    tipo_solicitud_id: null,
    interviniente_id: null,
    numero_solicitud: '',
    fecha_ingreso: '',
    fecha_informe: '',
    medios: {
      video: false,
      milestone: false,
      carta: false,
      audio: false,
      briefcam: false,
      info_civil: false,
      lpr: false,
      inst_cam: false
    }
  })
  
  const mediosLabels = {
    video: 'Video',
    milestone: 'Milestone',
    carta: 'Carta',
    audio: 'Audio',
    briefcam: 'BriefCam',
    info_civil: 'Info. Civil',
    lpr: 'LPR',
    inst_cam: 'Inst. Cam'
  }
  
  const tecnicos = ref([])
  const dependencias = ref([])
  const tipos = ref([])
  const intervinientes = ref([])
  
  const cargarDatos = async () => {
    tecnicos.value = (await axios.get('http://localhost:3001/api/tecnicos')).data
    dependencias.value = (await axios.get('http://localhost:3001/api/dependencias')).data
    tipos.value = (await axios.get('http://localhost:3001/api/tipos')).data
    intervinientes.value = (await axios.get('http://localhost:3001/api/intervinientes')).data
  }
  
  const enviarFormulario = async () => {
    try {
      const payload = {
        ...form.value,
        medios: Object.fromEntries(
          Object.entries(form.value.medios).map(([key, val]) => [key, val ? 1 : 0])
        )
      }
  
      await axios.post('http://localhost:3001/api/solicitudes', payload)
      alert('✅ Solicitud creada con éxito')
      location.reload()
    } catch (error) {
      console.error('❌ Error al guardar', error)
      alert('Error al guardar la solicitud')
    }
  }
  
  onMounted(() => {
    cargarDatos()
  })
  </script>
  