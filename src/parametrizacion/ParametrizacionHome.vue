<template>
  <v-container>
    <h2 class="mb-6">
      <v-icon left>mdi-cog</v-icon> Módulo de Parametrización
    </h2>

    <v-row dense>
      <!-- Usuarios -->
      <v-col cols="12" md="4">
        <v-card color="purple darken-2" dark>
          <v-card-title>Usuarios</v-card-title>
          <v-card-text>Gestionar usuarios y sus niveles de acceso.</v-card-text>
          <v-card-actions>
            <v-btn to="/parametrizacion/usuarios" color="white" text>
              Ir a Usuarios
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Tipos de Solicitud -->
      <v-col cols="12" md="4">
        <v-card color="green darken-1" dark>
          <v-card-title>Tipos de Solicitud</v-card-title>
          <v-card-text>Editar o agregar nuevos tipos.</v-card-text>
          <v-card-actions>
            <v-btn to="/parametrizacion/tipos" color="white" text>
              Ir a Tipos
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Intervinientes (UFI) -->
      <v-col cols="12" md="4">
        <v-card color="orange darken-1" dark>
          <v-card-title>Intervinientes</v-card-title>
          <v-card-text>Administrar fiscalías o unidades judiciales.</v-card-text>
          <v-card-actions>
            <v-btn to="/parametrizacion/intervinientes" color="white" text>
              Ir a Intervinientes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Dependencias -->
      <v-col cols="12" md="4">
        <v-card color="red darken-2" dark>
          <v-card-title>Dependencias</v-card-title>
          <v-card-text>Agregar o modificar comisarías/dependencias.</v-card-text>
          <v-card-actions>
            <v-btn to="/parametrizacion/dependencias" color="white" text>
              Ir a Dependencias
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Medios -->
      <v-col cols="12" md="4">
        <v-card color="teal darken-2" dark>
          <v-card-title>Medios</v-card-title>
          <v-card-text>Gestionar medios disponibles para solicitudes.</v-card-text>
          <v-card-actions>
            <v-btn to="/parametrizacion/medios" color="white" text>
              Ir a Medios
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ParametrizacionHome'
}
</script>

<style scoped>
.v-card {
  margin-bottom: 24px;
}
</style>
