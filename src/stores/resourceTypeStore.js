import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useResourceTypeStore = defineStore('resourceTypes', () => {
  // State
  const allResourceTypes = ref([])
  const resourceTypes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const page = ref(1)
  const pageSize = ref(3)

  // Getters
  const count = computed(() => allResourceTypes.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))

  const tokenStore = useTokenStore()

  // Helpers
  function applyPagination() {
    const start = (page.value - 1) * pageSize.value
    resourceTypes.value = allResourceTypes.value.slice(start, start + pageSize.value)
  }

  function setPage(newPage) {
    if (newPage < 1 || newPage > totalPages.value) return
    page.value = newPage
    applyPagination()
  }

  function setPageSize(newPageSize) {
    pageSize.value = newPageSize
    page.value = 1
    applyPagination()
  }

  // Actions
  async function fetchResourceTypes() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(ENDPOINTS.resourceTypes, {}, tokenStore)
      await checkResponse(response, 'Error al cargar tipos de recurso')

      const data = await response.json()
      allResourceTypes.value = Array.isArray(data) ? data : data.results || []
      page.value = 1
      applyPagination()

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar tipos de recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createResourceType(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.resourceTypeCreate,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al crear el tipo de recurso')

      await fetchResourceTypes()
      return resourceTypes.value
    } catch (err) {
      error.value = err.message || 'Error al crear el tipo de recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateResourceType(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.resourceTypeUpdate,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al actualizar el tipo de recurso')

      await fetchResourceTypes()
      return resourceTypes.value
    } catch (err) {
      error.value = err.message || 'Error al actualizar el tipo de recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteResourceType(name) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.resourceTypeDelete,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al eliminar el tipo de recurso')

      await fetchResourceTypes()
      return true
    } catch (err) {
      error.value = err.message || 'Error al eliminar el tipo de recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearResourceTypes() {
    allResourceTypes.value = []
    resourceTypes.value = []
    error.value = null
    page.value = 1
    pageSize.value = 3
  }

  return {
    allResourceTypes,
    resourceTypes,
    loading,
    error,
    count,
    page,
    pageSize,
    totalPages,
    fetchResourceTypes,
    createResourceType,
    updateResourceType,
    deleteResourceType,
    setPage,
    setPageSize,
    clearResourceTypes,
  }
})
