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
        <span class="text-xs font-bold px-3 py-1 rounded bg-blue-100 text-blue-700">{{ thread.categoria?.nombre || 'General' }}</span>
        <span class="text-xs font-bold px-3 py-1 rounded bg-gray-100 text-gray-700">Hilo #{{ thread.idHilo }}</span>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ thread.titulo }}</h1>
      
      <div class="flex items-center gap-3 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-xs shadow-sm">
          {{ `U${thread.idUsuario}`.substring(0,2).toUpperCase() }}
        </div>
        <div>
          <span class="font-medium text-gray-900">{{ `Usuario #${thread.idUsuario}` }}</span>
          <span class="mx-2">·</span>
          <span>{{ new Date(thread.fechaCreacion).toLocaleDateString() }}</span>
        </div>
      </div>

      <!-- Contenido de duda -->
      <div class="leading-relaxed text-gray-700 whitespace-pre-wrap text-lg mb-8" v-html="thread.contenido"></div>

      <!-- Reacciones (Futuras integraciones de Interacción) -->
      <div class="flex items-center gap-4 text-gray-500">
        <button @click="voteThread('upvote')" class="flex items-center gap-1 hover:text-primary-blue transition">
          <i class="bi bi-hand-thumbs-up"></i> <span class="text-sm font-medium">Upvote</span>
        </button>
        <button @click="voteThread('downvote')" class="flex items-center gap-1 hover:text-red-500 transition">
          <i class="bi bi-hand-thumbs-down"></i> <span class="text-sm font-medium">Downvote</span>
        </button>
        <span class="text-sm font-semibold">Score: {{ threadScore }}</span>
        <button @click="reportContent({ idHilo: thread.idHilo })" class="flex items-center gap-1 hover:text-red-500 transition">
          <i class="bi bi-flag"></i> <span class="text-sm font-medium">Reportar</span>
        </button>
      </div>
    </div>

    <!-- Sección de Respuestas -->
    <div v-if="thread">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h3 class="text-xl font-bold text-gray-900">{{ totalComments }} Respuestas</h3>
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" v-model="orderByScore" @change="fetchComments" />
          Ordenar por relevancia
        </label>
      </div>

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
        <ThreadComment
          v-for="c in commentTree"
          :key="c.idComentario"
          :comment="c"
          :can-delete="authStore.isAdmin || authStore.isModerator"
          @reply="submitReply"
          @vote="voteComment"
          @report="reportContent"
          @delete="deleteComment"
        />
        
        <div v-if="commentTree.length === 0" class="text-center py-10 bg-gray-50 border border-gray-100 rounded-xl text-gray-500">
          Aún no hay respuestas. ¡Sé el primero en ayudar!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import ThreadComment from '../components/ThreadComment.vue'

const route = useRoute()
const authStore = useAuthStore()

const thread = ref(null)
const comments = ref([])
const newComment = ref('')
const loading = ref(true)
const orderByScore = ref(false)
const threadScore = ref(0)

const totalComments = computed(() => comments.value.length)

const commentTree = computed(() => buildCommentTree(comments.value))

const fetchThreadData = async () => {
  loading.value = true
  try {
    const threadId = route.params.id
    const tRes = await api.get(`/social/threads/${threadId}`)
    thread.value = tRes.data
    await fetchComments()
  } catch (error) {
    console.error('Error cargando hilo:', error)
    alert('No se pudo cargar el hilo.')
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  const threadId = route.params.id
  if (orderByScore.value) {
    const cRes = await api.get(`/social/threads/${threadId}/comments/ranked`)
    comments.value = (cRes.data || []).map((row) => ({
      ...row.comment,
      score: row.score
    }))
  } else {
    const cRes = await api.get(`/social/threads/${threadId}/comments`)
    comments.value = cRes.data.items || cRes.data || []
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
    await fetchComments()
  } catch (err) {
    alert('Hubo un error al enviar tu comentario.')
  }
}

const submitReply = async ({ idComentarioPadre, contenido }) => {
  if (!contenido.trim()) return
  try {
    const threadId = route.params.id
    await api.post(`/social/threads/${threadId}/comments`, {
      contenido,
      idComentarioPadre
    })
    await fetchComments()
  } catch (err) {
    alert('No se pudo enviar la respuesta.')
  }
}

const voteThread = async (tipo) => {
  try {
    const res = await api.post('/social/votes', {
      tipo,
      idHilo: thread.value.idHilo
    })
    threadScore.value = res.data.score
  } catch (error) {
    alert('No se pudo votar el hilo.')
  }
}

const voteComment = async ({ idComentario, tipo }) => {
  try {
    const res = await api.post('/social/votes', {
      tipo,
      idComentario
    })
    const updated = comments.value.map((comment) =>
      comment.idComentario === idComentario
        ? { ...comment, score: res.data.score }
        : comment
    )
    comments.value = updated
  } catch (error) {
    alert('No se pudo registrar el voto.')
  }
}

const reportContent = async ({ idHilo, idComentario }) => {
  const razon = prompt('Razón del reporte (ej: spam, abuso, lenguaje ofensivo)')
  if (!razon) return
  const descripcion = prompt('Descripción (opcional)')
  try {
    await api.post('/social/reports', {
      razon,
      descripcion: descripcion || undefined,
      idHilo,
      idComentario
    })
    alert('Reporte enviado correctamente.')
  } catch (error) {
    alert('No se pudo enviar el reporte.')
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

const buildCommentTree = (items) => {
  const map = new Map()
  const roots = []

  items.forEach((comment) => {
    map.set(comment.idComentario, { ...comment, children: [] })
  })

  map.forEach((comment) => {
    if (comment.idComentarioPadre) {
      const parent = map.get(comment.idComentarioPadre)
      if (parent) {
        parent.children.push(comment)
      } else {
        roots.push(comment)
      }
    } else {
      roots.push(comment)
    }
  })

  return roots
}
</script>
