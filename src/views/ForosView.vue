<template>
  <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
    
    <!-- Left Column: Threads -->
    <div class="flex-1">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Foros de Discusión</h2>
        <button @click="createNewThread" class="bg-primary-blue text-white px-4 py-2 rounded-md font-medium text-sm lg:hidden shadow-sm">
          ＋ Nuevo Hilo
        </button>
      </div>

      <!-- Filters & Threads -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        
        <div class="flex flex-col gap-3 px-4 py-3 border-b border-gray-200">
          <div class="flex flex-wrap items-center gap-4 text-sm font-medium">
            <button @click="setSort('recent')" :class="sortButtonClass('recent')">Recientes</button>
            <button @click="setSort('popular')" :class="sortButtonClass('popular')">Populares</button>
            <button @click="setSort('mine')" :class="sortButtonClass('mine')">Mis Hilos</button>
          </div>
          <div class="flex flex-col md:flex-row gap-3">
            <input v-model="filters.q" type="text" placeholder="Buscar en hilos" class="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-primary-blue focus:border-primary-blue block p-2 outline-none w-full" />
            <select v-model="filters.idCategoria" class="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-primary-blue focus:border-primary-blue block p-2 outline-none w-full md:w-64">
              <option value="">Todas las categorías</option>
              <option v-for="cat in categoriasLocales" :key="cat.idCategoria" :value="cat.idCategoria">
                {{ cat.nombre }}
              </option>
            </select>
            <button @click="fetchThreads" class="bg-primary-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Filtrar</button>
          </div>
        </div>

  <ForumRow v-for="t in displayedThreads" :key="t.idHilo" :thread="t" />
        
        <div v-if="displayedThreads.length === 0" class="p-8 text-center text-gray-500">
          No hay hilos o foros disponibles.
        </div>
      </div>
      
      <!-- Modal Component -->
      <CrearHiloModal 
        :isOpen="isModalOpen" 
        @close="isModalOpen = false" 
        @created="fetchThreads" 
      />

    </div>

    <!-- Right Column: Sidebar Widgets -->
    <div class="hidden lg:block w-80">
      <button @click="createNewThread" class="w-full bg-primary-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl mb-6 shadow-sm transition">
        ＋ Crear Nuevo Hilo
      </button>

      <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <h3 class="font-bold text-gray-900 pb-2 mb-3 border-b border-gray-200">📌 Categorías del Sistema</h3>
        <div class="space-y-3">
          <a v-for="cat in categoriasLocales" :key="cat.idCategoria" href="#" class="flex justify-between items-center text-sm text-gray-600 hover:text-primary-blue group">
            <span>{{ cat.nombre }}</span>
            <span class="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full group-hover:bg-blue-50">#{{ cat.idCategoria }}</span>
          </a>
          <span v-if="categoriasLocales.length === 0" class="text-xs text-gray-500">
            Sin categorías
          </span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <h3 class="font-bold text-gray-900 pb-2 mb-3 border-b border-gray-200">📜 Reglas del Foro</h3>
        <ul class="text-xs text-gray-500 space-y-2 leading-relaxed pl-4 list-disc marker:text-gray-300">
          <li><strong class="text-gray-700">Sé respetuoso:</strong> Trata a tus compañeros con amabilidad.</li>
          <li><strong class="text-gray-700">No pidas solo código:</strong> Muestra lo que has intentado.</li>
          <li><strong class="text-gray-700">Usa etiquetas correctas:</strong> Facilita la búsqueda a otros.</li>
          <li><strong class="text-gray-700">Evita spam:</strong> No dupliques publicaciones.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import ForumRow from '../components/ForumRow.vue'
import CrearHiloModal from '../components/CrearHiloModal.vue'
import { useAuthStore } from '../stores/auth'

const threads = ref([])
const isModalOpen = ref(false)
const categoriasLocales = ref([])
const authStore = useAuthStore()

const filters = ref({
  q: '',
  idCategoria: ''
})

const sortMode = ref('recent')

const displayedThreads = computed(() => {
  let list = [...threads.value]

  if (sortMode.value === 'popular') {
    list = list.sort((a, b) => (b.vistas || 0) - (a.vistas || 0))
  }

  if (sortMode.value === 'mine') {
    list = list.filter((thread) => thread.idUsuario === authStore.user?.idUsuario)
  }

  return list
})

const sortButtonClass = (mode) => {
  return sortMode.value === mode
    ? 'text-primary-blue border-b-2 border-primary-blue pb-1'
    : 'text-gray-500 hover:text-gray-700 pb-1'
}

const fetchThreads = async () => {
  try {
    const res = await api.get('/social/threads', {
      params: {
        q: filters.value.q || undefined,
        idCategoria: filters.value.idCategoria ? parseInt(filters.value.idCategoria) : undefined
      }
    });
    threads.value = res.data.items || res.data || [];
  } catch (error) {
    console.error('Error cargando hilos:', error);
  }
}

const fetchCategories = async () => {
  try {
    const res = await api.get('/projects/categories');
    categoriasLocales.value = res.data.items || res.data || [];
  } catch (error) {
    console.error('Error buscando categorias:', error);
  }
}

onMounted(() => {
  fetchThreads()
  fetchCategories()
})

const createNewThread = () => {
  isModalOpen.value = true
}

const setSort = (mode) => {
  sortMode.value = mode
}
</script>
