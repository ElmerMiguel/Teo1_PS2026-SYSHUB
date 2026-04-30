<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Overlay oscurecido -->
    <div class="absolute inset-0 bg-black opacity-50" @click="close"></div>
    
    <!-- Contenido Modal -->
    <div class="bg-white rounded-xl shadow-lg w-full max-w-lg z-10 p-6 m-4 flex flex-col max-h-[90vh]">
      <div class="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
        <h3 class="text-xl font-bold text-gray-900">Crear Nuevo Hilo</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
      </div>

      <form @submit.prevent="submitThread" class="overflow-y-auto pr-2 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título del Hilo</label>
          <input required v-model="form.titulo" type="text" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50" placeholder="Pregunta clara o duda específica">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select required v-model="form.idCategoria" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50">
            <option value="" disabled>Selecciona un área...</option>
            <option value="1">Desarrollo Web</option>
            <option value="2">IA y Machine Learning</option>
            <option value="3">Infraestructura y Redes</option>
            <option value="4">Bases de Datos</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cuerpo de tu duda (Contenido)</label>
          <textarea required v-model="form.contenido" rows="5" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50" placeholder="Escribe el detalle de tu problema, muestra lo que has intentado..."></textarea>
        </div>

        <div class="pt-4 flex justify-end gap-3 mt-4 border-t border-gray-100">
          <button type="button" @click="close" class="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            Cancelar
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2 text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50">
            {{ loading ? 'Publicando...' : 'Publicar Hilo' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const emit = defineEmits(['close', 'created'])

defineProps({
  isOpen: Boolean
})

const form = ref({
  titulo: '',
  idCategoria: '',
  contenido: ''
})
const loading = ref(false)

const close = () => {
  emit('close')
}

const submitThread = async () => {
  loading.value = true
  try {
    await api.post('/social/threads', {
      titulo: form.value.titulo,
      contenido: form.value.contenido,
      idCategoria: parseInt(form.value.idCategoria)
    })
    
    // reset form
    form.value.titulo = ''
    form.value.idCategoria = ''
    form.value.contenido = ''
    
    emit('created')
    close()
  } catch (error) {
    console.error(error)
    alert('Error al publicar el hilo. Verifica los campos.')
  } finally {
    loading.value = false
  }
}
</script>
