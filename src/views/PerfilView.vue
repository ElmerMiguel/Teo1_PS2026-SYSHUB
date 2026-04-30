<template>
  <div class="max-w-7xl mx-auto">
    <!-- Profile Card Header -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8 relative">
      <div class="h-40 relative bg-gradient-to-br from-blue-400 to-primary-blue">
        <div class="absolute -bottom-16 left-8 w-32 h-32 bg-white border-4 border-white rounded-full flex items-center justify-center text-4xl text-primary-blue font-bold shadow-md">
          JR
        </div>
      </div>
      <div class="pt-20 px-8 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div class="mb-4 md:mb-0">
          <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ meData?.user?.nombre || authStore.user?.nombre }} {{ meData?.user?.apellido || authStore.user?.apellido }}</h3>
          <p class="text-gray-500 mb-2 font-medium">
            <i class="bi bi-mortarboard-fill mr-2 text-primary-blue"></i>
            {{ roleSummary }} · Semestre {{ meData?.user?.semestre || authStore.user?.semestre || 0 }}
          </p>
          <p class="text-sm text-gray-600 max-w-2xl mb-4">
            Carnet: {{ meData?.user?.carnet || authStore.user?.carnet }}
          </p>
        </div>
        <button @click="isModalOpen = true" class="px-4 py-2 border border-primary-blue text-primary-blue rounded-lg font-medium hover:bg-blue-50 transition flex items-center">
          <i class="bi bi-pencil-square mr-2"></i>Editar Perfil
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left Column: Stats & About -->
      <div class="lg:col-span-4">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <h6 class="font-bold border-b border-gray-100 pb-3 mb-4 text-gray-900">Estadísticas</h6>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div class="text-2xl font-bold text-primary-blue">{{ meData?.stats?.proyectos || 0 }}</div>
              <div class="text-sm text-gray-500 font-medium">Proyectos</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div class="text-2xl font-bold text-primary-blue">{{ meData?.stats?.respuestas || 0 }}</div>
              <div class="text-sm text-gray-500 font-medium">Respuestas</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div class="text-2xl font-bold text-primary-blue">{{ meData?.stats?.articulos || 0 }}</div>
              <div class="text-sm text-gray-500 font-medium">Artículos</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div class="text-2xl font-bold text-primary-blue">{{ meData?.stats?.guardados || 0 }}</div>
              <div class="text-sm text-gray-500 font-medium">Guardados</div>
            </div>
          </div>

          <h6 class="font-bold border-b border-gray-100 pb-3 mb-4 text-gray-900">Información de Contacto</h6>
          <ul class="text-sm text-gray-600 space-y-3">
            <li><i class="bi bi-envelope-fill mr-3 text-gray-400"></i> {{ meData?.user?.email || authStore.user?.email }}</li>
            <li><i class="bi bi-shield-check mr-3 text-gray-400"></i> Roles: {{ meData?.user?.roles?.join(', ') || authStore.user?.roles?.join(', ') }}</li>
          </ul>
        </div>
      </div>

      <!-- Right Column -->
      <div class="lg:col-span-8">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
          <!-- Tabs -->
          <div class="flex border-b border-gray-200">
            <button class="px-6 py-4 text-primary-blue font-semibold border-t-2 border-primary-blue bg-white">Actividad Reciente</button>
          </div>

          <!-- Content Tab: Actividad -->
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-bold text-gray-700 mb-3">Mis Proyectos</h4>
                <div v-if="meData?.recentProjects?.length" class="space-y-2">
                  <div v-for="project in meData.recentProjects" :key="project.idProyecto" class="border border-gray-200 rounded-lg p-3">
                    <div class="font-semibold text-gray-900">{{ project.titulo }}</div>
                    <div class="text-xs text-gray-500">{{ project.estado }} · {{ new Date(project.fechaPublicacion).toLocaleDateString() }}</div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">No hay proyectos registrados.</div>
              </div>
              <div>
                <h4 class="text-sm font-bold text-gray-700 mb-3">Mis Hilos</h4>
                <div v-if="meData?.recentThreads?.length" class="space-y-2">
                  <div v-for="thread in meData.recentThreads" :key="thread.idHilo" class="border border-gray-200 rounded-lg p-3">
                    <div class="font-semibold text-gray-900">{{ thread.titulo }}</div>
                    <div class="text-xs text-gray-500">{{ new Date(thread.fechaCreacion).toLocaleDateString() }}</div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">No hay hilos registrados.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <EditarPerfilModal 
      :isOpen="isModalOpen"
      :userData="meData?.user"
      @close="isModalOpen = false"
      @updated="fetchProfile"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import EditarPerfilModal from '../components/EditarPerfilModal.vue'

const authStore = useAuthStore()
const meData = ref(null)
const isModalOpen = ref(false)

const roleSummary = computed(() => {
  const roles = meData.value?.user?.roles || authStore.user?.roles || []
  if (roles.length === 0) return 'Usuario'
  return roles.join(' / ')
})

const fetchProfile = async () => {
  try {
    const res = await api.get('/auth/me')
    meData.value = res.data?.user
      ? res.data
      : { user: res.data, stats: res.data?.stats }
  } catch(e) {
    console.error('Error fetching profile', e)
  }
}

onMounted(() => {
  fetchProfile()
})
</script>
