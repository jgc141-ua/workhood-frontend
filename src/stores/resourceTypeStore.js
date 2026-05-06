import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'

export const useResourceTypeStore = defineStore('resourceTypes', () => {
  // State
  const resourceTypes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const count = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const page = ref(1)
  const pageSize = ref(3)

  // Getters
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))
  const hasNextPage = computed(() => !!next.value)
  const hasPreviousPage = computed(() => !!previous.value)

  const tokenStore = useTokenStore()

  const checkResponse = async (response, defaultMsg) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.detail || defaultMsg)
    }
  }

  // Setters
  const setPage = async (newPage) => {
    if (newPage < 1) return
    await fetchResourceTypes({ page: newPage })
  }

  const setPageSize = async (newPageSize) => {
    pageSize.value = newPageSize
    await fetchResourceTypes({ page: 1 })
  }

  // Actions
  const fetchResourceTypes = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const currentPage = params.page ?? page.value
      const currentPageSize = params.pageSize ?? pageSize.value

      const query = new URLSearchParams()
      query.set('page', currentPage)
      query.set('page_size', currentPageSize)

      const response = await apiFetch(`${ENDPOINTS.resourceTypes}?${query.toString()}`, {}, tokenStore)
      await checkResponse(response, 'Error al cargar tipos de recurso')

      const data = await response.json()
      resourceTypes.value = data.results || []
      count.value = data.count || 0
      next.value = data.next
      previous.value = data.previous
      page.value = currentPage
      pageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar tipos de recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createResourceType = async (payload) => {
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

      const created = await response.json()
      await fetchResourceTypes()
      return created
    } catch (err) {
      error.value = err.message || 'Error al crear el tipo de recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateResourceType = async (payload) => {
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

      const updated = await response.json()
      const index = resourceTypes.value.findIndex((rt) => rt.name === payload.name)
      if (index !== -1) resourceTypes.value[index] = { ...resourceTypes.value[index], ...updated }

      return updated
    } catch (err) {
      error.value = err.message || 'Error al actualizar el tipo de recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteResourceType = async (name) => {
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

  const clearResourceTypes = () => {
    resourceTypes.value = []
    error.value = null
    count.value = 0
    next.value = null
    previous.value = null
    page.value = 1
    pageSize.value = 3
  }

  return {
    resourceTypes,
    loading,
    error,
    count,
    next,
    previous,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetchResourceTypes,
    createResourceType,
    updateResourceType,
    deleteResourceType,
    setPage,
    setPageSize,
    clearResourceTypes,
  }
})
