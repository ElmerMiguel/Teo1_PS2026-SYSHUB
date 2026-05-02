<template>
  <div class="max-w-7xl mx-auto pb-12">
    <div class="mb-8 border-b border-gray-200 pb-4">
      <h2 class="text-3xl font-bold text-gray-900 mb-1">Panel de Control / Moderación</h2>
      <p class="text-gray-500">Gestión sistémica de usuarios, foros y registros de auditoría (Módulo D).</p>
    </div>

    <div class="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl overflow-hidden shadow-sm overflow-x-auto">
      <button v-if="isAdmin" @click="currentTab = 'usuarios'" :class="['px-6 py-4 font-semibold whitespace-nowrap focus:outline-none', currentTab === 'usuarios' ? 'text-primary-blue border-b-2 border-primary-blue bg-blue-50/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50']">Usuarios</button>
      <button v-if="isAdmin" @click="currentTab = 'categorias'" :class="['px-6 py-4 font-semibold whitespace-nowrap focus:outline-none', currentTab === 'categorias' ? 'text-primary-blue border-b-2 border-primary-blue bg-blue-50/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50']">Categorías (Pensum)</button>
      <button v-if="isAdmin || isModerator" @click="currentTab = 'moderacion'" :class="['px-6 py-4 font-semibold whitespace-nowrap focus:outline-none', currentTab === 'moderacion' ? 'text-primary-blue border-b-2 border-primary-blue bg-blue-50/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50']">Moderación</button>
      <button v-if="isAdmin" @click="currentTab = 'auditoria'" :class="['px-6 py-4 font-semibold whitespace-nowrap focus:outline-none', currentTab === 'auditoria' ? 'text-primary-blue border-b-2 border-primary-blue bg-blue-50/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50']">Auditoría</button>
    </div>

    <!-- TAB 1: USUARIOS -->
  <div v-if="currentTab === 'usuarios' && isAdmin" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h4 class="font-bold text-gray-700">Listado de Cuentas</h4>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th class="p-4 font-bold">ID</th>
              <th class="p-4 font-bold">Usuario</th>
              <th class="p-4 font-bold">Email</th>
              <th class="p-4 font-bold">Roles</th>
              <th class="p-4 font-bold">Estado</th>
              <th class="p-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.idUsuario" class="border-b border-gray-100 hover:bg-gray-50 transition">
              <td class="p-4 text-sm font-medium text-gray-500">#{{ user.idUsuario }}</td>
              <td class="p-4 text-sm font-bold text-gray-900">{{ user.nombre }} {{ user.apellido }}
                <span class="block text-xs font-normal text-gray-500">Carnet: {{ user.carnet }}</span>
              </td>
              <td class="p-4 text-sm text-gray-600">{{ user.email }}</td>
              <td class="p-4 text-sm">
                <div class="flex flex-wrap gap-2">
                  <span v-for="role in getUserRoles(user)" :key="role" class="bg-blue-50 text-primary-blue text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    {{ role }}
                    <button v-if="authStore.isAdmin && role !== 'ESTUDIANTE'" @click="removeRole(user.idUsuario, role)" class="text-red-500 hover:text-red-700">&times;</button>
                  </span>
                </div>
              </td>
              <td class="p-4 text-sm">
                <span v-if="user.activo" class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Activo</span>
                <span v-else class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">Suspendido</span>
              </td>
              <td class="p-4 text-sm text-right flex justify-end gap-2">
                <button @click="toggleUserActive(user)" class="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded font-medium text-xs">
                  {{ user.activo ? 'Desactivar' : 'Activar' }}
                </button>
                <button @click="suspendUser(user.idUsuario)" class="px-3 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded font-medium text-xs">Suspender</button>
                <button @click="showSuspensions(user)" class="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded font-medium text-xs">Suspensiones</button>
                <button @click="deleteUser(user.idUsuario)" class="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded font-medium text-xs">Borrar</button>
                <div v-if="authStore.isAdmin" class="flex items-center gap-2">
                  <select v-model="roleSelection[user.idUsuario]" class="border border-gray-300 rounded-md p-1 text-xs">
                    <option value="">Asignar rol...</option>
                    <option v-for="role in rolesCatalog" :key="role" :value="role">{{ role }}</option>
                  </select>
                  <button @click="assignRole(user.idUsuario)" class="px-2 py-1 bg-primary-blue text-white rounded text-xs">Asignar</button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="p-8 text-center text-gray-500">Cargando o sin usuarios...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="selectedUser" class="border-t border-gray-200 bg-gray-50 p-6">
        <div class="flex items-center justify-between mb-3">
          <h5 class="font-bold text-gray-800">Suspensiones de {{ selectedUser.nombre }} {{ selectedUser.apellido }}</h5>
          <button @click="selectedUser = null" class="text-gray-500 text-sm">Cerrar</button>
        </div>
        <div v-if="suspensions.length === 0" class="text-sm text-gray-500">No hay suspensiones registradas.</div>
        <div v-else class="space-y-3">
          <div v-for="susp in suspensions" :key="susp.idSuspension" class="bg-white border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-semibold text-gray-800">{{ susp.razon }}</div>
                <div class="text-xs text-gray-500">Desde {{ new Date(susp.fechaInicio).toLocaleString() }}</div>
                <div class="text-xs text-gray-500" v-if="susp.fechaFin">Hasta {{ new Date(susp.fechaFin).toLocaleString() }}</div>
                <div class="text-xs text-gray-500">Estado: {{ susp.activo ? 'Activa' : 'Cerrada' }}</div>
              </div>
              <button v-if="susp.activo" @click="closeSuspension(susp)" class="px-3 py-1 bg-green-100 text-green-800 rounded text-xs">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: MODERACION -->
  <div v-if="currentTab === 'moderacion' && (isAdmin || isModerator)" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h4 class="font-bold text-gray-700">Contenido Denunciado</h4>
      </div>
      <div class="overflow-x-auto" v-if="reports.length > 0">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th class="p-4 font-bold">Reporte</th>
              <th class="p-4 font-bold">Razón</th>
              <th class="p-4 font-bold">Destino</th>
              <th class="p-4 font-bold">Estado</th>
              <th class="p-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.idReporte" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="p-4 text-sm">#{{ report.idReporte }}</td>
              <td class="p-4 text-sm text-gray-700">{{ report.razon }}</td>
              <td class="p-4 text-sm text-gray-600">{{ reportTarget(report) }}</td>
              <td class="p-4 text-sm text-gray-600">{{ report.estado }}</td>
              <td class="p-4 text-sm text-right flex flex-wrap justify-end gap-2">
                <button @click="moderateReport(report.idReporte, 'resuelto')" class="px-3 py-1 bg-green-100 text-green-800 rounded text-xs">Resolver</button>
                <button @click="moderateReport(report.idReporte, 'desestimado')" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs">Desestimar</button>
                <button v-if="report.idHilo" @click="deleteThread(report.idHilo)" class="px-3 py-1 bg-red-100 text-red-800 rounded text-xs">Eliminar hilo</button>
                <button v-if="report.idComentario" @click="deleteComment(report.idComentario)" class="px-3 py-1 bg-red-100 text-red-800 rounded text-xs">Eliminar comentario</button>
                <button v-if="report.idProyecto" @click="deleteProject(report.idProyecto)" class="px-3 py-1 bg-red-100 text-red-800 rounded text-xs">Eliminar proyecto</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-8 text-center text-gray-500" v-else>
        No hay reportes pendientes de revisión. El sistema se encuentra estable.
      </div>
    </div>

    <!-- TAB 3: AUDITORIA -->
  <div v-if="currentTab === 'auditoria' && isAdmin" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <h4 class="font-bold text-gray-700">Log del Sistema</h4>
      </div>
      <div class="p-8 text-center text-gray-500" v-if="audits.length === 0">
        Cargando auditorías...
      </div>
      <div class="overflow-x-auto" v-else>
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <th class="p-3 font-bold">Date</th>
              <th class="p-3 font-bold">Acción</th>
              <th class="p-3 font-bold">Admin ID</th>
              <th class="p-3 font-bold">Entidad Afectada</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in audits" :key="a.idAudit" class="border-b border-gray-100 hover:bg-gray-50 transition">
              <td class="p-3 text-sm text-gray-600">{{ new Date(a.fechaAccion).toLocaleString() }}</td>
              <td class="p-3 text-sm font-bold text-gray-900">{{ a.accion }}</td>
              <td class="p-3 text-sm text-gray-600">ID: {{ a.idAdmin || 'Sistema' }}</td>
              <td class="p-3 text-sm text-gray-600">{{ a.entidad }} #{{ a.entidadId }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 4: CATEGORIAS -->
  <div v-if="currentTab === 'categorias' && isAdmin" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 class="font-bold text-gray-900">Gestión de Categorías de Conocimiento</h3>
      </div>
      <div class="p-6">
        <form @submit.prevent="createCategory" class="mb-8 flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div class="flex-1 w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Categoría <span class="text-red-500">*</span></label>
            <input v-model="formCategory.nombre" required type="text" class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue outline-none bg-white">
          </div>
          <div class="flex-1 w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input v-model="formCategory.descripcion" type="text" class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue outline-none bg-white">
          </div>
          <div class="flex-1 w-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Área Técnica <span class="text-red-500">*</span></label>
            <select v-model="formCategory.areaTecnica" required class="w-full border border-gray-300 rounded-md p-2 focus:ring-primary-blue focus:border-primary-blue outline-none bg-white">
              <option value="">Seleccionar...</option>
              <option v-for="area in areaTecnicaOptions" :key="area" :value="area">{{ area }}</option>
            </select>
            <p v-if="areaTecnicaOptions.length === 0" class="text-xs text-red-500 mt-1">No hay áreas técnicas disponibles.</p>
          </div>
          <div class="w-full md:w-auto mt-4 md:mt-0">
            <button type="submit" class="w-full md:w-auto bg-primary-blue hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-sm transition">
              Añadir 
            </button>
          </div>
        </form>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-full">
            <thead>
              <tr class="bg-white border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                <th class="p-4 font-semibold">ID</th>
                <th class="p-4 font-semibold">Nombre</th>
                <th class="p-4 font-semibold hidden md:table-cell">Descripción</th>
                <th class="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="cat in categoriasLocales" :key="cat.idCategoria" class="hover:bg-gray-50 transition">
                <td class="p-4 text-sm text-gray-900 font-bold whitespace-nowrap">#{{ cat.idCategoria }}</td>
                <td class="p-4 text-sm text-gray-900 font-medium">{{ cat.nombre }}</td>
                <td class="p-4 text-sm text-gray-600 hidden md:table-cell truncate max-w-[200px]">{{ cat.descripcion }}</td>
                <td class="p-4 text-right">
                  <button @click="deleteCategory(cat.idCategoria)" class="text-red-500 hover:bg-red-50 p-2 rounded-md transition" title="Eliminar Categoría">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="categoriasLocales.length === 0">
                <td colspan="4" class="p-8 text-center text-gray-500">No hay categorías. Crea la primera.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const currentTab = ref('usuarios')

