<template>
  <nav class="bg-white border-b border-gray-200 h-[60px] fixed w-full z-30 flex items-center px-4 justify-between">
    <div class="flex items-center w-[220px]">
      <router-link to="/dashboard" class="text-primary-blue font-bold text-xl no-underline">
        ⚡ Syshub
      </router-link>
    </div>
    
    <div class="flex-1 flex justify-center">
      <div class="relative w-full max-w-md">
        <i class="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        <input type="text" class="w-full bg-bg-light border-none rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary-blue outline-none" placeholder="Buscar proyectos, foros, artículos...">
      </div>
    </div>
    
    <div class="flex items-center space-x-6 pr-2">
      <button class="text-gray-500 relative hover:text-gray-700 transition">
        <i class="bi bi-bell-fill text-xl"></i>
        <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
      </button>
      
      <div class="flex items-center space-x-3 cursor-pointer relative group">
        <div class="w-9 h-9 rounded-full bg-primary-blue text-white flex items-center justify-center font-bold text-sm">
          {{ userInitials }}
        </div>
        <span class="font-medium text-gray-900 hidden md:block select-none">{{ userName }}</span>
        
        <!-- Dropdown (Simple) -->
        <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div class="py-1">
            <router-link to="/perfil" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mi Perfil</router-link>
            <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Cerrar Sesión</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => {
  if (!authStore.user) return 'Usuario'
  return `${authStore.user.nombre} ${authStore.user.apellido}`
})

const userInitials = computed(() => {
  if (!authStore.user) return 'US'
  return `${authStore.user.nombre.charAt(0)}${authStore.user.apellido.charAt(0)}`.toUpperCase()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>
