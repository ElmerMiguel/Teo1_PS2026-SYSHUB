<template>
  <aside class="w-[220px] bg-white border-r border-gray-200 h-full fixed left-0 top-[60px] py-6 overflow-y-auto">
    <nav class="space-y-1">
      <router-link to="/dashboard" custom v-slot="{ isActive, navigate, href }">
        <a :href="href" @click="navigate" :class="navClass(isActive)">
          <i class="bi bi-grid-fill text-lg w-6 mr-3 text-center"></i>
          Dashboard
        </a>
      </router-link>
      
      <router-link to="/perfil" custom v-slot="{ isActive, navigate, href }">
        <a :href="href" @click="navigate" :class="navClass(isActive)">
          <i class="bi bi-person-fill text-lg w-6 mr-3 text-center"></i>
          Mi Perfil / Material
        </a>
      </router-link>
      
      <router-link to="/crear-repo" custom v-slot="{ isActive, navigate, href }">
        <a :href="href" @click="navigate" :class="navClass(isActive)">
          <i class="bi bi-cloud-arrow-up-fill text-lg w-6 mr-3 text-center"></i>
          Crear Proyecto
        </a>
      </router-link>
      
      <router-link to="/foros" custom v-slot="{ isActive, navigate, href }">
        <a :href="href" @click="navigate" :class="navClass(isActive)">
          <i class="bi bi-chat-square-text-fill text-lg w-6 mr-3 text-center"></i>
          Foros
        </a>
      </router-link>
      
      <router-link to="/blogs" custom v-slot="{ isActive, navigate, href }">
        <a :href="href" @click="navigate" :class="navClass(isActive)">
          <i class="bi bi-journal-text text-lg w-6 mr-3 text-center"></i>
          Blogs / Artículos
        </a>
      </router-link>
      
      <router-link to="/guardados" custom v-slot="{ isActive, navigate, href }">
        <a :href="href" @click="navigate" :class="navClass(isActive)">
          <i class="bi bi-bookmark-fill text-lg w-6 mr-3 text-center"></i>
          Guardados
        </a>
      </router-link>

      <!-- Admin Panel link if Admin or Auxiliar -->
      <div v-if="authStore.isAdmin || authStore.isAuxiliar">
        <hr class="mx-6 my-4 border-gray-200" />
        <a href="#" class="flex items-center px-6 py-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition cursor-not-allowed" title="Próximamente">
          <i class="bi bi-gear-fill text-lg w-6 mr-3 text-center"></i>
          Administración
        </a>
      </div>

    </nav>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const navClass = (isActive) => {
  const base = "flex items-center px-6 py-3 text-sm font-medium transition-colors border-r-4 "
  if (isActive) {
    return base + "bg-blue-50 text-primary-blue border-primary-blue"
  } else {
    return base + "text-gray-600 hover:bg-gray-50 hover:text-primary-blue border-transparent"
  }
}
</script>
