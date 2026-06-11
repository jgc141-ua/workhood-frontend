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

  async function fetchLogs(params = {}) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()

      const currentPage = params.page ?? page.value
      const currentPageSize = params.pageSize ?? pageSize.value

      query.set('page', currentPage)
      query.set('page_size', currentPageSize)

      if (params.type) query.set('type', params.type)
      if (params.result) query.set('result', params.result)
      if (params.email) query.set('email', params.email)

      const response = await apiFetch(`${ENDPOINTS.accessLogs}?${query.toString()}`, {}, tokenStore)
      await checkResponse(response, 'Error al cargar los registros de acceso')

      const data = await response.json()
      logs.value = data.results || []
      count.value = data.count || 0
      page.value = currentPage
      pageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar los registros de acceso'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyLogs(params = {}) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()

      const currentPage = params.page ?? page.value
      const currentPageSize = params.pageSize ?? pageSize.value

      query.set('page', currentPage)
      query.set('page_size', currentPageSize)

      const response = await apiFetch(
        `${ENDPOINTS.accessMyLogs}?${query.toString()}`,
        {},
        tokenStore,
      )
      await checkResponse(response, 'Error al cargar tus registros de acceso')

      const data = await response.json()
      myLogs.value = data.results || []
      myCount.value = data.count || 0
      page.value = currentPage
      pageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar tus registros de acceso'
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
    fetchLogs,
    fetchMyLogs,
  }
})
