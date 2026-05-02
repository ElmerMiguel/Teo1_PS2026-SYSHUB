<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black opacity-50" @click="close"></div>
    
    <div class="bg-white rounded-xl shadow-lg w-full max-w-lg z-10 p-6 m-4 flex flex-col max-h-[90vh]">
      <div class="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
        <h3 class="text-xl font-bold text-gray-900">Editar Perfil</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
      </div>

      <form @submit.prevent="submitProfile" class="overflow-y-auto pr-2 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input required v-model="form.nombre" type="text" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input required v-model="form.apellido" type="text" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Carnet</label>
          <input required v-model="form.carnet" type="text" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Semestre Actual</label>
          <input required v-model="form.semestre" type="number" min="1" max="15" class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-gray-50">
        </div>

        <div class="pt-4 flex justify-end gap-3 mt-4 border-t border-gray-100">
          <button type="button" @click="close" class="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            Cancelar
          </button>
          <button type="submit" :disabled="loading" class="px-5 py-2 text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50">
            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  isOpen: Boolean,
  userData: Object
})

const emit = defineEmits(['close', 'updated'])
const authStore = useAuthStore()
const loading = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  carnet: '',
  semestre: 1
})

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.userData) {
    form.value.nombre = props.userData.nombre || ''
    form.value.apellido = props.userData.apellido || ''
    form.value.carnet = props.userData.carnet || ''
    form.value.semestre = props.userData.semestre || 1
  }
})

const close = () => {
  emit('close')
}

const submitProfile = async () => {
  loading.value = true
  try {
    const res = await api.patch('/auth/me', {
      nombre: form.value.nombre,
      apellido: form.value.apellido,
      carnet: form.value.carnet,
      semestre: parseInt(form.value.semestre)
    })
    
    // update local authStore too if data returned
    if (res.data && res.data.user) {
      authStore.setAuthDetails(authStore.token, res.data.user)
    }
    
    emit('updated')
    close()
  } catch (error) {
    console.error(error)
    alert('Error al actualizar el perfil')
  } finally {
    loading.value = false
  }
}
</script>
