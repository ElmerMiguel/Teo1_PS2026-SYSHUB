<template>
  <div class="max-w-7xl mx-auto pb-10">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Repositorio de Proyectos</h2>
        <p class="text-gray-500">Explora proyectos técnicos de la comunidad y filtra por tags o categoría.</p>
      </div>
      <router-link v-if="authStore.isStudent" to="/crear-repo" class="bg-primary-blue hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition">
        Publicar Proyecto
      </router-link>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input v-model="filters.q" type="text" class="border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue outline-none" placeholder="Buscar por título o descripción" />
        <select v-model="filters.categoryId" class="border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue outline-none">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat.idCategoria" :value="cat.idCategoria">
            {{ cat.nombre }}
          </option>
        </select>
        <select v-model="filters.tag" class="border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue outline-none">
          <option value="">Todos los tags</option>
          <option v-for="tag in tags" :key="tag.idEtiqueta" :value="tag.nombre">
            {{ tag.nombre }}
          </option>
        </select>
        <div class="flex items-center gap-3">
          <input v-model="filters.onlyMine" type="checkbox" id="onlyMine" class="h-4 w-4 text-primary-blue" />
          <label for="onlyMine" class="text-sm text-gray-600">Solo mis proyectos</label>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 mt-4">
        <button @click="applyFilters" class="bg-primary-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Aplicar filtros</button>
        <button @click="resetFilters" class="border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">Limpiar</button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-10">Cargando proyectos...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard v-for="project in projects" :key="project.idProyecto" :project="project" />
    </div>

    <div v-if="!loading && projects.length === 0" class="text-center text-gray-500 py-10">
      No hay proyectos para mostrar con los filtros actuales.
    </div>

    <div class="flex items-center justify-between mt-8" v-if="pagination.total > pagination.limit">
      <button @click="prevPage" :disabled="pagination.page === 1" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
        Anterior
      </button>
      <span class="text-sm text-gray-500">Página {{ pagination.page }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="pagination.page >= totalPages" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import ProjectCard from '../components/ProjectCard.vue'
import { useAuthStore } from '../stores/auth'

const projects = ref([])
const categories = ref([])
const tags = ref([])
const loading = ref(false)
const authStore = useAuthStore()

const pagination = ref({ page: 1, limit: 9, total: 0 })

const filters = ref({
  q: '',
  tag: '',
  categoryId: '',
  onlyMine: false
})

const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))


const fetchCatalogs = async () => {
  const [cats, tagsRes] = await Promise.all([
    api.get('/projects/categories'),
    api.get('/projects/tags')
  ])
  categories.value = cats.data.items || cats.data || []
  tags.value = tagsRes.data.items || tagsRes.data || []
}

const fetchProjects = async () => {
  loading.value = true
  try {
    if (filters.value.onlyMine) {
      const res = await api.get('/projects/me/list')
      projects.value = res.data.items || res.data || []
      pagination.value = { page: 1, limit: projects.value.length, total: projects.value.length }
      return
    }

    const params = {
      q: filters.value.q || undefined,
      tag: filters.value.tag || undefined,
      categoryId: filters.value.categoryId ? parseInt(filters.value.categoryId) : undefined,
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    const res = await api.get('/projects/search', { params })
    projects.value = res.data.items || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('Error cargando proyectos', error)
    try {
      const fallback = await api.get('/projects')
      projects.value = fallback.data.items || fallback.data || []
      pagination.value = { page: 1, limit: projects.value.length, total: projects.value.length }
    } catch (fallbackError) {
      console.error('Error cargando proyectos (fallback)', fallbackError)
      projects.value = []
    }
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  pagination.value.page = 1
  fetchProjects()
}

const resetFilters = () => {
  filters.value = { q: '', tag: '', categoryId: '', onlyMine: false }
  pagination.value.page = 1
  fetchProjects()
}

const nextPage = () => {
  if (pagination.value.page < totalPages.value) {
    pagination.value.page += 1
    fetchProjects()
  }
}

const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page -= 1
    fetchProjects()
  }
}

onMounted(async () => {
  await fetchCatalogs()
  await fetchProjects()
})
</script>
