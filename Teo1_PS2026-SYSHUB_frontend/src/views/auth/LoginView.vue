<template>
  <div>
    <form class="space-y-6" @submit.prevent="handleLogin">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="bi bi-envelope text-gray-400"></i>
          </div>
          <input id="email" v-model="form.email" name="email" type="email" autocomplete="email" required
            class="focus:ring-primary-blue focus:border-primary-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
            placeholder="usuario@correo.com" />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i class="bi bi-lock text-gray-400"></i>
          </div>
          <input id="password" v-model="form.password" name="password" type="password" autocomplete="current-password" required
            class="focus:ring-primary-blue focus:border-primary-blue block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
            placeholder="••••••••" />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox"
            class="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded" />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            Recordarme
          </label>
        </div>

        <div class="text-sm">
          <router-link to="/auth/forgot" class="font-medium text-primary-blue hover:text-blue-500">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>
      </div>

      <div>
        <button type="submit" :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-colors disabled:opacity-50">
          <span v-if="isLoading">Cargando...</span>
          <span v-else>Iniciar sesión</span>
        </button>
      </div>
    </form>

    <div class="mt-6 text-center">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">
            ¿Nuevo en Syshub?
          </span>
        </div>
      </div>

      <div class="mt-6">
        <router-link to="/auth/register"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          Crear una cuenta
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) return
  isLoading.value = true
  try {
    const res = await api.post('/auth/login', form.value)
    authStore.setAuthDetails(res.data.accessToken, res.data.user)
    router.push('/dashboard')
  } catch (error) {
    alert(error.response?.data?.message || 'Error al iniciar sesión')
  } finally {
    isLoading.value = false
  }
}
</script>