const users = ref([])
const reports = ref([])
const audits = ref([])
const categoriasLocales = ref([])
const rolesCatalog = ref([])
const roleSelection = ref({})
const selectedUser = ref(null)
const suspensions = ref([])
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
const isModerator = computed(() => authStore.isModerator)

const formCategory = ref({
  nombre: '',
  descripcion: '',
  areaTecnica: ''
})

const areaTecnicaOptions = ref([])

const loadData = async () => {
  try {
    if (currentTab.value === 'usuarios') {
      if (!isAdmin.value) return
      const res = await api.get('/admin/users')
      users.value = res.data.items || res.data || []
      await fetchRoles()
    } else if (currentTab.value === 'moderacion') {
      if (!isAdmin.value && !isModerator.value) return
      const res = await api.get('/admin/moderation/reports')
      reports.value = res.data.items || res.data || []
    } else if (currentTab.value === 'auditoria') {
      if (!isAdmin.value) return
      const res = await api.get('/admin/audit')
      audits.value = res.data.items || res.data || []
    } else if (currentTab.value === 'categorias') {
      if (!isAdmin.value) return
      const res = await api.get('/admin/categories')
      categoriasLocales.value = res.data.items || res.data || []
      await fetchAreaTecnicas()
    }
  } catch (error) {
    console.error('Error cargando Tab Admin', error)
  }
}

