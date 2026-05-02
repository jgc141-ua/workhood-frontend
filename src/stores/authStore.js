import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { useMeStore } from './meStore'

export const useAuthStore = defineStore('auth', () => {
  const loading = ref(false)
  const errors = ref(null)
  const success = ref(false)

  const tokenStore = useTokenStore()
  const meStore = useMeStore()

  const isAuthenticated = computed(() => tokenStore.isAuthenticated)

  async function register(form) {
    loading.value = true
    errors.value = null
    success.value = false

    try {
      const res = await fetch(ENDPOINTS.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        errors.value = data
        return false
      }
      success.value = true
      return true
    } catch {
      errors.value = { register: 'Error de red. Por favor, inténtalo de nuevo más tarde.' }
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(email, password, remember = false) {
    loading.value = true
    errors.value = null

    try {
      const res = await fetch(ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        errors.value = data
        return false
      }

      tokenStore.setTokens(data.access, data.refresh, remember)
      await meStore.fetchMe()
      return true
    } catch {
      errors.value = { login: 'Error de red. Por favor, inténtalo de nuevo más tarde.' }
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    meStore.clearUser()
    tokenStore.clearTokens()
  }

  return {
    loading,
    errors,
    success,
    isAuthenticated,
    register,
    login,
    logout,
  }
})
