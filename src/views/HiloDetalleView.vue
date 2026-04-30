<template>
  <div class="max-w-4xl mx-auto pb-12">
    <!-- Navegación y vuelta -->
    <button @click="$router.back()" class="mb-6 text-primary-blue font-medium hover:underline flex items-center">
      <i class="bi bi-arrow-left mr-2"></i> Volver a Foros
    </button>

    <div v-if="loading" class="text-center py-20">Cargando hilo...</div>

    <div v-else-if="thread" class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
      <!-- Encabezado del Hilo -->
      <div class="flex gap-2 items-center mb-4">
        <span class="text-xs font-bold px-3 py-1 rounded bg-blue-100 text-blue-700">Categoría ID: {{ thread.idCategoria || 'General' }}</span>
        <span class="text-xs font-bold px-3 py-1 rounded bg-gray-100 text-gray-700">Hilo #{{ thread.idHilo }}</span>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ thread.titulo }}</h1>
      
      <div class="flex items-center gap-3 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-xs shadow-sm">
          {{ thread.usuario?.nombre ? thread.usuario.nombre.substring(0,2).toUpperCase() : 'U' }}
        </div>
        <div>
          <span class="font-medium text-gray-900">{{ thread.usuario?.nombre || 'Usuario Anónimo' }}</span>
          <span class="mx-2">·</span>
          <span>{{ new Date(thread.fechaCreacion).toLocaleDateString() }}</span>
        </div>
      </div>

      <!-- Contenido de duda -->
      <div class="leading-relaxed text-gray-700 whitespace-pre-wrap text-lg mb-8" v-html="thread.contenido"></div>

      <!-- Reacciones (Futuras integraciones de Interacción) -->
      <div class="flex items-center gap-4 text-gray-500">
        <button class="flex items-center gap-1 hover:text-primary-blue transition">
          <i class="bi bi-hand-thumbs-up"></i> <span class="text-sm font-medium">Votar</span>
        </button>
        <button class="flex items-center gap-1 hover:text-red-500 transition">
          <i class="bi bi-flag"></i> <span class="text-sm font-medium">Reportar</span>
        </button>
      </div>
    </div>

    <!-- Sección de Respuestas -->
    <div v-if="thread">
      <h3 class="text-xl font-bold text-gray-900 mb-6">{{ comments.length }} Respuestas</h3>

      <!-- Caja para comentar -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8 flex gap-4">
        <div class="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center font-bold text-white shadow">
          {{ authStore.user?.nombre ? authStore.user.nombre.charAt(0) : 'Tu' }}
        </div>
        <div class="flex-1">
          <textarea v-model="newComment" rows="3" placeholder="Añade tu respuesta conceptual o código de ejemplo..." class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50"></textarea>
          <div class="flex justify-end mt-3">
            <button @click="submitComment" :disabled="!newComment.trim()" class="px-6 py-2 bg-primary-blue text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">Publicar Respuesta</button>
          </div>
        </div>
      </div>

      <!-- Lista de Comentarios -->
      <div class="space-y-6">
        <div v-for="c in comments" :key="c.idComentario" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-xs">
                {{ c.usuario?.nombre ? c.usuario.nombre.substring(0,2).toUpperCase() : 'U' }}
              </div>
              <div class="text-sm">
                <div class="font-bold text-gray-900">{{ c.usuario?.nombre || 'Usuario' }}</div>
                <div class="text-xs text-gray-500">{{ new Date(c.fechaCreacion).toLocaleDateString() }}</div>
              </div>
            </div>
            <!-- Acciones moderador -->
            <button v-if="authStore.isAdmin || authStore.isModerador" @click="deleteComment(c.idComentario)" class="text-red-500 hover:text-red-700 text-sm font-medium">Eliminar</button>
          </div>
          <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ c.contenido }}</div>
        </div>
        
        <div v-if="comments.length === 0" class="text-center py-10 bg-gray-50 border border-gray-100 rounded-xl text-gray-500">
          Aún no hay respuestas. ¡Sé el primero en ayudar!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const thread = ref(null)
const comments = ref([])
const newComment = ref('')
const loading = ref(true)

const fetchThreadData = async () => {
  loading.value = true
  try {
    const threadId = route.params.id
    const tRes = await api.get(`/social/threads/${threadId}`)
    thread.value = tRes.data
    
    // Obtener comentarios
    const cRes = await api.get(`/social/threads/${threadId}/comments`)
    // Asumimos un arreglo directo o .items
    comments.value = cRes.data.items || cRes.data || []
  } catch (error) {
    console.error('Error cargando hilo:', error)
    alert('No se pudo cargar el hilo.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchThreadData()
})

const submitComment = async () => {
  if (!newComment.value.trim()) return
  try {
    const threadId = route.params.id
    // Enviamos el comment POST
    await api.post(`/social/threads/${threadId}/comments`, {
      contenido: newComment.value
    })
    
    newComment.value = ''
    // Refrescar
    const cRes = await api.get(`/social/threads/${threadId}/comments`)
    comments.value = cRes.data.items || cRes.data || []
  } catch (err) {
    alert('Hubo un error al enviar tu comentario.')
  }
}

const deleteComment = async (idComentario) => {
  if (!confirm('¿Seguro de que deseas eliminar este comentario?')) return
  try {
    // Endpoints administrativos para borrar comentrios
    await api.delete(`/admin/moderation/comments/${idComentario}`)
    comments.value = comments.value.filter(c => c.idComentario !== idComentario)
  } catch (e) {
    alert('Error al eliminar comentario.')
  }
}
</script>
