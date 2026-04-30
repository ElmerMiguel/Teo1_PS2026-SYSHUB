<template>
  <div class="max-w-4xl mx-auto">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-6">
      <ol class="flex text-sm text-gray-500 space-x-2">
        <li><a href="#" class="hover:text-primary-blue">Inicio</a></li>
        <li><span class="mx-2">/</span></li>
        <li><a href="#" class="hover:text-primary-blue">Mis Proyectos</a></li>
        <li><span class="mx-2">/</span></li>
        <li class="font-bold text-gray-900" aria-current="page">Nuevo Proyecto</li>
      </ol>
    </nav>

    <h2 class="text-3xl font-bold mb-8 text-gray-900">Subir Nuevo Proyecto</h2>

    <!-- Stepper -->
    <div class="flex justify-between mb-10 relative px-4">
      <div class="absolute top-1/2 left-[10%] w-[80%] h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
      
      <div class="relative z-10 flex flex-col items-center flex-1">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 bg-primary-blue border-primary-blue text-white shadow-[0_0_0_4px_#dbeafe]">1</div>
        <div class="text-sm font-semibold text-primary-blue">Información Básica</div>
      </div>
      <div class="relative z-10 flex flex-col items-center flex-1">
        <div class="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center font-bold text-gray-400 mb-2">2</div>
        <div class="text-sm font-semibold text-gray-500">Detalles Técnicos</div>
      </div>
      <div class="relative z-10 flex flex-col items-center flex-1">
        <div class="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center font-bold text-gray-400 mb-2">3</div>
        <div class="text-sm font-semibold text-gray-500">Publicar</div>
      </div>
    </div>

    <!-- MAIN FORM -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
      <h5 class="font-bold text-lg mb-6 border-b border-gray-200 pb-3">1. Información del Proyecto</h5>
      
      <div class="space-y-6">
        <div>
          <label class="block font-medium text-gray-700 text-sm mb-2">Título del Proyecto <span class="text-red-500">*</span></label>
          <input type="text" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue focus:border-primary-blue outline-none" placeholder="Ej: Sistema de Control de Inventario con Django" value="Sistema de Control de Inventario con Django">
        </div>

        <div>
          <label class="block font-medium text-gray-700 text-sm mb-2">Descripción <span class="text-red-500">*</span></label>
          <textarea class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue focus:border-primary-blue outline-none" rows="4" placeholder="Describe brevemente el proyecto, su objetivo y cómo funciona...">Sistema backend para controlar bodegas, entradas y salidas de mercancía desarrollado como proyecto base para el curso de Análisis 2.</textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-medium text-gray-700 text-sm mb-2">Categoría Principal</label>
            <select class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue focus:border-primary-blue outline-none">
              <option>Seleccionar...</option>
              <option selected>Desarrollo Web</option>
              <option>IA y Machine Learning</option>
              <option>Infraestructura</option>
              <option>Bases de Datos</option>
              <option>Redes</option>
            </select>
          </div>
          <div>
            <label class="block font-medium text-gray-700 text-sm mb-2">Semestre / Ciclo</label>
            <select class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue focus:border-primary-blue outline-none">
              <option selected>2026-1</option>
              <option>2025-2</option>
              <option>2025-1</option>
              <option>Anterior</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-medium text-gray-700 text-sm mb-2">Curso Relacionado (Opcional)</label>
          <input type="text" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue focus:border-primary-blue outline-none" placeholder="Ej: Organización de Lenguajes y Compiladores" value="Análisis y Diseño de Sistemas 2">
        </div>
      </div>

      <div class="flex justify-between mt-10">
        <button class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition">Cancelar</button>
        <button class="px-6 py-2 bg-primary-blue text-white rounded-md font-medium hover:bg-blue-700 transition flex items-center">
          Siguiente <i class="bi bi-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
    
  </div>
</template>

<script setup>
</script>
