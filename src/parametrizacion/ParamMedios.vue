<template>
  <v-card>
    <v-card-title>
      <v-icon left>mdi-file-document-outline</v-icon>
      Medios Disponibles
      <v-spacer/>
      <v-btn color="primary" dark @click="dialog = true">Nuevo Medio</v-btn>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      loading-text="Cargando medios..."
      class="elevation-1"
      dense
    >
      <template #item.acciones="{ item }">
        <v-btn icon @click="edit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
        <v-btn icon color="error" @click="remove(item.id)"><v-icon>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>{{ editing ? 'Editar Medio' : 'Nuevo Medio' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.nombre" label="Nombre del Medio" autofocus />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="save">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCrud } from '@/composables/useCrud'

// Medios en /api/medios
const { items, dialog, editing, form, loading, headers, load, save, edit, remove } =
  useCrud('medios', 'Medio')

onMounted(load)
</script>
