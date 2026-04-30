<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-3 hover:shadow-sm transition-shadow h-[120px] cursor-pointer" @click="goToArticle">
    <div class="flex h-full">
      <div class="w-1/3 h-full" :class="colorSidebar"></div>
      <div class="w-2/3 p-3 flex flex-col justify-center">
        <h6 class="font-bold text-sm text-gray-900 mb-1 line-clamp-1" :title="article.titulo">{{ article.titulo }}</h6>
        <p class="text-xs text-gray-500 mb-2 line-clamp-2">{{ article.resumen || 'Sin resumen...' }}</p>
        <p class="text-[11px] font-medium text-primary-blue mt-auto">Por {{ authorName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const goToArticle = () => {
  router.push(`/blogs/${props.article.idArticulo}`)
}

const colorSidebar = computed(() => {
  const colors = ['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-red-200']
  return colors[(props.article.idArticulo || 0) % colors.length]
})

const authorName = computed(() => {
  return props.article.usuario?.nombre ? `${props.article.usuario.nombre}` : 'Autor'
})
</script>
