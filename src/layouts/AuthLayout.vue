<template>
  <div class="min-h-screen bg-bg-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-primary-dark">
        ⚡ Syshub
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Plataforma académica para estudiantes de Ingeniería
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-200">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
// Auth layout, simplificado
</script>
