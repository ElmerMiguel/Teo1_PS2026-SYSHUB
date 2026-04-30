<template>
  <div class="max-w-4xl mx-auto pb-12">
    <router-link to="/blogs" class="mb-6 inline-flex items-center text-primary-blue font-medium hover:underline">
      <i class="bi bi-arrow-left mr-2"></i> Volver a Blogs
    </router-link>

    <div v-if="loading" class="text-center py-16 text-gray-500">Cargando artículo...</div>

    <div v-else-if="article" class="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
        <span class="font-semibold text-gray-900">{{ article.titulo }}</span>
        <span>·</span>
        <span>{{ new Date(article.fechaPublicacion).toLocaleDateString() }}</span>
        <span>·</span>
        <span>Autor #{{ article.idAutor }}</span>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ article.titulo }}</h1>

      <div class="prose max-w-none" v-html="article.contenidoHtml"></div>

      <div class="flex flex-wrap items-center gap-4 text-gray-500 mt-6">
        <button @click="voteArticle('upvote')" class="flex items-center gap-1 hover:text-primary-blue transition">
          <i class="bi bi-hand-thumbs-up"></i> <span class="text-sm font-medium">Upvote</span>
        </button>
        <button @click="voteArticle('downvote')" class="flex items-center gap-1 hover:text-red-500 transition">
          <i class="bi bi-hand-thumbs-down"></i> <span class="text-sm font-medium">Downvote</span>
        </button>
        <span class="text-sm font-semibold">Score: {{ articleScore }}</span>
      </div>
    </div>

    <div v-if="article" class="mt-10">
      <h3 class="text-xl font-bold text-gray-900 mb-6">{{ comments.length }} Comentarios</h3>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <textarea v-model="newComment" rows="3" placeholder="Añade tu comentario..." class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50"></textarea>
        <div class="flex justify-end mt-3">
          <button @click="submitComment" :disabled="!newComment.trim()" class="px-6 py-2 bg-primary-blue text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">Publicar Comentario</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="comment in comments" :key="comment.idComentario" class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm font-semibold text-gray-800">Usuario #{{ comment.idUsuario }}</div>
            <div class="text-xs text-gray-500">{{ new Date(comment.fechaCreacion).toLocaleDateString() }}</div>
          </div>
          <div class="text-gray-700 whitespace-pre-wrap">{{ comment.contenido }}</div>
          <div class="flex items-center gap-3 text-xs text-gray-500 mt-3">
            <button @click="voteComment(comment.idComentario, 'upvote')" class="hover:text-primary-blue">▲</button>
            <span class="font-semibold">{{ comment.score ?? 0 }}</span>
            <button @click="voteComment(comment.idComentario, 'downvote')" class="hover:text-red-500">▼</button>
            <button @click="reportComment(comment.idComentario)" class="hover:text-red-500">Reportar</button>
          </div>
        </div>

        <div v-if="comments.length === 0" class="text-center py-10 bg-gray-50 border border-gray-100 rounded-xl text-gray-500">
          No hay comentarios aún.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const article = ref(null)
const comments = ref([])
const newComment = ref('')
const loading = ref(false)
const articleScore = ref(0)

const fetchArticle = async () => {
  loading.value = true
  try {
    const res = await api.get(`/social/articles/${route.params.id}`)
    article.value = res.data
    await fetchComments()
  } catch (error) {
    console.error('Error cargando artículo', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  const res = await api.get(`/social/articles/${route.params.id}/comments`)
  comments.value = res.data.items || res.data || []
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  try {
    await api.post(`/social/articles/${route.params.id}/comments`, {
      contenido: newComment.value
    })
    newComment.value = ''
    await fetchComments()
  } catch (error) {
    alert('No se pudo publicar el comentario.')
  }
}

const voteArticle = async (tipo) => {
  try {
    const res = await api.post('/social/votes', {
      tipo,
      idArticulo: article.value.idArticulo
    })
    articleScore.value = res.data.score
  } catch (error) {
    alert('No se pudo registrar el voto.')
  }
}

const voteComment = async (idComentario, tipo) => {
  try {
    const res = await api.post('/social/votes', {
      tipo,
      idComentario
    })
    comments.value = comments.value.map((comment) =>
      comment.idComentario === idComentario ? { ...comment, score: res.data.score } : comment
    )
  } catch (error) {
    alert('No se pudo registrar el voto del comentario.')
  }
}

const reportComment = async (idComentario) => {
  const razon = prompt('Razón del reporte')
  if (!razon) return
  const descripcion = prompt('Descripción (opcional)')
  try {
    await api.post('/social/reports', {
      razon,
      descripcion: descripcion || undefined,
      idComentario
    })
    alert('Reporte enviado correctamente.')
  } catch (error) {
    alert('No se pudo enviar el reporte.')
  }
}

onMounted(() => {
  fetchArticle()
})
</script>
