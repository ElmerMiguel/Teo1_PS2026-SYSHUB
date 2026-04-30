<template>
  <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
    
    <!-- Left Column: Threads -->
    <div class="flex-1">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Foros de Discusión</h2>
        <button class="bg-primary-blue text-white px-4 py-2 rounded-md font-medium text-sm lg:hidden shadow-sm">
          ＋ Nuevo Hilo
        </button>
      </div>

      <!-- Filters & Threads -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        
        <div class="flex justify-between items-center px-4 py-3 border-b border-gray-200 flex-wrap gap-3">
          <ul class="flex space-x-6 text-sm font-medium">
            <li><a href="#" class="text-primary-blue border-b-2 border-primary-blue pb-3">Recientes</a></li>
            <li><a href="#" class="text-gray-500 hover:text-gray-700 pb-3">Populares</a></li>
            <li><a href="#" class="text-gray-500 hover:text-gray-700 pb-3">Sin Responder</a></li>
            <li><a href="#" class="text-gray-500 hover:text-gray-700 pb-3">Mis Hilos</a></li>
          </ul>
          <select class="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-primary-blue focus:border-primary-blue block p-2 outline-none">
            <option>Todas las categorías</option>
            <option>Desarrollo Web</option>
            <option>IA y ML</option>
            <option>Infraestructura</option>
          </select>
        </div>

        <div class="flex border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer">
          <div class="w-16 bg-gray-50 flex flex-col items-center justify-center py-4 border-r border-gray-200">
            <button class="text-primary-blue hover:text-blue-700 font-bold">▲</button>
            <span class="font-bold my-1 text-gray-900">156</span>
            <button class="text-gray-400 hover:text-gray-600 font-bold">▼</button>
          </div>
          <div class="p-4 flex-1">
            <div class="mb-1 flex gap-2 items-center">
              <span class="text-[0.7rem] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Avisos Oficiales</span>
              <span class="text-[0.7rem] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">📌 Destacado</span>
            </div>
            <h5 class="font-bold text-gray-900 mb-1">Reglas generales de Sys-Reddit y fechas importantes Semestre 2026-1</h5>
            <p class="text-xs text-gray-500 mb-2 truncate">Bienvenidos al foro. Por favor lean las normas de convivencia técnica y recuerden los hitos del semestre...</p>
            <div class="text-xs text-gray-500">
              por <span class="text-primary-blue font-medium">admin_usac</span> · hace 1 semana · 💬 45 respuestas · 👁️ 2.1k vistas
            </div>
          </div>
        </div>

        <div class="flex border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer">
          <div class="w-16 bg-gray-50 flex flex-col items-center justify-center py-4 border-r border-gray-200">
            <button class="text-primary-blue hover:text-blue-700 font-bold">▲</button>
            <span class="font-bold my-1 text-gray-900">47</span>
            <button class="text-gray-400 hover:text-gray-600 font-bold">▼</button>
          </div>
          <div class="p-4 flex-1">
            <div class="mb-1 flex gap-2 items-center">
              <span class="text-[0.7rem] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">Desarrollo Web</span>
            </div>
            <h5 class="font-bold text-gray-900 mb-1">¿Cómo manejar autenticación con JWT en Express?</h5>
            <p class="text-xs text-gray-500 mb-2 truncate">Estoy atorado en la Práctica 2, logro generar el token pero en el middleware me da error de firma inválida...</p>
            <div class="text-xs text-gray-500">
              por <span class="text-primary-blue font-medium">carlos_dev</span> · hace 3 horas · 💬 12 respuestas · 👁️ 340 vistas
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Sidebar Widgets -->
    <div class="hidden lg:block w-80">
      <button class="w-full bg-primary-blue hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl mb-6 shadow-sm transition">
        ＋ Crear Nuevo Hilo
      </button>

      <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <h3 class="font-bold text-gray-900 pb-2 mb-3 border-b border-gray-200">📌 Categorías Populares</h3>
        <div class="space-y-3">
          <a href="#" class="flex justify-between items-center text-sm text-gray-600 hover:text-primary-blue group">
            <span>Desarrollo Web</span>
            <span class="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full group-hover:bg-blue-50">234</span>
          </a>
          <a href="#" class="flex justify-between items-center text-sm text-gray-600 hover:text-primary-blue group">
            <span>IA y Machine Learning</span>
            <span class="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full group-hover:bg-blue-50">89</span>
          </a>
          <a href="#" class="flex justify-between items-center text-sm text-gray-600 hover:text-primary-blue group">
            <span>Bases de Datos</span>
            <span class="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full group-hover:bg-blue-50">112</span>
          </a>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <h3 class="font-bold text-gray-900 pb-2 mb-3 border-b border-gray-200">📜 Reglas del Foro</h3>
        <ul class="text-xs text-gray-500 space-y-2 leading-relaxed pl-4 list-disc marker:text-gray-300">
          <li><strong class="text-gray-700">Sé respetuoso:</strong> Trata a tus compañeros con amabilidad.</li>
          <li><strong class="text-gray-700">No pidas solo código:</strong> Muestra lo que has intentado.</li>
          <li><strong class="text-gray-700">Usa etiquetas correctas:</strong> Facilita la búsqueda a otros.</li>
          <li><strong class="text-gray-700">Evita spam:</strong> No dupliques publicaciones.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
