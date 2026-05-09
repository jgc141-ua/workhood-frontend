import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'

export const useMeStore = defineStore('me', () => {
  // State
  const user = ref(
    JSON.parse(localStorage.getItem('profile') || sessionStorage.getItem('profile') || null),
  )

  const tokenStore = useTokenStore()

  // Obtener todos los datos del usuario
  async function fetchMe() {
    const res = await apiFetch(ENDPOINTS.me, {}, tokenStore)
    const data = await res.json()
    const roleName = data.role?.name || data.role || ''
    data.role = roleName
    user.value = data

    const profile = { first_name: data.first_name, role: roleName }

    // Guardar en el mismo storage donde estan los tokens
    if (localStorage.getItem('refresh')) {
      localStorage.setItem('profile', JSON.stringify(profile))
    } else {
      sessionStorage.setItem('profile', JSON.stringify(profile))
    }
  }

  // Actualizar el perfil
  async function updateProfile(payload) {
    const res = await apiFetch(
      ENDPOINTS.meUpdate,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      tokenStore,
    )

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.detail || 'Error al actualizar el perfil.')
    }

    await fetchMe()
  }

  // Limpiar datos del usuario
  function clearUser() {
    user.value = null
    localStorage.removeItem('profile')
    sessionStorage.removeItem('profile')
  }

  return { user, fetchMe, updateProfile, clearUser }
})
