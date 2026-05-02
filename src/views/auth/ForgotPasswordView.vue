<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-6 text-center">Recuperar contraseña</h3>
    <form class="space-y-4" @submit.prevent="handleRequest">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Correo electrónico</label>
        <input id="email" v-model="email" type="email" required
          class="mt-1 focus:ring-primary-blue focus:border-primary-blue block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
      </div>
      <button type="submit" :disabled="isLoading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-colors disabled:opacity-50">
        <span v-if="isLoading">Enviando...</span>
        <span v-else>Enviar enlace</span>
      </button>
    </form>
    <div v-if="message" class="mt-4 text-center text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-md p-3 space-y-2">
      <div>{{ message }}</div>
      <div v-if="resetUrl" class="text-xs text-blue-800 break-words">
        <span class="font-semibold">Enlace:</span>
        <a :href="resetUrl" class="underline" target="_blank" rel="noopener">{{ resetUrl }}</a>
      </div>
    </div>
    <div class="mt-6 text-center">
      <router-link to="/auth/login" class="text-sm font-medium text-primary-blue hover:text-blue-500">
        Volver al login
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../services/api'

const email = ref('')
const isLoading = ref(false)
const message = ref('')
const resetUrl = ref('')

const handleRequest = async () => {
  isLoading.value = true
  try {
    const res = await api.post('/auth/password/reset/request', { email: email.value })
    message.value = res.data?.message || 'Si el correo existe, recibirás instrucciones.'
    resetUrl.value = res.data?.resetUrl || ''
  } catch (error) {
    message.value = error.response?.data?.message || 'No se pudo procesar la solicitud.'
    resetUrl.value = ''
  } finally {
    isLoading.value = false
  }
}
</script>