watch(currentTab, () => {
  loadData()
})

onMounted(() => {
  if (isAdmin.value) {
    currentTab.value = 'usuarios'
  } else if (isModerator.value) {
    currentTab.value = 'moderacion'
  }
  loadData()
})

const suspendUser = async (idUsuario) => {
  const razon = prompt('Razón de la suspensión:')
  if (!razon) return
  try {
    await api.post(`/admin/users/${idUsuario}/suspensions`, { razon, detalle: 'Bloqueado por moderador' })
    alert('Usuario suspendido')
    loadData()
  } catch(e) {
    alert('No se pudo suspender. Es posible que el API requiera una estructura específica')
  }
}

const deleteUser = async (idUsuario) => {
  if(!confirm('Borrar usuario? Esta acción elimina en cascada sus comentarios y proyectos.')) return
  try {
    await api.delete(`/admin/users/${idUsuario}`)
    loadData()
  } catch(e) {
    alert('Error borrando usuario')
  }
}

const toggleUserActive = async (user) => {
  try {
    await api.patch(`/admin/users/${user.idUsuario}/active`, { activo: !user.activo })
    loadData()
  } catch (e) {
    alert('No se pudo actualizar el estado del usuario')
  }
}

const fetchRoles = async () => {
  if (!authStore.isAdmin) return
  try {
    const res = await api.get('/admin/roles')
    rolesCatalog.value = (res.data.items || res.data || []).map((role) => role.nombreRol || role)
  } catch (e) {
    rolesCatalog.value = []
  }
}

