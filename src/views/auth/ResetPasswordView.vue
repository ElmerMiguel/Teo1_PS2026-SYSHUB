<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-6 text-center">Restablecer contraseña</h3>
    <form class="space-y-4" @submit.prevent="handleReset">
      <div>
        <label for="token" class="block text-sm font-medium text-gray-700">Token</label>
        <input id="token" v-model="token" type="text" required
          class="mt-1 focus:ring-primary-blue focus:border-primary-blue block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Nueva contraseña</label>
        <input id="password" v-model="newPassword" type="password" required
          class="mt-1 focus:ring-primary-blue focus:border-primary-blue block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
      </div>
      <button type="submit" :disabled="isLoading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-colors disabled:opacity-50">
        <span v-if="isLoading">Actualizando...</span>
        <span v-else>Actualizar contraseña</span>
      </button>
    </form>
    <div v-if="message" class="mt-4 text-center text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-md p-3">
      {{ message }}
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
import { useRoute } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const token = ref(route.query.token || '')
const newPassword = ref('')
const isLoading = ref(false)
const message = ref('')

const handleReset = async () => {
  isLoading.value = true
  try {
    const res = await api.post('/auth/password/reset', {
      token: token.value,
      newPassword: newPassword.value
    })
    message.value = res.data?.message || 'Contraseña actualizada.'
  } catch (error) {
    message.value = error.response?.data?.message || 'No se pudo actualizar la contraseña.'
  } finally {
    isLoading.value = false
  }
}
</script>
