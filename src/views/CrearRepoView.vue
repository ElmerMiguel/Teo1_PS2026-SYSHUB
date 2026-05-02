<template>
  <div class="max-w-4xl mx-auto pb-12">
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

  <h2 class="text-3xl font-bold mb-8 text-gray-900">Publicar Proyecto</h2>

    <!-- Stepper -->
    <div class="flex justify-between mb-10 relative px-4">
      <div class="absolute top-1/2 left-[10%] w-[80%] h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
      
      <div class="relative z-10 flex flex-col items-center flex-1">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2', currentStep >= 1 ? 'bg-primary-blue border-primary-blue text-white shadow-[0_0_0_4px_#dbeafe]' : 'bg-white border-2 border-gray-200 text-gray-400']">1</div>
        <div :class="['text-sm font-semibold', currentStep >= 1 ? 'text-primary-blue' : 'text-gray-500']">Información Básica</div>
      </div>
      <div class="relative z-10 flex flex-col items-center flex-1">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2', currentStep >= 2 ? 'bg-primary-blue border-primary-blue text-white shadow-[0_0_0_4px_#dbeafe]' : 'bg-white border-2 border-gray-200 text-gray-400']">2</div>
        <div :class="['text-sm font-semibold', currentStep >= 2 ? 'text-primary-blue' : 'text-gray-500']">Detalles Técnicos</div>
      </div>
      <div class="relative z-10 flex flex-col items-center flex-1">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2', currentStep === 3 ? 'bg-primary-blue border-primary-blue text-white shadow-[0_0_0_4px_#dbeafe]' : 'bg-white border-2 border-gray-200 text-gray-400']">3</div>
        <div :class="['text-sm font-semibold', currentStep === 3 ? 'text-primary-blue' : 'text-gray-500']">Publicar</div>
      </div>
    </div>

    <!-- ESPACIO DE FORMULARIOS -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8" v-if="currentStep === 1">
      <h5 class="font-bold text-lg mb-6 border-b border-gray-200 pb-3">1. Información del Proyecto</h5>
      
      <form @submit.prevent="currentStep = 2" class="space-y-6">
        <div>
          <label class="block font-medium text-gray-700 text-sm mb-2">Título del Proyecto <span class="text-red-500">*</span></label>
          <input required v-model="form.titulo" type="text" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue focus:border-primary-blue outline-none" placeholder="Ej: Sistema de Control de Inventario con Django">
        </div>

        <div>
          <label class="block font-medium text-gray-700 text-sm mb-2">Descripción <span class="text-red-500">*</span></label>
          <textarea required v-model="form.descripcion" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue focus:border-primary-blue outline-none" rows="4" placeholder="Describe brevemente el proyecto, su objetivo y cómo funciona..."></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-medium text-gray-700 text-sm mb-2">Categoría Principal <span class="text-red-500">*</span></label>
            <select v-model="form.idCategoria" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue focus:border-primary-blue outline-none">
              <option value="">Seleccionar...</option>
              <option v-for="cat in categoriasLocales" :key="cat.idCategoria" :value="cat.idCategoria">
                {{ cat.nombre }}
              </option>
            </select>
            <p v-if="categoriasLocales.length === 0" class="text-xs text-red-500 mt-1">Base de datos sin categorías.</p>
          </div>
          <div>
            <label class="block font-medium text-gray-700 text-sm mb-2">Lenguajes Base (Ej. JS, Python)</label>
            <input v-model="form.lenguajes" type="text" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue shadow-sm outline-none" placeholder="Separado por comas">
          </div>
        </div>

        <div>
          <label class="block font-medium text-gray-700 text-sm mb-2">Etiquetas (tags) <span class="text-red-500">*</span></label>
          <input v-model="form.etiquetas" type="text" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-blue shadow-sm outline-none" placeholder="Ej: Java, Grafos, Compiladores">
          <p class="text-xs text-gray-500 mt-1">Separa las etiquetas por coma. Mínimo 1 etiqueta.</p>
        </div>

        <div class="flex justify-between mt-10">
          <button type="button" @click="$router.push('/dashboard')" class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition">Cancelar</button>
          <button type="submit" class="px-6 py-2 bg-primary-blue text-white rounded-md font-medium hover:bg-blue-700 transition flex items-center">
            Siguiente <i class="bi bi-arrow-right ml-2"></i>
          </button>
        </div>
      </form>
    </div>

    <!-- PASO 2 -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8" v-if="currentStep === 2">
      <h5 class="font-bold text-lg mb-6 border-b border-gray-200 pb-3">2. Archivos del Proyecto</h5>
      
      <div class="space-y-6">
        <div>
          <label class="block font-medium text-gray-700 text-sm mb-2">Archivo ZIP o PDF principal</label>
          <input type="file" @change="handleFileUpload" class="w-full border border-gray-300 p-2 rounded-md">
        </div>
        
        <p v-if="selectedFile" class="text-sm font-medium text-green-600 mt-2">Archivo preparado: {{ selectedFile.name }}</p>

        <div class="flex justify-between mt-10">
          <button @click="currentStep = 1" class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition">
            Atrás
          </button>
          <button @click="currentStep = 3" class="px-6 py-2 bg-primary-blue text-white rounded-md font-medium hover:bg-blue-700 transition flex items-center">
            Ver Previsualización <i class="bi bi-eye ml-2"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- PASO 3 -->
    <div class="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 mb-8 text-center" v-if="currentStep === 3">
      <h5 class="font-bold text-xl mb-6">3. Confirmar y Publicar</h5>
      
      <div class="max-w-md mx-auto text-left bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h3 class="font-bold text-lg">{{ form.titulo }}</h3>
        <p class="text-gray-600 text-sm mt-2">{{ form.descripcion }}</p>
        <div class="mt-4 text-xs font-semibold text-blue-600">Categoria ID: {{ form.idCategoria }}</div>
      </div>

      <div class="flex justify-between mt-8 max-w-md mx-auto">
        <button @click="currentStep = 2" class="px-6 py-2 font-medium text-gray-500 hover:text-gray-800">Volver</button>
        <button @click="submitProject" :disabled="loading" class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition disabled:opacity-50">
          {{ loading ? 'Subiendo...' : 'Publicar Ahora' }}
        </button>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const currentStep = ref(1)
const loading = ref(false)
const categoriasLocales = ref([])



onMounted(async () => {
  try {
    const res = await api.get('/projects/categories')
    categoriasLocales.value = res.data.items || res.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
})

const form = ref({
  titulo: '',
  descripcion: '',
  idCategoria: '',
  lenguajes: '',
  etiquetas: ''
})

const selectedFile = ref(null)

const handleFileUpload = (e) => {
  if (e.target.files.length > 0) {
    selectedFile.value = e.target.files[0]
  }
}

const submitProject = async () => {
  loading.value = true
  try {
    if (form.value.titulo.trim().length < 3) {
      alert('El título debe tener al menos 3 caracteres.')
      loading.value = false
      return
    }

    if (form.value.descripcion.trim().length < 10) {
      alert('La descripción debe tener al menos 10 caracteres.')
      loading.value = false
      return
    }
    const etiquetas = form.value.etiquetas
      ? form.value.etiquetas.split(',').map(t => t.trim()).filter(Boolean)
      : []
    const lenguajes = form.value.lenguajes
      ? form.value.lenguajes.split(',').map(l => l.trim()).filter(Boolean)
      : []

    if (etiquetas.length === 0) {
      alert('Debes ingresar al menos una etiqueta.')
      loading.value = false
      return
    }

    if (lenguajes.length === 0) {
      alert('Debes ingresar al menos un lenguaje o tecnología en el stack.')
      loading.value = false
      return
    }

    if (!selectedFile.value) {
      alert('Debes adjuntar un archivo PDF o ZIP antes de publicar.')
      loading.value = false
      return
    }

    // 1. Crear el proyecto en DB
    const res = await api.post('/projects', {
      titulo: form.value.titulo,
      descripcion: form.value.descripcion,
      idCategoria: form.value.idCategoria ? parseInt(form.value.idCategoria) : undefined,
      stackTecnologico: { lenguajes },
      etiquetas,
      estado: 'borrador'
    })
    
    const projId = res.data.idProyecto || res.data.id;

    // 2. Subir el archivo si existe
    if (selectedFile.value && projId) {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      await api.post(`/projects/${projId}/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    alert('Proyecto publicado exitosamente!')
    router.push('/dashboard')
  } catch (e) {
    console.error(e)
    const message = e.response?.data?.message
    const details = Array.isArray(message) ? message.join('\n') : message
    alert(details || 'Ocurrió un error al crear el proyecto.')
  } finally {
    loading.value = false
  }
}
</script>
