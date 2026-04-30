<template>
  <div class="max-w-5xl mx-auto">
    
    <div class="flex flex-col md:flex-row md:justify-between md:items-end mb-8 pb-4 border-b border-gray-200 gap-4">
      <div>
        <h2 class="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
          <i class="bi bi-bookmark-star text-primary-blue"></i> Mi Material Guardado
        </h2>
        <p class="text-gray-500 text-sm">Colección privada de repositorios, hilos de dudas y artículos relevantes.</p>
      </div>
      
      <!-- Quick Filters -->
      <div class="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm overflow-x-auto">
        <button class="px-4 py-1.5 bg-blue-50 text-primary-blue font-medium rounded-md whitespace-nowrap">
          Todos <span class="bg-white text-primary-blue text-xs font-bold px-1.5 py-0.5 rounded shadow-sm ml-2">8</span>
        </button>
        <button class="px-4 py-1.5 text-gray-500 font-medium hover:text-gray-700 whitespace-nowrap transition">Proyectos</button>
        <button class="px-4 py-1.5 text-gray-500 font-medium hover:text-gray-700 whitespace-nowrap transition">Foros</button>
        <button class="px-4 py-1.5 text-gray-500 font-medium hover:text-gray-700 whitespace-nowrap transition">Artículos</button>
      </div>
    </div>

    <!-- List of Saved Items -->
    <div class="space-y-4 mb-8">
      
      <!-- Item 1: Project -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 flex gap-6 hover:border-blue-300 transition shadow-sm group">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-blue-50 text-blue-600">
          <i class="bi bi-folder-symlink"></i>
        </div>
        <div class="flex-grow">
          <span class="text-[0.65rem] font-bold uppercase tracking-widest text-blue-600 mb-2 block">Repositorio de Proyecto</span>
          <a href="#" class="text-lg font-bold text-gray-900 hover:text-primary-blue transition mb-2 block">Sistema de Gestión de Inventarios</a>
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="text-xs px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded">Python</span>
            <span class="text-xs px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded">Django</span>
            <span class="text-xs px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded">PostgreSQL</span>
          </div>
          <div class="flex gap-6 text-sm text-gray-500">
            <span><i class="bi bi-person mr-1"></i> Autor: Ana Martínez</span>
            <span><i class="bi bi-clock mr-1"></i> Guardado hace 2 días</span>
          </div>
        </div>
        <button class="text-primary-blue hover:text-red-500 transition text-xl self-start p-2" title="Quitar de guardados">
          <i class="bi bi-bookmark-fill group-hover:block hidden"></i>
          <i class="bi bi-bookmark-fill block group-hover:hidden text-gray-300"></i>
        </button>
      </div>

      <!-- Item 2: Forum -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 flex gap-6 hover:border-blue-300 transition shadow-sm group">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-cyan-50 text-cyan-600">
          <i class="bi bi-chat-left-dots"></i>
        </div>
        <div class="flex-grow">
          <span class="text-[0.65rem] font-bold uppercase tracking-widest text-cyan-600 mb-2 block">Hilo de Foro</span>
          <a href="#" class="text-lg font-bold text-gray-900 hover:text-primary-blue transition mb-2 block">¿Cómo manejar autenticación con JWT en Express?</a>
          <p class="text-sm text-gray-500 mb-3 max-w-3xl line-clamp-2">Problema frecuente en la Práctica 2 sobre variables de entorno cargando antes del middleware...</p>
          <div class="flex gap-6 text-sm text-gray-500">
            <span><i class="bi bi-person mr-1"></i> Autor: carlos_dev</span>
            <span class="text-primary-blue font-medium"><i class="bi bi-check-circle-fill mr-1"></i> Contiene respuesta útil (15 votos)</span>
          </div>
        </div>
        <button class="text-primary-blue hover:text-red-500 transition text-xl self-start p-2" title="Quitar de guardados">
          <i class="bi bi-bookmark-fill group-hover:block hidden"></i>
          <i class="bi bi-bookmark-fill block group-hover:hidden text-gray-300"></i>
        </button>
      </div>

      <!-- Item 3: Blog -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 flex gap-6 hover:border-blue-300 transition shadow-sm group">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-yellow-50 text-yellow-600">
          <i class="bi bi-journal-richtext"></i>
        </div>
        <div class="flex-grow">
          <span class="text-[0.65rem] font-bold uppercase tracking-widest text-yellow-600 mb-2 block">Artículo / Blog</span>
          <a href="#" class="text-lg font-bold text-gray-900 hover:text-primary-blue transition mb-2 block">Introducción a GitHub Actions para Entregas de Laboratorio</a>
          <p class="text-sm text-gray-500 mb-3 max-w-3xl line-clamp-2">Automatiza pruebas unitarias y despliegues. Excelente guía para calificar más rápido los proyectos de Desarrollo Web.</p>
          <div class="flex gap-6 text-sm text-gray-500">
            <span><i class="bi bi-person mr-1"></i> Autor: Aux. Silvia Pineda</span>
            <span><i class="bi bi-clock mr-1"></i> Guardado hace 1 semana</span>
          </div>
        </div>
        <button class="text-primary-blue hover:text-red-500 transition text-xl self-start p-2" title="Quitar de guardados">
          <i class="bi bi-bookmark-fill group-hover:block hidden"></i>
          <i class="bi bi-bookmark-fill block group-hover:hidden text-gray-300"></i>
        </button>
      </div>

      <!-- Item 4: Project -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 flex gap-6 hover:border-blue-300 transition shadow-sm group opacity-70 hover:opacity-100">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-blue-50 text-blue-600">
          <i class="bi bi-folder-symlink"></i>
        </div>
        <div class="flex-grow">
          <span class="text-[0.65rem] font-bold uppercase tracking-widest text-blue-600 mb-2 block">Repositorio de Proyecto</span>
          <a href="#" class="text-lg font-bold text-gray-900 hover:text-primary-blue transition mb-2 block">Simulador de SO en C</a>
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="text-xs px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded">C</span>
            <span class="text-xs px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded">Linux</span>
            <span class="text-xs px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded">Bash</span>
          </div>
          <div class="flex gap-6 text-sm text-gray-500">
            <span><i class="bi bi-person mr-1"></i> Autor: Luis Gómez</span>
            <span><i class="bi bi-clock mr-1"></i> Guardado hace 1 mes</span>
          </div>
        </div>
        <button class="text-primary-blue hover:text-red-500 transition text-xl self-start p-2" title="Quitar de guardados">
          <i class="bi bi-bookmark-fill group-hover:block hidden"></i>
          <i class="bi bi-bookmark-fill block group-hover:hidden text-gray-300"></i>
        </button>
      </div>

    </div>

    <div class="text-center">
      <button class="px-6 py-2 border border-gray-300 text-gray-600 font-medium rounded-md hover:bg-gray-50 transition">
        Cargar más elementos...
      </button>
    </div>

  </div>
</template>

<script setup>
</script>
