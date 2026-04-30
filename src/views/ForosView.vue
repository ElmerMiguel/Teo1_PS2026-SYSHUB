<template>
  <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
    
    <!-- Left Column: Threads -->
    <div class="flex-1">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Foros de Discusión</h2>
        <button class="bg-primary-blue text-white px-4 py-2 rounded-md font-medium text-sm lg:hidden shadow-sm">
          ＋ Nuevo Hilo
        </button>
      </div>

      <!-- Filters & Threads -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        
        <div class="flex justify-between items-center px-4 py-3 border-b border-gray-200 flex-wrap gap-3">
          <ul class="flex space-x-6 text-sm font-medium">
            <li><a href="#" class="text-primary-blue border-b-2 border-primary-blue pb-3">Recientes</a></li>
            <li><a href="#" class="text-gray-500 hover:text-gray-700 pb-3">Populares</a></li>
            <li><a href="#" class="text-gray-500 hover:text-gray-700 pb-3">Sin Responder</a></li>
            <li><a href="#" class="text-gray-500 hover:text-gray-700 pb-3">Mis Hilos</a></li>
          </ul>
          <select class="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-primary-blue focus:border-primary-blue block p-2 outline-none">
            <option>Todas las categorías</option>
            <option>Desarrollo Web</option>
            <option>IA y ML</option>
            <option>Infraestructura</option>
          </select>
        </div>

        <ForumRow v-for="t in threads" :key="t.idHilo" :thread="t" />
        
        <div v-if="threads.length === 0" class="p-8 text-center text-gray-500">
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
        <h3 class="font-bold text-gray-900 pb-2 mb-3 border-b border-gray-200">📌 Categorías Populares</h3>
        <div class="space-y-3">
          <a href="#" class="flex justify-between items-center text-sm text-gray-600 hover:text-primary-blue group">
            <span>Desarrollo Web</span>
            <span class="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full group-hover:bg-blue-50">234</span>
          </a>
          <a href="#" class="flex justify-between items-center text-sm text-gray-600 hover:text-primary-blue group">
            <span>IA y Machine Learning</span>
            <span class="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full group-hover:bg-blue-50">89</span>
          </a>
          <a href="#" class="flex justify-between items-center text-sm text-gray-600 hover:text-primary-blue group">
            <span>Bases de Datos</span>
            <span class="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full group-hover:bg-blue-50">112</span>
          </a>
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
import { ref, onMounted } from 'vue'
import api from '../services/api'
import ForumRow from '../components/ForumRow.vue'
import CrearHiloModal from '../components/CrearHiloModal.vue'

const threads = ref([])
const isModalOpen = ref(false)

const fetchThreads = async () => {
  try {
    const res = await api.get('/social/threads');
    threads.value = res.data.items || res.data || [];
  } catch (error) {
    console.error('Error cargando hilos:', error);
  }
}

onMounted(() => {
  fetchThreads()
})

const createNewThread = () => {
  isModalOpen.value = true
}
</script>
