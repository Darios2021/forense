<template>
  <v-container>
    <h2 class="mb-4">👤 Gestión de Usuarios</h2>

    <v-btn color="primary" class="mb-4" @click="openDialog()">
      Agregar Usuario
    </v-btn>

    <v-data-table
      :headers="headers"
      :items="usuarios"
      :loading="loading"
      loading-text="Cargando usuarios..."
      class="elevation-1"
      dense
    >
      <template #item.acciones="{ item }">
        <v-btn icon @click="openDialog(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="borrar(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialogo para crear/editar -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ form.id ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="valid">
            <v-text-field
              v-model="form.nombre"
              label="Nombre completo"
              :rules="[v => !!v || 'Requerido']"
              required
            />
            <v-text-field
              v-model="form.usuario"
              label="Usuario (login)"
              :rules="[v => !!v || 'Requerido']"
              required
            />
            <v-text-field
              v-model="form.password"
              label="Contraseña"
              :type="showPass ? 'text' : 'password'"
              :append-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showPass = !showPass"
              :rules="[v => form.id || !!v || 'Requerido']"
              :hint="form.id ? 'Dejar vacía para no cambiar' : ''"
              persistent-hint
              :required="!form.id"
            />
            <v-select
              v-model="form.rol"
              :items="roles"
              label="Rol"
              :rules="[v => !!v || 'Requerido']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardar" :disabled="!valid">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const usuarios = ref([])
const loading  = ref(false)
const dialog   = ref(false)
const valid    = ref(false)
const formRef  = ref(null)
const showPass = ref(false)

const form = ref({
  id:       null,
  nombre:   '',
  usuario:  '',
  password: '',
  rol:      ''
})

// Definí acá los roles válidos
const roles = ['admin', 'superuser', 'user']

const headers = [
  { text: 'ID',      value: 'id' },
  { text: 'Nombre',  value: 'nombre' },
  { text: 'Usuario', value: 'usuario' },
  { text: 'Rol',     value: 'rol' },
  { text: 'Acciones', value: 'acciones', sortable: false }
]

// Carga lista
async function fetchUsuarios() {
  loading.value = true
  try {
    const { data } = await api.get('/usuarios')
    usuarios.value = data
  } catch (err) {
    console.error('Error cargando usuarios:', err)
  } finally {
    loading.value = false
  }
}

// Abrir diálogo. Si viene item, es edición
function openDialog(item = null) {
  if (item) {
    form.value = {
      id:       item.id,
      nombre:   item.nombre,
      usuario:  item.usuario,
      password: '',
      rol:      item.rol
    }
  } else {
    form.value = { id: null, nombre: '', usuario: '', password: '', rol: '' }
  }
  showPass.value = false
  dialog.value = true
}

// Guardar (POST o PUT)
async function guardar() {
  if (!formRef.value.validate()) return

  const payload = {
    nombre:  form.value.nombre,
    usuario: form.value.usuario,
    rol:     form.value.rol
  }
  // Solo incluyo password si está presente (creación o cambio)
  if (form.value.password) payload.password = form.value.password

  try {
    if (form.value.id) {
      await api.put(`/usuarios/${form.value.id}`, payload)
    } else {
      await api.post('/usuarios', payload)
    }
    dialog.value = false
    await fetchUsuarios()
  } catch (err) {
    console.error('Error guardando usuario:', err)
    alert('❌ ' + (err.response?.data?.error || err.message))
  }
}

// Borrar
async function borrar(id) {
  if (!confirm(`¿Eliminar usuario #${id}?`)) return
  try {
    await api.delete(`/usuarios/${id}`)
    await fetchUsuarios()
  } catch (err) {
    console.error('Error borrando usuario:', err)
  }
}

onMounted(fetchUsuarios)
</script>

<style scoped>
.v-data-table {
  margin-top: 16px;
}
</style>
