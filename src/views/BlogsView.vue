<template>
  <div class="max-w-7xl mx-auto">
    
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-1">Blogs y Artículos</h2>
        <p class="text-gray-500">Tutoriales, investigaciones y guías de la comunidad.</p>
      </div>
      <button class="bg-primary-blue hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-sm transition flex items-center">
        <i class="bi bi-pen mr-2"></i> Escribir Artículo
      </button>
    </div>

    <!-- Featured Article -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
      <div class="flex flex-col md:flex-row h-full">
        <div class="md:w-5/12 bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center min-h-[280px]">
          <i class="bi bi-box-seam text-white opacity-50 text-8xl"></i>
        </div>
        <div class="md:w-7/12 p-10 flex flex-col justify-center">
          <span class="bg-blue-50 text-primary-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block w-max mb-4">Artículo Destacado</span>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Guía de Supervivencia: Migrando Arquitecturas Monolíticas a Microservicios</h3>
          <p class="text-gray-600 text-lg leading-relaxed mb-6">
            Aprende los conceptos fundamentales que necesitarás para el proyecto de Software Avanzado. Exploramos estrategias de estrangulamiento de monolitos, comunicación asíncrona mediante colas de eventos (RabbitMQ) y despliegue usando contenedores en la nube.
          </p>
          
          <div class="flex items-center justify-between mt-auto">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">IP</div>
              <div>
                <div class="font-bold text-gray-900 text-sm">Ing. Pablo Gómez</div>
                <div class="text-gray-500 text-xs">18 Mar 2026 · 12 min de lectura</div>
              </div>
            </div>
            <a href="#" class="px-5 py-2 border border-primary-blue text-primary-blue rounded-full font-medium hover:bg-blue-50 transition">
              Leer Artículo <i class="bi bi-arrow-right ml-1"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Categories -->
    <div class="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <button class="bg-blue-50 text-primary-blue px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap">Todas</button>
      <button class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition">Tutoriales</button>
      <button class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition">Investigación</button>
      <button class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition">DevOps</button>
      <button class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition">Tips Académicos</button>
    </div>

    <!-- Blog Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      
      <!-- Card 1 -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
        <div class="h-48 bg-yellow-200"></div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex justify-between items-center mb-3">
            <span class="bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Tutorial</span>
            <i class="bi bi-bookmark text-gray-400 hover:text-primary-blue cursor-pointer"></i>
          </div>
          <h4 class="text-xl font-bold text-gray-900 mb-3 leading-snug">Clean Code aplicado en Java para Estructuras de Datos</h4>
          <p class="text-gray-600 text-sm mb-6 line-clamp-3">Tener código limpio facilita el momento de calificar. Revisaremos los principios de Robert C. Martin aplicados específicamente a nodos, árboles y listas en la Práctica 1.</p>
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold text-[10px]">AM</div>
              <span class="text-sm text-gray-900 font-medium">Ana Martínez</span>
            </div>
            <span class="text-xs text-gray-500">5 min lect.</span>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
        <div class="h-48 bg-cyan-200"></div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex justify-between items-center mb-3">
            <span class="bg-cyan-50 text-cyan-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">DevOps</span>
            <i class="bi bi-bookmark-fill text-primary-blue cursor-pointer"></i>
          </div>
          <h4 class="text-xl font-bold text-gray-900 mb-3 leading-snug">Introducción a GitHub Actions para Entregas de Laboratorio</h4>
          <p class="text-gray-600 text-sm mb-6 line-clamp-3">Automatiza pruebas unitarias (Jest/JUnit) y despliegues cada vez que hagas un push a la rama main. Ahorra tiempo en tus evaluaciones finales.</p>
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-[10px]">SP</div>
              <span class="text-sm text-gray-900 font-medium">Silvia Pineda</span>
            </div>
            <span class="text-xs text-gray-500">8 min lect.</span>
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
        <div class="h-48 bg-purple-200"></div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex justify-between items-center mb-3">
            <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Investigación</span>
            <i class="bi bi-bookmark text-gray-400 hover:text-primary-blue cursor-pointer"></i>
          </div>
          <h4 class="text-xl font-bold text-gray-900 mb-3 leading-snug">El futuro de los Compiladores con Inteligencia Artificial</h4>
          <p class="text-gray-600 text-sm mb-6 line-clamp-3">Un análisis profundo de cómo los LLMs están revolucionando el análisis léxico y sintáctico, y qué significa esto para la materia de Organización de Lenguajes.</p>
          <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-[10px]">CD</div>
              <span class="text-sm text-gray-900 font-medium">Carlos Dev</span>
            </div>
            <span class="text-xs text-gray-500">15 min lect.</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
</script>
