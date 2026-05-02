<template>
  <div class="max-w-7xl mx-auto">
    <!-- Welcome Card -->
    <div class="bg-gradient-to-br from-primary-blue to-blue-700 rounded-2xl p-8 text-white mb-8 shadow-sm">
      <h2 class="text-3xl font-bold mb-2">Bienvenido, {{ authStore.user?.nombre || 'Usuario' }} 👋</h2>
      <p class="text-blue-100 mb-5">Ingeniería en Ciencias y Sistemas · Semestre {{ authStore.user?.semestre || 1 }}</p>
      <div class="inline-flex bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium space-x-4">
        <span><i class="bi bi-folder2-open mr-1"></i> {{ stats.proyectos }} Proyectos</span>
        <span>|</span>
        <span><i class="bi bi-chat-dots mr-1"></i> {{ stats.comentarios }} Comentarios</span>
        <span>|</span>
        <span><i class="bi bi-bookmark mr-1"></i> {{ stats.guardados }} Guardados</span>
      </div>
    </div>

    <!-- Proyectos Destacados -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-gray-900">Proyectos Destacados</h3>
        <router-link to="/perfil" class="text-sm font-medium text-primary-blue hover:underline">Ver todos &rarr;</router-link>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProjectCard v-for="p in recentProjects" :key="p.idProyecto" :project="p" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Actividad Foros -->
      <div class="lg:col-span-7">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Actividad Reciente en Foros</h3>
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <ForumRow v-for="t in recentThreads" :key="t.idHilo" :thread="t" />
        </div>
      </div>

      <!-- Artículos -->
      <div class="lg:col-span-5">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Artículos Recientes</h3>
        <div>
          <ArticleCard v-for="a in recentArticles" :key="a.idArticulo" :article="a" />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500 pb-8">
      &copy; 2026 Syshub - División de Ingeniería, USAC.
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import ProjectCard from '../components/ProjectCard.vue'
import ForumRow from '../components/ForumRow.vue'
import ArticleCard from '../components/ArticleCard.vue'

const authStore = useAuthStore()

// Reactividad para datos traídos del backend
const stats = ref({ proyectos: 0, comentarios: 0, guardados: 0 })
const recentProjects = ref([])
const recentThreads = ref([])
const recentArticles = ref([])

onMounted(async () => {
  try {
    // Puedes traer las estadísticas reales desde tu GET /api/auth/me u otro endpoint
    const meRes = await api.get('/auth/me')
    if (meRes.data?.stats) {
      stats.value = {
        proyectos: meRes.data.stats.proyectos ?? 0,
        comentarios: meRes.data.stats.respuestas ?? 0,
        guardados: meRes.data.stats.guardados ?? 0
      }
    }

    // Proyectos recientes
    const projectsRes = await api.get('/projects/curated')
    recentProjects.value = Array.isArray(projectsRes.data)
      ? projectsRes.data
      : (projectsRes.data.items || [])

    // Hilos recientes
  const threadsRes = await api.get('/social/threads?limit=4')
  recentThreads.value = threadsRes.data.items || threadsRes.data || []

    // Artículos recientes
  const articlesRes = await api.get('/social/articles?limit=2')
  recentArticles.value = articlesRes.data.items || articlesRes.data || []
  } catch (error) {
    console.error('Error cargando el Dashboard:', error);
  }
})
</script>
