<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-6 text-center">Crea tu cuenta</h3>
    <form class="space-y-4" @submit.prevent="handleRegister">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
          <input id="nombre" v-model="form.nombre" type="text" required
            class="mt-1 focus:ring-primary-blue focus:border-primary-blue block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
        </div>
        <div>
          <label for="apellido" class="block text-sm font-medium text-gray-700">Apellido</label>
          <input id="apellido" v-model="form.apellido" type="text" required
            class="mt-1 focus:ring-primary-blue focus:border-primary-blue block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="carnet" class="block text-sm font-medium text-gray-700">Carné</label>
          <input id="carnet" v-model="form.carnet" type="text" required
            class="mt-1 focus:ring-primary-blue focus:border-primary-blue block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
        </div>
        <div>
          <label for="semestre" class="block text-sm font-medium text-gray-700">Semestre</label>
          <input id="semestre" v-model="form.semestre" type="number" min="1" max="10" required
            class="mt-1 focus:ring-primary-blue focus:border-primary-blue block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
        </div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Correo electrónico</label>
        <input id="email" v-model="form.email" type="email" required
          class="mt-1 focus:ring-primary-blue focus:border-primary-blue block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
        <input id="password" v-model="form.password" type="password" required
          class="mt-1 focus:ring-primary-blue focus:border-primary-blue block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" />
      </div>

      <div class="pt-2">
        <button type="submit" :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-colors disabled:opacity-50">
          <span v-if="isLoading">Registrando...</span>
          <span v-else>Crear cuenta</span>
        </button>
      </div>
    </form>

    <div class="mt-6 text-center">
      <router-link to="/auth/login" class="text-sm font-medium text-primary-blue hover:text-blue-500">
        ¿Ya tienes cuenta? Inicia sesión
      </router-link>
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
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  carnet: '',
  semestre: 1
})

const isLoading = ref(false)

const handleRegister = async () => {
  isLoading.value = true
  try {
    const res = await api.post('/auth/register', form.value)
    authStore.setAuthDetails(res.data.accessToken, res.data.user)
    router.push('/dashboard')
  } catch (error) {
    alert(error.response?.data?.message || 'Error al registrar')
  } finally {
    isLoading.value = false
  }
}
</script>
