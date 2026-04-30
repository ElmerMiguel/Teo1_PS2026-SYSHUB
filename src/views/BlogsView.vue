<template>
  <div class="max-w-7xl mx-auto">
    
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-1">Blogs y Artículos</h2>
        <p class="text-gray-500">Tutoriales, investigaciones y guías de la comunidad.</p>
      </div>
      <button @click="createArticle" v-if="authStore.isAuxiliar || authStore.isAdmin" class="bg-primary-blue hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-sm transition flex items-center">
        <i class="bi bi-pen mr-2"></i> Escribir Artículo
      </button>
    </div>

    <!-- Featured Article -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
      <div class="flex flex-col md:flex-row h-full">
        <div class="md:w-5/12 bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center min-h-[280px]">
          <i class="bi bi-box-seam text-white opacity-50 text-8xl"></i>
        </div>
        <div class="md:w-7/12 p-10 flex flex-col justify-center">
          <span class="bg-blue-50 text-primary-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block w-max mb-4">Artículo Destacado</span>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Guía de Supervivencia: Migrando Arquitecturas Monolíticas a Microservicios</h3>
          <p class="text-gray-600 text-lg leading-relaxed mb-6">
            Aprende los conceptos fundamentales que necesitarás para el proyecto de Software Avanzado. Exploramos estrategias de estrangulamiento de monolitos, comunicación asíncrona mediante colas de eventos (RabbitMQ) y despliegue usando contenedores en la nube.
          </p>
          
          <div class="flex items-center justify-between mt-auto">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">IP</div>
              <div>
                <div class="font-bold text-gray-900 text-sm">Ing. Pablo Gómez</div>
                <div class="text-gray-500 text-xs">18 Mar 2026 · 12 min de lectura</div>
              </div>
            </div>
            <a href="#" class="px-5 py-2 border border-primary-blue text-primary-blue rounded-full font-medium hover:bg-blue-50 transition">
              Leer Artículo <i class="bi bi-arrow-right ml-1"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Categories -->
    <div class="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <button class="bg-blue-50 text-primary-blue px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap">Todas</button>
      <button class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition">Tutoriales</button>
      <button class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition">Investigación</button>
      <button class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition">DevOps</button>
      <button class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition">Tips Académicos</button>
    </div>

    <!-- Blog Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      
      <div v-for="a in articles" :key="a.idArticulo" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
        <div class="h-48 bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center text-4xl text-blue-500 font-bold">
          <i class="bi bi-file-earmark-text"></i>
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex justify-between items-center mb-3">
            <span class="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Artículo</span>
            <i class="bi bi-bookmark text-gray-400 hover:text-primary-blue cursor-pointer"></i>
          </div>
          <h4 class="text-xl font-bold text-gray-900 mb-3 leading-snug">{{ a.titulo }}</h4>
          <p class="text-gray-600 text-sm mb-6 line-clamp-3" v-html="a.resumen || a.contenidoHtml || 'Sin descripción'"></p>
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold text-[10px]">
                {{ a.usuario?.nombre?.charAt(0) || 'U' }}
              </div>
              <span class="text-sm text-gray-900 font-medium">{{ a.usuario?.nombre || 'Usuario' }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal para crear artículo -->
    <CrearArticuloModal 
      :isOpen="isModalOpen" 
      @close="isModalOpen = false" 
      @created="fetchArticles" 
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import CrearArticuloModal from '../components/CrearArticuloModal.vue'

const articles = ref([])
const authStore = useAuthStore()
const isModalOpen = ref(false)

const fetchArticles = async () => {
  try {
    const res = await api.get('/social/articles')
    articles.value = res.data.items || res.data || []
  } catch (error) {
    console.error('Error fetching articles:', error)
  }
}

onMounted(() => {
  fetchArticles()
})

const createArticle = () => {
  if (!authStore.isAuxiliar && !authStore.isAdmin) {
    alert('Solo auxiliares y administradores pueden redactar artículos.')
    return
  }
  isModalOpen.value = true
}
</script>
