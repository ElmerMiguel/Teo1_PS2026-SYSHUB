import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  // Redirección inicial
  { path: '/', redirect: '/dashboard' },

  // Rutas con Main Layout (Protegidas)
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'foros', name: 'Foros', component: () => import('../views/ForosView.vue') },
      { path: 'crear-repo', name: 'CrearRepo', component: () => import('../views/CrearRepoView.vue') },
      { path: 'perfil', name: 'Perfil', component: () => import('../views/PerfilView.vue') },
      { path: 'blogs', name: 'Blogs', component: () => import('../views/BlogsView.vue') },
      { path: 'guardados', name: 'Guardados', component: () => import('../views/GuardadosView.vue') },
    ]
  },

  // Rutas Auth (Públicas)
  {
    path: '/auth',
    component: () => import('../layouts/AuthLayout.vue'),
    meta: { requiresGuest: true },
    children: [
      { path: 'login', name: 'Login', component: () => import('../views/auth/LoginView.vue') },
      { path: 'register', name: 'Register', component: () => import('../views/auth/RegisterView.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
