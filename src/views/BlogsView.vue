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


    <!-- Blog Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <div v-for="a in articles" :key="a.idArticulo" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition cursor-pointer" @click="openArticle(a)">
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
                {{ a.autor?.nombre?.charAt(0) || 'U' }}
              </div>
              <span class="text-sm text-gray-900 font-medium">
                {{ a.autor?.nombre ? `${a.autor.nombre} ${a.autor.apellido || ''}`.trim() : 'Usuario' }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="articles.length === 0" class="text-center text-gray-500 py-10 bg-white border border-gray-200 rounded-xl">
      No hay artículos publicados todavía.
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
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import CrearArticuloModal from '../components/CrearArticuloModal.vue'

const articles = ref([])
const authStore = useAuthStore()
const isModalOpen = ref(false)
const router = useRouter()

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

const openArticle = (article) => {
  router.push(`/blogs/${article.idArticulo}`)
}
</script>
