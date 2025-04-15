<template>
  <v-app>
    <v-main>
      <v-container>
        <FormularioSolicitud />
        <SolicitudesTable />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import SolicitudesTable from './components/SolicitudesTable.vue'
import FormularioSolicitud from './components/FormularioSolicitud.vue'

export default {
  components: {
    SolicitudesTable,
    FormularioSolicitud
  }
}
</script>
