<template>
    <v-container>
        <h2 class="mb-4">🏷️ Gestión de Tipos de Solicitud</h2>      
     
  
      <v-btn color="primary" class="mb-4" @click="dialog = true">
        Agregar Tipo
      </v-btn>
  
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        loading-text="Cargando tipos..."
        class="elevation-1"
        dense
      >
        <template #item.acciones="{ item }">
          <v-btn icon @click="edit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" @click="remove(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
  
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-card-title>
            {{ editing ? 'Editar Tipo' : 'Nuevo Tipo' }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="form.nombre"
              label="Nombre del Tipo"
              required
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn text @click="dialog = false">Cancelar</v-btn>
            <v-btn color="primary" @click="save">Guardar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { useCrud } from '@/composables/useCrud'
  
  // ¡Importante! tu backend expone /api/listas/tipos
  const {
    items,
    dialog,
    editing,
    form,
    loading,
    headers,
    load,
    save,
    edit,
    remove
  } = useCrud('listas/tipos', 'Tipo de Solicitud')
  
  onMounted(load)
  </script>
  