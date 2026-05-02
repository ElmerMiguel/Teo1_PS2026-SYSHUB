<template>
  <div class="max-w-5xl mx-auto">
    
    <div class="flex flex-col md:flex-row md:justify-between md:items-end mb-8 pb-4 border-b border-gray-200 gap-4">
      <div>
        <h2 class="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
          <i class="bi bi-bookmark-star text-primary-blue"></i> Mi Material Guardado
        </h2>
        <p class="text-gray-500 text-sm">Colección privada de repositorios, hilos de dudas y artículos relevantes.</p>
      </div>
      
      <!-- Quick Filters -->
      <div class="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm overflow-x-auto">
        <button class="px-4 py-1.5 bg-blue-50 text-primary-blue font-medium rounded-md whitespace-nowrap">
          Todos <span class="bg-white text-primary-blue text-xs font-bold px-1.5 py-0.5 rounded shadow-sm ml-2">{{ savedItems.length }}</span>
        </button>
      </div>
    </div>

    <!-- Lista Guardados -->
    <div class="space-y-4 mb-8">
      
      <div v-for="item in savedItems" :key="item.idGuardado || item.id" class="bg-white border border-gray-200 rounded-xl p-6 flex gap-6 hover:border-blue-300 transition shadow-sm group">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-blue-50 text-blue-600">
          <i class="bi bi-folder-symlink"></i>
        </div>
        <div class="flex-grow">
          <span class="text-[0.65rem] font-bold uppercase tracking-widest text-blue-600 mb-2 block">{{ getTypeLabel(item.tipoContenido) }}</span>
          <router-link :to="getItemLink(item)" class="text-lg font-bold text-gray-900 hover:text-primary-blue transition mb-2 block">
            {{ item.titulo || 'Contenido' }}
          </router-link>
          <p class="text-sm text-gray-500 mb-3 max-w-3xl line-clamp-2">Guardado el {{ new Date(item.fechaGuardado).toLocaleDateString() }}</p>
        </div>
        <div>
          <button @click="removeSaved(item.idGuardado)" class="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
        </div>
      </div>

      <div v-if="savedItems.length === 0" class="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
        <i class="bi bi-bookmark text-4xl text-gray-300 mb-4 block"></i>
        <p>No tienes ningún material guardado por el momento.</p>
      </div>
      
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const savedItems = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/auth/saved')
    savedItems.value = res.data.items || res.data || []
  } catch (error) {
    savedItems.value = []
  }
})

const removeSaved = async (idGuardado) => {
  if (!confirm('¿Eliminar este material guardado?')) return
  try {
    await api.delete(`/auth/saved/${idGuardado}`)
    savedItems.value = savedItems.value.filter((item) => item.idGuardado !== idGuardado)
  } catch (error) {
    alert('No se pudo eliminar el material guardado.')
  }
}

const getTypeLabel = (tipo) => {
  if (tipo === 'proyecto') return 'Proyecto'
  if (tipo === 'hilo') return 'Hilo'
  if (tipo === 'articulo') return 'Artículo'
  return 'Material Guardado'
}

const getItemLink = (item) => {
  if (item.tipoContenido === 'proyecto') return `/proyectos/${item.idContenido}`
  if (item.tipoContenido === 'hilo') return `/foros/${item.idContenido}`
  if (item.tipoContenido === 'articulo') return `/blogs/${item.idContenido}`
  return '/guardados'
}
</script>
