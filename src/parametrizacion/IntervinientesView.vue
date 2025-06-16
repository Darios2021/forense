<!-- src/parametrizacion/IntervinientesView.vue -->
<template>
    <v-container class="mx-auto" style="max-width: 800px;">
      <v-card>
        <v-card-title>
          <span class="text-h6">Intervinientes</span>
          <v-spacer />
          <v-btn color="primary" @click="dialog = true">
            <v-icon left>mdi-plus</v-icon>
            Nuevo
          </v-btn>
        </v-card-title>
  
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          class="elevation-1"
        >
          <template #item.acciones="{ item }">
            <v-btn icon small @click="edit(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small color="red" @click="remove(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
  
        <v-dialog v-model="dialog" max-width="400px">
          <v-card>
            <v-card-title>
              {{ editing ? 'Editar' : 'Nuevo' }} Interviniente
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="form.nombre"
                label="Nombre"
                autofocus
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text @click="dialog = false">Cancelar</v-btn>
              <v-btn text color="primary" @click="save()">Guardar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-container>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { useCrud } from '@/composables/useCrud'
  
  // configuramos CRUD contra /intervinientes
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
  } = useCrud('intervinientes', 'Interviniente')
  
  onMounted(load)
  </script>
  