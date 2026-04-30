<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black opacity-50" @click="close"></div>
    
    <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl z-10 p-6 m-4 flex flex-col max-h-[95vh]">
      <div class="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
        <h3 class="text-xl font-bold text-gray-900">Redactar Nuevo Artículo / Blog</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
      </div>

      <form @submit.prevent="submitArticle" class="overflow-y-auto pr-2 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input required v-model="form.titulo" type="text" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50" placeholder="Ej: Implementando arquitecturas Serverless">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Resumen Corto (Aparecerá en la tarjeta)</label>
          <textarea required v-model="form.resumen" rows="2" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50" placeholder="Resumen atrapante en 2 líneas..."></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cuerpo del Artículo (Admite HTML básico para formato)</label>
          <textarea required v-model="form.contenidoHtml" rows="8" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue font-mono text-sm bg-gray-50 text-gray-800" placeholder="<h3>Encabezado</h3><p>Cuerpo del artículo...</p>"></textarea>
        </div>

        <div class="flex items-center">
          <input id="publishNow" v-model="form.estado" true-value="publicado" false-value="borrador" type="checkbox" class="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded">
          <label for="publishNow" class="ml-2 block text-sm text-gray-900 font-medium">Publicar inmediatamente</label>
        </div>

        <div class="pt-4 flex justify-end gap-3 mt-4 border-t border-gray-100">
          <button type="button" @click="close" class="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            Cancelar
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2 text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50">
            {{ loading ? 'Guardando...' : 'Guardar Artículo' }}
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
  resumen: '',
  contenidoHtml: '',
  estado: 'publicado'
})
const loading = ref(false)

const close = () => {
  emit('close')
}

const submitArticle = async () => {
  loading.value = true
  try {
    await api.post('/social/articles', {
      titulo: form.value.titulo,
      resumen: form.value.resumen,
      contenidoHtml: form.value.contenidoHtml,
      estado: form.value.estado
    })
    
    // reset
    form.value.titulo = ''
    form.value.resumen = ''
    form.value.contenidoHtml = ''
    form.value.estado = 'publicado'

    emit('created')
    close()
  } catch (error) {
    console.error(error)
    alert('Error publicando el artículo.')
  } finally {
    loading.value = false
  }
}
</script>
