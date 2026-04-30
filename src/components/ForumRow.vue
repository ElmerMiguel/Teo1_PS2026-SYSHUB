<template>
  <div class="px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer" @click="goToThread">
    <div class="flex justify-between items-center">
      <div>
        <h6 class="font-bold text-gray-900 mb-1">{{ thread.titulo }}</h6>
        <div class="flex items-center text-xs text-gray-500">
          <span class="px-2 py-0.5 rounded text-[10px] font-medium mr-3" :class="categoryBadgeClass">
            {{ categoryName }}
          </span>
          <div class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white mr-1" :style="{ backgroundColor: avatarColor }">
            {{ userInitials }}
          </div>
          <span>{{ authorName }} · {{ timeAgo }}</span>
        </div>
      </div>
      <div class="text-right text-xs text-gray-500 min-w-[80px]">
        <div class="mb-1"><i class="bi bi-chat-text mr-1"></i> {{ thread.respuestas || 0 }} rep.</div>
        <div><i class="bi bi-eye mr-1"></i> {{ thread.vistas || 0 }} vis.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  thread: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToThread = () => {
  router.push(`/foros/${props.thread.idHilo}`)
}

const categoryName = computed(() => props.thread.categoria?.nombre || 'General')

const categoryBadgeClass = computed(() => {
  // Dependiendo la categoría dar un color
  const cat = categoryName.value.toLowerCase()
  if (cat.includes('desarrollo')) return 'bg-blue-100 text-blue-700'
  if (cat.includes('estructura')) return 'bg-pink-100 text-pink-700'
  if (cat.includes('infraestructura')) return 'bg-green-100 text-green-700'
  if (cat.includes('bd') || cat.includes('base')) return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-700'
})

const authorName = computed(() => `Usuario #${props.thread.idUsuario || 'N/A'}`)
const userInitials = computed(() => authorName.value.replace('Usuario #', 'U').substring(0,2).toUpperCase())
const timeAgo = computed(() => props.thread.fechaCreacion ? new Date(props.thread.fechaCreacion).toLocaleDateString() : 'reciente')

const avatarColor = computed(() => {
  const colors = ['#6b7280', '#ec4899', '#f59e0b', '#3b82f6']
  return colors[(props.thread.idHilo || 0) % colors.length]
})
</script>
