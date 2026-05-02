import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    roles: (state) => state.user?.roles || [],
    isAdmin: (state) => state.user?.roles?.some(r => r === 'ADMINISTRADOR' || r === 'ADMIN'),
    isModerator: (state) => state.user?.roles?.some(r => r === 'MODERADOR' || r === 'MODERATOR'),
    isAuxiliar: (state) => state.user?.roles?.includes('AUXILIAR'),
    isStudent: (state) => state.user?.roles?.includes('ESTUDIANTE')
  },
  actions: {
    setAuthDetails(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})
