<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
    <div class="h-32 relative" :class="colorBanner"></div>
    <div class="p-4 flex flex-col flex-grow">
      <h6 class="font-bold text-gray-900 truncate mb-1" :title="project.titulo">{{ project.titulo }}</h6>
      <p class="text-xs text-gray-500 mb-3 line-clamp-2">{{ project.descripcion || 'Sin descripción' }}</p>
      
      <div class="mb-4 flex flex-wrap gap-1">
        <span v-for="tag in techStack" :key="tag" class="text-[0.70rem] px-2 py-1 bg-blue-50 text-primary-blue rounded bg-opacity-70 font-medium">
          {{ tag }}
        </span>
      </div>
      
      <div class="mt-auto">
        <div class="flex items-center mb-4">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" :style="{ backgroundColor: avatarColor }">
            {{ userInitials }}
          </div>
          <div class="ml-2 text-xs text-gray-500">
            {{ authorName }}
          </div>
        </div>
        
        <router-link :to="`/proyectos/${project.idProyecto}`" class="block w-full text-center py-2 px-4 border border-primary-blue text-primary-blue rounded-md text-sm font-medium hover:bg-primary-blue hover:text-white transition-colors">
          Ver Proyecto
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const colorBanner = computed(() => {
  const colors = ['bg-blue-100', 'bg-red-100', 'bg-indigo-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100']
  // Pseudo-random based on id
  return colors[(props.project.idProyecto || 0) % colors.length]
})

const techStack = computed(() => {
  return props.project.etiquetas?.map(e => typeof e === 'string' ? e : e.nombre).slice(0, 3) || []
})

const authorName = computed(() => {
  // En un caso real vendría poblado del backend, aquí puede ser un mock u obj
  return props.project.usuario?.nombre ? `${props.project.usuario.nombre}` : 'Usuario'
})

const userInitials = computed(() => {
  return authorName.value.substring(0,2).toUpperCase()
})

const avatarColor = computed(() => {
  const colors = ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444']
  return colors[authorName.value.length % colors.length]
})
</script>
