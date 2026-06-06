import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useAccessStore = defineStore('accesses', () => {
  // State
  const logs = ref([])
  const myLogs = ref([])
  const count = ref(0)
  const myCount = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const error = ref(null)
  const lastAccess = ref(null)

  const tokenStore = useTokenStore()

  async function checkIn() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.accessCheckIn,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        tokenStore,
      )
      await checkResponse(response, 'Error al registrar la entrada')

      const data = await response.json()
      lastAccess.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error al registrar la entrada'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function checkOut() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.accessCheckOut,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        tokenStore,
      )
      await checkResponse(response, 'Error al registrar la salida')

      const data = await response.json()
      lastAccess.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error al registrar la salida'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    logs,
    myLogs,
    count,
    myCount,
    page,
    pageSize,
    loading,
    error,
    lastAccess,
    checkIn,
    checkOut,
  }
})
