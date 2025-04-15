<template>
    <v-container>
      <v-card class="pa-4">
        <v-card-title>Cargar nueva solicitud</v-card-title>
  
        <v-form ref="form" @submit.prevent="enviarSolicitud">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.numero_solicitud" label="N° de Solicitud" required />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.fecha_ingreso" label="Fecha de ingreso" type="date" required />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.fecha_informe" label="Fecha de informe" type="date" />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-select :items="tecnicos" label="Técnico" item-value="id" item-title="nombre" v-model="form.tecnico_id" required />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-select :items="dependencias" label="Dependencia" item-value="id" item-title="nombre" v-model="form.dependencia_id" required />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-select :items="tipos" label="Tipo de solicitud" item-value="id" item-title="nombre" v-model="form.tipo_solicitud_id" required />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-select :items="intervinientes" label="Interviene" item-value="id" item-title="nombre" v-model="form.interviniente_id" required />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.enlace_axon" label="Enlace AXON" />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.hash_civil" label="HASH Inf. Civil" />
            </v-col>
  
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.hash_lpr" label="HASH LPR" />
            </v-col>
  
            <v-col cols="12">
              <v-card-subtitle>Medios disponibles</v-card-subtitle>
              <v-row>
                <v-col cols="6" sm="4" v-for="(label, key) in mediosLabels" :key="key">
                  <v-checkbox v-model="form.medios[key]" :label="label" />
                </v-col>
              </v-row>
            </v-col>
  
            <v-col cols="12" class="text-right">
              <v-btn color="success" type="submit">Guardar solicitud</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    name: 'NuevaSolicitud',
    data() {
      return {
        form: {
          numero_solicitud: '',
          fecha_ingreso: '',
          fecha_informe: '',
          tecnico_id: null,
          dependencia_id: null,
          tipo_solicitud_id: null,
          interviniente_id: null,
          enlace_axon: '',
          hash_civil: '',
          hash_lpr: '',
          medios: {
            video: false,
            milestone: false,
            carta: false,
            audio: false,
            briefcam: false,
            info_civil: false,
            lpr: false,
            inst_cam: false,
          }
        },
        tecnicos: [],
        dependencias: [],
        tipos: [],
        intervinientes: [],
        mediosLabels: {
          video: 'Video',
          milestone: 'Milestone',
          carta: 'Carta',
          audio: 'Audio',
          briefcam: 'BriefCam',
          info_civil: 'Info. Civil',
          lpr: 'LPR',
          inst_cam: 'Inst. Cam'
        }
      }
    },
    methods: {
      async cargarListas() {
        const fetchData = async (endpoint) => {
          const res = await fetch(`http://localhost:3001/api/${endpoint}`);
          return await res.json();
        };
  
        this.tecnicos = await fetchData('tecnicos');
        this.dependencias = await fetchData('dependencias');
        this.tipos = await fetchData('tipos');
        this.intervinientes = await fetchData('intervinientes');
      },
      async enviarSolicitud() {
        const payload = {
          ...this.form,
          medios: Object.fromEntries(
            Object.entries(this.form.medios).map(([k, v]) => [k, v ? 1 : 0])
          )
        };
  
        try {
          const res = await fetch('http://localhost:3001/api/solicitudes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
  
          const data = await res.json();
          if (res.ok) {
            alert('✅ Solicitud creada con ID: ' + data.id);
            this.$refs.form.reset();
          } else {
            alert('❌ Error al guardar: ' + data.error);
          }
        } catch (err) {
          console.error(err);
          alert('❌ Error al conectar con el backend.');
        }
      }
    },
    mounted() {
      this.cargarListas();
    }
  }
  </script>
  