const fetchAreaTecnicas = async () => {
  if (!isAdmin.value) return
  try {
    const res = await api.get('/admin/categories/areas')
    areaTecnicaOptions.value = res.data.items || res.data || []
  } catch (e) {
    areaTecnicaOptions.value = []
  }
}

const getUserRoles = (user) => {
  if (!user.roles) return []
  return user.roles.map((role) => role.nombreRol || role)
}

const assignRole = async (idUsuario) => {
  if (!isAdmin.value) return
  const role = roleSelection.value[idUsuario]
  if (!role) return
  try {
    await api.post(`/admin/users/${idUsuario}/roles`, { nombreRol: role })
    roleSelection.value[idUsuario] = ''
    loadData()
  } catch (e) {
    alert('No se pudo asignar el rol')
  }
}

const removeRole = async (idUsuario, role) => {
  if (!isAdmin.value) return
  if (!confirm(`¿Quitar rol ${role}?`)) return
  try {
    await api.delete(`/admin/users/${idUsuario}/roles/${role}`)
    loadData()
  } catch (e) {
    alert('No se pudo quitar el rol')
  }
}

const showSuspensions = async (user) => {
  selectedUser.value = user
  try {
    const res = await api.get(`/admin/users/${user.idUsuario}/suspensions`)
    suspensions.value = res.data.items || res.data || []
  } catch (e) {
    suspensions.value = []
  }
}

const closeSuspension = async (suspension) => {
  const notaCierre = prompt('Nota de cierre (opcional):')
  try {
    await api.patch(`/admin/users/${selectedUser.value.idUsuario}/suspensions/${suspension.idSuspension}/close`, { notaCierre: notaCierre || undefined })
    showSuspensions(selectedUser.value)
    loadData()
  } catch (e) {
    alert('No se pudo cerrar la suspensión')
  }
}

const createCategory = async () => {
  try {
    const res = await api.post('/admin/categories', {
      nombre: formCategory.value.nombre,
      descripcion: formCategory.value.descripcion || '',
      areaTecnica: formCategory.value.areaTecnica
    })
    categoriasLocales.value.push(res.data)
    formCategory.value.nombre = ''
    formCategory.value.descripcion = ''
    formCategory.value.areaTecnica = ''
  } catch (e) {
    alert('Error al crear categoría')
  }
}

const deleteCategory = async (id) => {
  if(!confirm('¿Estás seguro de eliminar esta categoría y posiblemente los hilos asociados?')) return
  try {
    await api.delete(`/admin/categories/${id}`)
    categoriasLocales.value = categoriasLocales.value.filter(c => c.idCategoria !== id)
  } catch (e) {
    alert('Error al eliminar categoría')
  }
}

const moderateReport = async (idReporte, estado) => {
  try {
    await api.patch(`/admin/moderation/reports/${idReporte}/status`, { estado })
    loadData()
  } catch (e) {
    alert('No se pudo moderar el reporte')
  }
}

const deleteThread = async (idHilo) => {
  if (!confirm('¿Eliminar hilo reportado?')) return
  try {
    await api.delete(`/admin/moderation/threads/${idHilo}`)
    loadData()
  } catch (e) {
    alert('No se pudo eliminar el hilo')
  }
}

const deleteComment = async (idComentario) => {
  if (!confirm('¿Eliminar comentario reportado?')) return
  try {
    await api.delete(`/admin/moderation/comments/${idComentario}`)
    loadData()
  } catch (e) {
    alert('No se pudo eliminar el comentario')
  }
}

const deleteProject = async (idProyecto) => {
  if (!confirm('¿Eliminar proyecto reportado?')) return
  try {
    await api.delete(`/admin/moderation/projects/${idProyecto}`)
    loadData()
  } catch (e) {
    alert('No se pudo eliminar el proyecto')
  }
}

const reportTarget = (report) => {
  if (report.idHilo) return `Hilo #${report.idHilo}`
  if (report.idComentario) return `Comentario #${report.idComentario}`
  if (report.idProyecto) return `Proyecto #${report.idProyecto}`
  return 'Desconocido'
}
</script>
