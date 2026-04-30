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
          <p class="text-gray-500 mb-2 font-medium"><i class="bi bi-mortarboard-fill mr-2 text-primary-blue"></i>Estudiante de Ingeniería en Ciencias y Sistemas · Semestre {{ meData?.user?.semestre || authStore.user?.semestre || 0 }}</p>
          <p class="text-sm text-gray-600 max-w-2xl mb-4">
            Carnet: {{ meData?.user?.carnet || authStore.user?.carnet }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 bg-blue-50 text-primary-blue text-xs font-semibold rounded-full">Backend</span>
            <span class="px-3 py-1 bg-blue-50 text-primary-blue text-xs font-semibold rounded-full">Python</span>
            <span class="px-3 py-1 bg-blue-50 text-primary-blue text-xs font-semibold rounded-full">Docker</span>
          </div>
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
              <div class="text-2xl font-bold text-primary-blue">{{ meData?.user?.puntosReputacion || 0 }}</div>
              <div class="text-sm text-gray-500 font-medium">Reputación</div>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div class="text-2xl font-bold text-primary-blue">{{ meData?.stats?.articulos || 0 }}</div>
              <div class="text-sm text-gray-500 font-medium">Artículos</div>
            </div>
          </div>

          <h6 class="font-bold border-b border-gray-100 pb-3 mb-4 text-gray-900">Información de Contacto</h6>
          <ul class="text-sm text-gray-600 space-y-3">
            <li><i class="bi bi-envelope-fill mr-3 text-gray-400"></i> {{ meData?.user?.email || authStore.user?.email }}</li>
            <li><i class="bi bi-calendar-event-fill mr-3 text-gray-400"></i> Miembro desde {{ new Date(meData?.user?.fechaCreacion || Date.now()).getFullYear() }}</li>
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
            <div class="relative border-l-2 border-gray-200 ml-4 space-y-8 pl-8 py-2">
              <div class="text-gray-500 font-medium">No hay actividad reciente. Intenta subir proyectos o comentar en los foros.</div>
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import EditarPerfilModal from '../components/EditarPerfilModal.vue'

const authStore = useAuthStore()
const meData = ref(null)
const isModalOpen = ref(false)

const fetchProfile = async () => {
  try {
    const res = await api.get('/auth/me')
    meData.value = res.data
  } catch(e) {
    console.error('Error fetching profile', e)
  }
}

onMounted(() => {
  fetchProfile()
})
</script>
