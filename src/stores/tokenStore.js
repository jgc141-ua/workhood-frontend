import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'

export const useTokenStore = defineStore('token', () => {
  const accessToken = ref(
    localStorage.getItem('access') || sessionStorage.getItem('access') || null,
  )
  const refreshToken = ref(
    localStorage.getItem('refresh') || sessionStorage.getItem('refresh') || null,
  )

  const isAuthenticated = computed(() => !!accessToken.value)

  function setTokens(access, refresh, remember = false) {
    accessToken.value = access
    refreshToken.value = refresh
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('access', access)
    storage.setItem('refresh', refresh)
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) return false
    try {
      const res = await fetch(ENDPOINTS.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken.value }),
      })
      const data = await res.json()
      if (!res.ok) return false
      accessToken.value = data.access
      if (localStorage.getItem('refresh')) {
        localStorage.setItem('access', data.access)
      } else {
        sessionStorage.setItem('access', data.access)
      }
      return true
    } catch {
      return false
    }
  }

  function clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    sessionStorage.removeItem('access')
    sessionStorage.removeItem('refresh')
  }

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    setTokens,
    refreshAccessToken,
    clearTokens,
  }
})
