<template>
  <div :class="['bg-white rounded-xl border border-gray-200 shadow-sm p-5', depth > 0 ? 'ml-6 border-l-4 border-l-blue-100' : '']">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-xs">
          {{ userInitials }}
        </div>
        <div class="text-sm">
          <div class="font-bold text-gray-900">{{ authorName }}</div>
          <div class="text-xs text-gray-500">{{ createdAt }}</div>
        </div>
      </div>
      <button v-if="canDelete" @click="$emit('delete', comment.idComentario)" class="text-red-500 hover:text-red-700 text-xs font-semibold">Eliminar</button>
    </div>

    <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ comment.contenido }}</div>

    <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-4">
      <div class="flex items-center gap-2">
        <button @click="$emit('vote', { idComentario: comment.idComentario, tipo: 'upvote' })" class="hover:text-primary-blue">▲</button>
        <span class="font-semibold">{{ comment.score ?? 0 }}</span>
        <button @click="$emit('vote', { idComentario: comment.idComentario, tipo: 'downvote' })" class="hover:text-red-500">▼</button>
      </div>
      <button @click="toggleReply" class="hover:text-primary-blue">Responder</button>
      <button @click="$emit('report', { idComentario: comment.idComentario })" class="hover:text-red-500">Reportar</button>
    </div>

    <div v-if="showReply" class="mt-4">
      <textarea v-model="replyText" rows="3" class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50" placeholder="Escribe tu respuesta..."></textarea>
      <div class="flex justify-end gap-2 mt-2">
        <button @click="cancelReply" class="px-4 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded">Cancelar</button>
        <button @click="submitReply" :disabled="!replyText.trim()" class="px-4 py-1 text-xs text-white bg-primary-blue hover:bg-blue-700 rounded disabled:opacity-50">Publicar</button>
      </div>
    </div>

    <div class="mt-5 space-y-4">
      <ThreadComment
        v-for="child in comment.children"
        :key="child.idComentario"
        :comment="child"
        :depth="depth + 1"
        :can-delete="canDelete"
        @reply="$emit('reply', $event)"
        @vote="$emit('vote', $event)"
        @report="$emit('report', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  comment: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  canDelete: { type: Boolean, default: false }
})

const emit = defineEmits(['reply', 'vote', 'report', 'delete'])

const showReply = ref(false)
const replyText = ref('')

const authorName = computed(() => `Usuario #${props.comment.idUsuario}`)
const userInitials = computed(() => authorName.value.replace('Usuario #', 'U').substring(0, 2))
const createdAt = computed(() => new Date(props.comment.fechaCreacion).toLocaleDateString())

const toggleReply = () => {
  showReply.value = !showReply.value
}

const cancelReply = () => {
  showReply.value = false
  replyText.value = ''
}

const submitReply = () => {
  emit('reply', { idComentarioPadre: props.comment.idComentario, contenido: replyText.value })
  replyText.value = ''
  showReply.value = false
}
</script>
