<template>
  <div class="max-w-5xl mx-auto pb-10">
    <div class="mb-6">
      <router-link to="/proyectos" class="text-sm text-primary-blue hover:underline">&larr; Volver al listado</router-link>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-10">Cargando proyecto...</div>

    <div v-else-if="project" class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">{{ project.titulo }}</h2>
          <p class="text-gray-500 text-sm mt-2">Categoría: {{ project.categoria?.nombre || 'Sin categoría' }}</p>
        </div>
        <div class="text-sm text-gray-600">
          <span class="font-semibold">Estado:</span> {{ project.estado }} · <span class="font-semibold">Vistas:</span> {{ project.vistas || 0 }}
        </div>
      </div>

      <p class="text-gray-700 mb-6 whitespace-pre-line">{{ project.descripcion }}</p>

      <div class="mb-6">
        <h4 class="text-sm font-bold text-gray-700 mb-2">Stack tecnológico</h4>
        <div class="flex flex-wrap gap-2">
          <span v-for="item in stackList" :key="item" class="text-xs font-semibold text-primary-blue bg-blue-50 px-2 py-1 rounded">
            {{ item }}
          </span>
          <span v-if="stackList.length === 0" class="text-xs text-gray-500">No definido</span>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-sm font-bold text-gray-700 mb-2">Etiquetas</h4>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in project.etiquetas" :key="tag.idEtiqueta" class="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
            {{ tag.nombre }}
          </span>
        </div>
      </div>

      <div class="mb-8">
        <h4 class="text-sm font-bold text-gray-700 mb-2">Archivos adjuntos</h4>
        <div v-if="project.archivos?.length" class="space-y-2">
          <div v-for="file in project.archivos" :key="file.idArchivo" class="flex items-center justify-between border border-gray-200 rounded-lg p-3">
            <div>
              <div class="text-sm font-semibold text-gray-800">{{ file.nombreArchivo }}</div>
              <div class="text-xs text-gray-500">{{ file.tipoMime || 'Archivo' }}</div>
            </div>
            <button @click="downloadFile(file)" class="text-primary-blue text-sm font-medium hover:underline">Descargar</button>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500">No hay archivos adjuntos.</div>
      </div>

      <div v-if="showCuration" class="border-t border-gray-200 pt-6 mt-6">
        <h4 class="text-lg font-bold text-gray-900 mb-3">Curaduría</h4>
        <p class="text-sm text-gray-600 mb-3">Marca este proyecto como destacado para futuras cohortes.</p>
        <div class="space-y-3">
          <textarea v-model="curationForm.comentarioAuxiliar" rows="3" class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue outline-none" placeholder="Comentario del auxiliar"></textarea>
          <label class="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" v-model="curationForm.activo" />
            Destacar proyecto
          </label>
          <button @click="submitCuration" class="bg-primary-blue text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            Guardar curaduría
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-10">Proyecto no encontrado.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)
const project = ref(null)

const curationForm = ref({
  comentarioAuxiliar: '',
  activo: true
})

const showCuration = computed(() => authStore.isAuxiliar || authStore.isAdmin)

const stackList = computed(() => {
  const stack = project.value?.stackTecnologico
  if (!stack) return []
  if (Array.isArray(stack)) return stack
  if (typeof stack === 'object') {
    return Object.values(stack).flat().map(item => String(item))
  }
  return []
})

const fetchProject = async () => {
  loading.value = true
  try {
    const res = await api.get(`/projects/${route.params.id}`)
    project.value = res.data
    if (project.value?.curaduria) {
      curationForm.value.comentarioAuxiliar = project.value.curaduria.comentarioAuxiliar || ''
      curationForm.value.activo = project.value.curaduria.activo ?? true
    }
  } catch (error) {
    console.error('Error cargando proyecto', error)
    project.value = null
  } finally {
    loading.value = false
  }
}

const registerView = async () => {
  if (!project.value || project.value.estado !== 'publicado') return
  try {
    await api.post(`/projects/${project.value.idProyecto}/views`)
  } catch (error) {
    // Ignorar si ya se registró la vista
  }
}

const downloadFile = async (file) => {
  try {
    const res = await api.get(`/projects/${project.value.idProyecto}/files/${file.idArchivo}/download`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', file.nombreArchivo)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    alert('No se pudo descargar el archivo.')
  }
}

const submitCuration = async () => {
  if (!project.value) return
  try {
    await api.post(`/projects/${project.value.idProyecto}/curate`, {
      comentarioAuxiliar: curationForm.value.comentarioAuxiliar,
      activo: curationForm.value.activo
    })
    await fetchProject()
    alert('Curaduría actualizada correctamente.')
  } catch (error) {
    alert('No se pudo actualizar la curaduría.')
  }
}

onMounted(async () => {
  await fetchProject()
  await registerView()
})
</script>
