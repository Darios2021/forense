// src/composables/useCrud.js
import { ref } from 'vue'
import api from '@/services/api'

export function useCrud(resource, label = 'Elemento') {
  const items   = ref([])
  const dialog  = ref(false)
  const editing = ref(false)
  const form    = ref({ id: null, nombre: '' })
  const loading = ref(false)

  const headers = [
    { text: 'ID',        value: 'id' },
    { text: label,       value: 'nombre' },
    { text: 'Acciones',  value: 'acciones', sortable: false }
  ]

  // Carga inicial
  async function load() {
    loading.value = true
    try {
      const { data } = await api.get(`/${resource}`)
      items.value = data
    } finally {
      loading.value = false
    }
  }

  // Crear ↔️ Editar
  async function save() {
    if (!form.value.nombre.trim()) return
    if (editing.value) {
      await api.put(`/${resource}/${form.value.id}`, { nombre: form.value.nombre })
    } else {
      await api.post(`/${resource}`, { nombre: form.value.nombre })
    }
    dialog.value  = false
    editing.value = false
    form.value    = { id: null, nombre: '' }
    await load()
  }

  // Preparar edición
  function edit(item) {
    form.value    = { ...item }
    editing.value = true
    dialog.value  = true
  }

  // Borrar
  async function remove(id) {
    if (!confirm(`¿Eliminar ${label} #${id}?`)) return
    await api.delete(`/${resource}/${id}`)
    await load()
  }

  return {
    items, dialog, editing, form, loading, headers,
    load, save, edit, remove
  }
}
