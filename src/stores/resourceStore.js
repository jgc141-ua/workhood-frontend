import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useResourceStore = defineStore('resources', () => {
  // State
  const resources = ref([])
  const loading = ref(false)
  const error = ref(null)
  const count = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const page = ref(1)
  const pageSize = ref(4)

  // Getters
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))
  const hasNextPage = computed(() => !!next.value)
  const hasPreviousPage = computed(() => !!previous.value)

  const tokenStore = useTokenStore()

  // Helpers
  async function setPage(newPage) {
    if (newPage < 1) return
    await fetchResources({ page: newPage })
  }

  async function setPageSize(newPageSize) {
    pageSize.value = newPageSize
    await fetchResources({ page: 1 })
  }

  // Actions
  async function fetchResources(params = {}) {
    loading.value = true
    error.value = null
    try {
      const currentPage = params.page ?? page.value
      const currentPageSize = params.pageSize ?? pageSize.value

      const query = new URLSearchParams()
      query.set('page', currentPage)
      query.set('page_size', currentPageSize)

      const response = await apiFetch(`${ENDPOINTS.resources}?${query.toString()}`, {}, tokenStore)
      await checkResponse(response, 'Error al cargar recursos')

      const data = await response.json()
      resources.value = data.results || []
      count.value = data.count || 0
      next.value = data.next
      previous.value = data.previous
      page.value = currentPage
      pageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar recursos'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createResource(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.resourceCreate,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al crear el recurso')

      const created = await response.json()
      await fetchResources()
      return created
    } catch (err) {
      error.value = err.message || 'Error al crear el recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateResource(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.resourceUpdate,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al actualizar el recurso')

      const updated = await response.json()
      const index = resources.value.findIndex((r) => r.id === payload.id)
      if (index !== -1) resources.value[index] = { ...resources.value[index], ...updated }

      return updated
    } catch (err) {
      error.value = err.message || 'Error al actualizar el recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteResource(id) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.resourceDelete,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al eliminar el recurso')

      await fetchResources()
      return true
    } catch (err) {
      error.value = err.message || 'Error al eliminar el recurso'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearResources() {
    resources.value = []
    error.value = null
    count.value = 0
    next.value = null
    previous.value = null
    page.value = 1
    pageSize.value = 5
  }

  return {
    resources,
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
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    setPage,
    setPageSize,
    clearResources,
  }
})
